import type { FuenteDeAzar } from "./azar";
import { CONTINENTES, PAISES, PARES_LIMITROFES, type NombreDeContinente, type NombreDePais } from "./mapa";

export const COLORES = ["azul", "rojo", "negro", "amarillo", "verde", "magenta"] as const;
export type Color = (typeof COLORES)[number];

export const CANTIDAD_DE_JUGADORES = { minima: 2, maxima: 6 } as const;

export interface DatosDeJugador {
  nombre: string;
  color: Color;
}

export interface EstadoDePartida {
  /** Los jugadores en orden de juego. */
  jugadores: DatosDeJugador[];
  /** Quién ocupa cada país y con cuántos ejércitos. */
  paises: Record<NombreDePais, { ocupante: Color; ejercitos: number }>;
  ronda: Ronda;
  /** La posición en el orden de juego del jugador en turno. */
  turno: number;
  ejercitosPorIncorporar: number;
}

export interface Ronda {
  tipo: "inicial" | "ataque";
  numero: number;
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

export type Accion = { tipo: "incorporar"; pais: NombreDePais; cantidad: number } | { tipo: "pasarTurno" };

export type ResultadoDePartida = { ok: true; partida: Partida } | { ok: false; error: string };

export interface Partida {
  /** El estado como dato simple, para guardarlo y restaurarlo tal cual. */
  estado(): EstadoDePartida;
  ordenDeJuego(): readonly DatosDeJugador[];
  paises(): readonly PaisEnJuego[];
  continentes(): readonly DatosDeContinente[];
  limitrofesDe(pais: NombreDePais): readonly NombreDePais[];
  ronda(): Ronda;
  jugadorEnTurno(): DatosDeJugador;
  ejercitosPorIncorporar(): number;
  /** Aplica una acción y devuelve la partida que queda, o un error que explica qué regla la impide. */
  aplicar(accion: Accion): ResultadoDePartida;
}

/** Los colores que todavía no eligió ninguno de los jugadores dados. */
export function coloresDisponibles(jugadores: readonly { color: Color }[]): Color[] {
  return COLORES.filter((color) => !jugadores.some((jugador) => jugador.color === color));
}

export function crearPartida(
  jugadores: readonly DatosDeJugador[],
  azar: FuenteDeAzar,
): ResultadoDePartida {
  const { minima, maxima } = CANTIDAD_DE_JUGADORES;
  if (jugadores.length < minima || jugadores.length > maxima) {
    return {
      ok: false,
      error: `Una partida es de entre ${minima} y ${maxima} jugadores, y se cargaron ${jugadores.length}.`,
    };
  }
  const colorRepetido = jugadores.find(
    (jugador, i) => jugadores.findIndex((otro) => otro.color === jugador.color) !== i,
  )?.color;
  if (colorRepetido) {
    return { ok: false, error: `Dos jugadores no pueden tener el mismo color, y el ${colorRepetido} está repetido.` };
  }
  const sinNombre = jugadores.find((jugador) => jugador.nombre.trim() === "");
  if (sinNombre) {
    return { ok: false, error: `Todo jugador tiene que tener un nombre, y el ${sinNombre.color} no lo tiene.` };
  }
  const ordenDeJuego = azar.sortearOrden(jugadores);
  const paises = {} as EstadoDePartida["paises"];
  azar.mezclarPaises(PAISES.map((pais) => pais.nombre)).forEach((pais, i) => {
    paises[pais] = { ocupante: ordenDeJuego[i % ordenDeJuego.length]!.color, ejercitos: 1 };
  });
  const estado: EstadoDePartida = {
    jugadores: ordenDeJuego,
    paises,
    ronda: { tipo: "inicial", numero: 1 },
    turno: 0,
    ejercitosPorIncorporar: 5,
  };
  return { ok: true, partida: partidaDesde(estado) };
}

export function restaurarPartida(estado: EstadoDePartida, _azar: FuenteDeAzar): ResultadoDePartida {
  return { ok: true, partida: partidaDesde(structuredClone(estado)) };
}

function nombreDe(estado: EstadoDePartida, color: Color): string {
  return estado.jugadores.find((jugador) => jugador.color === color)?.nombre ?? color;
}

function partidaDesde(estado: EstadoDePartida): Partida {
  return {
    estado: () => structuredClone(estado),
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
    ronda: () => estado.ronda,
    jugadorEnTurno: () => estado.jugadores[estado.turno]!,
    ejercitosPorIncorporar: () => estado.ejercitosPorIncorporar,
    aplicar: (accion) => {
      const resultado = accion.tipo === "incorporar" ? incorporar(estado, accion) : pasarTurno(estado);
      return resultado.ok ? { ok: true, partida: partidaDesde(resultado.estado) } : resultado;
    },
  };
}

type ResultadoDeAccion = { ok: true; estado: EstadoDePartida } | { ok: false; error: string };

function incorporar(estado: EstadoDePartida, { pais, cantidad }: { pais: NombreDePais; cantidad: number }): ResultadoDeAccion {
  const enTurno = estado.jugadores[estado.turno]!;
  if (estado.ronda.tipo === "ataque") {
    return { ok: false, error: "En la ronda de ataque no se ponen ejércitos nuevos." };
  }
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return { ok: false, error: "Hay que poner un número entero de ejércitos, de 1 en adelante." };
  }
  if (cantidad > estado.ejercitosPorIncorporar) {
    return {
      ok: false,
      error: `${enTurno.nombre} tiene ${estado.ejercitosPorIncorporar} ejércitos por poner y quiso poner ${cantidad}.`,
    };
  }
  const { ocupante, ejercitos } = estado.paises[pais];
  if (ocupante !== enTurno.color) {
    return {
      ok: false,
      error: `${enTurno.nombre} no puede poner ejércitos en ${pais}, porque lo ocupa ${nombreDe(estado, ocupante)}.`,
    };
  }
  return {
    ok: true,
    estado: {
      ...estado,
      paises: { ...estado.paises, [pais]: { ocupante, ejercitos: ejercitos + cantidad } },
      ejercitosPorIncorporar: estado.ejercitosPorIncorporar - cantidad,
    },
  };
}

function pasarTurno(estado: EstadoDePartida): ResultadoDeAccion {
  const enTurno = estado.jugadores[estado.turno]!;
  const quedan = estado.ejercitosPorIncorporar;
  if (quedan > 0) {
    return {
      ok: false,
      error: `${enTurno.nombre} no puede pasar el turno: le ${quedan === 1 ? "queda 1 ejército" : `quedan ${quedan} ejércitos`} por poner.`,
    };
  }
  if (estado.turno + 1 < estado.jugadores.length) {
    return { ok: true, estado: { ...estado, turno: estado.turno + 1, ejercitosPorIncorporar: ejercitosDeLaRonda(estado.ronda) } };
  }
  const ronda = siguienteRonda(estado.ronda);
  return { ok: true, estado: { ...estado, ronda, turno: 0, ejercitosPorIncorporar: ejercitosDeLaRonda(ronda) } };
}

function siguienteRonda({ tipo, numero }: Ronda): Ronda {
  if (tipo === "inicial") return numero === 1 ? { tipo: "inicial", numero: 2 } : { tipo: "ataque", numero: 1 };
  // Hasta que lleguen las rondas de incorporación (ticket 05), a una ronda de ataque le sigue otra.
  return { tipo: "ataque", numero: numero + 1 };
}

/** Los ejércitos que pone cada jugador en su turno de esa ronda. */
function ejercitosDeLaRonda({ tipo, numero }: Ronda): number {
  if (tipo === "ataque") return 0;
  return numero === 1 ? 5 : 3;
}
