import type { GameRules } from './types'

/** Puntaje máximo para una partida estándar de truco */
export const MAX_SCORE = 30

/** Cantidad total de fósforos disponibles */
export const TOTAL_MATCHES = 29

/** Reglas por defecto: partida a 30 con malas */
export const DEFAULT_RULES: GameRules = {
    scoreLimit: 30,
    useMalas: true,
    malasThreshold: 15,
} as const
