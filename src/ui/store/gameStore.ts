import { createStore, produce } from 'solid-js/store'
import { TOTAL_MATCHES } from '@/core/domain/constants'

export interface MatchStickData {
    id: string
    variationRotation: number
    zone: 'storage' | 'A' | 'B'
    slotIndex: number | null
}

interface GameState {
    scoreA: number
    scoreB: number
    matches: MatchStickData[]
    matchstickSize: { width: number; height: number } | null
}

const generateInitialMatches = (): MatchStickData[] => {
    return Array.from({ length: TOTAL_MATCHES - 1 }, () => ({
        id: crypto.randomUUID(),
        variationRotation: (Math.random() - 0.5) * 10,
        zone: 'storage' as const,
        slotIndex: null,
    }))
}

const [gameState, setGameState] = createStore<GameState>({
    scoreA: 0,
    scoreB: 0,
    matches: generateInitialMatches(),
    matchstickSize: null,
})

/**
 * Mueve un fósforo a una zona destino.
 * Maneja cascada automática al retirar de un equipo.
 */
export const moveMatchstick = (id: string, toZone: 'storage' | 'A' | 'B') => {
    setGameState(produce((state) => {
        const match = state.matches.find(m => m.id === id)
        if (!match) return

        const fromZone = match.zone
        const fromSlot = match.slotIndex

        if (fromZone === toZone) return

        // Retirar del equipo origen + cascada
        if (fromZone === 'A' || fromZone === 'B') {
            state[fromZone === 'A' ? 'scoreA' : 'scoreB']--

            if (fromSlot !== null) {
                state.matches
                    .filter(m => m.zone === fromZone && m.slotIndex !== null && m.slotIndex > fromSlot)
                    .forEach(m => { m.slotIndex!-- })
            }
        }

        // Mover al destino
        if (toZone === 'storage') {
            match.zone = 'storage'
            match.slotIndex = null
        } else {
            const count = state.matches.filter(m => m.zone === toZone && m.slotIndex !== null).length
            if (count >= 15) return

            match.zone = toZone
            match.slotIndex = count

            state[toZone === 'A' ? 'scoreA' : 'scoreB']++
        }
    }))
}

export const setMatchstickSize = (size: { width: number; height: number } | null) => {
    setGameState('matchstickSize', size)
}

export const resetGame = () => {
    setGameState({
        scoreA: 0,
        scoreB: 0,
        matches: generateInitialMatches(),
    })
}

export { gameState }
