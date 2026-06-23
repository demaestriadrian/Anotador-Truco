import { onMount, onCleanup } from 'solid-js'
import { Draggable } from 'gsap/all'
import gsap from 'gsap'
import { moveMatchstick, type MatchStickData } from '@/ui/store/presentationStore'
import { sumarPunto, restarPunto } from '@/infrastructure/adapters/solidGameController'
import type { TeamId } from '@/core/domain/constants'
import type { MatchstickAnimationControls } from './createMatchstickAnimation'

gsap.registerPlugin(Draggable)

type MatchstickZone = 'A' | 'B' | 'storage'

// Mapea la zona visual del equipo ('A'/'B') al id de dominio del core.
const mapTeam = (zone: 'A' | 'B'): TeamId => (zone === 'A' ? 'team_a' : 'team_b')

/**
 * Inicializa la lógica de drag & drop de un fósforo.
 *
 * Responsabilidades:
 * - Crear el Draggable de GSAP para manejar el arrastre.
 * - Determinar la zona de destino al soltar (hitTest).
 * - Mover lógicamente el fósforo en el DOM (re-parentar al contenedor destino).
 * - Mover el fósforo en el store de presentación y despachar los comandos al core.
 * - Delegar TODA la animación al módulo createMatchstickAnimation.
 *
 * NO calcula posiciones, deltas, ni rotaciones. Flip se encarga de eso.
 */
export const createMatchstickLogic = (
    getElement: () => HTMLElement | undefined,
    getData: () => MatchStickData | undefined,
    currentZone: MatchstickZone,
    animation: MatchstickAnimationControls
) => {
    let draggableInstance: Draggable[] | null = null

    const isStoraged = currentZone === 'storage'

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
     * Limpia transforms de GSAP antes de re-parentar para que
     * Flip calcule la posición real del nuevo layout.
     */
    const reparentToSlot = (el: HTMLElement, slot: Element) => {
        animation.clearTransforms()
        slot.appendChild(el)
    }

    /**
     * Devuelve el elemento DOM del fósforo al storage.
     */
    const reparentToStorage = (el: HTMLElement): boolean => {
        const storageContainer = document.querySelector('#matchstick-storage')
        if (!storageContainer) return false

        animation.clearTransforms()
        storageContainer.appendChild(el)
        return true
    }

    /**
     * Determina la zona de destino basándose en hitTest del Draggable.
     */
    const resolveTargetZone = (draggable: Draggable): 'A' | 'B' | null => {
        if (draggable.hitTest('#section-A', '50%')) return 'A'
        if (draggable.hitTest('#section-B', '50%')) return 'B'
        return null
    }

    /**
     * Maneja el caso: fósforo soltado en una zona de equipo válida.
     */
    const handleDropOnTeam = (el: HTMLElement, data: MatchStickData, targetTeam: 'A' | 'B', draggable: Draggable) => {
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
        draggable.disable()

        // 1. Capturar estado ANTES del cambio en el DOM
        const state = animation.captureState()
        if (!state) return

        // 2. Mover el elemento en el DOM (re-parent al slot destino)
        reparentToSlot(el, targetSlot)

        // 3. Animar con Flip desde la posición anterior a la nueva
        animation.animateFlipTo(state, () => {
            // 4. Al completar la animación, mover el fósforo visual...
            moveMatchstick(data.id, currentZone, targetTeam)

            // ...y despachar el/los comando(s) al core para mantenerlo consistente.
            // Si venía de otro equipo: resta a ese equipo y suma al destino.
            if (currentZone === 'A' || currentZone === 'B') {
                restarPunto(mapTeam(currentZone))
            }
            // Tanto si venía del storage como de otro equipo, suma al destino.
            sumarPunto(mapTeam(targetTeam))
        })
    }

    /**
     * Maneja el caso: fósforo soltado fuera de cualquier zona válida.
     */
    const handleDropOutside = (el: HTMLElement, data: MatchStickData, draggable: Draggable) => {
        if (isStoraged) {
            // Venía del storage y cayó fuera → volver a su lugar (snap back sin cambio de DOM)
            animation.animateSnapBack()
        } else {
            // Era un fósforo jugado y cayó fuera → devolver al storage
            draggable.disable()

            // 1. Capturar estado antes del cambio
            const state = animation.captureState()

            // 2. Mover en el DOM al storage
            const moved = reparentToStorage(el)
            if (!moved) {
                animation.animateSnapBack()
                return
            }

            // 3. Animar con Flip hacia la posición del storage
            animation.animateReturnToStorage(state, () => {
                // Mover el fósforo visual de vuelta al depósito...
                moveMatchstick(data.id, currentZone, 'storage')

                // ...y despachar el comando al core: restar el punto al equipo de origen.
                // En esta rama el fósforo venía de un equipo (no del storage).
                if (currentZone === 'A' || currentZone === 'B') {
                    restarPunto(mapTeam(currentZone))
                }
            })
        }
    }

    onMount(() => {
        const el = getElement()
        const data = getData()
        if (!el || !data) return

        // Guardar la posición de origen en el storage para poder volver después
        if (isStoraged) {
            animation.saveOrigin()
        }

        draggableInstance = Draggable.create(el, {
            type: 'x,y',
            zIndexBoost: false,
            onRelease: function (this: Draggable) {
                const currentData = getData()
                const currentEl = getElement()
                if (!currentData || !currentEl) return

                const targetTeam = resolveTargetZone(this)

                if (targetTeam) {
                    handleDropOnTeam(currentEl, currentData, targetTeam, this)
                } else {
                    handleDropOutside(currentEl, currentData, this)
                }
            }
        })
    })

    // Limpiar draggable al desmontar
    onCleanup(() => {
        if (draggableInstance) {
            draggableInstance.forEach(d => d.kill())
        }
    })
}
