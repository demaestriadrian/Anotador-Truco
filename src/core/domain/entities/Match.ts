import { Team } from './Team';
import type { TeamId, Limit } from '@/core/domain/constants';
import { LIMITES_VALIDOS } from '@/core/domain/constants';

export class Match {
  private _teamA: Team;
  private _teamB: Team;
  private _limit: Limit;

  constructor(teamAName: string = 'Nosotros', teamBName: string = 'Ellos', limit: Limit = 30) {
    this._teamA = new Team('team_a', teamAName);
    this._teamB = new Team('team_b', teamBName);
    this._limit = limit;
  }

  get teamA(): Team {
    return this._teamA;
  }

  get teamB(): Team {
    return this._teamB;
  }

  get limit(): Limit {
    return this._limit;
  }

  // Cambia el límite de la partida validando contra los límites permitidos.
  setLimit(limit: Limit): void {
    if (!LIMITES_VALIDOS.includes(limit)) {
      throw new Error(`Límite inválido: ${limit}. Valores válidos: ${LIMITES_VALIDOS.join(', ')}`);
    }
    this._limit = limit;
  }

  addPoints(teamId: TeamId, points: number): void {
    const team = this.getTeamById(teamId);
    team.addPoints(points);
  }

  removePoints(teamId: TeamId, points: number): void {
    const team = this.getTeamById(teamId);
    team.removePoints(points);
  }

  setTeamName(teamId: TeamId, name: string): void {
    const team = this.getTeamById(teamId);
    team.setName(name);
  }

  reset(): void {
    this._teamA.reset();
    this._teamB.reset();
  }

  // Devuelve el id del equipo ganador (score >= límite); A tiene prioridad si ambos llegan. Si no hay, null.
  getWinner(): TeamId | null {
    if (this._teamA.score >= this._limit) return this._teamA.id;
    if (this._teamB.score >= this._limit) return this._teamB.id;
    return null;
  }

  isFinished(): boolean {
    return this.getWinner() !== null;
  }

  // Resuelve el equipo por id; lanza Error si no existe.
  private getTeamById(teamId: TeamId): Team {
    if (this._teamA.id === teamId) return this._teamA;
    if (this._teamB.id === teamId) return this._teamB;
    throw new Error(`Equipo con id ${teamId} no encontrado`);
  }
}
