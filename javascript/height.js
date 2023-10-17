import { fosforosArray } from "./fosforos.js";

const ajustarHeight = () =>{
    const body = document.querySelector('body')
    body.style.height = window.innerHeight + 'px'
    fosforosArray.map(fosforo => fosforo.updateHeight())
    console.log('resize');
}

less.pageLoadFinished.then(()=>{
    ajustarHeight()
    window.addEventListener('resize',ajustarHeight)
})
