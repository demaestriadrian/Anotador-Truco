import { For } from 'solid-js'
import { settings, setHistoryGap } from '@/ui/store/settingsStore'

// Opciones de hueco temporal entre grupos del historial (segundos → etiqueta visible).
const GAP_OPTIONS: { seconds: number; label: string }[] = [
    { seconds: 15, label: '15s' },
    { seconds: 30, label: '30s' },
    { seconds: 60, label: '1m' },
    { seconds: 120, label: '2m' },
]

// Ítem: umbral de agrupación del historial. Anotaciones separadas por menos del umbral caen en
// el mismo grupo; cambiarlo re-agrupa el historial al instante (la agrupación es derivada).
const HistoryGapItem = () => (
    <div class="settings-item">
        <span class="settings-item__label">Agrupar anotaciones</span>
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

export default HistoryGapItem
