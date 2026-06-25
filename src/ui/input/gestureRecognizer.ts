import { GESTURE } from '@/ui/constants'

export type GestureType = 'tap' | 'two-finger-tap' | 'drag-start' | 'drag-move' | 'drag-end'

export interface GestureEvent {
    type: GestureType
    x: number               // posición actual del puntero
    y: number
    startX: number          // posición del pointerdown que inició la interacción
    startY: number
    pointers: number
    button: number
    target: EventTarget | null   // target del pointerdown (no del evento actual)
    originalEvent: PointerEvent
}

type Emit = (g: GestureEvent) => void

interface PointerSample {
    startX: number; startY: number; x: number; y: number
    startTime: number; button: number
    target: EventTarget | null
}

// Contexto compartido que el recognizer pasa a cada detector. Aloja el estado por interacción
// (los detectores son singletons sin estado propio para no acoplar instancias entre sí).
export interface RecognizerContext {
    pointers: Map<number, PointerSample>
    maxPointers: number
    claimed: boolean                 // true cuando un detector "tomó" la interacción (p.ej. drag)
    claimedPointerId: number | null  // dedo que inició el arrastre, para seguir solo a ese
    claim: (pointerId: number) => void
    emit: Emit
}

// OCP: cada gesto es un detector con hooks opcionales. Sumar uno nuevo (swipe, 3 dedos) = nuevo
// archivo que implementa esta interfaz + registrarlo en el array. Sin editar el resto.
export interface GestureDetector {
    onDown?(s: PointerSample, ctx: RecognizerContext, e: PointerEvent): void
    onMove?(s: PointerSample, ctx: RecognizerContext, e: PointerEvent): void
    onUp?(s: PointerSample, ctx: RecognizerContext, e: PointerEvent): void
}

const dist = (s: PointerSample) => Math.hypot(s.x - s.startX, s.y - s.startY)

// Detector de arrastre: emite drag-start al cruzar el umbral (con 1 solo dedo), luego drag-move
// (solo del dedo que inició) y drag-end al soltar.
export const DragDetector: GestureDetector = {
    onMove(s, ctx, e) {
        if (ctx.claimed) {
            if (e.pointerId !== ctx.claimedPointerId) return   // seguir solo al dedo que arrastra
            ctx.emit({ type: 'drag-move', x: s.x, y: s.y, startX: s.startX, startY: s.startY, pointers: ctx.pointers.size, button: s.button, target: s.target, originalEvent: e })
            return
        }
        if (ctx.maxPointers !== 1) return
        if (dist(s) > GESTURE.MOVE_THRESHOLD) {
            ctx.claim(e.pointerId)
            ctx.emit({ type: 'drag-start', x: s.x, y: s.y, startX: s.startX, startY: s.startY, pointers: 1, button: s.button, target: s.target, originalEvent: e })
        }
    },
    onUp(s, ctx, e) {
        if (ctx.claimed && e.pointerId === ctx.claimedPointerId) {
            ctx.emit({ type: 'drag-end', x: s.x, y: s.y, startX: s.startX, startY: s.startY, pointers: 0, button: s.button, target: s.target, originalEvent: e })
        }
    },
}

// Detector de tap: al soltar el último dedo sin movimiento. 1 dedo / click izq = tap;
// 2+ dedos / click der = two-finger-tap (= restar).
export const TapDetector: GestureDetector = {
    onUp(s, ctx, e) {
        if (ctx.claimed || ctx.pointers.size > 0) return   // esperar a que se levante el último dedo
        if (dist(s) > GESTURE.MOVE_THRESHOLD) return
        const multi = ctx.maxPointers >= 2 || s.button === 2
        ctx.emit({
            type: multi ? 'two-finger-tap' : 'tap',
            x: s.x, y: s.y, startX: s.startX, startY: s.startY,
            pointers: ctx.maxPointers, button: s.button, target: s.target, originalEvent: e,
        })
    },
}

/**
 * Reconocedor de gestos. SRP: traduce Pointer Events a `GestureEvent` semánticos y nada más.
 * Es agnóstico al dominio (no sabe de puntaje, fósforos ni animaciones). Solo observa: nunca
 * hace preventDefault ni captura el puntero, así no interfiere con el Draggable de GSAP ni con
 * los inputs del header.
 */
export const createGestureRecognizer = (
    host: HTMLElement,
    onGesture: Emit,
    detectors: GestureDetector[] = [DragDetector, TapDetector],
) => {
    const pointers = new Map<number, PointerSample>()
    let maxPointers = 0
    let claimed = false
    let claimedPointerId: number | null = null

    const ctx: RecognizerContext = {
        pointers,
        get maxPointers() { return maxPointers },
        get claimed() { return claimed },
        get claimedPointerId() { return claimedPointerId },
        claim: (id) => { claimed = true; claimedPointerId = id },
        emit: onGesture,
    }

    const onDown = (e: PointerEvent) => {
        const s: PointerSample = {
            startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY,
            startTime: performance.now(), button: e.button, target: e.target,
        }
        pointers.set(e.pointerId, s)
        maxPointers = Math.max(maxPointers, pointers.size)
        detectors.forEach(d => d.onDown?.(s, ctx, e))
    }
    const onMove = (e: PointerEvent) => {
        const s = pointers.get(e.pointerId); if (!s) return
        s.x = e.clientX; s.y = e.clientY
        detectors.forEach(d => d.onMove?.(s, ctx, e))
    }
    const onUp = (e: PointerEvent) => {
        const s = pointers.get(e.pointerId); if (!s) return
        s.x = e.clientX; s.y = e.clientY
        pointers.delete(e.pointerId)
        detectors.forEach(d => d.onUp?.(s, ctx, e))
        if (pointers.size === 0) { maxPointers = 0; claimed = false; claimedPointerId = null }
    }

    // Fase de captura: ver el pointerdown antes que el Draggable de cada fósforo.
    host.addEventListener('pointerdown', onDown, true)
    host.addEventListener('pointermove', onMove, true)
    host.addEventListener('pointerup', onUp, true)
    host.addEventListener('pointercancel', onUp, true)

    return () => {
        host.removeEventListener('pointerdown', onDown, true)
        host.removeEventListener('pointermove', onMove, true)
        host.removeEventListener('pointerup', onUp, true)
        host.removeEventListener('pointercancel', onUp, true)
    }
}
