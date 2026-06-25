import { onMount, onCleanup } from 'solid-js'
import { createGestureRecognizer, type GestureEvent } from '@/ui/input/gestureRecognizer'
import { resolveZoneFromPoint, resolveOriginZone } from '@/ui/input/zones'
import { addPointToZone, removePointFromZone, lastInStorage, lastInZone } from '@/ui/store/scoreboardActions'
import { getMatchstickHandle, type MatchstickHandle } from '@/ui/store/matchstickRegistry'

/**
 * Composition root de la entrada: instancia el recognizer sobre el host y rutea cada gesto
 * a su acción. No clasifica gestos (eso lo hace el recognizer) ni anima (eso lo hace el
 * MatchstickHandle + el efecto reactivo). Solo decide "qué acción para qué gesto".
 */
export const createScoreboardGestures = (getHost: () => HTMLElement | undefined) => {
    let active: MatchstickHandle | null = null

    // OCP: diccionario implícito gesto → handler. Sumar un gesto = agregar un case.
    const onGesture = (g: GestureEvent) => {
        switch (g.type) {
            case 'tap': {
                const zone = resolveZoneFromPoint(g.x, g.y)
                if (zone) addPointToZone(zone)
                break
            }
            case 'two-finger-tap': {
                const zone = resolveZoneFromPoint(g.x, g.y)
                if (zone) removePointFromZone(zone)
                break
            }
            case 'drag-start': {
                // Drag directo sobre un fósforo (según dónde apoyó el dedo): lo maneja su propio
                // GSAP Draggable; no asistir.
                if ((g.target as HTMLElement | null)?.closest('.matchstick')) return
                // La zona origen se resuelve por el pointerdown, no por dónde cruzó el umbral.
                const origin = resolveOriginZone(g.startX, g.startY)
                if (!origin) return
                const id = origin === 'storage' ? lastInStorage() : lastInZone(origin)
                if (!id) return
                active = getMatchstickHandle(id) ?? null
                active?.beginAssisted(g.x, g.y)
                break
            }
            case 'drag-move':
                active?.moveTo(g.x, g.y)
                break
            case 'drag-end':
                active?.drop(resolveZoneFromPoint(g.x, g.y))
                active = null
                break
        }
    }

    onMount(() => {
        const host = getHost()
        if (!host) return

        const dispose = createGestureRecognizer(host, onGesture)
        // Anular el menú contextual del navegador para poder usar click derecho = restar.
        const onContext = (e: MouseEvent) => e.preventDefault()
        host.addEventListener('contextmenu', onContext)

        onCleanup(() => {
            dispose()
            host.removeEventListener('contextmenu', onContext)
        })
    })
}
