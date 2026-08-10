import { For } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { QUICK_ACTIONS, resolveQuickAction } from '@/ui/actions/quickActions'
import { settings, setQuickAction } from '@/ui/store/settingsStore'

// Ítem: qué acción ejecuta el botón de acceso rápido. Itera el REGISTRO de acciones (OCP):
// una acción nueva aparece acá sola, sin tocar este componente.
const QuickActionSelectItem = () => (
    <div class="settings-item settings-item--column">
        <span class="settings-item__label">Botón de acceso rápido</span>
        <div class="settings-options">
            <For each={QUICK_ACTIONS}>
                {(action) => (
                    <button
                        class="settings-option"
                        classList={{ 'settings-option--active': resolveQuickAction(settings.quickActionId).id === action.id }}
                        onClick={() => setQuickAction(action.id)}
                    >
                        <Dynamic component={action.icon()} size={18} class="settings-option__icon" />
                        {action.label}
                    </button>
                )}
            </For>
        </div>
    </div>
)

export default QuickActionSelectItem
