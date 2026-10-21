import { describe, expect, it } from "vitest";
import { partidaDe, partidaEnRondaDeAtaque, partidaEnRondaDeIncorporacion, type Situacion } from "./ayudas-de-test";
import type { NombreDePais } from "./mapa";
import { crearPartida, restaurarPartida, type Partida } from "./partida";
import { fuenteConSemilla, fuenteFija, reanudarFuente } from "./azar";

/**
 * Ana, Beto y Caro, en la ronda de ataque 1 y en el turno de Ana. Ana tiene Argentina, con 5 ejércitos,
 * y Brasil; Beto, Chile, Uruguay y Colombia; el resto es de Caro. Lo demás se puede cambiar.
 */
function turnoDeAna(cambios: Partial<Situacion> = {}): Partida {
  return partidaEnRondaDeAtaque({
    jugadores: ["Ana", "Beto", "Caro"],
    paises: { Ana: ["Argentina", "Brasil"], Beto: ["Chile", "Uruguay", "Colombia"] },
    ejercitos: { Argentina: 5 },
    resto: "Caro",
    numero: 1,
    abrio: "Ana",
    enTurno: "Ana",
    ...cambios,
  });
}

/** Ana conquista Chile desde Argentina (6, 6, 6 contra 1) y pasa 3 ejércitos. */
function conquistarChile(partida: Partida): Partida {
  const conquistada = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));
  return partidaDe(conquistada.aplicar({ tipo: "moverAlConquistado", cantidad: 3 }));
}

describe("recibir una tarjeta de país", () => {
  it("quien conquistó un país en su turno de ataque recibe, al pasar el turno, la primera tarjeta del mazo", () => {
    const partida = conquistarChile(turnoDeAna({ primerasTarjetas: ["Japón"], dados: [6, 6, 6, 1] }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.tarjetasDe("azul")).toEqual([{ pais: "Japón", simbolo: "cañón" }]);
  });

  it("quien no conquistó ningún país en su turno no recibe tarjeta", () => {
    const despues = partidaDe(turnoDeAna({ primerasTarjetas: ["Japón"] }).aplicar({ tipo: "pasarTurno" }));

    expect(despues.tarjetasDe("azul")).toEqual([]);
  });

  it("si la tarjeta es de un país que ocupa, se le ponen 2 ejércitos en ese país", () => {
    const partida = conquistarChile(turnoDeAna({ primerasTarjetas: ["Brasil"], dados: [6, 6, 6, 1] }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.tarjetasDe("azul")).toEqual([{ pais: "Brasil", simbolo: "galeón" }]);
    expect(despues.paises().find((pais) => pais.nombre === "Brasil")).toMatchObject({ ocupante: "azul", ejercitos: 3 });
  });

  it("si la tarjeta es del país que acaba de conquistar, los 2 ejércitos van ahí", () => {
    const partida = conquistarChile(turnoDeAna({ primerasTarjetas: ["Chile"], dados: [6, 6, 6, 1] }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    // Chile tenía los 3 que pasaron al conquistarlo.
    expect(despues.paises().find((pais) => pais.nombre === "Chile")).toMatchObject({ ocupante: "azul", ejercitos: 5 });
  });

  it("si la tarjeta es de un país de otro jugador, nadie recibe ejércitos", () => {
    const partida = conquistarChile(turnoDeAna({ primerasTarjetas: ["Uruguay"], dados: [6, 6, 6, 1] }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.paises().find((pais) => pais.nombre === "Uruguay")).toMatchObject({ ocupante: "rojo", ejercitos: 1 });
  });
});

describe("después del tercer canje", () => {
  /** Después de conquistar Chile, Ana conquista Uruguay desde Argentina, que tiene 2: 6 contra 1. */
  const DOS_CONQUISTAS = [6, 6, 6, 1, 6, 1];

  it("quien conquistó un solo país en su turno no recibe tarjeta", () => {
    const partida = conquistarChile(turnoDeAna({ canjes: { Ana: 3 }, primerasTarjetas: ["Japón"], dados: DOS_CONQUISTAS }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.tarjetasDe("azul")).toEqual([]);
  });

  it("quien conquistó dos países en su turno recibe tarjeta", () => {
    let partida = conquistarChile(turnoDeAna({ canjes: { Ana: 3 }, primerasTarjetas: ["Japón"], dados: DOS_CONQUISTAS }));
    partida = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Uruguay" }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.tarjetasDe("azul")).toEqual([{ pais: "Japón", simbolo: "cañón" }]);
  });

  it("con 2 canjes todavía alcanza con conquistar un país", () => {
    const partida = conquistarChile(turnoDeAna({ canjes: { Ana: 2 }, primerasTarjetas: ["Japón"], dados: DOS_CONQUISTAS }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.tarjetasDe("azul")).toEqual([{ pais: "Japón", simbolo: "cañón" }]);
  });
});

describe("cuando el mazo se acaba", () => {
  it("el descarte se mezcla y pasa a ser el mazo", () => {
    const partida = conquistarChile(
      turnoDeAna({ mazo: [], descarte: ["Japón", "Brasil", "Java"], primerasTarjetas: ["Java"], dados: [6, 6, 6, 1] }),
    );

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.tarjetasDe("azul")).toEqual([{ pais: "Java", simbolo: "cañón" }]);
    expect(despues.tarjetasEnElMazo()).toBe(2);
  });

  it("la mezcla del descarte usa la fuente de azar y guarda dónde quedó, para seguir igual al restaurar", () => {
    // Con la fuente con semilla: el mismo estado guardado da el mismo mazo nuevo.
    const conSemilla = (partida: Partida) =>
      partidaDe(restaurarPartida(partida.estado(), reanudarFuente({ semilla: 11, avance: 0 })));
    const antes = conSemilla(
      conquistarChile(turnoDeAna({ mazo: [], descarte: ["Japón", "Brasil", "Java", "Egipto"], dados: [6, 6, 6, 1] })),
    );

    const despues = partidaDe(antes.aplicar({ tipo: "pasarTurno" }));

    expect(despues.estado().azar.avance).toBeGreaterThan(antes.estado().azar.avance);
    const otraVez = partidaDe(antes.aplicar({ tipo: "pasarTurno" }));
    expect(otraVez.tarjetasDe("azul")).toEqual(despues.tarjetasDe("azul"));
  });

  it("si tampoco hay descarte, no se recibe tarjeta", () => {
    const partida = conquistarChile(turnoDeAna({ mazo: [], descarte: [], dados: [6, 6, 6, 1] }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.tarjetasDe("azul")).toEqual([]);
    expect(despues.jugadorEnTurno().nombre).toBe("Beto");
  });
});

describe("el mazo al crear la partida", () => {
  it("se mezcla con la fuente de azar: la misma semilla da el mismo mazo, y otra semilla otro", () => {
    const jugadores = [
      { nombre: "Ana", color: "azul" },
      { nombre: "Beto", color: "rojo" },
    ] as const;
    const mazoCon = (semilla: number) => partidaDe(crearPartida(jugadores, fuenteConSemilla(semilla))).estado().mazo;

    expect(mazoCon(1)).toEqual(mazoCon(1));
    expect(mazoCon(1)).not.toEqual(mazoCon(2));
    expect([...mazoCon(1)].sort()).toEqual([...mazoCon(2)].sort());
  });

  it("tiene las 50 tarjetas y ningún jugador tiene tarjetas", () => {
    const partida = turnoDeAna();

    expect(partida.tarjetasEnElMazo()).toBe(50);
    expect(partida.tarjetasDe("azul")).toEqual([]);
  });
});

/**
 * Ana, Beto y Caro, en la ronda de incorporación 1 y en el turno de Ana, con 4 ejércitos por poner.
 * Ana tiene Argentina y Brasil; Beto, Chile y Uruguay; el resto es de Caro.
 */
function incorporacionDeAna(cambios: Partial<Situacion> = {}): Partida {
  return partidaEnRondaDeIncorporacion({
    jugadores: ["Ana", "Beto", "Caro"],
    paises: { Ana: ["Argentina", "Brasil"], Beto: ["Chile", "Uruguay"] },
    resto: "Caro",
    numero: 1,
    abrio: "Ana",
    enTurno: "Ana",
    porIncorporar: 4,
    ...cambios,
  });
}

function canjear(partida: Partida, tarjetas: NombreDePais[]) {
  return partida.aplicar({ tipo: "canjear", tarjetas });
}

describe("canjear tarjetas", () => {
  it("el primer canje, de 3 tarjetas del mismo símbolo, suma 4 ejércitos para poner en cualquier país propio", () => {
    const partida = incorporacionDeAna({ tarjetas: { Ana: ["Brasil", "Perú", "Alaska", "Chile"] } });

    const despues = partidaDe(canjear(partida, ["Brasil", "Perú", "Alaska"]));

    expect(despues.ejercitosPorIncorporar()).toEqual({ generales: 8, porContinente: {} });
    expect(despues.tarjetasDe("azul")).toEqual([{ pais: "Chile", simbolo: "globo" }]);
    expect(despues.canjesDe("azul")).toBe(1);
  });
});

describe("cuánto vale cada canje de un jugador", () => {
  // La tabla de la sección 7 del reglamento: 4, 7, 10 y después 5 más cada vez.
  it.each([
    [0, 4],
    [1, 7],
    [2, 10],
    [3, 15],
    [4, 20],
    [7, 35],
  ])("con %i canjes hechos, el próximo suma %i", (hechos, valor) => {
    const partida = incorporacionDeAna({ canjes: { Ana: hechos }, tarjetas: { Ana: ["Brasil", "Perú", "Alaska"] } });

    expect(partida.valorDelProximoCanje("azul")).toBe(valor);
    const despues = partidaDe(canjear(partida, ["Brasil", "Perú", "Alaska"]));
    expect(despues.ejercitosPorIncorporar().generales).toBe(4 + valor);
    expect(despues.canjesDe("azul")).toBe(hechos + 1);
  });

  it("los canjes se cuentan por jugador", () => {
    const partida = incorporacionDeAna({ canjes: { Ana: 2, Beto: 0 } });

    expect(partida.valorDelProximoCanje("azul")).toBe(10);
    expect(partida.valorDelProximoCanje("rojo")).toBe(4);
  });
});

describe("qué tarjetas forman canje", () => {
  it.each<[string, NombreDePais[]]>([
    ["3 galeones", ["Brasil", "Perú", "Alaska"]],
    ["3 cañones", ["California", "Canadá", "Japón"]],
    ["3 globos", ["Chile", "Colombia", "Yukón"]],
    ["un galeón, un cañón y un globo", ["Brasil", "California", "Chile"]],
    ["2 galeones y un comodín", ["Brasil", "Perú", "Argentina"]],
    ["un galeón, un cañón y un comodín", ["Brasil", "California", "Taimir"]],
    ["un globo y 2 comodines", ["Chile", "Argentina", "Taimir"]],
  ])("%s forman canje", (_, tarjetas) => {
    const partida = incorporacionDeAna({ tarjetas: { Ana: tarjetas } });

    expect(canjear(partida, tarjetas).ok).toBe(true);
  });

  it("2 del mismo símbolo y una de otro no forman canje", () => {
    const partida = incorporacionDeAna({ tarjetas: { Ana: ["Brasil", "Perú", "Chile"] } });

    expect(canjear(partida, ["Brasil", "Perú", "Chile"])).toEqual({
      ok: false,
      error:
        "Brasil, Perú y Chile no forman canje: tienen que ser 3 del mismo símbolo o 3 de símbolos distintos, y el comodín vale por cualquiera.",
    });
  });
});

describe("cuándo no se puede canjear", () => {
  it("no se pueden canjear tarjetas que no son del jugador", () => {
    const partida = incorporacionDeAna({ tarjetas: { Ana: ["Brasil", "Perú"], Beto: ["Alaska"] } });

    expect(canjear(partida, ["Brasil", "Perú", "Alaska"])).toEqual({
      ok: false,
      error: "Ana no tiene la tarjeta de Alaska.",
    });
  });

  it.each<[string, NombreDePais[]]>([
    ["2 tarjetas", ["Brasil", "Perú"]],
    ["4 tarjetas", ["Brasil", "Perú", "Alaska", "Groenlandia"]],
    ["la misma tarjeta repetida", ["Brasil", "Brasil", "Perú"]],
  ])("no se puede canjear con %s", (_, tarjetas) => {
    const partida = incorporacionDeAna({ tarjetas: { Ana: ["Brasil", "Perú", "Alaska", "Groenlandia"] } });

    expect(canjear(partida, tarjetas)).toEqual({ ok: false, error: "Un canje es de 3 tarjetas distintas." });
  });

  it("no se canjea en la ronda de ataque", () => {
    const partida = turnoDeAna({ tarjetas: { Ana: ["Brasil", "Perú", "Alaska"] } });

    expect(canjear(partida, ["Brasil", "Perú", "Alaska"])).toEqual({
      ok: false,
      error: "Las tarjetas se canjean en el turno de incorporación, y esta es una ronda de ataque.",
    });
  });

  it("no se canjea en las rondas iniciales", () => {
    const partida = partidaDe(
      crearPartida(
        [
          { nombre: "Ana", color: "azul" },
          { nombre: "Beto", color: "rojo" },
        ],
        fuenteFija(),
      ),
    );

    expect(canjear(partida, ["Brasil", "Perú", "Alaska"])).toEqual({
      ok: false,
      error: "En las rondas iniciales no se canjean tarjetas.",
    });
  });

  it("se puede canjear después de poner ejércitos, mientras dure el turno de incorporación", () => {
    let partida = incorporacionDeAna({ tarjetas: { Ana: ["Brasil", "Perú", "Alaska"] } });
    partida = partidaDe(partida.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 4 }));

    const despues = partidaDe(canjear(partida, ["Brasil", "Perú", "Alaska"]));

    expect(despues.ejercitosPorIncorporar().generales).toBe(4);
  });
});

describe("las tarjetas canjeadas", () => {
  it("van al descarte, y vuelven a recibirse cuando el mazo se acaba", () => {
    // Ana y Beto, sin tarjetas en el mazo. Beto abrió la incorporación 1 y es el turno de Ana, que la cierra.
    let partida = partidaEnRondaDeIncorporacion({
      jugadores: ["Ana", "Beto"],
      paises: { Ana: ["Argentina", "Brasil"] },
      ejercitos: { Argentina: 5 },
      resto: "Beto",
      numero: 1,
      abrio: "Beto",
      enTurno: "Ana",
      tarjetas: { Ana: ["Brasil", "Perú", "Alaska"] },
      mazo: [],
      primerasTarjetas: ["Perú"],
      dados: [6, 6, 6, 1],
    });
    partida = partidaDe(canjear(partida, ["Brasil", "Perú", "Alaska"]));
    partida = partidaDe(partida.aplicar({ tipo: "incorporar", pais: "Brasil", cantidad: 4 }));
    // La ronda de ataque 2 la abre Beto, que pasa sin atacar.
    partida = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));
    partida = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));
    expect(partida.jugadorEnTurno().nombre).toBe("Ana");
    expect(partida.tarjetasEnElMazo()).toBe(0);

    partida = partidaDe(conquistarChile(partida).aplicar({ tipo: "pasarTurno" }));

    expect(partida.tarjetasDe("azul")).toEqual([{ pais: "Perú", simbolo: "galeón" }]);
    expect(partida.tarjetasEnElMazo()).toBe(2);
  });
});

describe("destruir a un jugador", () => {
  it("quien lo destruye se queda con sus tarjetas", () => {
    // Beto tiene solo Chile, con 1 ejército, y 2 tarjetas.
    const partida = turnoDeAna({
      paises: { Ana: ["Argentina", "Brasil"], Beto: ["Chile"] },
      tarjetas: { Ana: ["Java"], Beto: ["Alaska", "Egipto"] },
      dados: [6, 6, 6, 1],
    });

    const despues = conquistarChile(partida);

    expect(despues.destruidos()).toEqual([{ nombre: "Beto", color: "rojo" }]);
    expect(despues.tarjetasDe("rojo")).toEqual([]);
    expect(despues.tarjetasDe("azul").map((tarjeta) => tarjeta.pais)).toEqual(["Java", "Alaska", "Egipto"]);
  });
});

describe("la tarjeta recibida al pasar el turno", () => {
  it("queda a la vista durante el turno siguiente, con los 2 ejércitos si los hubo", () => {
    const partida = conquistarChile(turnoDeAna({ primerasTarjetas: ["Brasil"], dados: [6, 6, 6, 1] }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.tarjetaRecibida()).toEqual({
      jugador: { nombre: "Ana", color: "azul" },
      tarjeta: { pais: "Brasil", simbolo: "galeón" },
      ejercitos: 2,
    });
  });

  it("si es de un país que no ocupa, no hubo ejércitos", () => {
    const partida = conquistarChile(turnoDeAna({ primerasTarjetas: ["Japón"], dados: [6, 6, 6, 1] }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.tarjetaRecibida()?.ejercitos).toBe(0);
  });

  it("deja de estar a la vista cuando el siguiente pasa el turno sin recibir tarjeta", () => {
    const partida = conquistarChile(turnoDeAna({ primerasTarjetas: ["Japón"], dados: [6, 6, 6, 1] }));
    const deBeto = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    const deCaro = partidaDe(deBeto.aplicar({ tipo: "pasarTurno" }));

    expect(deCaro.tarjetaRecibida()).toBeNull();
  });

  it("al empezar no hay tarjeta recibida", () => {
    expect(turnoDeAna().tarjetaRecibida()).toBeNull();
  });
});

describe("guardar y restaurar", () => {
  it("una partida restaurada conserva las tarjetas, los canjes, el mazo y la tarjeta recibida", () => {
    const partida = partidaDe(
      conquistarChile(
        turnoDeAna({ primerasTarjetas: ["Brasil"], tarjetas: { Beto: ["Japón"] }, canjes: { Ana: 1 }, dados: [6, 6, 6, 1] }),
      ).aplicar({ tipo: "pasarTurno" }),
    );

    const restaurada = partidaDe(restaurarPartida(JSON.parse(JSON.stringify(partida.estado())), fuenteFija()));

    expect(restaurada.tarjetasDe("azul")).toEqual([{ pais: "Brasil", simbolo: "galeón" }]);
    expect(restaurada.tarjetasDe("rojo")).toEqual([{ pais: "Japón", simbolo: "cañón" }]);
    expect(restaurada.canjesDe("azul")).toBe(1);
    expect(restaurada.tarjetasEnElMazo()).toBe(48);
    expect(restaurada.tarjetaRecibida()).toEqual(partida.tarjetaRecibida());
  });
});
