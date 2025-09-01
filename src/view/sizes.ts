import { $allMatchsticks, $matchstickPositionElement, $matchstickStorage } from './elements'
import { gsap } from "gsap";


const sizeMatchstickStorage = (): void => {
  const mobileOS = ['ios', 'android']
  const userAgent = navigator.userAgent.toLowerCase()

  if (mobileOS.some(os => userAgent.includes(os))) { $matchstickStorage.style.flex = '2' }
}

const sizeMatchstick = (): void => {
  // Object.defineProperty(window, 'matchstickPositionElement', { value: $matchstickPositionElement })
  // $allMatchsticks.forEach(matchstick => (matchstick.style.height = $matchstickPositionElement.clientHeight + 'px'))
  const matchstickMesure = {
    height: gsap.getProperty($matchstickPositionElement, 'height', "px"),
    width: gsap.getProperty($matchstickPositionElement, 'width', "px")
  }

  $allMatchsticks.forEach(matchstick => {
    matchstick.style.height = matchstickMesure.height as string
    matchstick.style.width = matchstickMesure.width as string
  })
}

const initSizes = (): void => {
  sizeMatchstickStorage()
  sizeMatchstick()
}

export default initSizes
