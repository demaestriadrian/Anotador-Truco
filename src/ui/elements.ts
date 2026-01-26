import MatchStick from "@/ui/components/MatchStick"
import PointSection from "@/ui/components/PointSection"

export let $sectionA: Element
export let $sectionB: Element
export let sections: { sectionA: PointSection, sectionB: PointSection }
export let allMatchsticks: MatchStick[] = []
export let $matchstickStorage: HTMLElement
export let $matchsticksPositions: { matchsticksPositionsA: HTMLElement[], matchsticksPositionsB: HTMLElement[] }
export let $matchstickPositionElement: HTMLElement

export const initElements = () => {
    const sectionElements = document.getElementsByTagName('section')
    $sectionA = sectionElements[0]
    $sectionB = sectionElements[1]

    sections = { sectionA: new PointSection($sectionA as HTMLElement, 'A'), sectionB: new PointSection($sectionB as HTMLElement, 'B') }

    $matchstickStorage = document.querySelector('.matchstickStorage') as HTMLElement


    const $matchsticksPositionsA = [...$sectionA.getElementsByClassName('matchstickPosition')].filter(e => e instanceof HTMLElement) as HTMLElement[]
    const $matchsticksPositionsB = [...$sectionB.getElementsByClassName('matchstickPosition')].filter(e => e instanceof HTMLElement) as HTMLElement[]
    $matchsticksPositions = { matchsticksPositionsA: $matchsticksPositionsA, matchsticksPositionsB: $matchsticksPositionsB }
    $matchstickPositionElement = $matchsticksPositionsA[0]

    allMatchsticks = [...document.querySelectorAll('.matchstick')].map(e => e instanceof HTMLElement && new MatchStick(e, $matchstickStorage, $sectionA, $sectionB)).filter(e => e !== null) as MatchStick[]
}
