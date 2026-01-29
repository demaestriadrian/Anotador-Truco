import React, { useRef, useMemo } from 'react'
import { positionRandomX, positionRandomY } from '@/ui/utils'
import { MatchStickData } from '@/ui/store/useGameStore'
import { useMatchstickAnimation } from '@/ui/hooks/useMatchstickAnimation'
import { useMatchstickLogic } from '@/ui/hooks/useMatchstickLogic'

interface MatchStickProps {
    data?: MatchStickData
    isTemplate?: boolean
    overrideSize?: { width: number | string, height: number | string }
    currentTeam?: 'A' | 'B' | 'storage' // Nueva propiedad para saber el contexto
}

const MatchStick: React.FC<MatchStickProps> = ({
    data,
    isTemplate = false,
    overrideSize,
    currentTeam
}) => {
    const containerRef = useRef<HTMLElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    // Nota: 'randomPos' se usa para dar sensación de desorden en la caja de fósforos.
    // Solo aplica si es un template (está en el almacenamiento/caja).
    const randomPos = useMemo(() => {
        if (!isTemplate) return {}
        return {
            left: `${positionRandomX() * 100}%`,
            top: `${positionRandomY() * 100}%`
        }
    }, [isTemplate])

    // Inicializamos los hooks de animación y lógica
    const animation = useMatchstickAnimation(containerRef)
    useMatchstickLogic(data, isTemplate, currentTeam, animation, containerRef)

    return (
        <picture
            ref={containerRef}
            className={`matchstick ${isTemplate ? 'template' : 'matchstick-item'}`}
            // Usamos data-flip-id si queremos animaciones FLIP en el futuro (opcional por ahora)
            data-flip-id={!isTemplate && data ? data.id : undefined}
            style={{
                display: 'block',
                position: 'absolute',
                width: overrideSize?.width ?? (isTemplate ? undefined : '100%'),
                height: overrideSize?.height ?? (isTemplate ? undefined : '100%'),
                ...randomPos,
                cursor: 'grab',
                zIndex: isTemplate ? 10 : 100,
                // Aplicar variación visual (rotación/offset) si existe en los datos
                transform: data?.variation
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
