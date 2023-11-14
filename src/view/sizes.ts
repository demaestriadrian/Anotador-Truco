import { allMatchsticks, matchstickPositionElement, matchstickStorage } from './elements'

export const sizeMatchstickStorage = (): void => {
  const mobileOS = ['ios', 'android']
  const userAgent = navigator.userAgent.toLowerCase()

  if (mobileOS.some(os => userAgent.includes(os))) {
    matchstickStorage.style.flex = '5'
    window.alert(matchstickStorage)
  }
}

export const sizeMatchstick = (): void => {
  allMatchsticks.forEach(matchstick => (matchstick.style.height = matchstickPositionElement.style.height))
}
