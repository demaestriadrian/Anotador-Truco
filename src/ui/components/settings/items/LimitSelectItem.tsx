import { For } from 'solid-js'
import Target from 'lucide-solid/icons/target'
import { gameState, cambiarLimite } from '@/infrastructure/adapters/solidGameController'
import { LIMITES_VALIDOS } from '@/core/domain/constants'
import SettingsRow from '../SettingsRow'

// Ítem: límite de puntaje de la partida (15/30). Itera los límites válidos del DOMINIO
// (no hardcodea): agregar un límite nuevo al core lo muestra acá automáticamente.
const LimitSelectItem = () => (
    <SettingsRow icon={Target} label="Partida a" hint="Puntos para ganar">
        <div class="settings-segmented">
            <For each={[...LIMITES_VALIDOS]}>
                {(limit) => (
                    <button
                        class="settings-segmented__option"
                        classList={{ 'settings-segmented__option--active': gameState.limit === limit }}
                        onClick={() => cambiarLimite(limit)}
                    >
                        {limit}
                    </button>
                )}
            </For>
        </div>
    </SettingsRow>
)

export default LimitSelectItem
