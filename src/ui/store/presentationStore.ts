import { createStore, produce } from 'solid-js/store'

// Datos de un fósforo individual
export interface MatchStickData {
    id: string;
    /** Rotación aleatoria leve para aspecto natural (en grados) */
    variationRotation: number;
}

// Estado de PRESENTACIÓN: solo lo visual de los fósforos.
// El puntaje vive en el core (ver `solidGameController`), no acá.
interface PresentationState {
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
        variationRotation: (Math.random() - 0.5) * 10,
    }));
};

// Store reactivo de SolidJS (solo presentación)
const [presentationState, setPresentationState] = createStore<PresentationState>({
    storageMatches: generateInitialMatches(),
    matchesA: [],
    matchesB: [],
    matchstickSize: null
})

// --- Acciones ---

/**
 * Mueve un fósforo entre zonas (storage, A, B, null).
 * SOLO mueve el fósforo entre los arrays de presentación; el puntaje
 * lo maneja el core a través de los comandos despachados en el drag.
 */
export const moveMatchstick = (
    id: string,
    from: 'storage' | 'A' | 'B' | null,
    to: 'storage' | 'A' | 'B' | null,
) => {
    setPresentationState(produce((state) => {
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

        // Insertar en la lista destino
        const destList = getList(to)
        if (destList) {
            destList.push(match)
        }
    }))
}

/**
 * Establece el tamaño de referencia del fósforo (medido desde el primer slot).
 */
export const setMatchstickSize = (size: { width: number, height: number } | null) => {
    setPresentationState('matchstickSize', size)
}

/**
 * Reinicia el estado de presentación a su estado inicial.
 */
export const resetPresentation = () => {
    setPresentationState({
        storageMatches: generateInitialMatches(),
        matchesA: [],
        matchesB: [],
    })
}

// Exportar el estado reactivo (solo lectura)
export { presentationState }
