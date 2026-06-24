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
| Animaciones | **GSAP 3.13** — plugin `Draggable` (arrastre) + tweens `gsap.to/set` (posicionamiento puro, sin Flip) |
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
│   ├── ports/types.ts             # Contratos serializables: Command, GameSnapshot, TeamSnapshot
│   └── application/GameEngine.ts  # Motor: dispatch(cmd) / getState() / subscribe()
├── infrastructure/
│   └── adapters/solidGameController.ts  # Puente core↔SolidJS (createStore + reconcile) + acciones
└── ui/                            # Presentación (SolidJS)
    ├── components/
    │   ├── App.tsx                # Raíz; monta ScoreKeeper + #referenceDrag
    │   ├── ScoreKeeper.tsx        # Layout; lee gameState del core; animación Flip global
    │   ├── PointSection.tsx       # Zona de un equipo: 3 grupos × 5 slots; mide tamaño de slot
    │   ├── MatchStick.tsx         # Un fósforo (imagen) + drag + animación
    │   ├── MatchStickStorage.tsx  # Depósito (expone id="matchstick-storage")
    │   ├── TeamName.tsx           # Input de nombre → cambiarNombre()
    │   └── Separator.tsx          # Separadores visuales (línea / cinta)
    ├── hooks/
    │   ├── createMatchstickLogic.ts     # Drag & drop: hitTest, getSlotPosition, despacha comandos al core
    │   └── createMatchstickAnimation.ts # Animaciones GSAP puras: setPosition, animateToPosition, Draggable
    ├── store/presentationStore.ts # Estado de PRESENTACIÓN: array único `matches[]` con zone/slotIndex
    ├── constants.ts               # ANIMATION_DURATION (duraciones de animación en segundos)
    ├── styles/                    # CSS modular (index importa el resto)
    └── utils/index.ts             # Posiciones aleatorias (D3) + tipos
```

### ⭐ Dos estados, bien separados

- **Dominio (autoridad)**: el `GameEngine` (en `core/`) es el único dueño del puntaje, nombres,
  límite, buenas/malas y ganador. La UI lo lee vía `gameState` de `solidGameController` (un store de
  Solid sincronizado con `reconcile`). Acciones: `sumarPunto`, `restarPunto`, `cambiarNombre`,
  `cambiarLimite`, `reiniciar` → cada una despacha un `Command` al engine.
- **Presentación**: `src/ui/store/presentationStore.ts` (`presentationState`) mantiene solo lo visual
  de los fósforos: array único `matches: MatchStickData[]` donde cada elemento tiene `zone` (`'storage'|'A'|'B'`)
  y `slotIndex`. `moveMatchstick(id, toZone)` actualiza zone/slotIndex con lógica de cascada; **no** toca el puntaje.

### 🔌 Por qué comando-in / snapshot-out

`Command` y `GameSnapshot` son objetos planos **serializables**: los mismos contratos servirán para
el futuro backend (despachar local hoy = enviar por WebSocket mañana). Ver `ROADMAP.md` Fase C.

## 🎯 Cómo funciona el drag & drop (clave del proyecto)

Los fósforos **siempre permanecen en el DOM del storage** (`#matchstick-storage`); nunca se
re-parentan. El posicionamiento visual se logra únicamente con GSAP transforms (`x`/`y`/`width`/`height`/`rotation`).

1. Cada `MatchStick` genera su posición aleatoria en el storage (`positionRandomX/Y`) y crea controles de animación (`createMatchstickAnimation`).
2. En `onMount`, `createMatchstickLogic` calcula la posición inicial y hace `setPosition` instantáneo; luego registra el `Draggable`.
3. Al soltar (`onRelease`), `hitTest` decide la zona destino (`#section-A` / `#section-B`).
4. Si hay zona válida: se llama `moveMatchstick(id, toZone)` en el store de presentación y se despachan los comandos al core (`sumarPunto`/`restarPunto`).
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
- `PointSection` ahora expone slots vacíos con `data-team`, `data-slot`, `data-rotation` (sin renderizar `MatchStick` adentro).
  `MatchStickStorage` itera **todos** los fósforos (no solo los del storage).
- Pendiente (ver `ROADMAP.md` Fase A): derivar los fósforos 100% del puntaje del core; UI de ganador y selector de límite 15/30.
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
