import React from 'react'
import { useGameStore } from '@/ui/store/useGameStore'
import MatchStick from './MatchStick'

const MatchStickStorage: React.FC = () => {
    // Array estático de fillers ahora reemplazado por real storage
    const storageMatches = useGameStore(state => state.storageMatches)
    const matchstickSize = useGameStore(state => state.matchstickSize)

    return (
        <div
            className="matchstickStorage"
            style={{
                opacity: matchstickSize ? 1 : 0,
                transition: 'opacity 0.5s ease-in'
            }}
        >
            {storageMatches.map((match) => (
                <MatchStick
                    key={match.id}
                    data={match} // Pass the real data!
                    isTemplate={true}
                    overrideSize={matchstickSize || undefined}
                />
            ))}
        </div>
    )
}

export default MatchStickStorage
