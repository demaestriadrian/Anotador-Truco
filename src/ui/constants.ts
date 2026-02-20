/** Duraciones de animación en segundos */
export const ANIMATION_DURATION = {
    MOVE_TO_SLOT: 0.3,
    RETURN_TO_ORIGIN: 0.5,
    REMOVE_TO_STORAGE: 0.6,
    REMOVE_FADE: 0.3
} as const

/** Configuración de la animación Flip del ScoreKeeper */
export const FLIP_ANIMATION = {
    DURATION: 0.5,
    EASE: 'power2.inOut',
    STAGGER: 0.1,
    ENTER_DURATION: 0.3,
    LEAVE_DURATION: 0.3
} as const
