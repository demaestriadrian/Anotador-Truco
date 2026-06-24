import { createStore, produce } from 'solid-js/store'

const TOTAL_MATCHES = 29

export interface MatchStickData {
    id: string
    variationRotation: number
    zone: 'storage' | 'A' | 'B'
    slotIndex: number | null
}

interface PresentationState {
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

const [presentationState, setPresentationState] = createStore<PresentationState>({
    matches: generateInitialMatches(),
    matchstickSize: null,
})

/**
 * Mueve un fósforo a una zona destino.
 * Solo maneja estado de presentación (zone/slotIndex + cascada).
 * Los puntos los maneja el core via solidGameController.
 */
export const moveMatchstick = (id: string, toZone: 'storage' | 'A' | 'B') => {
    setPresentationState(produce((state) => {
        const match = state.matches.find(m => m.id === id)
        if (!match) return

        const fromZone = match.zone
        const fromSlot = match.slotIndex

        if (fromZone === toZone) return

        // Cascada: desplaza índices de fósforos posteriores en el equipo origen
        if (fromZone === 'A' || fromZone === 'B') {
            if (fromSlot !== null) {
                state.matches
                    .filter(m => m.zone === fromZone && m.slotIndex !== null && m.slotIndex > fromSlot)
                    .forEach(m => { m.slotIndex!-- })
            }
        }

        if (toZone === 'storage') {
            match.zone = 'storage'
            match.slotIndex = null
        } else {
            const count = state.matches.filter(m => m.zone === toZone && m.slotIndex !== null).length
            if (count >= 15) return
            match.zone = toZone
            match.slotIndex = count
        }
    }))
}

export const setMatchstickSize = (size: { width: number; height: number } | null) => {
    setPresentationState('matchstickSize', size)
}

export const resetPresentation = () => {
    setPresentationState({ matches: generateInitialMatches() })
}

export { presentationState }
