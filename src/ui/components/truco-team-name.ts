import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('truco-team-name')
export class TrucoTeamName extends LitElement {
    @property({ type: String, attribute: 'team-id' }) teamId: 'A' | 'B' = 'A'
    @property({ type: String }) placeholder = ''
    @property({ type: String, attribute: 'initial-name' }) initialName = ''

    @state() private _name = ''

    connectedCallback() {
        super.connectedCallback()
        this._name = this.initialName
    }

    static styles = css`
        :host {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            flex: 1;
        }

        .team-name-input {
            width: 100%;
            background: transparent;
            border: none;
            font-size: 1.2rem;
            text-align: center;
            font-weight: 600;
            color: whitesmoke;
            outline: none;
            font-family: inherit;
            text-transform: uppercase;
            letter-spacing: 1px;
            user-select: text;
        }

        .team-name-input::placeholder {
            color: rgba(245, 245, 245, 0.814);
            text-transform: none;
            letter-spacing: normal;
        }
    `

    private _handleInput(e: Event) {
        const input = e.target as HTMLInputElement
        this._name = input.value
        this.dispatchEvent(
            new CustomEvent('name-change', {
                detail: { teamId: this.teamId, name: this._name },
                bubbles: true,
                composed: true,
            })
        )
    }

    render() {
        return html`
            <input
                type="text"
                class="team-name-input"
                .placeholder=${this.placeholder}
                .value=${this._name}
                @input=${this._handleInput}
                maxlength="15"
            />
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'truco-team-name': TrucoTeamName
    }
}
