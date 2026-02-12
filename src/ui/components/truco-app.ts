import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import './truco-scorekeeper.js'

@customElement('truco-app')
export class TrucoApp extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }

        .table {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: stretch;
            justify-content: center;
        }

        .table::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url(/img/baize.webp);
            background-size: cover;
            opacity: 0.3;
            z-index: -1;
        }

        #referenceDrag {
            position: absolute;
            top: 10svh;
            left: 0;
            width: 100svw;
            height: 100svh;
            background-color: red;
            opacity: 0;
            z-index: -1;
        }
    `

    render() {
        return html`
            <div id="referenceDrag"></div>
            <main class="table">
                <truco-scorekeeper></truco-scorekeeper>
            </main>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'truco-app': TrucoApp
    }
}
