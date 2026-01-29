import gsap from 'gsap'
import { Draggable } from 'gsap/all'

gsap.registerPlugin(Draggable)

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

        const deltaX = targetRect.left - currentRect.left
        const deltaY = targetRect.top - currentRect.top

        gsap.to(elementRef.current, {
            x: `+=${deltaX}`,
            y: `+=${deltaY}`,
            duration: 0.3,
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

        gsap.to(elementRef.current, {
            x: 0,
            y: 0,
            duration: 0.5,
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

        if (origin) {
            const currentRect = elementRef.current.getBoundingClientRect()
            const deltaX = origin.x - currentRect.left
            const deltaY = origin.y - currentRect.top

            gsap.to(elementRef.current, {
                x: `+=${deltaX}`,
                y: `+=${deltaY}`,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: onComplete
            })
        } else {
            // Fallback: Desvanecer y escalar hacia abajo
            gsap.to(elementRef.current, {
                opacity: 0,
                scale: 0.5,
                duration: 0.3,
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
