// Puerto de persistencia de la partida: SOLO tipos, cero runtime (igual que `types.ts`).
//
// El core es quien PREGUNTA por una partida guardada (al construirse) y quien la guarda tras cada
// comando; el "dónde" (localStorage hoy, backend mañana) es un detalle del adapter que implemente
// este contrato. `PersistedMatchState` es un objeto plano serializable, mismo espíritu que
// `Command`/`GameSnapshot`: persistir local hoy = sincronizar por WebSocket mañana.
import type { TeamId, Limit } from '@/core/domain/constants'
import type { ScoreHistoryEntry } from '@/core/domain/history'

// Estado mínimo necesario para reconstruir una partida. Los campos derivados (phase, winner,
// finished) NO se persisten: el dominio los recalcula a partir de scores y límite.
export interface PersistedMatchState {
    teams: Record<TeamId, { name: string; score: number }>
    limit: Limit
    // Opcional: partidas guardadas antes de que existiera el historial siguen siendo válidas.
    history?: ScoreHistoryEntry[]
}

export interface MatchPersistencePort {
    // Devuelve la partida guardada, o null si no hay ninguna (o el dato es inválido).
    load(): PersistedMatchState | null
    // Guarda el estado actual de la partida (se llama tras cada comando).
    save(state: PersistedMatchState): void
}
