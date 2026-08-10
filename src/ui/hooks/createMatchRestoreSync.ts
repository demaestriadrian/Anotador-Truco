import { createEffect } from 'solid-js'
import { gameState } from '@/infrastructure/adapters/solidGameController'
import { presentationState, fillZone } from '@/ui/store/presentationStore'
import { UMBRAL_BUENAS } from '@/core/domain/constants'

// Fósforos visibles en la zona para un score dado: en malas se ven todos los puntos; al entrar a
// buenas la zona se vació (ZONE_RESET) y muestra solo las buenas (score − umbral).
const visibleMatches = (score: number): number =>
    score <= UMBRAL_BUENAS ? score : score - UMBRAL_BUENAS

/**
 * Sincroniza la presentación con una partida RESTAURADA por el core (desde el puerto de
 * persistencia). Corre UNA sola vez, cuando `matchstickSize` deja de ser null (recién ahí se puede
 * posicionar): coloca en cada zona los fósforos que el score restaurado indica, instantáneo
 * (mecanismo `instantSnap`) y sin sonidos. Si la partida arranca en 0-0 no hace nada.
 */
export const createMatchRestoreSync = () => {
    let synced = false

    createEffect(() => {
        if (synced || !presentationState.matchstickSize) return
        synced = true

        fillZone('A', false, visibleMatches(gameState.teams.team_a.score))
        fillZone('B', false, visibleMatches(gameState.teams.team_b.score))
    })
}
