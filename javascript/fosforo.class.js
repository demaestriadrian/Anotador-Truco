import { containerFosforo, reduceHeight, imgUrl } from "./fosforos.js";


export default class Fosforo {
    // Altura que debe tener el fosforo con respecto al tamaño del containerFosforo
    static #currentHeight() {
      return containerFosforo.clientHeight * reduceHeight;
    }
    
    static #nextID = 1;
    
    constructor() {
      this.id = Fosforo.#nextID++;
      this.height = Fosforo.#currentHeight();
      this.burned = false;
      
      // Crear el elemento <picture>
      const fosforoElement = document.createElement('picture');
      fosforoElement.id = this.id;
      fosforoElement.classList.add('fosforo');
      
      // Crear el elemento <img>
      const imgElement = document.createElement('img');
      imgElement.draggable = false;
      imgElement.src = this.burned ? imgUrl.normal : imgUrl.quemado;
      imgElement.alt = 'fosforo';
      
      // Agregar el elemento <img> como hijo del elemento <picture>
      fosforoElement.appendChild(imgElement);
      this.fosforoElement = fosforoElement

        this.updateHeight = ()=>{
            this.fosforoElement.style.height = Fosforo.#currentHeight() + 'px'
            this.height = Fosforo.#currentHeight()
        }
    }}

