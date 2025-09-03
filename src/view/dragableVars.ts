import { Draggable } from "gsap/Draggable";
import { sections } from "./elements";

export const draggableVars: Draggable.Vars = {
    onDragEnd: (event) => {
        console.log("Drag ended:", event);
        console.log ("sectionA ", Draggable.hitTest(event.target, sections.sectionA.getElement));
        console.log ("sectionB ", Draggable.hitTest(event.target, sections.sectionB.getElement));
    }   
};
