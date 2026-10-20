import { describe, expect, it } from "vitest";
import { crearPartida, restaurarPartida } from "./partida";
import { fuenteFija } from "./azar";
import { partidaDe } from "./ayudas-de-test";

describe("el estado de una partida", () => {
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

  it("una partida restaurada a mitad de una ronda inicial sigue en la misma ronda y el mismo turno, con los mismos ejércitos por poner", () => {
    let original = partidaDeDos();
    original = partidaDe(original.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 5 }));
    original = partidaDe(original.aplicar({ tipo: "pasarTurno" }));
    const estadoGuardado = JSON.parse(JSON.stringify(original.estado()));

    const restaurada = partidaDe(restaurarPartida(estadoGuardado, fuenteFija()));

    expect(restaurada.ronda()).toEqual({ tipo: "inicial", numero: 1 });
    expect(restaurada.jugadorEnTurno()).toEqual({ nombre: "Beto", color: "rojo" });
    expect(restaurada.ejercitosPorIncorporar()).toBe(5);
  });

  it("aplicar una acción no cambia la partida de antes", () => {
    const antes = partidaDeDos();

    antes.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 2 });

    expect(antes.paises().find((pais) => pais.nombre === "Argentina")?.ejercitos).toBe(1);
    expect(antes.ejercitosPorIncorporar()).toBe(5);
  });

  it("cambiar el estado que devuelve una partida no cambia la partida", () => {
    const partida = partidaDeDos();

    partida.estado().paises.Argentina.ejercitos = 99;

    expect(partida.paises().find((pais) => pais.nombre === "Argentina")?.ejercitos).toBe(1);
  });

  it("cambiar el estado guardado después de restaurarlo no cambia la partida restaurada", () => {
    const estadoGuardado = partidaDeDos().estado();
    const restaurada = partidaDe(restaurarPartida(estadoGuardado, fuenteFija()));

    estadoGuardado.paises.Argentina.ejercitos = 99;

    expect(restaurada.paises().find((pais) => pais.nombre === "Argentina")?.ejercitos).toBe(1);
  });
});

/** Ana y Beto, en ese orden de juego. Argentina es de Ana. */
function partidaDeDos() {
  return partidaDe(
    crearPartida(
      [
        { nombre: "Ana", color: "azul" },
        { nombre: "Beto", color: "rojo" },
      ],
      fuenteFija({ primerosPaises: ["Argentina"] }),
    ),
  );
}
