import { reanudarFuente } from "../motor/azar";
import { COLORES, restaurarPartida, type Color, type EstadoDePartida, type Partida } from "../motor/partida";

/** Hay una sola partida guardada a la vez, siempre bajo esta clave. */
const CLAVE = "teg:partida";

/**
 * La versión de la forma de lo guardado. Si cambia la forma de `EstadoDePartida` o de lo que se guarda
 * junto con ella, hay que subirla: lo guardado con otra versión no se restaura.
 */
const VERSION = 8;

interface PartidaGuardada {
  version: number;
  estado: EstadoDePartida;
  /** Los colores de los jugadores que maneja la computadora. El motor no lo sabe: es cosa de la pantalla. */
  computadoras: Color[];
}

/** Una partida en juego y quiénes de sus jugadores son de la computadora. */
export interface PartidaEnJuego {
  partida: Partida;
  computadoras: readonly Color[];
}

export function guardarPartida({ partida, computadoras }: PartidaEnJuego): void {
  const guardada: PartidaGuardada = { version: VERSION, estado: partida.estado(), computadoras: [...computadoras] };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(guardada));
  } catch (error) {
    // Sin almacenamiento (por ejemplo, lleno o bloqueado) se sigue jugando, pero sin guardar.
    console.warn("No se pudo guardar la partida.", error);
  }
}

/** La partida guardada, o `null` si no hay ninguna o si lo guardado no se puede leer. */
export function cargarPartida(): PartidaEnJuego | null {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (texto === null) return null;
    const guardada: PartidaGuardada = JSON.parse(texto);
    if (guardada?.version !== VERSION) return null;
    const resultado = restaurarPartida(guardada.estado, reanudarFuente(guardada.estado.azar));
    if (!resultado.ok) return null;
    const computadoras = Array.isArray(guardada.computadoras)
      ? COLORES.filter((color) => guardada.computadoras.includes(color))
      : [];
    return { partida: resultado.partida, computadoras };
  } catch (error) {
    console.warn("No se pudo leer la partida guardada.", error);
    return null;
  }
}
