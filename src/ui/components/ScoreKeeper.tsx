import { createEffect, on } from 'solid-js'
import { gameState, cambiarNombre } from '@/infrastructure/adapters/solidGameController'
import { presentationState } from '@/ui/store/presentationStore'
import PointSection from './PointSection'
import MatchStickStorage from './MatchStickStorage'
import TeamName from './TeamName'
import Separator from './Separator'
import gsap from 'gsap'
import { Flip } from 'gsap/all'

gsap.registerPlugin(Flip)

const ScoreKeeper = () => {
    let flipState: Flip.FlipState | null = null

    // Efecto reactivo: se ejecuta cuando matchesA o matchesB cambian
    // Captura el estado previo de Flip y anima la transición
    createEffect(on(
        () => [presentationState.matchesA.length, presentationState.matchesB.length],
        () => {
            const targets = '.matchstick-item'

            // Si tenemos un estado previo capturado, animar DESDE él HACIA el actual
            if (flipState) {
                Flip.from(flipState, {
                    targets,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    stagger: 0.1,
                    simple: true,
                    onEnter: elements => gsap.fromTo(elements,
                        { opacity: 0, scale: 0 },
                        { opacity: 1, scale: 1, duration: 0.3 }
                    ),
                    onLeave: elements => gsap.to(elements,
                        { opacity: 0, scale: 0, duration: 0.3 }
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
                {/* Referencia Score A (del dominio) */}
                <div class="score-reference"><span>{gameState.teams.team_a.score}</span></div>

                {/* Nombre Equipo A */}
                <TeamName
                    teamId="A"
                    placeholder="NOSOTROS"
                    onNameChange={(name) => cambiarNombre('team_a', name)}
                />

                {/* Puntaje Máximo (límite del dominio) */}
                <div class="max-score">{gameState.limit}</div>

                {/* Nombre Equipo B */}
                <TeamName
                    teamId="B"
                    placeholder="ELLOS"
                    onNameChange={(name) => cambiarNombre('team_b', name)}
                />

                {/* Referencia Score B (del dominio) */}
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
