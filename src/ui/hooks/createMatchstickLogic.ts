import { createEffect, on, onMount, onCleanup } from 'solid-js'
import { moveMatchstick, presentationState, consumeInstantSnap, type MatchStickData } from '@/ui/store/presentationStore'
import { registerMatchstick, unregisterMatchstick } from '@/ui/store/matchstickRegistry'
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

    // Confirma el destino del fósforo. Compartido por el Draggable de GSAP (drag directo) y por
    // el arrastre asistido (que resuelve la zona destino por coordenadas).
    const slotsUsed = (zone: 'A' | 'B'): number =>
        presentationState.matches.filter(m => m.zone === zone && m.slotIndex !== null).length

    const commitDrop = (targetZone: 'A' | 'B' | null) => {
        const data = getData()
        if (!data) return

        const currentZone = data.zone

        // Soltó fuera de zonas → vuelve al depósito (restar; puede cruzar 16→15 = ZONE_FILL).
        if (!targetZone) {
            if (currentZone === 'storage') {
                snapBackToCurrent()
            } else {
                animation.disableDraggable()
                moveMatchstick(data.id, 'storage')
                restarPunto(mapTeam(currentZone))
            }
            return
        }

        // Misma zona → rebota.
        if (targetZone === currentZone) {
            snapBackToCurrent()
            return
        }

        // Depósito → zona (sumar). Score primero: si la zona está llena (15→16) el core emite
        // ZONE_RESET y la vacía (síncrono), dejando lugar para este fósforo como 1º de las buenas.
        if (currentZone === 'storage') {
            animation.disableDraggable()
            sumarPunto(mapTeam(targetZone))
            if (slotsUsed(targetZone) < 15) {
                moveMatchstick(data.id, targetZone)
            } else {
                // Sin lugar (caso > límite, diferido): revertir y rebotar.
                restarPunto(mapTeam(targetZone))
                snapBackToCurrent()
            }
            return
        }

        // Zona → zona (A↔B). Score primero en el destino: si está lleno (15→16) el core emite
        // ZONE_RESET y lo vacía, dejando lugar para este fósforo como 1º de las buenas. Luego el
        // origen pierde el punto.
        animation.disableDraggable()
        sumarPunto(mapTeam(targetZone))
        if (slotsUsed(targetZone) < 15) {
            moveMatchstick(data.id, targetZone)
            restarPunto(mapTeam(currentZone))
        } else {
            // Destino sin lugar (caso > límite, diferido): revertir y rebotar.
            restarPunto(mapTeam(targetZone))
            snapBackToCurrent()
        }
    }

    const handleRelease = (draggable: DraggableParam) => commitDrop(resolveTargetZone(draggable))

    // ─── Arrastre asistido ───

    // Posiciona el fósforo centrado bajo el puntero (coords de pantalla → relativas al storage).
    const moveToPointer = (clientX: number, clientY: number) => {
        const storage = getStorage()
        const size = presentationState.matchstickSize
        if (!storage || !size) return

        const rect = storage.getBoundingClientRect()
        animation.setPosition({
            x: clientX - rect.left - size.width / 2,
            y: clientY - rect.top - size.height / 2,
            width: size.width,
            height: size.height,
            rotation: getData()?.variationRotation ?? 0,
        })
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

        // Registrar el handle para que el arrastre asistido pueda enganchar este fósforo.
        const data = getData()
        if (data) {
            registerMatchstick(data.id, {
                // El Draggable propio no se toca: el pointerdown no cayó sobre el fósforo.
                beginAssisted: (x, y) => moveToPointer(x, y),
                moveTo: (x, y) => moveToPointer(x, y),
                drop: (zone) => commitDrop(zone),
            })
        }
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
                if (consumeInstantSnap(data.id)) {
                    animation.setPosition(origin)
                    animation.enableDraggable()
                } else {
                    animation.animateToPosition(
                        origin,
                        ANIMATION_DURATION.RETURN_TO_STORAGE,
                        () => animation.enableDraggable()
                    )
                }
            } else if (data.slotIndex !== null) {
                const pos = getSlotPosition(data.zone, data.slotIndex, storage)
                if (pos) {
                    animation.disableDraggable()
                    if (consumeInstantSnap(data.id)) {
                        animation.setPosition(pos)
                        animation.enableDraggable()
                    } else {
                        animation.animateToPosition(
                            pos,
                            ANIMATION_DURATION.MOVE_TO_SLOT,
                            () => animation.enableDraggable()
                        )
                    }
                }
            }
        },
        { defer: true }
    ))

    onCleanup(() => {
        const data = getData()
        if (data) unregisterMatchstick(data.id)
        animation.destroyDraggable()
    })
}
