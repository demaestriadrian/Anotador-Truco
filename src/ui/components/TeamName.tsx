import { createSignal } from 'solid-js'
import '@/ui/styles/scorekeeper.css'

interface TeamNameProps {
    teamId: 'A' | 'B'
    placeholder: string
    initialName?: string
    onNameChange?: (name: string) => void
}

const TeamName = (props: TeamNameProps) => {
    const [name, setName] = createSignal(props.initialName ?? '')

    const handleInput = (e: InputEvent) => {
        const newName = (e.currentTarget as HTMLInputElement).value
        setName(newName)
        props.onNameChange?.(newName)
    }

    return (
        <div class={`team-name-container team-${props.teamId}`}>
            <input
                type="text"
                class="team-name-input"
                placeholder={props.placeholder}
                value={name()}
                onInput={handleInput}
                maxLength={15}
            />
        </div>
    )
}

export default TeamName
