import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('truco-separator')
export class TrucoSeparator extends LitElement {
    @property({ type: String }) orientation: 'horizontal' | 'vertical' = 'horizontal'

    static styles = css`
        :host {
            display: block;
        }

        .separator-horizontal {
            width: 100%;
            background: rgba(255, 255, 255, 0.2);
            height: 2px;
            margin: 0;
            border-radius: 2px;
        }

        .separator-vertical {
            position: relative;
            height: 100%;
            width: 12px;
            min-width: 8px;
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            clip-path: polygon(0 0, 100% 0, 100% 95%, 50% 97%, 0 95%);
        }

        .flag-ribbon {
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                #75aadb 30%,
                #ffffff 30%,
                #ffffff 70%,
                #75aadb 70%
            );
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            position: relative;
        }

        .flag-ribbon::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                to bottom,
                transparent 0%,
                rgba(255, 255, 255, 0.2) 20%,
                transparent 40%,
                rgba(0, 0, 0, 0.1) 50%,
                transparent 60%,
                rgba(255, 255, 255, 0.2) 80%,
                transparent 100%
            );
            pointer-events: none;
        }
    `

    render() {
        if (this.orientation === 'vertical') {
            return html`
                <div class="separator-vertical">
                    <div class="flag-ribbon"></div>
                </div>
            `
        }

        return html`<div class="separator-horizontal"></div>`
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'truco-separator': TrucoSeparator
    }
}
