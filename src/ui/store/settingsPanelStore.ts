import { createSignal } from 'solid-js'

// Estado de PRESENTACIÓN del panel de configuraciones (mismo patrón que victoryStore):
// solo refleja si el panel está visible; el contenido lo define el registro de ítems.
const [settingsOpen, setSettingsOpen] = createSignal(false)

export { settingsOpen }

export const openSettings = () => setSettingsOpen(true)

export const closeSettings = () => setSettingsOpen(false)
