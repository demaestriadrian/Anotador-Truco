import React from 'react'
import PointSection from './PointSection'
import MatchStickStorage from './MatchStickStorage'

const ScoreKeeper: React.FC = () => {
    return (
        <div className="scorekeeper">
            <div className="score">
                <input id="nameTeam1" type="text" placeholder="Nosotros" />
                <input id="nameTeam2" type="text" placeholder="Ellos" />
            </div>
            <div id="separator-h"></div>
            <div className="points">
                <PointSection team="A" />
                <div id="separator-v"></div>
                <PointSection team="B" />
            </div>
            <MatchStickStorage />
        </div>
    )
}

export default ScoreKeeper
