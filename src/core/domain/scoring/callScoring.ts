import type {
    CallSequence,
    CallStep,
    EnvidoCallType,
    FlorCallType,
    GameRules,
    ScoreEntry,
    TeamId,
    TrucoCallType,
} from '@/core/domain/types'

// ─── Tablas de puntos ────────────────────────────────────────────────────────

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

const ENVIDO_CALL_POINTS: Record<Exclude<EnvidoCallType, 'FaltaEnvido'>, number> = {
    Envido: 2,
    RealEnvido: 3,
}

const FLOR_ACCEPTED_POINTS: Record<Exclude<FlorCallType, 'ContraFlorAlResto'>, number> = {
    Flor: 4, // Choque de flores querido (Con flor quiero)
    ContraFlor: 6, // ContraFlor querida
}

const FLOR_REJECTED_POINTS: Record<FlorCallType, number> = {
    Flor: 3, // Con flor me achico (Rechazo a la Flor inicial)
    ContraFlor: 4, // Rechazo a la ContraFlor
    ContraFlorAlResto: 6, // Rechazo a la ContraFlor al Resto
}

// ─── Truco ───────────────────────────────────────────────────────────────────

function calculateTrucoPoints(sequence: CallSequence): number {
    if (sequence.steps.length === 0) return 1 // Base: nadie cantó truco

    const lastCall = sequence.steps.at(-1)!.type as TrucoCallType

    return sequence.accepted
        ? TRUCO_ACCEPTED_POINTS[lastCall]
        : TRUCO_REJECTION_POINTS[lastCall]
}

// ─── Envido ───────────────────────────────────────────────────────────────────

interface EnvidoResult {
    points: number
    winsMatch: boolean
}

function calculateEnvidoPoints(
    sequence: CallSequence,
    scores: Record<TeamId, number>,
    rules: GameRules,
): EnvidoResult {
    const { steps, accepted } = sequence
    if (steps.length === 0) return { points: 0, winsMatch: false }

    const hasFaltaEnvido = steps.some(s => s.type === 'FaltaEnvido')

    if (accepted) {
        if (hasFaltaEnvido) {
            return resolveFaltaEnvidoAccepted(scores, rules)
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

function resolveFaltaEnvidoAccepted(
    scores: Record<TeamId, number>,
    rules: GameRules,
): EnvidoResult {
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

function resolveEnvidoRejected(steps: CallStep[]): EnvidoResult {
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

// ─── Flor ────────────────────────────────────────────────────────────────────

function calculateFlorPoints(
    sequence: CallSequence,
    scores: Record<TeamId, number>,
    rules: GameRules,
): EnvidoResult {
    const { steps, accepted } = sequence
    if (steps.length === 0) return { points: 0, winsMatch: false }

    const lastCall = steps.at(-1)!.type as FlorCallType

    if (accepted) {
        if (lastCall === 'ContraFlorAlResto') {
            // Contra Flor Al Resto funciona igual que la Falta Envido en cuanto a lógica de puntos
            return resolveFaltaEnvidoAccepted(scores, rules)
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

// ─── API pública ─────────────────────────────────────────────────────────────

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
