// Registro de todos los componentes Lit
import '@/ui/components/index.js'

// Estilos globales (reset, html/body, background)
import '@/ui/styles/index.css'

// Montar el Web Component principal
const root = document.getElementById('root')!
root.innerHTML = '<truco-app></truco-app>'
