import { Match } from '../../domain/entities/Match';
import { IGameView } from '../../domain/ports/interfaces';

export class GameService {
    private match: Match;
    private view: IGameView;

    constructor(view: IGameView) {
        this.view = view;
        this.match = new Match();
        this.initGame();
    }

    private initGame() {
        this.refreshUI();
    }

    addPoints(teamId: string, points: number): void {
        this.match.addPoints(teamId, points);
        const team = teamId === 'team_a' ? this.match.teamA : this.match.teamB;
        this.view.updateScore(teamId, team.score);

        this.checkWinner();
    }

    resetGame(): void {
        this.match.reset();
        this.view.resetUI();
        this.refreshUI();
    }

    changeTeamName(teamId: string, newName: string): void {
        const team = teamId === 'team_a' ? this.match.teamA : this.match.teamB;
        team.setName(newName);
        this.view.updateTeamName(teamId, newName);
    }

    private checkWinner(): void {
        const winner = this.match.getWinner();
        if (winner) {
            this.view.showWinner(winner.name);
        }
    }

    private refreshUI(): void {
        this.view.updateTeamName(this.match.teamA.id, this.match.teamA.name);
        this.view.updateTeamName(this.match.teamB.id, this.match.teamB.name);
        this.view.updateScore(this.match.teamA.id, this.match.teamA.score);
        this.view.updateScore(this.match.teamB.id, this.match.teamB.score);
    }
}
