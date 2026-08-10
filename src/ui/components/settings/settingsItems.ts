// Registro de ítems del panel de configuraciones (OCP): el panel itera este array y renderiza
// cada componente. Agregar una configuración nueva = crear su componente en `items/` y sumar
// una entrada acá; no se toca el panel ni los ítems existentes.
import type { Component } from 'solid-js'
import RestartMatchItem from './items/RestartMatchItem'
import SoundToggleItem from './items/SoundToggleItem'
import LimitSelectItem from './items/LimitSelectItem'
import QuickActionSelectItem from './items/QuickActionSelectItem'
import HistoryItem from './items/HistoryItem'
import HistoryGapItem from './items/HistoryGapItem'

export interface SettingsItemDef {
    id: string
    Item: Component
}

export const SETTINGS_ITEMS: SettingsItemDef[] = [
    { id: 'restart-match', Item: RestartMatchItem },
    { id: 'sound-toggle', Item: SoundToggleItem },
    { id: 'limit-select', Item: LimitSelectItem },
    { id: 'quick-action-select', Item: QuickActionSelectItem },
    { id: 'history-open', Item: HistoryItem },
    { id: 'history-gap', Item: HistoryGapItem },
    // 🔌 Futuro: tema, estadísticas… = un componente nuevo + una línea acá.
]
