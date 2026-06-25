// Registro de "handles" de fósforos: permite que la capa de ruteo de gestos alcance a un fósforo
// concreto (p.ej. "el último de la zona") para iniciar el arrastre asistido sin acoplarse a la
// implementación interna de cada MatchStick.
export interface MatchstickHandle {
    beginAssisted: (clientX: number, clientY: number) => void   // engancha el fósforo bajo el dedo
    moveTo: (clientX: number, clientY: number) => void          // lo hace seguir al dedo
    drop: (targetZone: 'A' | 'B' | null) => void                // lo suelta (misma lógica que el release)
}

const handles = new Map<string, MatchstickHandle>()

export const registerMatchstick = (id: string, handle: MatchstickHandle) => { handles.set(id, handle) }
export const unregisterMatchstick = (id: string) => { handles.delete(id) }
export const getMatchstickHandle = (id: string): MatchstickHandle | undefined => handles.get(id)
