import { initialPositionsMatchsticks } from './positions'
import initSizes from './sizes'
import './css/index.css'
// await import ('./less/index.less')
// import less from 'less'

export const initView = async (): Promise<void> => {
  initSizes()
  initialPositionsMatchsticks()
}
