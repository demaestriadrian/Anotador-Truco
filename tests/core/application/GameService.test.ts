import { describe, it, expect } from 'vitest'
import { GameService } from '@/core/application/services/GameService'
import type { CallSequence, GameRules } from '@/core/domain/types'

const rules30: GameRules = { scoreLimit: 30, useMalas: true, malasThreshold: 15 }
const rules15: GameRules = { scoreLimit: 15, useMalas: false, malasThreshold: 0 }

function trucoSeq(accepted: boolean): CallSequence {
    return {
        category: 'Truco',
        steps: [{ type: 'Truco', callingTeam: 'A' }],
        accepted,
        winnerTeam: 'A',
    }
}

describe('GameService', () => {

    // ─── Inicialización ──────────────────────────────────────────────────────

    it('se crea sin partida activa', () => {
        const service = new GameService()
        expect(service.getCurrentMatch()).toBeNull()
    })

    it('arranca una partida nueva', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        const state = service.startNewMatch()

        expect(state.scoreA).toBe(0)
        expect(state.scoreB).toBe(0)
        expect(state.status).toBe('playing')
    })

    // ─── applyManualScore ────────────────────────────────────────────────────

    it('suma puntos manuales en partida activa', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.startNewMatch()

        const r1 = service.applyManualScore('A', 2)
        expect(r1.accepted).toBe(true)
        expect(r1.scoreA).toBe(2)

        const r2 = service.applyManualScore('A', 3)
        expect(r2.scoreA).toBe(5)

        const r3 = service.applyManualScore('B', 1)
        expect(r3.scoreB).toBe(1)
    })

    it('lanza error si no hay partida activa', () => {
        const service = new GameService()
        expect(() => service.applyManualScore('A', 1)).toThrow('No hay partida en curso')
        expect(() => service.undoLastEntry()).toThrow('No hay partida en curso')
        expect(() => service.applyCallSequence(trucoSeq(true), 'A')).toThrow('No hay partida en curso')
    })

    // ─── applyCallSequence ────────────────────────────────────────────────────

    it('aplica secuencia de cantos y refleja puntos', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.startNewMatch()

        const result = service.applyCallSequence(trucoSeq(true), 'A')
        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(2)
    })

    // ─── undoLastEntry ────────────────────────────────────────────────────────

    it('deshace la última anotación', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.startNewMatch()

        service.applyManualScore('A', 2)
        service.applyManualScore('B', 1)
        service.applyManualScore('A', 3)

        const result = service.undoLastEntry()
        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(2)
        expect(result.scoreB).toBe(1)
    })

    // ─── getScoreHistory ─────────────────────────────────────────────────────

    it('retorna historial de anotaciones de la partida actual', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.startNewMatch()

        service.applyManualScore('A', 2)
        service.applyManualScore('B', 1)
        service.applyCallSequence(trucoSeq(true), 'A')

        const entries = service.getScoreHistory()
        expect(entries).toHaveLength(3)
        expect(entries[0].reason).toBe('manual')
        expect(entries[0].team).toBe('A')
        expect(entries[1].team).toBe('B')
        expect(entries[2].reason).toBe('truco')
    })

    it('retorna array vacío si no hay partida activa', () => {
        const service = new GameService()
        expect(service.getScoreHistory()).toEqual([])
    })

    // ─── Manos (Rounds) ──────────────────────────────────────────────────────

    it('inicia y finaliza manos correctamente', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.startNewMatch()

        const round = service.startNewRound('A')
        expect(round.roundNumber).toBe(1)
        expect(round.dealerTeam).toBe('A')

        service.finishCurrentRound()

        const rounds = service.getRounds()
        expect(rounds).toHaveLength(1)
        expect(rounds[0].status).toBe('finished')
    })

    it('lanza error si no hay partida al iniciar mano', () => {
        const service = new GameService()
        expect(() => service.startNewRound('A')).toThrow('No hay partida en curso')
        expect(() => service.finishCurrentRound()).toThrow('No hay partida en curso')
    })

    // ─── Historial de partidas ────────────────────────────────────────────────

    it('archiva partida terminada al iniciar una nueva', () => {
        const service = new GameService('Nos', 'Ellos', rules15)
        service.startNewMatch()
        service.applyManualScore('A', 15)

        expect(service.getCurrentMatch()?.status).toBe('finished')

        service.startNewMatch()

        const history = service.getMatchHistory()
        expect(history).toHaveLength(1)
        expect(history[0].winner).toBe('A')
        expect(history[0].scoreA).toBe(15)

        const current = service.getCurrentMatch()
        expect(current?.scoreA).toBe(0)
        expect(current?.scoreB).toBe(0)
    })

    it('finishCurrentMatch archiva y limpia partida actual', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.startNewMatch()
        service.applyManualScore('A', 5)

        service.finishCurrentMatch()

        expect(service.getCurrentMatch()).toBeNull()
        expect(service.getMatchHistory()).toHaveLength(1)
    })

    it('múltiples partidas se archivan en orden', () => {
        const service = new GameService('Nos', 'Ellos', rules15)

        service.startNewMatch()
        service.applyManualScore('A', 15)

        service.startNewMatch()
        service.applyManualScore('B', 15)

        service.startNewMatch()

        const history = service.getMatchHistory()
        expect(history).toHaveLength(2)
        expect(history[0].winner).toBe('A')
        expect(history[1].winner).toBe('B')
    })

    // ─── Configuración ───────────────────────────────────────────────────────

    it('permite cambiar nombres de equipos', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.setTeamName('A', 'Los Grosos')
        service.setTeamName('B', 'Los Pibes')

        const state = service.getSessionState()
        expect(state.teamAName).toBe('Los Grosos')
        expect(state.teamBName).toBe('Los Pibes')
    })

    it('permite cambiar reglas', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.setRules({ scoreLimit: 15, useMalas: false })

        const state = service.getSessionState()
        expect(state.rules.scoreLimit).toBe(15)
        expect(state.rules.useMalas).toBe(false)
    })

    // ─── Reset ────────────────────────────────────────────────────────────────

    it('resetSession crea una sesión limpia manteniendo config', () => {
        const service = new GameService('Nos', 'Ellos', rules15)
        service.startNewMatch()
        service.applyManualScore('A', 15)
        service.startNewMatch()
        service.applyManualScore('B', 1)

        service.resetSession()

        expect(service.getCurrentMatch()).toBeNull()
        expect(service.getMatchHistory()).toHaveLength(0)
        const state = service.getSessionState()
        expect(state.teamAName).toBe('Nos')
        expect(state.teamBName).toBe('Ellos')
    })

    // ─── Session state ────────────────────────────────────────────────────────

    it('getSessionState retorna snapshot completo', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.startNewMatch()
        service.applyManualScore('A', 1)

        const state = service.getSessionState()

        expect(state.teamAName).toBe('Nos')
        expect(state.teamBName).toBe('Ellos')
        expect(state.rules.scoreLimit).toBe(30)
        expect(state.currentMatch).not.toBeNull()
        expect(state.currentMatch?.scoreA).toBe(1)
        expect(state.matchHistory).toHaveLength(0)
        expect(state.createdAt).toBeGreaterThan(0)
    })
})

