import { positionRandomX, positionRandomY } from '@/ui/utils'
import type { MatchStickData } from '@/ui/store/gameStore'
import { createMatchstickAnimation } from '@/ui/hooks/createMatchstickAnimation'
import { createMatchstickLogic } from '@/ui/hooks/createMatchstickLogic'

// Convierte un valor numérico a string con 'px', o pasa strings tal cual
const toCss = (val: number | string | undefined): string | undefined => {
    if (val === undefined) return undefined
    return typeof val === 'number' ? `${val}px` : val
}

interface MatchStickProps {
    data?: MatchStickData
    isStoraged?: boolean
    overrideSize?: { width: number | string, height: number | string }
    currentTeam?: 'A' | 'B' | 'storage'
}

const MatchStick = (props: MatchStickProps) => {
    let containerRef: HTMLElement | undefined

    // Posición aleatoria solo para fósforos en storage (sensación de desorden)
    const randomPos = props.isStoraged
        ? { left: `${positionRandomX() * 100}%`, top: `${positionRandomY() * 100}%` }
        : {}

    // Crear controles de animación con getter del elemento DOM
    const animation = createMatchstickAnimation(() => containerRef)

    // Inicializar lógica de drag & drop
    createMatchstickLogic(
        () => containerRef,
        () => props.data,
        props.currentTeam ?? 'storage',
        animation
    )

    return (
        <picture
            ref={containerRef}
            class={`matchstick ${props.isStoraged ? 'template' : 'matchstick-item'}`}
            data-flip-id={props.data ? props.data.id : undefined}
            style={{
                display: 'block',
                position: 'absolute',
                width: toCss(props.overrideSize?.width) ?? (props.isStoraged ? undefined : '100%'),
                height: toCss(props.overrideSize?.height) ?? (props.isStoraged ? undefined : '100%'),
                ...randomPos,
                cursor: 'grab',
                'z-index': props.isStoraged ? 10 : 100,
                // Variación visual (rotación leve) solo para template (en storage)
                transform: (props.isStoraged && props.data)
                    ? `rotate(${props.data.variationRotation}deg)`
                    : undefined
            }}
        >
            <img
                src="/img/matchstickNew.webp"
                alt="fósforo"
                style={{ width: '100%', height: '100%', 'pointer-events': 'none' }}
            />
        </picture>
    )
}

export default MatchStick
