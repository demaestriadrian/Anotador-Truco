import { restartMatchWithConfirm } from '@/ui/actions/quickActions'

// Ítem: reiniciar la partida (con confirmación). Reusa la misma acción del botón rápido:
// el RESET del core deja 0-0 y emite ZONE_RESET para que la UI recoja los fósforos.
const RestartMatchItem = () => (
    <div class="settings-item">
        <span class="settings-item__label">Reiniciar el juego</span>
        <button class="settings-btn settings-btn--danger" onClick={restartMatchWithConfirm}>
            Reiniciar
        </button>
    </div>
)

export default RestartMatchItem
