import MatchStick from "./MatchStick";

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
        const pointElements = this.$container.querySelectorAll('.matchstickPosition');
        pointElements.forEach(($positions) => this.positions.push($positions));
    }

    addPoint($point: MatchStick) {
        this.points.push($point);
        $point.move(this.positions[this.points.length - 1] as HTMLElement);
    }

}

export default PointSection;
