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
 * Función de utilidad para extraer la rotación de un elemento de su computed style.
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
 * Función de utilidad para extraer la rotación de variación guardada en el inline style.
 */
const getVariationRotation = (element: HTMLElement): number => {
    const transform = element.style.transform
    const match = transform.match(/rotate\(([-\d.]+)deg\)/)
    return match ? parseFloat(match[1]) : 0
}

/**
 * Hook para manejar las animaciones del fósforo.
 * Abstrae la complejidad de GSAP y expone métodos semánticos.
 */
export const useMatchstickAnimation = (elementRef: React.RefObject<HTMLElement | null>) => {

    /**
     * Mueve el elemento visualmente a una posición destino relativa al viewport.
     * Calcula el delta desde la posición actual hasta el destino.
     * 
     * @param targetElement Elemento DOM destino (slot vacío).
     * @param onComplete Callback al finalizar la animación.
     */
    const animateMoveTo = (targetElement: Element, onComplete?: () => void) => {
        if (!elementRef.current) return

        const targetRect = targetElement.getBoundingClientRect()
        const currentRect = elementRef.current.getBoundingClientRect()

        // Calcular centros para alinear mejor (especialmente con rotación)
        const targetCenterX = targetRect.left + targetRect.width / 2
        const targetCenterY = targetRect.top + targetRect.height / 2

        const currentCenterX = currentRect.left + currentRect.width / 2
        const currentCenterY = currentRect.top + currentRect.height / 2

        const deltaX = targetCenterX - currentCenterX
        const deltaY = targetCenterY - currentCenterY

        // Obtener la rotación del slot de destino
        const targetRotation = getElementRotation(targetElement)



        const finalRotation = targetRotation

        gsap.to(elementRef.current, {
            x: `+=${deltaX}`,
            y: `+=${deltaY}`,
            rotation: finalRotation,
            duration: ANIMATION_DURATION.MOVE_TO_SLOT,
            ease: "power2.out",
            onComplete: onComplete
        })
    }

    /**
     * Devuelve el elemento a su posición original (0,0 relativo a su montaje inicial/reset).
     * Útil cuando se suelta en una zona inválida.
     */
    const animateReturnToOrigin = (onComplete?: () => void) => {
        if (!elementRef.current) return

        // Volver a la rotación de variación original
        const variationRotation = getVariationRotation(elementRef.current)

        gsap.to(elementRef.current, {
            x: 0,
            y: 0,
            rotation: variationRotation,
            duration: ANIMATION_DURATION.RETURN_TO_ORIGIN,
            ease: "power2.out",
            onComplete: onComplete
        })
    }

    /**
     * Anima la salida del elemento (ej. al volver al almacenamiento).
     * Puede moverse hacia una posición específica (origen guardado) o simplemente desvanecerse.
     * 
     * @param origin - Posición opcional a la cual volar.
     * @param onComplete - Importante: Aquí se debe llamar a la eliminación del store.
     */
    const animateRemove = (origin?: { x: number, y: number }, onComplete?: () => void) => {
        if (!elementRef.current) return

        const variationRotation = getVariationRotation(elementRef.current)

        if (origin) {
            // Usamos centroides para consistencia si origin apuntara al centro, 
            // pero origin viene de storageOrigin que era Top-Left. 
            // Mantenemos Top-Left para animateRemove para ser consistente con cómo se guardó.
            const currentRect = elementRef.current.getBoundingClientRect()
            const deltaX = origin.x - currentRect.left
            const deltaY = origin.y - currentRect.top

            gsap.to(elementRef.current, {
                x: `+=${deltaX}`,
                y: `+=${deltaY}`,
                rotation: variationRotation, // Vuelve a su variación
                duration: ANIMATION_DURATION.REMOVE_TO_STORAGE,
                ease: "power2.inOut",
                onComplete: onComplete
            })
        } else {
            // Fallback: Desvanecer y escalar hacia abajo
            gsap.to(elementRef.current, {
                opacity: 0,
                scale: 0.5,
                duration: ANIMATION_DURATION.REMOVE_FADE,
                onComplete: onComplete
            })
        }
    }

    return {
        animateMoveTo,
        animateReturnToOrigin,
        animateRemove
    }
}
