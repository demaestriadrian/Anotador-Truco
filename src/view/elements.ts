const [sectionA, sectionB] = document.getElementsByTagName('section')
export const sections = { sectionA, sectionB }
export const allMatchsticks = [...document.querySelectorAll('.matchstick')].filter(e => e instanceof HTMLElement) as HTMLElement[]

const matchsticksPositionsA = [...sectionA.getElementsByClassName('matchstickPosition')].filter(e => e instanceof HTMLElement) as HTMLElement[]
const matchsticksPositionsB = [...sectionB.getElementsByClassName('matchstickPosition')].filter(e => e instanceof HTMLElement) as HTMLElement[]

export const matchsticksPositions = { matchsticksPositionsA, matchsticksPositionsB }
export const matchstickPositionElement = matchsticksPositionsA[0]
export const matchstickStorage = document.querySelector('.matchstickStorage') as HTMLElement
