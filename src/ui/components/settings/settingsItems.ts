// Registro de secciones e ítems del panel de configuraciones (OCP): el panel itera esto y
// renderiza cada componente bajo su sección. Agregar una configuración = crear su componente en
// `items/` y sumar una línea acá; agregar una sección = una línea en SETTINGS_SECTIONS.
// El panel no conoce ningún ítem en particular.
import type { Component } from 'solid-js'
import RestartMatchItem from './items/RestartMatchItem'
import SoundToggleItem from './items/SoundToggleItem'
import LimitSelectItem from './items/LimitSelectItem'
import QuickActionSelectItem from './items/QuickActionSelectItem'
import HistoryItem from './items/HistoryItem'

export type SettingsSectionId = 'match' | 'history' | 'preferences' | 'danger'

export interface SettingsSection {
    id: SettingsSectionId
    title: string
}

// El orden acá es el orden visual. Lo destructivo va último, lejos del pulgar.
export const SETTINGS_SECTIONS: SettingsSection[] = [
    { id: 'match', title: 'Partida' },
    { id: 'history', title: 'Historial' },
    { id: 'preferences', title: 'Preferencias' },
    { id: 'danger', title: 'Zona de peligro' },
]

export interface SettingsItemDef {
    id: string
    section: SettingsSectionId
    Item: Component
}

export const SETTINGS_ITEMS: SettingsItemDef[] = [
    { id: 'limit-select', section: 'match', Item: LimitSelectItem },
    { id: 'history-open', section: 'history', Item: HistoryItem },
    { id: 'sound-toggle', section: 'preferences', Item: SoundToggleItem },
    { id: 'quick-action-select', section: 'preferences', Item: QuickActionSelectItem },
    { id: 'restart-match', section: 'danger', Item: RestartMatchItem },
    // 🔌 Futuro: tema, estadísticas… = un componente nuevo + una línea acá con su sección.
]
