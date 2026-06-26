// Pipeline de finalización de partida (Observer + registro, OCP).
//
// Al confirmar "Nueva Partida", el core emite MATCH_FINALIZED y el puente recorre este registro,
// corriendo cada listener de forma INDEPENDIENTE. Agregar una reacción nueva (historial, sonido,
// estadísticas) = sumar una entrada acá; no se toca el core, el puente ni los listeners existentes.
import type { TeamId } from '@/core/domain/constants'
import { clearZone } from '@/ui/store/presentationStore'
import { hideVictory } from '@/ui/store/victoryStore'

export type MatchFinalizedListener = (winnerId: TeamId) => void

// Limpia el tablero: devuelve los fósforos de ambas zonas al depósito (animado). El reset del
// puntaje (ambos a 0) ya lo hizo el core; acá solo se limpia la presentación.
const clearBoardListener: MatchFinalizedListener = () => {
    clearZone('A')
    clearZone('B')
}

// Cierra el modal de victoria.
const closeModalListener: MatchFinalizedListener = () => hideVictory()

export const MATCH_FINALIZED_LISTENERS: MatchFinalizedListener[] = [
    clearBoardListener,
    closeModalListener,
    // 🔌 Futuro (sin modificar el core): cada uno es un módulo aparte que se agrega acá.
    // guardarEnHistorialListener,
    // reproducirSonidoVictoriaListener,
    // enviarEstadisticasListener,
]
