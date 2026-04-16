import type { TeamId, GameRules, MoveResult, Move, MatchState, SessionState } from '@/core/domain/types'

export interface IGameCore {
    // ─── Partida actual ───
    addPoint(team: TeamId): MoveResult
    removePoint(team: TeamId): MoveResult
    undoLastMove(): MoveResult

    // ─── Gestión de partidas ───
    startNewMatch(): MatchState
    finishCurrentMatch(): void

    // ─── Consultas ───
    getCurrentMatch(): MatchState | null
    getMatchHistory(): MatchState[]
    getMoveHistory(): Move[]
    getSessionState(): SessionState

    // ─── Configuración ───
    setTeamName(team: TeamId, name: string): void
    setRules(rules: Partial<GameRules>): void
    resetSession(): void
}

export interface ISyncPort {
    sendMove(result: MoveResult): Promise<void>
    onRemoteMove(handler: (result: MoveResult) => void): void
    disconnect(): void
}
