export const ANIMATION_DURATION = {
    MOVE_TO_SLOT: 0.3,
    RETURN_TO_STORAGE: 0.5,
    SNAP_BACK: 0.3,
} as const

// Umbrales del reconocedor de gestos.
export const GESTURE = {
    MOVE_THRESHOLD: 10,     // px de desplazamiento para considerar "drag" en vez de "tap"
} as const
