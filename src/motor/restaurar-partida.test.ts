import { describe, expect, it } from "vitest";
import { crearPartida, restaurarPartida, type Partida } from "./partida";
import { fuenteFija } from "./azar";

function partidaDe(resultado: { ok: true; partida: Partida } | { ok: false; error: string }): Partida {
  if (!resultado.ok) throw new Error(`Se esperaba una partida y vino el error: ${resultado.error}`);
  return resultado.partida;
}

describe("restaurar una partida", () => {
  it("restaurar el estado de una partida da una partida igual a la original", () => {
    const original = partidaDe(
      crearPartida(
        [
          { nombre: "Ana", color: "azul" },
          { nombre: "Beto", color: "rojo" },
          { nombre: "Caro", color: "negro" },
        ],
        fuenteFija({ mezclas: [[1, 2, 0]] }),
      ),
    );
    const estadoGuardado = JSON.parse(JSON.stringify(original.estado()));

    const restaurada = partidaDe(restaurarPartida(estadoGuardado, fuenteFija()));

    expect(restaurada.ordenDeJuego()).toEqual(original.ordenDeJuego());
    expect(restaurada.paises()).toEqual(original.paises());
  });
});
