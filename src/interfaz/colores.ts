import type { Color } from "../motor/partida";

export const ESTILO_DE_COLOR: Record<Color, { fondo: string; texto: string }> = {
  azul: { fondo: "#1f5fbf", texto: "#ffffff" },
  rojo: { fondo: "#c62828", texto: "#ffffff" },
  negro: { fondo: "#222222", texto: "#ffffff" },
  amarillo: { fondo: "#f2c200", texto: "#222222" },
  verde: { fondo: "#2e7d32", texto: "#ffffff" },
  magenta: { fondo: "#c2185b", texto: "#ffffff" },
};
