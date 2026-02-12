import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { MatchstickAnimationController } from './controllers/MatchstickAnimationController.js'
import { MatchstickLogicController } from './controllers/MatchstickLogicController.js'

@customElement('truco-matchstick')
export class TrucoMatchstick extends LitElement {
    @property({ type: Boolean, attribute: 'is-storaged', reflect: true }) isStoraged = false
    @property({ type: Number }) rotation = 0
    @property({ type: Number, attribute: 'offset-x' }) offsetX = 0
    @property({ type: Number, attribute: 'offset-y' }) offsetY = 0
    @property({ type: String, attribute: 'match-id' }) matchId = ''
    @property({ type: String, attribute: 'current-team' }) currentTeam: 'A' | 'B' | 'storage' = 'storage'
    @property({ type: Number, attribute: 'random-x' }) randomX = 0
    @property({ type: Number, attribute: 'random-y' }) randomY = 0
    @property({ type: Number, attribute: 'override-width' }) overrideWidth = 0
    @property({ type: Number, attribute: 'override-height' }) overrideHeight = 0

    // Getter para obtener el <picture> dentro del shadow DOM
    private _getPictureElement = (): HTMLElement | null =>
        this.shadowRoot?.querySelector('.matchstick') as HTMLElement | null

    // Controladores
    private _animation = new MatchstickAnimationController(this, this._getPictureElement)
    private _logic = new MatchstickLogicController(this, this._getPictureElement, this._animation)

    static styles = css`
        :host {
            display: block;
        }

        .matchstick {
            display: block;
            position: absolute;
            filter: drop-shadow(0.6svh 0.6svh 0.5svh rgba(0, 0, 0, 0.7));
            cursor: grab;
        }

        .matchstick.template {
            height: 28svw;
            width: 3.8svw;
        }

        .matchstick img {
            position: relative;
            height: 100%;
            width: 100%;
            pointer-events: none;
        }
    `

    protected firstUpdated() {
        this._syncLogicController()
        this._logic.setup()
    }

    protected updated(changedProperties: Map<string, unknown>) {
        // Re-sincronizar y re-setupear si cambian propiedades relevantes
        const relevantProps = ['matchId', 'isStoraged', 'currentTeam'] as const
        const needsReset = relevantProps.some((p) => changedProperties.has(p))

        if (needsReset) {
            this._syncLogicController()
            this._logic.setup()
        }
    }

    /**
     * Sincroniza las propiedades del componente con el controlador de lógica.
     */
    private _syncLogicController() {
        this._logic.data = {
            id: this.matchId,
            variation: {
                rotation: this.rotation,
                offsetX: this.offsetX,
                offsetY: this.offsetY,
            },
        }
        this._logic.isStoraged = this.isStoraged
        this._logic.currentTeam = this.currentTeam
    }

    render() {
        const isTemplate = this.isStoraged

        const dynamicStyles: Record<string, string> = {
            position: 'absolute',
            cursor: 'grab',
            zIndex: isTemplate ? '10' : '100',
        }

        if (isTemplate) {
            dynamicStyles.left = `${this.randomX * 100}%`
            dynamicStyles.top = `${this.randomY * 100}%`
            if (this.rotation || this.offsetX || this.offsetY) {
                dynamicStyles.transform = `rotate(${this.rotation}deg) translate(${this.offsetX}px, ${this.offsetY}px)`
            }
        }

        if (this.overrideWidth && this.overrideHeight) {
            dynamicStyles.width = `${this.overrideWidth}px`
            dynamicStyles.height = `${this.overrideHeight}px`
        } else if (!isTemplate) {
            dynamicStyles.width = '100%'
            dynamicStyles.height = '100%'
        }

        return html`
            <picture
                class="matchstick ${isTemplate ? 'template' : 'matchstick-item'}"
                style=${styleMap(dynamicStyles)}
                data-flip-id=${!isTemplate ? this.matchId : ''}
            >
                <img src="/img/matchstickNew.webp" alt="fósforo" />
            </picture>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'truco-matchstick': TrucoMatchstick
    }
}
