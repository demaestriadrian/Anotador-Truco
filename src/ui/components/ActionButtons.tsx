import { Dynamic } from 'solid-js/web'
import Settings from 'lucide-solid/icons/settings'
import { resolveQuickAction } from '@/ui/actions/quickActions'
import { settings } from '@/ui/store/settingsStore'
import { openSettings } from '@/ui/store/settingsPanelStore'

/**
 * Botón de acceso rápido (izquierda del depósito): ejecuta la acción elegida por el usuario
 * en configuraciones. No conoce las acciones: las resuelve desde el registro QUICK_ACTIONS.
 */
export const QuickActionButton = () => {
    const action = () => resolveQuickAction(settings.quickActionId)
    return (
        <button
            class="action-btn action-btn--quick"
            aria-label={action().label}
            onClick={() => action().run()}
        >
            <Dynamic component={action().icon()} size={22} />
        </button>
    )
}

/** Botón de configuraciones (derecha del depósito): abre el panel. */
export const SettingsButton = () => (
    <button class="action-btn action-btn--settings" aria-label="Configuraciones" onClick={openSettings}>
        <Settings size={22} />
    </button>
)
