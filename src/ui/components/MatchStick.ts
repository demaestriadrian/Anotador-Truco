import { positionRandomX, positionRandomY } from "@/ui/utils";
import { gsap } from 'gsap'
import { Draggable, InertiaPlugin, MotionPathPlugin } from "gsap/all";
import { gameStore } from '@/ui/store/useGameStore';

gsap.registerPlugin(Draggable, InertiaPlugin, MotionPathPlugin);

class MatchStick extends Draggable {
    private initX: number;
    private initY: number;

    constructor(
        public $matchstick: HTMLElement,
        private $matchstickStorage: HTMLElement,
        private $sectionA: Element,
        private $sectionB: Element
    ) {
        super($matchstick);

        this.initX = gsap.utils.interpolate(0, gsap.getProperty(this.$matchstickStorage, "width"), positionRandomX());
        this.initY = gsap.utils.interpolate(0, gsap.getProperty(this.$matchstickStorage, "height"), positionRandomY());

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
                if (Draggable.hitTest(this.$matchstick, this.$sectionA)) {
                    gameStore.getState().addPoint('A', this)
                    return
                }
                if (Draggable.hitTest(this.$matchstick, this.$sectionB)) {
                    gameStore.getState().addPoint('B', this)
                    return
                }
                // No se ha soltado en una sección válida, volviendo a la posición inicial.
                this.initPosition();
            }
        });
    }
}

export default MatchStick;