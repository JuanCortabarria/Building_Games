// Las tarjetas de país y las reglas del canje. Hay 50, una por país, cada una con su símbolo
// (docs/reference/teg-tarjetas-y-objetivos.md).
import type { NombreDePais } from "./mapa";

/** El dibujo de una tarjeta de país. El comodín vale por cualquiera de los otros tres en un canje. */
export type Simbolo = "galeón" | "cañón" | "globo" | "comodín";

/** Cuántas tarjetas se entregan en un canje. */
export const TARJETAS_POR_CANJE = 3;

/** Los ejércitos que se ponen en el país de la tarjeta recibida, si quien la recibe lo ocupa. */
export const EJERCITOS_POR_TARJETA = 2;

/** Cuántos países hay que conquistar en un turno para recibir tarjeta: 1, y 2 después del tercer canje. */
export function conquistasParaRecibirTarjeta(canjesHechos: number): number {
  return canjesHechos >= 3 ? 2 : 1;
}

/** Los ejércitos que da el canje número `numero` de un jugador: 4, 7, 10, y después 5 más cada vez. */
export function valorDelCanje(numero: number): number {
  if (numero <= 3) return [4, 7, 10][numero - 1]!;
  return 10 + 5 * (numero - 3);
}

/**
 * Las tarjetas forman canje si son todas del mismo símbolo o todas de símbolos distintos, y el comodín
 * vale por cualquiera. Con 3, la única combinación que no forma canje es la de 2 de un símbolo y 1 de otro.
 */
export function formanCanje(tarjetas: readonly NombreDePais[]): boolean {
  const simbolos = tarjetas.map((pais) => SIMBOLO_DE_TARJETA[pais]).filter((simbolo) => simbolo !== "comodín");
  const distintos = new Set(simbolos).size;
  return distintos === 1 || distintos === simbolos.length;
}

export const SIMBOLO_DE_TARJETA: Record<NombreDePais, Simbolo> = {
  // América del Sur
  Argentina: "comodín",
  Brasil: "galeón",
  Chile: "globo",
  Colombia: "globo",
  Perú: "galeón",
  Uruguay: "globo",
  // América del Norte
  Alaska: "galeón",
  California: "cañón",
  Canadá: "cañón",
  Groenlandia: "galeón",
  Labrador: "cañón",
  México: "cañón",
  "Nueva York": "galeón",
  Oregón: "cañón",
  Terranova: "cañón",
  Yukón: "globo",
  // Europa
  Alemania: "galeón",
  España: "globo",
  Francia: "globo",
  "Gran Bretaña": "galeón",
  Islandia: "galeón",
  Italia: "globo",
  Polonia: "cañón",
  Rusia: "globo",
  Suecia: "galeón",
  // Asia
  Arabia: "cañón",
  Aral: "cañón",
  China: "galeón",
  Gobi: "globo",
  India: "globo",
  Irán: "globo",
  Israel: "galeón",
  Japón: "cañón",
  Kamchatka: "globo",
  Malasia: "cañón",
  Mongolia: "galeón",
  Siberia: "galeón",
  Taimir: "comodín",
  Tartaria: "cañón",
  Turquía: "galeón",
  // África
  Egipto: "globo",
  Etiopía: "globo",
  Madagascar: "galeón",
  Sahara: "cañón",
  Sudáfrica: "cañón",
  Zaire: "galeón",
  // Oceanía
  Australia: "cañón",
  Borneo: "galeón",
  Java: "cañón",
  Sumatra: "globo",
};
