import { createEffect, on } from 'solid-js'
import { gameState } from '@/ui/store/gameStore'
import PointSection from './PointSection'
import MatchStickStorage from './MatchStickStorage'
import TeamName from './TeamName'
import Separator from './Separator'
import { MAX_SCORE } from '@/core/domain/constants'
import { createMatchstickGroupAnimation } from '@/ui/hooks/createMatchstickAnimation'

const ScoreKeeper = () => {
    const { animateChanges } = createMatchstickGroupAnimation()

    // Efecto reactivo: se ejecuta cuando matchesA o matchesB cambian
    // Anima la transición de los fósforos jugados entre secciones
    createEffect(on(
        () => [gameState.matchesA.length, gameState.matchesB.length],
        () => {
            animateChanges()
        }
    ))

    return (
        <div class="scorekeeper">
            <header class="score-header">
                {/* Referencia Score A */}
                <div class="score-reference"><span>{gameState.scoreA}</span></div>

                {/* Nombre Equipo A */}
                <TeamName teamId="A" placeholder="NOSOTROS" />

                {/* Puntaje Máximo */}
                <div class="max-score">{MAX_SCORE}</div>

                {/* Nombre Equipo B */}
                <TeamName teamId="B" placeholder="ELLOS" />

                {/* Referencia Score B */}
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
