import { describe, expect, it } from "vitest";
import { crearPartida, type Partida } from "./partida";
import { fuenteFija } from "./azar";
import { partidaDe } from "./ayudas-de-test";
import type { NombreDePais } from "./mapa";

/**
 * Ana, Beto y Caro, en ese orden de juego.
 * Ana ocupa Argentina y Colombia; Beto, Brasil y Perú; Caro, Chile y Uruguay.
 */
function partidaDeTres(): Partida {
  return partidaDe(
    crearPartida(
      [
        { nombre: "Ana", color: "azul" },
        { nombre: "Beto", color: "rojo" },
        { nombre: "Caro", color: "negro" },
      ],
      fuenteFija({ primerosPaises: ["Argentina", "Brasil", "Chile", "Colombia", "Perú", "Uruguay"] }),
    ),
  );
}

describe("rondas iniciales", () => {
  it("la partida empieza en la primera ronda inicial, con el turno del primero en el orden y 5 ejércitos por poner", () => {
    const partida = partidaDeTres();

    expect(partida.ronda()).toEqual({ tipo: "inicial", numero: 1 });
    expect(partida.jugadorEnTurno()).toEqual({ nombre: "Ana", color: "azul" });
    expect(partida.ejercitosPorIncorporar()).toBe(5);
  });

  it("poner ejércitos en un país propio los suma al país y los descuenta de los que quedan", () => {
    const partida = partidaDeTres();

    const despues = partidaDe(partida.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 2 }));

    expect(ejercitosEn(despues, "Argentina")).toBe(3);
    expect(despues.ejercitosPorIncorporar()).toBe(3);
  });

  it("un jugador no puede poner ejércitos en un país que ocupa otro", () => {
    const partida = partidaDeTres();

    const resultado = partida.aplicar({ tipo: "incorporar", pais: "Brasil", cantidad: 1 });

    expect(resultado).toEqual({ ok: false, error: "Ana no puede poner ejércitos en Brasil, porque lo ocupa Beto." });
  });

  it("un jugador no puede poner más ejércitos de los que le quedan, ni menos de 1", () => {
    const partida = partidaDeTres();

    const deMas = partida.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 6 });
    const ninguno = partida.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 0 });
    const medio = partida.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 1.5 });

    expect(deMas).toEqual({ ok: false, error: "Ana tiene 5 ejércitos por poner y quiso poner 6." });
    expect(ninguno).toEqual({ ok: false, error: "Hay que poner un número entero de ejércitos, de 1 en adelante." });
    expect(medio).toEqual({ ok: false, error: "Hay que poner un número entero de ejércitos, de 1 en adelante." });
  });

  it("un jugador puede repartir sus ejércitos entre sus países como quiera", () => {
    let partida = partidaDeTres();
    partida = partidaDe(partida.aplicar({ tipo: "incorporar", pais: "Colombia", cantidad: 1 }));
    partida = partidaDe(partida.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 3 }));
    partida = partidaDe(partida.aplicar({ tipo: "incorporar", pais: "Colombia", cantidad: 1 }));

    expect(ejercitosEn(partida, "Argentina")).toBe(4);
    expect(ejercitosEn(partida, "Colombia")).toBe(3);
    expect(partida.aplicar({ tipo: "pasarTurno" }).ok).toBe(true);
  });

  it("un jugador no puede pasar el turno hasta poner todos sus ejércitos", () => {
    const partida = partidaDe(partidaDeTres().aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 4 }));

    const resultado = partida.aplicar({ tipo: "pasarTurno" });

    expect(resultado).toEqual({
      ok: false,
      error: "Ana no puede pasar el turno: le queda 1 ejército por poner.",
    });
  });

  it("al pasar el turno juega el siguiente en el orden, con 5 ejércitos por poner", () => {
    const partida = ponerYPasar(partidaDeTres(), "Argentina", 5);

    expect(partida.ronda()).toEqual({ tipo: "inicial", numero: 1 });
    expect(partida.jugadorEnTurno()).toEqual({ nombre: "Beto", color: "rojo" });
    expect(partida.ejercitosPorIncorporar()).toBe(5);
  });

  it("cuando todos pusieron sus 5 ejércitos empieza la segunda ronda inicial, en el mismo orden, con 3 ejércitos", () => {
    let partida = partidaDeTres();
    partida = ponerYPasar(partida, "Argentina", 5);
    partida = ponerYPasar(partida, "Brasil", 5);
    partida = ponerYPasar(partida, "Chile", 5);

    expect(partida.ronda()).toEqual({ tipo: "inicial", numero: 2 });
    expect(partida.jugadorEnTurno()).toEqual({ nombre: "Ana", color: "azul" });
    expect(partida.ejercitosPorIncorporar()).toBe(3);
  });

  it("en la segunda ronda inicial cada jugador pone 3 ejércitos", () => {
    let partida = jugarPrimeraRondaInicial(partidaDeTres());
    partida = ponerYPasar(partida, "Argentina", 3);

    expect(partida.jugadorEnTurno()).toEqual({ nombre: "Beto", color: "rojo" });
    expect(partida.ejercitosPorIncorporar()).toBe(3);
  });

  it("después de la segunda ronda inicial empieza la ronda de ataque 1, en el mismo orden, y cada jugador puede pasar el turno", () => {
    let partida = jugarPrimeraRondaInicial(partidaDeTres());
    partida = ponerYPasar(partida, "Argentina", 3);
    partida = ponerYPasar(partida, "Brasil", 3);
    partida = ponerYPasar(partida, "Chile", 3);

    const enTurno: string[] = [];
    for (let i = 0; i < 3; i++) {
      expect(partida.ronda()).toEqual({ tipo: "ataque", numero: 1 });
      expect(partida.ejercitosPorIncorporar()).toBe(0);
      enTurno.push(partida.jugadorEnTurno().nombre);
      partida = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));
    }
    expect(enTurno).toEqual(["Ana", "Beto", "Caro"]);
  });

  it("en la ronda de ataque no se pueden poner ejércitos", () => {
    let partida = jugarPrimeraRondaInicial(partidaDeTres());
    partida = ponerYPasar(partida, "Argentina", 3);
    partida = ponerYPasar(partida, "Brasil", 3);
    partida = ponerYPasar(partida, "Chile", 3);

    const resultado = partida.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 1 });

    expect(resultado).toEqual({ ok: false, error: "En la ronda de ataque no se ponen ejércitos nuevos." });
  });
});

function jugarPrimeraRondaInicial(partida: Partida): Partida {
  partida = ponerYPasar(partida, "Argentina", 5);
  partida = ponerYPasar(partida, "Brasil", 5);
  return ponerYPasar(partida, "Chile", 5);
}

/** El jugador en turno pone todos los ejércitos en un país y pasa el turno. */
function ponerYPasar(partida: Partida, pais: NombreDePais, cantidad: number): Partida {
  const despues = partidaDe(partida.aplicar({ tipo: "incorporar", pais, cantidad }));
  return partidaDe(despues.aplicar({ tipo: "pasarTurno" }));
}

function ejercitosEn(partida: Partida, pais: string): number | undefined {
  return partida.paises().find((enJuego) => enJuego.nombre === pais)?.ejercitos;
}
