import { reanudarFuente } from "../motor/azar";
import { restaurarPartida, type EstadoDePartida, type Partida } from "../motor/partida";

/** Hay una sola partida guardada a la vez, siempre bajo esta clave. */
const CLAVE = "teg:partida";

/**
 * La versión de la forma de lo guardado. Si cambia la forma de `EstadoDePartida`,
 * hay que subirla: lo guardado con otra versión no se restaura.
 */
const VERSION = 3;

interface PartidaGuardada {
  version: number;
  estado: EstadoDePartida;
}

export function guardarPartida(partida: Partida): void {
  const guardada: PartidaGuardada = { version: VERSION, estado: partida.estado() };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(guardada));
  } catch (error) {
    // Sin almacenamiento (por ejemplo, lleno o bloqueado) se sigue jugando, pero sin guardar.
    console.warn("No se pudo guardar la partida.", error);
  }
}

/** La partida guardada, o `null` si no hay ninguna o si lo guardado no se puede leer. */
export function cargarPartida(): Partida | null {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (texto === null) return null;
    const guardada: PartidaGuardada = JSON.parse(texto);
    if (guardada?.version !== VERSION) return null;
    const resultado = restaurarPartida(guardada.estado, reanudarFuente(guardada.estado.azar));
    return resultado.ok ? resultado.partida : null;
  } catch (error) {
    console.warn("No se pudo leer la partida guardada.", error);
    return null;
  }
}
