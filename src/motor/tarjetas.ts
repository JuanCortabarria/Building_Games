// Las 50 tarjetas de país: una por país, cada una con su símbolo (docs/reference/teg-tarjetas-y-objetivos.md).
import type { NombreDePais } from "./mapa";

export const SIMBOLOS = ["galeón", "cañón", "globo", "comodín"] as const;
/** El dibujo de una tarjeta de país. El comodín vale por cualquiera de los otros tres en un canje. */
export type Simbolo = (typeof SIMBOLOS)[number];

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
