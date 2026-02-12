import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './truco-matchstick.js'

export interface PointMatchData {
    id: string
    origin?: { x: number; y: number }
    variation?: {
        rotation: number
        offsetX: number
        offsetY: number
    }
}

@customElement('truco-point-section')
export class TrucoPointSection extends LitElement {
    @property({ type: String }) team: 'A' | 'B' = 'A'
    @property({ type: Array, attribute: false }) teamMatches: PointMatchData[] = []

    private _resizeObserver: ResizeObserver | null = null

    static styles = css`
        :host {
            flex: 1;
            height: 100%;
            min-width: 30%;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
        }

        .containerMatchstick {
            width: 80%;
            aspect-ratio: 1;
            position: relative;
        }

        .matchstickPosition {
            display: block;
            position: absolute;
            height: 75%;
            width: 10%;
            border-radius: 1rem;
        }

        .matchstickPosition:nth-child(1) {
            top: 12.5%;
        }

        .matchstickPosition:nth-child(2) {
            top: -32.5%;
            left: 45%;
            transform: rotate(90deg);
        }

        .matchstickPosition:nth-child(3) {
            top: 12.5%;
            right: 0;
            transform: rotate(180deg);
        }

        .matchstickPosition:nth-child(4) {
            bottom: -32.5%;
            left: 45%;
            transform: rotate(270deg);
        }

        .matchstickPosition:nth-child(5) {
            top: 12.5%;
            left: 45%;
            transform: rotate(45deg);
        }
    `

    protected firstUpdated() {
        // Solo medir desde el equipo A para no duplicar
        if (this.team !== 'A') return

        const firstSlot = this.shadowRoot?.querySelector('.matchstickPosition')
        if (!firstSlot) return

        const emitSize = () => {
            const { width, height } = firstSlot.getBoundingClientRect()
            if (width > 0 && height > 0) {
                this.dispatchEvent(
                    new CustomEvent('matchstick-size', {
                        detail: { width, height },
                        bubbles: true,
                        composed: true,
                    })
                )
            }
        }

        this._resizeObserver = new ResizeObserver(emitSize)
        this._resizeObserver.observe(firstSlot)
        emitSize() // medición inicial
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this._resizeObserver?.disconnect()
        this._resizeObserver = null
    }

    render() {
        return html`
            ${[1, 2, 3].map(
                (groupId) => html`
                    <div
                        class="containerMatchstick"
                        id="${this.team.toLowerCase()}${groupId}"
                    >
                        ${[0, 1, 2, 3, 4].map((slotIndex) => {
                            const globalIndex = (groupId - 1) * 5 + slotIndex
                            const matchData = this.teamMatches[globalIndex]

                            return html`
                                <div class="matchstickPosition">
                                    ${matchData
                                        ? html`
                                              <truco-matchstick
                                                  match-id=${matchData.id}
                                                  current-team=${this.team}
                                              ></truco-matchstick>
                                          `
                                        : ''}
                                </div>
                            `
                        })}
                    </div>
                `
            )}
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'truco-point-section': TrucoPointSection
    }
}
