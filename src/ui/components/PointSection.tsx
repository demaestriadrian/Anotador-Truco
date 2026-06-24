import { onMount, For } from 'solid-js'
import { setMatchstickSize } from '@/ui/store/presentationStore'

interface PointSectionProps {
    team: 'A' | 'B'
}

const SLOT_ROTATIONS = [0, 90, 180, 270, 45]

const PointSection = (props: PointSectionProps) => {
    let slotRef: HTMLDivElement | undefined

    onMount(() => {
        if (props.team !== 'A' || !slotRef) return

        const updateSize = () => {
            if (slotRef) {
                const { width, height } = slotRef.getBoundingClientRect()
                setMatchstickSize({ width, height })
            }
        }

        const observer = new ResizeObserver(updateSize)
        observer.observe(slotRef)
        updateSize()
    })

    return (
        <section id={`section-${props.team}`}>
            <For each={[1, 2, 3]}>
                {(groupId) => (
                    <div class="containerMatchstick" id={`${props.team.toLowerCase()}${groupId}`}>
                        <For each={[0, 1, 2, 3, 4]}>
                            {(slotIndex) => {
                                const globalIndex = (groupId - 1) * 5 + slotIndex
                                const isRefSlot = props.team === 'A' && groupId === 1 && slotIndex === 0

                                return (
                                    <div
                                        class="matchstickPosition"
                                        data-team={props.team}
                                        data-slot={globalIndex}
                                        data-rotation={SLOT_ROTATIONS[slotIndex]}
                                        ref={(el) => { if (isRefSlot) slotRef = el }}
                                    />
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
