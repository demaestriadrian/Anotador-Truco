// Registro de acciones rápidas (OCP): el botón de acceso rápido ejecuta UNA de estas acciones,
// elegible por el usuario desde el panel de configuraciones. Agregar una acción nueva = sumar
// una entrada al array (y su id a la union), sin tocar el botón ni el panel.
import { settings, toggleSound } from '@/ui/store/settingsStore'
import { requestConfirm } from '@/ui/store/confirmStore'
import { reiniciar } from '@/infrastructure/adapters/solidGameController'
// Íconos Lucide con import profundo (no carga el set completo en dev).
import Volume2 from 'lucide-solid/icons/volume-2'
import VolumeX from 'lucide-solid/icons/volume-x'
import RotateCcw from 'lucide-solid/icons/rotate-ccw'
import type { LucideIcon } from 'lucide-solid'

export type QuickActionId = 'toggle-sound' | 'restart-match'

export interface QuickAction {
    id: QuickActionId
    label: string             // nombre visible en el selector del panel
    icon: () => LucideIcon    // reactivo: puede depender de settings (p.ej. Volume2/VolumeX según el estado)
    run: () => void
}

// Reiniciar SIEMPRE pide confirmación (evita perder la partida por un toque accidental).
// El RESET del core emite ZONE_RESET para ambas zonas → la UI recoge los fósforos sola.
export const restartMatchWithConfirm = () =>
    requestConfirm({
        message: '¿Reiniciar la partida? Se quitarán todos los fósforos y el puntaje volverá a 0.',
        onConfirm: () => reiniciar(),
    })

export const QUICK_ACTIONS: QuickAction[] = [
    {
        id: 'toggle-sound',
        label: 'Activar / desactivar sonido',
        icon: () => settings.soundEnabled ? Volume2 : VolumeX,
        run: toggleSound,
    },
    {
        id: 'restart-match',
        label: 'Reiniciar partida',
        icon: () => RotateCcw,
        run: restartMatchWithConfirm,
    },
]

// Resuelve la acción activa; si el id guardado ya no existe en el registro, cae a la primera.
export const resolveQuickAction = (id: QuickActionId): QuickAction =>
    QUICK_ACTIONS.find(action => action.id === id) ?? QUICK_ACTIONS[0]
