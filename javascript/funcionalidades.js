export const posicionAleatoria = ({Xmax = 0,Ymax = 0}) => {
    let x,y
    x = numeroAleatorio(Xmax)
    y = numeroAleatorio(Ymax)

    return {x,y}
}

export const numeroAleatorio = max =>{
    let na
    // obtener un numero aleatorio desde 0 a 10e10
    na = Math.floor(  Math.random() * (10**(Math.ceil(Math.random() * 10))))
    // limita a el numero aleatorio a max-1
    if(max){ na %= max }
    return na
}