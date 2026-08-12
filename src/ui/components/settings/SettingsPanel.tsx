import { Show, For } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import X from 'lucide-solid/icons/x'
import { settingsOpen, closeSettings } from '@/ui/store/settingsPanelStore'
import { SETTINGS_SECTIONS, SETTINGS_ITEMS } from './settingsItems'

/**
 * Panel de configuraciones: overlay full-screen (bloquea los gestos de puntaje por detrás) +
 * DRAWER que desliza desde la derecha, con header fijo y cuerpo scrolleable.
 *
 * Itera SETTINGS_SECTIONS y, dentro de cada una, los ítems que le corresponden (OCP: el panel
 * no conoce ningún ítem). Una sección sin ítems no se renderiza, así quitar un ítem a futuro no
 * deja un encabezado huérfano. Click fuera del drawer cierra.
 */
const SettingsPanel = () => (
    <Show when={settingsOpen()}>
        <div class="settings-overlay" style={{ 'touch-action': 'none' }} onClick={closeSettings}>
            <div class="settings-card" onClick={(e) => e.stopPropagation()}>
                <header class="settings-card__header">
                    <h2 class="settings-card__title">Configuraciones</h2>
                    <button class="settings-card__close" aria-label="Cerrar" onClick={closeSettings}>
                        <X size={16} />
                    </button>
                </header>

                <div class="settings-card__items">
                    <For each={SETTINGS_SECTIONS}>
                        {(section) => {
                            const items = SETTINGS_ITEMS.filter((i) => i.section === section.id)
                            return (
                                <Show when={items.length > 0}>
                                    <section class="settings-section">
                                        <h3 class="settings-section__title">{section.title}</h3>
                                        <For each={items}>
                                            {(def) => <Dynamic component={def.Item} />}
                                        </For>
                                    </section>
                                </Show>
                            )
                        }}
                    </For>
                </div>
            </div>
        </div>
    </Show>
)

export default SettingsPanel
