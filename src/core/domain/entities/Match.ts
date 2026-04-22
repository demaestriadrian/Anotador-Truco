import { Team } from './Team'
import { DEFAULT_RULES } from '@/core/domain/constants'
import { resolveCallSequence } from '@/core/domain/scoring/callScoring'
import type {
    GameRules,
    TeamId,
    ScoreEntry,
    ScoreEntryResult,
    CallSequence,
    Round,
    MatchState,
    MatchStatus,
} from '@/core/domain/types'

export class Match {
    readonly id: string
    private _teamA: Team
    private _teamB: Team
    private _rules: GameRules
    private _scoreA: number = 0
    private _scoreB: number = 0
    private _entries: ScoreEntry[] = []
    private _rounds: Round[] = []
    private _currentRound: Round | null = null
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
    get entries(): ReadonlyArray<ScoreEntry> { return this._entries }
    get rounds(): ReadonlyArray<Round> { return this._rounds }
    get currentRound(): Round | null { return this._currentRound }

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

    // ─── Manos ───

    startNewRound(dealerTeam: TeamId): Round {
        if (this._currentRound?.status === 'playing') {
            this.finishCurrentRound()
        }

        const round: Round = {
            id: crypto.randomUUID(),
            roundNumber: this._rounds.length + 1,
            dealerTeam,
            envidoSequence: null,
            trucoSequence: null,
            scoreEntries: [],
            status: 'playing',
            startedAt: Date.now(),
            finishedAt: null,
        }

        this._currentRound = round
        return round
    }

    finishCurrentRound(): void {
        if (!this._currentRound) return
        this._currentRound.status = 'finished'
        this._currentRound.finishedAt = Date.now()
        this._rounds.push(this._currentRound)
        this._currentRound = null
    }

    // ─── Anotaciones ───

    applyManualScore(team: TeamId, points: number): ScoreEntryResult {
        if (this._status === 'finished') {
            return this.buildResult(false, 'game_finished')
        }
        if (points <= 0) {
            return this.buildResult(false, 'invalid_points')
        }

        const entry: ScoreEntry = {
            id: crypto.randomUUID(),
            team,
            points,
            reason: 'manual',
            timestamp: Date.now(),
        }

        return this.applyEntry(entry)
    }

    applyCallSequence(sequence: CallSequence, winnerTeam: TeamId): ScoreEntryResult {
        if (this._status === 'finished') {
            return this.buildResult(false, 'game_finished')
        }

        const partial = resolveCallSequence(
            { ...sequence, winnerTeam },
            { A: this._scoreA, B: this._scoreB },
            this._rules,
        )

        const entry: ScoreEntry = {
            ...partial,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        }

        if (this._currentRound) {
            if (sequence.category === 'Envido') {
                this._currentRound.envidoSequence = { ...sequence, winnerTeam }
            } else {
                this._currentRound.trucoSequence = { ...sequence, winnerTeam }
            }
            this._currentRound.scoreEntries.push(entry)
        }

        return this.applyEntry(entry)
    }

    undoLastEntry(): ScoreEntryResult {
        if (this._entries.length === 0) {
            return this.buildResult(false)
        }

        const last = this._entries[this._entries.length - 1]

        this.setScore(last.team, this.getScore(last.team) - last.points)
        this._entries.pop()

        // Retirar también de la mano actual si corresponde
        if (this._currentRound) {
            const entries = this._currentRound.scoreEntries
            const idx = entries.reduceRight((found, e: ScoreEntry, i) => found === -1 && e.id === last.id ? i : found, -1)
            if (idx !== -1) {
                this._currentRound.scoreEntries.splice(idx, 1)
                if (last.callSequence?.category === 'Envido') {
                    this._currentRound.envidoSequence = null
                } else if (last.callSequence?.category === 'Truco') {
                    this._currentRound.trucoSequence = null
                }
            }
        }

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
            entries: [...this._entries],
            rounds: [...this._rounds, ...(this._currentRound ? [this._currentRound] : [])],
            startedAt: this._startedAt,
            finishedAt: this._finishedAt,
        }
    }

    // ─── Privados ───

    private applyEntry(entry: ScoreEntry): ScoreEntryResult {
        const currentScore = this.getScore(entry.team)
        const newScore = Math.min(currentScore + entry.points, this._rules.scoreLimit)
        this.setScore(entry.team, newScore)
        this._entries.push(entry)
        this.checkWinner()
        return this.buildResult(true)
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

    private buildResult(accepted: boolean, reason?: ScoreEntryResult['reason']): ScoreEntryResult {
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

