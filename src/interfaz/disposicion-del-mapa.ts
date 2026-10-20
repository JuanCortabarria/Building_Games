// Dónde se dibuja cada país en el mapa esquemático. Es presentación pura: el motor no sabe nada de esto.
// Las posiciones siguen a grandes rasgos el tablero (docs/reference/teg-tablero.webp), corridas para que
// ninguna línea entre limítrofes pase por debajo de un país que no es uno de sus extremos.

import type { NombreDeContinente, NombreDePais } from "../motor/mapa";

export interface Punto {
  x: number;
  y: number;
}

export const ANCHO_DEL_MAPA = 1520;
export const ALTO_DEL_MAPA = 800;
export const ANCHO_DEL_PAIS = 100;
export const ALTO_DEL_PAIS = 44;
/** Cuánto sobresale la mancha de un continente alrededor de los recuadros de sus países. */
export const MARGEN_DEL_CONTINENTE = 14;

/** Centro del recuadro de cada país. */
export const POSICION_DEL_PAIS: Record<NombreDePais, Punto> = {
  Alaska: { x: 80, y: 80 },
  Yukón: { x: 205, y: 55 },
  Groenlandia: { x: 420, y: 50 },
  Canadá: { x: 240, y: 150 },
  Labrador: { x: 470, y: 140 },
  Oregón: { x: 85, y: 175 },
  Terranova: { x: 450, y: 235 },
  "Nueva York": { x: 300, y: 245 },
  California: { x: 95, y: 270 },
  México: { x: 190, y: 340 },

  Colombia: { x: 310, y: 430 },
  Perú: { x: 250, y: 520 },
  Brasil: { x: 420, y: 510 },
  Chile: { x: 180, y: 620 },
  Uruguay: { x: 440, y: 610 },
  Argentina: { x: 310, y: 620 },

  Islandia: { x: 610, y: 70 },
  Suecia: { x: 790, y: 95 },
  Rusia: { x: 920, y: 80 },
  "Gran Bretaña": { x: 630, y: 180 },
  Alemania: { x: 775, y: 205 },
  Polonia: { x: 890, y: 180 },
  Francia: { x: 696, y: 290 },
  España: { x: 578, y: 290 },
  Italia: { x: 812, y: 305 },

  Sahara: { x: 700, y: 450 },
  Egipto: { x: 860, y: 500 },
  Zaire: { x: 705, y: 585 },
  Etiopía: { x: 830, y: 570 },
  Sudáfrica: { x: 740, y: 715 },
  Madagascar: { x: 1000, y: 715 },

  Tartaria: { x: 1180, y: 45 },
  Taimir: { x: 1310, y: 45 },
  Kamchatka: { x: 1440, y: 110 },
  Aral: { x: 1060, y: 95 },
  Siberia: { x: 1295, y: 132 },
  Mongolia: { x: 1200, y: 200 },
  Turquía: { x: 1010, y: 285 },
  Irán: { x: 1130, y: 270 },
  China: { x: 1330, y: 275 },
  Japón: { x: 1450, y: 255 },
  Israel: { x: 1000, y: 428 },
  Arabia: { x: 1120, y: 485 },
  Gobi: { x: 1232, y: 335 },
  India: { x: 1245, y: 525 },
  Malasia: { x: 1360, y: 450 },

  Sumatra: { x: 1220, y: 630 },
  Borneo: { x: 1390, y: 590 },
  Java: { x: 1415, y: 680 },
  Australia: { x: 1300, y: 730 },
};

/** Dónde va el nombre de cada continente (punto de partida del texto, alineado a la izquierda). */
export const POSICION_DEL_NOMBRE_DEL_CONTINENTE: Record<NombreDeContinente, Punto> = {
  "América del Norte": { x: 270, y: 330 },
  "América del Sur": { x: 120, y: 700 },
  Europa: { x: 600, y: 30 },
  África: { x: 600, y: 720 },
  Asia: { x: 1375, y: 40 },
  Oceanía: { x: 1200, y: 780 },
};

/**
 * Pares limítrofes que en el tablero cruzan el borde del mapa (el mundo da la vuelta).
 * En vez de una línea que atraviese todo el mapa, cada extremo sale hacia el borde más cercano.
 */
export const LIMITES_QUE_DAN_LA_VUELTA: readonly (readonly [NombreDePais, NombreDePais])[] = [
  ["Alaska", "Kamchatka"],
  ["Australia", "Chile"],
];

export function danLaVuelta(a: NombreDePais, b: NombreDePais): boolean {
  return LIMITES_QUE_DAN_LA_VUELTA.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}
