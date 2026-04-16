import { Match } from './Match'
import { DEFAULT_RULES } from '@/core/domain/constants'
import type { GameRules, MatchState, SessionState } from '@/core/domain/types'

export class GameSession {
    readonly id: string
    private _teamAName: string
    private _teamBName: string
    private _rules: GameRules
    private _currentMatch: Match | null = null
    private _matchHistory: Match[] = []
    private _createdAt: number

    constructor(
        teamAName: string = 'Nosotros',
        teamBName: string = 'Ellos',
        rules: GameRules = DEFAULT_RULES,
        id?: string
    ) {
        this.id = id ?? crypto.randomUUID()
        this._teamAName = teamAName
        this._teamBName = teamBName
        this._rules = { ...rules }
        this._createdAt = Date.now()
    }

    // ─── Getters ───

    get teamAName(): string { return this._teamAName }
    get teamBName(): string { return this._teamBName }
    get rules(): GameRules { return this._rules }
    get currentMatch(): Match | null { return this._currentMatch }
    get matchHistory(): ReadonlyArray<Match> { return this._matchHistory }

    // ─── Comandos ───

    startNewMatch(): Match {
        // Si hay una partida en curso terminada, archivarla
        if (this._currentMatch && this._currentMatch.status === 'finished') {
            this._matchHistory.push(this._currentMatch)
        }

        this._currentMatch = new Match(
            this._teamAName,
            this._teamBName,
            this._rules
        )

        return this._currentMatch
    }

    finishCurrentMatch(): void {
        if (!this._currentMatch) return

        if (this._currentMatch.status === 'playing') {
            // Forzar archivo aunque no haya ganador (abandono)
            this._matchHistory.push(this._currentMatch)
        } else {
            this._matchHistory.push(this._currentMatch)
        }

        this._currentMatch = null
    }

    setTeamName(team: 'A' | 'B', name: string): void {
        if (team === 'A') this._teamAName = name.trim()
        else this._teamBName = name.trim()
    }

    setRules(rules: Partial<GameRules>): void {
        this._rules = { ...this._rules, ...rules }
    }

    // ─── Snapshot ───

    getState(): SessionState {
        return {
            id: this.id,
            teamAName: this._teamAName,
            teamBName: this._teamBName,
            rules: { ...this._rules },
            currentMatch: this._currentMatch?.getState() ?? null,
            matchHistory: this._matchHistory.map(m => m.getState()),
            createdAt: this._createdAt,
        }
    }

    getMatchHistoryStates(): MatchState[] {
        return this._matchHistory.map(m => m.getState())
    }
}
