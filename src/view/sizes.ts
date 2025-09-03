import { $matchstickStorage } from './elements'

const sizeMatchstickStorage = (): void => {
  const mobileOS = ['ios', 'android']
  const userAgent = navigator.userAgent.toLowerCase()

  if (mobileOS.some(os => userAgent.includes(os))) { $matchstickStorage.style.flex = '1.3' }
}


const initSizes = (): void => {
  sizeMatchstickStorage()
}

export default initSizes
