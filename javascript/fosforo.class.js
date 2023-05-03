import { containerFosforo, reduceHeight, imgUrl } from "./fosforos.js";

export default class Fosforo {
    // altura que debe tener el fosforo con respecto al tamaño del containerFosforo
    static #currentHeight() { return containerFosforo.clientHeight * reduceHeight}
    static #nextID = 1;

    constructor(){
        this.id = Fosforo.nextID++
        this.height = Fosforo.#currentHeight()
        this.burned = false
    }

    // Función que se ejecuta para cambiar el tamaño del fosforo
    // setHeight() {
           
    // }
}

