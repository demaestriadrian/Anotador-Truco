# 🎴 Anotador de Truco - Hexagonal Style

![Truco Argentino](https://img.shields.io/badge/Game-Truco_Argentino-blue) ![Architecture](https://img.shields.io/badge/Architecture-Hexagonal-orange) ![Stack](https://img.shields.io/badge/Stack-TypeScript_Vite_GSAP-yellow)

Este proyecto es una implementación moderna e interactiva de un anotador para el **Truco Argentino**. A diferencia de los anotadores digitales tradicionales, este busca replicar la experiencia táctil de usar fósforos, permitiendo a los jugadores arrastrar y soltar los puntos en su respectiva zona.

## 🌟 Características Principales

-   **Interacción Realista**: Sistema de _Drag & Drop_ (arrastrar y soltar) usando [GSAP](https://greensock.com/gsap/) para mover los fósforos.
-   **Arquitectura Robusta**: Diseñado siguiendo principios de **Arquitectura Hexagonal** para separar la lógica de negocio de la interfaz visual.
-   **Diseño Limpio**: Interfaz minimalista centrada en la experiencia de usuario.

## 🚀 Tecnologías

-   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (Tipado estricto).
-   **Bundler**: [Vite](https://vitejs.dev/) (Rápido y ligero).
-   **Animaciones**: [GSAP](https://greensock.com/gsap/) (Draggable & MotionPath).
-   **Estilos**: CSS Nativo moderno (Variables, Flexbox/Grid).

## 📂 Estructura del Proyecto

El proyecto sigue una estructura DDD / Hexagonal simplificada:

```
src/
├── core/               # Lógica de Negocio Pura (Agnóstica al Framework)
│   ├── domain/         # Entidades y Reglas del Juego (Puntos, Partida)
│   └── application/    # Casos de Uso (SumarPuntos, Reiniciar)
├── infrastructure/     # Implementación Técnica
│   ├── adapters/       # Adaptadores (Conexión entre UI y Core)
│   └── setup/          # Inicialización de la App (Bootstrap)
├── ui/                 # Interfaz de Usuario (antes 'view')
│   ├── components/     # Clases UI (MatchStick, PointSection)
│   ├── styles/         # CSS modular
│   └── elements.ts     # Referencias al DOM
└── app/                # Punto de entrada principal
```

## 🛠️ Instalación y Uso

1.  **Instalar dependencias**:
    ```bash
    pnpm install
    ```

2.  **Iniciar servidor de desarrollo**:
    ```bash
    pnpm run dev
    ```

3.  **Construir para producción**:
    ```bash
    pnpm build
    ```

## 🤝 Contribución

Las contribuciones son bienvenidas, especialmente aquellas enfocadas en mejorar la lógica del juego en `src/core/domain` o las animaciones en `src/ui`.

---
_Creado con ❤️ para los amantes del Truco._
