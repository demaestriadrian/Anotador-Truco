# Plan: Core de marcador en arquitectura hexagonal (Truco)

## Contexto

La app es hoy un **anotador de Truco** en SolidJS centrado en lo visual: se arrastran fósforos
(GSAP Draggable + Flip) para sumar/restar puntos. El estado real vive en
`src/ui/store/gameStore.ts`, donde el puntaje (`scoreA`/`scoreB`)
está **mezclado con la presentación** (arrays de fósforos, tamaños, rotaciones). Existe una capa
`src/core/` (Match, Team, `GameService`, `IGameView`) de un intento hexagonal anterior, pero
**no la usa nadie** (cero imports desde `src/ui`).

El objetivo es **ordenar el core** para que sea la autoridad del marcador y sus reglas, dejándolo
**desacoplado del framework** y de la presentación, de modo que:
1. La UI **responda al core** (no al revés).
2. A futuro se puedan **sincronizar 2 instancias desde un backend** sin reescribir el dominio.

### Decisiones acordadas con el usuario
- **Alcance:** núcleo de **marcador** — Partida, Equipos, sumar/restar puntos, **buenas/malas**,
  límite y ganador. (No incluye cantos Envido/Truco/Flor ni lógica de cartas todavía.)
- **El core manda:** arrastrar un fósforo **despacha un comando** al core; la UI refleja el estado
  que emite el core.
- **Límite configurable 15/30.**

## Arquitectura objetivo

```
UI (SolidJS)  --comando-->  GameEngine (aplicación)  -->  Match/Team (dominio puro)
   ^                              |
   |------ snapshot (subscribe) --
```

- **Dominio puro** (`src/core/domain`): entidades sin dependencias de framework ni de side-effects.
- **Aplicación** (`src/core/application`): un `GameEngine` con API **comando-in / snapshot-out /
  subscribe**. Comandos y snapshots son **objetos planos serializables** → mismos contratos servirán
  para el backend (despachar comando local hoy = enviar comando por WebSocket mañana; el snapshot que
  hoy refleja la UI mañana lo emite el servidor a ambas instancias).
- **Puerto** (`src/core/ports`): tipos `Command`, `GameSnapshot`, `Phase`, listener. Reemplaza al
  `IGameView` push-based actual.
- **Adaptador** (`src/infrastructure/adapters`): puente que conecta el `GameEngine` a un store de
  SolidJS vía `reconcile`, y expone acciones (`sumarPunto`, etc.).
- **Presentación** (`src/ui`): los fósforos siguen siendo una capa visual propia; su **conteo lo
  dirige el puntaje del core**.

## Modelo de dominio

**`src/core/domain/constants.ts`** (nuevo)
- `UMBRAL_BUENAS = 15` → en el tablero real, malas = primeros 15, buenas = del 15 en adelante,
  **independiente del límite** (jugar "a 15" = solo malas; "a 30" = malas + buenas).
- `LIMITES_VALIDOS = [15, 30] as const`.

**`src/core/domain/entities/Team.ts`** (refinar el existente)
- `id: TeamId`, `name`, `score`. Métodos puros: `addPoints(n)`, `removePoints(n)` (clamp a 0,
  reusar la validación que ya tiene), `setName`, `reset`.
- Getter derivado `phase: 'malas' | 'buenas'` = `score < UMBRAL_BUENAS ? 'malas' : 'buenas'`.

**`src/core/domain/entities/Match.ts`** (refinar el existente)
- `limit: 15 | 30` configurable (default 30). Equipos `team_a` / `team_b`.
- `addPoints(teamId, n)`, `removePoints(teamId, n)`, `setTeamName(teamId, name)`,
  `setLimit(limit)`, `reset()`.
- `getWinner(): TeamId | null` (`score >= limit`, ya casi implementado) y `isFinished()`.

## Motor de aplicación

**`src/core/application/GameEngine.ts`** (reemplaza a `GameService.ts`)

```ts
type TeamId = 'team_a' | 'team_b'
type Phase  = 'malas' | 'buenas'

type Command =
  | { type: 'ADD_POINTS';    teamId: TeamId; amount: number }
  | { type: 'REMOVE_POINTS'; teamId: TeamId; amount: number }
  | { type: 'SET_TEAM_NAME'; teamId: TeamId; name: string }
  | { type: 'SET_LIMIT';     limit: 15 | 30 }
  | { type: 'RESET' }

interface TeamSnapshot { id: TeamId; name: string; score: number; phase: Phase }
interface GameSnapshot {
  teams: Record<TeamId, TeamSnapshot>
  limit: 15 | 30
  winner: TeamId | null
  finished: boolean
}

class GameEngine {
  dispatch(cmd: Command): GameSnapshot   // aplica al Match, recalcula y notifica
  getState(): GameSnapshot               // snapshot inmutable actual
  subscribe(fn: (s: GameSnapshot) => void): () => void
}
```

- `dispatch` traduce el comando a llamadas del `Match`, arma el `GameSnapshot` y notifica a los
  suscriptores. Sin dependencias de SolidJS ni del DOM → unitariamente testeable.
- Tipos de `Command`/`GameSnapshot` viven en **`src/core/ports/types.ts`** (el puerto del core).

## Puente SolidJS (adaptador)

**`src/infrastructure/adapters/solidGameController.ts`** (nuevo)

```ts
const engine = new GameEngine()
const [estado, setEstado] = createStore<GameSnapshot>(engine.getState())
engine.subscribe(s => setEstado(reconcile(s)))   // la UI reacciona granularmente

export const gameState = estado                   // dominio reactivo (solo lectura)
export const sumarPunto   = (id: TeamId) => engine.dispatch({ type: 'ADD_POINTS', teamId: id, amount: 1 })
export const restarPunto  = (id: TeamId) => engine.dispatch({ type: 'REMOVE_POINTS', teamId: id, amount: 1 })
export const cambiarNombre = (id: TeamId, name: string) => engine.dispatch({ type: 'SET_TEAM_NAME', teamId: id, name })
export const cambiarLimite = (limit: 15 | 30) => engine.dispatch({ type: 'SET_LIMIT', limit })
export const reiniciar     = () => engine.dispatch({ type: 'RESET' })
```

Esto es lo que hace que **"la UI responda al core"**: el único origen de verdad del marcador es el
engine; el store de Solid es un espejo reactivo.

## Cambios en la UI (separar dominio de presentación)

1. **Renombrar** `src/ui/store/gameStore.ts` → `presentationStore.ts`
   y **quitarle el puntaje**: queda solo presentación (`storageMatches`, `matchesA`, `matchesB`,
   `matchstickSize` y `moveMatchstick` moviendo únicamente arrays de fósforos, sin tocar score).
2. **`createMatchstickLogic.ts`**: al completar un drop válido en un equipo, además de mover el
   fósforo visual, **despachar `sumarPunto('team_a'|'team_b')`**; al devolver al storage,
   **`restarPunto(...)`**. Helper de mapeo `'A' → 'team_a'`, `'B' → 'team_b'`.
   - **Corregir de paso** el bug conocido: `reparentToStorage` busca `#matchstick-storage`
     (`createMatchstickLogic.ts:58`) pero el contenedor real es `class="matchstickStorage"` sin ese
     `id` (`MatchStickStorage.tsx`). Sin esto, devolver fósforos (y por ende `restarPunto`) no se
     dispara. Solución sugerida: agregar `id="matchstick-storage"` al contenedor del depósito.
3. **`ScoreKeeper.tsx` / `TeamName.tsx`**: leer puntaje y nombres desde `gameState` del controller
   (`gameState.teams.team_a.score`, `.name`, `.phase`); `TeamName.onNameChange → cambiarNombre`.
   El `MAX_SCORE` hardcodeado pasa a `gameState.limit`.
4. **`src/core/domain/ports/interfaces.ts`** (`IGameView`) se elimina; lo reemplazan los tipos de
   `ports/types.ts`.

## Archivos

**Nuevos**
- `src/core/domain/constants.ts`
- `src/core/application/GameEngine.ts`
- `src/core/ports/types.ts`
- `src/infrastructure/adapters/solidGameController.ts`

**Modificados**
- `src/core/domain/entities/Match.ts`, `Team.ts` (refinar: límite, buenas/malas, remove)
- `src/ui/store/gameStore.ts` → `presentationStore.ts` (quitar score)
- `src/ui/hooks/createMatchstickLogic.ts` (despachar comandos + fix `#matchstick-storage`)
- `src/ui/components/ScoreKeeper.tsx`, `TeamName.tsx` (leer del controller)
- `src/ui/components/MatchStick.tsx`, `MatchStickStorage.tsx`, `PointSection.tsx` (ajustar imports
  al store renombrado)

**Eliminados**
- `src/core/application/services/GameService.ts`
- `src/core/domain/ports/interfaces.ts` (`IGameView`)

## Pasos de implementación (orden)

1. Dominio: `constants.ts`, refinar `Team` y `Match` (límite 15/30, buenas/malas, remove, winner).
2. Puerto: `ports/types.ts` con `Command` / `GameSnapshot` / `Phase` / listener.
3. Aplicación: `GameEngine` (dispatch/getState/subscribe); borrar `GameService` e `IGameView`.
4. Adaptador SolidJS: `solidGameController.ts` (engine + store + `reconcile` + acciones).
5. UI: renombrar store a presentación (quitar score); conectar `ScoreKeeper`/`TeamName` al controller.
6. Drag: despachar `sumarPunto`/`restarPunto` y corregir el `id` del storage.

## Ejecución con múltiples agentes

### Realidad de la paralelización (leer primero)
Es un refactor corto y **fuertemente acoplado**: dominio → puerto → aplicación → adaptador → UI.
El grafo es casi una tubería, así que el paralelismo real es **acotado**:
- Solo la **Fase 0** admite 2 agentes en paralelo (escriben archivos distintos).
- Fases 1–3 son **secuenciales** (cada capa depende de la anterior).
- La **Fase 3 (UI) NO se paraleliza** entre varios agentes en la misma copia de trabajo: todos los
  componentes importan el mismo store/adaptador → conflictos de merge. Un solo agente.

### Grafo de dependencias
```
Fase 0 (PARALELO):   [A1 Dominio]      [A2 Puerto]
                            \              /
Fase 1 (1 agente):         [ B  GameEngine ]
                                  |
Fase 2 (1 agente):         [ C  Adaptador SolidJS ]
                                  |
Fase 3 (1 agente):         [ D  UI: store + drag + componentes ]
                                  |
Fase 4 (1 agente):         [ E  Verificación ]
```

### Protocolo común (todos los agentes)
- Responder en español; **comentarios de código en español** (regla del proyecto — ver `CLAUDE.md`).
- Antes de tocar nada: leer `plan.md` completo (es la fuente de verdad del diseño).
- No editar archivos fuera del scope de la fase asignada.
- Gestor de paquetes: **pnpm**. No correr `pnpm dev` (bloquea); para chequear usar `pnpm build`.

### Briefs por agente (cold start — cada uno arranca sin el chat original)

**A1 — Dominio** _(paralelo con A2)_
- Lee `plan.md` → "Modelo de dominio".
- Crea `src/core/domain/constants.ts` (`UMBRAL_BUENAS=15`, `LIMITES_VALIDOS=[15,30] as const`).
- Refina `src/core/domain/entities/Team.ts`: `addPoints`, `removePoints` (clamp a 0), `setName`,
  `reset`, getter `phase` (`score < UMBRAL_BUENAS ? 'malas' : 'buenas'`).
- Refina `src/core/domain/entities/Match.ts`: `limit: 15|30`, `add/removePoints`, `setTeamName`,
  `setLimit`, `reset`, `getWinner` (`>= limit`), `isFinished`.
- Cero imports de SolidJS/DOM. Aceptación: el módulo compila aislado.

**A2 — Puerto** _(paralelo con A1)_
- Lee `plan.md` → "Motor de aplicación" (sección de tipos).
- Crea `src/core/ports/types.ts`: `TeamId`, `Phase`, `Command` (union), `TeamSnapshot`,
  `GameSnapshot`, `type GameStateListener = (s: GameSnapshot) => void`.
- Solo tipos (sin runtime). No depende de A1.

**B — GameEngine** _(tras Fase 0)_
- Lee `plan.md` → "Motor de aplicación".
- Crea `src/core/application/GameEngine.ts` con `dispatch`/`getState`/`subscribe`, usando `Match`
  (A1) y los tipos (A2).
- Elimina `src/core/application/services/GameService.ts` y `src/core/domain/ports/interfaces.ts`.
- Aceptación: `new GameEngine().dispatch({type:'ADD_POINTS',teamId:'team_a',amount:1})` deja
  `teams.team_a.score === 1`.

**C — Adaptador SolidJS** _(tras B)_
- Lee `plan.md` → "Puente SolidJS (adaptador)".
- Crea `src/infrastructure/adapters/solidGameController.ts`: instancia el engine, `createStore`
  inicializado con `engine.getState()`, `engine.subscribe(s => setStore(reconcile(s)))`, y exporta
  `gameState` + acciones (`sumarPunto`, `restarPunto`, `cambiarNombre`, `cambiarLimite`, `reiniciar`).

**D — UI** _(tras C; UN solo agente)_
- Lee `plan.md` → "Cambios en la UI".
- Renombra `src/ui/store/gameStore.ts` → `presentationStore.ts`, quita el puntaje (solo
  presentación) y actualiza imports en `MatchStick.tsx`, `MatchStickStorage.tsx`, `PointSection.tsx`.
- `createMatchstickLogic.ts`: al drop válido despacha `sumarPunto(map(team))`; al volver al storage
  `restarPunto(...)`; **fix** del `#matchstick-storage` (usar el contenedor real del depósito).
- `ScoreKeeper.tsx`/`TeamName.tsx`: leer `gameState.teams.*` y `gameState.limit`;
  `onNameChange → cambiarNombre`. Mapeo `'A'→'team_a'`, `'B'→'team_b'`.

**E — Verificación** _(tras D)_
- Ejecuta la sección "Verificación" de abajo.

### Cómo lanzarlas desde Claude Code CLI
- **Fase 0 en paralelo**: "leé `plan.md` y ejecutá A1 y A2 en paralelo" → 2 subagentes en un mismo
  mensaje (escriben archivos distintos, sin conflicto en la misma copia).
- **Fases B→E secuenciales**: "ejecutá la Fase B", luego C, D, E (cada una tras la anterior).
- Cada agente recibe solo su brief + "leé `plan.md`"; no necesita el historial del chat.

## Verificación

- `pnpm build` (corre `tsc` estricto: sin unused, sin tipos rotos) debe pasar.
- `pnpm dev` (http://localhost:5500) y probar a mano:
  - Arrastrar fósforo a Nosotros/Ellos → el número de puntaje (que ahora viene del core) sube.
  - Devolver fósforo al storage → baja (valida el fix del `id`).
  - Editar nombre de equipo → se refleja vía core.
  - Llegar al límite → `gameState.teams.<id>` queda como `winner` / `finished` (loguear o mostrar).
- (Opcional, recomendado a futuro) Como el `GameEngine` es puro, agregar Vitest para tests de
  dominio: sumar/restar con clamp, transición malas→buenas en 15, ganador en 15 y 30.

## Fuera de alcance (futuro)

- Derivar **completamente** los fósforos del puntaje del core (que el core reconstruya cuántos
  fósforos mostrar). Esta etapa mantiene los fósforos como presentación cuyo conteo acompaña al core.
- Cantos: Envido / Real Envido / Falta Envido / Truco / Retruco / Vale Cuatro / Flor.
- Backend: transporte WebSocket + engine compartido (los `Command`/`GameSnapshot` ya quedan listos).
- UI de ganador, selector de límite 15/30, persistencia en `localStorage`.
