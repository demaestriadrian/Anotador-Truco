import { IGameView } from '../../../core/domain/ports/interfaces';
import { sections, allMatchsticks, $matchstickStorage } from '@/view/elements';
import MatchStick from '@/view/class/MatchStick';
// We might need to import GSAP-related stuff if we want to animate "programmatically" 
// but MatchStick.move might handle it.

export class ViewAdapter implements IGameView {
    private onAddPointsA?: () => void;
    private onAddPointsB?: () => void;

    constructor() {
        this.setupEventListeners();
    }

    // Method to bind the Logic triggers
    public bindAddPoints(onAddPointsA: () => void, onAddPointsB: () => void) {
        this.onAddPointsA = onAddPointsA;
        this.onAddPointsB = onAddPointsB;
    }

    private setupEventListeners() {
        // Listen for custom events dispatched by MatchStick
        document.addEventListener('matchstick-dropped-a', () => {
            console.log('Detected drop on A');
            if (this.onAddPointsA) this.onAddPointsA();
        });

        document.addEventListener('matchstick-dropped-b', () => {
            console.log('Detected drop on B');
            if (this.onAddPointsB) this.onAddPointsB();
        });

        // Inputs listener for names
        const nameInputA = document.getElementById('nameTeam1') as HTMLInputElement;
        const nameInputB = document.getElementById('nameTeam2') as HTMLInputElement;

        if (nameInputA) {
            nameInputA.addEventListener('change', () => {
                // We don't have a direct way to call service here without coupling or another event.
                // But since we are inside ViewAdapter, and ViewAdapter is created BEFORE Service in bootstrap... 
                // Wait, ViewAdapter doesn't know about Service. Service calls ViewAdapter.
                // We need a way to notify Service of name changes.
                // We can use a bind method similar to bindAddPoints.
                if (this.onChangeNameA) this.onChangeNameA(nameInputA.value);
            });
        }

        if (nameInputB) {
            nameInputB.addEventListener('change', () => {
                if (this.onChangeNameB) this.onChangeNameB(nameInputB.value);
            });
        }
    }

    private onChangeNameA?: (name: string) => void;
    private onChangeNameB?: (name: string) => void;

    public bindNameChanges(onChangeA: (name: string) => void, onChangeB: (name: string) => void) {
        this.onChangeNameA = onChangeA;
        this.onChangeNameB = onChangeB;
    }

    updateScore(teamId: string, score: number): void {
        const section = teamId === 'team_a' ? sections.sectionA : sections.sectionB;
        const currentScore = section.getPointsLength;

        if (score > currentScore) {
            const toAdd = score - currentScore;
            const allUsed = [...sections.sectionA.getPoints(), ...sections.sectionB.getPoints()];
            const freeSticks = allMatchsticks.filter(m => !allUsed.includes(m));

            for (let i = 0; i < toAdd; i++) {
                const stick = freeSticks[i];
                if (stick) {
                    section.addPoint(stick);
                }
            }
        } else if (score < currentScore) {
            const toRemove = currentScore - score;
            for (let i = 0; i < toRemove; i++) {
                const stick = section.removeLastPoint();
                if (stick) {
                    stick.initPosition();
                }
            }
        }
    }

    updateTeamName(teamId: string, name: string): void {
        const inputId = teamId === 'team_a' ? 'nameTeam1' : 'nameTeam2';
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) input.value = name;
    }

    showWinner(winnerName: string): void {
        alert(`¡Ganó ${winnerName}!`);
        // TODO: Modal or nicer UI
    }

    resetUI(): void {
        // Return all matchsticks to storage
        allMatchsticks.forEach(m => m.initPosition());
        sections.sectionA.reset();
        sections.sectionB.reset();
    }
}
