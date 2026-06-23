// Motor de aplicación del marcador de Truco.
//
// Es la AUTORIDAD del estado: mantiene una instancia privada de `Match` (dominio puro)
// y expone una API comando-in / snapshot-out / subscribe. No depende de SolidJS ni del
// DOM, por lo que es framework-agnóstico y unitariamente testeable.
import { Match } from '@/core/domain/entities/Match';
import type { Limit } from '@/core/domain/constants';
import type {
  Command,
  GameSnapshot,
  GameStateListener,
  TeamSnapshot,
} from '@/core/ports/types';

export class GameEngine {
  // Única fuente de verdad del marcador.
  private readonly match: Match;
  // Suscriptores notificados ante cada cambio de estado.
  private readonly listeners = new Set<GameStateListener>();

  constructor(opts?: { limit?: Limit; teamAName?: string; teamBName?: string }) {
    this.match = new Match(opts?.teamAName, opts?.teamBName, opts?.limit);
  }

  // Aplica un comando al `Match`, recalcula el snapshot, notifica a los listeners y lo devuelve.
  dispatch(cmd: Command): GameSnapshot {
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
    }

    const snapshot = this.buildSnapshot();
    this.notify(snapshot);
    return snapshot;
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

  // Notifica a todos los suscriptores con el snapshot recién calculado.
  private notify(snapshot: GameSnapshot): void {
    for (const listener of this.listeners) {
      listener(snapshot);
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
