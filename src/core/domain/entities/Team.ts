import type { TeamId, Phase } from '@/core/domain/constants';
import { UMBRAL_BUENAS } from '@/core/domain/constants';

export class Team {
  readonly id: TeamId;
  private _name: string;
  private _score: number;

  constructor(id: TeamId, name: string) {
    this.id = id;
    this._name = name;
    this._score = 0;
  }

  get name(): string {
    return this._name;
  }

  get score(): number {
    return this._score;
  }

  // Fase derivada del puntaje: malas hasta el umbral, buenas a partir de él.
  get phase(): Phase {
    return this._score < UMBRAL_BUENAS ? 'malas' : 'buenas';
  }

  setName(name: string): void {
    if (!name.trim()) throw new Error('El nombre no puede estar vacío');
    this._name = name;
  }

  addPoints(points: number): void {
    if (points < 0) throw new Error('No se pueden restar puntos negativos');
    this._score += points;
  }

  // Resta puntos con clamp a 0 (nunca queda negativo).
  removePoints(points: number): void {
    this._score = Math.max(0, this._score - points);
  }

  reset(): void {
    this._score = 0;
  }
}
