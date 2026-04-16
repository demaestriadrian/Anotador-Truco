import { describe, it, expect } from 'vitest'
import { Match } from '@/core/domain/entities/Match'
import type { GameRules } from '@/core/domain/types'

const rules30: GameRules = { scoreLimit: 30, useMalas: true, malasThreshold: 15 }
const rules15: GameRules = { scoreLimit: 15, useMalas: false, malasThreshold: 0 }

describe('Match', () => {
    // ─── Creación ───

    it('se crea con scores en 0 y status playing', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        expect(match.scoreA).toBe(0)
        expect(match.scoreB).toBe(0)
        expect(match.status).toBe('playing')
        expect(match.winner).toBeNull()
        expect(match.moves).toHaveLength(0)
    })

    it('genera un id único', () => {
        const m1 = new Match()
        const m2 = new Match()
        expect(m1.id).not.toBe(m2.id)
    })

    it('usa id personalizado si se provee', () => {
        const match = new Match('A', 'B', rules30, 'custom-id')
        expect(match.id).toBe('custom-id')
    })

    // ─── addPoint ───

    it('suma un punto al equipo A', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        const result = match.addPoint('A')

        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(1)
        expect(result.scoreB).toBe(0)
        expect(match.moves).toHaveLength(1)
        expect(match.moves[0].action).toBe('add')
        expect(match.moves[0].team).toBe('A')
    })

    it('suma un punto al equipo B', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        const result = match.addPoint('B')

        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(0)
        expect(result.scoreB).toBe(1)
    })

    it('suma múltiples puntos correctamente', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        match.addPoint('A')
        match.addPoint('A')
        match.addPoint('B')
        const result = match.addPoint('A')

        expect(result.scoreA).toBe(3)
        expect(result.scoreB).toBe(1)
        expect(match.moves).toHaveLength(4)
    })

    // ─── removePoint ───

    it('remueve un punto', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        match.addPoint('A')
        match.addPoint('A')
        const result = match.removePoint('A')

        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(1)
        expect(match.moves).toHaveLength(3)
        expect(match.moves[2].action).toBe('remove')
    })

    it('rechaza removePoint si score es 0', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        const result = match.removePoint('A')

        expect(result.accepted).toBe(false)
        expect(result.reason).toBe('score_at_zero')
        expect(match.moves).toHaveLength(0)
    })

    // ─── Ganador ───

    it('detecta ganador al llegar al límite (30)', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        for (let i = 0; i < 29; i++) match.addPoint('A')

        expect(match.status).toBe('playing')
        expect(match.winner).toBeNull()

        const result = match.addPoint('A')

        expect(result.accepted).toBe(true)
        expect(result.status).toBe('finished')
        expect(result.winner).toBe('A')
        expect(match.status).toBe('finished')
    })

    it('detecta ganador al llegar al límite (15)', () => {
        const match = new Match('Nos', 'Ellos', rules15)
        for (let i = 0; i < 15; i++) match.addPoint('B')

        expect(match.status).toBe('finished')
        expect(match.winner).toBe('B')
    })

    it('rechaza puntos después de que la partida terminó', () => {
        const match = new Match('Nos', 'Ellos', rules15)
        for (let i = 0; i < 15; i++) match.addPoint('A')

        const result = match.addPoint('A')
        expect(result.accepted).toBe(false)
        expect(result.reason).toBe('game_finished')

        const result2 = match.removePoint('A')
        expect(result2.accepted).toBe(false)
        expect(result2.reason).toBe('game_finished')
    })

    // ─── Malas ───

    it('reporta malas correctamente con reglas a 30', () => {
        const match = new Match('Nos', 'Ellos', rules30)

        expect(match.isInMalas('A')).toBe(true)
        expect(match.isInMalas('B')).toBe(true)

        for (let i = 0; i < 15; i++) match.addPoint('A')

        expect(match.isInMalas('A')).toBe(false) // 15 >= 15 → ya no está en malas
        expect(match.isInMalas('B')).toBe(true)   // 0 < 15 → sigue en malas
    })

    it('malas desactivadas con reglas a 15', () => {
        const match = new Match('Nos', 'Ellos', rules15)
        expect(match.isInMalas('A')).toBe(false)
        expect(match.isInMalas('B')).toBe(false)
    })

    // ─── Undo ───

    it('deshace el último addPoint', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        match.addPoint('A')
        match.addPoint('A')

        const result = match.undoLastMove()

        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(1)
        expect(match.moves).toHaveLength(1)
    })

    it('deshace el último removePoint', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        match.addPoint('B')
        match.addPoint('B')
        match.removePoint('B')

        const result = match.undoLastMove()

        expect(result.accepted).toBe(true)
        expect(result.scoreB).toBe(2)
        expect(match.moves).toHaveLength(2)
    })

    it('undo reabre una partida terminada', () => {
        const match = new Match('Nos', 'Ellos', rules15)
        for (let i = 0; i < 15; i++) match.addPoint('A')

        expect(match.status).toBe('finished')
        expect(match.winner).toBe('A')

        const result = match.undoLastMove()

        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(14)
        expect(result.status).toBe('playing')
        expect(result.winner).toBeNull()
    })

    it('undo sin moves retorna accepted false', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        const result = match.undoLastMove()
        expect(result.accepted).toBe(false)
    })

    // ─── Snapshot ───

    it('getState retorna un snapshot completo', () => {
        const match = new Match('Nos', 'Ellos', rules30, 'test-id')
        match.addPoint('A')
        match.addPoint('B')

        const state = match.getState()

        expect(state.id).toBe('test-id')
        expect(state.scoreA).toBe(1)
        expect(state.scoreB).toBe(1)
        expect(state.status).toBe('playing')
        expect(state.winner).toBeNull()
        expect(state.rules.scoreLimit).toBe(30)
        expect(state.moves).toHaveLength(2)
        expect(state.startedAt).toBeGreaterThan(0)
        expect(state.finishedAt).toBeNull()
    })

    it('getState retorna copia (no referencia)', () => {
        const match = new Match('Nos', 'Ellos', rules30)
        match.addPoint('A')

        const state1 = match.getState()
        match.addPoint('B')
        const state2 = match.getState()

        expect(state1.scoreB).toBe(0)
        expect(state2.scoreB).toBe(1)
        expect(state1.moves).toHaveLength(1)
        expect(state2.moves).toHaveLength(2)
    })
})
