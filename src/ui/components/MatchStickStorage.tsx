import React from 'react'
import MatchStick from './MatchStick'

const MatchStickStorage: React.FC = () => {
    // Array estático de fillers para llenar la caja visualmente
    const fillers = Array.from({ length: 30 })

    return (
        <div className="matchstickStorage">
            {fillers.map((_, i) => (
                <MatchStick key={i} isTemplate={true} />
            ))}
        </div>
    )
}

export default MatchStickStorage
