import { createSignal } from 'solid-js'

// Estado de PRESENTACIÓN del panel de historial (mismo patrón que settingsPanelStore):
// solo refleja si el drawer está visible; los datos vienen del snapshot del core.
const [historyOpen, setHistoryOpen] = createSignal(false)

export { historyOpen }

export const openHistory = () => setHistoryOpen(true)

export const closeHistory = () => setHistoryOpen(false)
