import MatchStick from "@/view/class/MatchStick"
import PointSection from "@/view/class/PointSection"

const [$sectionA, $sectionB] = document.getElementsByTagName('section')
export const sections = { sectionA: new PointSection($sectionA), sectionB: new PointSection($sectionB) }
export const $allMatchsticks = [...document.querySelectorAll('.matchstick')].filter(e => e instanceof HTMLElement) as HTMLElement[]

const $matchsticksPositionsA = [...$sectionA.getElementsByClassName('matchstickPosition')].filter(e => e instanceof HTMLElement) as HTMLElement[]
const $matchsticksPositionsB = [...$sectionB.getElementsByClassName('matchstickPosition')].filter(e => e instanceof HTMLElement) as HTMLElement[]

export const $matchsticksPositions = { matchsticksPositionsA: $matchsticksPositionsA, $matchsticksPositionsB }
export const $matchstickPositionElement = $matchsticksPositionsA[0]
export const $matchstickStorage = document.querySelector('.matchstickStorage') as HTMLElement

export const allMatchsticks = [...document.querySelectorAll('.matchstick')].map(e => e instanceof HTMLElement && new MatchStick(e)).filter(e => e !== null) as MatchStick[]
