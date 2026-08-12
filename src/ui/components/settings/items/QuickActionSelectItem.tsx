import { For } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import Zap from 'lucide-solid/icons/zap'
import { QUICK_ACTIONS, resolveQuickAction } from '@/ui/actions/quickActions'
import { settings, setQuickAction } from '@/ui/store/settingsStore'
import SettingsRow from '../SettingsRow'
import { nextOption } from '../cycleOption'

// Ítem: qué acción ejecuta el botón de acceso rápido. Itera el REGISTRO de acciones (OCP):
// una acción nueva aparece acá sola. Segmented de íconos para no romper el ritmo de las filas.
const QuickActionSelectItem = () => (
    <SettingsRow
        icon={Zap}
        label="Botón rápido"
        hint="Qué hace el botón izquierdo"
        // Tocar la fila avanza a la acción siguiente del registro.
        onActivate={() => setQuickAction(nextOption(QUICK_ACTIONS, resolveQuickAction(settings.quickActionId)).id)}
    >
        <div class="settings-segmented">
            <For each={QUICK_ACTIONS}>
                {(action) => (
                    <button
                        class="settings-segmented__option settings-segmented__option--icon"
                        classList={{ 'settings-segmented__option--active': resolveQuickAction(settings.quickActionId).id === action.id }}
                        aria-label={action.label}
                        title={action.label}
                        onClick={() => setQuickAction(action.id)}
                    >
                        <Dynamic component={action.icon()} size={18} />
                    </button>
                )}
            </For>
        </div>
    </SettingsRow>
)

export default QuickActionSelectItem
