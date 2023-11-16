import { allMatchsticks, matchstickPositionElement, matchstickStorage } from './elements'

export const getRandomPositionMatchticksStorage = (): { x: number, y: number } => {
  // Obtener las dimensiones y posición del elemento
  const rect = matchstickStorage.getBoundingClientRect()
  const { left, top, width, height } = rect
  const { width: widthMatchstick }: { width: number } = matchstickPositionElement.getBoundingClientRect()

  // Calcular coordenadas aleatorias dentro del elemento
  const x = left + Math.random() * (width - widthMatchstick)
  const y = top + Math.random() * height / 5

  return { x, y }
}

export const initialPositionsMatchsticks = (): void => {
  allMatchsticks.forEach(matchstick => {
    const { x, y } = getRandomPositionMatchticksStorage()
    matchstick.style.top = `${y}px`
    matchstick.style.left = `${x}px`
  })
}
