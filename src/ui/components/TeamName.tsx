import { createSignal } from 'solid-js'
import '@/ui/styles/scorekeeper.css'

interface TeamNameProps {
    teamId: 'A' | 'B'
    placeholder: string
    initialName?: string
    onNameChange?: (name: string) => void
}

const TeamName = (props: TeamNameProps) => {
    // Si el nombre inicial (restaurado por el core) es solo el default ("Nosotros"/"Ellos"),
    // se deja vacío para seguir mostrando el placeholder; un nombre custom sí se muestra.
    const initial = props.initialName ?? ''
    const [name, setName] = createSignal(
        initial.toLowerCase() === props.placeholder.toLowerCase() ? '' : initial
    )

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
