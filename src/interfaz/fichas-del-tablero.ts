// Dónde va la ficha de cada país sobre la imagen del tablero (docs/reference/teg-tablero.webp).
// Si la imagen cambia, hay que volver a acomodar las fichas mirándolas en pantalla.
import type { NombreDePais } from "../motor/mapa";

/** El tamaño de la imagen del tablero, en píxeles. Las posiciones de las fichas están en esos píxeles. */
export const ANCHO_DEL_TABLERO = 1516;
export const ALTO_DEL_TABLERO = 1038;

/** El radio de una ficha, con su borde, en píxeles de la imagen. */
export const RADIO_DE_LA_FICHA = 20;

/**
 * El centro de la ficha de cada país. Van al lado del nombre del país, casi siempre abajo, sin taparlo.
 * Están acomodadas a mano: en los países chicos (Islandia, Labrador, Terranova, Sumatra, Java, Madagascar)
 * la ficha se asoma al mar, del lado donde no hay otro país.
 */
export const POSICION_DE_LA_FICHA: Record<NombreDePais, { x: number; y: number }> = {
  // América del Norte
  Alaska: { x: 101, y: 234 },
  Yukón: { x: 180, y: 205 },
  Canadá: { x: 284, y: 286 },
  Groenlandia: { x: 465, y: 141 },
  Labrador: { x: 412, y: 222 },
  Terranova: { x: 530, y: 303 },
  Oregón: { x: 76, y: 339 },
  "Nueva York": { x: 426, y: 336 },
  California: { x: 328, y: 372 },
  México: { x: 273, y: 447 },
  // América del Sur
  Colombia: { x: 345, y: 597 },
  Perú: { x: 308, y: 676 },
  Brasil: { x: 464, y: 690 },
  Chile: { x: 306, y: 784 },
  Argentina: { x: 388, y: 836 },
  Uruguay: { x: 480, y: 786 },
  // Europa
  Islandia: { x: 655, y: 242 },
  Suecia: { x: 842, y: 264 },
  Rusia: { x: 972, y: 266 },
  "Gran Bretaña": { x: 718, y: 264 },
  Alemania: { x: 850, y: 368 },
  Polonia: { x: 1018, y: 336 },
  Francia: { x: 788, y: 413 },
  Italia: { x: 868, y: 446 },
  España: { x: 706, y: 456 },
  // África
  Sahara: { x: 756, y: 600 },
  Egipto: { x: 940, y: 606 },
  Zaire: { x: 781, y: 675 },
  Etiopía: { x: 912, y: 674 },
  Sudáfrica: { x: 846, y: 726 },
  Madagascar: { x: 1010, y: 741 },
  // Asia
  Tartaria: { x: 1119, y: 223 },
  Taimir: { x: 1260, y: 216 },
  Kamchatka: { x: 1410, y: 272 },
  Siberia: { x: 1318, y: 270 },
  Aral: { x: 1118, y: 328 },
  Mongolia: { x: 1304, y: 327 },
  Irán: { x: 1066, y: 385 },
  Gobi: { x: 1205, y: 426 },
  China: { x: 1302, y: 455 },
  Turquía: { x: 945, y: 423 },
  Israel: { x: 1012, y: 499 },
  Arabia: { x: 1094, y: 512 },
  India: { x: 1186, y: 548 },
  Japón: { x: 1452, y: 440 },
  Malasia: { x: 1322, y: 616 },
  // Oceanía
  Sumatra: { x: 1252, y: 652 },
  Borneo: { x: 1334, y: 676 },
  Australia: { x: 1378, y: 834 },
  Java: { x: 1284, y: 893 },
};
