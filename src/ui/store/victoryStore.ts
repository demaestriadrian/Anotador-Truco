import { createSignal } from 'solid-js'
import type { TeamId } from '@/core/domain/constants'

// Estado de PRESENTACIÓN del modal de victoria. No toca el core: solo refleja si hay que mostrar el
// anuncio de ganador y de qué equipo. Lo setea el puente de ciclo de vida a partir de los eventos.
const [victory, setVictory] = createSignal<{ teamId: TeamId } | null>(null)

export { victory }

// Muestra el modal anunciando al equipo ganador.
export const showVictory = (teamId: TeamId) => setVictory({ teamId })

// Oculta el modal (al deshacer el punto o al finalizar la partida).
export const hideVictory = () => setVictory(null)
