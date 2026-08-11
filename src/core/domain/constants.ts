// Fundamentos del dominio del marcador de Truco.
// Este archivo es el HOGAR canónico de estos tipos: las demás capas los importan desde acá.

// Identificador de cada equipo de la partida.
export type TeamId = 'team_a' | 'team_b';

// Fase del puntaje: malas (primeros 15) o buenas (de 15 en adelante).
export type Phase = 'malas' | 'buenas';

// Límite de puntos válido para una partida.
export type Limit = 15 | 30;

// Umbral que separa malas de buenas: malas = primeros 15 puntos; buenas = de 15 en adelante.
// Es independiente del límite de la partida (jugar "a 15" = solo malas; "a 30" = malas + buenas).
export const UMBRAL_BUENAS = 15;

// Límites de partida permitidos.
export const LIMITES_VALIDOS = [15, 30] as const;

// ─── Fase VISIBLE del puntaje ───
//
// Ojo con `Team.phase`: usa `score < UMBRAL_BUENAS`, así que con 15 justos ya devuelve 'buenas'.
// La MESA, en cambio, muestra 15 fósforos de malas completas: recién el punto 16 abre las buenas
// (es lo que decide `EnterBuenasRule` al cruzar 15→16, y cómo se llenan las zonas).
//
// Estas dos funciones son esa segunda noción —la que el jugador ve— y son la única fuente de
// verdad para cualquier presentación del puntaje por fase, para que no se desincronicen.

// Fase que refleja el tablero: hasta el umbral inclusive son malas.
export const faseVisible = (score: number): Phase =>
  score <= UMBRAL_BUENAS ? 'malas' : 'buenas';

// Puntos de la fase en curso: en malas es el score; pasado el umbral, cuenta solo las buenas.
export const puntosDeFase = (score: number): number =>
  score <= UMBRAL_BUENAS ? score : score - UMBRAL_BUENAS;
