import { createStore } from 'solid-js/store'
import { setMuted } from '@/ui/audio/soundPlayer'
// Import SOLO de tipo (se borra al compilar): no crea ciclo en runtime con quickActions.
import type { QuickActionId } from '@/ui/actions/quickActions'

// Preferencias del usuario (presentación). Se persisten en su propia clave de localStorage,
// separadas de la partida (que es dominio y la persiste el core vía su puerto).

const STORAGE_KEY = 'anotador-truco/settings'

export interface Settings {
    soundEnabled: boolean
    quickActionId: QuickActionId
    historyGapSeconds: number   // hueco (s) que separa dos grupos de anotaciones en el historial
}

const DEFAULT_SETTINGS: Settings = {
    soundEnabled: true,
    quickActionId: 'toggle-sound',
    historyGapSeconds: 30,
}

// Carga defensiva: dato corrupto o parcial → defaults (mergeando lo válido).
const loadSettings = (): Settings => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return DEFAULT_SETTINGS
        const parsed = JSON.parse(raw) as Partial<Settings>
        return {
            soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
            // Solo se valida que sea string: si el id ya no existe en el registro (versión vieja),
            // el resolver de quickActions cae al default. Así agregar/quitar acciones no toca esto.
            quickActionId: typeof parsed.quickActionId === 'string'
                ? parsed.quickActionId as QuickActionId
                : DEFAULT_SETTINGS.quickActionId,
            historyGapSeconds: typeof parsed.historyGapSeconds === 'number'
                && Number.isFinite(parsed.historyGapSeconds) && parsed.historyGapSeconds > 0
                ? parsed.historyGapSeconds
                : DEFAULT_SETTINGS.historyGapSeconds,
        }
    } catch {
        return DEFAULT_SETTINGS
    }
}

const [settings, setSettings] = createStore<Settings>(loadSettings())

// Aplicar el estado inicial al reproductor (DIP: el audio no conoce a settings).
setMuted(!settings.soundEnabled)

const persist = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            soundEnabled: settings.soundEnabled,
            quickActionId: settings.quickActionId,
            historyGapSeconds: settings.historyGapSeconds,
        }))
    } catch {
        // Storage bloqueado o lleno: las preferencias siguen en memoria.
    }
}

export { settings }

// Activa/desactiva el sonido y lo aplica al reproductor.
export const toggleSound = () => {
    setSettings('soundEnabled', (enabled) => !enabled)
    setMuted(!settings.soundEnabled)
    persist()
}

// Cambia qué acción ejecuta el botón de acceso rápido.
export const setQuickAction = (id: QuickActionId) => {
    setSettings('quickActionId', id)
    persist()
}

// Cambia el hueco temporal que separa dos grupos de anotaciones en el historial.
export const setHistoryGap = (seconds: number) => {
    setSettings('historyGapSeconds', seconds)
    persist()
}
