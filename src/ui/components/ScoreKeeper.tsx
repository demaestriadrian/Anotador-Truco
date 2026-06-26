import { gameState, cambiarNombre } from '@/infrastructure/adapters/solidGameController'
import { createScoreboardGestures } from '@/ui/hooks/createScoreboardGestures'
import { createCoreResetBridge } from '@/ui/hooks/createCoreResetBridge'
import { createMatchLifecycleBridge } from '@/ui/hooks/createMatchLifecycleBridge'
import PointSection from './PointSection'
import MatchStickStorage from './MatchStickStorage'
import TeamName from './TeamName'
import Separator from './Separator'

const ScoreKeeper = () => {
    let rootRef: HTMLDivElement | undefined

    // Gestos de puntaje (tap/click) y arrastre asistido sobre toda la zona de juego.
    createScoreboardGestures(() => rootRef)

    // Reacciona a las decisiones de reset/llenado de zona que emite el core (límite malas↔buenas).
    createCoreResetBridge()

    // Reacciona al ciclo de vida de la partida (victoria / deshacer / finalización).
    createMatchLifecycleBridge()

    return (
        <div class="scorekeeper" ref={rootRef} style={{ 'touch-action': 'none' }}>
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
