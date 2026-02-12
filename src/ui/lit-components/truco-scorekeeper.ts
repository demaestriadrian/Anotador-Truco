import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import './truco-separator.js'
import './truco-team-name.js'
import './truco-point-section.js'
import './truco-matchstick-storage.js'

import type { PointMatchData } from './truco-point-section.js'
import type { StorageMatchData } from './truco-matchstick-storage.js'
import type { MatchstickMoveDetail } from './controllers/MatchstickLogicController.js'

const TOTAL_MATCHES = 29

function generateInitialMatches(): StorageMatchData[] {
    return Array.from({ length: TOTAL_MATCHES }, () => ({
        id: crypto.randomUUID(),
        variation: {
            rotation: (Math.random() - 0.5) * 10,
            offsetX: 0,
            offsetY: 0,
        },
    }))
}

@customElement('truco-scorekeeper')
export class TrucoScorekeeper extends LitElement {
    @property({ type: Number, attribute: 'score-a' }) scoreA = 0
    @property({ type: Number, attribute: 'score-b' }) scoreB = 0
    @property({ type: Number, attribute: 'max-score' }) maxScore = 30
    @property({ type: Array, attribute: false }) matchesA: PointMatchData[] = []
    @property({ type: Array, attribute: false }) matchesB: PointMatchData[] = []
    @property({ type: Array, attribute: false }) storageMatchItems: StorageMatchData[] =
        generateInitialMatches()

    // Tamaño del slot medido automáticamente desde truco-point-section (team A)
    @state() private _stickWidth = 0
    @state() private _stickHeight = 0

    static styles = css`
        :host {
            display: block;
            height: 100%;
        }

        .scorekeeper {
            aspect-ratio: 9 / 16;
            height: 100%;
            max-width: 100svw;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            position: relative;
        }

        .score-header {
            width: 100%;
            height: 12svh;
            display: grid;
            grid-template-columns: 1fr auto 2fr auto 1fr;
            align-items: center;
            justify-content: center;
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
            padding: 0 0.5rem;
        }

        .score-reference {
            padding: 0;
            font-weight: bold;
            color: whitesmoke;
            background-color: red;
            width: 1.15rem;
            aspect-ratio: 1;
            border-radius: 50%;
            display: grid;
            place-items: center;
            opacity: 0.5;
            align-self: start;
            margin-top: 0.5rem;
        }

        .score-reference span {
            font-size: 60%;
        }

        .max-score {
            font-size: 2.5rem;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.15);
            text-align: center;
            user-select: none;
        }

        .points {
            width: 100%;
            flex: 10;
            display: flex;
            position: relative;
        }

        .matchstickStorage {
            width: 100%;
            flex: 1.5;
            position: relative;
        }
    `

    private _handleMatchstickSize(e: CustomEvent<{ width: number; height: number }>) {
        this._stickWidth = e.detail.width
        this._stickHeight = e.detail.height
    }

    /**
     * Maneja el evento de movimiento de un fósforo.
     * Actualiza los arrays de fósforos y los scores según from/to.
     */
    private _handleMatchstickMove(e: CustomEvent<MatchstickMoveDetail>) {
        const { id, from, to, origin } = e.detail
        if (from === to) return

        // 1. Extraer el fósforo de su origen
        let match: StorageMatchData | PointMatchData | undefined

        if (from === 'storage') {
            const idx = this.storageMatchItems.findIndex((m) => m.id === id)
            if (idx !== -1) {
                match = { ...this.storageMatchItems[idx] }
                this.storageMatchItems = [
                    ...this.storageMatchItems.slice(0, idx),
                    ...this.storageMatchItems.slice(idx + 1),
                ]
            }
        } else if (from === 'A') {
            const idx = this.matchesA.findIndex((m) => m.id === id)
            if (idx !== -1) {
                match = { ...this.matchesA[idx] }
                this.matchesA = [
                    ...this.matchesA.slice(0, idx),
                    ...this.matchesA.slice(idx + 1),
                ]
                this.scoreA = Math.max(0, this.scoreA - 1)
            }
        } else if (from === 'B') {
            const idx = this.matchesB.findIndex((m) => m.id === id)
            if (idx !== -1) {
                match = { ...this.matchesB[idx] }
                this.matchesB = [
                    ...this.matchesB.slice(0, idx),
                    ...this.matchesB.slice(idx + 1),
                ]
                this.scoreB = Math.max(0, this.scoreB - 1)
            }
        }

        if (!match) return

        // Guardar origen si se proporciona
        if (origin) {
            (match as PointMatchData).origin = origin
        }

        // 2. Insertar en el destino
        if (to === 'storage') {
            this.storageMatchItems = [...this.storageMatchItems, match]
        } else if (to === 'A') {
            this.matchesA = [...this.matchesA, match as PointMatchData]
            this.scoreA++
        } else if (to === 'B') {
            this.matchesB = [...this.matchesB, match as PointMatchData]
            this.scoreB++
        }
    }

    render() {
        return html`
            <div
                    class="scorekeeper"
                    @matchstick-size=${this._handleMatchstickSize}
                    @matchstick-move=${this._handleMatchstickMove}
                >
                <header class="score-header">
                    <div class="score-reference">
                        <span>${this.scoreA}</span>
                    </div>

                    <truco-team-name
                        team-id="A"
                        placeholder="NOSOTROS"
                    ></truco-team-name>

                    <div class="max-score">${this.maxScore}</div>

                    <truco-team-name
                        team-id="B"
                        placeholder="ELLOS"
                    ></truco-team-name>

                    <div class="score-reference">
                        <span>${this.scoreB}</span>
                    </div>
                </header>

                <truco-separator orientation="horizontal"></truco-separator>

                <div class="points">
                    <truco-point-section
                        team="A"
                        .teamMatches=${this.matchesA}
                    ></truco-point-section>

                    <truco-separator orientation="vertical"></truco-separator>

                    <truco-point-section
                        team="B"
                        .teamMatches=${this.matchesB}
                    ></truco-point-section>
                </div>

                <div class="matchstickStorage">
                    <truco-matchstick-storage
                        .storageItems=${this.storageMatchItems}
                        .stickWidth=${this._stickWidth}
                        .stickHeight=${this._stickHeight}
                    ></truco-matchstick-storage>
                </div>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'truco-scorekeeper': TrucoScorekeeper
    }
}
