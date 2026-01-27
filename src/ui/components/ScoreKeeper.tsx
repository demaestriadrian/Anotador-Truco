import React, { useRef } from 'react'
import { useGameStore } from '@/ui/store/useGameStore'
import PointSection from './PointSection'
import MatchStickStorage from './MatchStickStorage'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Flip } from 'gsap/all'

gsap.registerPlugin(Flip)

const ScoreKeeper: React.FC = () => {
    // We need to track the match arrays to trigger Flip state capture
    const matchesA = useGameStore(state => state.matchesA)
    const matchesB = useGameStore(state => state.matchesB)

    // useGSAP with dependencies will run after render (DOM updated).
    // To assume "Before" state, we need to capture it manually or rely on Flip's "state" object managed via refs.
    // Standard React Flip Pattern:
    // 1. Capture state immediately (or store previous state).
    // Actually, useGSAP runs *after* render. So we are in the "After" state.
    // If we want "Before", we need to capture it *before* the render commits? Impossible in functional component body generally?
    // Pattern: 
    // const state = Flip.getState(targets); 
    // setThings(...);
    // Flip.from(state, ...);

    // But here the store updates triggers the render. The render happens.
    // We can use a ref to store the state of the *previous* render.

    const flipState = useRef<Flip.FlipState | null>(null)

    // Capture state *before* logic runs? No, logic runs then render.
    // We can use `useLayoutEffect` (which useGSAP uses internally usually) 
    // and a ref to "previous matches" to know if we need to animate.
    // But simpler: Always Flip.from(lastState) and then save newState.

    useGSAP(() => {
        const targets = '.matchstick-item';

        // If we have a previous state captured, animate FROM it TO current.
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

        // Capture current state for the NEXT update
        flipState.current = Flip.getState(targets);

    }, { dependencies: [matchesA, matchesB] }); // Re-run when matches change

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
