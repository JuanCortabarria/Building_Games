import { describe, expect, it } from "vitest";
import { crearPartida, type Partida, type Ronda } from "./partida";
import { fuenteFija } from "./azar";
import { partidaDe, partidaEnRondaDeAtaque } from "./ayudas-de-test";
import type { NombreDePais } from "./mapa";

/**
 * Ana, Beto y Caro, en ese orden de juego, con los países repartidos sin mezclar:
 * nadie ocupa un continente entero.
 */
function partidaDeTres(): Partida {
  return partidaDe(
    crearPartida(
      [
        { nombre: "Ana", color: "azul" },
        { nombre: "Beto", color: "rojo" },
        { nombre: "Caro", color: "negro" },
      ],
      fuenteFija(),
    ),
  );
}

describe("alternancia y rotación de las rondas", () => {
  it("después de las rondas iniciales se alternan ataque e incorporación, y cada incorporación la abre el siguiente al que abrió la anterior", () => {
    expect(turnosJugados(partidaDeTres(), 7 * 3)).toEqual([
      "inicial 1: Ana",
      "inicial 1: Beto",
      "inicial 1: Caro",
      "inicial 2: Ana",
      "inicial 2: Beto",
      "inicial 2: Caro",
      "ataque 1: Ana",
      "ataque 1: Beto",
      "ataque 1: Caro",
      "incorporación 1: Beto",
      "incorporación 1: Caro",
      "incorporación 1: Ana",
      "ataque 2: Beto",
      "ataque 2: Caro",
      "ataque 2: Ana",
      "incorporación 2: Caro",
      "incorporación 2: Ana",
      "incorporación 2: Beto",
      "ataque 3: Caro",
      "ataque 3: Ana",
      "ataque 3: Beto",
    ]);
  });
});

describe("jugadores destruidos", () => {
  // Un jugador sin países está destruido. Destruir a alguien llega con los ataques: acá la situación se arma restaurando.

  it("un jugador destruido pierde los turnos que le quedaban en la ronda, y el resto mantiene su orden", () => {
    const partida = partidaEnRondaDeAtaque({
      jugadores: ["Ana", "Beto", "Caro", "Dani"],
      paises: { Ana: ["Argentina"], Beto: ["Brasil"], Caro: [] },
      resto: "Dani",
      numero: 1,
      abrio: "Ana",
      enTurno: "Ana",
    });

    expect(turnosJugados(partida, 3 + 3)).toEqual([
      "ataque 1: Ana",
      "ataque 1: Beto",
      "ataque 1: Dani",
      "incorporación 1: Beto",
      "incorporación 1: Dani",
      "incorporación 1: Ana",
    ]);
  });

  it("si el siguiente al que abrió la ronda anterior está destruido, la incorporación la abre el siguiente vivo", () => {
    const partida = partidaEnRondaDeAtaque({
      jugadores: ["Ana", "Beto", "Caro", "Dani"],
      paises: { Ana: ["Argentina"], Beto: [], Caro: ["Brasil"] },
      resto: "Dani",
      numero: 1,
      abrio: "Ana",
      enTurno: "Dani",
    });

    expect(turnosJugados(partida, 1 + 3 + 3 + 1)).toEqual([
      "ataque 1: Dani",
      "incorporación 1: Caro",
      "incorporación 1: Dani",
      "incorporación 1: Ana",
      "ataque 2: Caro",
      "ataque 2: Dani",
      "ataque 2: Ana",
      "incorporación 2: Dani",
    ]);
  });

  it("si destruyen al que abrió la ronda, la incorporación siguiente la abre el primer vivo sentado después de él", () => {
    // En la ronda de ataque 2, que abrió Beto, Dani destruyó a Beto y ahora pasa el turno.
    const partida = partidaEnRondaDeAtaque({
      jugadores: ["Ana", "Beto", "Caro", "Dani"],
      paises: { Ana: ["Argentina"], Beto: [], Caro: ["Brasil"] },
      resto: "Dani",
      numero: 2,
      abrio: "Beto",
      enTurno: "Dani",
    });

    expect(turnosJugados(partida, 2 + 3 + 3 + 1)).toEqual([
      "ataque 2: Dani",
      "ataque 2: Ana",
      "incorporación 2: Caro",
      "incorporación 2: Dani",
      "incorporación 2: Ana",
      "ataque 3: Caro",
      "ataque 3: Dani",
      "ataque 3: Ana",
      "incorporación 3: Dani",
    ]);
  });
});

describe("cuántos ejércitos se incorporan", () => {
  it("un jugador con 17 países recibe 8: la mitad, sin decimales, contada al empezar su turno", () => {
    const partida = pasarAIncorporacionDeAna(DIECISIETE_PAISES_SIN_CONTINENTES);

    expect(partida.jugadorEnTurno().nombre).toBe("Ana");
    expect(partida.ejercitosPorIncorporar()).toEqual({ generales: 8, porContinente: {} });
  });

  it("un jugador con 4 países recibe 3, el mínimo", () => {
    const partida = pasarAIncorporacionDeAna(["Argentina", "Canadá", "Sahara", "Australia"]);

    expect(partida.ejercitosPorIncorporar()).toEqual({ generales: 3, porContinente: {} });
  });

  it("un jugador recibe además los ejércitos extra de cada continente que ocupa entero", () => {
    const partida = pasarAIncorporacionDeAna([...AMERICA_DEL_SUR, ...OCEANIA]);

    expect(partida.ejercitosPorIncorporar()).toEqual({
      generales: 5,
      porContinente: { "América del Sur": 3, Oceanía: 2 },
    });
  });

  it("los ejércitos extra son 5 por América del Norte, 5 por Europa, 7 por Asia, 3 por África y 2 por Oceanía", () => {
    // Beto abrió la ronda de ataque 1 y Ana, que ocupa todo salvo Perú, juega último.
    const partida = partidaDe(
      partidaEnRondaDeAtaque({
        jugadores: ["Ana", "Beto"],
        paises: { Beto: ["Perú"] },
        resto: "Ana",
        numero: 1,
        abrio: "Beto",
        enTurno: "Ana",
      }).aplicar({ tipo: "pasarTurno" }),
    );

    expect(partida.jugadorEnTurno().nombre).toBe("Ana");
    expect(partida.ejercitosPorIncorporar()).toEqual({
      generales: 24,
      porContinente: { "América del Norte": 5, Europa: 5, Asia: 7, África: 3, Oceanía: 2 },
    });
  });
});

describe("dónde se ponen los ejércitos extra", () => {
  // Ana ocupa América del Sur y Oceanía: 10 países, así que tiene 5 generales, 3 extra de América del Sur y 2 de Oceanía.

  it("los ejércitos que se ponen en un continente con extras salen primero de los extra de ese continente", () => {
    const partida = pasarAIncorporacionDeAna([...AMERICA_DEL_SUR, ...OCEANIA]);

    const despues = partidaDe(partida.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 4 }));

    expect(despues.ejercitosPorIncorporar()).toEqual({ generales: 4, porContinente: { Oceanía: 2 } });
  });

  it("los ejércitos extra de un continente no se pueden poner en países de otro", () => {
    const partida = pasarAIncorporacionDeAna([...AMERICA_DEL_SUR, ...OCEANIA]);

    const resultado = partida.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 9 });

    expect(resultado).toEqual({
      ok: false,
      error: "Ana puede poner hasta 8 ejércitos en Argentina. Los extra de Oceanía solo se pueden poner en países de Oceanía.",
    });
  });

  it("cuando solo le quedan extras de un continente, el jugador no puede poner ejércitos fuera de él", () => {
    let partida = pasarAIncorporacionDeAna([...AMERICA_DEL_SUR, ...OCEANIA]);
    partida = partidaDe(partida.aplicar({ tipo: "incorporar", pais: "Australia", cantidad: 7 }));

    const resultado = partida.aplicar({ tipo: "incorporar", pais: "Java", cantidad: 1 });

    expect(partida.ejercitosPorIncorporar()).toEqual({ generales: 0, porContinente: { "América del Sur": 3 } });
    expect(resultado).toEqual({
      ok: false,
      error:
        "Ana no puede poner ejércitos en Java. Los extra de América del Sur solo se pueden poner en países de América del Sur.",
    });
  });

  it("el error nombra todos los continentes cuyos extras no pueden ir a ese país", () => {
    // Con África suma 16 países: 8 generales, 3 extra de América del Sur, 2 de Oceanía y 3 de África.
    const partida = pasarAIncorporacionDeAna([...AMERICA_DEL_SUR, ...OCEANIA, ...AFRICA]);

    const resultado = partida.aplicar({ tipo: "incorporar", pais: "Argentina", cantidad: 12 });

    expect(resultado).toEqual({
      ok: false,
      error:
        "Ana puede poner hasta 11 ejércitos en Argentina. Los extra de África y de Oceanía solo se pueden poner en países de esos continentes.",
    });
  });

  it("un jugador no puede pasar el turno de incorporación mientras le queden extras por poner", () => {
    let partida = pasarAIncorporacionDeAna([...AMERICA_DEL_SUR, ...OCEANIA]);
    partida = partidaDe(partida.aplicar({ tipo: "incorporar", pais: "Australia", cantidad: 7 }));

    const resultado = partida.aplicar({ tipo: "pasarTurno" });

    expect(resultado).toEqual({ ok: false, error: "Ana no puede pasar el turno: le quedan 3 ejércitos por poner." });
  });
});

const AMERICA_DEL_SUR: NombreDePais[] = ["Argentina", "Brasil", "Chile", "Colombia", "Perú", "Uruguay"];
const OCEANIA: NombreDePais[] = ["Australia", "Borneo", "Java", "Sumatra"];
const AFRICA: NombreDePais[] = ["Egipto", "Etiopía", "Madagascar", "Sahara", "Sudáfrica", "Zaire"];

/** Ninguno de estos países completa un continente. */
const DIECISIETE_PAISES_SIN_CONTINENTES: NombreDePais[] = [
  "Argentina", "Brasil", "Chile",
  "California", "Canadá", "Groenlandia", "Labrador",
  "Alemania", "España", "Francia",
  "Arabia", "Aral", "China", "Gobi",
  "Sahara", "Etiopía",
  "Australia",
];

/**
 * Ana, Beto y Caro, al final de la ronda de ataque 1, que abrió Caro. Ana ocupa los países dados,
 * Beto ocupa Alaska y Caro el resto. Pasar el turno empieza la incorporación 1, que abre Ana.
 */
function pasarAIncorporacionDeAna(paisesDeAna: NombreDePais[]): Partida {
  const partida = partidaEnRondaDeAtaque({
    jugadores: ["Ana", "Beto", "Caro"],
    paises: { Ana: paisesDeAna, Beto: ["Alaska"] },
    resto: "Caro",
    numero: 1,
    abrio: "Caro",
    enTurno: "Beto",
  });
  return partidaDe(partida.aplicar({ tipo: "pasarTurno" }));
}

/** Quién juega en qué ronda, durante la cantidad de turnos dada, desde el turno en curso. */
function turnosJugados(partida: Partida, turnos: number): string[] {
  const registro: string[] = [];
  for (let i = 0; i < turnos; i++) {
    registro.push(`${nombreDe(partida.ronda())}: ${partida.jugadorEnTurno().nombre}`);
    partida = jugarTurno(partida);
  }
  return registro;
}

function nombreDe({ tipo, inicial, numero }: Ronda): string {
  if (inicial) return `inicial ${numero}`;
  return `${tipo === "ataque" ? "ataque" : "incorporación"} ${numero}`;
}

/**
 * El jugador en turno pone sus ejércitos generales en su primer país y los extra de cada continente
 * en su primer país de ese continente, y pasa el turno.
 */
function jugarTurno(partida: Partida): Partida {
  const { generales, porContinente } = partida.ejercitosPorIncorporar();
  const suyos = partida.paises().filter((pais) => pais.ocupante === partida.jugadorEnTurno().color);
  const aPoner = [
    { pais: suyos[0]!.nombre, cantidad: generales },
    ...Object.entries(porContinente).map(([continente, cantidad]) => ({
      pais: suyos.find((pais) => pais.continente === continente)!.nombre,
      cantidad,
    })),
  ];
  for (const { pais, cantidad } of aPoner) {
    if (cantidad > 0) partida = partidaDe(partida.aplicar({ tipo: "incorporar", pais, cantidad }));
  }
  return partidaDe(partida.aplicar({ tipo: "pasarTurno" }));
}
