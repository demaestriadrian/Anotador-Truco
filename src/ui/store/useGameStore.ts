import { createStore } from 'zustand/vanilla'
import MatchStick from '@/ui/components/MatchStick'

interface GameState {
    scoreA: number
    scoreB: number
    matchesA: MatchStick[]
    matchesB: MatchStick[]
    addPoint: (team: 'A' | 'B', matchStick: MatchStick) => void
    removeLastPoint: (team: 'A' | 'B') => MatchStick | undefined
    reset: () => void
}

export const gameStore = createStore<GameState>((set, get) => ({
    scoreA: 0,
    scoreB: 0,
    matchesA: [],
    matchesB: [],

    addPoint: (team, matchStick) => {
        const keyScore = team === 'A' ? 'scoreA' : 'scoreB'
        const keyMatches = team === 'A' ? 'matchesA' : 'matchesB'

        const currentMatches = get()[keyMatches]
        // Evitar duplicados si ya está en la lista (aunque la UI debería prevenirlo)
        if (currentMatches.includes(matchStick)) return

        set((state) => ({
            ...state,
            [keyScore]: state[keyScore] + 1,
            [keyMatches]: [...state[keyMatches], matchStick]
        }))
    },

    removeLastPoint: (team) => {
        const keyScore = team === 'A' ? 'scoreA' : 'scoreB'
        const keyMatches = team === 'A' ? 'matchesA' : 'matchesB'

        const currentMatches = get()[keyMatches]
        if (currentMatches.length === 0) return undefined

        const newMatches = [...currentMatches]
        const removedMatchStick = newMatches.pop()

        set((state) => ({
            ...state,
            [keyScore]: state[keyScore] - 1,
            [keyMatches]: newMatches
        }))

        return removedMatchStick
    },

    reset: () => {
        set({
            scoreA: 0,
            scoreB: 0,
            matchesA: [],
            matchesB: []
        })
    }
}))
