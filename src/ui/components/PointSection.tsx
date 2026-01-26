import React from 'react'
import { useGameStore } from '@/ui/store/useGameStore'
import MatchStick from './MatchStick'

interface PointSectionProps {
    team: 'A' | 'B'
}

const PointSection: React.FC<PointSectionProps> = ({ team }) => {
    const matches = useGameStore(state => team === 'A' ? state.matchesA : state.matchesB)

    // Necesitamos 3 contenedores de 5 (15puntos) o 6 contenedores?
    // El diseño original tenia 3 ids: a1, a2, a3. Cada uno con 5 slots .matchstickPosition

    // Helpers para distribuir los hooks visuales
    // Vamos a renderizar la estructura fija de los "huecos" y poner los MatchSticks encima si existen.

    // Estrategia: "Slots".
    // TOTAL PUNTOS: 30? (15 malas, 15 buenas).
    // Estructura visual: 3 grupos de 5.

    return (
        <section id={`section-${team}`}>
            {[1, 2, 3].map(groupId => (
                <div key={groupId} className="containerMatchstick" id={`${team.toLowerCase()}${groupId}`}>
                    {[0, 1, 2, 3, 4].map(slotIndex => {
                        // Calcular índice global del fósforo: (groupId-1)*5 + slotIndex
                        const globalIndex = (groupId - 1) * 5 + slotIndex
                        const matchData = matches[globalIndex]

                        return (
                            <div key={slotIndex} className="matchstickPosition">
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
