// Siguiente opción de una lista, volviendo a la primera después de la última.
//
// La usan las filas con selector segmentado para resolver qué hace tocar la FILA entera:
// avanzar la opción. Con dos opciones (15/30, sonido/reiniciar) queda un toggle; si el registro
// crece a tres, el mismo gesto sigue teniendo sentido sin tocar nada.
// Si la opción actual no está en la lista, arranca por la primera.
export const nextOption = <T>(options: readonly T[], current: T): T =>
    options[(options.indexOf(current) + 1) % options.length]
