import { Show, createEffect } from 'solid-js'
import confetti from 'canvas-confetti'
import { gameState, finalizarPartida } from '@/infrastructure/adapters/solidGameController'
import { victory, hideVictory } from '@/ui/store/victoryStore'

// Dispara una andanada de confeti celebratoria: un estallido central + chorros laterales por ~1.2s.
const lanzarConfeti = () => {
    confetti({ particleCount: 140, spread: 90, startVelocity: 45, origin: { y: 0.6 } })

    const fin = Date.now() + 1200
    const tick = () => {
        confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } })
        confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } })
        if (Date.now() < fin) requestAnimationFrame(tick)
    }
    tick()
}

/**
 * Modal de victoria: reacciona al estado de presentación `victory()` (seteado por el puente de ciclo
 * de vida ante el evento MATCH_VICTORY del core). Anuncia al ganador y ofrece:
 * - "Nueva Partida": finaliza definitivamente y resetea ambos a 0.
 * - "✕" (cerrar): solo descarta el anuncio; el puntaje del ganador queda fijo en el límite. Si se
 *   intenta sumar otro punto, el core lo bloquea y re-emite MATCH_VICTORY → el modal vuelve a aparecer.
 */
const VictoryModal = () => {
    // Lanza el confeti cada vez que se abre el modal (transición de oculto → visible).
    createEffect(() => {
        if (victory()) lanzarConfeti()
    })

    return (
        <Show when={victory()}>
            {(v) => (
                // El overlay cubre toda la pantalla e intercepta los pointer events (touch-action:none),
                // así no se anotan puntos "por detrás" mientras el modal está abierto.
                <div class="victory-overlay" style={{ 'touch-action': 'none' }}>
                    <div class="victory-card">
                        <button
                            class="victory-card__close"
                            aria-label="Cerrar"
                            onClick={() => hideVictory()}
                        >
                            ✕
                        </button>
                        <p class="victory-card__eyebrow">¡Partida terminada!</p>
                        <h2 class="victory-card__winner">Ganó {gameState.teams[v().teamId].name}</h2>
                        <div class="victory-card__actions">
                            <button
                                class="victory-btn victory-btn--primary"
                                onClick={() => finalizarPartida()}
                            >
                                Nueva Partida
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Show>
    )
}

export default VictoryModal
