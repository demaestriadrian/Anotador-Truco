import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'

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
