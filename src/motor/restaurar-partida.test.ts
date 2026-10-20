import { describe, expect, it } from "vitest";
import { crearPartida, restaurarPartida, type Partida } from "./partida";
import type { NombreDePais } from "./mapa";
import { fuenteConSemilla, fuenteFija, reanudarFuente } from "./azar";
import { partidaDe, partidaEnRondaDeAtaque } from "./ayudas-de-test";

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

    expect(restaurada.ronda()).toEqual({ tipo: "incorporacion", inicial: true, numero: 1 });
    expect(restaurada.jugadorEnTurno()).toEqual({ nombre: "Beto", color: "rojo" });
    expect(restaurada.ejercitosPorIncorporar()).toEqual({ generales: 5, porContinente: {} });
  });

  it("una partida restaurada a mitad de una incorporación conserva los extras por poner y quién abrió la ronda", () => {
    // Beto abrió la ronda de ataque 1 y Caro pasa el turno: la incorporación 1 la abre Caro, que ocupa Oceanía.
    let original = partidaEnRondaDeAtaque({
      jugadores: ["Ana", "Beto", "Caro"],
      paises: { Beto: ["Argentina"], Caro: ["Australia", "Borneo", "Java", "Sumatra"] },
      resto: "Ana",
      numero: 1,
      abrio: "Beto",
      enTurno: "Ana",
    });
    original = partidaDe(original.aplicar({ tipo: "pasarTurno" }));
    original = partidaDe(original.aplicar({ tipo: "incorporar", pais: "Java", cantidad: 1 }));
    const estadoGuardado = JSON.parse(JSON.stringify(original.estado()));

    let restaurada = partidaDe(restaurarPartida(estadoGuardado, fuenteFija()));

    expect(restaurada.jugadorEnTurno().nombre).toBe("Caro");
    expect(restaurada.ejercitosPorIncorporar()).toEqual({ generales: 3, porContinente: { Oceanía: 1 } });
    restaurada = partidaDe(restaurada.aplicar({ tipo: "incorporar", pais: "Java", cantidad: 4 }));
    restaurada = partidaDe(restaurada.aplicar({ tipo: "pasarTurno" }));
    expect(restaurada.ronda()).toEqual({ tipo: "incorporacion", inicial: false, numero: 1 });
    expect(restaurada.jugadorEnTurno().nombre).toBe("Ana");
  });

  it("aplicar una acción no cambia la partida de antes", () => {
    const antes = partidaDeDos();

    antes.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 2 });

    expect(antes.paises().find((pais) => pais.nombre === "Argentina")?.ejercitos).toBe(1);
    expect(antes.ejercitosPorIncorporar()).toEqual({ generales: 5, porContinente: {} });
  });

  it("cambiar el estado que devuelve una partida no cambia la partida", () => {
    const partida = partidaDeDos();

    partida.estado().paises.Argentina.ejercitos = 99;

    expect(partida.paises().find((pais) => pais.nombre === "Argentina")?.ejercitos).toBe(1);
  });

  it("cambiar lo que devuelven las consultas no cambia la partida", () => {
    const partida = partidaDeDos();

    partida.ronda().numero = 9;
    partida.jugadorEnTurno().nombre = "Zoe";
    partida.ordenDeJuego()[1]!.nombre = "Zoe";

    expect(partida.ronda()).toEqual({ tipo: "incorporacion", inicial: true, numero: 1 });
    expect(partida.ordenDeJuego()).toEqual([
      { nombre: "Ana", color: "azul" },
      { nombre: "Beto", color: "rojo" },
    ]);
  });

  it("cambiar el estado guardado después de restaurarlo no cambia la partida restaurada", () => {
    const estadoGuardado = partidaDeDos().estado();
    const restaurada = partidaDe(restaurarPartida(estadoGuardado, fuenteFija()));

    estadoGuardado.paises.Argentina.ejercitos = 99;

    expect(restaurada.paises().find((pais) => pais.nombre === "Argentina")?.ejercitos).toBe(1);
  });
});

describe("el azar de una partida guardada", () => {
  it("el estado de una partida lleva la semilla de su fuente de azar", () => {
    const partida = partidaDe(crearPartida(ANA_Y_BETO, fuenteConSemilla(2026)));

    expect(partida.estado().azar.semilla).toBe(2026);
  });

  it("la fuente reanudada desde el estado guardado sortea lo mismo que la fuente original", () => {
    const azarOriginal = fuenteConSemilla(2026);
    const partida = partidaDe(crearPartida(ANA_Y_BETO, azarOriginal));
    const estadoGuardado = JSON.parse(JSON.stringify(partida.estado()));

    const conLaOriginal = partidaDe(crearPartida(SEIS_JUGADORES, azarOriginal));
    const conLaReanudada = partidaDe(crearPartida(SEIS_JUGADORES, reanudarFuente(estadoGuardado.azar)));

    expect(conLaReanudada.ordenDeJuego()).toEqual(conLaOriginal.ordenDeJuego());
    expect(conLaReanudada.paises()).toEqual(conLaOriginal.paises());
  });

  it("la fuente reanudada no vuelve al principio de la secuencia: sigue desde donde quedó al crear la partida", () => {
    const partida = partidaDe(crearPartida(ANA_Y_BETO, fuenteConSemilla(2026)));
    const estadoGuardado = JSON.parse(JSON.stringify(partida.estado()));

    const conLaReanudada = partidaDe(crearPartida(SEIS_JUGADORES, reanudarFuente(estadoGuardado.azar)));
    const desdeElPrincipio = partidaDe(crearPartida(SEIS_JUGADORES, fuenteConSemilla(2026)));

    expect(conLaReanudada.paises()).not.toEqual(desdeElPrincipio.paises());
  });

  it("una partida restaurada sigue con la fuente de azar que recibe al restaurarla", () => {
    const estadoGuardado = partidaDe(crearPartida(ANA_Y_BETO, fuenteConSemilla(2026))).estado();

    const restaurada = partidaDe(restaurarPartida(estadoGuardado, fuenteConSemilla(7)));

    expect(restaurada.estado().azar).toEqual({ semilla: 7, avance: 0 });
  });

  it("una partida con semilla, guardada a mitad de un turno y restaurada con su fuente reanudada, queda igual a la original", () => {
    let original = partidaDe(crearPartida(ANA_Y_BETO, fuenteConSemilla(2026)));
    original = partidaDe(original.aplicar({ tipo: "incorporar", pais: unPaisDelJugadorEnTurno(original), cantidad: 5 }));
    original = partidaDe(original.aplicar({ tipo: "pasarTurno" }));
    original = partidaDe(original.aplicar({ tipo: "incorporar", pais: unPaisDelJugadorEnTurno(original), cantidad: 2 }));
    const estadoGuardado = JSON.parse(JSON.stringify(original.estado()));

    const restaurada = partidaDe(restaurarPartida(estadoGuardado, reanudarFuente(estadoGuardado.azar)));

    expect(restaurada.ejercitosPorIncorporar()).toEqual({ generales: 3, porContinente: {} });
    expect(restaurada.estado()).toEqual(original.estado());
  });
});

function unPaisDelJugadorEnTurno(partida: Partida): NombreDePais {
  const { color } = partida.jugadorEnTurno();
  return partida.paises().find((pais) => pais.ocupante === color)!.nombre;
}

const SEIS_JUGADORES = [
  { nombre: "Ana", color: "azul" },
  { nombre: "Beto", color: "rojo" },
  { nombre: "Caro", color: "negro" },
  { nombre: "Dani", color: "amarillo" },
  { nombre: "Eli", color: "verde" },
  { nombre: "Fede", color: "magenta" },
] as const;

const ANA_Y_BETO = [
  { nombre: "Ana", color: "azul" },
  { nombre: "Beto", color: "rojo" },
] as const;

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
