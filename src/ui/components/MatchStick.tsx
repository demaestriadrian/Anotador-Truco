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
                        const containerId = `#section-${team}`;
                        const container = document.querySelector(containerId);

                        // Buscar el primer slot VACÍO visualmente
                        // Nota: Esto asume que los slots se llenan en orden.
                        // Buscamos .matchstickPosition que NO tenga un hijo .matchstick-item
                        let targetSlot: Element | null = null;
                        if (container) {
                            // Convertir NodeList a Array para usar find
                            const slots = Array.from(container.querySelectorAll('.matchstickPosition'));
                            targetSlot = slots.find(slot => slot.children.length === 0) || null;
                        }

                        if (targetSlot) {
                            // Calcular posición destino relativa al viewport
                            const targetRect = targetSlot.getBoundingClientRect();
                            const currentRect = (this.target as HTMLElement).getBoundingClientRect();

                            // Delta para moverse al destino
                            const deltaX = targetRect.left - currentRect.left;
                            const deltaY = targetRect.top - currentRect.top;

                            // Deshabilitar interacción durante la "fase de viaje"
                            this.disable();

                            gsap.to(this.target, {
                                x: `+=${deltaX}`,
                                y: `+=${deltaY}`,
                                duration: 0.3,
                                ease: "power2.out",
                                onComplete: () => {
                                    // AQUÍ actualizamos el estado
                                    moveFromStorage(data.id, team, storageOrigin.current || undefined);
                                    // Re-habilitar (aunque el componente se desmontará/re-renderizará como item de juego)
                                    // this.enable(); 
                                }
                            });
                        } else {
                            // Si no hay slots (raro, pero posible si está lleno), volver
                            gsap.to(this.target, { x: 0, y: 0, duration: 0.5 });
                        }

                    } else {
                        // Volver si no se soltó en una zona
                        gsap.to(this.target, { x: 0, y: 0, duration: 0.5 })
                    }
                    return
                }

                // --- Lógica para Fósforo Jugado ---
                if (!isTemplate && data) {

                    const inZoneA = this.hitTest('#section-A', '50%');
                    const inZoneB = this.hitTest('#section-B', '50%');

                    // Determinar destino deseado
                    let targetTeam: 'A' | 'B' | null = null;
                    if (inZoneA) targetTeam = 'A';
                    else if (inZoneB) targetTeam = 'B';

                    if (targetTeam) {
                        const containerId = `#section-${targetTeam}`;
                        const container = document.querySelector(containerId);

                        // Para mover, el slot destino podría ser el último, O uno nuevo si estamos cambiando de equipo.
                        // Simplificación: Buscar el primer slot vacío.
                        let targetSlot: Element | null = null;
                        if (container) {
                            const slots = Array.from(container.querySelectorAll('.matchstickPosition'));
                            // Excluir mi propio slot actual si estoy en la misma zona (pero GSAP me sacó visualmente)
                            // En realidad, 'slots' son los div contenedores. Yo estoy "volando" encima.
                            // Si me muevo a otra zona, busco vacío.
                            targetSlot = slots.find(slot => slot.children.length === 0) || null;
                        }

                        if (targetSlot) {
                            const targetRect = targetSlot.getBoundingClientRect();
                            const currentRect = (this.target as HTMLElement).getBoundingClientRect();
                            const deltaX = targetRect.left - currentRect.left;
                            const deltaY = targetRect.top - currentRect.top;

                            this.disable();

                            gsap.to(this.target, {
                                x: `+=${deltaX}`,
                                y: `+=${deltaY}`,
                                duration: 0.3,
                                ease: "power2.out",
                                onComplete: () => {
                                    moveMatchstick(data.id, targetTeam!);
                                }
                            });
                        } else {
                            // Si no encuentra slot (ej. lleno), volver a 0,0 (su posición original lógica)
                            gsap.to(this.target, { x: 0, y: 0, duration: 0.3 });
                        }

                    } else {
                        // Soltado AFUERA (Volver al Almacenamiento)
                        if (data.origin) {
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
