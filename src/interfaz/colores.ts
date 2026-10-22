import type { NombreDeContinente } from "../motor/mapa";
import type { Color } from "../motor/partida";

export const ESTILO_DE_COLOR: Record<Color, { fondo: string; texto: string }> = {
  azul: { fondo: "#1f5fbf", texto: "#ffffff" },
  rojo: { fondo: "#c62828", texto: "#ffffff" },
  negro: { fondo: "#222222", texto: "#ffffff" },
  amarillo: { fondo: "#f2c200", texto: "#222222" },
  verde: { fondo: "#2e7d32", texto: "#ffffff" },
  magenta: { fondo: "#c2185b", texto: "#ffffff" },
};

/** El color de cada continente en el tablero ilustrado, para nombrarlo fuera del tablero con el mismo color. */
export const COLOR_DEL_CONTINENTE: Record<NombreDeContinente, string> = {
  "América del Norte": "#e8a90c",
  "América del Sur": "#4e9a2c",
  Europa: "#2f86e0",
  África: "#d98b1c",
  Asia: "#e0532e",
  Oceanía: "#a052d6",
};
