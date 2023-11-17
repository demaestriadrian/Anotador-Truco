import { allMatchsticks, matchstickStorage } from './elements'
import { getRandomPositionToElement } from './util'
import { type ConfigPosition, type Position } from './view'

export const getRandomPositionMatchticksStorage = (): Position => {
  // // Obtener las dimensiones y posición del elemento
  // const rect = matchstickStorage.getBoundingClientRect()
  // const { left, top, width, height } = rect
  // const { width: widthMatchstick }: { width: number } = matchstickPositionElement.getBoundingClientRect()

  // // Calcular coordenadas aleatorias dentro del elemento
  // const x = left + Math.random() * (width - widthMatchstick) / 1.7
  // const y = top + Math.random() * height / 3.5

  // return { x, y }

  const configPosition: ConfigPosition = {
    element: matchstickStorage,
    padding: {
      // right: matchstickPositionElement.getBoundingClientRect().width * 40
    },
    trimHeight: {
      value: 3,
      format: 'fr',
      aline: 'start'
    },
    trimWidth: {
      value: 2,
      format: 'fr'
      // aline: 'end'
    }
  }

  return getRandomPositionToElement(configPosition)
}

export const initialPositionsMatchsticks = (): void => {
  allMatchsticks.forEach(matchstick => {
    const { x, y } = getRandomPositionMatchticksStorage()
    matchstick.style.top = `${y}px`
    matchstick.style.left = `${x}px`
  })
}
