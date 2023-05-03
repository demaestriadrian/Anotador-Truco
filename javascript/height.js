import Fosforo from "./fosforo.class.js";

const ajustarHeight = () =>{
    const body = document.querySelector('body')
    body.style.height = window.innerHeight + 'px'
    console.log('resize');
}

less.pageLoadFinished.then(()=>{
    ajustarHeight()
    window.addEventListener('resize',ajustarHeight)
})
