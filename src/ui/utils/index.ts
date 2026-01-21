import { randomBates, randomLogNormal } from 'd3';

export const positionRandomY = (): number => {
  let random : number | undefined
  while (random === undefined || (random < 0 || random > .5)) {
    random = randomLogNormal(-2, 1)()
  }
  return random
}

export const positionRandomX = (): number => {
  const random = randomBates(2.5)()
  return random
}