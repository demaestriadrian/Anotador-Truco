import { Show } from 'solid-js'
import '@/ui/styles/separator.css'

interface SeparatorProps {
    orientation: 'horizontal' | 'vertical'
    class?: string
}

const Separator = (props: SeparatorProps) => {
    return (
        <div
            class={`separator separator-${props.orientation} ${props.class ?? ''}`}
            id={`separator-${props.orientation === 'horizontal' ? 'h' : 'v'}`}
        >
            {/* Elementos internos para el estilo de cinta/bandera */}
            <Show when={props.orientation === 'vertical'}>
                <div class="flag-ribbon"></div>
            </Show>
        </div>
    )
}

export default Separator
