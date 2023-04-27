

const ajustarHeight = () =>{
    const body = document.querySelector('body')
    body.style.height = window.innerHeight + 'px'
    console.log('resize');
}

ajustarHeight()

window.addEventListener('resize',ajustarHeight)