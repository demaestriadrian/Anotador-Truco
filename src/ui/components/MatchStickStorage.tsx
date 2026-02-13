import { For } from 'solid-js'
import { gameState } from '@/ui/store/gameStore'
import MatchStick from './MatchStick'

const MatchStickStorage = () => {
    return (
        <div
            class="matchstickStorage"
            style={{
                opacity: gameState.matchstickSize ? 1 : 0,
                transition: 'opacity 0.5s ease-in'
            }}
        >
            <For each={gameState.storageMatches}>
                {(match) => (
                    <MatchStick
                        data={match}
                        isStoraged={true}
                        overrideSize={gameState.matchstickSize || undefined}
                        currentTeam="storage"
                    />
                )}
            </For>
        </div>
    )
}

export default MatchStickStorage
