import { describe, expect, it } from "vitest";
import { partidaDe, partidaEnRondaDeAtaque } from "./ayudas-de-test";
import { PAISES, type NombreDePais } from "./mapa";
import { restaurarPartida, type Partida } from "./partida";
import { fuenteFija } from "./azar";

/**
 * Ana, Beto y Caro, en la ronda de ataque 1 y en el turno de Ana.
 * Ana tiene Argentina y Brasil; Beto, Chile y Uruguay; el resto es de Caro.
 */
function turnoDeAna({
  ejercitos = {},
  dados,
}: { ejercitos?: Partial<Record<NombreDePais, number>>; dados?: number[] } = {}): Partida {
  return partidaEnRondaDeAtaque({
    jugadores: ["Ana", "Beto", "Caro"],
    paises: { Ana: ["Argentina", "Brasil"], Beto: ["Chile", "Uruguay"] },
    ejercitos,
    resto: "Caro",
    numero: 1,
    abrio: "Ana",
    enTurno: "Ana",
    dados,
  });
}

function pais(partida: Partida, nombre: NombreDePais) {
  const { ocupante, ejercitos } = partida.paises().find((enJuego) => enJuego.nombre === nombre)!;
  return { ocupante, ejercitos };
}

/**
 * Ana conquista Chile atacando desde Argentina, que tiene los ejércitos dados (5 si no se dice).
 * Chile tiene 1 ejército y la tirada es 6 contra 1. `dadosDespues` son los que siguen saliendo.
 */
function anaConquistaChile(enArgentina = 5, dadosDespues: number[] = []): Partida {
  const dadosDelAtacante = [6, 6, 6].slice(0, Math.min(3, enArgentina - 1));
  const partida = turnoDeAna({
    ejercitos: { Argentina: enArgentina },
    dados: [...dadosDelAtacante, 1, ...dadosDespues],
  });
  return partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));
}

describe("un país que se queda sin ejércitos", () => {
  it("pasa a ser del atacante, que tiene que mover ejércitos a él desde el país de origen", () => {
    const partida = anaConquistaChile();

    expect(pais(partida, "Chile").ocupante).toBe("azul");
    expect(partida.conquistaPendiente()).toEqual({ desde: "Argentina", hacia: "Chile", maximo: 3 });
  });

  it("el atacante elige mover 3 ejércitos: quedan 3 en el conquistado y 2 en el origen", () => {
    const partida = partidaDe(anaConquistaChile().aplicar({ tipo: "moverAlConquistado", cantidad: 3 }));

    expect(pais(partida, "Chile")).toEqual({ ocupante: "azul", ejercitos: 3 });
    expect(pais(partida, "Argentina")).toEqual({ ocupante: "azul", ejercitos: 2 });
    expect(partida.conquistaPendiente()).toBeNull();
  });
});

describe("cuántos ejércitos se mueven al país conquistado", () => {
  it("se puede mover 1 solo ejército: el que entró al conquistar", () => {
    const partida = partidaDe(anaConquistaChile().aplicar({ tipo: "moverAlConquistado", cantidad: 1 }));

    expect(pais(partida, "Chile")).toEqual({ ocupante: "azul", ejercitos: 1 });
    expect(pais(partida, "Argentina")).toEqual({ ocupante: "azul", ejercitos: 4 });
  });

  it("no se pueden mover más de 3, aunque sobren en el origen", () => {
    expect(anaConquistaChile().aplicar({ tipo: "moverAlConquistado", cantidad: 4 })).toEqual({
      ok: false,
      error: "Ana puede mover a Chile entre 1 y 3 ejércitos.",
    });
  });

  it("no se pueden mover 0 ejércitos, porque un país nunca queda vacío", () => {
    expect(anaConquistaChile().aplicar({ tipo: "moverAlConquistado", cantidad: 0 })).toEqual({
      ok: false,
      error: "Ana puede mover a Chile entre 1 y 3 ejércitos.",
    });
  });

  it("con 3 ejércitos en el origen se pueden mover hasta 2, porque tiene que quedar 1", () => {
    const partida = anaConquistaChile(3);

    expect(partida.conquistaPendiente()?.maximo).toBe(2);
    expect(partida.aplicar({ tipo: "moverAlConquistado", cantidad: 3 })).toEqual({
      ok: false,
      error: "Ana puede mover a Chile entre 1 y 2 ejércitos, porque en Argentina tiene que quedar al menos 1.",
    });
    const despues = partidaDe(partida.aplicar({ tipo: "moverAlConquistado", cantidad: 2 }));
    expect(pais(despues, "Chile").ejercitos).toBe(2);
    expect(pais(despues, "Argentina").ejercitos).toBe(1);
  });

  it("con 2 ejércitos en el origen no hay nada que elegir: el que entró al conquistar se queda y el turno sigue", () => {
    const partida = anaConquistaChile(2);

    expect(partida.conquistaPendiente()).toBeNull();
    expect(pais(partida, "Chile")).toEqual({ ocupante: "azul", ejercitos: 1 });
    expect(pais(partida, "Argentina")).toEqual({ ocupante: "azul", ejercitos: 1 });
    expect(partida.aplicar({ tipo: "pasarTurno" }).ok).toBe(true);
  });

  it("sin un país recién conquistado no hay a dónde mover", () => {
    expect(turnoDeAna().aplicar({ tipo: "moverAlConquistado", cantidad: 1 })).toEqual({
      ok: false,
      error: "No hay un país recién conquistado al que mover ejércitos.",
    });
  });
});

describe("hasta mover los ejércitos al país conquistado", () => {
  const ERROR = {
    ok: false,
    error: "Ana tiene que mover ejércitos a Chile, que acaba de conquistar, antes de hacer otra cosa.",
  };

  it("no se puede volver a atacar", () => {
    const partida = anaConquistaChile();

    expect(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Perú" })).toEqual(ERROR);
  });

  it("no se puede pasar el turno", () => {
    expect(anaConquistaChile().aplicar({ tipo: "pasarTurno" })).toEqual(ERROR);
  });

  it("no se pueden poner ejércitos", () => {
    expect(anaConquistaChile().aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 1 })).toEqual(ERROR);
  });

  it("no se puede reagrupar", () => {
    // Argentina y Brasil son de Ana y limítrofes: sin la conquista pendiente, este reagrupe se podría.
    expect(anaConquistaChile().aplicar({ tipo: "reagrupar", desde: "Argentina", hacia: "Brasil", cantidad: 1 })).toEqual(ERROR);
  });

  it("después de moverlos se puede seguir atacando, también desde el país conquistado", () => {
    // Chile, con 3 ejércitos, ataca a Perú, que tiene 1: 2, 1 contra 6.
    let partida = partidaDe(anaConquistaChile(5, [2, 1, 6]).aplicar({ tipo: "moverAlConquistado", cantidad: 3 }));

    partida = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Chile", hacia: "Perú" }));

    expect(partida.ultimaTirada()?.atacante).toEqual({ pais: "Chile", color: "azul", dados: [2, 1], perdidos: 1 });
  });
});

describe("destruir a un jugador", () => {
  /**
   * Ana, Beto y Caro en la ronda de ataque 2, que abrió Beto: el orden es Beto, Caro, Ana.
   * Es el turno de Caro, y a Beto le queda solo Uruguay, con 1 ejército, limítrofe de Brasil, que es de Caro y tiene 3.
   * Ana tiene 25 países y Caro, los otros 24.
   */
  function caroPorDestruirABeto(): Partida {
    const deAna = PAISES.map((enMapa) => enMapa.nombre)
      .filter((nombre) => nombre !== "Uruguay" && nombre !== "Brasil")
      .slice(0, 25);
    return partidaEnRondaDeAtaque({
      jugadores: ["Ana", "Beto", "Caro"],
      paises: { Ana: deAna, Beto: ["Uruguay"], Caro: ["Brasil"] },
      ejercitos: { Brasil: 3 },
      resto: "Caro",
      numero: 2,
      abrio: "Beto",
      enTurno: "Caro",
      dados: [6, 6, 1],
    });
  }

  function caroDestruyeABeto(): Partida {
    const partida = partidaDe(caroPorDestruirABeto().aplicar({ tipo: "atacar", desde: "Brasil", hacia: "Uruguay" }));
    return partidaDe(partida.aplicar({ tipo: "moverAlConquistado", cantidad: 1 }));
  }

  it("un jugador que pierde su último país queda destruido", () => {
    expect(caroPorDestruirABeto().destruidos()).toEqual([]);

    expect(caroDestruyeABeto().destruidos()).toEqual([{ nombre: "Beto", color: "rojo" }]);
  });

  it("con Ana, Beto y Caro, si Beto queda destruido durante la ronda de ataque 2, la ronda de incorporación 2 es Caro, Ana", () => {
    let partida = caroDestruyeABeto();
    const turnos: string[] = [];

    for (let i = 0; i < 4; i++) {
      partida = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));
      const { tipo, numero } = partida.ronda();
      turnos.push(`${tipo} ${numero}: ${partida.jugadorEnTurno().nombre}`);
      partida = ponerTodosLosEjercitos(partida);
    }

    expect(turnos).toEqual(["ataque 2: Ana", "incorporacion 2: Caro", "incorporacion 2: Ana", "ataque 3: Caro"]);
  });
});

describe("ganar", () => {
  /**
   * Ana, Beto y Caro en la ronda de ataque 1, en el turno de Ana. Ana tiene Argentina, con 5 ejércitos, y otros
   * países hasta sumar los dados; Beto tiene Chile, con 1 ejército, y Uruguay; Caro, el resto.
   * La tirada que sigue es 6, 6, 6 contra 1: Ana conquista Chile.
   */
  function anaConPaises(cantidad: number): Partida {
    const otros = PAISES.map((enMapa) => enMapa.nombre).filter(
      (nombre) => !["Argentina", "Chile", "Uruguay"].includes(nombre),
    );
    return partidaEnRondaDeAtaque({
      jugadores: ["Ana", "Beto", "Caro"],
      paises: { Ana: ["Argentina", ...otros.slice(0, cantidad - 1)], Beto: ["Chile", "Uruguay"] },
      ejercitos: { Argentina: 5 },
      resto: "Caro",
      numero: 1,
      abrio: "Ana",
      enTurno: "Ana",
      dados: [6, 6, 6, 1],
    });
  }

  const ATACAR_CHILE = { tipo: "atacar", desde: "Argentina", hacia: "Chile" } as const;

  it("un jugador que llega a 29 países no gana", () => {
    const partida = partidaDe(anaConPaises(28).aplicar(ATACAR_CHILE));

    expect(partida.ganador()).toBeNull();
  });

  it("un jugador que llega a 30 países gana en el acto, aunque esté en medio de su turno de ataque", () => {
    const antes = anaConPaises(29);
    expect(antes.ganador()).toBeNull();

    const partida = partidaDe(antes.aplicar(ATACAR_CHILE));

    expect(partida.ganador()).toEqual({ nombre: "Ana", color: "azul" });
    expect(partida.paises().filter((enJuego) => enJuego.ocupante === "azul")).toHaveLength(30);
    // La partida terminó: ya no hay que mover ejércitos a Chile, que queda con el que entró al conquistar.
    expect(partida.conquistaPendiente()).toBeNull();
    expect(pais(partida, "Chile")).toEqual({ ocupante: "azul", ejercitos: 1 });
  });

  it("con un ganador, el motor rechaza cualquier acción", () => {
    const partida = partidaDe(anaConPaises(29).aplicar(ATACAR_CHILE));
    const ERROR = { ok: false, error: "La partida terminó: ganó Ana." };

    expect(partida.aplicar({ tipo: "moverAlConquistado", cantidad: 1 })).toEqual(ERROR);
    expect(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Uruguay" })).toEqual(ERROR);
    expect(partida.aplicar({ tipo: "pasarTurno" })).toEqual(ERROR);
    expect(partida.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 1 })).toEqual(ERROR);
  });

  it("con 2 jugadores, destruir al rival da la victoria: el ganador ocupa los 50 países", () => {
    // Beto conserva solo Chile; Ana tiene los otros 49 y ataca desde Argentina.
    const partida = partidaEnRondaDeAtaque({
      jugadores: ["Ana", "Beto"],
      paises: { Beto: ["Chile"] },
      ejercitos: { Argentina: 3 },
      resto: "Ana",
      numero: 1,
      abrio: "Ana",
      enTurno: "Ana",
      dados: [6, 6, 1],
    });

    const despues = partidaDe(partida.aplicar(ATACAR_CHILE));

    expect(despues.destruidos()).toEqual([{ nombre: "Beto", color: "rojo" }]);
    expect(despues.ganador()).toEqual({ nombre: "Ana", color: "azul" });
    expect(despues.paises().every((enJuego) => enJuego.ocupante === "azul")).toBe(true);
  });

  it("una partida ganada, guardada y restaurada, sigue terminada", () => {
    const ganada = partidaDe(anaConPaises(29).aplicar(ATACAR_CHILE));

    const restaurada = partidaDe(restaurarPartida(JSON.parse(JSON.stringify(ganada.estado())), fuenteFija()));

    expect(restaurada.ganador()).toEqual({ nombre: "Ana", color: "azul" });
    expect(restaurada.aplicar({ tipo: "pasarTurno" })).toEqual({ ok: false, error: "La partida terminó: ganó Ana." });
  });
});

/** El jugador en turno pone los ejércitos que tenga por incorporar, para poder pasar el turno. */
function ponerTodosLosEjercitos(partida: Partida): Partida {
  const { generales, porContinente } = partida.ejercitosPorIncorporar();
  const suyos = partida.paises().filter((enJuego) => enJuego.ocupante === partida.jugadorEnTurno().color);
  const aPoner = [
    { pais: suyos[0]!.nombre, cantidad: generales },
    ...Object.entries(porContinente).map(([continente, cantidad]) => ({
      pais: suyos.find((enJuego) => enJuego.continente === continente)!.nombre,
      cantidad,
    })),
  ];
  for (const { pais, cantidad } of aPoner) {
    if (cantidad > 0) partida = partidaDe(partida.aplicar({ tipo: "incorporar", pais, cantidad }));
  }
  return partida;
}
