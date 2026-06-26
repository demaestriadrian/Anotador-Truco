// Reglas de eventos de dominio (lógica de negocio).
//
// El "cuándo emitir un evento" (reset de zona, victoria, finalización) es una REGLA, no una decisión
// de la UI. Cada regla examina la transición de estado (prev → next snapshot) y, si hace falta, el
// comando que la provocó, y devuelve los eventos de dominio que correspondan.
//
// OCP: agregar una regla nueva (otra transición visual, otra etapa del ciclo de vida, etc.) = sumar
// una entrada a DEFAULT_EVENT_RULES, sin tocar las reglas existentes ni el loop del engine.
import type { Command, GameSnapshot, GameEvent } from '@/core/ports/types'
import type { TeamId } from '@/core/domain/constants'
import { UMBRAL_BUENAS } from '@/core/domain/constants'

export interface GameEventRule {
    evaluate(prev: GameSnapshot, next: GameSnapshot, cmd: Command): GameEvent[]
}

// Cantidad de "buenas" (puntos por encima del umbral). 0 mientras se está en malas.
const buenas = (score: number): number => Math.max(0, score - UMBRAL_BUENAS)

const TEAMS: readonly TeamId[] = ['team_a', 'team_b']

// Entrar a las buenas (cruzar a la 1ª buena, p.ej. 15→16): se vacía la zona de ese equipo para
// empezar a contar las buenas desde 0. El puntaje acumulado del core NO se toca.
export const EnterBuenasRule: GameEventRule = {
    evaluate: (prev, next) => TEAMS.flatMap(id =>
        buenas(prev.teams[id].score) === 0 && buenas(next.teams[id].score) >= 1
            ? [{ type: 'ZONE_RESET', teamId: id, reason: 'enter-buenas' } as const]
            : []),
}

// Volver de las buenas a malas completas (p.ej. 16→15): se rellena la zona a 15 (malas completas).
export const ExitBuenasRule: GameEventRule = {
    evaluate: (prev, next) => TEAMS.flatMap(id =>
        buenas(prev.teams[id].score) >= 1 && buenas(next.teams[id].score) === 0
            ? [{ type: 'ZONE_FILL', teamId: id, reason: 'exit-buenas' } as const]
            : []),
}

// Victoria alcanzada / re-anunciada: cualquier intento de SUMAR que deje un ganador emite el aviso.
// Cubre dos casos con la misma regla: (1) el primer cruce del límite (null → equipo) y (2) seguir
// intentando sumar con la partida ya ganada (el core bloquea el punto, pero igual re-emite el aviso
// para que el modal vuelva a aparecer). NO finaliza ni borra nada: solo avisa (doble validación).
export const VictoryRule: GameEventRule = {
    evaluate: (_prev, next, cmd) =>
        cmd.type === 'ADD_POINTS' && next.winner !== null
            ? [{ type: 'MATCH_VICTORY', teamId: next.winner } as const]
            : [],
}

// Se deshizo el punto del ganador (winner → null por un REMOVE_POINTS). El guard de comando evita
// que esto también dispare al finalizar (que igualmente lleva winner → null).
export const VictoryUndoneRule: GameEventRule = {
    evaluate: (prev, next, cmd) =>
        prev.winner !== null && next.winner === null && cmd.type === 'REMOVE_POINTS'
            ? [{ type: 'MATCH_VICTORY_UNDONE', teamId: prev.winner } as const]
            : [],
}

// Finalización confirmada: disparada por el comando explícito FINALIZE_MATCH. Lleva el ganador previo
// (el que estaba vigente antes del reset) para que el pipeline de finalización lo conozca.
export const MatchFinalizedRule: GameEventRule = {
    evaluate: (prev, _next, cmd) =>
        cmd.type === 'FINALIZE_MATCH' && prev.winner !== null
            ? [{ type: 'MATCH_FINALIZED', winnerId: prev.winner } as const]
            : [],
}

// Conjunto de reglas activo por defecto. Agregar una etapa nueva del ciclo de vida = sumar acá la
// regla, sin tocar las existentes ni el engine.
export const DEFAULT_EVENT_RULES: GameEventRule[] = [
    EnterBuenasRule,
    ExitBuenasRule,
    VictoryRule,
    VictoryUndoneRule,
    MatchFinalizedRule,
]
