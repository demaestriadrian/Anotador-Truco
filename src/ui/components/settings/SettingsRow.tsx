import { Show, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import ChevronRight from 'lucide-solid/icons/chevron-right'
import type { LucideIcon } from 'lucide-solid'

/**
 * Primitiva de fila del panel de configuraciones: [ícono] [label + hint] [control].
 *
 * Todos los ítems la usan, así la consistencia visual (alturas, alineación, tipografía) queda
 * garantizada POR CONSTRUCCIÓN en vez de depender de que cada ítem la respete por su cuenta.
 */
interface SettingsRowProps {
    icon: LucideIcon
    label: string
    hint?: string            // texto secundario opcional
    danger?: boolean         // tiñe el ícono (zona de peligro)
    children?: JSX.Element   // el control (switch / segmented / botón)
    /**
     * Acción de la FILA ENTERA: tocar el ícono, el label o el hueco vacío dispara lo mismo que
     * el control (igual que "Ver historial"). El control sigue siendo la afordancia visible;
     * esto solo agranda el área tocable, que en móvil es la diferencia entre acertar y no.
     * Cada ítem decide qué significa "activar" (un switch alterna, un segmented avanza opción).
     */
    onActivate?: () => void
}

const RowContent = (props: SettingsRowProps) => (
    <>
        <span class="settings-row__icon">
            <Dynamic component={props.icon} size={18} />
        </span>
        <span class="settings-row__text">
            <span class="settings-row__label">{props.label}</span>
            <Show when={props.hint}>
                <span class="settings-row__hint">{props.hint}</span>
            </Show>
        </span>
        <span class="settings-row__control">{props.children}</span>
    </>
)

const SettingsRow = (props: SettingsRowProps) => (
    <div
        class="settings-row"
        classList={{
            'settings-row--danger': props.danger,
            'settings-row--activable': props.onActivate !== undefined,
        }}
        // Los clicks DENTRO del control ya los maneja el control. Si además corriera `onActivate`,
        // el switch se alternaría dos veces por toque y volvería a su estado original.
        onClick={(e) => {
            if ((e.target as Element).closest('.settings-row__control')) return
            props.onActivate?.()
        }}
    >
        <RowContent {...props} />
    </div>
)

/**
 * Variante navegable: la fila entera es el botón y el control es un chevron (afordancia de
 * "esto abre otra pantalla"). La usa "Ver historial".
 */
export const SettingsNavRow = (props: Omit<SettingsRowProps, 'children'> & { onClick: () => void }) => (
    <button
        class="settings-row settings-row--button"
        classList={{ 'settings-row--danger': props.danger }}
        onClick={props.onClick}
    >
        <RowContent {...props}>
            <ChevronRight size={18} class="settings-row__chevron" />
        </RowContent>
    </button>
)

export default SettingsRow
