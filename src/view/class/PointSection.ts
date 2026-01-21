import MatchStick from "@/view/class/MatchStick";

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
        this.positions = [...this.$container.querySelectorAll('.matchstickPosition')];
    }

    addPoint(point: MatchStick) {
        this.points.includes(point) || this.points.push(point);
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


export default PointSection;
