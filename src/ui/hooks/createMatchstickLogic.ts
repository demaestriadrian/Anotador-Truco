import { createEffect, on, onMount, onCleanup } from 'solid-js'
import { moveMatchstick, presentationState, type MatchStickData } from '@/ui/store/presentationStore'
import { sumarPunto, restarPunto } from '@/infrastructure/adapters/solidGameController'
import type { TeamId } from '@/core/domain/constants'
import type { MatchstickAnimationControls, AnimationTarget } from './createMatchstickAnimation'
import { ANIMATION_DURATION } from '@/ui/constants'

type DraggableParam = Parameters<MatchstickAnimationControls['hitTest']>[0]

interface StorageOrigin {
    x: number
    y: number
}

const mapTeam = (zone: 'A' | 'B'): TeamId => zone === 'A' ? 'team_a' : 'team_b'

/**
 * Calcula la posición de un slot relativa al contenedor del storage.
 */
const getSlotPosition = (
    zone: 'A' | 'B',
    slotIndex: number,
    storage: HTMLElement
): AnimationTarget | null => {
    const slot = document.querySelector(
        `.matchstickPosition[data-team="${zone}"][data-slot="${slotIndex}"]`
    ) as HTMLElement | null
    if (!slot) return null

    const slotRect = slot.getBoundingClientRect()
    const storageRect = storage.getBoundingClientRect()

    const slotCenterX = slotRect.left + slotRect.width / 2
    const slotCenterY = slotRect.top + slotRect.height / 2
    const slotWidth = slot.offsetWidth
    const slotHeight = slot.offsetHeight
    const rotation = parseFloat(slot.dataset.rotation || '0')

    return {
        x: slotCenterX - slotWidth / 2 - storageRect.left,
        y: slotCenterY - slotHeight / 2 - storageRect.top,
        width: slotWidth,
        height: slotHeight,
        rotation,
    }
}

/**
 * Inicializa la lógica de un fósforo: drag & drop y posicionamiento reactivo.
 *
 * El fósforo SIEMPRE permanece como hijo del storage en el DOM.
 * Se posiciona visualmente sobre los slots usando GSAP transforms.
 * Los puntos se despachan al core via sumarPunto/restarPunto.
 */
export const createMatchstickLogic = (
    getElement: () => HTMLElement | undefined,
    getData: () => MatchStickData | undefined,
    animation: MatchstickAnimationControls,
    randomPos: StorageOrigin
) => {
    let origin: AnimationTarget | null = null
    let initialized = false

    const getStorage = (): HTMLElement | null =>
        document.getElementById('matchstick-storage')

    const calculateOrigin = (
        size: { width: number; height: number },
        storage: HTMLElement
    ): AnimationTarget => {
        const storageRect = storage.getBoundingClientRect()
        const data = getData()

        return {
            x: randomPos.x * storageRect.width,
            y: randomPos.y * storageRect.height,
            width: size.width,
            height: size.height,
            rotation: data?.variationRotation ?? 0,
        }
    }

    // ─── Drag & Drop ───

    const resolveTargetZone = (draggable: DraggableParam): 'A' | 'B' | null => {
        if (animation.hitTest(draggable, '#section-A', '50%')) return 'A'
        if (animation.hitTest(draggable, '#section-B', '50%')) return 'B'
        return null
    }

    const snapBackToCurrent = () => {
        const data = getData()
        if (!data) return

        if (data.zone === 'storage' && origin) {
            animation.animateSnapBack({ x: origin.x, y: origin.y })
        } else if (data.zone !== 'storage' && data.slotIndex !== null) {
            const storage = getStorage()
            if (!storage) return
            const pos = getSlotPosition(data.zone, data.slotIndex, storage)
            if (pos) animation.animateSnapBack({ x: pos.x, y: pos.y })
        }
    }

    const handleRelease = (draggable: DraggableParam) => {
        const data = getData()
        if (!data) return

        const targetZone = resolveTargetZone(draggable)
        const currentZone = data.zone

        if (targetZone) {
            if (targetZone === currentZone) {
                snapBackToCurrent()
                return
            }

            // Verificar disponibilidad de slots antes de mover
            const slotsUsed = presentationState.matches.filter(
                m => m.zone === targetZone && m.slotIndex !== null
            ).length
            if (slotsUsed >= 15) {
                snapBackToCurrent()
                return
            }

            animation.disableDraggable()
            moveMatchstick(data.id, targetZone)

            if (currentZone === 'A' || currentZone === 'B') restarPunto(mapTeam(currentZone))
            sumarPunto(mapTeam(targetZone))
        } else {
            if (currentZone !== 'storage') {
                animation.disableDraggable()
                moveMatchstick(data.id, 'storage')
                restarPunto(mapTeam(currentZone as 'A' | 'B'))
            } else {
                snapBackToCurrent()
            }
        }
    }

    // ─── Ciclo de vida ───

    onMount(() => {
        const el = getElement()
        if (!el) return

        const storage = getStorage()
        const size = presentationState.matchstickSize
        if (storage && size) {
            origin = calculateOrigin(size, storage)
            animation.setPosition(origin)
        }

        animation.initDraggable(handleRelease)
        initialized = true
    })

    // Posicionamiento reactivo: anima cuando zone/slotIndex cambian
    createEffect(on(
        () => ({
            zone: getData()?.zone,
            slotIndex: getData()?.slotIndex,
            size: presentationState.matchstickSize,
        }),
        () => {
            if (!initialized) return

            const data = getData()
            const el = getElement()
            const size = presentationState.matchstickSize
            if (!data || !el || !size) return

            const storage = getStorage()
            if (!storage) return

            if (data.zone === 'storage') {
                origin = calculateOrigin(size, storage)
                animation.disableDraggable()
                animation.animateToPosition(
                    origin,
                    ANIMATION_DURATION.RETURN_TO_STORAGE,
                    () => animation.enableDraggable()
                )
            } else if (data.slotIndex !== null) {
                const pos = getSlotPosition(data.zone, data.slotIndex, storage)
                if (pos) {
                    animation.disableDraggable()
                    animation.animateToPosition(
                        pos,
                        ANIMATION_DURATION.MOVE_TO_SLOT,
                        () => animation.enableDraggable()
                    )
                }
            }
        },
        { defer: true }
    ))

    onCleanup(() => {
        animation.destroyDraggable()
    })
}
