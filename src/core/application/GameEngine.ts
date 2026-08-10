// Motor de aplicación del marcador de Truco.
//
// Es la AUTORIDAD del estado: mantiene una instancia privada de `Match` (dominio puro)
// y expone una API comando-in / snapshot-out / subscribe. No depende de SolidJS ni del
// DOM, por lo que es framework-agnóstico y unitariamente testeable.
import { Match } from '@/core/domain/entities/Match';
import { DEFAULT_EVENT_RULES, type GameEventRule } from '@/core/application/eventRules';
import type { Limit } from '@/core/domain/constants';
import type { MatchPersistencePort, PersistedMatchState } from '@/core/ports/persistence';
import type { ScoreHistoryEntry } from '@/core/domain/history';
import type {
  Command,
  GameSnapshot,
  GameStateListener,
  GameEvent,
  GameEventListener,
  TeamSnapshot,
} from '@/core/ports/types';

export class GameEngine {
  // Única fuente de verdad del marcador.
  private readonly match: Match;
  // Suscriptores notificados ante cada cambio de estado (snapshot).
  private readonly listeners = new Set<GameStateListener>();
  // Suscriptores notificados ante cada evento de dominio (reset/llenado de zona).
  private readonly eventListeners = new Set<GameEventListener>();
  // Reglas que deciden los eventos de dominio a partir de la transición de estado (y el comando).
  private readonly rules: GameEventRule[];
  // Puerto de persistencia (opcional): el core pregunta por una partida guardada y guarda cambios.
  private readonly persistence?: MatchPersistencePort;
  // Reloj inyectable (puerto mínimo): timestamps del historial deterministas en tests.
  private readonly clock: () => number;
  // Bitácora de anotaciones que cambiaron el score. Vive en el engine (aplicación), no en Match:
  // es un registro de lo ocurrido, no una regla del juego.
  private history: ScoreHistoryEntry[] = [];

  constructor(
    opts?: {
      limit?: Limit;
      teamAName?: string;
      teamBName?: string;
      persistence?: MatchPersistencePort;
      clock?: () => number;
    },
    rules: GameEventRule[] = DEFAULT_EVENT_RULES,
  ) {
    this.match = new Match(opts?.teamAName, opts?.teamBName, opts?.limit);
    this.rules = rules;
    this.persistence = opts?.persistence;
    this.clock = opts?.clock ?? (() => Date.now());

    // El CORE pregunta si hay una partida guardada y, si la hay, la restaura automáticamente
    // (sin confirmación del usuario). La UI nace ya con el estado restaurado.
    const saved = this.persistence?.load();
    if (saved) {
      this.match.hydrate(saved);
      this.history = saved.history ?? [];
    }
  }

  // Aplica un comando al `Match`, recalcula el snapshot, notifica a los listeners y lo devuelve.
  // Además compara el estado antes/después y, según las reglas, emite eventos de dominio (reset).
  dispatch(cmd: Command): GameSnapshot {
    const prev = this.buildSnapshot();

    switch (cmd.type) {
      case 'ADD_POINTS':
        this.match.addPoints(cmd.teamId, cmd.amount);
        break;
      case 'REMOVE_POINTS':
        this.match.removePoints(cmd.teamId, cmd.amount);
        break;
      case 'SET_TEAM_NAME':
        this.match.setTeamName(cmd.teamId, cmd.name);
        break;
      case 'SET_LIMIT':
        this.match.setLimit(cmd.limit);
        break;
      case 'RESET':
        this.match.reset();
        break;
      case 'FINALIZE_MATCH':
        // Finalización definitiva: resetea ambos a 0 (reusa Match.reset). El aviso de fin lo emite
        // MatchFinalizedRule más abajo, a partir del comando.
        this.match.reset();
        break;
    }

    // Actualizar la bitácora ANTES de construir `next`, así el snapshot ya la incluye.
    this.updateHistory(cmd, prev);

    const next = this.buildSnapshot();
    this.notify(next);

    // Las reglas deciden los eventos de dominio; el engine solo orquesta y emite. (Síncrono: la UI
    // ya reaccionó al evento cuando `dispatch` retorna.)
    for (const rule of this.rules) {
      for (const event of rule.evaluate(prev, next, cmd)) this.notifyEvent(event);
    }

    // Persistir el estado resultante de cada comando (RESET/FINALIZE guardan el 0-0: consistente).
    this.persistence?.save(this.buildPersistedState());

    return next;
  }

  // Devuelve el snapshot inmutable del estado actual.
  getState(): GameSnapshot {
    return this.buildSnapshot();
  }

  // Registra un listener y devuelve una función para desuscribirlo.
  subscribe(fn: GameStateListener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  // Registra un listener de eventos de dominio y devuelve una función para desuscribirlo.
  subscribeEvents(fn: GameEventListener): () => void {
    this.eventListeners.add(fn);
    return () => {
      this.eventListeners.delete(fn);
    };
  }

  // Notifica a todos los suscriptores con el snapshot recién calculado.
  private notify(snapshot: GameSnapshot): void {
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  // Notifica a todos los suscriptores de eventos con el evento de dominio recién emitido.
  private notifyEvent(event: GameEvent): void {
    for (const listener of this.eventListeners) {
      listener(event);
    }
  }

  // Mantiene la bitácora: registra los cambios REALES de score (el clamp a 0 y el bloqueo por
  // partida terminada no dejan entrada) y la vacía al reiniciar/finalizar.
  private updateHistory(cmd: Command, prev: GameSnapshot): void {
    if (cmd.type === 'RESET' || cmd.type === 'FINALIZE_MATCH') {
      this.history = [];
      return;
    }
    if (cmd.type !== 'ADD_POINTS' && cmd.type !== 'REMOVE_POINTS') return;

    const team = cmd.teamId === 'team_a' ? this.match.teamA : this.match.teamB;
    const delta = team.score - prev.teams[cmd.teamId].score;
    if (delta === 0) return;

    this.history.push({
      teamId: cmd.teamId,
      delta,
      scoreAfter: team.score,
      timestamp: this.clock(),
    });
  }

  // Construye el estado mínimo persistible (nombres, scores, límite); lo derivado no se guarda.
  private buildPersistedState(): PersistedMatchState {
    return {
      teams: {
        team_a: { name: this.match.teamA.name, score: this.match.teamA.score },
        team_b: { name: this.match.teamB.name, score: this.match.teamB.score },
      },
      limit: this.match.limit,
      history: this.history,
    };
  }

  // Construye el snapshot serializable del estado actual mapeando cada `Team` a `TeamSnapshot`.
  private buildSnapshot(): GameSnapshot {
    return {
      teams: {
        team_a: this.toTeamSnapshot(this.match.teamA),
        team_b: this.toTeamSnapshot(this.match.teamB),
      },
      limit: this.match.limit,
      winner: this.match.getWinner(),
      finished: this.match.isFinished(),
      history: [...this.history],
    };
  }

  // Mapea una entidad `Team` del dominio a su snapshot plano.
  private toTeamSnapshot(team: { id: TeamSnapshot['id']; name: string; score: number; phase: TeamSnapshot['phase'] }): TeamSnapshot {
    return {
      id: team.id,
      name: team.name,
      score: team.score,
      phase: team.phase,
    };
  }
}
