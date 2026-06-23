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
