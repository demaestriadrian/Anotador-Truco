import { positionRandomX, positionRandomY } from '@/ui/utils'
import type { MatchStickData } from '@/ui/store/gameStore'
import { createMatchstickAnimation } from '@/ui/hooks/createMatchstickAnimation'
import { createMatchstickLogic } from '@/ui/hooks/createMatchstickLogic'

interface MatchStickProps {
    data: MatchStickData
}

const MatchStick = (props: MatchStickProps) => {
    let containerRef: HTMLElement | undefined

    const randomX = positionRandomX()
    const randomY = positionRandomY()

    const animation = createMatchstickAnimation(() => containerRef)

    createMatchstickLogic(
        () => containerRef,
        () => props.data,
        animation,
        { x: randomX, y: randomY }
    )

    return (
        <picture
            ref={containerRef}
            class="matchstick"
            data-id={props.data.id}
            style={{
                display: 'block',
                position: 'absolute',
                left: '0',
                top: '0',
                cursor: 'grab',
                'z-index': props.data.zone === 'storage' ? 10 : 100,
                'pointer-events': 'auto',
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
