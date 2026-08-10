import { Show, For, createMemo } from 'solid-js'
import X from 'lucide-solid/icons/x'
import { gameState } from '@/infrastructure/adapters/solidGameController'
import { settings } from '@/ui/store/settingsStore'
import { historyOpen, closeHistory } from '@/ui/store/historyPanelStore'
import { groupByTimeGap, collapseRuns, type ScoreHistoryRun } from '@/core/domain/history'
import HistoryGapSelector from './HistoryGapSelector'

// Hora local corta (HH:MM) para encabezados y tramos.
const hora = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// Neto de un grupo para un equipo (suma de deltas), p.ej. +2 / −1 / 0.
const netOf = (runs: ScoreHistoryRun[], teamId: 'team_a' | 'team_b') =>
    runs.filter(r => r.teamId === teamId).reduce((sum, r) => sum + r.delta, 0)

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)

/**
 * Panel de historial: drawer derecho que desliza POR ENCIMA del de configuraciones.
 *
 * Los datos son autoridad del core (`gameState.history`); acá solo se DERIVA la vista componiendo
 * dos funciones puras del dominio: `groupByTimeGap` arma las "manos" según el umbral configurable
 * y `collapseRuns` fusiona las anotaciones consecutivas del mismo equipo y signo (+3 en vez de
 * +1 +1 +1). Al ser derivación, cambiar el umbral re-arma todo al instante sin tocar los datos.
 */
const HistoryPanel = () => {
    const groups = createMemo(() =>
        groupByTimeGap(gameState.history, settings.historyGapSeconds * 1000)
            .map(group => ({ start: group.start, runs: collapseRuns(group.entries) }))
    )

    return (
        <Show when={historyOpen()}>
            <div class="history-overlay" style={{ 'touch-action': 'none' }} onClick={closeHistory}>
                <div class="settings-card history-card" onClick={(e) => e.stopPropagation()}>
                    <header class="settings-card__header">
                        <h2 class="settings-card__title">Historial</h2>
                        <button class="settings-card__close" aria-label="Cerrar" onClick={closeHistory}>
                            <X size={16} />
                        </button>
                    </header>

                    <HistoryGapSelector />

                    <div class="settings-card__items">
                        <Show
                            when={groups().length > 0}
                            fallback={<p class="history-empty">Todavía no hay puntos anotados.</p>}
                        >
                            <div class="history-groups">
                                <For each={groups()}>
                                    {(group, index) => (
                                        <div class="history-group">
                                            <div class="history-group__header">
                                                <span class="history-group__title">
                                                    Mano {index() + 1} · {hora(group.start)}
                                                </span>
                                                <span class="history-group__net">
                                                    <For each={(['team_a', 'team_b'] as const).filter(id => netOf(group.runs, id) !== 0)}>
                                                        {(id) => (
                                                            <span>{gameState.teams[id].name} {signed(netOf(group.runs, id))}</span>
                                                        )}
                                                    </For>
                                                </span>
                                            </div>
                                            <ul class="history-group__entries">
                                                <For each={group.runs}>
                                                    {(run) => (
                                                        <li class="history-entry">
                                                            <span
                                                                class="history-entry__delta"
                                                                classList={{ 'history-entry__delta--negative': run.delta < 0 }}
                                                            >
                                                                {signed(run.delta)}
                                                            </span>
                                                            <span class="history-entry__team">{gameState.teams[run.teamId].name}</span>
                                                            <span class="history-entry__time">{hora(run.start)}</span>
                                                        </li>
                                                    )}
                                                </For>
                                            </ul>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </Show>
                    </div>
                </div>
            </div>
        </Show>
    )
}

export default HistoryPanel
