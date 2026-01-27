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

    // Variables refs to track interactive state without re-renders
    const storageOrigin = useRef<{ x: number, y: number } | null>(null)

    // Calcular posición aleatoria para templates
    // NOTE: This runs on every render, but useMemo stabilizes it. 
    // HOWEVER: If we remove from storage and put back, new random pos?
    // Ideally store initial random pos in data.variation too?
    // For now, keeping as is, but if 'data' has variation, we should probably prefer that over random utils if possible?
    // User requested "vuelvan a estar en la misma posicion".
    // 'data' comes from store. If 'isTemplate', data is defined now.

    // Use data.variation if available/appropriate or fallback to memoized random.
    // Actually, for templates in storage, we rely on randomPos style.
    // If we want them to stay put, we should store this random pos in the store data on init.
    // The current store init generates `variation`. We can map `variation.offsetX` etc to top/left?
    // Or just let `randomPos` handle it since they are uniquely keyed now?
    // If they are keyed by ID, React preserves component state if position in array doesn't change?
    // But array changes on splice.
    // Better to trust the mapped randomPos if the key is stable.

    const randomPos = useMemo(() => {
        if (!isTemplate) return {}
        return {
            left: `${positionRandomX() * 100}%`,
            top: `${positionRandomY() * 100}%`
        }
    }, [isTemplate]) // dependent on isTemplate only? If I am same component instance...

    useGSAP(() => {
        if (!containerRef.current) return

        // If it's a played matchstick (not template) and no data, we can't interact properly
        // Now templates also HAVE data.
        if (!data) return;

        Draggable.create(containerRef.current, {
            type: 'x,y',
            zIndexBoost: false, // manejamos zIndex via CSS/React
            onPress: function (this: Draggable) {
                // Capture current global position as "origin" if we are a template
                if (isTemplate) {
                    const rect = (this.target as HTMLElement).getBoundingClientRect();
                    storageOrigin.current = { x: rect.left, y: rect.top };
                }
            },
            onRelease: function (this: Draggable) {
                // --- Logic for Template (Storage) -> Add Point ---
                if (isTemplate) {
                    const hitA = this.hitTest('#section-A')
                    const hitB = this.hitTest('#section-B')

                    if (hitA || hitB) {
                        const team = hitA ? 'A' : 'B';
                        // Pass the CAPTURED storage origin to the new point
                        // Call moveFromStorage instead of addPoint!
                        moveFromStorage(data.id, team, storageOrigin.current || undefined)
                    } else {
                        // Snap back if not dropped in zone
                        gsap.to(this.target, { x: 0, y: 0, duration: 0.5 })
                    }
                    return
                }

                // --- Logic for Played Matchstick ---
                if (!isTemplate && data) {

                    // 1. Check for Hold to Remove (if dropped in valid zone usually, but simplified here)

                    const inZoneA = this.hitTest('#section-A', '50%'); // 50% overlap to count as "in"
                    const inZoneB = this.hitTest('#section-B', '50%');

                    // Determine current team based on where it WAS (we don't stored it in component, but store check handles it)
                    // We can move to Other Zone
                    if (inZoneA) {
                        // If I was in B, move to A. If in A, snap back.
                        // We can blindly call move. UseGameStore handles "if already there".
                        moveMatchstick(data.id, 'A');
                        gsap.to(this.target, { x: 0, y: 0, duration: 0.3 }); // Snap potential visual offset
                    } else if (inZoneB) {
                        moveMatchstick(data.id, 'B');
                        gsap.to(this.target, { x: 0, y: 0, duration: 0.3 });
                    } else {
                        // Dropped OUTSIDE (Return to Storage)
                        if (data.origin) {
                            // Calculate delta to return to origin
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
                            // fallback if no origin
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
            className={`matchstick ${isTemplate ? 'template' : 'matchstick-item'}`} // Adding class for generic selection
            data-flip-id={!isTemplate && data ? data.id : undefined}
            style={{
                display: 'block',
                position: 'absolute',
                width: overrideSize?.width ?? (isTemplate ? undefined : '100%'),
                height: overrideSize?.height ?? (isTemplate ? undefined : '100%'),
                ...randomPos,
                cursor: 'grab',
                zIndex: isTemplate ? 10 : 100,
                // Apply variation if exists
                transform: data?.variation ? `rotate(${data.variation.rotation}deg) translate(${data.variation.offsetX}px, ${data.variation.offsetY}px)` : undefined
            }}
        >
            <img ref={imgRef} src="/img/matchstickNew.webp" alt="matchstick" style={{ width: '100%', height: '100%' }} />
        </picture>
    )
}

export default MatchStick
