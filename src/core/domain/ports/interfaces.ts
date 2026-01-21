export interface IGameView {
    updateScore(teamId: string, score: number): void;
    updateTeamName(teamId: string, name: string): void;
    showWinner(winnerName: string): void;
    resetUI(): void;
}
