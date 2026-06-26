import { createStore, produce } from 'solid-js/store'

// 31 fósforos: 30 para el máximo en mesa (ambos equipos en 15 malas = 15 + 15) + 1 de respaldo
// para poder anotar el punto del ganador cuando ambos están en 15.
const TOTAL_MATCHES = 31

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
    return Array.from({ length: TOTAL_MATCHES }, () => ({
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

// Ids cuyo PRÓXIMO reposicionamiento debe ser instantáneo (sin animación). Estado transitorio
// de presentación; lo consume el efecto reactivo de cada fósforo en `createMatchstickLogic`.
const instantSnap = new Set<string>()

/** Devuelve true si el fósforo debía reposicionarse al instante y lo marca como consumido. */
export const consumeInstantSnap = (id: string): boolean => instantSnap.delete(id)

/**
 * Vacía los fósforos de una zona de puntaje: los devuelve al depósito.
 * Solo presentación (no toca el puntaje del core). `animate=false` reposiciona al instante.
 */
export const clearZone = (zone: 'A' | 'B', animate = true) => {
    setPresentationState(produce((state) => {
        for (const m of state.matches) {
            if (m.zone !== zone) continue
            if (!animate) instantSnap.add(m.id)
            m.zone = 'storage'
            m.slotIndex = null
        }
    }))
}

/**
 * Llena una zona hasta 15 (malas completas) tomando fósforos del depósito.
 * Solo presentación. `animate=false` reposiciona al instante.
 */
export const fillZone = (zone: 'A' | 'B', animate = true) => {
    setPresentationState(produce((state) => {
        const count = state.matches.filter(m => m.zone === zone && m.slotIndex !== null).length
        const fromStorage = state.matches.filter(m => m.zone === 'storage')
        let i = 0
        for (let slot = count; slot < 15; slot++) {
            const m = fromStorage[i++]
            if (!m) break
            if (!animate) instantSnap.add(m.id)
            m.zone = zone
            m.slotIndex = slot
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
