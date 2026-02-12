// Punto de entrada para probar los componentes Lit de forma aislada
import '@/ui/lit-components/index.js'

// Estilos globales (reset, html/body, background) - se reutilizan del original
import '@/ui/styles/index.css'

// Montar directamente el Web Component
const root = document.getElementById('root')!
root.innerHTML = '<truco-app></truco-app>'
