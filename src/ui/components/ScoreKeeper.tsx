import React, { useRef } from 'react'
import { useGameStore } from '@/ui/store/useGameStore'
import PointSection from './PointSection'
import MatchStickStorage from './MatchStickStorage'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Flip } from 'gsap/all'

gsap.registerPlugin(Flip)

const ScoreKeeper: React.FC = () => {
    // Necesitamos rastrear los arrays de fósforos para activar la captura del estado Flip
    const matchesA = useGameStore(state => state.matchesA)
    const matchesB = useGameStore(state => state.matchesB)

    // useGSAP con dependenias se ejecutará después del render (DOM actualizado).
    // Para asumir el estado "Antes", necesitamos capturarlo manualmente o confiar en el objeto "state" de Flip gestionado vía refs.
    // Patrón Flip Estándar de React:
    // 1. Capturar estado inmediatamente (o guardar estado previo).
    // En realidad, useGSAP se ejecuta *después* del render. Así que estamos en el estado "Después".
    // Si queremos "Antes", necesitamos capturarlo *antes* de que el render se confirme? ¿Imposible en el cuerpo de un componente funcional generalmente?
    // Patrón: 
    // const state = Flip.getState(targets); 
    // setThings(...);
    // Flip.from(state, ...);

    // Pero aquí las actualizaciones del store disparan el render. El render ocurre.
    // Podemos usar una ref para guardar el estado del render *previo*.

    const flipState = useRef<Flip.FlipState | null>(null)

    // ¿Capturar estado *antes* de que corra la lógica? No, la lógica corre luego el render.
    // Podemos usar `useLayoutEffect` (que useGSAP usa internamente usualmente) 
    // y una ref a "fósforos previos" para saber si necesitamos animar.
    // Pero más simple: Siempre Flip.from(lastState) y luego guardar newState.

    useGSAP(() => {
        const targets = '.matchstick-item';

        // Si tenemos un estado previo capturado, animar DESDE él HACIA el actual.
        if (flipState.current) {
            Flip.from(flipState.current, {
                targets,
                duration: 0.5,
                ease: 'power2.inOut',
                stagger: 0.1, // Effecto cascada
                simple: true, // Optimización
                onEnter: elements => gsap.fromTo(elements, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.3 }),
                onLeave: elements => gsap.to(elements, { opacity: 0, scale: 0, duration: 0.3 })
            });
        }

        // Capturar estado actual para la PRÓXIMA actualización
        flipState.current = Flip.getState(targets);

    }, { dependencies: [matchesA, matchesB] }); // Volver a ejecutar cuando los fósforos cambien

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
