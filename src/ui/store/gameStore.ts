import { createStore, produce } from 'solid-js/store'

// Datos de un fósforo individual
export interface MatchStickData {
    id: string;
    origin?: { x: number, y: number }; // Posición inicial en storage
    variation?: {
        rotation: number;
        offsetX: number;
        offsetY: number;
    }
}

// Estado completo del juego
interface GameState {
    scoreA: number
    scoreB: number
    storageMatches: MatchStickData[]
    matchesA: MatchStickData[]
    matchesB: MatchStickData[]
    matchstickSize: { width: number, height: number } | null
}

const TOTAL_MATCHES = 29;

// Genera el grupo inicial de fósforos con variaciones aleatorias
const generateInitialMatches = (): MatchStickData[] => {
    return Array.from({ length: TOTAL_MATCHES }, () => ({
        id: crypto.randomUUID(),
        variation: {
            rotation: (Math.random() - 0.5) * 10,
            offsetX: 0,
            offsetY: 0
        }
    }));
};

// Store reactivo de SolidJS
const [gameState, setGameState] = createStore<GameState>({
    scoreA: 0,
    scoreB: 0,
    storageMatches: generateInitialMatches(),
    matchesA: [],
    matchesB: [],
    matchstickSize: null
})

// --- Acciones ---

/**
 * Mueve un fósforo entre zonas (storage, A, B, null).
 * Actualiza scores automáticamente al mover hacia/desde zonas de equipo.
 */
export const moveMatchstick = (
    id: string,
    from: 'storage' | 'A' | 'B' | null,
    to: 'storage' | 'A' | 'B' | null,
    origin?: { x: number, y: number }
) => {
    setGameState(produce((state) => {
        if (from === to) return; // Sin cambios

        // Buscar el fósforo en la lista de origen
        const getList = (zone: typeof from) => {
            if (zone === 'storage') return state.storageMatches
            if (zone === 'A') return state.matchesA
            if (zone === 'B') return state.matchesB
            return null
        }

        const sourceList = getList(from)
        if (!sourceList) return

        const idx = sourceList.findIndex(m => m.id === id)
        if (idx === -1) return

        // Extraer el fósforo
        const match = { ...sourceList[idx] }
        sourceList.splice(idx, 1)

        // Actualizar score al sacar de zona de equipo
        if (from === 'A') state.scoreA = Math.max(0, state.scoreA - 1)
        if (from === 'B') state.scoreB = Math.max(0, state.scoreB - 1)

        // Actualizar origen si se proporciona
        if (origin) match.origin = origin

        // Insertar en la lista destino
        const destList = getList(to)
        if (destList) {
            destList.push(match)
        }

        // Actualizar score al insertar en zona de equipo
        if (to === 'A') state.scoreA++
        if (to === 'B') state.scoreB++
    }))
}

/**
 * Establece el tamaño de referencia del fósforo (medido desde el primer slot).
 */
export const setMatchstickSize = (size: { width: number, height: number } | null) => {
    setGameState('matchstickSize', size)
}

/**
 * Reinicia el estado del juego a su estado inicial.
 */
export const resetGame = () => {
    setGameState({
        scoreA: 0,
        scoreB: 0,
        storageMatches: generateInitialMatches(),
        matchesA: [],
        matchesB: [],
    })
}

// Exportar el estado reactivo (solo lectura)
export { gameState }
