import { type TrimMeasure, type ConfigPosition, type Position } from '../view'

export const getRandomPositionToElement = (ConfigPosition: ConfigPosition): Position => {
  const { element, padding, trimHeight, trimWidth } = ConfigPosition

  const zone = {
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    top: 0,
    left: 0
  }

  if (padding !== undefined) {
    zone.width -= (padding.right ?? 0) + (padding.left ?? 0)
    zone.height -= (padding.top ?? 0) + (padding.bottom ?? 0)
    zone.top = (padding.top ?? 0)
    zone.left = (padding.left ?? 0)
  }
  // calcula las medidas de la zona con respecto a algun cambio en el ancho o alto
  const actionsTrimMeasuere = (trimMeasure: TrimMeasure, type: 'width' | 'height'): void => {
    const { value, format, aline } = trimMeasure
    const position = {
      width: 'left',
      height: 'top'
    }

    // establece cual es el tipo de medida que va a utilizar y lista las acciones para estas
    const actionFormat = {
      px: zone[type] - value,
      '%': zone[type] / 100 * value,
      fr: zone[type] / value
    }
    zone[type] = actionFormat[format ?? 'px']

    // establece cual es la alineacion que va a utilizar la zona y lista las acciones para estas
    const actionAline = {
      start: 0,
      center: (element.getBoundingClientRect()[type] - zone[type]) / 2,
      end: element.getBoundingClientRect()[type] - zone[type]
    }

    // esta propiedad define el espacio que va a existir entre el elmento y zona
    zone[position[type] as 'top' | 'left'] = actionAline[aline ?? 'center']
  }

  if (trimWidth !== undefined) { actionsTrimMeasuere(trimWidth, 'width') }
  if (trimHeight !== undefined) { actionsTrimMeasuere(trimHeight, 'height') }

  // el punto donde comienza la zona
  const initialPoint = {
    x: element.getBoundingClientRect().left + zone.left,
    y: element.getBoundingClientRect().top + zone.top
  }
  // un punto aleatorio que pertenece a la zona
  const randomPointZona = {
    x: initialPoint.x + Math.random() * zone.width,
    y: initialPoint.y + Math.random() * zone.height
  }

  return randomPointZona
}
