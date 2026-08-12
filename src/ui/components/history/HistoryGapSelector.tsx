import { For } from 'solid-js'
import { settings, setHistoryGap } from '@/ui/store/settingsStore'

// Opciones de hueco temporal entre grupos del historial (segundos → etiqueta visible).
const GAP_OPTIONS: { seconds: number; label: string }[] = [
    { seconds: 15, label: '15s' },
    { seconds: 30, label: '30s' },
    { seconds: 60, label: '1m' },
    { seconds: 120, label: '2m' },
]

/**
 * Barra de agrupación del historial. Vive acá (y no en configuraciones) para que el efecto se
 * vea al instante: la agrupación es derivada, así que tocar una opción re-arma los grupos
 * debajo sin recargar nada.
 */
const HistoryGapSelector = () => (
    <div class="history-toolbar">
        <span class="history-toolbar__label">Agrupar cada</span>
        <div class="settings-segmented">
            <For each={GAP_OPTIONS}>
                {(opt) => (
                    <button
                        class="settings-segmented__option"
                        classList={{ 'settings-segmented__option--active': settings.historyGapSeconds === opt.seconds }}
                        onClick={() => setHistoryGap(opt.seconds)}
                    >
                        {opt.label}
                    </button>
                )}
            </For>
        </div>
    </div>
)

export default HistoryGapSelector
