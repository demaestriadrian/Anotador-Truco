import { describe, it, expect } from 'vitest'
import { Match } from '@/core/domain/entities/Match'
import type { CallSequence, GameRules } from '@/core/domain/types'

const rules30: GameRules = { scoreLimit: 30, useMalas: true, malasThreshold: 15 }
const rules15: GameRules = { scoreLimit: 15, useMalas: false, malasThreshold: 0 }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function trucoSeq(accepted: boolean): CallSequence {
    return {
        category: 'Truco',
        steps: [{ type: 'Truco', callingTeam: 'A' }],
        accepted,
        winnerTeam: 'A',
    }
}

function envidoSeq(accepted: boolean): CallSequence {
    return {
        category: 'Envido',
        steps: [{ type: 'Envido', callingTeam: 'A' }],
        accepted,
        winnerTeam: 'A',
    }
}

describe('Match', () => {

    // ─── Creación ────────────────────────────────────────────────────────────

    it('se crea con scores en 0 y status playing', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        expect(match.scoreA).toBe(0)
        expect(match.scoreB).toBe(0)
        expect(match.status).toBe('playing')
        expect(match.winner).toBeNull()
        expect(match.entries).toHaveLength(0)
    })

    it('genera un id único', () => {
        expect(new Match().id).not.toBe(new Match().id)
    })

    it('usa id personalizado si se provee', () => {
        expect(new Match('A', 'B', rules30, 'custom-id').id).toBe('custom-id')
    })

    // ─── applyManualScore ────────────────────────────────────────────────────

    it('suma puntos manuales al equipo A', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        const result = match.applyManualScore('A', 3)

        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(3)
        expect(result.scoreB).toBe(0)
        expect(match.entries).toHaveLength(1)
        expect(match.entries[0].reason).toBe('manual')
        expect(match.entries[0].points).toBe(3)
        expect(match.entries[0].team).toBe('A')
    })

    it('suma puntos manuales al equipo B', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        const result = match.applyManualScore('B', 2)

        expect(result.accepted).toBe(true)
        expect(result.scoreB).toBe(2)
    })

    it('acumula múltiples anotaciones manuales', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        match.applyManualScore('A', 2)
        match.applyManualScore('A', 3)
        match.applyManualScore('B', 1)
        const result = match.applyManualScore('A', 1)

        expect(result.scoreA).toBe(6)
        expect(result.scoreB).toBe(1)
        expect(match.entries).toHaveLength(4)
    })

    it('rechaza puntos = 0', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        const result = match.applyManualScore('A', 0)

        expect(result.accepted).toBe(false)
        expect(result.reason).toBe('invalid_points')
        expect(match.entries).toHaveLength(0)
    })

    it('rechaza puntos negativos', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        const result = match.applyManualScore('A', -1)

        expect(result.accepted).toBe(false)
        expect(result.reason).toBe('invalid_points')
    })

    // ─── Ganador ─────────────────────────────────────────────────────────────

    it('detecta ganador al llegar al límite (30)', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        match.applyManualScore('A', 29)

        expect(match.status).toBe('playing')

        const result = match.applyManualScore('A', 1)

        expect(result.status).toBe('finished')
        expect(result.winner).toBe('A')
    })

    it('detecta ganador al llegar al límite (15)', () => {
        const match = new Match('Nos', 'Ellos', rules15)
        match.applyManualScore('B', 15)

        expect(match.status).toBe('finished')
        expect(match.winner).toBe('B')
    })

    it('rechaza anotaciones después de que la partida terminó', () => {
        const match = new Match('Nos', 'Ellos', rules15)
        match.applyManualScore('A', 15)

        const result = match.applyManualScore('A', 1)
        expect(result.accepted).toBe(false)
        expect(result.reason).toBe('game_finished')
    })

    it('no supera el scoreLimit aunque los puntos excedan', () => {
        const match = new Match('Nos', 'Ellos', rules15)
        match.applyManualScore('A', 14)
        match.applyManualScore('A', 10)  // se clampa a 15

        expect(match.scoreA).toBe(15)
        expect(match.status).toBe('finished')
    })

    // ─── Malas ───────────────────────────────────────────────────────────────

    it('reporta malas correctamente con reglas a 30', () => {
        const match = new Match('Nos', 'Ellos', rules30)

        expect(match.isInMalas('A')).toBe(true)
        expect(match.isInMalas('B')).toBe(true)

        match.applyManualScore('A', 15)

        expect(match.isInMalas('A')).toBe(false)
        expect(match.isInMalas('B')).toBe(true)
    })

    it('malas desactivadas con reglas a 15', () => {
        const match = new Match('Nos', 'Ellos', rules15)
        expect(match.isInMalas('A')).toBe(false)
        expect(match.isInMalas('B')).toBe(false)
    })

    // ─── undoLastEntry ────────────────────────────────────────────────────────

    it('deshace la última entrada manual', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        match.applyManualScore('A', 2)
        match.applyManualScore('A', 3)

        const result = match.undoLastEntry()

        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(2)
        expect(match.entries).toHaveLength(1)
    })

    it('undo reabre una partida terminada', () => {
        const match = new Match('Nos', 'Ellos', rules15)
        match.applyManualScore('A', 14)
        match.applyManualScore('A', 1)

        expect(match.status).toBe('finished')

        const result = match.undoLastEntry()

        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(14)
        expect(result.status).toBe('playing')
        expect(result.winner).toBeNull()
    })

    it('undo sin entries retorna accepted false', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        const result = match.undoLastEntry()
        expect(result.accepted).toBe(false)
    })

    // ─── applyCallSequence ────────────────────────────────────────────────────

    it('aplica secuencia de truco querida → 2p', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        const result = match.applyCallSequence(trucoSeq(true), 'A')

        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(2)
        expect(match.entries[0].reason).toBe('truco')
    })

    it('aplica secuencia de envido querida → 2p', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        const result = match.applyCallSequence(envidoSeq(true), 'A')

        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(2)
        expect(match.entries[0].reason).toBe('envido')
    })

    it('rechaza applyCallSequence si la partida terminó', () => {
        const match = new Match('Nos', 'Ellos', rules15)
        match.applyManualScore('A', 15)

        const result = match.applyCallSequence(trucoSeq(true), 'A')
        expect(result.accepted).toBe(false)
        expect(result.reason).toBe('game_finished')
    })

    // ─── Manos (Rounds) ──────────────────────────────────────────────────────

    it('inicia una mano correctamente', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        const round = match.startNewRound('A')

        expect(round.roundNumber).toBe(1)
        expect(round.dealerTeam).toBe('A')
        expect(round.status).toBe('playing')
        expect(round.envidoSequence).toBeNull()
        expect(round.trucoSequence).toBeNull()
    })

    it('incrementa el número de mano en cada ronda', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        match.startNewRound('A')
        match.finishCurrentRound()
        const round2 = match.startNewRound('B')

        expect(round2.roundNumber).toBe(2)
        expect(round2.dealerTeam).toBe('B')
    })

    it('registra secuencias en la mano activa', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        match.startNewRound('A')
        match.applyCallSequence(envidoSeq(true), 'A')
        match.applyCallSequence(trucoSeq(true), 'A')

        const state = match.getState()
        const round = state.rounds[0]

        expect(round.envidoSequence?.category).toBe('Envido')
        expect(round.trucoSequence?.category).toBe('Truco')
        expect(round.scoreEntries).toHaveLength(2)
    })

    // ─── Snapshot ────────────────────────────────────────────────────────────

    it('getState retorna un snapshot completo', () => {
        const match = new Match('Nos', 'Ellos', rules30, 'test-id')
        match.applyManualScore('A', 1)
        match.applyManualScore('B', 1)

        const state = match.getState()

        expect(state.id).toBe('test-id')
        expect(state.scoreA).toBe(1)
        expect(state.scoreB).toBe(1)
        expect(state.status).toBe('playing')
        expect(state.winner).toBeNull()
        expect(state.rules.scoreLimit).toBe(30)
        expect(state.entries).toHaveLength(2)
        expect(state.startedAt).toBeGreaterThan(0)
        expect(state.finishedAt).toBeNull()
    })

    it('getState retorna copia (no referencia)', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        match.applyManualScore('A', 1)

        const state1 = match.getState()
        match.applyManualScore('B', 1)
        const state2 = match.getState()

        expect(state1.scoreB).toBe(0)
        expect(state2.scoreB).toBe(1)
        expect(state1.entries).toHaveLength(1)
        expect(state2.entries).toHaveLength(2)
    })
})

