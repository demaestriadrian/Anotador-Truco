import React, { useRef, useMemo } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Draggable } from 'gsap/all'
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
    // const addPoint = useGameStore(state => state.addPoint) // DEPRECATED
    const moveFromStorage = useGameStore(state => state.moveFromStorage)
    const removeMatchstick = useGameStore(state => state.removeMatchstick)
    const moveMatchstick = useGameStore(state => state.moveMatchstick)

    // Refs de variables para rastrear el estado interactivo sin re-renderizar
    const storageOrigin = useRef<{ x: number, y: number } | null>(null)

    // Calcular posición aleatoria para templates
    // Calcular posición aleatoria para templates
    // NOTA: Esto se ejecuta en cada render, pero useMemo lo estabiliza.
    // SIN EMBARGO: ¿Si eliminamos del almacenamiento y volvemos a poner, nueva posición aleatoria?
    // ¿Idealmente guardar la posición aleatoria inicial en data.variation también?
    // Por ahora, manteniéndolo como está, pero si 'data' tiene variación, ¿probablemente deberíamos preferir eso sobre utils aleatorios si es posible?
    // El usuario solicitó "vuelvan a estar en la misma posicion".
    // 'data' viene del store. Si es 'isTemplate', data está definida ahora.

    // Usar data.variation si está disponible/apropiado o recurrir a aleatorio memorizado.
    // En realidad, para templates en almacenamiento, confiamos en el estilo randomPos.
    // Si queremos que se queden quietos, deberíamos guardar esta pos aleatoria en los datos del store al inicio.
    // El init del store actual genera `variation`. ¿Podemos mapear `variation.offsetX` etc a top/left?
    // ¿O simplemente dejar que `randomPos` lo maneje ya que ahora tienen claves únicas?
    // Si están claveados por ID, React preserva el estado del componente si la posición en el array no cambia.
    // Pero el array cambia al hacer splice.
    // Mejor confiar en el randomPos mapeado si la clave es estable.

    const randomPos = useMemo(() => {
        if (!isTemplate) return {}
        return {
            left: `${positionRandomX() * 100}%`,
            top: `${positionRandomY() * 100}%`
        }
    }, [isTemplate]) // ¿dependiente solo de isTemplate? Si soy la misma instancia de componente...

    useGSAP(() => {
        if (!containerRef.current) return

        // Si es un fósforo jugado (no template) y sin datos, no podemos interactuar correctamente
        // Ahora los templates también TIENEN datos.
        if (!data) return;

        Draggable.create(containerRef.current, {
            type: 'x,y',
            zIndexBoost: false, // manejamos zIndex via CSS/React
            onPress: function (this: Draggable) {
                // Capturar posición global actual como "origen" si somos un template
                if (isTemplate) {
                    const rect = (this.target as HTMLElement).getBoundingClientRect();
                    storageOrigin.current = { x: rect.left, y: rect.top };
                }
            },
            onRelease: function (this: Draggable) {
                // --- Lógica para Template (Almacenamiento) -> Agregar Punto ---
                if (isTemplate) {
                    const hitA = this.hitTest('#section-A')
                    const hitB = this.hitTest('#section-B')

                    if (hitA || hitB) {
                        const team = hitA ? 'A' : 'B';
                        // Pasar el origen de almacenamiento CAPTURADO al nuevo punto
                        // ¡Llamar a moveFromStorage en lugar de addPoint!
                        moveFromStorage(data.id, team, storageOrigin.current || undefined)
                    } else {
                        // Volver si no se soltó en una zona
                        gsap.to(this.target, { x: 0, y: 0, duration: 0.5 })
                    }
                    return
                }

                // --- Lógica para Fósforo Jugado ---
                if (!isTemplate && data) {

                    // 1. Verificar Mantener para Eliminar (si se suelta en zona válida usualmente, pero simplificado aquí)

                    const inZoneA = this.hitTest('#section-A', '50%'); // 50% de superposición para contar como "dentro"
                    const inZoneB = this.hitTest('#section-B', '50%');

                    // Determinar el equipo actual basado en dónde ESTABA (no lo guardamos en el componente, pero la verificación del store lo maneja)
                    // Podemos mover a Otra Zona
                    if (inZoneA) {
                        // Si estaba en B, mover a A. Si estaba en A, volver.
                        // Podemos llamar ciegamente a move. UseGameStore maneja "si ya está ahí".
                        moveMatchstick(data.id, 'A');
                        gsap.to(this.target, { x: 0, y: 0, duration: 0.3 }); // Ajustar posible desplazamiento visual
                    } else if (inZoneB) {
                        moveMatchstick(data.id, 'B');
                        gsap.to(this.target, { x: 0, y: 0, duration: 0.3 });
                    } else {
                        // Soltado AFUERA (Volver al Almacenamiento)
                        if (data.origin) {
                            // Calcular delta para volver al origen
                            const rect = (this.target as HTMLElement).getBoundingClientRect();
                            const deltaX = data.origin.x - rect.left;
                            const deltaY = data.origin.y - rect.top;

                            gsap.to(this.target, {
                                x: `+=${deltaX}`,
                                y: `+=${deltaY}`,
                                duration: 0.6,
                                ease: "power2.inOut",
                                onComplete: () => removeMatchstick(data.id)
                            });
                        } else {
                            // respaldo si no hay origen
                            removeMatchstick(data.id);
                        }
                    }
                }
            }
        })

    }, { scope: containerRef, dependencies: [isTemplate, data] })

    return (
        <picture
            ref={containerRef}
            className={`matchstick ${isTemplate ? 'template' : 'matchstick-item'}`} // Agregando clase para selección genérica
            data-flip-id={!isTemplate && data ? data.id : undefined}
            style={{
                display: 'block',
                position: 'absolute',
                width: overrideSize?.width ?? (isTemplate ? undefined : '100%'),
                height: overrideSize?.height ?? (isTemplate ? undefined : '100%'),
                ...randomPos,
                cursor: 'grab',
                zIndex: isTemplate ? 10 : 100,
                // Aplicar variación si existe
                transform: data?.variation ? `rotate(${data.variation.rotation}deg) translate(${data.variation.offsetX}px, ${data.variation.offsetY}px)` : undefined
            }}
        >
            <img ref={imgRef} src="/img/matchstickNew.webp" alt="matchstick" style={{ width: '100%', height: '100%' }} />
        </picture>
    )
}

export default MatchStick
