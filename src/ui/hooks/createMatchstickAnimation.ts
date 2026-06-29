import gsap from 'gsap'
import { Draggable } from 'gsap/all'
import { ANIMATION_DURATION } from '@/ui/constants'

gsap.registerPlugin(Draggable)

export type OnReleaseHandler = (draggable: Draggable) => void

export interface AnimationTarget {
    x: number
    y: number
    width: number
    height: number
    rotation: number
}

/**
 * Controles de animación para un fósforo individual.
 * Usa GSAP puro (sin Flip): posiciona el elemento con transforms x/y.
 * El fósforo siempre permanece en el storage DOM; solo cambia su transform.
 */
export const createMatchstickAnimation = (getElement: () => HTMLElement | undefined) => {

    let draggableInstance: Draggable[] | null = null

    const setPosition = (target: AnimationTarget) => {
        const el = getElement()
        if (!el) return

        gsap.set(el, {
            x: target.x,
            y: target.y,
            width: target.width,
            height: target.height,
            rotation: target.rotation,
            overwrite: true,   // matar cualquier tween en curso del mismo fósforo
        })
    }

    const animateToPosition = (
        target: AnimationTarget,
        duration: number,
        onComplete?: () => void
    ) => {
        const el = getElement()
        if (!el) return

        gsap.to(el, {
            x: target.x,
            y: target.y,
            width: target.width,
            height: target.height,
            rotation: target.rotation,
            duration,
            ease: 'power2.out',
            overwrite: true,   // un tween nuevo mata al anterior del mismo fósforo (evita que un
            onComplete,        // tween de reset más largo "gane" y deje el fósforo en el depósito)
        })
    }

    // Rebote a la posición actual del fósforo. Restaura el target COMPLETO (no solo x/y): así, si el
    // arrastre asistido cambió la rotación a la del depósito, el rebote a un slot recupera la rotación
    // del slot (data-rotation). En el drag directo el target ya coincide, así que es inocuo.
    const animateSnapBack = (
        target: AnimationTarget,
        onComplete?: () => void
    ) => {
        const el = getElement()
        if (!el) return

        gsap.to(el, {
            x: target.x,
            y: target.y,
            width: target.width,
            height: target.height,
            rotation: target.rotation,
            duration: ANIMATION_DURATION.SNAP_BACK,
            ease: 'power2.out',
            overwrite: true,
            onComplete,
        })
    }

    // ─── Draggable ───

    const initDraggable = (onRelease: OnReleaseHandler) => {
        const el = getElement()
        if (!el) return

        draggableInstance = Draggable.create(el, {
            type: 'x,y',
            zIndexBoost: false,
            onDragStart: function () {
                gsap.set(el, { zIndex: 1000 })
            },
            onRelease: function (this: Draggable) {
                onRelease(this)
            },
        })
    }

    const enableDraggable = () => {
        draggableInstance?.[0]?.enable()
    }

    const disableDraggable = () => {
        draggableInstance?.[0]?.disable()
    }

    const hitTest = (draggable: Draggable, target: string, threshold: string): boolean => {
        return draggable.hitTest(target, threshold)
    }

    const destroyDraggable = () => {
        if (draggableInstance) {
            draggableInstance.forEach(d => d.kill())
            draggableInstance = null
        }
    }

    return {
        setPosition,
        animateToPosition,
        animateSnapBack,
        initDraggable,
        enableDraggable,
        disableDraggable,
        hitTest,
        destroyDraggable,
    }
}

export type MatchstickAnimationControls = ReturnType<typeof createMatchstickAnimation>
