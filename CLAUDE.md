# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio. Rama de trabajo: **`SolidJS-Claude`**.

## 🎴 Qué es el proyecto

**Anotador de Truco**: un anotador interactivo para el Truco Argentino que replica la
experiencia táctil de los fósforos. El usuario **arrastra y suelta fósforos** (drag & drop)
desde un depósito hacia la zona de cada equipo para sumar puntos, y los devuelve para restar.
Es una SPA puramente cliente (sin backend por ahora).

## 🌐 Idioma (regla obligatoria)

- **Responder siempre en español** (chat, tareas y planes).
- **Los comentarios del código deben estar siempre en español.**

> Estas reglas provienen de la configuración previa del proyecto (`.agent/rules/`), ahora
> consolidadas acá tras unificar el trabajo en Claude.

## 🚀 Stack tecnológico

| Área | Tecnología |
| :--- | :--- |
| Framework UI | **SolidJS 1.9** (JSX reactivo, `createStore`, `createSignal`, `createEffect`) |
| Lenguaje | **TypeScript 5** (modo `strict`, sin emit — `noEmit`) |
| Bundler / dev server | **Vite 7** (`vite-plugin-solid`, `vite-tsconfig-paths`) |
| Animaciones | **GSAP 3.15** — plugin `Draggable` (arrastre) + tweens `gsap.to/set` con `overwrite:true` (posicionamiento puro, sin Flip) |
| Utilidades matemáticas | **D3 7** (`randomBates`, `randomLogNormal` para dispersión aleatoria de fósforos) |
| Gestor de paquetes | **pnpm** (existe `pnpm-lock.yaml`) |

> Pensado para un futuro despliegue en **Cloudflare** (Workers/Pages) y un backend con **Hono**
> (runtime-agnóstico: corre en Cloudflare Workers, Node, Deno o Bun). Por eso el gestor es pnpm.

## 🛠️ Comandos

```bash
pnpm install         # Instalar dependencias
pnpm dev             # Servidor de desarrollo (Vite, http://localhost:5500)
pnpm dev-h           # Igual que dev pero expuesto en la red (--host)
pnpm build           # Type-check (tsc) + build de producción (vite build) -> dist/
pnpm preview         # Previsualizar el build de producción
```

No hay suite de tests ni linter activo en el flujo actual (existe `.eslintrc.json` heredado,
pero `package.json` no expone script de lint). Verificar cambios con `pnpm build` (corre `tsc`)
y probando manualmente en `pnpm dev`.

## 📂 Arquitectura y estructura

Arquitectura **hexagonal**: el `core` (dominio + aplicación) es la autoridad del marcador y la UI
**reacciona a él**. Punto de entrada: `index.html` → `src/main.tsx` → renderiza `<App />` en `#root`.

```
src/
├── main.tsx                       # Bootstrap: render(<App/>, #root)
├── core/                          # ⭐ Núcleo agnóstico al framework (sin SolidJS ni DOM)
│   ├── domain/                    # Dominio puro
│   │   ├── constants.ts           # Tipos base TeamId/Phase/Limit + UMBRAL_BUENAS, LIMITES_VALIDOS
│   │   └── entities/
│   │       ├── Match.ts           # Partida: equipos, límite 15/30, buenas/malas, ganador
│   │       └── Team.ts            # Equipo: nombre, score, phase
│   ├── ports/types.ts             # Contratos serializables: Command (+FINALIZE_MATCH), GameSnapshot, TeamSnapshot + GameEvent (zona + ciclo de vida)/ResetReason
│   └── application/
│       ├── GameEngine.ts          # Motor: dispatch / getState / subscribe + subscribeEvents (emite eventos de dominio)
│       └── eventRules.ts          # Reglas (estrategias, OCP) prev→next(+cmd): ZONE_RESET/FILL + MATCH_VICTORY/UNDONE/FINALIZED
├── infrastructure/
│   └── adapters/solidGameController.ts  # Puente core↔SolidJS (reconcile) + acciones + onGameEvent (canal de eventos)
└── ui/                            # Presentación (SolidJS)
    ├── components/
    │   ├── App.tsx                # Raíz; monta ScoreKeeper + VictoryModal + #referenceDrag
    │   ├── ScoreKeeper.tsx        # Layout; lee gameState; monta gestos + puentes de reset y de ciclo de vida
    │   ├── VictoryModal.tsx       # Modal de fin de partida: anuncio de ganador + confeti + 2 botones (doble validación)
    │   ├── PointSection.tsx       # Zona de un equipo: 3 grupos × 5 slots; mide tamaño de slot
    │   ├── MatchStick.tsx         # Un fósforo (imagen) + drag + animación
    │   ├── MatchStickStorage.tsx  # Depósito (expone id="matchstick-storage")
    │   ├── TeamName.tsx           # Input de nombre → cambiarNombre()
    │   └── Separator.tsx          # Separadores visuales (línea / cinta)
    ├── hooks/
    │   ├── createMatchstickLogic.ts        # Drag & drop: hitTest, commitDrop (boundary-aware), arrastre asistido, posicionamiento reactivo
    │   ├── createMatchstickAnimation.ts    # Animaciones GSAP puras: setPosition, animateToPosition (overwrite:true), Draggable
    │   ├── createScoreboardGestures.ts     # Composition root de input: rutea gesto → acción
    │   ├── createCoreResetBridge.ts        # Puente: eventos de ZONA del core (ZONE_RESET/ZONE_FILL) → clearZone/fillZone
    │   └── createMatchLifecycleBridge.ts   # Puente: eventos de CICLO DE VIDA (MATCH_VICTORY/UNDONE/FINALIZED) → modal + pipeline
    ├── input/
    │   ├── gestureRecognizer.ts   # Pointer Events → gestos (tap / two-finger-tap / drag); detectores como estrategias (OCP)
    │   └── zones.ts               # Resolución de zona por COORDENADAS (no por DOM): resolveZoneFromPoint / resolveOriginZone
    ├── lifecycle/
    │   └── matchFinalizedListeners.ts  # Registro OCP de listeners que corren al finalizar (limpiar tablero, cerrar modal, …futuro)
    ├── store/
    │   ├── presentationStore.ts   # Estado de PRESENTACIÓN: `matches[]` con zone/slotIndex + moveMatchstick + clearZone/fillZone
    │   ├── scoreboardActions.ts   # addPointToZone / removePointFromZone (tap) + selectores (lastInStorage/lastInZone)
    │   ├── victoryStore.ts        # Signal de presentación del modal de victoria (showVictory/hideVictory)
    │   └── matchstickRegistry.ts  # id → handle del fósforo (para el arrastre asistido)
    ├── constants.ts               # ANIMATION_DURATION + GESTURE (umbral de movimiento tap vs drag)
    ├── styles/                    # CSS modular (index importa el resto, incl. victoryModal.css)
    └── utils/index.ts             # Posiciones aleatorias (D3) + tipos
```

### ⭐ Dos estados, bien separados

- **Dominio (autoridad)**: el `GameEngine` (en `core/`) es el único dueño del puntaje, nombres,
  límite, buenas/malas y ganador. La UI lo lee vía `gameState` de `solidGameController` (un store de
  Solid sincronizado con `reconcile`). Acciones: `sumarPunto`, `restarPunto`, `cambiarNombre`,
  `cambiarLimite`, `reiniciar` → cada una despacha un `Command` al engine.
- **Presentación**: `src/ui/store/presentationStore.ts` (`presentationState`) mantiene solo lo visual
  de los fósforos: array único `matches: MatchStickData[]` donde cada elemento tiene `zone` (`'storage'|'A'|'B'`)
  y `slotIndex`. `moveMatchstick(id, toZone)` actualiza zone/slotIndex con cascada; `clearZone`/`fillZone`
  vacían/llenan una zona; **nada de esto toca el puntaje** (el reset es solo presentación).

### 🔌 Por qué comando-in / snapshot-out / **evento-out**

`Command`, `GameSnapshot` y `GameEvent` son objetos planos **serializables**: los mismos contratos
servirán para el futuro backend (despachar local hoy = enviar por WebSocket mañana). Ver `ROADMAP.md` Fase C.

### 🔄 Reset de zona decidido por el core (límite malas↔buenas)

El **core decide** cuándo vaciar/llenar la zona de un equipo y lo **notifica**; la UI solo reacciona.
Con `buenas(score) = max(0, score − 15)`, las reglas en `core/application/eventRules.ts` (estrategias,
OCP) emiten eventos al comparar el snapshot `prev → next` (y el `Command`) en cada `dispatch`:

- **Entrar a buenas** (cruzar 15→16) → `ZONE_RESET` → la UI **vacía** la zona (el punto nuevo queda como 1º de las buenas).
- **Volver de buenas** (cruzar 16→15) → `ZONE_FILL` → la UI **rellena** la zona a 15 (malas completas).

El core **mantiene el puntaje acumulado** (el `score-reference` muestra 15, 16, …). El puente
`createCoreResetBridge` (suscrito vía `onGameEvent`) traduce cada evento en `clearZone`/`fillZone`.
Hay **31 fósforos**: 30 para el máximo en mesa (ambos en 15 = 15+15) + 1 de respaldo para anotar el
punto del ganador cuando ambos están en 15.

### 🏆 Fin de partida con doble validación (mismo mecanismo de eventos)

El ciclo de vida de la partida se expresa con las **mismas reglas → eventos** (en `eventRules.ts`, las
reglas reciben también el `Command` para distinguir transiciones idénticas en el snapshot):

- **Condición de victoria alcanzada** → `MATCH_VICTORY` (regla `VictoryRule`: cualquier `ADD_POINTS`
  que deje un ganador). El core **no borra nada** (doble validación): solo avisa.
  `createMatchLifecycleBridge` lo traduce en `showVictory` y el **`VictoryModal`** anuncia al ganador con
  confeti (`canvas-confetti`).
- **Partida decidida = puntaje bloqueado**: `Match.addPoints` es un **no-op si `isFinished()`** (el
  ganador queda fijo en el límite). Pero el intento igual dispara `VictoryRule` → `MATCH_VICTORY`, así
  que **sumar otra vez no cambia el score y re-muestra el modal**.
- **"Nueva Partida"** → `finalizarPartida()` despacha `FINALIZE_MATCH`: el core resetea ambos a 0 y emite
  `MATCH_FINALIZED`. El puente recorre el **registro OCP** `MATCH_FINALIZED_LISTENERS` (limpiar tablero,
  cerrar modal; futuro: historial/sonido/estadísticas = una línea más en el array, **sin tocar el core**).
- **"✕" (cerrar)** → solo `hideVictory()` (presentación): descarta el anuncio sin tocar el puntaje (queda
  en el límite). _El gesto de **−1** sigue disponible para corregir un punto mal anotado_ (`REMOVE_POINTS`
  baja del límite → `winner` vuelve a null → `MATCH_VICTORY_UNDONE` → el juego sigue).

El overlay del modal (`z-index` alto, full-screen) intercepta los pointer events, así no se anotan
puntos "por detrás" mientras está abierto. Los puntos de UI (`addPointToZone` / `commitDrop`) chequean
`gameState.finished` para no colocar un fósforo fantasma cuando el core bloquea el punto.

### 👆 Gestos de input (táctil + mouse)

Una capa de input desacoplada (SRP/OCP) convive con el drag & drop:

- `ui/input/gestureRecognizer.ts` traduce **Pointer Events** a gestos semánticos (`tap`, `two-finger-tap`,
  `drag-start/move/end`) mediante **detectores como estrategias** (sumar swipe/3-dedos = nuevo detector, sin tocar el resto).
- `createScoreboardGestures` (montado en `ScoreKeeper`, fase de captura sobre `.scorekeeper`) rutea gesto → acción:
  **tap / click izq = +1**, **two-finger-tap / click der = −1**, **drag sobre zona vacía = arrastre asistido**
  (engancha el último fósforo de esa zona). La zona se resuelve por **coordenadas** (`ui/input/zones.ts`), no por DOM.
- Tap vs drag se diferencian por umbral de movimiento (`GESTURE.MOVE_THRESHOLD`); el arrastre directo sobre
  un fósforo lo sigue manejando su `Draggable` de GSAP.

## 🎯 Cómo funciona el drag & drop (clave del proyecto)

Los fósforos **siempre permanecen en el DOM del storage** (`#matchstick-storage`); nunca se
re-parentan. El posicionamiento visual se logra únicamente con GSAP transforms (`x`/`y`/`width`/`height`/`rotation`).

1. Cada `MatchStick` genera su posición aleatoria en el storage (`positionRandomX/Y`) y crea controles de animación (`createMatchstickAnimation`).
2. En `onMount`, `createMatchstickLogic` calcula la posición inicial y hace `setPosition` instantáneo; luego registra el `Draggable`.
3. Al soltar (`onRelease`), `hitTest` decide la zona destino (`#section-A` / `#section-B`).
4. Si hay zona válida: `commitDrop(toZone)` llama `moveMatchstick(id, toZone)` y despacha al core (`sumarPunto`/`restarPunto`). Es **boundary-aware**: al soltar sobre una zona llena (15) suma primero (cruza a buenas → `ZONE_RESET` la vacía) y coloca el fósforo como 1º de las buenas.
5. Un `createEffect(on(..., { defer: true }))` observa el cambio de `zone`/`slotIndex` en el store y calcula la posición del slot destino con `getSlotPosition` (vía `getBoundingClientRect` del div `.matchstickPosition[data-team][data-slot]`), luego anima con `animateToPosition`.
6. `PointSection` (solo equipo A) mide el primer slot con `ResizeObserver` y lo guarda en `matchstickSize`; ese tamaño determina el ancho/alto de todos los fósforos.

## 📐 Convenciones

- **Alias de import**: `@/*` → `src/*` (configurado en `tsconfig.json` + `vite-tsconfig-paths`).
  Ej.: `import { gameState } from '@/infrastructure/adapters/solidGameController'`.
- **Hooks SolidJS** con prefijo `create*` (no `use*`), siguiendo la convención de Solid.
- **JSX de Solid**: usar `class` (no `className`), `<For>`, `<Show>` en vez de `.map`/ternarios.
- TypeScript estricto: `noUnusedLocals` y `noUnusedParameters` activos — no dejar variables sin usar.
- CSS modular bajo `src/ui/styles/`; `index.css` importa el resto.

## 🐞 Notas y estado

- El salto visual al finalizar la animación (bug del Flip approach) está **resuelto**: al no
  re-parentar ni usar `Flip`, los fósforos se posicionan suavemente con `gsap.to` puro.
- Los tweens de GSAP usan **`overwrite: true`**: un tween nuevo mata al anterior del mismo fósforo.
  Sin esto, al entrar a buenas un fósforo podía recibir dos tweens a la vez (vaciado→depósito 0.5s y
  colocación→slot 0.3s) y el más largo ganaba, dejándolo en el depósito.
- `PointSection` ahora expone slots vacíos con `data-team`, `data-slot`, `data-rotation` (sin renderizar `MatchStick` adentro).
  `MatchStickStorage` itera **todos** los fósforos (no solo los del storage).
- Pendiente (ver `ROADMAP.md` Fase A): derivar los fósforos 100% del puntaje del core; selector de
  límite 15/30; persistencia en `localStorage`; tests de dominio con Vitest. _(UI de ganador / fin de
  partida ya implementada: `VictoryModal` + `eventRules` + `MATCH_FINALIZED_LISTENERS`.)_
- `README.md` todavía describe la arquitectura anterior (vanilla/hexagonal). Tomalo como contexto
  histórico; la fuente de verdad es este `CLAUDE.md` + `ROADMAP.md`.

## 🧠 Grafo de conocimiento (graphify)

El proyecto se indexa con **graphify** a un grafo de conocimiento consultable, en `graphify-out/`
(ignorado por git: es un artefacto local y regenerable). Reglas para mantenerlo útil:

- **Consultar primero**: si existe `graphify-out/graph.json`, ante preguntas sobre el código
  (arquitectura, qué llama a qué, flujo de datos) usar `/graphify query "<pregunta>"` antes de leer
  archivos a mano — responde desde el grafo y gasta muchos menos tokens.
- **Si no existe el grafo**: construirlo con `/graphify .` (excluye `node_modules`/`dist` vía `.gitignore`).
- **Mantenerlo actualizado**: después de cambios de código en `src/` (agregar, mover o renombrar
  archivos, o cambiar relaciones entre módulos), refrescar con `/graphify . --update` (incremental:
  solo reprocesa lo cambiado; el AST no usa LLM). Tras un refactor grande, `/graphify . --update --mode deep`.
- Es **local y regenerable**: no se commitea; cada clon lo reconstruye con `/graphify .`.

## 📜 Historia y visión

- **`HISTORIAL.md`** — roadmap de *lo que ya se hizo*, reconstruido desde el historial de Git
  (evolución de stacks: Vanilla → TypeScript/Vite → GSAP → Hexagonal → React → Lit → SolidJS).
- **`ROADMAP.md`** — visión a futuro del autor (multijugador en tiempo real con Hono + WebSockets,
  con despliegue previsto en Cloudflare).
