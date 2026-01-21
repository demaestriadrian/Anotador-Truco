import { positionRandomX, positionRandomY } from "@/ui/utils";
import { $matchstickStorage } from "@/ui/elements";
import { gsap } from 'gsap'
import { Draggable, InertiaPlugin, MotionPathPlugin } from "gsap/all";
import PointSection from "@/ui/components/PointSection";

gsap.registerPlugin(Draggable, InertiaPlugin, MotionPathPlugin);

interface Sections {
    sectionA: PointSection;
    sectionB: PointSection;
}

class MatchStick extends Draggable {
    private initX = gsap.utils.interpolate(0, gsap.getProperty($matchstickStorage, "width"), positionRandomX());
    private initY = gsap.utils.interpolate(0, gsap.getProperty($matchstickStorage, "height"), positionRandomY());

    constructor(
        public $matchstick: HTMLElement,
        private sections: Sections
    ) {
        super($matchstick);
        this.initSize();
        this.initPosition(true);
        this.initDraggable();
    }

    initSize(): void {
        const { width, height } = document.querySelector('.matchstickPosition')?.getBoundingClientRect() || {};
        gsap.set(this.$matchstick, { width, height });
    }

    // Método para inicializar la posición del fósforo
    initPosition(set = false): void {
        gsap[set ? "set" : "to"](this.$matchstick, {
            x: this.initX,
            y: this.initY,
            rotation: 0
        });
    }

    // Método para mover el fósforo
    move($element: HTMLElement): void {
        const delta = this.getDelta($element);
        gsap.to(this.$matchstick, {
            x: "+=" + delta.x,
            y: "+=" + delta.y,
            rotation: gsap.getProperty($element, "rotation")
        })
    }

    private getDelta(
        $element: HTMLElement,
        positionThis = [.5, .5],
        positionEl = [.5, .5]
    ): gsap.Point2D {

        return MotionPathPlugin.getRelativePosition(
            this.$matchstick,
            $element,
            positionThis,
            positionEl
        );
    }


    private initDraggable = (): void => {

        Draggable.create(this.$matchstick, {
            type: "x,y",
            bounds: "#referenceDrag",
            // inertia: true,
            onRelease: (_event) => {
                // Se soltó el fósforo
                if (Draggable.hitTest(this.$matchstick, this.sections.sectionA.getElement)) {
                    this.sections.sectionA.addPoint(this);
                    document.dispatchEvent(new CustomEvent('matchstick-dropped-a'));
                    return
                }
                if (Draggable.hitTest(this.$matchstick, this.sections.sectionB.getElement)) {
                    this.sections.sectionB.addPoint(this);
                    document.dispatchEvent(new CustomEvent('matchstick-dropped-b'));
                    return
                }
                // No se ha soltado en una sección válida, volviendo a la posición inicial.
                this.initPosition();
            }
        });
    }
}

export default MatchStick;