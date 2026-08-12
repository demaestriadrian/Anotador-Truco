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

// Tramo: anotaciones consecutivas del mismo equipo y mismo signo, fusionadas para leerse de un
// vistazo (+3 en vez de +1 +1 +1). Es una VISTA derivada: la bitácora fina no se toca.
export interface ScoreHistoryRun {
    teamId: TeamId
    delta: number        // suma del tramo: +3, −1, +2
    count: number        // cuántas anotaciones se fusionaron
    scoreAfter: number   // score tras la última anotación del tramo
    start: number        // timestamp de la primera
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

/**
 * Fusiona anotaciones CONSECUTIVAS del mismo equipo y mismo signo en un solo tramo.
 * El tramo se corta cuando cambia el equipo o cambia el signo (sumar → restar), así una racha
 * se lee "+3 −1" en vez de "+1 +1 +1 −1", y anotar al rival interrumpe la racha propia.
 * Es derivación pura de presentación: no modifica ni reordena la bitácora.
 */
export const collapseRuns = (entries: ScoreHistoryEntry[]): ScoreHistoryRun[] => {
    const runs: ScoreHistoryRun[] = []
    for (const entry of entries) {
        const current = runs[runs.length - 1]
        const continues = current
            && current.teamId === entry.teamId
            && Math.sign(current.delta) === Math.sign(entry.delta)

        if (continues) {
            current.delta += entry.delta
            current.count++
            current.scoreAfter = entry.scoreAfter
            current.end = entry.timestamp
        } else {
            runs.push({
                teamId: entry.teamId,
                delta: entry.delta,
                count: 1,
                scoreAfter: entry.scoreAfter,
                start: entry.timestamp,
                end: entry.timestamp,
            })
        }
    }
    return runs
}
