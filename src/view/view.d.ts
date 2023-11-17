export interface Position {
  x: number
  y: number
}

export interface ConfigPosition {
  element: Element
  padding?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  trimWidth?: TrimMeasure
  trimHeight?: TrimMeasure
}

export interface TrimMeasure {
  value: number
  format?: 'px' | '%' | 'fr'
  aline?: 'start' | 'center' | 'end'
}
