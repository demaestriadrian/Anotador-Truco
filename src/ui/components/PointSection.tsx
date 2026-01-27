import React, { useRef, useLayoutEffect } from 'react'
import { useGameStore } from '@/ui/store/useGameStore'
import MatchStick from './MatchStick'

interface PointSectionProps {
    team: 'A' | 'B'
}

const PointSection: React.FC<PointSectionProps> = ({ team }) => {
    const matches = useGameStore(state => team === 'A' ? state.matchesA : state.matchesB)
    const setMatchstickSize = useGameStore(state => state.setMatchstickSize)
    const slotRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        // Solo medir si somos el equipo A y el primer slot para evitar duplicidad
        if (team !== 'A' || !slotRef.current) return

        const updateSize = () => {
            if (slotRef.current) {
                const { width, height } = slotRef.current.getBoundingClientRect()
                setMatchstickSize({ width, height })
            }
        }

        const observer = new ResizeObserver(updateSize)
        observer.observe(slotRef.current)
        updateSize() // Medir initially

        return () => observer.disconnect()
    }, [team, setMatchstickSize])

    return (
        <section id={`section-${team}`}>
            {[1, 2, 3].map(groupId => (
                <div key={groupId} className="containerMatchstick" id={`${team.toLowerCase()}${groupId}`}>
                    {[0, 1, 2, 3, 4].map(slotIndex => {
                        // Calcular índice global del fósforo: (groupId-1)*5 + slotIndex
                        const globalIndex = (groupId - 1) * 5 + slotIndex
                        const matchData = matches[globalIndex]

                        // Ref al primer slot del primer grupo del equipo A
                        const isRefSlot = team === 'A' && groupId === 1 && slotIndex === 0

                        return (
                            <div
                                key={slotIndex}
                                className="matchstickPosition"
                                ref={isRefSlot ? slotRef : undefined}
                            >
                                {matchData && <MatchStick data={matchData} />}
                            </div>
                        )
                    })}
                </div>
            ))}
        </section>
    )
}

export default PointSection
