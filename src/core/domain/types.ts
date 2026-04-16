export type TeamId = 'A' | 'B'

export type MatchStatus = 'playing' | 'finished'

export interface GameRules {
    scoreLimit: 15 | 30
    useMalas: boolean
    malasThreshold: number
}

export interface Move {
    id: string
    action: 'add' | 'remove'
    team: TeamId
    timestamp: number
}

export interface MoveResult {
    accepted: boolean
    reason?: 'game_finished' | 'score_at_zero' | 'score_at_limit'
    scoreA: number
    scoreB: number
    status: MatchStatus
    winner: TeamId | null
    teamAInMalas: boolean
    teamBInMalas: boolean
}

export interface MatchState {
    id: string
    scoreA: number
    scoreB: number
    status: MatchStatus
    winner: TeamId | null
    rules: GameRules
    moves: Move[]
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
