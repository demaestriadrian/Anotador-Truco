import { onMount, onCleanup } from 'solid-js'
import { onGameEvent } from '@/infrastructure/adapters/solidGameController'
import { clearZone, fillZone } from '@/ui/store/presentationStore'
import type { TeamId } from '@/core/domain/constants'

const teamToZone = (id: TeamId): 'A' | 'B' => id === 'team_a' ? 'A' : 'B'

/**
 * Puente Core → UI: traduce los eventos de dominio del core en acciones de presentación.
 * La UI solo REACCIONA (no decide cuándo resetear). Acá vive el mapeo evento/razón → animación,
 * que es el punto de extensión visual (OCP): una nueva transición se agrega mapeando otra razón.
 */
export const createCoreResetBridge = () => {
    onMount(() => {
        const unsubscribe = onGameEvent((event) => {
            switch (event.type) {
                case 'ZONE_RESET':
                    clearZone(teamToZone(event.teamId), true)   // recoge los fósforos de la zona (animado)
                    break
                case 'ZONE_FILL':
                    fillZone(teamToZone(event.teamId), true)    // rellena la zona a 15 / malas completas (animado)
                    break
            }
        })
        onCleanup(unsubscribe)
    })
}
