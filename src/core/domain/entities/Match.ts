import { Team } from './Team'
import { DEFAULT_RULES } from '@/core/domain/constants'
import type { GameRules, TeamId, Move, MoveResult, MatchState, MatchStatus } from '@/core/domain/types'

export class Match {
    readonly id: string
    private _teamA: Team
    private _teamB: Team
    private _rules: GameRules
    private _scoreA: number = 0
    private _scoreB: number = 0
    private _moves: Move[] = []
    private _status: MatchStatus = 'playing'
    private _winner: TeamId | null = null
    private _startedAt: number
    private _finishedAt: number | null = null

    constructor(
        teamAName: string = 'Nosotros',
        teamBName: string = 'Ellos',
        rules: GameRules = DEFAULT_RULES,
        id?: string
    ) {
        this.id = id ?? crypto.randomUUID()
        this._teamA = new Team('A', teamAName)
        this._teamB = new Team('B', teamBName)
        this._rules = { ...rules }
        this._startedAt = Date.now()
    }

    // ─── Getters ───

    get teamA(): Team { return this._teamA }
    get teamB(): Team { return this._teamB }
    get scoreA(): number { return this._scoreA }
    get scoreB(): number { return this._scoreB }
    get rules(): GameRules { return this._rules }
    get status(): MatchStatus { return this._status }
    get winner(): TeamId | null { return this._winner }
    get moves(): ReadonlyArray<Move> { return this._moves }

    // ─── Queries ───

    isInMalas(team: TeamId): boolean {
        if (!this._rules.useMalas) return false
        const score = team === 'A' ? this._scoreA : this._scoreB
        return score < this._rules.malasThreshold
    }

    private getScore(team: TeamId): number {
        return team === 'A' ? this._scoreA : this._scoreB
    }

    private setScore(team: TeamId, value: number): void {
        if (team === 'A') this._scoreA = value
        else this._scoreB = value
    }

    // ─── Comandos ───

    addPoint(team: TeamId): MoveResult {
        if (this._status === 'finished') {
            return this.buildResult(false, 'game_finished')
        }

        const currentScore = this.getScore(team)
        if (currentScore >= this._rules.scoreLimit) {
            return this.buildResult(false, 'score_at_limit')
        }

        this.setScore(team, currentScore + 1)
        this.recordMove('add', team)
        this.checkWinner()

        return this.buildResult(true)
    }

    removePoint(team: TeamId): MoveResult {
        if (this._status === 'finished') {
            return this.buildResult(false, 'game_finished')
        }

        const currentScore = this.getScore(team)
        if (currentScore <= 0) {
            return this.buildResult(false, 'score_at_zero')
        }

        this.setScore(team, currentScore - 1)
        this.recordMove('remove', team)

        return this.buildResult(true)
    }

    undoLastMove(): MoveResult {
        if (this._moves.length === 0) {
            return this.buildResult(false)
        }

        const lastMove = this._moves[this._moves.length - 1]

        // Revertir: si fue 'add' restamos, si fue 'remove' sumamos
        if (lastMove.action === 'add') {
            this.setScore(lastMove.team, this.getScore(lastMove.team) - 1)
        } else {
            this.setScore(lastMove.team, this.getScore(lastMove.team) + 1)
        }

        this._moves.pop()

        // Si la partida estaba terminada, reabrirla
        if (this._status === 'finished') {
            this._status = 'playing'
            this._winner = null
            this._finishedAt = null
        }

        return this.buildResult(true)
    }

    // ─── Snapshot ───

    getState(): MatchState {
        return {
            id: this.id,
            scoreA: this._scoreA,
            scoreB: this._scoreB,
            status: this._status,
            winner: this._winner,
            rules: { ...this._rules },
            moves: [...this._moves],
            startedAt: this._startedAt,
            finishedAt: this._finishedAt,
        }
    }

    // ─── Privados ───

    private recordMove(action: 'add' | 'remove', team: TeamId): void {
        this._moves.push({
            id: crypto.randomUUID(),
            action,
            team,
            timestamp: Date.now(),
        })
    }

    private checkWinner(): void {
        if (this._scoreA >= this._rules.scoreLimit) {
            this.finish('A')
        } else if (this._scoreB >= this._rules.scoreLimit) {
            this.finish('B')
        }
    }

    private finish(winner: TeamId): void {
        this._status = 'finished'
        this._winner = winner
        this._finishedAt = Date.now()
    }

    private buildResult(accepted: boolean, reason?: MoveResult['reason']): MoveResult {
        return {
            accepted,
            reason,
            scoreA: this._scoreA,
            scoreB: this._scoreB,
            status: this._status,
            winner: this._winner,
            teamAInMalas: this.isInMalas('A'),
            teamBInMalas: this.isInMalas('B'),
        }
    }
}
