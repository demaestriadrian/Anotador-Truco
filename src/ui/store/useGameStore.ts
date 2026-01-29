import { create } from 'zustand'

export interface MatchStickData {
    id: string;
    origin?: { x: number, y: number }; // Posición inicial en storage
    variation?: {
        rotation: number;
        offsetX: number;
        offsetY: number;
    }
}

interface GameState {
    scoreA: number
    scoreB: number
    storageMatches: MatchStickData[] // Grupo de fósforos disponibles
    matchesA: MatchStickData[]
    matchesB: MatchStickData[]
    matchstickSize: { width: number, height: number } | null

    // Acciones Unificadas
    moveMatchstick: (id: string, from: 'storage' | 'A' | 'B' | null, to: 'storage' | 'A' | 'B' | null, origin?: { x: number, y: number }) => void

    setMatchstickSize: (size: { width: number, height: number } | null) => void
    reset: () => void
}

const TOTAL_MATCHES = 29;

// Ayudante para generar el grupo inicial
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

export const useGameStore = create<GameState>((set) => ({
    scoreA: 0,
    scoreB: 0,
    storageMatches: generateInitialMatches(),
    matchesA: [],
    matchesB: [],
    matchstickSize: null,

    // Lógica Unificada de Movimiento
    moveMatchstick: (id, from, to, origin) => {
        set((state) => {
            if (from === to) return {}; // Sin cambios

            let match: MatchStickData | undefined;

            // 1. EXTRAER (REMOVE)
            let newStorage = [...state.storageMatches];
            let newMatchesA = [...state.matchesA];
            let newMatchesB = [...state.matchesB];
            let scoreA = state.scoreA;
            let scoreB = state.scoreB;

            if (from === 'storage') {
                const idx = newStorage.findIndex(m => m.id === id);
                if (idx !== -1) {
                    match = { ...newStorage[idx] };
                    newStorage.splice(idx, 1);
                }
            } else if (from === 'A') {
                const idx = newMatchesA.findIndex(m => m.id === id);
                if (idx !== -1) {
                    match = { ...newMatchesA[idx] };
                    newMatchesA.splice(idx, 1);
                    scoreA = Math.max(0, scoreA - 1);
                }
            } else if (from === 'B') {
                const idx = newMatchesB.findIndex(m => m.id === id);
                if (idx !== -1) {
                    match = { ...newMatchesB[idx] };
                    newMatchesB.splice(idx, 1);
                    scoreB = Math.max(0, scoreB - 1);
                }
            }

            if (!match) return {}; // No encontrado

            // Actualizar origen si se proporciona al mover desde storage o entre zonas
            if (origin) {
                match.origin = origin;
            }

            // 2. INSERTAR (ADD)
            if (to === 'storage') {
                // Volver a storage
                newStorage.push(match);
            } else if (to === 'A') {
                newMatchesA.push(match);
                scoreA++;
            } else if (to === 'B') {
                newMatchesB.push(match);
                scoreB++;
            }
            // Si to === null, el fósforo se elimina permanentemente (no aplica para este juego, pero soportado)

            return {
                storageMatches: newStorage,
                matchesA: newMatchesA,
                matchesB: newMatchesB,
                scoreA,
                scoreB
            };
        });
    },

    setMatchstickSize: (size) => set({ matchstickSize: size }),

    reset: () => {
        set({
            scoreA: 0,
            scoreB: 0,
            storageMatches: generateInitialMatches(),
            matchesA: [],
            matchesB: []
        })
    }
}))
