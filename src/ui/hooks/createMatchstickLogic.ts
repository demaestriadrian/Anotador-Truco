import { onMount, onCleanup } from 'solid-js'
import { moveMatchstick, type MatchStickData } from '@/ui/store/gameStore'
import type { MatchstickAnimationControls } from './createMatchstickAnimation'

type MatchstickZone = 'A' | 'B' | 'storage'

/**
 * Inicializa la lógica de un fósforo: DOM, posiciones y estado.
 *
 * Responsabilidades:
 * - Gestionar las referencias al DOM (slots, contenedores).
 * - Determinar la zona de destino al soltar (via hitTest delegado a animation).
 * - Mover lógicamente el fósforo en el DOM (re-parentar al contenedor destino).
 * - Comunicar cambios al gameStore.
 * - Delegar TODA la interacción con GSAP al módulo createMatchstickAnimation.
 *
 * NO importa ni usa GSAP directamente.
 */
export const createMatchstickLogic = (
    getElement: () => HTMLElement | undefined,
    getData: () => MatchStickData | undefined,
    currentZone: MatchstickZone, 
    animation: MatchstickAnimationControls
) => {
    const isStoraged = currentZone === 'storage'

    // ─── DOM: consultas y manipulación ───

    /**
     * Busca el siguiente slot vacío dentro de una sección de equipo.
     */
    const findNextEmptySlot = (team: 'A' | 'B'): Element | null => {
        const container = document.querySelector(`#section-${team}`)
        if (!container) return null

        const slots = Array.from(container.querySelectorAll('.matchstickPosition'))
        return slots.find(slot => slot.children.length === 0) || null
    }

    /**
     * Mueve el elemento DOM del fósforo al slot destino.
     * Delega la limpieza de transforms a animation antes de re-parentar.
     */
    const reparentToSlot = (el: HTMLElement, slot: Element) => {
        animation.clearTransforms()
        slot.appendChild(el)
    }

    /**
     * Devuelve el elemento DOM del fósforo al storage.
     * Delega la limpieza de transforms a animation antes de re-parentar.
     */
    const reparentToStorage = (el: HTMLElement): boolean => {
        const storageContainer = document.querySelector('#matchstick-storage')
        if (!storageContainer) return false

        animation.clearTransforms()
        storageContainer.appendChild(el)
        return true
    }

    // ─── Resolución de zona destino ───

    /**
     * Determina la zona de destino basándose en hitTest (delegado a animation).
     */
    const resolveTargetZone = (draggable: Parameters<typeof animation.hitTest>[0]): 'A' | 'B' | null => {
        if (animation.hitTest(draggable, '#section-A', '50%')) return 'A'
        if (animation.hitTest(draggable, '#section-B', '50%')) return 'B'
        return null
    }

    // ─── Handlers de drop ───

    /**
     * Maneja el caso: fósforo soltado en una zona de equipo válida.
     */
    const handleDropOnTeam = (el: HTMLElement, data: MatchStickData, targetTeam: 'A' | 'B', draggable: Parameters<typeof animation.disableDraggable>[0]) => {
        // Si el destino es el mismo equipo donde ya está, snap back
        if (targetTeam === currentZone) {
            animation.animateSnapBack()
            return
        }

        const targetSlot = findNextEmptySlot(targetTeam)
        if (!targetSlot) {
            // Zona llena → snap back
            animation.animateSnapBack()
            return
        }

        // Deshabilitar drag mientras anima
        animation.disableDraggable(draggable)

        // 1. Capturar estado ANTES del cambio en el DOM
        const state = animation.captureState()
        if (!state) return

        // 2. Mover el elemento en el DOM (re-parent al slot destino)
        reparentToSlot(el, targetSlot)

        // 3. Animar con Flip desde la posición anterior a la nueva
        animation.animateFlipTo(state, () => {
            // 4. Al completar la animación, actualizar el store
            moveMatchstick(data.id, currentZone, targetTeam)
        })
    }

    /**
     * Maneja el caso: fósforo soltado fuera de cualquier zona válida.
     */
    const handleDropOutside = (el: HTMLElement, data: MatchStickData, draggable: Parameters<typeof animation.disableDraggable>[0]) => {
        if (isStoraged) {
            // Venía del storage y cayó fuera → volver a su lugar
            animation.animateSnapBack()
        } else {
            // Era un fósforo jugado y cayó fuera → devolver al storage
            animation.disableDraggable(draggable)

            // 1. Capturar estado antes del cambio
            const state = animation.captureState()

            // 2. Mover en el DOM al storage
            const moved = reparentToStorage(el)
            if (!moved) {
                animation.animateSnapBack()
                return
            }

            // 3. Animar hacia la posición del storage
            animation.animateReturnToStorage(state, () => {
                moveMatchstick(data.id, currentZone, 'storage')
            })
        }
    }

    // ─── Ciclo de vida ───

    onMount(() => {
        const el = getElement()
        const data = getData()
        if (!el || !data) return

        // Guardar la posición de origen en el storage para poder volver después
        if (isStoraged) {
            animation.saveOrigin()
        }

        // Inicializar el draggable delegando a animation,
        // pero la decisión de qué hacer al soltar la toma la lógica
        animation.initDraggable((draggable) => {
            const currentData = getData()
            const currentEl = getElement()
            if (!currentData || !currentEl) return

            const targetTeam = resolveTargetZone(draggable)

            if (targetTeam) {
                handleDropOnTeam(currentEl, currentData, targetTeam, draggable)
            } else {
                handleDropOutside(currentEl, currentData, draggable)
            }
        })
    })

    // Limpiar draggable al desmontar
    onCleanup(() => {
        animation.destroyDraggable()
    })
}
