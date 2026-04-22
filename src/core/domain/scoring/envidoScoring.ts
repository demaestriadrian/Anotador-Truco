import type { CallSequence, CallStep, EnvidoCallType, GameRules, TeamId } from '@/core/domain/types'
import { resolveAlRestoAccepted, type SequenceResult } from './commonScoring'

const ENVIDO_CALL_POINTS: Record<Exclude<EnvidoCallType, 'FaltaEnvido'>, number> = {
    Envido: 2,
    RealEnvido: 3,
}

export function calculateEnvidoPoints(
    sequence: CallSequence,
    scores: Record<TeamId, number>,
    rules: GameRules,
): SequenceResult {
    const { steps, accepted } = sequence
    if (steps.length === 0) return { points: 0, winsMatch: false }

    const hasFaltaEnvido = steps.some(s => s.type === 'FaltaEnvido')

    if (accepted) {
        if (hasFaltaEnvido) {
            return resolveAlRestoAccepted(scores, rules)
        }
        // Acumulación normal: suma todos los cantos aceptados
        const total = steps.reduce(
            (acc, step) =>
                acc + (ENVIDO_CALL_POINTS[step.type as Exclude<EnvidoCallType, 'FaltaEnvido'>] ?? 0),
            0,
        )
        return { points: total, winsMatch: false }
    }

    // No Querido
    return resolveEnvidoRejected(steps)
}

function resolveEnvidoRejected(steps: CallStep[]): SequenceResult {
    if (steps.length === 1) {
        // Primer canto rechazado: caso especial → 1p al cantador
        return { points: 1, winsMatch: false }
    }

    // Suma todos los cantos EXCEPTO el último (que fue rechazado)
    // FaltaEnvido rechazada aplica la misma regla
    const points = steps
        .slice(0, -1)
        .reduce(
            (acc, step) =>
                acc + (ENVIDO_CALL_POINTS[step.type as Exclude<EnvidoCallType, 'FaltaEnvido'>] ?? 0),
            0,
        )

    return { points, winsMatch: false }
}
