import { Show } from 'solid-js'
import { confirmRequest, acceptConfirm, dismissConfirm } from '@/ui/store/confirmStore'

/**
 * Diálogo de confirmación genérico: reacciona a `confirmRequest` (seteado por cualquier acción
 * destructiva vía `requestConfirm`). Overlay por encima del panel de configuraciones, así la
 * confirmación de "reiniciar" puede pedirse también desde adentro del panel.
 */
const ConfirmDialog = () => (
    <Show when={confirmRequest()}>
        {(request) => (
            <div class="confirm-overlay" style={{ 'touch-action': 'none' }}>
                <div class="confirm-card">
                    <p class="confirm-card__message">{request().message}</p>
                    <div class="confirm-card__actions">
                        <button class="settings-btn" onClick={dismissConfirm}>
                            Cancelar
                        </button>
                        <button class="settings-btn settings-btn--danger" onClick={acceptConfirm}>
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        )}
    </Show>
)

export default ConfirmDialog
