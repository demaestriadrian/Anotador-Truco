import React, { useRef, useMemo } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { useGameStore, MatchStickData } from '@/ui/store/useGameStore'
import { positionRandomX, positionRandomY } from '@/ui/utils'

gsap.registerPlugin(Draggable)

interface MatchStickProps {
    data?: MatchStickData
    isTemplate?: boolean
    overrideSize?: { width: number | string, height: number | string }
}

const MatchStick: React.FC<MatchStickProps> = ({ data, isTemplate = false, overrideSize }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const addPoint = useGameStore(state => state.addPoint)
    const contextSafe = useGSAP({ scope: containerRef })

    // Calcular posición aleatoria solo una vez si es un template (storage)
    const randomPos = useMemo(() => {
        if (!isTemplate) return {}
        return {
            left: `${positionRandomX() * 100}%`,
            top: `${positionRandomY() * 100}%`
        }
    }, [isTemplate])

    useGSAP(() => {
        if (!containerRef.current || !isTemplate) return

        Draggable.create(containerRef.current, {
            type: 'x,y',
            onRelease: function () {
                const hitA = this.hitTest('#section-A')
                const hitB = this.hitTest('#section-B')

                if (hitA) {
                    addPoint('A')
                } else if (hitB) {
                    addPoint('B')
                }

                gsap.to(this.target, { x: 0, y: 0, duration: 0.5 })
            }
        })

    }, { scope: containerRef })

    return (
        <picture
            ref={containerRef}
            className={`matchstick ${isTemplate ? 'template' : ''}`}
            style={{
                display: 'block',
                position: 'absolute',
                width: overrideSize?.width ?? (isTemplate ? undefined : '100%'),
                height: overrideSize?.height ?? (isTemplate ? undefined : '100%'),
                ...randomPos
            }}
        >
            <img ref={imgRef} src="/img/matchstickNew.webp" alt="matchstick" style={{ width: '100%', height: '100%' }} />
        </picture>
    )
}

export default MatchStick
