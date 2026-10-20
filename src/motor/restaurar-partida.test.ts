import { describe, expect, it } from "vitest";
import { crearPartida, restaurarPartida } from "./partida";
import { fuenteFija } from "./azar";
import { partidaDe } from "./ayudas-de-test";

describe("restaurar una partida", () => {
  it("restaurar el estado de una partida da una partida igual a la original", () => {
    const original = partidaDe(
      crearPartida(
        [
          { nombre: "Ana", color: "azul" },
          { nombre: "Beto", color: "rojo" },
          { nombre: "Caro", color: "negro" },
        ],
        fuenteFija({ ordenDeJuego: [1, 2, 0] }),
      ),
    );
    const estadoGuardado = JSON.parse(JSON.stringify(original.estado()));

    const restaurada = partidaDe(restaurarPartida(estadoGuardado, fuenteFija()));

    expect(restaurada.ordenDeJuego()).toEqual(original.ordenDeJuego());
    expect(restaurada.paises()).toEqual(original.paises());
  });
});
