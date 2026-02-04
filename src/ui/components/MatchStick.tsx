import React, { useRef, useMemo } from 'react'
import { positionRandomX, positionRandomY } from '@/ui/utils'
import { MatchStickData } from '@/ui/store/useGameStore'
import { useMatchstickAnimation } from '@/ui/hooks/useMatchstickAnimation'
import { useMatchstickLogic } from '@/ui/hooks/useMatchstickLogic'

interface MatchStickProps {
    data?: MatchStickData
    isStoraged?: boolean
    overrideSize?: { width: number | string, height: number | string }
    currentTeam?: 'A' | 'B' | 'storage' // Nueva propiedad para saber el contexto
}

const MatchStick: React.FC<MatchStickProps> = ({
    data,
    isStoraged = false,
    overrideSize,
    currentTeam
}) => {
    const containerRef = useRef<HTMLElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    // Nota: 'randomPos' se usa para dar sensación de desorden en la caja de fósforos.
    // Solo aplica si es un template (está en el almacenamiento/caja).
    const randomPos = useMemo(() => {
        if (!isStoraged) return {}
        return {
            left: `${positionRandomX() * 100}%`,
            top: `${positionRandomY() * 100}%`
        }
    }, [isStoraged])

    // Inicializamos los hooks de animación y lógica
    const animation = useMatchstickAnimation(containerRef)
    useMatchstickLogic(data, isStoraged, currentTeam, animation, containerRef)

    return (
        <picture
            ref={containerRef}
            className={`matchstick ${isStoraged ? 'template' : 'matchstick-item'}`}
            // Usamos data-flip-id si queremos animaciones FLIP en el futuro (opcional por ahora)
            data-flip-id={!isStoraged && data ? data.id : undefined}
            style={{
                display: 'block',
                position: 'absolute',
                width: overrideSize?.width ?? (isStoraged ? undefined : '100%'),
                height: overrideSize?.height ?? (isStoraged ? undefined : '100%'),
                ...randomPos,
                cursor: 'grab',
                zIndex: isStoraged ? 10 : 100,
                // Aplicar variación visual (rotación/offset) solo si es template (en storage)
                transform: (isStoraged && data?.variation)
                    ? `rotate(${data.variation.rotation}deg) translate(${data.variation.offsetX}px, ${data.variation.offsetY}px)`
                    : undefined
            }}
        >
            <img
                ref={imgRef}
                src="/img/matchstickNew.webp"
                alt="fósforo"
                style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
            />
        </picture>
    )
}

export default MatchStick
