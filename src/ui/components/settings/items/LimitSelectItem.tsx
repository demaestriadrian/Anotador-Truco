import { For } from 'solid-js'
import { gameState, cambiarLimite } from '@/infrastructure/adapters/solidGameController'
import { LIMITES_VALIDOS } from '@/core/domain/constants'

// Ítem: límite de puntaje de la partida (15/30). Itera los límites válidos del DOMINIO
// (no hardcodea): agregar un límite nuevo al core lo muestra acá automáticamente.
const LimitSelectItem = () => (
    <div class="settings-item">
        <span class="settings-item__label">Puntaje total</span>
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
    </div>
)

export default LimitSelectItem
