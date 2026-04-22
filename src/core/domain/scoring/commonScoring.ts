import type { GameRules, TeamId } from '@/core/domain/types'

export interface SequenceResult {
    points: number
    winsMatch: boolean
}

export function resolveAlRestoAccepted(
    scores: Record<TeamId, number>,
    rules: GameRules,
): SequenceResult {
    const aInBuenas = scores.A >= rules.malasThreshold
    const bInBuenas = scores.B >= rules.malasThreshold

    if (!aInBuenas && !bInBuenas) {
        // Ninguno en Buenas → el ganador gana la partida directamente
        return { points: rules.scoreLimit, winsMatch: true }
    }

    // Al menos uno en Buenas → el ganador se lleva lo que le falta al puntero
    const leadingScore = Math.max(scores.A, scores.B)
    return { points: rules.scoreLimit - leadingScore, winsMatch: false }
}
