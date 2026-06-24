import { gameState, cambiarNombre } from '@/infrastructure/adapters/solidGameController'
import PointSection from './PointSection'
import MatchStickStorage from './MatchStickStorage'
import TeamName from './TeamName'
import Separator from './Separator'

const ScoreKeeper = () => {
    return (
        <div class="scorekeeper">
            <header class="score-header">
                <div class="score-reference"><span>{gameState.teams.team_a.score}</span></div>

                <TeamName
                    teamId="A"
                    placeholder="NOSOTROS"
                    onNameChange={(name) => cambiarNombre('team_a', name)}
                />

                <div class="max-score">{gameState.limit}</div>

                <TeamName
                    teamId="B"
                    placeholder="ELLOS"
                    onNameChange={(name) => cambiarNombre('team_b', name)}
                />

                <div class="score-reference"><span>{gameState.teams.team_b.score}</span></div>
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
