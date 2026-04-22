import { GameSession } from '@/core/domain/entities/GameSession'
import { DEFAULT_RULES } from '@/core/domain/constants'
import type { IGameCore } from '@/core/domain/ports/interfaces'
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

export class GameService implements IGameCore {
    private session: GameSession

    constructor(
        teamAName: string = 'Nosotros',
        teamBName: string = 'Ellos',
        rules: GameRules = DEFAULT_RULES
    ) {
        this.session = new GameSession(teamAName, teamBName, rules)
    }

    // ─── Gestión de partidas ───

    startNewMatch(): MatchState {
        const match = this.session.startNewMatch()
        return match.getState()
    }

    finishCurrentMatch(): void {
        this.session.finishCurrentMatch()
    }

    // ─── Manos ───

    startNewRound(dealerTeam: TeamId): Round {
        const match = this.session.currentMatch
        if (!match) throw new Error('No hay partida en curso')
        return match.startNewRound(dealerTeam)
    }

    finishCurrentRound(): void {
        const match = this.session.currentMatch
        if (!match) throw new Error('No hay partida en curso')
        match.finishCurrentRound()
    }

    // ─── Anotaciones ───

    applyManualScore(team: TeamId, points: number): ScoreEntryResult {
        const match = this.session.currentMatch
        if (!match) throw new Error('No hay partida en curso')
        return match.applyManualScore(team, points)
    }

    applyCallSequence(sequence: CallSequence, winnerTeam: TeamId): ScoreEntryResult {
        const match = this.session.currentMatch
        if (!match) throw new Error('No hay partida en curso')
        return match.applyCallSequence(sequence, winnerTeam)
    }

    undoLastEntry(): ScoreEntryResult {
        const match = this.session.currentMatch
        if (!match) throw new Error('No hay partida en curso')
        return match.undoLastEntry()
    }

    // ─── Consultas ───

    getCurrentMatch(): MatchState | null {
        return this.session.currentMatch?.getState() ?? null
    }

    getMatchHistory(): MatchState[] {
        return this.session.getMatchHistoryStates()
    }

    getScoreHistory(): ScoreEntry[] {
        const match = this.session.currentMatch
        if (!match) return []
        return [...match.entries]
    }

    getRounds(): Round[] {
        const match = this.session.currentMatch
        if (!match) return []
        return [...match.rounds]
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

