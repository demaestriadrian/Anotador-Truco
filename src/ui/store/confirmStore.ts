import { createSignal } from 'solid-js'

// Estado de PRESENTACIÓN del diálogo de confirmación genérico. Cualquier acción destructiva
// (reiniciar, futuros borrados) pide confirmación a través de este store; el `ConfirmDialog`
// (montado en App) reacciona y ejecuta `onConfirm` solo si el usuario acepta.

export interface ConfirmRequest {
    message: string
    onConfirm: () => void
}

const [confirmRequest, setConfirmRequest] = createSignal<ConfirmRequest | null>(null)

export { confirmRequest }

// Abre el diálogo con un mensaje y la acción a ejecutar si el usuario confirma.
export const requestConfirm = (request: ConfirmRequest) => setConfirmRequest(request)

// Cierra el diálogo sin ejecutar nada (cancelar).
export const dismissConfirm = () => setConfirmRequest(null)

// Ejecuta la acción pendiente y cierra el diálogo.
export const acceptConfirm = () => {
    const request = confirmRequest()
    setConfirmRequest(null)
    request?.onConfirm()
}
