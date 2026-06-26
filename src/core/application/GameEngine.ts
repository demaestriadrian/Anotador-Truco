// Motor de aplicación del marcador de Truco.
//
// Es la AUTORIDAD del estado: mantiene una instancia privada de `Match` (dominio puro)
// y expone una API comando-in / snapshot-out / subscribe. No depende de SolidJS ni del
// DOM, por lo que es framework-agnóstico y unitariamente testeable.
import { Match } from '@/core/domain/entities/Match';
import { DEFAULT_EVENT_RULES, type GameEventRule } from '@/core/application/eventRules';
import type { Limit } from '@/core/domain/constants';
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

  constructor(
    opts?: { limit?: Limit; teamAName?: string; teamBName?: string },
    rules: GameEventRule[] = DEFAULT_EVENT_RULES,
  ) {
    this.match = new Match(opts?.teamAName, opts?.teamBName, opts?.limit);
    this.rules = rules;
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

    const next = this.buildSnapshot();
    this.notify(next);

    // Las reglas deciden los eventos de dominio; el engine solo orquesta y emite. (Síncrono: la UI
    // ya reaccionó al evento cuando `dispatch` retorna.)
    for (const rule of this.rules) {
      for (const event of rule.evaluate(prev, next, cmd)) this.notifyEvent(event);
    }

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
