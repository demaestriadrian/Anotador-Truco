import { onMount, onCleanup } from 'solid-js'
import { onGameEvent } from '@/infrastructure/adapters/solidGameController'
import { showVictory, hideVictory } from '@/ui/store/victoryStore'
import { playSound } from '@/ui/audio/soundPlayer'
import { MATCH_FINALIZED_LISTENERS } from '@/ui/lifecycle/matchFinalizedListeners'

/**
 * Puente Core → UI del CICLO DE VIDA de la partida (hermano de `createCoreResetBridge`, que maneja
 * las zonas de fósforos). La UI solo REACCIONA a los eventos del core:
 * - MATCH_VICTORY        → muestra el modal de ganador.
 * - MATCH_VICTORY_UNDONE → lo cierra (se deshizo el punto).
 * - MATCH_FINALIZED      → dispara el pipeline de listeners independientes (limpiar tablero, etc.).
 */
export const createMatchLifecycleBridge = () => {
    onMount(() => {
        const unsubscribe = onGameEvent((event) => {
            switch (event.type) {
                case 'MATCH_VICTORY':
                    showVictory(event.teamId)
                    playSound('winner')
                    break
                case 'MATCH_VICTORY_UNDONE':
                    hideVictory()
                    break
                case 'MATCH_FINALIZED':
                    MATCH_FINALIZED_LISTENERS.forEach((run) => run(event.winnerId))
                    break
            }
        })
        onCleanup(unsubscribe)
    })
}
