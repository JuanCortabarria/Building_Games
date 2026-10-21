import type { EstadoDeAzar, FuenteDeAzar } from "./azar";
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
  /** La posición en el orden de juego del jugador que abrió la ronda en curso. */
  abrioLaRonda: number;
  /** La posición en el orden de juego del jugador en turno. */
  turno: number;
  ejercitosPorIncorporar: EjercitosPorIncorporar;
  /** Dónde quedó la fuente de azar, para que una partida restaurada siga la misma secuencia. */
  azar: EstadoDeAzar;
  /** La última tirada del turno en curso, o nada si en este turno todavía no se atacó. */
  ultimaTirada: Tirada | null;
}

/** El resultado de una tirada de ataque. */
export interface Tirada {
  atacante: LadoDeLaTirada;
  defensor: LadoDeLaTirada;
}

export interface LadoDeLaTirada {
  pais: NombreDePais;
  color: Color;
  /** Los dados que tiró, de mayor a menor. */
  dados: number[];
  /** Los ejércitos que perdió. */
  perdidos: number;
}

/** Los ejércitos que le quedan por poner al jugador en turno. */
export interface EjercitosPorIncorporar {
  /** Los que se pueden poner en cualquier país propio. */
  generales: number;
  /** Los extra de cada continente que ocupa entero, que solo se pueden poner en países de ese continente. */
  porContinente: Partial<Record<NombreDeContinente, number>>;
}

/** Las dos primeras rondas de la partida son las rondas iniciales, de incorporación. */
export type Ronda =
  | { tipo: "incorporacion"; inicial: true; numero: 1 | 2 }
  | { tipo: "incorporacion"; inicial: false; numero: number }
  | { tipo: "ataque"; inicial: false; numero: number };

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

export type Accion =
  | { tipo: "incorporar"; pais: NombreDePais; cantidad: number }
  | { tipo: "atacar"; desde: NombreDePais; hacia: NombreDePais }
  | { tipo: "pasarTurno" };

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
  ejercitosPorIncorporar(): EjercitosPorIncorporar;
  ultimaTirada(): Tirada | null;
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
  const estado = empezarTurno({
    jugadores: ordenDeJuego,
    paises,
    ronda: { tipo: "incorporacion", inicial: true, numero: 1 },
    abrioLaRonda: 0,
    turno: 0,
    ejercitosPorIncorporar: NINGUN_EJERCITO,
    azar: azar.estado(),
    ultimaTirada: null,
  });
  return { ok: true, partida: partidaDesde(estado, azar) };
}

/**
 * Continúa una partida desde un estado guardado. El azar sigue por la fuente recibida:
 * para que siga la misma secuencia que antes de guardar, tiene que ser la fuente
 * reanudada desde `estado.azar` (ver `reanudarFuente`).
 */
export function restaurarPartida(estado: EstadoDePartida, azar: FuenteDeAzar): ResultadoDePartida {
  return { ok: true, partida: partidaDesde({ ...structuredClone(estado), azar: azar.estado() }, azar) };
}

function jugadorEnTurno(estado: EstadoDePartida): DatosDeJugador {
  return estado.jugadores[estado.turno]!;
}

function nombreDe(estado: EstadoDePartida, color: Color): string {
  return estado.jugadores.find((jugador) => jugador.color === color)?.nombre ?? color;
}

/**
 * La partida no usa la fuente de azar tal como la recibe, porque avanzarla cambiaría también a la
 * partida de antes. Cada acción que tira dados la reanuda desde `estado.azar` y guarda dónde quedó.
 */
function partidaDesde(estado: EstadoDePartida, azar: FuenteDeAzar): Partida {
  return {
    estado: () => structuredClone(estado),
    ordenDeJuego: () => estado.jugadores.map((jugador) => ({ ...jugador })),
    paises: () => PAISES.map((pais) => ({ ...pais, ...estado.paises[pais.nombre] })),
    continentes: () =>
      CONTINENTES.map((continente) => ({
        nombre: continente.nombre,
        cantidadDePaises: continente.paises.length,
        ejercitosExtra: continente.ejercitosExtra,
      })),
    limitrofesDe,
    ronda: () => ({ ...estado.ronda }),
    jugadorEnTurno: () => ({ ...jugadorEnTurno(estado) }),
    ejercitosPorIncorporar: () => structuredClone(estado.ejercitosPorIncorporar),
    ultimaTirada: () => structuredClone(estado.ultimaTirada),
    aplicar: (accion) => {
      const resultado =
        accion.tipo === "incorporar"
          ? incorporar(estado, accion)
          : accion.tipo === "atacar"
            ? atacar(estado, accion, azar.reanudar(estado.azar))
            : pasarTurno(estado);
      return resultado.ok ? { ok: true, partida: partidaDesde(resultado.estado, azar) } : resultado;
    },
  };
}

function limitrofesDe(pais: NombreDePais): NombreDePais[] {
  return PARES_LIMITROFES.flatMap(([a, b]) => (a === pais ? [b] : b === pais ? [a] : []));
}

type ResultadoDeAccion = { ok: true; estado: EstadoDePartida } | { ok: false; error: string };

function incorporar(estado: EstadoDePartida, { pais, cantidad }: { pais: NombreDePais; cantidad: number }): ResultadoDeAccion {
  const enTurno = jugadorEnTurno(estado);
  if (estado.ronda.tipo === "ataque") {
    return { ok: false, error: "En la ronda de ataque no se ponen ejércitos nuevos." };
  }
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return { ok: false, error: "Hay que poner un número entero de ejércitos, de 1 en adelante." };
  }
  const total = totalPorIncorporar(estado.ejercitosPorIncorporar);
  if (cantidad > total) {
    return { ok: false, error: `${enTurno.nombre} tiene ${total} ejércitos por poner y quiso poner ${cantidad}.` };
  }
  if (!Object.hasOwn(estado.paises, pais)) {
    return { ok: false, error: `${pais} no es un país del mapa.` };
  }
  const { ocupante, ejercitos } = estado.paises[pais];
  if (ocupante !== enTurno.color) {
    return {
      ok: false,
      error: `${enTurno.nombre} no puede poner ejércitos en ${pais}, porque lo ocupa ${nombreDe(estado, ocupante)}.`,
    };
  }
  const { generales, porContinente } = estado.ejercitosPorIncorporar;
  const continente = PAISES.find((enMapa) => enMapa.nombre === pais)!.continente;
  const extra = porContinente[continente] ?? 0;
  if (cantidad > generales + extra) {
    const otros = CONTINENTES.map(({ nombre }) => nombre).filter(
      (nombre) => nombre !== continente && porContinente[nombre],
    );
    return { ok: false, error: `${hastaCuantos(enTurno.nombre, generales + extra, pais)} ${dondeVanLosExtra(otros)}` };
  }
  // Los extra del continente se usan primero, porque no pueden ir a otro lado.
  const deExtra = Math.min(cantidad, extra);
  const extrasQueQuedan = { ...porContinente, [continente]: extra - deExtra };
  if (extrasQueQuedan[continente] === 0) delete extrasQueQuedan[continente];
  return {
    ok: true,
    estado: {
      ...estado,
      paises: { ...estado.paises, [pais]: { ocupante, ejercitos: ejercitos + cantidad } },
      ejercitosPorIncorporar: {
        generales: generales - (cantidad - deExtra),
        porContinente: extrasQueQuedan,
      },
    },
  };
}

function hastaCuantos(jugador: string, disponibles: number, pais: NombreDePais): string {
  if (disponibles === 0) return `${jugador} no puede poner ejércitos en ${pais}.`;
  return `${jugador} puede poner hasta ${disponibles === 1 ? "1 ejército" : `${disponibles} ejércitos`} en ${pais}.`;
}

function dondeVanLosExtra(continentes: readonly NombreDeContinente[]): string {
  if (continentes.length === 1) {
    return `Los extra de ${continentes[0]} solo se pueden poner en países de ${continentes[0]}.`;
  }
  const lista = continentes.map((continente) => `de ${continente}`);
  return `Los extra ${lista.slice(0, -1).join(", ")} y ${lista.at(-1)} solo se pueden poner en países de esos continentes.`;
}

/** Una sola tirada de dados desde un país propio a uno limítrofe de otro jugador. */
function atacar(
  estado: EstadoDePartida,
  { desde, hacia }: { desde: NombreDePais; hacia: NombreDePais },
  azar: FuenteDeAzar,
): ResultadoDeAccion {
  const enTurno = jugadorEnTurno(estado);
  if (estado.ronda.tipo !== "ataque") {
    return { ok: false, error: "Solo se ataca en la ronda de ataque, y esta es una ronda de incorporación." };
  }
  const fueraDelMapa = [desde, hacia].find((pais) => !Object.hasOwn(estado.paises, pais));
  if (fueraDelMapa) return { ok: false, error: `${fueraDelMapa} no es un país del mapa.` };
  const origen = estado.paises[desde];
  const destino = estado.paises[hacia];
  if (origen.ocupante !== enTurno.color) {
    return {
      ok: false,
      error: `${enTurno.nombre} solo puede atacar desde un país suyo, y ${desde} lo ocupa ${nombreDe(estado, origen.ocupante)}.`,
    };
  }
  if (destino.ocupante === enTurno.color) {
    return { ok: false, error: `${enTurno.nombre} no puede atacar a ${hacia}, porque es un país suyo.` };
  }
  if (!limitrofesDe(desde).includes(hacia)) {
    return { ok: false, error: `Desde ${desde} no se puede atacar a ${hacia}, porque no son limítrofes.` };
  }
  if (origen.ejercitos < 2) {
    return {
      ok: false,
      error: `Para atacar desde ${desde} hacen falta al menos 2 ejércitos, porque siempre tiene que quedar uno, y tiene ${origen.ejercitos}.`,
    };
  }
  const dadosDelAtacante = deMayorAMenor(azar.tirarDados(Math.min(3, origen.ejercitos - 1)));
  const dadosDelDefensor = deMayorAMenor(azar.tirarDados(Math.min(3, destino.ejercitos)));
  let perdidosDelAtacante = 0;
  let perdidosDelDefensor = 0;
  // Se comparan de a pares, tantos como dados tiró el lado que tiró menos. El empate lo gana el defensor.
  for (let i = 0; i < Math.min(dadosDelAtacante.length, dadosDelDefensor.length); i++) {
    if (dadosDelAtacante[i]! > dadosDelDefensor[i]!) perdidosDelDefensor++;
    else perdidosDelAtacante++;
  }
  let quedanEnOrigen = { ...origen, ejercitos: origen.ejercitos - perdidosDelAtacante };
  let quedanEnDestino = { ...destino, ejercitos: destino.ejercitos - perdidosDelDefensor };
  if (quedanEnDestino.ejercitos === 0) {
    // Un país nunca queda vacío: lo conquista el atacante, que mueve 1 ejército. Elegir cuántos mover
    // es del ticket 07. Al origen le quedan al menos 2, porque el defensor perdió todos los pares.
    quedanEnOrigen = { ...quedanEnOrigen, ejercitos: quedanEnOrigen.ejercitos - 1 };
    quedanEnDestino = { ocupante: enTurno.color, ejercitos: 1 };
  }
  return {
    ok: true,
    estado: {
      ...estado,
      paises: { ...estado.paises, [desde]: quedanEnOrigen, [hacia]: quedanEnDestino },
      azar: azar.estado(),
      ultimaTirada: {
        atacante: { pais: desde, color: origen.ocupante, dados: dadosDelAtacante, perdidos: perdidosDelAtacante },
        defensor: { pais: hacia, color: destino.ocupante, dados: dadosDelDefensor, perdidos: perdidosDelDefensor },
      },
    },
  };
}

function deMayorAMenor(dados: readonly number[]): number[] {
  return [...dados].sort((a, b) => b - a);
}

function pasarTurno(estado: EstadoDePartida): ResultadoDeAccion {
  const enTurno = jugadorEnTurno(estado);
  const quedan = totalPorIncorporar(estado.ejercitosPorIncorporar);
  if (quedan > 0) {
    return {
      ok: false,
      error: `${enTurno.nombre} no puede pasar el turno: le ${quedan === 1 ? "queda 1 ejército" : `quedan ${quedan} ejércitos`} por poner.`,
    };
  }
  const siguiente = siguienteEnLaRonda(estado);
  if (siguiente !== undefined) return { ok: true, estado: empezarTurno({ ...estado, turno: siguiente }) };
  const ronda = siguienteRonda(estado.ronda);
  const abre = quienAbre(estado, ronda);
  return { ok: true, estado: empezarTurno({ ...estado, ronda, abrioLaRonda: abre, turno: abre }) };
}

/**
 * Le da al jugador en turno los ejércitos que le tocan, calculados con los países que tiene ahora.
 * La tirada del turno anterior deja de estar a la vista.
 */
function empezarTurno(estado: EstadoDePartida): EstadoDePartida {
  return { ...estado, ejercitosPorIncorporar: ejercitosDelTurno(estado), ultimaTirada: null };
}

/**
 * La posición del jugador que juega después del que está en turno, o nada si la ronda terminó.
 * La ronda recorre el orden de juego desde el que la abrió, salteando a los destruidos.
 */
function siguienteEnLaRonda(estado: EstadoDePartida): number | undefined {
  const cantidad = estado.jugadores.length;
  let posicion = (estado.turno + 1) % cantidad;
  while (posicion !== estado.abrioLaRonda) {
    if (!estaDestruido(estado, posicion)) return posicion;
    posicion = (posicion + 1) % cantidad;
  }
  return undefined;
}

/**
 * La posición del jugador que abre una ronda que está por empezar. Una ronda de incorporación,
 * salvo las iniciales, la abre el primer jugador vivo sentado después del que abrió la anterior,
 * aunque ese ya esté destruido. Las demás las abre el mismo que abrió la anterior, o el siguiente vivo.
 */
function quienAbre(estado: EstadoDePartida, ronda: Ronda): number {
  const rota = ronda.tipo === "incorporacion" && !ronda.inicial;
  const cantidad = estado.jugadores.length;
  let posicion = (estado.abrioLaRonda + (rota ? 1 : 0)) % cantidad;
  while (estaDestruido(estado, posicion)) posicion = (posicion + 1) % cantidad;
  return posicion;
}

/** Un jugador está destruido cuando no le queda ningún país. */
function estaDestruido(estado: EstadoDePartida, posicion: number): boolean {
  const { color } = estado.jugadores[posicion]!;
  return !PAISES.some((pais) => estado.paises[pais.nombre].ocupante === color);
}

function siguienteRonda({ tipo, inicial, numero }: Ronda): Ronda {
  if (inicial && numero === 1) return { tipo: "incorporacion", inicial: true, numero: 2 };
  if (tipo === "incorporacion") return { tipo: "ataque", inicial: false, numero: inicial ? 1 : numero + 1 };
  return { tipo: "incorporacion", inicial: false, numero };
}

const NINGUN_EJERCITO: EjercitosPorIncorporar = { generales: 0, porContinente: {} };

function ejercitosDelTurno(estado: EstadoDePartida): EjercitosPorIncorporar {
  const { tipo, inicial, numero } = estado.ronda;
  if (tipo === "ataque") return NINGUN_EJERCITO;
  if (inicial) return { generales: numero === 1 ? 5 : 3, porContinente: {} };
  const { color } = jugadorEnTurno(estado);
  const esSuyo = (pais: NombreDePais) => estado.paises[pais].ocupante === color;
  const cantidadDePaises = PAISES.filter((pais) => esSuyo(pais.nombre)).length;
  const porContinente: EjercitosPorIncorporar["porContinente"] = {};
  for (const continente of CONTINENTES) {
    if (continente.paises.every(esSuyo)) porContinente[continente.nombre] = continente.ejercitosExtra;
  }
  return { generales: Math.max(3, Math.floor(cantidadDePaises / 2)), porContinente };
}

function totalPorIncorporar({ generales, porContinente }: EjercitosPorIncorporar): number {
  return Object.values(porContinente).reduce((total, extra) => total + extra, generales);
}
