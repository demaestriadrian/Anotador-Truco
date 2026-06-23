import { For } from 'solid-js'
import { presentationState } from '@/ui/store/presentationStore'
import MatchStick from './MatchStick'

const MatchStickStorage = () => {
    return (
        <div
            id="matchstick-storage"
            class="matchstickStorage"
            style={{
                opacity: presentationState.matchstickSize ? 1 : 0,
                transition: 'opacity 0.5s ease-in'
            }}
        >
            <For each={presentationState.storageMatches}>
                {(match) => (
                    <MatchStick
                        data={match}
                        isStoraged={true}
                        overrideSize={presentationState.matchstickSize || undefined}
                        currentTeam="storage"
                    />
                )}
            </For>
        </div>
    )
}

export default MatchStickStorage
