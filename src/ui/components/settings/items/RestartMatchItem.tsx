import RotateCcw from 'lucide-solid/icons/rotate-ccw'
import { restartMatchWithConfirm } from '@/ui/actions/quickActions'
import SettingsRow from '../SettingsRow'

// Ítem: reiniciar la partida (con confirmación). Reusa la misma acción del botón rápido:
// el RESET del core deja 0-0 y emite ZONE_RESET para que la UI recoja los fósforos.
const RestartMatchItem = () => (
    <SettingsRow
        icon={RotateCcw}
        label="Reiniciar el juego"
        hint="Borra el puntaje y los fósforos"
        danger
        onActivate={restartMatchWithConfirm}
    >
        <button class="settings-btn settings-btn--danger" onClick={restartMatchWithConfirm}>
            Reiniciar
        </button>
    </SettingsRow>
)

export default RestartMatchItem
