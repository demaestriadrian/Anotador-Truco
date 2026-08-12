// Adapter de persistencia de la partida en localStorage.
//
// Implementa el puerto `MatchPersistencePort` del core: el core pregunta/guarda a través del
// contrato y este módulo resuelve el "dónde" (hoy localStorage; mañana podría ser un backend).
import type { MatchPersistencePort, PersistedMatchState } from '@/core/ports/persistence'
import { LIMITES_VALIDOS } from '@/core/domain/constants'
import type { TeamId, Limit } from '@/core/domain/constants'
import type { ScoreHistoryEntry } from '@/core/domain/history'

const STORAGE_KEY = 'anotador-truco/match'

const TEAM_IDS: readonly TeamId[] = ['team_a', 'team_b']

// Sanea el historial persistido: si no es un array queda vacío; las entradas inválidas se
// descartan una a una (un dato roto no invalida toda la partida).
const sanitizeHistory = (raw: unknown): ScoreHistoryEntry[] => {
    if (!Array.isArray(raw)) return []
    return raw.filter((e): e is ScoreHistoryEntry =>
        typeof e === 'object' && e !== null &&
        TEAM_IDS.includes((e as ScoreHistoryEntry).teamId) &&
        Number.isFinite((e as ScoreHistoryEntry).delta) &&
        Number.isFinite((e as ScoreHistoryEntry).scoreAfter) &&
        Number.isFinite((e as ScoreHistoryEntry).timestamp)
    )
}

// Valida la forma del dato crudo (puede venir corrupto o de una versión vieja del esquema).
const isValidState = (raw: unknown): raw is PersistedMatchState => {
    if (typeof raw !== 'object' || raw === null) return false
    const state = raw as Partial<PersistedMatchState>
    if (!LIMITES_VALIDOS.includes(state.limit as Limit)) return false
    for (const id of TEAM_IDS) {
        const team = state.teams?.[id]
        if (typeof team?.name !== 'string') return false
        if (typeof team.score !== 'number' || !Number.isFinite(team.score) || team.score < 0) return false
    }
    return true
}

export const localStorageMatchPersistence: MatchPersistencePort = {
    load: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (!raw) return null
            const parsed: unknown = JSON.parse(raw)
            if (isValidState(parsed)) {
                // `history` es opcional (partidas guardadas antes del historial no lo tienen).
                return { ...parsed, history: sanitizeHistory(parsed.history) }
            }
        } catch {
            // JSON corrupto o localStorage inaccesible: se trata como "no hay partida".
        }
        localStorage.removeItem(STORAGE_KEY)
        return null
    },

    save: (state: PersistedMatchState) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch {
            // Cuota llena o storage bloqueado: la partida sigue funcionando sin persistir.
        }
    },
}
