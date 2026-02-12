import { ReactiveController, ReactiveControllerHost } from 'lit'
import gsap from 'gsap'
import { Draggable } from 'gsap/all'
import type { MatchstickAnimationController } from './MatchstickAnimationController.js'

gsap.registerPlugin(Draggable)

export interface MatchstickData {
    id: string
    origin?: { x: number; y: number }
    variation?: {
        rotation: number
        offsetX: number
        offsetY: number
    }
}

/**
 * Evento que el controlador dispara cuando un fósforo debe moverse de zona.
 * El componente padre (scorekeeper) escucha esto para actualizar su estado.
 */
export interface MatchstickMoveDetail {
    id: string
    from: 'storage' | 'A' | 'B'
    to: 'storage' | 'A' | 'B'
    origin?: { x: number; y: number }
}

/**
 * Controlador de lógica de fósforos (drag & drop).
 *
 * Se encarga de:
 * - Crear y gestionar la instancia de Draggable (GSAP)
 * - Detectar hit-test contra las secciones del equipo A y B
 * - Buscar el siguiente slot vacío en una sección
 * - Coordinar con MatchstickAnimationController para las animaciones
 * - Disparar eventos Custom al host cuando se necesita actualizar el estado
 *
 * No modifica el estado directamente. Solo dispara eventos que el padre escucha.
 */
export class MatchstickLogicController implements ReactiveController {
    private _host: ReactiveControllerHost & HTMLElement
    private _getElement: () => HTMLElement | null
    private _animation: MatchstickAnimationController
    private _draggable: Draggable[] | null = null
    private _storageOrigin: { x: number; y: number } | null = null

    // Propiedades que se actualizan desde el componente host
    data: MatchstickData | null = null
    isStoraged = false
    currentTeam: 'A' | 'B' | 'storage' = 'storage'

    constructor(
        host: ReactiveControllerHost & HTMLElement,
        getElement: () => HTMLElement | null,
        animation: MatchstickAnimationController
    ) {
        this._host = host
        this._getElement = getElement
        this._animation = animation
        host.addController(this)
    }

    hostConnected() {}

    hostDisconnected() {
        this._destroyDraggable()
    }

    /**
     * Inicializa o re-inicializa el Draggable.
     * Debe llamarse después de que el elemento esté renderizado
     * y cuando cambian las propiedades relevantes (data, isStoraged, currentTeam).
     */
    setup() {
        this._destroyDraggable()

        const el = this._getElement()
        if (!el || !this.data) return

        this._draggable = Draggable.create(el, {
            type: 'x,y',
            zIndexBoost: false,
            onPress: () => {
                // Si es template (storage), guardamos su posición visual como origen
                if (this.isStoraged) {
                    const rect = el.getBoundingClientRect()
                    this._storageOrigin = { x: rect.left, y: rect.top }
                }
            },
            onRelease: () => {
                this._handleRelease()
            },
        })
    }

    private _destroyDraggable() {
        if (this._draggable) {
            this._draggable.forEach((d) => d.kill())
            this._draggable = null
        }
    }

    /**
     * Busca el siguiente slot vacío (.matchstickPosition sin hijos)
     * dentro de todas las shadow roots de los truco-point-section del equipo indicado.
     *
     * Nota: Cada truco-point-section usa Shadow DOM, así que necesitamos buscar
     * a través de la jerarquía de shadow roots.
     */
    private _findNextEmptySlot(team: 'A' | 'B'): Element | null {
        // Buscar el truco-point-section correspondiente desde el document
        const sections = document.querySelectorAll('truco-point-section')

        for (const section of Array.from(sections)) {
            if (section.getAttribute('team') !== team) continue

            const shadowRoot = section.shadowRoot
            if (!shadowRoot) continue

            const slots = Array.from(
                shadowRoot.querySelectorAll('.matchstickPosition')
            )
            const emptySlot = slots.find((slot) => slot.children.length === 0)
            if (emptySlot) return emptySlot
        }

        return null
    }

    /**
     * Lógica principal de release/drop.
     * Determina dónde cayó el fósforo y ejecuta la acción correspondiente.
     */
    private _handleRelease() {
        if (!this._draggable?.[0] || !this.data) return

        const draggable = this._draggable[0]

        // Buscar las secciones para hit-test a través de shadow roots
        // Usamos el referenceDrag como área global visible
        const pointSections = document.querySelectorAll('truco-point-section')
        let hitA = false
        let hitB = false

        for (const section of Array.from(pointSections)) {
            const team = section.getAttribute('team')
            if (team === 'A' && draggable.hitTest(section, '50%')) hitA = true
            if (team === 'B' && draggable.hitTest(section, '50%')) hitB = true
        }

        let targetTeam: 'A' | 'B' | null = null
        if (hitA) targetTeam = 'A'
        else if (hitB) targetTeam = 'B'

        // Caso 1: Se soltó en una zona válida (A o B)
        if (targetTeam) {
            // Si el destino es el mismo equipo donde ya está, devolver al origen
            if (targetTeam === this.currentTeam) {
                this._animation.animateReturnToOrigin()
                return
            }

            const targetSlot = this._findNextEmptySlot(targetTeam)

            if (targetSlot) {
                // Deshabilitar drag mientras viaja
                draggable.disable()

                this._animation.animateMoveTo(targetSlot, () => {
                    const from = this.currentTeam === 'storage'
                        ? 'storage'
                        : this.currentTeam

                    this._dispatchMove(
                        this.data!.id,
                        from,
                        targetTeam!,
                        this._storageOrigin ?? undefined
                    )
                })
            } else {
                // Zona llena → volver al origen
                this._animation.animateReturnToOrigin()
            }
        }
        // Caso 2: Se soltó fuera o en zona inválida
        else {
            if (this.isStoraged) {
                // Venía del storage → vuelve al storage
                this._animation.animateReturnToOrigin()
            } else {
                // Era un item jugado → remover (devolver a storage)
                this._animation.animateRemove(this.data.origin, () => {
                    const from = this.currentTeam === 'storage'
                        ? 'storage'
                        : this.currentTeam

                    this._dispatchMove(this.data!.id, from, 'storage')
                })
            }
        }
    }

    /**
     * Despacha un CustomEvent 'matchstick-move' con los datos de movimiento.
     * El componente padre lo escuchará para actualizar su estado/store.
     */
    private _dispatchMove(
        id: string,
        from: 'storage' | 'A' | 'B',
        to: 'storage' | 'A' | 'B',
        origin?: { x: number; y: number }
    ) {
        this._host.dispatchEvent(
            new CustomEvent<MatchstickMoveDetail>('matchstick-move', {
                detail: { id, from, to, origin },
                bubbles: true,
                composed: true,
            })
        )
    }
}
