import type {
    TeamId,
    GameRules,
    CallSequence,
    ScoreEntry,
    ScoreEntryResult,
    Round,
    MatchState,
    SessionState,
} from '@/core/domain/types'

// Nota: ISyncPort usa ScoreEntryResult en lugar del obsoleto MoveResult

export interface IGameCore {
    // ─── Gestión de partidas ───
    startNewMatch(): MatchState
    finishCurrentMatch(): void

    // ─── Manos ───
    startNewRound(dealerTeam: TeamId): Round
    finishCurrentRound(): void

    // ─── Anotaciones ───
    applyManualScore(team: TeamId, points: number): ScoreEntryResult
    applyCallSequence(sequence: CallSequence, winnerTeam: TeamId): ScoreEntryResult
    undoLastEntry(): ScoreEntryResult

    // ─── Consultas ───
    getCurrentMatch(): MatchState | null
    getMatchHistory(): MatchState[]
    getScoreHistory(): ScoreEntry[]
    getRounds(): Round[]
    getSessionState(): SessionState

    // ─── Configuración ───
    setTeamName(team: TeamId, name: string): void
    setRules(rules: Partial<GameRules>): void
    resetSession(): void
}

export interface ISyncPort {
    sendEntry(result: ScoreEntryResult): Promise<void>
    onRemoteEntry(handler: (result: ScoreEntryResult) => void): void
    disconnect(): void
}
