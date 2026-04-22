import type { CallSequence, TrucoCallType } from '@/core/domain/types'

const TRUCO_ACCEPTED_POINTS: Record<TrucoCallType, number> = {
    Truco: 2,
    Retruco: 3,
    ValeCuatro: 4,
}

/**
 * Puntos del nivel inmediatamente anterior: los que cobra el cantador
 * cuando su canto es rechazado (No Querido).
 */
const TRUCO_REJECTION_POINTS: Record<TrucoCallType, number> = {
    Truco: 1,       // anterior a Truco = base (sin cantos)
    Retruco: 2,     // anterior a Retruco = Truco
    ValeCuatro: 3,  // anterior a ValeCuatro = Retruco
}

export function calculateTrucoPoints(sequence: CallSequence): number {
    if (sequence.steps.length === 0) return 1 // Base: nadie cantó truco

    const lastCall = sequence.steps.at(-1)!.type as TrucoCallType

    return sequence.accepted
        ? TRUCO_ACCEPTED_POINTS[lastCall]
        : TRUCO_REJECTION_POINTS[lastCall]
}
