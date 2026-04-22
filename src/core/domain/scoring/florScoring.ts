import type { CallSequence, FlorCallType, GameRules, TeamId } from '@/core/domain/types'
import { resolveAlRestoAccepted, type SequenceResult } from './commonScoring'

const FLOR_ACCEPTED_POINTS: Record<Exclude<FlorCallType, 'ContraFlorAlResto'>, number> = {
    Flor: 4, // Choque de flores querido (Con flor quiero)
    ContraFlor: 6, // ContraFlor querida
}

const FLOR_REJECTED_POINTS: Record<FlorCallType, number> = {
    Flor: 3, // Con flor me achico (Rechazo a la Flor inicial)
    ContraFlor: 4, // Rechazo a la ContraFlor
    ContraFlorAlResto: 6, // Rechazo a la ContraFlor al Resto
}

export function calculateFlorPoints(
    sequence: CallSequence,
    scores: Record<TeamId, number>,
    rules: GameRules,
): SequenceResult {
    const { steps, accepted } = sequence
    if (steps.length === 0) return { points: 0, winsMatch: false }

    const lastCall = steps.at(-1)!.type as FlorCallType

    if (accepted) {
        if (lastCall === 'ContraFlorAlResto') {
            // Contra Flor Al Resto funciona igual que la Falta Envido en cuanto a lógica de puntos
            return resolveAlRestoAccepted(scores, rules)
        }
        
        if (lastCall === 'Flor' && steps.length === 1) {
            // Solo una flor cantada y no respondida (el rival no tiene flor)
            return { points: 3, winsMatch: false }
        }

        // Choque de flores querido (4) o ContraFlor querida (6)
        return { 
            points: FLOR_ACCEPTED_POINTS[lastCall as Exclude<FlorCallType, 'ContraFlorAlResto'>], 
            winsMatch: false 
        }
    }

    // No Querido (Achique)
    // En la Flor, los puntos de rechazo dependen directamente de cuál fue el último canto
    return { points: FLOR_REJECTED_POINTS[lastCall], winsMatch: false }
}
