import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { positionRandomX, positionRandomY } from '@/ui/utils'
import './truco-matchstick.js'

export interface StorageMatchData {
    id: string
    variation?: {
        rotation: number
        offsetX: number
        offsetY: number
    }
}

@customElement('truco-matchstick-storage')
export class TrucoMatchstickStorage extends LitElement {
    @property({ type: Array, attribute: false }) storageItems: StorageMatchData[] = []
    @property({ type: Number, attribute: 'stick-width' }) stickWidth = 0
    @property({ type: Number, attribute: 'stick-height' }) stickHeight = 0

    // Posiciones aleatorias pre-calculadas para cada fósforo
    private _randomPositions = new Map<string, { x: number; y: number }>()

    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            position: relative;
        }

        .matchstickStorage {
            width: 100%;
            height: 100%;
            position: relative;
            transition: opacity 0.5s ease-in;
        }
    `

    private _getRandomPos(id: string) {
        if (!this._randomPositions.has(id)) {
            this._randomPositions.set(id, {
                x: positionRandomX(),
                y: positionRandomY(),
            })
        }
        return this._randomPositions.get(id)!
    }

    render() {
        const visible = this.stickWidth > 0 && this.stickHeight > 0

        return html`
            <div
                class="matchstickStorage"
                style="opacity: ${visible ? 1 : 0}"
            >
                ${this.storageItems.map((match) => {
                    const pos = this._getRandomPos(match.id)
                    return html`
                        <truco-matchstick
                            match-id=${match.id}
                            is-storaged
                            current-team="storage"
                            .randomX=${pos.x}
                            .randomY=${pos.y}
                            .rotation=${match.variation?.rotation ?? 0}
                            .offsetX=${match.variation?.offsetX ?? 0}
                            .offsetY=${match.variation?.offsetY ?? 0}
                            .overrideWidth=${this.stickWidth}
                            .overrideHeight=${this.stickHeight}
                        ></truco-matchstick>
                    `
                })}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'truco-matchstick-storage': TrucoMatchstickStorage
    }
}
