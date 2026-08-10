import { settings, toggleSound } from '@/ui/store/settingsStore'

// Ítem: activar/desactivar los efectos de sonido (persistido en settings).
const SoundToggleItem = () => (
    <div class="settings-item">
        <span class="settings-item__label">Sonido</span>
        <button
            class="settings-toggle"
            classList={{ 'settings-toggle--on': settings.soundEnabled }}
            role="switch"
            aria-checked={settings.soundEnabled}
            aria-label="Sonido"
            onClick={toggleSound}
        >
            <span class="settings-toggle__thumb" />
        </button>
    </div>
)

export default SoundToggleItem
