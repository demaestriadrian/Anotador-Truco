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
                transition: 'opacity 0.5s ease-in',
            }}
        >
            <For each={presentationState.matches}>
                {(match) => <MatchStick data={match} />}
            </For>
        </div>
    )
}

export default MatchStickStorage
