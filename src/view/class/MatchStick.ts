import { positionRandomX, positionRandomY } from "../util";
import { $matchstickStorage } from "../elements";
import { gsap } from 'gsap'
import { Draggable, InertiaPlugin, MotionPathPlugin } from "gsap/all";
gsap.registerPlugin(Draggable, InertiaPlugin, MotionPathPlugin);

class MatchStick extends Draggable {
    private initX = positionRandomX();
    private initY = positionRandomY();

    constructor(public $matchstick: HTMLElement) {
        super($matchstick);
        this.initSize();
        this.initPosition();
        this.initDraggable();
    }

    
    // Método para inicializar la posición del fósforo
    initPosition(): void {
        const delta = this.getDelta($matchstickStorage, [this.initX, this.initY]);

        gsap.set(this.$matchstick, {
            x: "+=" + delta.x,
            y: "+=" + delta.y
        });
    }

    // Método para mover el fósforo
    move($element: HTMLElement): void {
        const delta = this.getDelta($element);
        gsap.to(this.$matchstick, { 
            x: "+=" + delta.x,
            y: "+=" + delta.y
         })
    }

    private getDelta( $element: HTMLElement, position =[0,0]): gsap.Point2D {

        return MotionPathPlugin.getRelativePosition(
              this.$matchstick,
              $element,
              [0, 0],
              position
            );
    }

    initSize(): void {
        const { width, height } = document.querySelector('.matchstickPosition')?.getBoundingClientRect() || {};
        gsap.set(this.$matchstick, { width, height });
    }

    private initDraggable = (): void => {
       
            Draggable.create(this.$matchstick, {
                type: "x,y",
                bounds: "#referenceDrag",
                inertia: true
            });
    }
}

export { MatchStick }