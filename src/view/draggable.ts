import gsap from "gsap"
import { Draggable, InertiaPlugin } from "gsap/all";
import { $allMatchsticks } from "./elements";
gsap.registerPlugin(Draggable, InertiaPlugin);

export const initMatchsticksDraggables = (): void => {
    $allMatchsticks.forEach($matchstick => {
        Draggable.create($matchstick, {
            type: "x,y",
            bounds: document.getElementById("referenceDrag"),
            inertia: true
        });
    });
}