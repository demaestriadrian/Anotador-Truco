import { describe, it, expect } from 'vitest'
import { Team } from '@/core/domain/entities/Team'

describe('Team', () => {
    it('se crea con id y nombre', () => {
        const team = new Team('A', 'Nosotros')
        expect(team.id).toBe('A')
        expect(team.name).toBe('Nosotros')
    })

    it('permite cambiar el nombre', () => {
        const team = new Team('A', 'Nosotros')
        team.setName('Los Pibes')
        expect(team.name).toBe('Los Pibes')
    })

    it('trimea el nombre al cambiarlo', () => {
        const team = new Team('A', 'Nosotros')
        team.setName('  Los Pibes  ')
        expect(team.name).toBe('Los Pibes')
    })

    it('lanza error si el nombre está vacío', () => {
        const team = new Team('A', 'Nosotros')
        expect(() => team.setName('')).toThrow('El nombre no puede estar vacío')
        expect(() => team.setName('   ')).toThrow('El nombre no puede estar vacío')
    })
})
