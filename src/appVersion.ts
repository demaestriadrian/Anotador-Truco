// Identidad de la build: versión del package.json + rama, commit y fecha de compilación.
//
// Es una capa de PLATAFORMA, ortogonal a la arquitectura hexagonal (como la PWA): ni el core ni
// el dominio la conocen. Los valores los inyecta Vite con `define` en tiempo de build, así que
// acá no se lee package.json ni se ejecuta git desde el navegador.

export const BUILD = __APP_BUILD__

export const APP_VERSION = BUILD.version

// Detalle en una línea, para el tooltip del pie del panel y el log de arranque.
export const buildLabel = () => `${BUILD.rama} · ${BUILD.commit} · ${BUILD.compilado}`

declare global {
  interface Window {
    anotador: Readonly<typeof BUILD>
  }
}

/**
 * Deja la identidad de la build a mano en la consola del navegador (`anotador`) y la anuncia al
 * arrancar. Sirve para saber de un vistazo QUÉ build se está mirando: la de producción (main),
 * la de preview (dev) o la local, sin tener que adivinar por el aspecto de la UI.
 */
export const exposeVersion = () => {
    window.anotador = Object.freeze({ ...BUILD })
    console.info(`Anotador de Truco v${BUILD.version} · ${BUILD.rama} · ${BUILD.commit}`)
}
