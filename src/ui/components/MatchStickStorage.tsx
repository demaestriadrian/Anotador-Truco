import React from 'react'
import { useGameStore } from '@/ui/store/useGameStore'
import MatchStick from './MatchStick'

const MatchStickStorage: React.FC = () => {
    // Array estático de fillers para llenar la caja visualmente
    const fillers = Array.from({ length: 30 })
    const matchstickSize = useGameStore(state => state.matchstickSize)

    return (
        <div
            className="matchstickStorage"
            style={{
                opacity: matchstickSize ? 1 : 0,
                transition: 'opacity 0.5s ease-in'
            }}
        >
            {fillers.map((_, i) => (
                <MatchStick
                    key={i}
                    isTemplate={true}
                    overrideSize={matchstickSize || undefined}
                />
            ))}
        </div>
    )
}

export default MatchStickStorage
