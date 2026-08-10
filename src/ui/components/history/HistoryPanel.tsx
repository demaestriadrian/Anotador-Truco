import { Show, For, createMemo } from 'solid-js'
import X from 'lucide-solid/icons/x'
import { gameState } from '@/infrastructure/adapters/solidGameController'
import { settings } from '@/ui/store/settingsStore'
import { historyOpen, closeHistory } from '@/ui/store/historyPanelStore'
import { groupByTimeGap, type ScoreHistoryEntry } from '@/core/domain/history'

// Hora local corta (HH:MM) para encabezados y entradas.
const hora = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// Neto de un grupo para un equipo (suma de deltas), p.ej. +2 / −1 / 0.
const netOf = (entries: ScoreHistoryEntry[], teamId: 'team_a' | 'team_b') =>
    entries.filter(e => e.teamId === teamId).reduce((sum, e) => sum + e.delta, 0)

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)

/**
 * Panel de historial: drawer derecho que desliza POR ENCIMA del de configuraciones.
 * Los datos son autoridad del core (`gameState.history`); acá solo se agrupan por cercanía
 * temporal con la función pura del dominio y el umbral configurable — cambiar el umbral
 * re-agrupa al instante porque la agrupación es derivada (memo), no estado.
 */
const HistoryPanel = () => {
    const groups = createMemo(() =>
        groupByTimeGap(gameState.history, settings.historyGapSeconds * 1000)
    )

    return (
        <Show when={historyOpen()}>
            <div class="history-overlay" style={{ 'touch-action': 'none' }} onClick={closeHistory}>
                <div class="settings-card history-card" onClick={(e) => e.stopPropagation()}>
                    <button class="settings-card__close" aria-label="Cerrar" onClick={closeHistory}>
                        <X size={16} />
                    </button>
                    <h2 class="settings-card__title">Historial</h2>

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
                                                <For each={(['team_a', 'team_b'] as const).filter(id => netOf(group.entries, id) !== 0)}>
                                                    {(id) => (
                                                        <span>{gameState.teams[id].name} {signed(netOf(group.entries, id))}</span>
                                                    )}
                                                </For>
                                            </span>
                                        </div>
                                        <ul class="history-group__entries">
                                            <For each={group.entries}>
                                                {(entry) => (
                                                    <li class="history-entry">
                                                        <span
                                                            class="history-entry__delta"
                                                            classList={{ 'history-entry__delta--negative': entry.delta < 0 }}
                                                        >
                                                            {signed(entry.delta)}
                                                        </span>
                                                        <span class="history-entry__team">{gameState.teams[entry.teamId].name}</span>
                                                        <span class="history-entry__time">{hora(entry.timestamp)}</span>
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
        </Show>
    )
}

export default HistoryPanel
