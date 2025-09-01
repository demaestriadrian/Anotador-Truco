import { $allMatchsticks, $matchstickStorage } from './elements'
import { gsap } from 'gsap'
import  MotionPathPlugin  from 'gsap/MotionPathPlugin'
import { positionRandomX, positionRandomY } from './util'



export const initialPositionsMatchsticks = (): void => {
  $allMatchsticks.forEach($matchstick => {
    const delta = MotionPathPlugin.getRelativePosition(
      $matchstick,
      $matchstickStorage,
      [0.5, -0.05],
      [positionRandomX(), positionRandomY()]
    );

    gsap.set($matchstick, {
      x: "+=" + delta.x,
      y: "+=" + delta.y
    });
  })
}
