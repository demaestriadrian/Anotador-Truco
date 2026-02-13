import { onMount, onCleanup } from 'solid-js'
import { Draggable } from 'gsap/all'
import gsap from 'gsap'
import { moveMatchstick, type MatchStickData } from '@/ui/store/gameStore'
import type { MatchstickAnimationControls } from './createMatchstickAnimation'

gsap.registerPlugin(Draggable)

/**
 * Inicializa la lógica de drag & drop de un fósforo.
 * Se ejecuta una vez al montar el componente (onMount de Solid).
 * GSAP controla todo el movimiento; Solid solo provee el contenedor DOM.
 */
export const createMatchstickLogic = (
    getElement: () => HTMLElement | undefined,
    getData: () => MatchStickData | undefined,
    isStoraged: boolean,
    currentTeam: 'A' | 'B' | 'storage' | undefined,
    animation: MatchstickAnimationControls
) => {
    let storageOrigin: { x: number, y: number } | null = null
    let draggableInstance: Draggable[] | null = null

    // Busca el siguiente slot vacío dentro de un contenedor
    const findNextEmptySlot = (containerSelector: string): Element | null => {
        const container = document.querySelector(containerSelector)
        if (!container) return null

        const slots = Array.from(container.querySelectorAll('.matchstickPosition'))
        return slots.find(slot => slot.children.length === 0) || null
    }

    onMount(() => {
        const el = getElement()
        const data = getData()
        if (!el || !data) return

        draggableInstance = Draggable.create(el, {
            type: 'x,y',
            zIndexBoost: false,
            onPress: function () {
                // Si es template (storage), guardamos su posición visual actual como origen
                if (isStoraged) {
                    const rect = (this.target as HTMLElement).getBoundingClientRect()
                    storageOrigin = { x: rect.left, y: rect.top }
                }
            },
            onRelease: function () {
                const data = getData()
                if (!data) return

                const hitA = this.hitTest('#section-A', '50%')
                const hitB = this.hitTest('#section-B', '50%')

                let targetTeam: 'A' | 'B' | null = null
                if (hitA) targetTeam = 'A'
                else if (hitB) targetTeam = 'B'

                // Caso 1: Se soltó en una zona válida (A o B)
                if (targetTeam) {
                    // Si el destino es el mismo equipo donde ya está, devolvemos al origen
                    if (targetTeam === currentTeam) {
                        animation.animateReturnToOrigin()
                        return
                    }

                    const containerSelector = `#section-${targetTeam}`
                    const targetSlot = findNextEmptySlot(containerSelector)

                    if (targetSlot) {
                        this.disable() // Deshabilitar mientras viaja

                        animation.animateMoveTo(targetSlot, () => {
                            // Al terminar la animación visual, actualizamos el estado lógico
                            const from = currentTeam || (isStoraged ? 'storage' : null)
                            moveMatchstick(data.id, from, targetTeam, storageOrigin || undefined)
                        })
                    } else {
                        // Zona llena → Volver
                        animation.animateReturnToOrigin()
                    }
                }
                // Caso 2: Se soltó fuera (o en zona inválida)
                else {
                    if (isStoraged) {
                        // Si venía del storage y cae fuera, vuelve al storage (origin)
                        animation.animateReturnToOrigin()
                    } else {
                        // Si era un item jugado y cae fuera → Eliminar (volver a storage)
                        animation.animateRemove(data.origin, () => {
                            const from = currentTeam || (isStoraged ? 'storage' : null)
                            moveMatchstick(data.id, from, 'storage')
                        })
                    }
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
