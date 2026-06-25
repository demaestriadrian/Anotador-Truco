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
 * +1: toma el último fósforo del depósito y lo manda a la zona.
 * La animación de entrada la dispara el `createEffect` reactivo de `createMatchstickLogic`.
 */
export const addPointToZone = (zone: Zone) => {
    if (slotsUsed(zone) >= 15) return
    const id = lastInStorage()
    if (!id) return
    moveMatchstick(id, zone)
    sumarPunto(mapTeam(zone))
}

/**
 * −1: toma el último fósforo de la zona y lo devuelve al depósito.
 * La animación inversa la dispara el mismo efecto reactivo.
 */
export const removePointFromZone = (zone: Zone) => {
    const id = lastInZone(zone)
    if (!id) return
    moveMatchstick(id, 'storage')
    restarPunto(mapTeam(zone))
}
