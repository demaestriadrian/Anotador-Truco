// Puerto del core: SOLO tipos, cero runtime.
//
// Estos contratos son objetos planos y SERIALIZABLES (JSON puro): no contienen
// clases, funciones ni referencias al framework. Por eso son reutilizables a
// futuro para sincronizar 2 instancias desde un backend: despachar un `Command`
// local hoy es lo mismo que enviarlo por WebSocket mañana, y el `GameSnapshot`
// que hoy refleja la UI mañana lo puede emitir el servidor a ambas instancias.
//
// Los tipos base `TeamId`, `Phase` y `Limit` son el contrato compartido del
// dominio: se IMPORTAN desde `@/core/domain/constants` y NO se redefinen acá.
import type { TeamId, Phase, Limit } from '@/core/domain/constants'

// Comandos serializables que la UI (o, a futuro, el backend) despacha al core.
// Cada variante es un objeto plano discriminado por `type`.
export type Command =
  | { type: 'ADD_POINTS';    teamId: TeamId; amount: number }
  | { type: 'REMOVE_POINTS'; teamId: TeamId; amount: number }
  | { type: 'SET_TEAM_NAME'; teamId: TeamId; name: string }
  | { type: 'SET_LIMIT';     limit: Limit }
  | { type: 'RESET' }

// Snapshot inmutable y serializable del estado de un equipo dentro del juego.
export interface TeamSnapshot { id: TeamId; name: string; score: number; phase: Phase }

// Snapshot inmutable y serializable del estado completo del juego.
// Es lo que el core emite hacia afuera (UI hoy, backend mañana).
export interface GameSnapshot {
  teams: Record<TeamId, TeamSnapshot>
  limit: Limit
  winner: TeamId | null
  finished: boolean
}

// Listener que recibe cada nuevo snapshot cuando el estado del core cambia.
export type GameStateListener = (state: GameSnapshot) => void

// Razón por la que el core decide resetear una zona. Union extensible (OCP): agregar 'match-end',
// etc., es ADITIVO y no obliga a modificar las reglas ni el engine existentes.
export type ResetReason = 'enter-buenas' | 'exit-buenas'

// Eventos de dominio que el core emite hacia afuera (UI hoy, backend mañana). Serializables,
// igual que Command/GameSnapshot: despachar local hoy = enviar por WebSocket mañana.
export type GameEvent =
  | { type: 'ZONE_RESET'; teamId: TeamId; reason: ResetReason }  // vaciar los fósforos de la zona
  | { type: 'ZONE_FILL';  teamId: TeamId; reason: ResetReason }  // llenar la zona (malas completas)

// Listener que recibe cada evento de dominio que el core emite.
export type GameEventListener = (event: GameEvent) => void
