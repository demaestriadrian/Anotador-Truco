// Historial de anotaciones del dominio: tipos serializables + agrupación temporal PURA.
// Sin DOM, sin framework, sin reloj propio (los timestamps los pone el engine con su clock
// inyectado): esto lo hace determinístico y unitariamente testeable.
import type { TeamId } from '@/core/domain/constants'

// Una anotación que CAMBIÓ el score (los intentos sin efecto no se registran).
export interface ScoreHistoryEntry {
    teamId: TeamId
    delta: number        // +n / −n: lo que realmente cambió el score
    scoreAfter: number   // score del equipo tras la anotación
    timestamp: number    // epoch ms
}

// Grupo de anotaciones cercanas en el tiempo (reconstruye una "mano" de la partida).
export interface ScoreHistoryGroup {
    entries: ScoreHistoryEntry[]
    start: number        // timestamp de la primera entrada del grupo
    end: number          // timestamp de la última
}

/**
 * Agrupa las entradas por cercanía temporal: entradas consecutivas separadas por menos de
 * `gapMs` caen en el mismo grupo; un hueco mayor o igual abre un grupo nuevo.
 * Asume las entradas en orden cronológico (así las registra el engine).
 */
export const groupByTimeGap = (
    entries: ScoreHistoryEntry[],
    gapMs: number,
): ScoreHistoryGroup[] => {
    const groups: ScoreHistoryGroup[] = []
    for (const entry of entries) {
        const current = groups[groups.length - 1]
        if (current && entry.timestamp - current.end < gapMs) {
            current.entries.push(entry)
            current.end = entry.timestamp
        } else {
            groups.push({ entries: [entry], start: entry.timestamp, end: entry.timestamp })
        }
    }
    return groups
}
