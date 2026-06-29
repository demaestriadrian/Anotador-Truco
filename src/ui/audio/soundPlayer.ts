// Reproductor de efectos de sonido de la UI (presentación pura: no toca el core).
//
// Cada acción semántica del marcador tiene su sonido. Los mp3 viven en `public/sound/` y Vite los
// sirve desde la raíz (`/sound/...`, igual que `/img/...`).
//
// OCP: agregar un sonido nuevo = una línea en `SOUND_SRC` (su tipo entra solo en `SoundKind`).

export type SoundKind = 'add' | 'remove' | 'transfer' | 'winner'

const SOUND_SRC: Record<SoundKind, string> = {
    add: '/sound/add_point.mp3',        // se anota un punto
    remove: '/sound/remove_point.mp3',  // se quita un punto
    transfer: '/sound/transfer_point.mp3', // se transfiere un punto de un equipo al otro (drag A↔B)
    winner: '/sound/winner.mp3',        // un equipo gana la partida
}

// Cache lazy de un `Audio` por tipo (precargado). Lazy para no instanciar nada hasta el primer uso.
const cache = new Map<SoundKind, HTMLAudioElement>()

const getAudio = (kind: SoundKind): HTMLAudioElement => {
    let audio = cache.get(kind)
    if (!audio) {
        audio = new Audio(SOUND_SRC[kind])
        audio.preload = 'auto'
        cache.set(kind, audio)
    }
    return audio
}

/**
 * Reproduce el sonido indicado desde el inicio. Reiniciar `currentTime` permite re-disparar el mismo
 * sonido en taps rápidos (corta el anterior). El `.catch` traga el rechazo de autoplay que aplican
 * los navegadores hasta la primera interacción del usuario.
 */
export const playSound = (kind: SoundKind) => {
    const audio = getAudio(kind)
    audio.currentTime = 0
    audio.play().catch(() => {})
}
