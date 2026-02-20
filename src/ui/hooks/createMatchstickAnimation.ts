import gsap from 'gsap'
import { Flip, Draggable } from 'gsap/all'
import { ANIMATION_DURATION, FLIP_ANIMATION } from '@/ui/constants'

gsap.registerPlugin(Flip, Draggable)

/**
 * Callback que la lógica provee para manejar el evento de soltar el fósforo.
 * Recibe la instancia de Draggable para que la lógica pueda deshabilitarla
 * y consultar hitTest a través de resolveTargetZone.
 */
export type OnReleaseHandler = (draggable: Draggable) => void

/**
 * Interfaz para interactuar con el Draggable desde la lógica.
 * Permite deshabilitar el drag sin exponer GSAP directamente.
 */
export interface DraggableHandle {
    disable: () => void
    hitTest: (target: string, threshold: string) => boolean
}

/**
 * Crea controles de animación para un fósforo usando GSAP.
 *
 * Centraliza TODA la interacción con GSAP:
 * - Flip: captura de estado, animaciones de transición entre posiciones.
 * - Draggable: creación y gestión del drag & drop.
 * - Tweens: animaciones de snap back, fade out, clear transforms.
 *
 * No conoce el store, el core ni la lógica de negocio.
 * Recibe getters para acceder al elemento DOM actual.
 */
export const createMatchstickAnimation = (getElement: () => HTMLElement | undefined) => {

    /** Estado Flip de la posición original del fósforo en el storage. */
    let originState: Flip.FlipState | undefined

    /** Instancia del Draggable para cleanup. */
    let draggableInstance: Draggable[] | null = null

    // ─── Flip: captura y restauración de estado ───

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

    // ─── Flip: animaciones de transición ───

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
     * Anima la remoción del fósforo de vuelta al storage.
     *
     * Si existe un currentState, anima con Flip desde la posición actual
     * hacia la posición del storage (el elemento ya debe haber sido
     * re-parenteado antes de llamar esta función).
     * Si no existe, hace un fade out in-place como fallback.
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
                    saveOrigin()
                    onComplete?.()
                }
            })
        } else {
            gsap.to(el, {
                opacity: 0,
                scale: 0.5,
                duration: ANIMATION_DURATION.REMOVE_FADE,
                onComplete
            })
        }
    }

    // ─── Tweens auxiliares ───

    /**
     * Anima el retorno del fósforo a su posición de layout actual
     * (sin cambiar el DOM, solo deshaciendo el desplazamiento del drag).
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
     */
    const clearTransforms = () => {
        const el = getElement()
        if (!el) return
        gsap.set(el, { x: 0, y: 0, clearProps: "transform" })
    }

    // ─── Draggable ───

    /**
     * Crea una instancia de Draggable sobre el elemento.
     * @param onRelease - Callback invocado al soltar, con un handle para
     *                     interactuar con el Draggable sin exponer GSAP.
     */
    const initDraggable = (onRelease: OnReleaseHandler) => {
        const el = getElement()
        if (!el) return

        draggableInstance = Draggable.create(el, {
            type: 'x,y',
            zIndexBoost: false,
            onRelease: function (this: Draggable) {
                onRelease(this)
            }
        })
    }

    /**
     * Deshabilita la instancia del Draggable (ej: mientras anima).
     */
    const disableDraggable = (draggable: Draggable) => {
        draggable.disable()
    }

    /**
     * Consulta hitTest del Draggable contra un selector CSS.
     */
    const hitTest = (draggable: Draggable, target: string, threshold: string): boolean => {
        return draggable.hitTest(target, threshold)
    }

    /**
     * Destruye la instancia del Draggable. Debe llamarse al desmontar.
     */
    const destroyDraggable = () => {
        if (draggableInstance) {
            draggableInstance.forEach(d => d.kill())
            draggableInstance = null
        }
    }

    return {
        // Flip
        saveOrigin,
        getOrigin,
        captureState,
        animateFlipTo,
        animateFlipReturn,
        animateReturnToStorage,
        // Tweens
        animateSnapBack,
        clearTransforms,
        // Draggable
        initDraggable,
        disableDraggable,
        hitTest,
        destroyDraggable
    }
}

// Tipo exportado para usar en otros módulos
export type MatchstickAnimationControls = ReturnType<typeof createMatchstickAnimation>

// ─── Animación grupal de fósforos jugados ───

/**
 * Crea un controlador de animación Flip grupal para los fósforos jugados.
 *
 * Maneja la transición animada cuando los fósforos cambian de equipo
 * (se agregan/eliminan de las secciones A/B). Usa Flip para animar
 * las posiciones y onEnter/onLeave para fade in/out.
 *
 * Diseñado para usarse desde un efecto reactivo (ej: createEffect de SolidJS).
 * No conoce el store — solo recibe señales de que hubo un cambio.
 */
export const createMatchstickGroupAnimation = () => {
    const targets = '.matchstick-item'
    let flipState: Flip.FlipState | null = null

    /**
     * Debe llamarse cada vez que cambian las listas de fósforos jugados.
     * Anima desde el estado previamente capturado hacia el layout actual,
     * y luego captura el nuevo estado para la próxima transición.
     */
    const animateChanges = () => {
        if (flipState) {
            Flip.from(flipState, {
                targets,
                duration: FLIP_ANIMATION.DURATION,
                ease: FLIP_ANIMATION.EASE,
                stagger: FLIP_ANIMATION.STAGGER,
                simple: true,
                onEnter: elements => gsap.fromTo(elements,
                    { opacity: 0, scale: 0 },
                    { opacity: 1, scale: 1, duration: FLIP_ANIMATION.ENTER_DURATION }
                ),
                onLeave: elements => gsap.to(elements,
                    { opacity: 0, scale: 0, duration: FLIP_ANIMATION.LEAVE_DURATION }
                )
            })
        }

        // Capturar estado actual para la PRÓXIMA actualización
        flipState = Flip.getState(targets)
    }

    return { animateChanges }
}