import { describe, expect, it } from "vitest";
import { partidaDe, partidaEnRondaDeAtaque, partidaEnRondaDeIncorporacion, type Situacion } from "./ayudas-de-test";
import { PAISES } from "./mapa";
import { crearPartida, restaurarPartida, type Partida } from "./partida";
import { fuenteFija } from "./azar";

/** El último evento anotado en el registro de la partida. */
function ultimoEvento(partida: Partida) {
  return partida.registro().at(-1);
}

/**
 * Ana, Beto y Caro, en la ronda de ataque 3 y en el turno de Ana. Ana tiene Argentina, con 5 ejércitos,
 * y Brasil; Beto, Chile, con 3, Uruguay y Colombia; el resto es de Caro. Lo demás se puede cambiar.
 */
function turnoDeAna(cambios: Partial<Situacion> = {}): Partida {
  return partidaEnRondaDeAtaque({
    jugadores: ["Ana", "Beto", "Caro"],
    paises: { Ana: ["Argentina", "Brasil"], Beto: ["Chile", "Uruguay", "Colombia"] },
    ejercitos: { Argentina: 5, Chile: 3 },
    resto: "Caro",
    numero: 3,
    abrio: "Ana",
    enTurno: "Ana",
    ...cambios,
  });
}

/** Ana conquista Chile desde Argentina (6, 6, 6 contra 1, 1, 1) y pasa 3 ejércitos. */
function conquistarChile(partida: Partida): Partida {
  const conquistada = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));
  return partidaDe(conquistada.aplicar({ tipo: "moverAlConquistado", cantidad: 3 }));
}

describe("el registro de la partida", () => {
  it("incorporar anota quién puso cuántos ejércitos en qué país, en qué ronda", () => {
    const partida = partidaEnRondaDeIncorporacion({
      jugadores: ["Ana", "Beto"],
      paises: { Ana: ["Argentina", "Brasil"] },
      resto: "Beto",
      numero: 2,
      abrio: "Ana",
      enTurno: "Ana",
      porIncorporar: 5,
    });

    const despues = partidaDe(partida.aplicar({ tipo: "incorporar", pais: "Brasil", cantidad: 3 }));

    expect(ultimoEvento(despues)).toMatchObject({
      tipo: "incorporo",
      color: "azul",
      ronda: { tipo: "incorporacion", numero: 2 },
      pais: "Brasil",
      cantidad: 3,
    });
  });

  it("las incorporaciones seguidas en el mismo país se anotan como una sola, con el total", () => {
    let partida = partidaEnRondaDeIncorporacion({
      jugadores: ["Ana", "Beto"],
      paises: { Ana: ["Argentina", "Brasil"] },
      resto: "Beto",
      numero: 2,
      abrio: "Ana",
      enTurno: "Ana",
      porIncorporar: 6,
    });
    const antes = partida.registro().length;

    for (const pais of ["Brasil", "Brasil", "Brasil", "Argentina", "Brasil"] as const) {
      partida = partidaDe(partida.aplicar({ tipo: "incorporar", pais, cantidad: 1 }));
    }
    partida = partidaDe(partida.aplicar({ tipo: "incorporar", pais: "Brasil", cantidad: 1 }));

    expect(partida.registro().slice(antes)).toMatchObject([
      { tipo: "incorporo", pais: "Brasil", cantidad: 3 },
      { tipo: "incorporo", pais: "Argentina", cantidad: 1 },
      { tipo: "incorporo", pais: "Brasil", cantidad: 2 },
    ]);
  });

  it("atacar anota la tirada: los dos países, sus dados de mayor a menor y lo que perdió cada uno", () => {
    // Ana tira 6, 5 y 3; Beto, 6, 2 y 1. Empata el 6 (gana Beto) y Ana gana los otros dos.
    const partida = turnoDeAna({ dados: [3, 6, 5, 1, 6, 2] });

    const despues = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    expect(ultimoEvento(despues)).toEqual({
      orden: expect.any(Number),
      tipo: "tiro",
      color: "azul",
      ronda: { tipo: "ataque", inicial: false, numero: 3 },
      atacante: { pais: "Argentina", color: "azul", dados: [6, 5, 3], perdidos: 1 },
      defensor: { pais: "Chile", color: "rojo", dados: [6, 2, 1], perdidos: 2 },
    });
  });

  it("una tirada que deja al país sin ejércitos anota, después de la tirada, la conquista: qué país, desde dónde y a quién", () => {
    const partida = turnoDeAna({ dados: [6, 6, 6, 1, 1, 1] });

    const despues = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    expect(despues.registro().slice(-2)).toMatchObject([
      { tipo: "tiro" },
      { tipo: "conquisto", color: "azul", ronda: { numero: 3 }, pais: "Chile", desde: "Argentina", defensor: "rojo" },
    ]);
  });

  it("una tirada sin conquista no anota conquista", () => {
    const partida = turnoDeAna({ dados: [6, 6, 6, 6, 6, 6] });

    const despues = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    expect(ultimoEvento(despues)).toMatchObject({ tipo: "tiro" });
  });

  it("conquistar el último país de un jugador anota, después de la conquista, que lo destruyó y cuántas tarjetas le sacó", () => {
    const partida = turnoDeAna({
      paises: { Ana: ["Argentina", "Brasil"], Beto: ["Chile"] },
      tarjetas: { Beto: ["Japón", "Java"] },
      dados: [6, 6, 6, 1, 1, 1],
    });

    const despues = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    expect(despues.registro().slice(-2)).toMatchObject([
      { tipo: "conquisto", pais: "Chile" },
      { tipo: "destruyo", color: "azul", ronda: { numero: 3 }, destruido: "rojo", tarjetas: 2 },
    ]);
  });

  it("la conquista que da la victoria anota, al final, que ganó y por qué", () => {
    // Ana tiene 29 países y conquista Chile: llega a 30, el objetivo común.
    const otros = PAISES.map((enMapa) => enMapa.nombre).filter((nombre) => !["Argentina", "Chile"].includes(nombre));
    const partida = turnoDeAna({
      paises: { Ana: ["Argentina", ...otros.slice(0, 28)], Beto: ["Chile"] },
      ejercitos: { Argentina: 5 },
      dados: [6, 6, 6, 1],
    });

    const despues = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));

    expect(ultimoEvento(despues)).toMatchObject({
      tipo: "gano",
      color: "azul",
      ronda: { numero: 3 },
      motivo: { tipo: "objetivoComun" },
    });
  });

  it("mover al país conquistado anota desde dónde, hacia dónde y cuántos ejércitos pasaron en total", () => {
    const conquistada = partidaDe(
      turnoDeAna({ dados: [6, 6, 6, 1, 1, 1] }).aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }),
    );

    const despues = partidaDe(conquistada.aplicar({ tipo: "moverAlConquistado", cantidad: 3 }));

    expect(ultimoEvento(despues)).toMatchObject({
      tipo: "movioAlConquistado",
      color: "azul",
      desde: "Argentina",
      hacia: "Chile",
      cantidad: 3,
    });
  });

  it("reagrupar anota desde dónde, hacia dónde y cuántos ejércitos movió", () => {
    const despues = partidaDe(turnoDeAna().aplicar({ tipo: "reagrupar", desde: "Argentina", hacia: "Brasil", cantidad: 2 }));

    expect(ultimoEvento(despues)).toMatchObject({
      tipo: "reagrupo",
      color: "azul",
      ronda: { tipo: "ataque", numero: 3 },
      desde: "Argentina",
      hacia: "Brasil",
      cantidad: 2,
    });
  });

  it("canjear anota las tarjetas entregadas y cuántos ejércitos dio el canje", () => {
    // Es el segundo canje de Ana: vale 7.
    const partida = partidaEnRondaDeIncorporacion({
      jugadores: ["Ana", "Beto"],
      paises: { Ana: ["Argentina"] },
      resto: "Beto",
      numero: 4,
      abrio: "Ana",
      enTurno: "Ana",
      tarjetas: { Ana: ["Brasil", "Perú", "Alaska"] },
      canjes: { Ana: 1 },
    });

    const despues = partidaDe(partida.aplicar({ tipo: "canjear", tarjetas: ["Brasil", "Perú", "Alaska"] }));

    expect(ultimoEvento(despues)).toMatchObject({
      tipo: "canjeo",
      color: "azul",
      ronda: { tipo: "incorporacion", numero: 4 },
      tarjetas: ["Brasil", "Perú", "Alaska"],
      ejercitos: 7,
    });
  });

  it("pasar el turno anota quién lo pasó", () => {
    const despues = partidaDe(turnoDeAna().aplicar({ tipo: "pasarTurno" }));

    expect(ultimoEvento(despues)).toMatchObject({ tipo: "pasoElTurno", color: "azul", ronda: { tipo: "ataque", numero: 3 } });
  });

  it("al pasar el turno, la tarjeta recibida se anota antes, con su país y los 2 ejércitos si lo ocupa", () => {
    const partida = conquistarChile(turnoDeAna({ primerasTarjetas: ["Brasil"], dados: [6, 6, 6, 1, 1, 1] }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.registro().slice(-2)).toMatchObject([
      { tipo: "recibioTarjeta", color: "azul", ronda: { numero: 3 }, pais: "Brasil", ejercitos: 2 },
      { tipo: "pasoElTurno", color: "azul" },
    ]);
  });

  it("una tarjeta de un país que no ocupa se anota sin ejércitos", () => {
    const partida = conquistarChile(turnoDeAna({ primerasTarjetas: ["Uruguay"], dados: [6, 6, 6, 1, 1, 1] }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.registro().at(-2)).toMatchObject({ tipo: "recibioTarjeta", pais: "Uruguay", ejercitos: 0 });
  });

  it("si no quedan tarjetas ni en el mazo ni en el descarte, al pasar el turno no se anota tarjeta recibida", () => {
    const partida = conquistarChile(turnoDeAna({ mazo: [], descarte: [], dados: [6, 6, 6, 1, 1, 1] }));

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.registro().slice(-2)).toMatchObject([{ tipo: "movioAlConquistado" }, { tipo: "pasoElTurno" }]);
  });

  it("cuando el último de la ronda pasa el turno, se anota que empezó la ronda siguiente, a nombre de quien la abre", () => {
    // Ana abrió la ronda de ataque 3 y Caro es la última: la incorporación 3 la abre Beto.
    const partida = turnoDeAna({ enTurno: "Caro" });

    const despues = partidaDe(partida.aplicar({ tipo: "pasarTurno" }));

    expect(despues.registro().slice(-2)).toMatchObject([
      { tipo: "pasoElTurno", color: "negro", ronda: { tipo: "ataque", numero: 3 } },
      { tipo: "empezoLaRonda", color: "rojo", ronda: { tipo: "incorporacion", inicial: false, numero: 3 } },
    ]);
  });

  it("una partida nueva empieza con un solo evento: que empezó la primera ronda inicial, a nombre del primero en jugar", () => {
    const partida = partidaDe(
      crearPartida(
        [
          { nombre: "Ana", color: "azul" },
          { nombre: "Beto", color: "rojo" },
        ],
        fuenteFija({ ordenDeJuego: [1, 0] }),
      ),
    );

    expect(partida.registro()).toEqual([
      { orden: 1, tipo: "empezoLaRonda", color: "rojo", ronda: { tipo: "incorporacion", inicial: true, numero: 1 } },
    ]);
  });
});

describe("cuánto guarda el registro", () => {
  it("guarda los últimos 200 eventos, del más viejo al más nuevo, y descarta los anteriores", () => {
    // 250 reagrupes de 1 ejército, de ida y vuelta entre Argentina y Brasil, cada uno con su evento.
    let partida = turnoDeAna();
    const antes = partida.registro().length;
    for (let i = 0; i < 250; i++) {
      const [desde, hacia] = i % 2 === 0 ? (["Argentina", "Brasil"] as const) : (["Brasil", "Argentina"] as const);
      partida = partidaDe(partida.aplicar({ tipo: "reagrupar", desde, hacia, cantidad: 1 }));
    }

    const registro = partida.registro();
    expect(registro).toHaveLength(200);
    const total = antes + 250;
    expect(registro.map((evento) => evento.orden)).toEqual(Array.from({ length: 200 }, (_, i) => total - 199 + i));
    expect(registro.at(-1)).toMatchObject({ tipo: "reagrupo", desde: "Brasil", hacia: "Argentina" });
  });
});

describe("el registro y el resto de la partida", () => {
  it("una acción rechazada no anota nada", () => {
    const partida = turnoDeAna();

    const resultado = partida.aplicar({ tipo: "atacar", desde: "Brasil", hacia: "Chile" });

    expect(resultado.ok).toBe(false);
    expect(partida.registro()).toHaveLength(turnoDeAna().registro().length);
  });

  it("se guarda y se restaura con el estado, y la partida restaurada sigue anotando desde donde quedó", () => {
    const original = conquistarChile(turnoDeAna({ dados: [6, 6, 6, 1, 1, 1] }));
    const estadoGuardado = JSON.parse(JSON.stringify(original.estado()));

    const restaurada = partidaDe(restaurarPartida(estadoGuardado, fuenteFija()));

    expect(restaurada.registro()).toEqual(original.registro());
    // Al pasar el turno, Ana recibe tarjeta (conquistó Chile) y lo pasa: dos eventos, que siguen la numeración.
    const despues = partidaDe(restaurada.aplicar({ tipo: "pasarTurno" }));
    const ultimo = original.registro().at(-1)!.orden;
    expect(despues.registro().slice(-2)).toMatchObject([
      { tipo: "recibioTarjeta", orden: ultimo + 1 },
      { tipo: "pasoElTurno", orden: ultimo + 2 },
    ]);
  });
});
