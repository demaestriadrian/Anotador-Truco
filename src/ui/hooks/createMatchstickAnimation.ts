import gsap from 'gsap'
import { Draggable } from 'gsap/all'

gsap.registerPlugin(Draggable)

// Configuración de velocidad de animaciones (en segundos)
const ANIMATION_DURATION = {
    MOVE_TO_SLOT: 0.3,
    RETURN_TO_ORIGIN: 0.5,
    REMOVE_TO_STORAGE: 0.6,
    REMOVE_FADE: 0.3
}

/**
 * Extrae la rotación de un elemento a partir de su computed style.
 */
const getElementRotation = (element: Element): number => {
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
const getVariationRotation = (element: HTMLElement): number => {
    const transform = element.style.transform
    const match = transform.match(/rotate\(([-\d.]+)deg\)/)
    return match ? parseFloat(match[1]) : 0
}

/**
 * Crea controles de animación para un fósforo.
 * Recibe una función getter que retorna el elemento DOM actual.
 * No depende de ningún framework — usa GSAP directamente.
 */
export const createMatchstickAnimation = (getElement: () => HTMLElement | undefined) => {

    /**
     * Mueve el elemento visualmente a una posición destino relativa al viewport.
     * Calcula el delta desde la posición actual hasta el destino.
     */
    const animateMoveTo = (targetElement: Element, onComplete?: () => void) => {
        const el = getElement()
        if (!el) return

        const targetRect = targetElement.getBoundingClientRect()
        const currentRect = el.getBoundingClientRect()

        // Calcular centros para alinear mejor
        const targetCenterX = targetRect.left + targetRect.width / 2
        const targetCenterY = targetRect.top + targetRect.height / 2
        const currentCenterX = currentRect.left + currentRect.width / 2
        const currentCenterY = currentRect.top + currentRect.height / 2

        const deltaX = targetCenterX - currentCenterX
        const deltaY = targetCenterY - currentCenterY

        // Obtener la rotación del slot de destino
        const targetRotation = getElementRotation(targetElement)

        gsap.to(el, {
            x: `+=${deltaX}`,
            y: `+=${deltaY}`,
            rotation: targetRotation,
            duration: ANIMATION_DURATION.MOVE_TO_SLOT,
            ease: "power2.out",
            onComplete
        })
    }

    /**
     * Devuelve el elemento a su posición original (0,0).
     * Útil cuando se suelta en una zona inválida.
     */
    const animateReturnToOrigin = (onComplete?: () => void) => {
        const el = getElement()
        if (!el) return

        // Volver a la rotación de variación original
        const variationRotation = getVariationRotation(el)

        gsap.to(el, {
            x: 0,
            y: 0,
            rotation: variationRotation,
            duration: ANIMATION_DURATION.RETURN_TO_ORIGIN,
            ease: "power2.out",
            onComplete
        })
    }

    /**
     * Anima la salida del elemento (ej. al volver al almacenamiento).
     * Puede moverse hacia una posición específica (origen guardado) o desvanecerse.
     */
    const animateRemove = (origin?: { x: number, y: number }, onComplete?: () => void) => {
        const el = getElement()
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
                ease: "power2.inOut",
                onComplete
            })
        } else {
            // Fallback: Desvanecer y escalar hacia abajo
            gsap.to(el, {
                opacity: 0,
                scale: 0.5,
                duration: ANIMATION_DURATION.REMOVE_FADE,
                onComplete
            })
        }
    }

    return {
        animateMoveTo,
        animateReturnToOrigin,
        animateRemove
    }
}

// Tipo exportado para usar en otros módulos
export type MatchstickAnimationControls = ReturnType<typeof createMatchstickAnimation>
