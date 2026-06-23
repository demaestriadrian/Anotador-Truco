# 🧭 Historial de Evolución del Proyecto (según Git)

Este documento reconstruye **qué se hizo** en el Anotador de Truco a lo largo del tiempo, leído
directamente del historial de Git. Es complementario a [`ROADMAP.md`](./ROADMAP.md), que describe
la visión a futuro.

> El hilo conductor del proyecto es la **migración progresiva de stacks**, manteniendo siempre la
> misma idea: arrastrar fósforos para anotar puntos de Truco.

## 🧬 Línea de tiempo

### 2023 — Génesis: HTML/CSS → TypeScript + Vite
- **Abr–May 2023**: primeros commits. Maquetado inicial de fósforos en HTML/CSS, ajustes de altura.
- **Oct 2023**: reorganización del proyecto, migración **a TypeScript**, inicialización de **Vite**.
- **Oct–Nov 2023**: configuración de **LESS** y **ESLint** (`standard-with-typescript`), módulo
  visual, estilos y posicionamiento. Importación de LESS a TS, rutas absolutas.

### 2025 — Drag & Drop con GSAP y arquitectura
- **Ago–Sep 2025 (rama `GSAP`)**: se incorpora **arrastrar y soltar con GSAP**. Se eliminan
  imágenes no optimizadas (migración a `.webp`), se pasa a unidades `svw`/`svh`, se crean las
  clases `MatchStick` y `PointSection`, y se agrega rotación al mover el fósforo.
- Se reemplazan estilos LESS por CSS, se afinan dependencias de ESLint y `tsconfig-paths` en Vite.

### Enero 2026 — Refactor Hexagonal y primer salto a framework
- **21–23 Ene**: *"First Refactor Hexagonal Architecture"* — separación dominio / aplicación /
  infraestructura / UI. Reestructuración de carpetas y actualización del **`ROADMAP.md`** con la
  estrategia futura **Bun + Hono**.
- **26 Ene**: se agrega la skill `web-design-guidelines` y se **migra la UI a React + TypeScript +
  Zustand** para el scorekeeping (rama `react` / `hexagonal-architecture`).
- **27–28 Ene**: sistema de fósforos con drag & drop y estado global Zustand; traducción de
  comentarios a español; se agregan **reglas de agente exigiendo español** en comentarios, chat,
  tareas y planes.
- **29 Ene**: hook `useMatchstickAnimation` con constantes de velocidad; sistema de fósforos
  arrastrable con animaciones y manejo de estado.

### Febrero 2026 — De React a Lit, y de Lit a SolidJS
- **2–4 Feb**: UI central del ScoreKeeper (nombres de equipo, score, animaciones). Lógica de
  drag & drop entre equipos y depósito; rotación de fósforos en la zona de puntaje. Renombre de
  `isTemplate` → `isStoraged`. Store Zustand para tracking de movimientos.
- **12 Feb (rama `Lit`)**: **migración a Lit** (`refactor: migrando a Lit`), se agregan animaciones
  y un componente `LitElement` para el input de nombre de equipo. Luego *"remove react"*.
- **13 Feb (rama `SolidJS`)**: **primer refactor a SolidJS** (`refactor: first refactor to SolidJS`).
  Se reescribe la app con componentes/hooks/store de Solid. Fixes de visibilidad del fósforo y
  cambios en la forma de animar (con *"algunos errores visuales"* pendientes). ← **base de esta rama**
- **20 Feb (rama `SolidJS-manual`)**: constantes para puntaje máximo y total de fósforos; intento de
  simplificar la lógica de animación y el manejo del `Draggable` en `ScoreKeeper` (commits no
  incluidos en esta rama).

## 🌿 Mapa de ramas

| Rama | Punta | Representa |
| :--- | :--- | :--- |
| `main` | `31e4f57` | UI base del ScoreKeeper (estado intermedio) |
| `GSAP` | `676e588` | Versión vanilla + GSAP (clases `MatchStick`) |
| `hexagonal-architecture` | `b78cf22` | Refactor a arquitectura hexagonal |
| `react` | `bf2bd18` | Implementación React + Zustand |
| `Lit` | `7532ee5` | Migración a Lit |
| `SolidJS` | `319ba4a` | Refactor a SolidJS (base de trabajo) |
| `SolidJS-manual` | `f02cb2f` | SolidJS + simplificaciones manuales (2 commits adelante) |
| **`SolidJS-Claude`** | `319ba4a` | **Rama activa de trabajo con Claude** (creada desde `SolidJS`) |

## 🪜 Resumen de la evolución de stack

```
Vanilla HTML/CSS  →  TypeScript + Vite  →  GSAP (drag & drop)  →  Arquitectura Hexagonal
        →  React + Zustand  →  Lit  →  SolidJS  ← (estado actual)
```

## ✅ Estado actual (rama `SolidJS-Claude`)

- App funcional en **SolidJS** con drag & drop de fósforos y store reactivo (`gameStore.ts`).
- Animaciones con **GSAP Flip**; arrastre con **GSAP Draggable**.
- Pendiente: pulir errores visuales de animación y el retorno de fósforos al depósito
  (ver "Problemas conocidos" en [`CLAUDE.md`](./CLAUDE.md)).
- Capa `src/core/` (hexagonal) quedó **sin uso** tras la migración a SolidJS.
