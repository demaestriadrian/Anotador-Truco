// Reglas de reset del marcador (lógica de negocio).
//
// El "cuándo se resetea/llena una zona" es una REGLA, no una decisión de la UI. Cada regla examina
// la transición de estado (prev → next snapshot) y devuelve los eventos de dominio que correspondan.
//
// OCP: agregar una regla nueva (fin de partida, "a 20", etc.) = sumar una entrada a
// DEFAULT_RESET_RULES, sin tocar las reglas existentes ni el loop del engine.
import type { GameSnapshot, GameEvent } from '@/core/ports/types'
import type { TeamId } from '@/core/domain/constants'
import { UMBRAL_BUENAS } from '@/core/domain/constants'

export interface ResetRule {
    evaluate(prev: GameSnapshot, next: GameSnapshot): GameEvent[]
}

// Cantidad de "buenas" (puntos por encima del umbral). 0 mientras se está en malas.
const buenas = (score: number): number => Math.max(0, score - UMBRAL_BUENAS)

const TEAMS: readonly TeamId[] = ['team_a', 'team_b']

// Entrar a las buenas (cruzar a la 1ª buena, p.ej. 15→16): se vacía la zona de ese equipo para
// empezar a contar las buenas desde 0. El puntaje acumulado del core NO se toca.
export const EnterBuenasRule: ResetRule = {
    evaluate: (prev, next) => TEAMS.flatMap(id =>
        buenas(prev.teams[id].score) === 0 && buenas(next.teams[id].score) >= 1
            ? [{ type: 'ZONE_RESET', teamId: id, reason: 'enter-buenas' } as const]
            : []),
}

// Volver de las buenas a malas completas (p.ej. 16→15): se rellena la zona a 15 (malas completas).
export const ExitBuenasRule: ResetRule = {
    evaluate: (prev, next) => TEAMS.flatMap(id =>
        buenas(prev.teams[id].score) >= 1 && buenas(next.teams[id].score) === 0
            ? [{ type: 'ZONE_FILL', teamId: id, reason: 'exit-buenas' } as const]
            : []),
}

// Conjunto de reglas activo por defecto. Seam OCP para el futuro (diferido): sumar acá una
// MatchEndRule (prev no finished → next finished) para el fin de partida.
export const DEFAULT_RESET_RULES: ResetRule[] = [EnterBuenasRule, ExitBuenasRule]
