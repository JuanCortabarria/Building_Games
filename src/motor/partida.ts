import type { EstadoDeAzar, FuenteDeAzar } from "./azar";
import { CONTINENTES, PAISES, PARES_LIMITROFES, type NombreDeContinente, type NombreDePais } from "./mapa";
import { SIMBOLO_DE_TARJETA, type Simbolo } from "./tarjetas";

export const COLORES = ["azul", "rojo", "negro", "amarillo", "verde", "magenta"] as const;
export type Color = (typeof COLORES)[number];

/** El objetivo común: el primero que ocupa esta cantidad de países gana la partida. */
export const PAISES_PARA_GANAR = 30;

/** Los ejércitos que se ponen en el país de la tarjeta recibida, si quien la recibe lo ocupa. */
export const EJERCITOS_POR_TARJETA = 2;

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
  /** Si el jugador en turno ya reagrupó: desde entonces, en este turno no puede atacar. */
  reagrupoEnEsteTurno: boolean;
  /**
   * El país que el jugador en turno acaba de conquistar y desde dónde lo atacó, mientras no elija
   * cuántos ejércitos mover a él. Hasta entonces no puede hacer otra acción.
   */
  conquistaPendiente: { desde: NombreDePais; hacia: NombreDePais } | null;
  /** El color del jugador que ganó, o nada si la partida sigue. Con un ganador no se juega más. */
  ganador: Color | null;
  /** Las tarjetas de país por recibir, boca abajo: la primera es la que se recibe. */
  mazo: NombreDePais[];
  /** Las tarjetas canjeadas. Cuando el mazo se acaba, se mezclan y pasan a ser el mazo. */
  descarte: NombreDePais[];
  /** Las tarjetas de país que tiene cada jugador. */
  tarjetas: Partial<Record<Color, NombreDePais[]>>;
  /** Cuántos canjes hizo cada jugador en la partida. */
  canjes: Partial<Record<Color, number>>;
  /** Cuántos países conquistó el jugador en turno en este turno. */
  conquistasEnEsteTurno: number;
  /** La tarjeta que recibió el último que pasó el turno, y cuántos ejércitos le dio, o nada si no recibió. */
  tarjetaRecibida: { color: Color; pais: NombreDePais; ejercitos: number } | null;
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
  /** Cuántos ejércitos pasan, en total, del país de origen al que se acaba de conquistar. */
  | { tipo: "moverAlConquistado"; cantidad: number }
  | { tipo: "reagrupar"; desde: NombreDePais; hacia: NombreDePais; cantidad: number }
  /** Entrega 3 tarjetas de país a cambio de ejércitos, en el turno de incorporación. */
  | { tipo: "canjear"; tarjetas: readonly NombreDePais[] }
  | { tipo: "pasarTurno" };

export interface ConquistaPendiente {
  desde: NombreDePais;
  hacia: NombreDePais;
  maximo: number;
}

export type ResultadoDePartida = { ok: true; partida: Partida } | { ok: false; error: string };

export interface Partida {
  /** El estado como dato simple, para guardarlo y restaurarlo tal cual. */
  estado(): EstadoDePartida;
  /** Todos los jugadores en orden de juego, también los destruidos, que conservan su lugar. */
  ordenDeJuego(): readonly DatosDeJugador[];
  /** Los jugadores que perdieron todos sus países, en orden de juego. Ya no tienen turnos. */
  destruidos(): readonly DatosDeJugador[];
  paises(): readonly PaisEnJuego[];
  continentes(): readonly DatosDeContinente[];
  limitrofesDe(pais: NombreDePais): readonly NombreDePais[];
  ronda(): Ronda;
  jugadorEnTurno(): DatosDeJugador;
  ejercitosPorIncorporar(): EjercitosPorIncorporar;
  ultimaTirada(): Tirada | null;
  /** El país recién conquistado al que el jugador en turno tiene que mover ejércitos, y cuántos puede mover como máximo. */
  conquistaPendiente(): ConquistaPendiente | null;
  /** El jugador que ganó, o nada si la partida sigue. */
  ganador(): DatosDeJugador | null;
  /** Si el jugador en turno ya reagrupó en este turno, y por eso ya no puede atacar. */
  reagrupoEnEsteTurno(): boolean;
  /** Los países a los que se puede reagrupar desde uno: los de su ocupante a los que se llega pasando solo por países suyos. */
  destinosDeReagrupe(desde: NombreDePais): readonly NombreDePais[];
  /** Las tarjetas de país que tiene un jugador, en el orden en que las recibió. */
  tarjetasDe(color: Color): readonly TarjetaDePais[];
  /** Cuántos canjes hizo un jugador en la partida. */
  canjesDe(color: Color): number;
  /** Cuántos ejércitos le daría a un jugador su próximo canje. */
  valorDelProximoCanje(color: Color): number;
  /** La tarjeta que recibió el último jugador que pasó el turno, o nada si no recibió. */
  tarjetaRecibida(): TarjetaRecibida | null;
  /** Cuántas tarjetas quedan en el mazo, sin contar el descarte. */
  tarjetasEnElMazo(): number;
  /** Aplica una acción y devuelve la partida que queda, o un error que explica qué regla la impide. */
  aplicar(accion: Accion): ResultadoDePartida;
}

export interface TarjetaRecibida {
  jugador: DatosDeJugador;
  tarjeta: TarjetaDePais;
  /** Los ejércitos que se pusieron en el país de la tarjeta: 2 si lo ocupa quien la recibió, y si no, 0. */
  ejercitos: number;
}

export interface TarjetaDePais {
  pais: NombreDePais;
  simbolo: Simbolo;
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
  const mazo = azar.mezclarTarjetas(PAISES.map((pais) => pais.nombre));
  const estado = empezarTurno({
    jugadores: ordenDeJuego,
    paises,
    ronda: { tipo: "incorporacion", inicial: true, numero: 1 },
    abrioLaRonda: 0,
    turno: 0,
    ejercitosPorIncorporar: NINGUN_EJERCITO,
    azar: azar.estado(),
    ultimaTirada: null,
    reagrupoEnEsteTurno: false,
    conquistaPendiente: null,
    ganador: null,
    mazo,
    descarte: [],
    tarjetas: Object.fromEntries(ordenDeJuego.map(({ color }) => [color, []])),
    canjes: Object.fromEntries(ordenDeJuego.map(({ color }) => [color, 0])),
    conquistasEnEsteTurno: 0,
    tarjetaRecibida: null,
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
    destruidos: () =>
      estado.jugadores.filter((_, posicion) => estaDestruido(estado, posicion)).map((jugador) => ({ ...jugador })),
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
    conquistaPendiente: () => {
      if (estado.conquistaPendiente === null) return null;
      const { desde, hacia } = estado.conquistaPendiente;
      return { desde, hacia, maximo: maximoAMover(estado, desde) };
    },
    ganador: () => {
      const ganador = estado.jugadores.find((jugador) => jugador.color === estado.ganador);
      return ganador ? { ...ganador } : null;
    },
    reagrupoEnEsteTurno: () => estado.reagrupoEnEsteTurno,
    tarjetasDe: (color) => tarjetasDe(estado, color).map(tarjetaDePais),
    canjesDe: (color) => canjesDe(estado, color),
    valorDelProximoCanje: (color) => valorDelCanje(canjesDe(estado, color) + 1),
    tarjetaRecibida: () => {
      if (estado.tarjetaRecibida === null) return null;
      const { color, pais, ejercitos } = estado.tarjetaRecibida;
      return { jugador: { nombre: nombreDe(estado, color), color }, tarjeta: tarjetaDePais(pais), ejercitos };
    },
    tarjetasEnElMazo: () => estado.mazo.length,
    destinosDeReagrupe: (desde) => [...alcanzablesPorPaisesPropios(estado, desde)].filter((pais) => pais !== desde),
    aplicar: (accion) => {
      const resultado = aplicar(estado, accion, azar);
      return resultado.ok ? { ok: true, partida: partidaDesde(resultado.estado, azar) } : resultado;
    },
  };
}

function tarjetaDePais(pais: NombreDePais): TarjetaDePais {
  return { pais, simbolo: SIMBOLO_DE_TARJETA[pais] };
}

function limitrofesDe(pais: NombreDePais): NombreDePais[] {
  return PARES_LIMITROFES.flatMap(([a, b]) => (a === pais ? [b] : b === pais ? [a] : []));
}

type ResultadoDeAccion = { ok: true; estado: EstadoDePartida } | { ok: false; error: string };

function aplicar(estado: EstadoDePartida, accion: Accion, azar: FuenteDeAzar): ResultadoDeAccion {
  if (estado.ganador !== null) {
    return { ok: false, error: `La partida terminó: ganó ${nombreDe(estado, estado.ganador)}.` };
  }
  if (accion.tipo === "moverAlConquistado") return moverAlConquistado(estado, accion);
  if (estado.conquistaPendiente !== null) {
    const { hacia } = estado.conquistaPendiente;
    return {
      ok: false,
      error: `${jugadorEnTurno(estado).nombre} tiene que mover ejércitos a ${hacia}, que acaba de conquistar, antes de hacer otra cosa.`,
    };
  }
  if (accion.tipo === "incorporar") return incorporar(estado, accion);
  if (accion.tipo === "atacar") return atacar(estado, accion, azar.reanudar(estado.azar));
  if (accion.tipo === "reagrupar") return reagrupar(estado, accion);
  if (accion.tipo === "canjear") return canjear(estado, accion);
  return pasarTurno(estado, azar);
}

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
  if (estado.reagrupoEnEsteTurno) {
    return { ok: false, error: `${enTurno.nombre} ya reagrupó en este turno, y después de reagrupar no se puede atacar.` };
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
  const conquista = quedanEnDestino.ejercitos === 0;
  if (conquista) {
    // Un país nunca queda vacío: lo ocupa el atacante con 1 ejército, el mínimo que tiene que mover.
    // Antes de mover, al origen le quedan al menos 2, porque el defensor perdió todos los pares.
    quedanEnOrigen = { ...quedanEnOrigen, ejercitos: quedanEnOrigen.ejercitos - 1 };
    quedanEnDestino = { ocupante: enTurno.color, ejercitos: 1 };
  }
  const paises = { ...estado.paises, [desde]: quedanEnOrigen, [hacia]: quedanEnDestino };
  // Quien destruye a un jugador se queda con sus tarjetas.
  const destruido = conquista && !PAISES.some((pais) => paises[pais.nombre].ocupante === destino.ocupante);
  const tarjetas = destruido
    ? {
        ...estado.tarjetas,
        [enTurno.color]: [...tarjetasDe(estado, enTurno.color), ...tarjetasDe(estado, destino.ocupante)],
        [destino.ocupante]: [],
      }
    : estado.tarjetas;
  // Solo una conquista cambia quién ocupa cada país, así que es el único momento en que alguien puede ganar.
  // Gana en el acto: no se juega más, ni siquiera el movimiento al país conquistado.
  const suyos = PAISES.filter((pais) => paises[pais.nombre].ocupante === enTurno.color).length;
  const gana = conquista && suyos >= PAISES_PARA_GANAR;
  // Si en el origen quedó 1 solo ejército, el que entró al conquistar es el único que se podía mover:
  // no hay nada que elegir y el turno sigue.
  const hayQueElegir = conquista && !gana && quedanEnOrigen.ejercitos > 1;
  return {
    ok: true,
    estado: {
      ...estado,
      paises,
      tarjetas,
      conquistaPendiente: hayQueElegir ? { desde, hacia } : null,
      conquistasEnEsteTurno: estado.conquistasEnEsteTurno + (conquista ? 1 : 0),
      ganador: gana ? enTurno.color : null,
      azar: azar.estado(),
      ultimaTirada: {
        atacante: { pais: desde, color: origen.ocupante, dados: dadosDelAtacante, perdidos: perdidosDelAtacante },
        defensor: { pais: hacia, color: destino.ocupante, dados: dadosDelDefensor, perdidos: perdidosDelDefensor },
      },
    },
  };
}

/**
 * Cuántos ejércitos, en total, puede pasar el atacante al país que conquistó: hasta 3, y siempre
 * dejando 1 en el origen. El ejército que ya pasó al conquistar cuenta dentro de ese total.
 */
function maximoAMover(estado: EstadoDePartida, desde: NombreDePais): number {
  return Math.min(3, estado.paises[desde].ejercitos);
}

function moverAlConquistado(estado: EstadoDePartida, { cantidad }: { cantidad: number }): ResultadoDeAccion {
  if (estado.conquistaPendiente === null) {
    return { ok: false, error: "No hay un país recién conquistado al que mover ejércitos." };
  }
  const { desde, hacia } = estado.conquistaPendiente;
  const maximo = maximoAMover(estado, desde);
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > maximo) {
    return { ok: false, error: `${jugadorEnTurno(estado).nombre} ${cuantosPuedeMover(maximo, desde, hacia)}` };
  }
  const origen = estado.paises[desde];
  const destino = estado.paises[hacia];
  // El primer ejército ya pasó al conquistar.
  const pasan = cantidad - 1;
  return {
    ok: true,
    estado: {
      ...estado,
      paises: {
        ...estado.paises,
        [desde]: { ...origen, ejercitos: origen.ejercitos - pasan },
        [hacia]: { ...destino, ejercitos: destino.ejercitos + pasan },
      },
      conquistaPendiente: null,
    },
  };
}

function cuantosPuedeMover(maximo: number, desde: NombreDePais, hacia: NombreDePais): string {
  if (maximo === 1) return `solo puede mover 1 ejército a ${hacia}, porque en ${desde} tiene que quedar al menos 1.`;
  const porque = maximo < 3 ? `, porque en ${desde} tiene que quedar al menos 1` : "";
  return `puede mover a ${hacia} entre 1 y ${maximo} ejércitos${porque}.`;
}

/** Mueve ejércitos de un país propio a otro país propio. */
function reagrupar(
  estado: EstadoDePartida,
  { desde, hacia, cantidad }: { desde: NombreDePais; hacia: NombreDePais; cantidad: number },
): ResultadoDeAccion {
  const enTurno = jugadorEnTurno(estado);
  if (estado.ronda.tipo !== "ataque") {
    return { ok: false, error: "Solo se reagrupa en la ronda de ataque, y esta es una ronda de incorporación." };
  }
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return { ok: false, error: "Hay que mover un número entero de ejércitos, de 1 en adelante." };
  }
  const fueraDelMapa = [desde, hacia].find((pais) => !Object.hasOwn(estado.paises, pais));
  if (fueraDelMapa) return { ok: false, error: `${fueraDelMapa} no es un país del mapa.` };
  if (desde === hacia) return { ok: false, error: "Para reagrupar hay que elegir dos países distintos." };
  const origen = estado.paises[desde];
  const destino = estado.paises[hacia];
  if (origen.ocupante !== enTurno.color) {
    return {
      ok: false,
      error: `${enTurno.nombre} solo puede reagrupar desde un país suyo, y ${desde} lo ocupa ${nombreDe(estado, origen.ocupante)}.`,
    };
  }
  if (destino.ocupante !== enTurno.color) {
    return {
      ok: false,
      error: `${enTurno.nombre} solo puede reagrupar hacia un país suyo, y ${hacia} lo ocupa ${nombreDe(estado, destino.ocupante)}.`,
    };
  }
  if (!alcanzablesPorPaisesPropios(estado, desde).has(hacia)) {
    return {
      ok: false,
      error: `${enTurno.nombre} no puede reagrupar de ${desde} a ${hacia}, porque no se llega pasando solo por países suyos limítrofes.`,
    };
  }
  if (cantidad > origen.ejercitos - 1) {
    return { ok: false, error: cuantosSePuedenMover(desde, origen.ejercitos, cantidad) };
  }
  return {
    ok: true,
    estado: {
      ...estado,
      paises: {
        ...estado.paises,
        [desde]: { ...origen, ejercitos: origen.ejercitos - cantidad },
        [hacia]: { ...destino, ejercitos: destino.ejercitos + cantidad },
      },
      reagrupoEnEsteTurno: true,
    },
  };
}

function cuantosSePuedenMover(desde: NombreDePais, ejercitos: number, cantidad: number): string {
  if (ejercitos === 1) {
    return `Desde ${desde} no se puede mover ningún ejército, porque tiene uno solo y siempre tiene que quedar uno.`;
  }
  const hasta = ejercitos === 2 ? "1 ejército" : `${ejercitos - 1} ejércitos`;
  return `Desde ${desde} se pueden mover hasta ${hasta}, porque siempre tiene que quedar uno, y se quisieron mover ${cantidad}.`;
}

/** Los países a los que se llega desde uno dado pasando solo por países limítrofes de su mismo ocupante. */
function alcanzablesPorPaisesPropios(estado: EstadoDePartida, desde: NombreDePais): Set<NombreDePais> {
  const { ocupante } = estado.paises[desde];
  const alcanzados = new Set<NombreDePais>([desde]);
  const porRecorrer = [desde];
  for (let pais = porRecorrer.pop(); pais !== undefined; pais = porRecorrer.pop()) {
    for (const limitrofe of limitrofesDe(pais)) {
      if (!alcanzados.has(limitrofe) && estado.paises[limitrofe].ocupante === ocupante) {
        alcanzados.add(limitrofe);
        porRecorrer.push(limitrofe);
      }
    }
  }
  return alcanzados;
}

function deMayorAMenor(dados: readonly number[]): number[] {
  return [...dados].sort((a, b) => b - a);
}

function pasarTurno(estado: EstadoDePartida, azar: FuenteDeAzar): ResultadoDeAccion {
  const enTurno = jugadorEnTurno(estado);
  const quedan = totalPorIncorporar(estado.ejercitosPorIncorporar);
  if (quedan > 0) {
    return {
      ok: false,
      error: `${enTurno.nombre} no puede pasar el turno: le ${quedan === 1 ? "queda 1 ejército" : `quedan ${quedan} ejércitos`} por poner.`,
    };
  }
  const terminado = recibirTarjeta(estado, azar);
  const siguiente = siguienteEnLaRonda(terminado);
  if (siguiente !== undefined) return { ok: true, estado: empezarTurno({ ...terminado, turno: siguiente }) };
  const ronda = siguienteRonda(terminado.ronda);
  const abre = quienAbre(terminado, ronda);
  return { ok: true, estado: empezarTurno({ ...terminado, ronda, abrioLaRonda: abre, turno: abre }) };
}

/**
 * Al terminar su turno de ataque, el jugador en turno recibe la primera tarjeta del mazo si conquistó
 * lo suficiente. La tarjeta recibida queda a la vista hasta que se vuelve a pasar el turno.
 */
function recibirTarjeta(estado: EstadoDePartida, azar: FuenteDeAzar): EstadoDePartida {
  const sinRecibir = { ...estado, tarjetaRecibida: null };
  const { color } = jugadorEnTurno(estado);
  // Después del tercer canje hacen falta 2 conquistas en el turno.
  const hacenFalta = canjesDe(estado, color) >= 3 ? 2 : 1;
  if (estado.ronda.tipo !== "ataque" || estado.conquistasEnEsteTurno < hacenFalta) return sinRecibir;
  if (estado.mazo.length === 0) {
    if (estado.descarte.length === 0) return sinRecibir;
    estado = mezclarElDescarte(estado, azar.reanudar(estado.azar));
  }
  const [recibida, ...mazo] = estado.mazo as [NombreDePais, ...NombreDePais[]];
  const tarjetas = { ...estado.tarjetas, [color]: [...tarjetasDe(estado, color), recibida] };
  // Si ocupa el país de la tarjeta, pone 2 ejércitos ahí. Si no, esa tarjeta ya no da ejércitos.
  const pais = estado.paises[recibida];
  const ejercitos = pais.ocupante === color ? EJERCITOS_POR_TARJETA : 0;
  return {
    ...estado,
    mazo,
    tarjetas,
    paises: { ...estado.paises, [recibida]: { ...pais, ejercitos: pais.ejercitos + ejercitos } },
    tarjetaRecibida: { color, pais: recibida, ejercitos },
  };
}

/** Entrega 3 tarjetas del jugador en turno, que van al descarte, y le suma los ejércitos del canje. */
function canjear(estado: EstadoDePartida, { tarjetas }: { tarjetas: readonly NombreDePais[] }): ResultadoDeAccion {
  const { nombre, color } = jugadorEnTurno(estado);
  if (estado.ronda.inicial) return { ok: false, error: "En las rondas iniciales no se canjean tarjetas." };
  if (estado.ronda.tipo !== "incorporacion") {
    return { ok: false, error: "Las tarjetas se canjean en el turno de incorporación, y esta es una ronda de ataque." };
  }
  if (tarjetas.length !== 3 || new Set(tarjetas).size !== 3) {
    return { ok: false, error: "Un canje es de 3 tarjetas distintas." };
  }
  const ajena = tarjetas.find((pais) => !tarjetasDe(estado, color).includes(pais));
  if (ajena !== undefined) return { ok: false, error: `${nombre} no tiene la tarjeta de ${ajena}.` };
  if (!formanCanje(tarjetas)) {
    return {
      ok: false,
      error: `${tarjetas[0]}, ${tarjetas[1]} y ${tarjetas[2]} no forman canje: tienen que ser 3 del mismo símbolo o 3 de símbolos distintos, y el comodín vale por cualquiera.`,
    };
  }
  const canjes = canjesDe(estado, color) + 1;
  const { generales, porContinente } = estado.ejercitosPorIncorporar;
  return {
    ok: true,
    estado: {
      ...estado,
      tarjetas: { ...estado.tarjetas, [color]: tarjetasDe(estado, color).filter((pais) => !tarjetas.includes(pais)) },
      descarte: [...estado.descarte, ...tarjetas],
      canjes: { ...estado.canjes, [color]: canjes },
      ejercitosPorIncorporar: { generales: generales + valorDelCanje(canjes), porContinente },
    },
  };
}

/**
 * 3 tarjetas forman canje si son del mismo símbolo o de los tres símbolos distintos, y el comodín vale
 * por cualquiera. Así, la única combinación que no forma canje es la de 2 de un símbolo y 1 de otro.
 */
function formanCanje(tarjetas: readonly NombreDePais[]): boolean {
  const simbolos = tarjetas.map((pais) => SIMBOLO_DE_TARJETA[pais]).filter((simbolo) => simbolo !== "comodín");
  const distintos = new Set(simbolos).size;
  return distintos === 1 || distintos === simbolos.length;
}

/** Los ejércitos que da el canje número `numero` de un jugador: 4, 7, 10, y después 5 más cada vez. */
function valorDelCanje(numero: number): number {
  if (numero <= 3) return [4, 7, 10][numero - 1]!;
  return 10 + 5 * (numero - 3);
}

/** El descarte, mezclado, pasa a ser el mazo. */
function mezclarElDescarte(estado: EstadoDePartida, azar: FuenteDeAzar): EstadoDePartida {
  return { ...estado, mazo: azar.mezclarTarjetas(estado.descarte), descarte: [], azar: azar.estado() };
}

function canjesDe(estado: EstadoDePartida, color: Color): number {
  return estado.canjes[color] ?? 0;
}

function tarjetasDe(estado: EstadoDePartida, color: Color): NombreDePais[] {
  return estado.tarjetas[color] ?? [];
}

/**
 * Le da al jugador en turno los ejércitos que le tocan, calculados con los países que tiene ahora.
 * La tirada del turno anterior deja de estar a la vista, y el nuevo jugador todavía no reagrupó.
 */
function empezarTurno(estado: EstadoDePartida): EstadoDePartida {
  return {
    ...estado,
    ejercitosPorIncorporar: ejercitosDelTurno(estado),
    ultimaTirada: null,
    reagrupoEnEsteTurno: false,
    conquistasEnEsteTurno: 0,
  };
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
