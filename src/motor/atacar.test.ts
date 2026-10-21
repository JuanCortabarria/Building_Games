import { describe, expect, it } from "vitest";
import { partidaDe, partidaEnRondaDeAtaque } from "./ayudas-de-test";
import type { NombreDePais } from "./mapa";
import { crearPartida, restaurarPartida, type Partida } from "./partida";
import { fuenteConSemilla, fuenteFija, reanudarFuente } from "./azar";

/**
 * Ana, Beto y Caro, en la ronda de ataque 1 y en el turno de Ana.
 * Ana tiene Argentina y Brasil; Beto, Chile y Uruguay; el resto es de Caro.
 * Argentina es limítrofe de Brasil, Chile, Perú y Uruguay, pero no de Colombia.
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

function ejercitosEn(partida: Partida, pais: NombreDePais): number {
  return partida.paises().find((enJuego) => enJuego.nombre === pais)!.ejercitos;
}

describe("una tirada de ataque", () => {
  it("con 4 ejércitos atacando a 2, el atacante tira 3 dados y el defensor 2, y se comparan 2 pares", () => {
    // Atacante 5, 3, 2 y defensor 4, 4: 5 contra 4 gana el atacante, 3 contra 4 gana el defensor, y el 2 no se compara.
    const partida = turnoDeAna({ ejercitos: { Argentina: 4, Chile: 2 }, dados: [5, 3, 2, 4, 4] });

    const despues = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    expect(despues.ultimaTirada()).toEqual({
      atacante: { pais: "Argentina", color: "azul", dados: [5, 3, 2], perdidos: 1 },
      defensor: { pais: "Chile", color: "rojo", dados: [4, 4], perdidos: 1 },
    });
  });

  it("con dados atacante 6, 4, 1 y defensor 5, 4, el defensor pierde 1 ejército y el atacante pierde 1, porque el empate en 4 lo gana el defensor", () => {
    const partida = turnoDeAna({ ejercitos: { Argentina: 4, Chile: 2 }, dados: [6, 4, 1, 5, 4] });

    const despues = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    expect(despues.ultimaTirada()?.atacante.perdidos).toBe(1);
    expect(despues.ultimaTirada()?.defensor.perdidos).toBe(1);
    expect(ejercitosEn(despues, "Argentina")).toBe(3);
    expect(ejercitosEn(despues, "Chile")).toBe(1);
  });

  it("con dados atacante 3 y defensor 5, 2, 1, se compara un solo par y el atacante pierde 1 ejército", () => {
    // Argentina tiene 2 ejércitos: tira 1 dado. Chile tiene 3: tira 3.
    const partida = turnoDeAna({ ejercitos: { Argentina: 2, Chile: 3 }, dados: [3, 5, 2, 1] });

    const despues = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    expect(despues.ultimaTirada()).toEqual({
      atacante: { pais: "Argentina", color: "azul", dados: [3], perdidos: 1 },
      defensor: { pais: "Chile", color: "rojo", dados: [5, 2, 1], perdidos: 0 },
    });
    expect(ejercitosEn(despues, "Argentina")).toBe(1);
    expect(ejercitosEn(despues, "Chile")).toBe(3);
  });

  it("los dados de cada lado se ordenan de mayor a menor antes de comparar", () => {
    // Salen atacante 4 y defensor 1, 5, 2. Sin ordenar, el 4 le ganaría al 1; ordenados, el 4 pierde contra el 5.
    const partida = turnoDeAna({ ejercitos: { Argentina: 2, Chile: 3 }, dados: [4, 1, 5, 2] });

    const despues = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    expect(despues.ultimaTirada()).toEqual({
      atacante: { pais: "Argentina", color: "azul", dados: [4], perdidos: 1 },
      defensor: { pais: "Chile", color: "rojo", dados: [5, 2, 1], perdidos: 0 },
    });
  });

  it("el atacante tira 3 dados como máximo y el defensor también, aunque tengan más ejércitos", () => {
    const partida = turnoDeAna({ ejercitos: { Argentina: 10, Chile: 8 }, dados: [6, 6, 6, 1, 1, 1] });

    const despues = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    expect(despues.ultimaTirada()?.atacante.dados).toEqual([6, 6, 6]);
    expect(despues.ultimaTirada()?.defensor.dados).toEqual([1, 1, 1]);
    expect(ejercitosEn(despues, "Chile")).toBe(5);
  });
});

describe("cuándo no se puede atacar", () => {
  it("no se puede atacar desde un país de otro jugador", () => {
    const partida = turnoDeAna({ ejercitos: { Chile: 3 } });

    expect(partida.aplicar({ tipo: "atacar", desde: "Chile", hacia: "Perú" })).toEqual({
      ok: false,
      error: "Ana solo puede atacar desde un país suyo, y Chile lo ocupa Beto.",
    });
  });

  it("no se puede atacar a un país propio", () => {
    const partida = turnoDeAna({ ejercitos: { Argentina: 3 } });

    expect(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Brasil" })).toEqual({
      ok: false,
      error: "Ana no puede atacar a Brasil, porque es un país suyo.",
    });
  });

  it("no se puede atacar a un país que no es limítrofe", () => {
    const partida = turnoDeAna({ ejercitos: { Argentina: 3 } });

    expect(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Colombia" })).toEqual({
      ok: false,
      error: "Desde Argentina no se puede atacar a Colombia, porque no son limítrofes.",
    });
  });

  it("no se puede atacar desde un país con un solo ejército, porque siempre tiene que quedar uno", () => {
    const partida = turnoDeAna();

    expect(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" })).toEqual({
      ok: false,
      error: "Para atacar desde Argentina hacen falta al menos 2 ejércitos, porque siempre tiene que quedar uno, y tiene 1.",
    });
  });

  it("no se puede atacar desde o hacia algo que no es un país del mapa", () => {
    const partida = turnoDeAna({ ejercitos: { Argentina: 3 } });

    expect(partida.aplicar({ tipo: "atacar", desde: "Atlántida" as NombreDePais, hacia: "Chile" })).toEqual({
      ok: false,
      error: "Atlántida no es un país del mapa.",
    });
    expect(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Atlántida" as NombreDePais })).toEqual({
      ok: false,
      error: "Atlántida no es un país del mapa.",
    });
  });

  it("en una ronda de incorporación no se ataca", () => {
    // Ana y Beto en la primera ronda inicial: Argentina es de Ana y Chile, de Beto.
    let partida = partidaDe(
      crearPartida(
        [
          { nombre: "Ana", color: "azul" },
          { nombre: "Beto", color: "rojo" },
        ],
        fuenteFija({ primerosPaises: ["Argentina", "Chile"], dados: [6, 6, 6, 1] }),
      ),
    );
    partida = partidaDe(partida.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 5 }));

    expect(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" })).toEqual({
      ok: false,
      error: "Solo se ataca en la ronda de ataque, y esta es una ronda de incorporación.",
    });
  });
});

describe("los ataques de un turno", () => {
  it("un jugador puede atacar varias veces en su turno, desde distintos países y repitiendo el mismo", () => {
    let partida = turnoDeAna({
      ejercitos: { Argentina: 4, Brasil: 3, Chile: 2, Uruguay: 2 },
      // Argentina a Chile: 6, 4, 1 contra 5, 4. Brasil a Uruguay: 2, 1 contra 3, 3. Argentina a Chile otra vez: 5, 5 contra 6.
      dados: [6, 4, 1, 5, 4, 2, 1, 3, 3, 5, 5, 6],
    });

    partida = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));
    partida = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Brasil", hacia: "Uruguay" }));
    expect(partida.ultimaTirada()).toEqual({
      atacante: { pais: "Brasil", color: "azul", dados: [2, 1], perdidos: 2 },
      defensor: { pais: "Uruguay", color: "rojo", dados: [3, 3], perdidos: 0 },
    });
    partida = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    expect(partida.ultimaTirada()).toEqual({
      atacante: { pais: "Argentina", color: "azul", dados: [5, 5], perdidos: 1 },
      defensor: { pais: "Chile", color: "rojo", dados: [6], perdidos: 0 },
    });
    expect(partida.jugadorEnTurno().nombre).toBe("Ana");
    expect(ejercitosEn(partida, "Argentina")).toBe(2);
    expect(ejercitosEn(partida, "Brasil")).toBe(1);
    expect(ejercitosEn(partida, "Chile")).toBe(1);
    expect(ejercitosEn(partida, "Uruguay")).toBe(2);
  });

  it("un jugador puede pasar el turno sin atacar", () => {
    const partida = partidaDe(turnoDeAna().aplicar({ tipo: "pasarTurno" }));

    expect(partida.jugadorEnTurno().nombre).toBe("Beto");
    expect(partida.ronda()).toEqual({ tipo: "ataque", inicial: false, numero: 1 });
  });

  it("la última tirada queda a la vista hasta que se pasa el turno", () => {
    let partida = turnoDeAna({ ejercitos: { Argentina: 2 }, dados: [6, 6] });
    expect(partida.ultimaTirada()).toBeNull();

    partida = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));
    expect(partida.ultimaTirada()).not.toBeNull();

    partida = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));
    expect(partida.ultimaTirada()).toBeNull();
  });
});

describe("un país que se queda sin ejércitos", () => {
  // Elegir cuántos ejércitos mover al país conquistado es del ticket 07. Hasta entonces, el motor mueve 1.
  it("pasa a ser del atacante, que mueve a él 1 ejército desde el país de origen", () => {
    const partida = turnoDeAna({ ejercitos: { Argentina: 4, Chile: 2 }, dados: [6, 5, 1, 4, 3] });

    const despues = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    expect(despues.ultimaTirada()?.defensor).toEqual({ pais: "Chile", color: "rojo", dados: [4, 3], perdidos: 2 });
    expect(despues.paises().find((pais) => pais.nombre === "Chile")).toMatchObject({ ocupante: "azul", ejercitos: 1 });
    expect(ejercitosEn(despues, "Argentina")).toBe(3);
  });
});

describe("los dados de una partida con semilla", () => {
  /** El turno de Ana con muchos ejércitos de los dos lados, jugado con la fuente de azar de la aplicación. */
  function conSemilla(semilla: number): Partida {
    const estado = turnoDeAna({ ejercitos: { Argentina: 20, Chile: 20 } }).estado();
    return partidaDe(restaurarPartida(estado, fuenteConSemilla(semilla)));
  }
  const ATAQUE = { tipo: "atacar", desde: "Argentina", hacia: "Chile" } as const;

  it("aplicar dos veces el mismo ataque a la misma partida da los mismos dados", () => {
    const partida = conSemilla(2026);

    const unaVez = partidaDe(partida.aplicar(ATAQUE));
    const otraVez = partidaDe(partida.aplicar(ATAQUE));

    expect(otraVez.ultimaTirada()).toEqual(unaVez.ultimaTirada());
    expect(otraVez.estado()).toEqual(unaVez.estado());
  });

  it("una partida guardada y restaurada con su fuente reanudada tira los mismos dados que la original", () => {
    let original = partidaDe(conSemilla(2026).aplicar(ATAQUE));
    const estadoGuardado = JSON.parse(JSON.stringify(original.estado()));
    let restaurada = partidaDe(restaurarPartida(estadoGuardado, reanudarFuente(estadoGuardado.azar)));

    for (let i = 0; i < 3; i++) {
      original = partidaDe(original.aplicar(ATAQUE));
      restaurada = partidaDe(restaurada.aplicar(ATAQUE));
      expect(restaurada.ultimaTirada()).toEqual(original.ultimaTirada());
    }
    expect(restaurada.estado()).toEqual(original.estado());
  });

  it("los dados que tira la partida van del 1 al 6, y salen todos", () => {
    let partida = conSemilla(2026);
    const dados: number[] = [];

    for (let i = 0; i < 6; i++) {
      partida = partidaDe(partida.aplicar(ATAQUE));
      const { atacante, defensor } = partida.ultimaTirada()!;
      dados.push(...atacante.dados, ...defensor.dados);
    }

    expect(new Set(dados)).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });
});
