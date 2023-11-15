import { allMatchsticks, matchstickPositionElement, matchstickStorage } from './elements'

const sizeMatchstickStorage = (): void => {
  const mobileOS = ['ios', 'android']
  const userAgent = navigator.userAgent.toLowerCase()

  if (mobileOS.some(os => userAgent.includes(os))) {
    matchstickStorage.style.flex = '5'
    window.alert(matchstickStorage)
  }
}

const sizeMatchstick = (): void => {
  console.log(matchstickPositionElement.clientHeight + 'px')
  Object.defineProperty(window, 'matchstickPositionElement', { value: matchstickPositionElement })
  allMatchsticks.forEach(matchstick => (matchstick.style.height = matchstickPositionElement.clientHeight + 'px'))
}

const initSizes = (): void => {
  console.log('initSizes')

  sizeMatchstickStorage()
  sizeMatchstick()
}

export default initSizes
