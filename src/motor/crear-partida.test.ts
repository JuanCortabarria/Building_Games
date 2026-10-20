import { describe, expect, it } from "vitest";
import { coloresDisponibles, crearPartida, type Color } from "./partida";
import { fuenteFija } from "./azar";
import { partidaDe } from "./ayudas-de-test";

describe("crear una partida", () => {
  it("se puede crear una partida con 2 jugadores", () => {
    const resultado = crearPartida(
      [
        { nombre: "Ana", color: "azul" },
        { nombre: "Beto", color: "rojo" },
      ],
      fuenteFija(),
    );

    expect(resultado.ok).toBe(true);
  });

  it("se puede crear una partida con 6 jugadores", () => {
    const resultado = crearPartida(
      [
        { nombre: "Ana", color: "azul" },
        { nombre: "Beto", color: "rojo" },
        { nombre: "Caro", color: "negro" },
        { nombre: "Dani", color: "amarillo" },
        { nombre: "Eli", color: "verde" },
        { nombre: "Fede", color: "magenta" },
      ],
      fuenteFija(),
    );

    expect(resultado.ok).toBe(true);
  });

  it("no se puede crear una partida con menos de 2 ni con más de 6 jugadores", () => {
    const unJugador = crearPartida([{ nombre: "Ana", color: "azul" }], fuenteFija());
    const sieteJugadores = crearPartida(
      [
        { nombre: "Ana", color: "azul" },
        { nombre: "Beto", color: "rojo" },
        { nombre: "Caro", color: "negro" },
        { nombre: "Dani", color: "amarillo" },
        { nombre: "Eli", color: "verde" },
        { nombre: "Fede", color: "magenta" },
        { nombre: "Gabi", color: "azul" },
      ],
      fuenteFija(),
    );

    expect(unJugador).toEqual({ ok: false, error: expect.stringMatching(/entre 2 y 6 jugadores/) });
    expect(sieteJugadores).toEqual({
      ok: false,
      error: expect.stringMatching(/entre 2 y 6 jugadores/),
    });
  });

  it("dos jugadores no pueden tener el mismo color", () => {
    const resultado = crearPartida(
      [
        { nombre: "Ana", color: "verde" },
        { nombre: "Beto", color: "rojo" },
        { nombre: "Caro", color: "verde" },
      ],
      fuenteFija(),
    );

    expect(resultado).toEqual({ ok: false, error: expect.stringMatching(/verde/) });
  });

  it("los colores disponibles son los que todavía no eligió ningún jugador", () => {
    const elegidos = [
      { nombre: "Ana", color: "azul" },
      { nombre: "Beto", color: "verde" },
    ] as const;

    expect(coloresDisponibles(elegidos)).toEqual(["rojo", "negro", "amarillo", "magenta"]);
  });

  it("el orden de juego lo sortea la fuente de azar", () => {
    const resultado = crearPartida(
      [
        { nombre: "Ana", color: "azul" },
        { nombre: "Beto", color: "rojo" },
        { nombre: "Caro", color: "negro" },
      ],
      // El sorteo del orden pone primero a la tercera anotada, después a la primera y después al segundo.
      fuenteFija({ ordenDeJuego: [2, 0, 1] }),
    );

    expect(nombres(partidaDe(resultado).ordenDeJuego())).toEqual(["Caro", "Ana", "Beto"]);
  });

  it("con 4 jugadores, los dos primeros en el orden de juego reciben 13 países y los otros dos 12", () => {
    const partida = partidaDe(
      crearPartida(
        [
          { nombre: "Ana", color: "azul" },
          { nombre: "Beto", color: "rojo" },
          { nombre: "Caro", color: "negro" },
          { nombre: "Dani", color: "amarillo" },
        ],
        // El sorteo invierte el orden: juegan Dani, Caro, Beto y Ana.
        fuenteFija({ ordenDeJuego: [3, 2, 1, 0] }),
      ),
    );

    const paisesDe = (color: Color) => partida.paises().filter((pais) => pais.ocupante === color).length;
    expect({
      Dani: paisesDe("amarillo"),
      Caro: paisesDe("negro"),
      Beto: paisesDe("rojo"),
      Ana: paisesDe("azul"),
    }).toEqual({ Dani: 13, Caro: 13, Beto: 12, Ana: 12 });
  });

  it("los países mezclados se reparten de a uno, en el orden de juego", () => {
    const partida = partidaDe(
      crearPartida(
        [
          { nombre: "Ana", color: "azul" },
          { nombre: "Beto", color: "rojo" },
          { nombre: "Caro", color: "negro" },
          { nombre: "Dani", color: "amarillo" },
        ],
        fuenteFija({ primerosPaises: ["Java", "Alaska", "Chile", "Egipto", "Italia"] }),
      ),
    );

    const ocupanteDe = (nombre: string) => partida.paises().find((pais) => pais.nombre === nombre)?.ocupante;
    expect({
      Java: ocupanteDe("Java"),
      Alaska: ocupanteDe("Alaska"),
      Chile: ocupanteDe("Chile"),
      Egipto: ocupanteDe("Egipto"),
      Italia: ocupanteDe("Italia"),
    }).toEqual({ Java: "azul", Alaska: "rojo", Chile: "negro", Egipto: "amarillo", Italia: "azul" });
  });

  it("cada país empieza con 1 ejército", () => {
    const partida = partidaDe(
      crearPartida(
        [
          { nombre: "Ana", color: "azul" },
          { nombre: "Beto", color: "rojo" },
        ],
        fuenteFija(),
      ),
    );

    const conOtraCantidad = partida.paises().filter((pais) => pais.ejercitos !== 1);
    expect(conOtraCantidad).toEqual([]);
  });
});

function nombres(jugadores: readonly { nombre: string }[]): string[] {
  return jugadores.map((jugador) => jugador.nombre);
}
