import History from 'lucide-solid/icons/history'
import { openHistory } from '@/ui/store/historyPanelStore'

// Ítem: abre el panel de historial de puntos (drawer que desliza por encima de este).
const HistoryItem = () => (
    <div class="settings-item">
        <span class="settings-item__label">Historial de puntos</span>
        <button class="settings-btn settings-btn--with-icon" onClick={openHistory}>
            <History size={16} />
            Ver
        </button>
    </div>
)

export default HistoryItem
