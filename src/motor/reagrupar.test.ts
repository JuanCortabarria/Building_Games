import { describe, expect, it } from "vitest";
import { partidaDe, partidaEnRondaDeAtaque } from "./ayudas-de-test";
import type { NombreDePais } from "./mapa";
import { fuenteFija } from "./azar";
import { crearPartida, restaurarPartida, type Partida } from "./partida";

/**
 * Ana, Beto y Caro, en la ronda de ataque 1 y en el turno de Ana. Lo que no se nombra es de Caro.
 * En América del Sur, Argentina es limítrofe de Brasil, Chile, Perú y Uruguay; Brasil y Chile no son limítrofes.
 */
function turnoDeAna({
  ana,
  beto = [],
  ejercitos = {},
  dados,
}: {
  ana: NombreDePais[];
  beto?: NombreDePais[];
  ejercitos?: Partial<Record<NombreDePais, number>>;
  dados?: number[];
}): Partida {
  return partidaEnRondaDeAtaque({
    jugadores: ["Ana", "Beto", "Caro"],
    paises: { Ana: ana, Beto: beto },
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

describe("reagrupar", () => {
  it("de Argentina con 5 a Brasil con 1, limítrofes, moviendo 3: Argentina queda con 2 y Brasil con 4", () => {
    const partida = turnoDeAna({ ana: ["Argentina", "Brasil"], ejercitos: { Argentina: 5 } });

    const despues = partidaDe(partida.aplicar({ tipo: "reagrupar", desde: "Argentina", hacia: "Brasil", cantidad: 3 }));

    expect(ejercitosEn(despues, "Argentina")).toBe(2);
    expect(ejercitosEn(despues, "Brasil")).toBe(4);
  });

  it("de Brasil a Chile, que no son limítrofes, pasando por Argentina, cuando los tres son de Ana", () => {
    const partida = turnoDeAna({ ana: ["Argentina", "Brasil", "Chile"], ejercitos: { Brasil: 4 } });

    const despues = partidaDe(partida.aplicar({ tipo: "reagrupar", desde: "Brasil", hacia: "Chile", cantidad: 2 }));

    expect(ejercitosEn(despues, "Brasil")).toBe(2);
    expect(ejercitosEn(despues, "Argentina")).toBe(1);
    expect(ejercitosEn(despues, "Chile")).toBe(3);
  });

  it("no se puede de Brasil a Chile si Argentina y Perú son de otros: los caminos de Ana se cortan", () => {
    // Brasil llega a Chile por Argentina o por Perú. Uruguay es de Ana, pero solo lleva a Argentina.
    const partida = turnoDeAna({
      ana: ["Brasil", "Chile", "Uruguay"],
      beto: ["Argentina"],
      ejercitos: { Brasil: 4 },
    });

    const resultado = partida.aplicar({ tipo: "reagrupar", desde: "Brasil", hacia: "Chile", cantidad: 2 });

    expect(resultado).toEqual({
      ok: false,
      error: "Ana no puede reagrupar de Brasil a Chile, porque no se llega pasando solo por países suyos limítrofes.",
    });
  });

  it("sin límite de distancia: de Uruguay a Java por Argentina, Chile y Australia, cruzando a Oceanía", () => {
    const partida = turnoDeAna({
      ana: ["Uruguay", "Argentina", "Chile", "Australia", "Java"],
      ejercitos: { Uruguay: 7 },
    });

    const despues = partidaDe(partida.aplicar({ tipo: "reagrupar", desde: "Uruguay", hacia: "Java", cantidad: 6 }));

    expect(ejercitosEn(despues, "Uruguay")).toBe(1);
    expect(ejercitosEn(despues, "Java")).toBe(7);
  });

  it("Argentina con 3 no puede mover 3, porque tiene que quedarle al menos 1, pero sí puede mover 2", () => {
    const partida = turnoDeAna({ ana: ["Argentina", "Brasil"], ejercitos: { Argentina: 3 } });

    expect(partida.aplicar({ tipo: "reagrupar", desde: "Argentina", hacia: "Brasil", cantidad: 3 })).toEqual({
      ok: false,
      error: "Desde Argentina se pueden mover hasta 2 ejércitos, porque siempre tiene que quedar uno, y se quisieron mover 3.",
    });
    const despues = partidaDe(partida.aplicar({ tipo: "reagrupar", desde: "Argentina", hacia: "Brasil", cantidad: 2 }));
    expect(ejercitosEn(despues, "Argentina")).toBe(1);
    expect(ejercitosEn(despues, "Brasil")).toBe(3);
  });
});

describe("reagrupar en el orden del turno", () => {
  it("después de reagrupar, Ana ya no puede atacar en ese turno", () => {
    const partida = turnoDeAna({ ana: ["Argentina", "Brasil"], ejercitos: { Argentina: 5, Brasil: 3 } });
    const reagrupada = partidaDe(partida.aplicar({ tipo: "reagrupar", desde: "Brasil", hacia: "Argentina", cantidad: 2 }));

    expect(reagrupada.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" })).toEqual({
      ok: false,
      error: "Ana ya reagrupó en este turno, y después de reagrupar no se puede atacar.",
    });
  });

  it("en el turno siguiente, Beto puede atacar aunque Ana haya reagrupado en el suyo", () => {
    // Chile tiene 3 ejércitos y tira 2 dados (6, 6); Argentina tiene 5 y tira 3 (1, 1, 1). Beto gana los dos pares.
    const partida = turnoDeAna({
      ana: ["Argentina", "Brasil"],
      beto: ["Chile"],
      ejercitos: { Argentina: 5, Brasil: 3, Chile: 3 },
      dados: [6, 6, 1, 1, 1],
    });
    const reagrupada = partidaDe(partida.aplicar({ tipo: "reagrupar", desde: "Brasil", hacia: "Argentina", cantidad: 2 }));
    const turnoDeBeto = partidaDe(reagrupada.aplicar({ tipo: "pasarTurno" }));

    const despues = partidaDe(turnoDeBeto.aplicar({ tipo: "atacar", desde: "Chile", hacia: "Argentina" }));

    expect(ejercitosEn(despues, "Argentina")).toBe(5);
  });

  it("Ana puede atacar y después reagrupar en el mismo turno", () => {
    // Argentina tiene 4 y tira 3 dados (6, 6, 6); Chile tiene 2 y tira 2 (1, 1). Chile pierde 2 de 2 y Ana lo conquista.
    const partida = turnoDeAna({
      ana: ["Argentina", "Brasil"],
      beto: ["Chile"],
      ejercitos: { Argentina: 4, Brasil: 3, Chile: 2 },
      dados: [6, 6, 6, 1, 1],
    });
    const atacada = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    const despues = partidaDe(atacada.aplicar({ tipo: "reagrupar", desde: "Brasil", hacia: "Argentina", cantidad: 2 }));

    expect(ejercitosEn(despues, "Brasil")).toBe(1);
    expect(ejercitosEn(despues, "Argentina")).toBe(5);
  });

  it("Ana puede reagrupar más de una vez en el mismo turno", () => {
    const partida = turnoDeAna({ ana: ["Argentina", "Brasil", "Uruguay"], ejercitos: { Brasil: 3, Uruguay: 4 } });
    const unaVez = partidaDe(partida.aplicar({ tipo: "reagrupar", desde: "Brasil", hacia: "Argentina", cantidad: 2 }));

    const dosVeces = partidaDe(unaVez.aplicar({ tipo: "reagrupar", desde: "Uruguay", hacia: "Argentina", cantidad: 3 }));

    expect(ejercitosEn(dosVeces, "Argentina")).toBe(6);
  });

  it("Ana puede pasar el turno sin reagrupar", () => {
    const partida = turnoDeAna({ ana: ["Argentina", "Brasil"], beto: ["Chile"], ejercitos: { Argentina: 5 } });

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.jugadorEnTurno().nombre).toBe("Beto");
    expect(ejercitosEn(despues, "Argentina")).toBe(5);
  });

  it("una partida guardada después de reagrupar y restaurada sigue sin dejar atacar en ese turno", () => {
    const partida = turnoDeAna({ ana: ["Argentina", "Brasil"], ejercitos: { Argentina: 5, Brasil: 3 } });
    const reagrupada = partidaDe(partida.aplicar({ tipo: "reagrupar", desde: "Brasil", hacia: "Argentina", cantidad: 2 }));

    const restaurada = partidaDe(restaurarPartida(reagrupada.estado(), fuenteFija()));

    expect(restaurada.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }).ok).toBe(false);
  });
});

describe("lo que no se puede reagrupar", () => {
  const partida = () =>
    turnoDeAna({ ana: ["Argentina", "Brasil"], beto: ["Chile"], ejercitos: { Argentina: 5, Chile: 4 } });

  it("en una ronda de incorporación", () => {
    const enIncorporacion = partidaDe(crearPartida(
      [
        { nombre: "Ana", color: "azul" },
        { nombre: "Beto", color: "rojo" },
      ],
      fuenteFija(),
    ));

    expect(enIncorporacion.aplicar({ tipo: "reagrupar", desde: "Argentina", hacia: "Brasil", cantidad: 1 })).toEqual({
      ok: false,
      error: "Solo se reagrupa en la ronda de ataque, y esta es una ronda de incorporación.",
    });
  });

  it("desde un país de otro jugador", () => {
    expect(partida().aplicar({ tipo: "reagrupar", desde: "Chile", hacia: "Argentina", cantidad: 1 })).toEqual({
      ok: false,
      error: "Ana solo puede reagrupar desde un país suyo, y Chile lo ocupa Beto.",
    });
  });

  it("hacia un país de otro jugador, aunque sea limítrofe", () => {
    expect(partida().aplicar({ tipo: "reagrupar", desde: "Argentina", hacia: "Chile", cantidad: 1 })).toEqual({
      ok: false,
      error: "Ana solo puede reagrupar hacia un país suyo, y Chile lo ocupa Beto.",
    });
  });

  it("de un país a sí mismo", () => {
    expect(partida().aplicar({ tipo: "reagrupar", desde: "Argentina", hacia: "Argentina", cantidad: 1 })).toEqual({
      ok: false,
      error: "Para reagrupar hay que elegir dos países distintos.",
    });
  });

  it.each([0, -1, 1.5])("una cantidad de %s ejércitos", (cantidad) => {
    expect(partida().aplicar({ tipo: "reagrupar", desde: "Argentina", hacia: "Brasil", cantidad })).toEqual({
      ok: false,
      error: "Hay que mover un número entero de ejércitos, de 1 en adelante.",
    });
  });

  it("desde un país que no está en el mapa", () => {
    const desde = "Atlántida" as NombreDePais;

    expect(partida().aplicar({ tipo: "reagrupar", desde, hacia: "Brasil", cantidad: 1 })).toEqual({
      ok: false,
      error: "Atlántida no es un país del mapa.",
    });
  });
});

describe("las consultas para reagrupar", () => {
  it("dicen si el jugador en turno ya reagrupó: no al empezar, sí después de reagrupar, y no en el turno siguiente", () => {
    const partida = turnoDeAna({ ana: ["Argentina", "Brasil"], beto: ["Chile"], ejercitos: { Brasil: 3 } });
    const reagrupada = partidaDe(partida.aplicar({ tipo: "reagrupar", desde: "Brasil", hacia: "Argentina", cantidad: 2 }));
    const turnoDeBeto = partidaDe(reagrupada.aplicar({ tipo: "pasarTurno" }));

    expect(partida.reagrupoEnEsteTurno()).toBe(false);
    expect(reagrupada.reagrupoEnEsteTurno()).toBe(true);
    expect(turnoDeBeto.reagrupoEnEsteTurno()).toBe(false);
  });

  it("dan los países propios a los que se puede reagrupar desde uno, sin incluirlo y sin pasar por países ajenos", () => {
    // Desde Uruguay se llega a Argentina y Brasil, y por Brasil a Sahara. Chile es de Beto y corta el paso a Australia.
    const partida = turnoDeAna({
      ana: ["Uruguay", "Argentina", "Brasil", "Sahara", "Australia"],
      beto: ["Chile"],
    });

    expect([...partida.destinosDeReagrupe("Uruguay")].sort()).toEqual(["Argentina", "Brasil", "Sahara"]);
  });
});
