import { create } from 'zustand'

export interface MatchStickData {
    id: string;
    // Pdríamos guardar posición u otros metadatos aquí si fuera necesario
}

interface GameState {
    scoreA: number
    scoreB: number
    matchesA: MatchStickData[]
    matchesB: MatchStickData[]
    matchstickSize: { width: number, height: number } | null
    addPoint: (team: 'A' | 'B') => void
    removeLastPoint: (team: 'A' | 'B') => void
    setMatchstickSize: (size: { width: number, height: number } | null) => void
    reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
    scoreA: 0,
    scoreB: 0,
    matchesA: [],
    matchesB: [],
    matchstickSize: null,

    addPoint: (team) => {
        set((state) => {
            const keyScore = team === 'A' ? 'scoreA' : 'scoreB';
            const keyMatches = team === 'A' ? 'matchesA' : 'matchesB';

            const newMatch: MatchStickData = { id: crypto.randomUUID() };

            return {
                [keyScore]: state[keyScore] + 1,
                [keyMatches]: [...state[keyMatches], newMatch]
            };
        });
    },

    removeLastPoint: (team) => {
        set((state) => {
            const keyScore = team === 'A' ? 'scoreA' : 'scoreB';
            const keyMatches = team === 'A' ? 'matchesA' : 'matchesB';

            if (state[keyMatches].length === 0) return {};

            const newMatches = [...state[keyMatches]];
            newMatches.pop();

            return {
                [keyScore]: Math.max(0, state[keyScore] - 1),
                [keyMatches]: newMatches
            };
        });
    },

    setMatchstickSize: (size) => set({ matchstickSize: size }),

    reset: () => {
        set({
            scoreA: 0,
            scoreB: 0,
            matchesA: [],
            matchesB: []
        })
    }
}))
