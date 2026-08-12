import { gameState } from '@/infrastructure/adapters/solidGameController'
import { faseVisible, puntosDeFase } from '@/core/domain/constants'
import type { TeamId } from '@/core/domain/constants'

interface ScoreReferenceProps {
    teamId: TeamId
}

/**
 * Indicador de puntaje del header: píldora con los puntos de la FASE en curso y su nombre
 * ("12 MALAS" / "3 BUENAS"), en rojo mientras van malas y en ámbar al entrar a buenas.
 *
 * El número es el de la fase (no el acumulado del core) para que coincida con los fósforos de
 * la zona, que al entrar a buenas se vacía y vuelve a contar desde 1. Ambas cosas derivan de
 * las mismas funciones del dominio (`faseVisible` / `puntosDeFase`).
 */
const ScoreReference = (props: ScoreReferenceProps) => {
    const score = () => gameState.teams[props.teamId].score
    const fase = () => faseVisible(score())

    return (
        <div
            class="score-reference"
            classList={{
                'score-reference--a': props.teamId === 'team_a',
                'score-reference--b': props.teamId === 'team_b',
                'score-reference--buenas': fase() === 'buenas',
            }}
        >
            <span class="score-reference__value">{puntosDeFase(score())}</span>
            <span class="score-reference__phase">{fase()}</span>
        </div>
    )
}

export default ScoreReference
