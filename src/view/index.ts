import { initialPositionsMatchsticks } from './positions'
import initSizes from './sizes'
import './css/index.css'
import { gsap } from 'gsap'
import MotionPathPlugin from 'gsap'
import { initMatchsticksDraggables } from './draggable'

gsap.registerPlugin(MotionPathPlugin)
/// await import ('./less/index.less')
// import less from 'less'

export const initView = async (): Promise<void> => {
  initSizes()
  initialPositionsMatchsticks()
  initMatchsticksDraggables()
}
