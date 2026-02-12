import { ReactiveController, ReactiveControllerHost } from 'lit'
import gsap from 'gsap'
import { Draggable } from 'gsap/all'

gsap.registerPlugin(Draggable)

// Configuración de velocidad de animaciones (en segundos)
const ANIMATION_DURATION = {
    MOVE_TO_SLOT: 0.3,
    RETURN_TO_ORIGIN: 0.5,
    REMOVE_TO_STORAGE: 0.6,
    REMOVE_FADE: 0.3,
}

/**
 * Extrae la rotación computada (CSS transforms) de un elemento.
 */
function getElementRotation(element: Element): number {
    const style = window.getComputedStyle(element)
    const transform = style.transform || style.webkitTransform
    if (!transform || transform === 'none') return 0

    const values = transform.split('(')[1].split(')')[0].split(',')
    const a = parseFloat(values[0])
    const b = parseFloat(values[1])
    return Math.round(Math.atan2(b, a) * (180 / Math.PI))
}

/**
 * Extrae la rotación de variación guardada en el inline style del elemento.
 */
function getVariationRotation(element: HTMLElement): number {
    const transform = element.style.transform
    const match = transform.match(/rotate\(([-\d.]+)deg\)/)
    return match ? parseFloat(match[1]) : 0
}

/**
 * Controlador de animaciones GSAP para un fósforo individual.
 *
 * Se encarga exclusivamente de animar el elemento visual:
 * - Mover hacia un slot destino
 * - Retornar a la posición original
 * - Animar la remoción (vuelta al storage o fade out)
 *
 * No contiene lógica de negocio ni interacción con el estado del juego.
 * Se le pasa una referencia al elemento DOM a animar (`targetElement`).
 */
export class MatchstickAnimationController implements ReactiveController {
    private _getElement: () => HTMLElement | null

    constructor(
        host: ReactiveControllerHost,
        getElement: () => HTMLElement | null
    ) {
        this._getElement = getElement
        host.addController(this)
    }

    hostConnected() {}
    hostDisconnected() {}

    /**
     * Mueve el elemento visualmente hacia un slot destino.
     * Calcula el delta entre la posición actual y el centro del destino,
     * y aplica la rotación del slot de destino.
     */
    animateMoveTo(targetSlot: Element, onComplete?: () => void) {
        const el = this._getElement()
        if (!el) return

        const targetRect = targetSlot.getBoundingClientRect()
        const currentRect = el.getBoundingClientRect()

        // Calcular centros para alinear correctamente (funciona bien con rotaciones)
        const targetCenterX = targetRect.left + targetRect.width / 2
        const targetCenterY = targetRect.top + targetRect.height / 2
        const currentCenterX = currentRect.left + currentRect.width / 2
        const currentCenterY = currentRect.top + currentRect.height / 2

        const deltaX = targetCenterX - currentCenterX
        const deltaY = targetCenterY - currentCenterY

        // Obtener la rotación CSS del slot de destino
        const targetRotation = getElementRotation(targetSlot)

        gsap.to(el, {
            x: `+=${deltaX}`,
            y: `+=${deltaY}`,
            rotation: targetRotation,
            duration: ANIMATION_DURATION.MOVE_TO_SLOT,
            ease: 'power2.out',
            onComplete,
        })
    }

    /**
     * Devuelve el elemento a su posición original (0,0 relativo a su montaje).
     * Restaura la rotación de variación del inline style.
     * Se usa cuando se suelta en una zona inválida.
     */
    animateReturnToOrigin(onComplete?: () => void) {
        const el = this._getElement()
        if (!el) return

        const variationRotation = getVariationRotation(el)

        gsap.to(el, {
            x: 0,
            y: 0,
            rotation: variationRotation,
            duration: ANIMATION_DURATION.RETURN_TO_ORIGIN,
            ease: 'power2.out',
            onComplete,
        })
    }

    /**
     * Anima la remoción del elemento.
     * Si tiene un `origin` (posición guardada del storage), vuela de vuelta allí.
     * Si no, hace un fade out con scale.
     */
    animateRemove(origin?: { x: number; y: number }, onComplete?: () => void) {
        const el = this._getElement()
        if (!el) return

        const variationRotation = getVariationRotation(el)

        if (origin) {
            const currentRect = el.getBoundingClientRect()
            const deltaX = origin.x - currentRect.left
            const deltaY = origin.y - currentRect.top

            gsap.to(el, {
                x: `+=${deltaX}`,
                y: `+=${deltaY}`,
                rotation: variationRotation,
                duration: ANIMATION_DURATION.REMOVE_TO_STORAGE,
                ease: 'power2.inOut',
                onComplete,
            })
        } else {
            // Fallback: desvanecer y reducir
            gsap.to(el, {
                opacity: 0,
                scale: 0.5,
                duration: ANIMATION_DURATION.REMOVE_FADE,
                onComplete,
            })
        }
    }
}
