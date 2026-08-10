import { Show, For } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import X from 'lucide-solid/icons/x'
import { settingsOpen, closeSettings } from '@/ui/store/settingsPanelStore'
import { SETTINGS_ITEMS } from './settingsItems'

/**
 * Panel de configuraciones: overlay full-screen (bloquea los gestos de puntaje por detrás) +
 * DRAWER que desliza desde la derecha, iterando el registro SETTINGS_ITEMS. El panel no conoce
 * ningún ítem en particular: solo renderiza lo registrado (OCP). Click fuera del drawer cierra.
 */
const SettingsPanel = () => (
    <Show when={settingsOpen()}>
        <div class="settings-overlay" style={{ 'touch-action': 'none' }} onClick={closeSettings}>
            <div class="settings-card" onClick={(e) => e.stopPropagation()}>
                <button class="settings-card__close" aria-label="Cerrar" onClick={closeSettings}>
                    <X size={16} />
                </button>
                <h2 class="settings-card__title">Configuraciones</h2>
                <div class="settings-card__items">
                    <For each={SETTINGS_ITEMS}>
                        {(def) => <Dynamic component={def.Item} />}
                    </For>
                </div>
            </div>
        </div>
    </Show>
)

export default SettingsPanel
