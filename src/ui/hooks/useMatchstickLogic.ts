import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { Draggable } from 'gsap/all'
import { useGameStore, MatchStickData } from '@/ui/store/useGameStore'

// Interfaz para las animaciones que vienen del otro hook
interface AnimationControls {
    animateMoveTo: (target: Element, onComplete?: () => void) => void
    animateReturnToOrigin: (onComplete?: () => void) => void
    animateRemove: (origin?: { x: number, y: number }, onComplete?: () => void) => void
}

export const useMatchstickLogic = (
    data: MatchStickData | undefined,
    isTemplate: boolean,
    currentTeam: 'A' | 'B' | 'storage' | undefined,
    animation: AnimationControls,
    scope: React.RefObject<HTMLElement | null> // Scope para GSAP context
) => {
    const moveMatchstick = useGameStore(state => state.moveMatchstick)
    const storageOrigin = useRef<{ x: number, y: number } | null>(null)

    // Ayudante para encontrar slot vacío
    const findNextEmptySlot = (containerSelector: string): Element | null => {
        const container = document.querySelector(containerSelector)
        if (!container) return null

        // Convertimos a array para buscar
        const slots = Array.from(container.querySelectorAll('.matchstickPosition'))
        return slots.find(slot => slot.children.length === 0) || null
    }

    useGSAP(() => {
        if (!scope.current || !data) return

        Draggable.create(scope.current, {
            type: 'x,y',
            zIndexBoost: false,
            onPress: function () {
                // Si es template (storage), guardamos su posición visual actual como origen
                if (isTemplate) {
                    const rect = (this.target as HTMLElement).getBoundingClientRect();
                    storageOrigin.current = { x: rect.left, y: rect.top };
                }
            },
            onRelease: function () {
                const hitA = this.hitTest('#section-A', '50%')
                const hitB = this.hitTest('#section-B', '50%')

                let targetTeam: 'A' | 'B' | null = null
                if (hitA) targetTeam = 'A'
                else if (hitB) targetTeam = 'B'

                // Caso 1: Se soltó en una zona válida (A o B)
                if (targetTeam) {
                    // Si el destino es el mismo equipo donde ya está, devolvemos al origen
                    // para evitar que busque el "siguiente slot vacío" (que sería el incorrecto)
                    // y cree una desincronización visual.
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
                            // Determinamos 'from' explicitamente
                            const from = currentTeam || (isTemplate ? 'storage' : null);

                            moveMatchstick(data.id, from, targetTeam, storageOrigin.current || undefined)
                        })
                    } else {
                        // Zona llena -> Volver
                        animation.animateReturnToOrigin()
                    }
                }
                // Caso 2: Se soltó fuera (o en zona inválida)
                else {
                    if (isTemplate) {
                        // Si venía del storage y cae fuera, vuelve al storage (origin)
                        animation.animateReturnToOrigin()
                    } else {
                        // Si era un item jugado y cae fuera -> Eliminar (volver a storage)
                        animation.animateRemove(data.origin, () => {
                            const from = currentTeam || (isTemplate ? 'storage' : null);
                            moveMatchstick(data.id, from, 'storage')
                        })
                    }
                }
            }
        })

    }, { scope, dependencies: [data, isTemplate, currentTeam] })
}
