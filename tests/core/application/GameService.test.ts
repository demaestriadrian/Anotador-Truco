import { describe, it, expect } from 'vitest'
import { GameService } from '@/core/application/services/GameService'
import type { GameRules } from '@/core/domain/types'

const rules30: GameRules = { scoreLimit: 30, useMalas: true, malasThreshold: 15 }
const rules15: GameRules = { scoreLimit: 15, useMalas: false, malasThreshold: 0 }

describe('GameService', () => {
    // ─── Inicialización ───

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

    // ─── Puntos ───

    it('suma y resta puntos en partida activa', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.startNewMatch()

        const r1 = service.addPoint('A')
        expect(r1.accepted).toBe(true)
        expect(r1.scoreA).toBe(1)

        const r2 = service.addPoint('A')
        expect(r2.scoreA).toBe(2)

        const r3 = service.removePoint('A')
        expect(r3.accepted).toBe(true)
        expect(r3.scoreA).toBe(1)
    })

    it('lanza error si no hay partida activa', () => {
        const service = new GameService()
        expect(() => service.addPoint('A')).toThrow('No hay partida en curso')
        expect(() => service.removePoint('A')).toThrow('No hay partida en curso')
        expect(() => service.undoLastMove()).toThrow('No hay partida en curso')
    })

    // ─── Undo ───

    it('deshace el último movimiento', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.startNewMatch()

        service.addPoint('A')
        service.addPoint('B')
        service.addPoint('A')

        const result = service.undoLastMove()
        expect(result.accepted).toBe(true)
        expect(result.scoreA).toBe(1)
        expect(result.scoreB).toBe(1)
    })

    // ─── Historial de moves ───

    it('retorna historial de movimientos de la partida actual', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.startNewMatch()

        service.addPoint('A')
        service.addPoint('B')
        service.removePoint('A')

        const moves = service.getMoveHistory()
        expect(moves).toHaveLength(3)
        expect(moves[0].action).toBe('add')
        expect(moves[0].team).toBe('A')
        expect(moves[1].action).toBe('add')
        expect(moves[1].team).toBe('B')
        expect(moves[2].action).toBe('remove')
        expect(moves[2].team).toBe('A')
    })

    it('retorna array vacío si no hay partida activa', () => {
        const service = new GameService()
        expect(service.getMoveHistory()).toEqual([])
    })

    // ─── Historial de partidas ───

    it('archiva partida terminada al iniciar una nueva', () => {
        const service = new GameService('Nos', 'Ellos', rules15)
        service.startNewMatch()

        // Terminar partida
        for (let i = 0; i < 15; i++) service.addPoint('A')

        const match1 = service.getCurrentMatch()
        expect(match1?.status).toBe('finished')

        // Nueva partida → la anterior se archiva
        service.startNewMatch()

        const history = service.getMatchHistory()
        expect(history).toHaveLength(1)
        expect(history[0].winner).toBe('A')
        expect(history[0].scoreA).toBe(15)

        // La nueva partida arranca en 0
        const current = service.getCurrentMatch()
        expect(current?.scoreA).toBe(0)
        expect(current?.scoreB).toBe(0)
    })

    it('finishCurrentMatch archiva y limpia partida actual', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.startNewMatch()
        service.addPoint('A')

        service.finishCurrentMatch()

        expect(service.getCurrentMatch()).toBeNull()
        expect(service.getMatchHistory()).toHaveLength(1)
    })

    it('múltiples partidas se archivan en orden', () => {
        const service = new GameService('Nos', 'Ellos', rules15)

        // Partida 1
        service.startNewMatch()
        for (let i = 0; i < 15; i++) service.addPoint('A')

        // Partida 2
        service.startNewMatch()
        for (let i = 0; i < 15; i++) service.addPoint('B')

        // Partida 3
        service.startNewMatch()

        const history = service.getMatchHistory()
        expect(history).toHaveLength(2)
        expect(history[0].winner).toBe('A')
        expect(history[1].winner).toBe('B')
    })

    // ─── Configuración ───

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

    // ─── Reset ───

    it('resetSession crea una sesión limpia', () => {
        const service = new GameService('Nos', 'Ellos', rules15)
        service.startNewMatch()
        for (let i = 0; i < 15; i++) service.addPoint('A')
        service.startNewMatch()
        service.addPoint('B')

        service.resetSession()

        expect(service.getCurrentMatch()).toBeNull()
        expect(service.getMatchHistory()).toHaveLength(0)
        // Mantiene nombres y reglas
        const state = service.getSessionState()
        expect(state.teamAName).toBe('Nos')
        expect(state.teamBName).toBe('Ellos')
    })

    // ─── Session state ───

    it('getSessionState retorna snapshot completo', () => {
        const service = new GameService('Nos', 'Ellos', rules30)
        service.startNewMatch()
        service.addPoint('A')

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
