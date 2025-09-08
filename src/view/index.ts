import initSizes from '@/view/sizes'
import '@/view/css/index.css'
import { allMatchsticks } from '@/view/elements'
import gsap from 'gsap'

export const initView = async (): Promise<void> => {
  initSizes()
  // initMatchsticksDraggables()
  // initialPositionsMatchsticks()

  Object.defineProperty(window, 'matchsticks', {
    value: allMatchsticks,
    writable: false
  });

  Object.defineProperty(window, 'gsap', {
    value: gsap,          // El valor es el objeto gsap que acaba de cargar
    writable: false,      // `false` hace que window.gsap sea de solo lectura
    configurable: false,  // `false` impide que la propiedad sea borrada o reconfigurada
    enumerable: true      // `true` permite que aparezca en bucles como for...in
  });
  
}
