import History from 'lucide-solid/icons/history'
import { openHistory } from '@/ui/store/historyPanelStore'
import { SettingsNavRow } from '../SettingsRow'

// Ítem: abre el panel de historial (drawer que desliza por encima de este).
// Fila navegable: el chevron indica que lleva a otra pantalla.
const HistoryItem = () => (
    <SettingsNavRow
        icon={History}
        label="Ver historial"
        hint="Puntos anotados por mano"
        onClick={openHistory}
    />
)

export default HistoryItem
