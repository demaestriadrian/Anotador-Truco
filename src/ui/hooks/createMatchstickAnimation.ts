import gsap from 'gsap'
import { Flip } from 'gsap/all'
import { ANIMATION_DURATION } from '@/ui/constants'

gsap.registerPlugin(Flip)

/**
 * Crea controles de animación para un fósforo usando GSAP Flip.
 *
 * Flip captura el estado visual (posición, tamaño, rotación) del elemento
 * ANTES de un cambio en el DOM, y luego anima la transición desde la
 * posición anterior hacia la nueva posición real en el layout.
 *
 * Esto elimina la necesidad de calcular deltas manualmente con getBoundingClientRect.
 *
 * Recibe una función getter que retorna el elemento DOM actual.
 * No depende de ningún framework — usa GSAP Flip directamente.
 */
export const createMatchstickAnimation = (getElement: () => HTMLElement | undefined) => {

    /** Estado Flip de la posición original del fósforo en el storage. */
    let originState: Flip.FlipState | undefined

    /**
     * Guarda la posición actual del fósforo como su "origin" en el storage.
     * Debe llamarse una vez al montar el componente, cuando el fósforo
     * está en su posición inicial dentro del storage.
     */
    const saveOrigin = () => {
        const el = getElement()
        if (!el) return
        originState = Flip.getState(el)
    }

    /**
     * Retorna el estado origin guardado (puede ser undefined si aún no se guardó).
     */
    const getOrigin = (): Flip.FlipState | undefined => originState

    /**
     * Captura el estado actual del fósforo (posición, tamaño, transforms).
     * Debe llamarse ANTES de cualquier cambio en el DOM.
     */
    const captureState = (): Flip.FlipState | undefined => {
        const el = getElement()
        if (!el) return undefined
        return Flip.getState(el)
    }

    /**
     * Anima el fósforo desde un estado capturado hacia su nueva posición en el DOM.
     * El elemento YA debe haber sido movido/re-parentado al contenedor destino.
     */
    const animateFlipTo = (state: Flip.FlipState, onComplete?: () => void) => {
        const el = getElement()
        if (!el) return

        Flip.from(state, {
            targets: el,
            duration: ANIMATION_DURATION.MOVE_TO_SLOT,
            ease: "power2.out",
            absolute: true,
            onComplete
        })
    }

    /**
     * Anima el retorno del fósforo a su posición de origen en el DOM usando Flip.
     */
    const animateFlipReturn = (state: Flip.FlipState, onComplete?: () => void) => {
        const el = getElement()
        if (!el) return

        Flip.from(state, {
            targets: el,
            duration: ANIMATION_DURATION.RETURN_TO_ORIGIN,
            ease: "power2.out",
            absolute: true,
            onComplete
        })
    }

    /**
     * Anima la remoción del fósforo de vuelta al storage usando el origin guardado.
     *
     * Si existe un originState, anima con Flip desde la posición actual
     * hacia la posición original en el storage (el elemento ya debe haber
     * sido re-parenteado al storage antes de llamar esta función).
     * Si no existe origin, hace un fade out in-place como fallback.
     *
     * @param currentState - Estado capturado ANTES de mover el elemento al storage.
     * @param onComplete - Callback opcional al completar la animación.
     */
    const animateReturnToStorage = (
        currentState?: Flip.FlipState,
        onComplete?: () => void
    ) => {
        const el = getElement()
        if (!el) return

        if (currentState) {
            Flip.from(currentState, {
                targets: el,
                duration: ANIMATION_DURATION.REMOVE_TO_STORAGE,
                ease: "power2.inOut",
                absolute: true,
                onComplete: () => {
                    // Actualizar el origin por si el layout cambió
                    saveOrigin()
                    onComplete?.()
                }
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

    /**
     * Anima el retorno del fósforo a su posición de layout actual
     * (sin cambiar el DOM, solo deshaciendo el desplazamiento del drag).
     * Útil cuando se suelta en una zona inválida y no hay cambio de contenedor.
     */
    const animateSnapBack = (onComplete?: () => void) => {
        const el = getElement()
        if (!el) return

        gsap.to(el, {
            x: 0,
            y: 0,
            duration: ANIMATION_DURATION.RETURN_TO_ORIGIN,
            ease: "power2.out",
            onComplete
        })
    }

    /**
     * Resetea las transforms GSAP del elemento para que Flip pueda
     * calcular correctamente la posición real del layout.
     * Útil después de un drag donde GSAP aplicó x/y al elemento.
     */
    const clearTransforms = () => {
        const el = getElement()
        if (!el) return
        gsap.set(el, { x: 0, y: 0, clearProps: "transform" })
    }

    return {
        saveOrigin,
        getOrigin,
        captureState,
        animateFlipTo,
        animateFlipReturn,
        animateReturnToStorage,
        animateSnapBack,
        clearTransforms
    }
}

// Tipo exportado para usar en otros módulos
export type MatchstickAnimationControls = ReturnType<typeof createMatchstickAnimation>