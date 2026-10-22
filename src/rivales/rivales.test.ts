import { describe, expect, it } from "vitest";
import { fuenteConSemilla, fuenteFija } from "../motor/azar";
import { partidaDe } from "../motor/ayudas-de-test";
import type { NombreDePais } from "../motor/mapa";
import {
  COLORES,
  crearPartida,
  restaurarPartida,
  type EjercitosPorIncorporar,
  type Partida,
  type Ronda,
} from "../motor/partida";
import { elegirAccion } from "./rivales";

/** Una partida nueva con tantos jugadores como se pidan, todos de la computadora. */
function partidaNueva(cantidad: number, semilla: number): Partida {
  const jugadores = COLORES.slice(0, cantidad).map((color, i) => ({ nombre: `Computadora ${i + 1}`, color }));
  return partidaDe(crearPartida(jugadores, fuenteConSemilla(semilla)));
}

/**
 * Una partida a mitad de camino entre Ana (azul), en turno, y Beto (rojo), que ocupa lo que no es de Ana.
 * Por defecto es la ronda de ataque 1; `ejercitos` da los de los países que no tienen 1.
 * A diferencia de `partidaEnRondaDeAtaque` del motor, también arma rondas de incorporación.
 */
function turnoDeAna({
  ana,
  ejercitos = {},
  ronda = { tipo: "ataque", inicial: false, numero: 1 },
  porIncorporar = { generales: 0, porContinente: {} },
  dados = [],
}: {
  ana: NombreDePais[];
  ejercitos?: Partial<Record<NombreDePais, number>>;
  ronda?: Ronda;
  porIncorporar?: EjercitosPorIncorporar;
  dados?: number[];
}): Partida {
  const estado = partidaDe(
    crearPartida(
      [
        { nombre: "Ana", color: "azul" },
        { nombre: "Beto", color: "rojo" },
      ],
      fuenteFija(),
    ),
  ).estado();
  for (const pais of Object.keys(estado.paises) as NombreDePais[]) {
    estado.paises[pais] = { ocupante: ana.includes(pais) ? "azul" : "rojo", ejercitos: ejercitos[pais] ?? 1 };
  }
  return partidaDe(
    restaurarPartida(
      { ...estado, ronda, abrioLaRonda: 0, turno: 0, ejercitosPorIncorporar: porIncorporar },
      fuenteFija({ dados }),
    ),
  );
}

const AMERICA_DEL_SUR: NombreDePais[] = ["Argentina", "Brasil", "Chile", "Colombia", "Perú", "Uruguay"];

/**
 * Aplica las acciones que elige la computadora hasta que se cumpla la condición o haya un ganador.
 * Si el motor rechaza una acción, el test falla mostrando cuál y por qué.
 */
function jugarHasta(partida: Partida, listo: (partida: Partida) => boolean, maximo = 20_000) {
  let acciones = 0;
  while (!listo(partida) && partida.ganador() === null) {
    if (acciones === maximo) throw new Error(`Después de ${maximo} acciones no se llegó.`);
    const accion = elegirAccion(partida);
    if (accion === null) throw new Error("La computadora no eligió ninguna acción en una partida sin ganador.");
    const resultado = partida.aplicar(accion);
    if (!resultado.ok) throw new Error(`El motor rechazó ${JSON.stringify(accion)}: ${resultado.error}`);
    partida = resultado.partida;
    acciones++;
  }
  return { partida, acciones };
}

describe("elegirAccion", () => {
  it("al empezar una partida, elige una acción que el motor acepta", () => {
    const partida = partidaNueva(2, 1);

    const accion = elegirAccion(partida);

    expect(accion).not.toBeNull();
    expect(partida.aplicar(accion!).ok).toBe(true);
  });

  it("juega las dos rondas iniciales y llega a la primera ronda de ataque", () => {
    const { partida } = jugarHasta(partidaNueva(3, 7), (partida) => partida.ronda().tipo === "ataque");

    expect(partida.ronda()).toEqual({ tipo: "ataque", inicial: false, numero: 1 });
  });

  describe("partidas completas entre computadoras", () => {
    // Las partidas de 6 de prueba terminaron en menos de 3000 acciones: el tope deja margen sin dejar de ser un tope.
    const TOPE_DE_ACCIONES = 5000;

    it.each([
      [2, 1],
      [2, 2],
      [2, 3],
      [4, 1],
      [4, 2],
      [4, 3],
      [6, 1],
      [6, 2],
      [6, 3],
    ])("de %i jugadores, con la semilla %i, terminan con un ganador sin acciones rechazadas", (cantidad, semilla) => {
      const { partida, acciones } = jugarHasta(partidaNueva(cantidad, semilla), () => false, TOPE_DE_ACCIONES);

      expect(partida.ganador()).not.toBeNull();
      expect(acciones).toBeLessThan(TOPE_DE_ACCIONES);
      // El registro termina contando quién ganó.
      expect(partida.registro().at(-1)).toMatchObject({ tipo: "gano", color: partida.ganador()!.color });
    });
  });

  it("con un ganador no elige nada", () => {
    const { partida } = jugarHasta(partidaNueva(2, 1), () => false);

    expect(elegirAccion(partida)).toBeNull();
  });

  describe("en la ronda de incorporación", () => {
    const ronda: Ronda = { tipo: "incorporacion", inicial: false, numero: 1 };

    it("pone los extra de un continente en ese continente, aunque otro país propio esté más amenazado", () => {
      // Japón, de Ana, limita con China, que tiene 10 ejércitos de Beto.
      const partida = turnoDeAna({
        ana: [...AMERICA_DEL_SUR, "Japón"],
        ejercitos: { China: 10 },
        ronda,
        porIncorporar: { generales: 3, porContinente: { "América del Sur": 3 } },
      });

      const accion = elegirAccion(partida);

      expect(accion).toMatchObject({ tipo: "incorporar" });
      expect(AMERICA_DEL_SUR).toContain(accion?.tipo === "incorporar" && accion.pais);
    });

    it("pone en la frontera del continente que tiene más cerca de completar, no en un país interior", () => {
      // A Ana le falta solo Colombia en América del Sur; Brasil y Perú limitan con Colombia. Argentina y Uruguay son interiores.
      const partida = turnoDeAna({
        ana: ["Argentina", "Brasil", "Chile", "Perú", "Uruguay", "Japón"],
        ronda,
        porIncorporar: { generales: 3, porContinente: {} },
      });

      const accion = elegirAccion(partida);

      expect(accion).toMatchObject({ tipo: "incorporar" });
      expect(["Brasil", "Perú"]).toContain(accion?.tipo === "incorporar" && accion.pais);
    });

    it("defiende el continente que ya ocupa entero", () => {
      // Ana tiene Oceanía entera y Japón. Australia limita con Chile, Sumatra con India y Borneo con Malasia.
      const partida = turnoDeAna({
        ana: ["Australia", "Borneo", "Java", "Sumatra", "Japón"],
        ronda,
        porIncorporar: { generales: 3, porContinente: {} },
      });

      const accion = elegirAccion(partida);

      expect(accion).toMatchObject({ tipo: "incorporar" });
      expect(["Australia", "Borneo", "Sumatra"]).toContain(accion?.tipo === "incorporar" && accion.pais);
    });

    it("con todo puesto, pasa el turno", () => {
      const partida = turnoDeAna({ ana: AMERICA_DEL_SUR, ronda });

      expect(elegirAccion(partida)).toEqual({ tipo: "pasarTurno" });
    });
  });

  describe("en la ronda de ataque", () => {
    it("ataca desde un país con ventaja sobre un limítrofe de otro", () => {
      const partida = turnoDeAna({ ana: ["Argentina"], ejercitos: { Argentina: 5 } });

      expect(elegirAccion(partida)).toMatchObject({ tipo: "atacar", desde: "Argentina" });
    });

    it("no ataca si no tiene ventaja: con 3 contra 3 pasa el turno", () => {
      const partida = turnoDeAna({
        ana: ["Argentina"],
        ejercitos: { Argentina: 3, Brasil: 3, Chile: 3, Perú: 3, Uruguay: 3 },
      });

      expect(elegirAccion(partida)).toEqual({ tipo: "pasarTurno" });
    });

    it("no ataca desde un país con 1 ejército, aunque el limítrofe también tenga 1: ataca desde el que puede", () => {
      // Argentina tiene 1 frente a países de Beto con 1; Japón tiene 4 frente a China y Kamchatka, con 1.
      const partida = turnoDeAna({ ana: ["Argentina", "Japón"], ejercitos: { Japón: 4 } });

      expect(elegirAccion(partida)).toMatchObject({ tipo: "atacar", desde: "Japón" });
    });

    it("con una conquista pendiente, mueve todo lo que puede si el conquistado sigue en la frontera", () => {
      // Argentina con 6 conquista Uruguay de una tirada; Uruguay limita con Brasil, de Beto.
      const conquistada = partidaDe(
        turnoDeAna({ ana: ["Argentina"], ejercitos: { Argentina: 6 }, dados: [6, 6, 6, 1] }).aplicar({
          tipo: "atacar",
          desde: "Argentina",
          hacia: "Uruguay",
        }),
      );

      expect(elegirAccion(conquistada)).toEqual({ tipo: "moverAlConquistado", cantidad: 3 });
    });

    it("con una conquista pendiente, mueve 1 si el conquistado no tiene enemigos limítrofes", () => {
      // Con Brasil de Ana, Uruguay conquistado solo limita con países de Ana.
      const conquistada = partidaDe(
        turnoDeAna({ ana: ["Argentina", "Brasil"], ejercitos: { Argentina: 6 }, dados: [6, 6, 6, 1] }).aplicar({
          tipo: "atacar",
          desde: "Argentina",
          hacia: "Uruguay",
        }),
      );

      expect(elegirAccion(conquistada)).toEqual({ tipo: "moverAlConquistado", cantidad: 1 });
    });

    it("sin ataques con ventaja, reagrupa los ejércitos de un país interior hacia la frontera más amenazada", () => {
      // Argentina no tiene enemigos limítrofes. Brasil limita con Sahara, Chile con Australia y Colombia con México.
      const partida = turnoDeAna({ ana: AMERICA_DEL_SUR, ejercitos: { Argentina: 6, Sahara: 4 } });

      expect(elegirAccion(partida)).toEqual({ tipo: "reagrupar", desde: "Argentina", hacia: "Brasil", cantidad: 5 });
    });

    it("después de reagrupar ya no ataca, aunque tenga ventaja, y sin nada más que mover pasa el turno", () => {
      // Ana pasa 5 de Argentina a Brasil: Brasil queda con 6 frente a Sahara, que tiene 1.
      const partida = turnoDeAna({ ana: AMERICA_DEL_SUR, ejercitos: { Argentina: 6 } });
      const reagrupada = partidaDe(
        partida.aplicar({ tipo: "reagrupar", desde: "Argentina", hacia: "Brasil", cantidad: 5 }),
      );

      expect(elegirAccion(reagrupada)).toEqual({ tipo: "pasarTurno" });
    });
  });
});
