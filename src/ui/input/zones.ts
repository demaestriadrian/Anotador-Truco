// Resolución de zona por coordenadas de pantalla (no por ancestría DOM):
// los fósforos viven en #matchstick-storage pero se ven flotando sobre las secciones,
// así que la única forma confiable de saber a qué zona apunta el dedo es por coordenadas.
type Zone = 'A' | 'B'
type OriginZone = Zone | 'storage'

const rectOf = (id: string): DOMRect | null =>
    document.getElementById(id)?.getBoundingClientRect() ?? null

const inside = (r: DOMRect | null, x: number, y: number): boolean =>
    !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom

/** Zona de puntaje bajo el punto, o null si no cae en A/B. */
export const resolveZoneFromPoint = (x: number, y: number): Zone | null => {
    if (inside(rectOf('section-A'), x, y)) return 'A'
    if (inside(rectOf('section-B'), x, y)) return 'B'
    return null
}

/** Zona origen para arrastre asistido: A/B, depósito, o null si es irrelevante (header, etc.). */
export const resolveOriginZone = (x: number, y: number): OriginZone | null => {
    const zone = resolveZoneFromPoint(x, y)
    if (zone) return zone
    if (inside(rectOf('matchstick-storage'), x, y)) return 'storage'
    return null
}
