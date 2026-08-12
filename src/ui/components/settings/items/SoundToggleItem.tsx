import Volume2 from 'lucide-solid/icons/volume-2'
import { settings, toggleSound } from '@/ui/store/settingsStore'
import SettingsRow from '../SettingsRow'

// Ítem: activar/desactivar los efectos de sonido (persistido en settings).
const SoundToggleItem = () => (
    <SettingsRow icon={Volume2} label="Sonido" hint="Efectos al anotar" onActivate={toggleSound}>
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
    </SettingsRow>
)

export default SoundToggleItem
