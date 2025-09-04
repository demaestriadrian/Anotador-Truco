import { positionRandomX, positionRandomY } from "@/view/util";
import { $matchstickStorage , sections  } from "@/view/elements";
import { gsap } from 'gsap'
import { Draggable, InertiaPlugin, MotionPathPlugin } from "gsap/all";
gsap.registerPlugin(Draggable, InertiaPlugin, MotionPathPlugin);

class MatchStick extends Draggable {
    private initX = positionRandomX();
    private initY = positionRandomY();

    constructor(public $matchstick: HTMLElement) {
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
        const delta = this.getDelta($matchstickStorage, [.5, 0], [this.initX, this.initY]);

        gsap[set ? "set" : "to"](this.$matchstick, {
            x: "+=" + delta.x,
            y: "+=" + delta.y,
            rotation: gsap.getProperty($matchstickStorage, "rotation")

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
            onRelease: (event) => {
                    if (Draggable.hitTest(this.$matchstick, sections.sectionA.getElement)) {
                        sections.sectionA.addPoint(this);
                        return
                    }
                    if (Draggable.hitTest(this.$matchstick, sections.sectionB.getElement)) {
                        sections.sectionB.addPoint(this);
                        return
                    }
                    console.log("No se ha soltado en una sección válida, volviendo a la posición inicial. ",this.initX,this.initY);
                    this.initPosition();
                }
        });
    }
}

export default MatchStick;