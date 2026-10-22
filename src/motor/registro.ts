import type { NombreDePais } from "./mapa";
import type { Accion, Color, EstadoDePartida, LadoDeLaTirada, Ronda, Tirada } from "./partida";

/** Cuántos eventos guarda el registro: los más viejos se van descartando. */
export const EVENTOS_EN_EL_REGISTRO = 200;

/**
 * Algo que pasó en la partida, como dato: quién lo hizo (`color`), en qué ronda, y lo propio de cada tipo.
 * Las frases para mostrarlo las arma la pantalla.
 */
export type Evento = {
  /** El lugar del evento en la partida, de 1 en adelante. No se repite aunque se descarten los viejos. */
  orden: number;
  ronda: Ronda;
  /** El jugador que lo hizo o al que le pasó. */
  color: Color;
} & DatosDelEvento;

export type DatosDelEvento =
  | { tipo: "incorporo"; pais: NombreDePais; cantidad: number }
  /** Una tirada de ataque, con los dos lados. */
  | { tipo: "tiro"; atacante: LadoDeLaTirada; defensor: LadoDeLaTirada }
  /** Ocupó `pais`, que era de `defensor`, atacando desde `desde`. */
  | { tipo: "conquisto"; pais: NombreDePais; desde: NombreDePais; defensor: Color }
  /** Le quitó a `destruido` su último país y se quedó con sus tarjetas de país. */
  | { tipo: "destruyo"; destruido: Color; tarjetas: number }
  /** Pasó `cantidad` ejércitos en total al país que acaba de conquistar, contando el que entró al conquistar. */
  | { tipo: "movioAlConquistado"; desde: NombreDePais; hacia: NombreDePais; cantidad: number }
  | { tipo: "reagrupo"; desde: NombreDePais; hacia: NombreDePais; cantidad: number }
  /** Entregó 3 tarjetas de país a cambio de `ejercitos` para poner. */
  | { tipo: "canjeo"; tarjetas: NombreDePais[]; ejercitos: number }
  /**
   * Recibió la tarjeta de `pais` al terminar su turno de ataque, y se pusieron `ejercitos` ahí: 2 si lo
   * ocupa, y si no, 0. Mientras no se pusieron ejércitos, el país es un secreto de quien la recibió.
   */
  | { tipo: "recibioTarjeta"; pais: NombreDePais; ejercitos: number }
  | { tipo: "pasoElTurno" }
  /** Empezó la ronda del evento, y la abre el jugador del evento. */
  | { tipo: "empezoLaRonda" }
  /** Ganó la partida. */
  | { tipo: "gano"; motivo: MotivoDeVictoria };

/** Por qué ganó el ganador. */
export type MotivoDeVictoria = { tipo: "objetivoComun" };

/** Le suma al estado que dejó una acción los eventos que la cuentan. */
export function anotarAccion(antes: EstadoDePartida, accion: Accion, despues: EstadoDePartida): EstadoDePartida {
  const color = antes.jugadores[antes.turno]!.color;
  if (accion.tipo === "incorporar") return anotarIncorporacion(despues, antes.ronda, color, accion);
  const eventos: DatosDelEvento[] = [];
  if (accion.tipo === "atacar" && despues.ultimaTirada) eventos.push(...eventosDelAtaque(despues.ultimaTirada, antes, despues));
  if (accion.tipo === "moverAlConquistado" && antes.conquistaPendiente) {
    eventos.push({ tipo: "movioAlConquistado", ...antes.conquistaPendiente, cantidad: accion.cantidad });
  }
  if (accion.tipo === "reagrupar") {
    eventos.push({ tipo: "reagrupo", desde: accion.desde, hacia: accion.hacia, cantidad: accion.cantidad });
  }
  if (accion.tipo === "canjear") {
    const ejercitos = despues.ejercitosPorIncorporar.generales - antes.ejercitosPorIncorporar.generales;
    eventos.push({ tipo: "canjeo", tarjetas: [...accion.tarjetas], ejercitos });
  }
  if (accion.tipo === "pasarTurno") {
    if (despues.tarjetaRecibida) {
      const { pais, ejercitos } = despues.tarjetaRecibida;
      eventos.push({ tipo: "recibioTarjeta", pais, ejercitos });
    }
    eventos.push({ tipo: "pasoElTurno" });
  }
  if (antes.ganador === null && despues.ganador !== null) {
    eventos.push({ tipo: "gano", motivo: motivoDeVictoria(despues) });
  }
  const anotado = anotar(despues, antes.ronda, color, eventos);
  return mismaRonda(antes.ronda, despues.ronda) ? anotado : anotarQueEmpezoLaRonda(anotado);
}

/** Anota que empieza la ronda en curso, a nombre del jugador en turno, que es quien la abre. */
export function anotarQueEmpezoLaRonda(estado: EstadoDePartida): EstadoDePartida {
  return anotar(estado, estado.ronda, estado.jugadores[estado.turno]!.color, [{ tipo: "empezoLaRonda" }]);
}

/**
 * Las incorporaciones seguidas del mismo jugador en el mismo país, en su turno, se anotan como una sola:
 * poner de a 1 ejército no llena el registro.
 */
function anotarIncorporacion(
  estado: EstadoDePartida,
  ronda: Ronda,
  color: Color,
  { pais, cantidad }: { pais: NombreDePais; cantidad: number },
): EstadoDePartida {
  const ultimo = estado.registro.at(-1);
  if (ultimo?.tipo === "incorporo" && ultimo.color === color && ultimo.pais === pais && mismaRonda(ultimo.ronda, ronda)) {
    return { ...estado, registro: [...estado.registro.slice(0, -1), { ...ultimo, cantidad: ultimo.cantidad + cantidad }] };
  }
  return anotar(estado, ronda, color, [{ tipo: "incorporo", pais, cantidad }]);
}

function mismaRonda(una: Ronda, otra: Ronda): boolean {
  return una.tipo === otra.tipo && una.inicial === otra.inicial && una.numero === otra.numero;
}

/** Por qué ganó el ganador de la partida. Por ahora la única forma de ganar es el objetivo común. */
function motivoDeVictoria(_estado: EstadoDePartida): MotivoDeVictoria {
  return { tipo: "objetivoComun" };
}

function anotar(estado: EstadoDePartida, ronda: Ronda, color: Color, eventos: readonly DatosDelEvento[]): EstadoDePartida {
  let orden = estado.registro.at(-1)?.orden ?? 0;
  const nuevos = eventos.map((datos): Evento => ({ ...datos, orden: ++orden, ronda, color }));
  return { ...estado, registro: [...estado.registro, ...nuevos].slice(-EVENTOS_EN_EL_REGISTRO) };
}

/** La tirada y, si el atacante se quedó con el país, la conquista. */
function eventosDelAtaque({ atacante, defensor }: Tirada, antes: EstadoDePartida, despues: EstadoDePartida): DatosDelEvento[] {
  const eventos: DatosDelEvento[] = [{ tipo: "tiro", atacante, defensor }];
  if (despues.paises[defensor.pais].ocupante !== atacante.color) return eventos;
  eventos.push({ tipo: "conquisto", pais: defensor.pais, desde: atacante.pais, defensor: defensor.color });
  const quedanPaises = Object.values(despues.paises).some(({ ocupante }) => ocupante === defensor.color);
  if (!quedanPaises) {
    const tarjetas = antes.tarjetas[defensor.color]?.length ?? 0;
    eventos.push({ tipo: "destruyo", destruido: defensor.color, tarjetas });
  }
  return eventos;
}
