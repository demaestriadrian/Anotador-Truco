export class Team {
  readonly id: string;
  private _name: string;
  private _score: number;

  constructor(id: string, name: string) {
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

  setName(name: string): void {
    if (!name.trim()) throw new Error("El nombre no puede estar vacío");
    this._name = name;
  }

  addPoints(points: number): void {
    if (points < 0) throw new Error("No se pueden restar puntos negativos");
    this._score += points;
  }

  resetScore(): void {
    this._score = 0;
  }
}
