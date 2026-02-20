import { createEffect, on } from 'solid-js'
import { gameState } from '@/ui/store/gameStore'
import PointSection from './PointSection'
import MatchStickStorage from './MatchStickStorage'
import TeamName from './TeamName'
import Separator from './Separator'
import gsap from 'gsap'
import { Flip } from 'gsap/all'
import { MAX_SCORE } from '@/core/domain/constants'
import { FLIP_ANIMATION } from '@/ui/constants'

gsap.registerPlugin(Flip)

const ScoreKeeper = () => {
    let flipState: Flip.FlipState | null = null

    // Efecto reactivo: se ejecuta cuando matchesA o matchesB cambian
    // Captura el estado previo de Flip y anima la transición
    createEffect(on(
        () => [gameState.matchesA.length, gameState.matchesB.length],
        () => {
            const targets = '.matchstick-item'

            // Si tenemos un estado previo capturado, animar DESDE él HACIA el actual
            if (flipState) {
                Flip.from(flipState, {
                    targets,
                    duration: FLIP_ANIMATION.DURATION,
                    ease: FLIP_ANIMATION.EASE,
                    stagger: FLIP_ANIMATION.STAGGER,
                    simple: true,
                    onEnter: elements => gsap.fromTo(elements,
                        { opacity: 0, scale: 0 },
                        { opacity: 1, scale: 1, duration: FLIP_ANIMATION.ENTER_DURATION }
                    ),
                    onLeave: elements => gsap.to(elements,
                        { opacity: 0, scale: 0, duration: FLIP_ANIMATION.LEAVE_DURATION }
                    )
                })
            }

            // Capturar estado actual para la PRÓXIMA actualización
            flipState = Flip.getState(targets)
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
