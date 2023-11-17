import { allMatchsticks, matchstickPositionElement, matchstickStorage } from './elements'

const sizeMatchstickStorage = (): void => {
  const mobileOS = ['ios', 'android']
  const userAgent = navigator.userAgent.toLowerCase()

  if (mobileOS.some(os => userAgent.includes(os))) { matchstickStorage.style.flex = '2' }
}

const sizeMatchstick = (): void => {
  Object.defineProperty(window, 'matchstickPositionElement', { value: matchstickPositionElement })
  allMatchsticks.forEach(matchstick => (matchstick.style.height = matchstickPositionElement.clientHeight + 'px'))
}

const initSizes = (): void => {
  sizeMatchstickStorage()
  sizeMatchstick()
}

export default initSizes
