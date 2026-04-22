export type TeamId = 'A' | 'B'

export type MatchStatus = 'playing' | 'finished'

export interface GameRules {
    scoreLimit: 15 | 30
    useMalas: boolean
    malasThreshold: number
    useFlor: boolean
}

// ─── Cantos ──────────────────────────────────────────────────────────────────

/** Cantos de Truco: escalonados, no acumulativos */
export type TrucoCallType = 'Truco' | 'Retruco' | 'ValeCuatro'

/** Cantos de Envido: acumulativos cuando son aceptados */
export type EnvidoCallType = 'Envido' | 'RealEnvido' | 'FaltaEnvido'

/** Cantos de Flor: especiales, reemplazan al envido cuando aplican */
export type FlorCallType = 'Flor' | 'ContraFlor' | 'ContraFlorAlResto'

export type CallType = TrucoCallType | EnvidoCallType | FlorCallType
export type CallCategory = 'Truco' | 'Envido' | 'Flor'

/** Un paso individual dentro de la secuencia: quién cantó qué */
export interface CallStep {
    type: CallType
    callingTeam: TeamId
}

/**
 * Secuencia completa de cantos de una categoría (Truco o Envido)
 * con su resolución final y el equipo que cobra los puntos.
 * accepted: true = Querido, false = No Querido
 */
export interface CallSequence {
    category: CallCategory
    steps: CallStep[]
    accepted: boolean
    winnerTeam: TeamId
}

// ─── ScoreEntry (reemplaza a Move) ───────────────────────────────────────────

export type ScoreEntryReason =
    | 'truco'
    | 'envido'
    | 'falta_envido'
    | 'flor'
    | 'contra_flor'
    | 'contra_flor_al_resto'
    | 'manual'

/** Reemplaza a `Move`. Registra cuántos puntos, a qué equipo y por qué. */
export interface ScoreEntry {
    id: string
    team: TeamId
    points: number
    reason: ScoreEntryReason
    callSequence?: CallSequence
    winsMatch?: true
    timestamp: number
}

/** Reemplaza a `MoveResult` */
export interface ScoreEntryResult {
    accepted: boolean
    reason?: 'game_finished' | 'score_at_zero' | 'score_at_limit' | 'invalid_points'
    scoreA: number
    scoreB: number
    status: MatchStatus
    winner: TeamId | null
    teamAInMalas: boolean
    teamBInMalas: boolean
}

// ─── Round (Mano) ─────────────────────────────────────────────────────────────

export type RoundStatus = 'playing' | 'finished'

/**
 * Representa una mano: ronda donde se reparten cartas.
 * El envido es opcional y siempre precede al truco.
 */
export interface Round {
    id: string
    roundNumber: number
    dealerTeam: TeamId
    envidoSequence: CallSequence | null
    florSequence: CallSequence | null
    trucoSequence: CallSequence | null
    scoreEntries: ScoreEntry[]
    status: RoundStatus
    startedAt: number
    finishedAt: number | null
}

// ─── MatchState ───────────────────────────────────────────────────────────────

export interface MatchState {
    id: string
    scoreA: number
    scoreB: number
    status: MatchStatus
    winner: TeamId | null
    rules: GameRules
    entries: ScoreEntry[]
    rounds: Round[]
    startedAt: number
    finishedAt: number | null
}

export interface SessionState {
    id: string
    teamAName: string
    teamBName: string
    rules: GameRules
    currentMatch: MatchState | null
    matchHistory: MatchState[]
    createdAt: number
}
