import type { FuenteDeAzar } from "./azar";
import { CONTINENTES, PAISES, PARES_LIMITROFES, type NombreDeContinente, type NombreDePais } from "./mapa";

export type Color = "azul" | "rojo" | "negro" | "amarillo" | "verde" | "magenta";

export interface DatosDeJugador {
  nombre: string;
  color: Color;
}

export interface EstadoDePartida {
  /** Los jugadores en orden de juego. */
  jugadores: DatosDeJugador[];
  /** Quién ocupa cada país y con cuántos ejércitos. */
  paises: Record<NombreDePais, { ocupante: Color; ejercitos: number }>;
}

export interface PaisEnJuego {
  nombre: NombreDePais;
  continente: NombreDeContinente;
  ocupante: Color;
  ejercitos: number;
}

export interface DatosDeContinente {
  nombre: NombreDeContinente;
  cantidadDePaises: number;
  ejercitosExtra: number;
}

export type Resultado<T> = { ok: true; partida: T } | { ok: false; error: string };

export interface Partida {
  /** El estado como dato simple, para guardarlo y restaurarlo tal cual. */
  estado(): EstadoDePartida;
  ordenDeJuego(): readonly DatosDeJugador[];
  paises(): readonly PaisEnJuego[];
  continentes(): readonly DatosDeContinente[];
  limitrofesDe(pais: NombreDePais): readonly NombreDePais[];
}

export function crearPartida(
  jugadores: readonly DatosDeJugador[],
  azar: FuenteDeAzar,
): Resultado<Partida> {
  if (jugadores.length < 2 || jugadores.length > 6) {
    return { ok: false, error: `Una partida es de entre 2 y 6 jugadores, y se cargaron ${jugadores.length}.` };
  }
  const colorRepetido = jugadores.find(
    (jugador, i) => jugadores.findIndex((otro) => otro.color === jugador.color) !== i,
  )?.color;
  if (colorRepetido) {
    return { ok: false, error: `Dos jugadores no pueden tener el mismo color, y el ${colorRepetido} está repetido.` };
  }
  const ordenDeJuego = azar.mezclar(jugadores);
  const paises = {} as EstadoDePartida["paises"];
  azar.mezclar(PAISES).forEach((pais, i) => {
    paises[pais.nombre] = { ocupante: ordenDeJuego[i % ordenDeJuego.length]!.color, ejercitos: 1 };
  });
  const estado: EstadoDePartida = { jugadores: ordenDeJuego, paises };
  return { ok: true, partida: partidaDesde(estado) };
}

export function restaurarPartida(estado: EstadoDePartida, _azar: FuenteDeAzar): Resultado<Partida> {
  return { ok: true, partida: partidaDesde(estado) };
}

function partidaDesde(estado: EstadoDePartida): Partida {
  return {
    estado: () => estado,
    ordenDeJuego: () => estado.jugadores,
    paises: () => PAISES.map((pais) => ({ ...pais, ...estado.paises[pais.nombre] })),
    continentes: () =>
      CONTINENTES.map((continente) => ({
        nombre: continente.nombre,
        cantidadDePaises: continente.paises.length,
        ejercitosExtra: continente.ejercitosExtra,
      })),
    limitrofesDe: (pais) =>
      PARES_LIMITROFES.flatMap(([a, b]) => (a === pais ? [b] : b === pais ? [a] : [])),
  };
}
