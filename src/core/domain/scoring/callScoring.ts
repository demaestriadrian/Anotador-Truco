import type {
    CallSequence,
    GameRules,
    ScoreEntry,
    TeamId,
} from '@/core/domain/types'

import { calculateTrucoPoints } from './trucoScoring'
import { calculateEnvidoPoints } from './envidoScoring'
import { calculateFlorPoints } from './florScoring'

/**
 * Procesa una CallSequence resuelta y devuelve el ScoreEntry
 * listo para aplicar a la partida.
 * El `id` y `timestamp` los asigna la entidad Match al persistirlo.
 */
export function resolveCallSequence(
    sequence: CallSequence,
    scores: Record<TeamId, number>,
    rules: GameRules,
): Omit<ScoreEntry, 'id' | 'timestamp'> {
    if (sequence.category === 'Truco') {
        return {
            team: sequence.winnerTeam,
            points: calculateTrucoPoints(sequence),
            reason: 'truco',
            callSequence: sequence,
        }
    }

    if (sequence.category === 'Flor') {
        const isContraFlorAlResto = sequence.steps.some(s => s.type === 'ContraFlorAlResto')
        const isContraFlor = sequence.steps.some(s => s.type === 'ContraFlor') && !isContraFlorAlResto
        const { points, winsMatch } = calculateFlorPoints(sequence, scores, rules)

        return {
            team: sequence.winnerTeam,
            points,
            reason: isContraFlorAlResto 
                ? 'contra_flor_al_resto' 
                : isContraFlor 
                    ? 'contra_flor' 
                    : 'flor',
            callSequence: sequence,
            ...(winsMatch && { winsMatch: true }),
        }
    }

    const isFaltaEnvido = sequence.steps.some(s => s.type === 'FaltaEnvido')
    const { points, winsMatch } = calculateEnvidoPoints(sequence, scores, rules)

    return {
        team: sequence.winnerTeam,
        points,
        reason: isFaltaEnvido ? 'falta_envido' : 'envido',
        callSequence: sequence,
        ...(winsMatch && { winsMatch: true }),
    }
}
