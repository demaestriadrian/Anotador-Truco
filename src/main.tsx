import { render } from 'solid-js/web'
import { registerSW } from 'virtual:pwa-register'
import App from '@/ui/components/App'
import { exposeVersion } from '@/appVersion'
import '@/ui/styles/index.css'

// Service worker de la PWA (lo genera vite-plugin-pwa en el build; en `pnpm dev` es un no-op).
// `immediate: true` lo registra sin esperar al evento load.
registerSW({ immediate: true })

// Versión consultable desde la consola del navegador (`anotador`).
exposeVersion()

render(() => <App />, document.getElementById('root')!)
