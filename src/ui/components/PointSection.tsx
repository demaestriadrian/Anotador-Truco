import { onMount, For, Show } from 'solid-js'
import { presentationState, setMatchstickSize } from '@/ui/store/presentationStore'
import MatchStick from './MatchStick'

interface PointSectionProps {
    team: 'A' | 'B'
}

const PointSection = (props: PointSectionProps) => {
    let slotRef: HTMLDivElement | undefined

    // Obtener los fósforos del equipo correspondiente
    const matches = () => props.team === 'A' ? presentationState.matchesA : presentationState.matchesB

    onMount(() => {
        // Solo medir si somos el equipo A para evitar duplicidad
        if (props.team !== 'A' || !slotRef) return

        const updateSize = () => {
            if (slotRef) {
                const { width, height } = slotRef.getBoundingClientRect()
                setMatchstickSize({ width, height })
            }
        }

        const observer = new ResizeObserver(updateSize)
        observer.observe(slotRef)
        updateSize() // Medir inicialmente
    })

    return (
        <section id={`section-${props.team}`}>
            <For each={[1, 2, 3]}>
                {(groupId) => (
                    <div class="containerMatchstick" id={`${props.team.toLowerCase()}${groupId}`}>
                        <For each={[0, 1, 2, 3, 4]}>
                            {(slotIndex) => {
                                // Índice global del fósforo: (groupId-1)*5 + slotIndex
                                const globalIndex = (groupId - 1) * 5 + slotIndex
                                const isRefSlot = props.team === 'A' && groupId === 1 && slotIndex === 0

                                return (
                                    <div
                                        class="matchstickPosition"
                                        ref={(el) => { if (isRefSlot) slotRef = el }}
                                    >
                                        <Show when={matches()[globalIndex]}>
                                            {(matchData) => (
                                                <MatchStick data={matchData()} currentTeam={props.team} />
                                            )}
                                        </Show>
                                    </div>
                                )
                            }}
                        </For>
                    </div>
                )}
            </For>
        </section>
    )
}

export default PointSection
