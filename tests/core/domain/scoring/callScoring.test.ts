import { describe, it, expect } from 'vitest'
import { resolveCallSequence } from '@/core/domain/scoring/callScoring'
import type { CallSequence, GameRules } from '@/core/domain/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const rules30: GameRules = { scoreLimit: 30, useMalas: true, malasThreshold: 15 }
const scores00 = { A: 0, B: 0 }

function seq(overrides: Partial<CallSequence> & Pick<CallSequence, 'steps'>): CallSequence {
    return {
        category: 'Truco',
        accepted: true,
        winnerTeam: 'A',
        ...overrides,
    }
}

// ─── Truco ────────────────────────────────────────────────────────────────────

describe('resolveCallSequence – Truco', () => {

    it('sin cantos → 1p (base)', () => {
        const result = resolveCallSequence(
            seq({ category: 'Truco', steps: [], accepted: true }),
            scores00, rules30
        )
        expect(result.points).toBe(1)
        expect(result.reason).toBe('truco')
        expect(result.team).toBe('A')
    })

    it('Truco querido → 2p', () => {
        const result = resolveCallSequence(
            seq({ steps: [{ type: 'Truco', callingTeam: 'A' }], accepted: true }),
            scores00, rules30
        )
        expect(result.points).toBe(2)
    })

    it('Truco no querido → 1p', () => {
        const result = resolveCallSequence(
            seq({ steps: [{ type: 'Truco', callingTeam: 'A' }], accepted: false }),
            scores00, rules30
        )
        expect(result.points).toBe(1)
    })

    it('Retruco querido → 3p', () => {
        const result = resolveCallSequence(
            seq({ steps: [{ type: 'Truco', callingTeam: 'A' }, { type: 'Retruco', callingTeam: 'B' }], accepted: true }),
            scores00, rules30
        )
        expect(result.points).toBe(3)
    })

    it('Retruco no querido → 2p', () => {
        const result = resolveCallSequence(
            seq({ steps: [{ type: 'Truco', callingTeam: 'A' }, { type: 'Retruco', callingTeam: 'B' }], accepted: false }),
            scores00, rules30
        )
        expect(result.points).toBe(2)
    })

    it('ValeCuatro querido → 4p', () => {
        const result = resolveCallSequence(
            seq({
                steps: [
                    { type: 'Truco', callingTeam: 'A' },
                    { type: 'Retruco', callingTeam: 'B' },
                    { type: 'ValeCuatro', callingTeam: 'A' },
                ],
                accepted: true,
            }),
            scores00, rules30
        )
        expect(result.points).toBe(4)
    })

    it('ValeCuatro no querido → 3p', () => {
        const result = resolveCallSequence(
            seq({
                steps: [
                    { type: 'Truco', callingTeam: 'A' },
                    { type: 'Retruco', callingTeam: 'B' },
                    { type: 'ValeCuatro', callingTeam: 'A' },
                ],
                accepted: false,
            }),
            scores00, rules30
        )
        expect(result.points).toBe(3)
    })
})

// ─── Envido ───────────────────────────────────────────────────────────────────

describe('resolveCallSequence – Envido', () => {

    it('Envido no querido (primero) → 1p', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [{ type: 'Envido', callingTeam: 'A' }],
                accepted: false,
            }),
            scores00, rules30
        )
        expect(result.points).toBe(1)
        expect(result.reason).toBe('envido')
    })

    it('Envido querido → 2p', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [{ type: 'Envido', callingTeam: 'A' }],
                accepted: true,
            }),
            scores00, rules30
        )
        expect(result.points).toBe(2)
    })

    it('Envido + Envido queridos → 4p', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [
                    { type: 'Envido', callingTeam: 'A' },
                    { type: 'Envido', callingTeam: 'B' },
                ],
                accepted: true,
            }),
            scores00, rules30
        )
        expect(result.points).toBe(4)
    })

    it('Envido + Envido no querido → 2p', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [
                    { type: 'Envido', callingTeam: 'A' },
                    { type: 'Envido', callingTeam: 'B' },
                ],
                accepted: false,
            }),
            scores00, rules30
        )
        expect(result.points).toBe(2)
    })

    it('Envido + RealEnvido queridos → 5p', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [
                    { type: 'Envido', callingTeam: 'A' },
                    { type: 'RealEnvido', callingTeam: 'B' },
                ],
                accepted: true,
            }),
            scores00, rules30
        )
        expect(result.points).toBe(5)
    })

    it('Envido + Envido + RealEnvido queridos → 7p', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [
                    { type: 'Envido', callingTeam: 'A' },
                    { type: 'Envido', callingTeam: 'B' },
                    { type: 'RealEnvido', callingTeam: 'A' },
                ],
                accepted: true,
            }),
            scores00, rules30
        )
        expect(result.points).toBe(7)
    })

    it('Envido + Envido + RealEnvido no querido → 4p', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [
                    { type: 'Envido', callingTeam: 'A' },
                    { type: 'Envido', callingTeam: 'B' },
                    { type: 'RealEnvido', callingTeam: 'A' },
                ],
                accepted: false,
            }),
            scores00, rules30
        )
        expect(result.points).toBe(4)
    })

    it('Envido + RealEnvido + FaltaEnvido no querido → 5p', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [
                    { type: 'Envido', callingTeam: 'A' },
                    { type: 'RealEnvido', callingTeam: 'B' },
                    { type: 'FaltaEnvido', callingTeam: 'A' },
                ],
                accepted: false,
            }),
            scores00, rules30
        )
        expect(result.points).toBe(5)
        expect(result.reason).toBe('falta_envido')
    })
})

// ─── Falta Envido ─────────────────────────────────────────────────────────────

describe('resolveCallSequence – FaltaEnvido', () => {

    it('querida, ninguno en Buenas → winsMatch true, points = scoreLimit', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [{ type: 'FaltaEnvido', callingTeam: 'A' }],
                accepted: true,
            }),
            { A: 0, B: 0 },
            rules30
        )
        expect(result.winsMatch).toBe(true)
        expect(result.points).toBe(30)
        expect(result.reason).toBe('falta_envido')
    })

    it('querida, equipo A en Buenas (20p) → points = 30 - 20 = 10', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [{ type: 'FaltaEnvido', callingTeam: 'B' }],
                accepted: true,
            }),
            { A: 20, B: 5 },
            rules30
        )
        expect(result.winsMatch).toBeUndefined()
        expect(result.points).toBe(10)
    })

    it('querida, ambos en Buenas → points = 30 - max(A, B)', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [{ type: 'FaltaEnvido', callingTeam: 'A' }],
                accepted: true,
            }),
            { A: 18, B: 22 },
            rules30
        )
        expect(result.points).toBe(8) // 30 - 22
    })

    it('rechazada (primer canto) → 1p', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [{ type: 'FaltaEnvido', callingTeam: 'A' }],
                accepted: false,
            }),
            scores00, rules30
        )
        expect(result.points).toBe(1)
        expect(result.winsMatch).toBeUndefined()
    })

    it('rechazada tras Envido + RealEnvido → 5p', () => {
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [
                    { type: 'Envido', callingTeam: 'A' },
                    { type: 'RealEnvido', callingTeam: 'B' },
                    { type: 'FaltaEnvido', callingTeam: 'A' },
                ],
                accepted: false,
            }),
            scores00, rules30
        )
        expect(result.points).toBe(5)
    })

    it('rules a 15, querida sin Buenas → 15p', () => {
        const rules15: GameRules = { scoreLimit: 15, useMalas: false, malasThreshold: 8 }
        const result = resolveCallSequence(
            seq({
                category: 'Envido',
                steps: [{ type: 'FaltaEnvido', callingTeam: 'A' }],
                accepted: true,
            }),
            { A: 0, B: 0 },
            rules15
        )
        expect(result.winsMatch).toBe(true)
        expect(result.points).toBe(15)
    })
})
