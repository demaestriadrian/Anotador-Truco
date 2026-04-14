import { gameState } from '@/ui/store/gameStore'
import PointSection from './PointSection'
import MatchStickStorage from './MatchStickStorage'
import TeamName from './TeamName'
import Separator from './Separator'
import { MAX_SCORE } from '@/core/domain/constants'

const ScoreKeeper = () => {
    return (
        <div class="scorekeeper">
            <header class="score-header">
                <div class="score-reference"><span>{gameState.scoreA}</span></div>
                <TeamName teamId="A" placeholder="NOSOTROS" />
                <div class="max-score">{MAX_SCORE}</div>
                <TeamName teamId="B" placeholder="ELLOS" />
                <div class="score-reference"><span>{gameState.scoreB}</span></div>
            </header>

            <Separator orientation="horizontal" />

            <div class="points">
                <PointSection team="A" />
                <Separator orientation="vertical" />
                <PointSection team="B" />
            </div>
            <MatchStickStorage />
        </div>
    )
}

export default ScoreKeeper
