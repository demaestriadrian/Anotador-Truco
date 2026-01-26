import MatchStick from "@/ui/components/MatchStick";
import { gameStore } from '@/ui/store/useGameStore';

class PointSection {
    private positions: Element[] = [];
    private team: 'A' | 'B';

    constructor(private $container: HTMLElement, team: 'A' | 'B') {
        this.team = team;
        this.init();
    }

    private init(): void {
        this.createPositions();
        this.subscribeToStore();
    }

    private createPositions(): void {
        // Obtener todas las posiciones de fósforos dentro del contenedor
        this.positions = [...this.$container.querySelectorAll('.matchstickPosition')];
    }

    private subscribeToStore(): void {
        gameStore.subscribe((state, prevState) => {
            const currentMatches = this.team === 'A' ? state.matchesA : state.matchesB;
            const prevMatches = this.team === 'A' ? prevState.matchesA : prevState.matchesB;

            // Detectar Reset o Eliminación masiva
            if (currentMatches.length < prevMatches.length) {
                // Encontrar los que se fueron para mandarlos a dormir (storage)
                const removed = prevMatches.filter(m => !currentMatches.includes(m));
                removed.forEach(m => m.initPosition());
            }

            // Detectar nuevos
            if (currentMatches.length > prevMatches.length) {
                // Asegurar posiciones visuales
                this.updatePositions(currentMatches);
            }
        });
    }

    private updatePositions(matches: MatchStick[]): void {
        matches.forEach((match, index) => {
            const posElement = this.positions[index];
            if (posElement) {
                match.move(posElement as HTMLElement);
            }
        });
    }

    public get getElement(): HTMLElement | null {
        return this.$container;
    }
}

export default PointSection;
