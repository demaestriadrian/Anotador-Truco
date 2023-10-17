import Fosforo from "./fosforo.class.js";

export const containerFosforo = document.querySelector('.containerFosforo')
export const reduceHeight = .75
export const imgUrl = {
    normal : '/img/fosforo.png',
    quemado : '/img/fosforo.png',
}
export const fosforosArray = Array.from({ length: 30 }, () => new Fosforo());