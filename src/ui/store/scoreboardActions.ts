import { moveMatchstick, presentationState } from '@/ui/store/presentationStore'
import { sumarPunto, restarPunto } from '@/infrastructure/adapters/solidGameController'
import type { TeamId } from '@/core/domain/constants'

type Zone = 'A' | 'B'

const mapTeam = (zone: Zone): TeamId => zone === 'A' ? 'team_a' : 'team_b'

// Selectores reutilizables (también los usa el ruteo del arrastre asistido).

/** Último fósforo del depósito (el último en el array). */
export const lastInStorage = (): string | undefined =>
    [...presentationState.matches].reverse().find(m => m.zone === 'storage')?.id

/** Último fósforo de una zona de puntaje: el de mayor slotIndex. */
export const lastInZone = (zone: Zone): string | undefined =>
    presentationState.matches
        .filter(m => m.zone === zone && m.slotIndex !== null)
        .reduce<{ id: string; slotIndex: number } | undefined>(
            (best, m) => (best && best.slotIndex >= m.slotIndex! ? best : { id: m.id, slotIndex: m.slotIndex! }),
            undefined,
        )?.id

const slotsUsed = (zone: Zone): number =>
    presentationState.matches.filter(m => m.zone === zone && m.slotIndex !== null).length

/**
 * +1: suma el punto PRIMERO (si cruza 15→16, el core emite ZONE_RESET y la zona se vacía de forma
 * síncrona), y luego coloca el fósforo del punto nuevo. Así, al entrar a las buenas, queda 1 fósforo.
 * La animación la dispara el `createEffect` reactivo de `createMatchstickLogic`.
 */
export const addPointToZone = (zone: Zone) => {
    sumarPunto(mapTeam(zone))
    if (slotsUsed(zone) >= 15) return   // sin lugar (caso > límite, diferido): score sube sin fósforo
    const id = lastInStorage()
    if (id) moveMatchstick(id, zone)
}

/**
 * −1: saca el último fósforo de la zona y resta el punto (si cruza 16→15, el core emite ZONE_FILL
 * y la zona se rellena a 15). La animación la dispara el mismo efecto reactivo.
 */
export const removePointFromZone = (zone: Zone) => {
    const id = lastInZone(zone)
    if (id) moveMatchstick(id, 'storage')
    restarPunto(mapTeam(zone))
}
