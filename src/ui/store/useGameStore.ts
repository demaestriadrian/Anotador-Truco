import { create } from 'zustand'

export interface MatchStickData {
    id: string;
    origin?: { x: number, y: number }; // Posición inicial en storage (viewport coords o % si aplica)
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

    // Acciones
    moveFromStorage: (id: string, team: 'A' | 'B', origin?: { x: number, y: number }) => void
    removeMatchstick: (id: string) => void
    moveMatchstick: (id: string, toTeam: 'A' | 'B') => void
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
            offsetX: (Math.random() - 0.5) * 5,
            offsetY: (Math.random() - 0.5) * 5
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

    moveFromStorage: (id, team, origin) => {
        set((state) => {
            // Buscar en almacenamiento
            const matchIndex = state.storageMatches.findIndex(m => m.id === id);
            if (matchIndex === -1) return {};

            const match = { ...state.storageMatches[matchIndex] };

            // Actualizar fósforo con origen si se proporciona (dado que lo capturamos al iniciar el arrastre)
            if (origin) {
                match.origin = origin;
            }

            // Eliminar del almacenamiento
            const newStorage = [...state.storageMatches];
            newStorage.splice(matchIndex, 1);

            // Agregar al equipo
            const keyScore = team === 'A' ? 'scoreA' : 'scoreB';
            const keyMatches = team === 'A' ? 'matchesA' : 'matchesB';

            return {
                storageMatches: newStorage,
                [keyScore]: state[keyScore] + 1,
                [keyMatches]: [...state[keyMatches], match]
            };
        });
    },

    removeMatchstick: (id) => {
        set((state) => {
            // Verificar si está en A o en B
            const isTeamA = state.matchesA.some(m => m.id === id);
            const isTeamB = state.matchesB.some(m => m.id === id);

            if (!isTeamA && !isTeamB) return {};

            const keyScore = isTeamA ? 'scoreA' : 'scoreB';
            const keyMatches = isTeamA ? 'matchesA' : 'matchesB';

            const matchToRemove = state[keyMatches].find(m => m.id === id);
            const newMatches = state[keyMatches].filter(m => m.id !== id);

            // ¡Volver al grupo de almacenamiento!
            // Mantenemos sus propiedades pero ¿tal vez queremos reiniciar el origen?
            // El requerimiento dice "vuelve a la posicion del storage".
            // Si lo ponemos de vuelta en `storageMatches`, reaparecerá en el componente de almacenamiento.

            return {
                [keyScore]: Math.max(0, state[keyScore] - 1),
                [keyMatches]: newMatches,
                storageMatches: [...state.storageMatches, matchToRemove!]
            };
        });
    },

    moveMatchstick: (id, toTeam) => {
        set((state) => {
            // 1. Encontrar dónde está
            const fromTeamA = state.matchesA.some(m => m.id === id);
            const fromTeamB = state.matchesB.some(m => m.id === id);

            if (!fromTeamA && !fromTeamB) return {}; // No existe

            const fromTeam = fromTeamA ? 'A' : 'B';
            if (fromTeam === toTeam) return {}; // Ya está ahí

            // 2. Extraer data
            const sourceKey = fromTeam === 'A' ? 'matchesA' : 'matchesB';
            const targetKey = toTeam === 'A' ? 'matchesA' : 'matchesB';
            const scoreSource = fromTeam === 'A' ? 'scoreA' : 'scoreB';
            const scoreTarget = toTeam === 'A' ? 'scoreA' : 'scoreB';

            const matchToMove = state[sourceKey].find(m => m.id === id);
            if (!matchToMove) return {};

            // 3. Remover de origen
            const newSourceList = state[sourceKey].filter(m => m.id !== id);

            // 4. Agregar a destino (al final)
            const newTargetList = [...state[targetKey], matchToMove];

            return {
                [sourceKey]: newSourceList,
                [targetKey]: newTargetList,
                [scoreSource]: Math.max(0, state[scoreSource] - 1),
                [scoreTarget]: state[scoreTarget] + 1
            };
        });
    },

    setMatchstickSize: (size) => set({ matchstickSize: size }),

    reset: () => {
        set({
            scoreA: 0,
            scoreB: 0,
            storageMatches: generateInitialMatches(), // Reiniciar interacciones
            matchesA: [],
            matchesB: []
        })
    }
}))
