import { For } from 'solid-js'
import { gameState } from '@/ui/store/gameStore'
import MatchStick from './MatchStick'

const MatchStickStorage = () => {
    return (
        <div
            id="matchstick-storage"
            class="matchstickStorage"
            style={{
                opacity: gameState.matchstickSize ? 1 : 0,
                transition: 'opacity 0.5s ease-in',
            }}
        >
            <For each={gameState.matches}>
                {(match) => (
                    <MatchStick data={match} />
                )}
            </For>
        </div>
    )
}

export default MatchStickStorage
