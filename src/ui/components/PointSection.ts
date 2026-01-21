import MatchStick from "@/ui/components/MatchStick";

class PointSection {
    private points: MatchStick[] = [];
    private positions: Element[] = [];

    constructor(private $container: HTMLElement) {
        this.init();
    }

    private init(): void {
        this.createPositions();
    }

    private createPositions(): void {
        // Obtener todas las posiciones de fósforos dentro del contenedor
        this.positions = [...this.$container.querySelectorAll('.matchstickPosition')];
    }

    addPoint(point: MatchStick) {
        // Agregar punto si no existe ya
        this.points.includes(point) || this.points.push(point);
        // Mover el fósforo a la posición correspondiente
        point.move(this.positions[this.points.indexOf(point)] as HTMLElement);
    }


    public getPoints(): MatchStick[] {
        return [...this.points];
    }

    public get getPointsLength(): number {
        return this.points.length;
    }

    public removeLastPoint(): MatchStick | undefined {
        const point = this.points.pop();
        return point;
    }

    public reset(): void {
        this.points = [];
    }

    public get getElement(): HTMLElement | null {
        return this.$container;
    }
}

export default PointSection;
