import { GameSession } from '@/core/domain/entities/GameSession'
import { DEFAULT_RULES } from '@/core/domain/constants'
import type { IGameCore } from '@/core/domain/ports/interfaces'
import type { TeamId, GameRules, MoveResult, Move, MatchState, SessionState } from '@/core/domain/types'

export class GameService implements IGameCore {
    private session: GameSession

    constructor(
        teamAName: string = 'Nosotros',
        teamBName: string = 'Ellos',
        rules: GameRules = DEFAULT_RULES
    ) {
        this.session = new GameSession(teamAName, teamBName, rules)
    }

    // ─── Partida actual ───

    addPoint(team: TeamId): MoveResult {
        const match = this.session.currentMatch
        if (!match) throw new Error('No hay partida en curso')
        return match.addPoint(team)
    }

    removePoint(team: TeamId): MoveResult {
        const match = this.session.currentMatch
        if (!match) throw new Error('No hay partida en curso')
        return match.removePoint(team)
    }

    undoLastMove(): MoveResult {
        const match = this.session.currentMatch
        if (!match) throw new Error('No hay partida en curso')
        return match.undoLastMove()
    }

    // ─── Gestión de partidas ───

    startNewMatch(): MatchState {
        const match = this.session.startNewMatch()
        return match.getState()
    }

    finishCurrentMatch(): void {
        this.session.finishCurrentMatch()
    }

    // ─── Consultas ───

    getCurrentMatch(): MatchState | null {
        return this.session.currentMatch?.getState() ?? null
    }

    getMatchHistory(): MatchState[] {
        return this.session.getMatchHistoryStates()
    }

    getMoveHistory(): Move[] {
        const match = this.session.currentMatch
        if (!match) return []
        return [...match.moves]
    }

    getSessionState(): SessionState {
        return this.session.getState()
    }

    // ─── Configuración ───

    setTeamName(team: TeamId, name: string): void {
        this.session.setTeamName(team, name)
    }

    setRules(rules: Partial<GameRules>): void {
        this.session.setRules(rules)
    }

    resetSession(): void {
        const state = this.session.getState()
        this.session = new GameSession(
            state.teamAName,
            state.teamBName,
            state.rules
        )
    }
}
