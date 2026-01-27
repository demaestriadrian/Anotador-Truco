import { Team } from './Team';

export class Match {
    private _teamA: Team;
    private _teamB: Team;
    private _limit: number; // 15 o 30

    constructor(teamAName: string = "Nosotros", teamBName: string = "Ellos", limit: number = 30) {
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

    addPoints(teamId: string, points: number): void {
        const team = this.getTeamById(teamId);

        // Verificar si agregar puntaje excedería el límite (regla opcional, pero bueno tener el chequeo)
        // Las reglas de Truco usualmente permiten pasarse, pero el juego termina.
        team.addPoints(points);
    }

    reset(): void {
        this._teamA.resetScore();
        this._teamB.resetScore();
    }

    getWinner(): Team | null {
        if (this._teamA.score >= this._limit) return this._teamA;
        if (this._teamB.score >= this._limit) return this._teamB;
        return null;
    }

    private getTeamById(teamId: string): Team {
        if (this._teamA.id === teamId) return this._teamA;
        if (this._teamB.id === teamId) return this._teamB;
        throw new Error(`Equipo con id ${teamId} no encontrado`);
    }
}
