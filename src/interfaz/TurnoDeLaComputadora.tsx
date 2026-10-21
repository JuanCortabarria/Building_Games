import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Accion, Color, Partida } from "../motor/partida";
import { elegirAccion } from "../rivales/rivales";
import { ESTILO_DE_COLOR } from "./colores";

/** Cuánto espera la pantalla entre una acción de la computadora y la siguiente, en milisegundos. */
const RITMOS = { normal: 500, rapido: 100 } as const;
type Ritmo = keyof typeof RITMOS;

/** Lo último que hizo la computadora, contado para mostrarlo. */
interface Jugada {
  color: Color;
  nombre: string;
  texto: string;
}

export interface TurnoDeLaComputadora {
  /** Si el turno en curso es de un jugador de la computadora y la partida sigue. */
  juega: boolean;
  ultima: Jugada | null;
  error: string | null;
  ritmo: Ritmo;
  cambiarRitmo: (ritmo: Ritmo) => void;
  pausado: boolean;
  cambiarPausa: (pausado: boolean) => void;
}

/**
 * Juega los turnos de la computadora: mientras el jugador en turno sea de la computadora, elige su
 * próxima acción, espera un momento para que se pueda seguir y la aplica. `activo` lo frena mientras
 * la partida no está a la vista.
 */
export function useTurnoDeLaComputadora({
  partida,
  computadoras,
  activo,
  alCambiar,
}: {
  partida: Partida | null;
  computadoras: readonly Color[];
  activo: boolean;
  alCambiar: (partida: Partida) => void;
}): TurnoDeLaComputadora {
  const [ritmo, cambiarRitmo] = useState<Ritmo>("normal");
  const [pausado, cambiarPausa] = useState(false);
  const [ultima, setUltima] = useState<Jugada | null>(null);
  const [error, setError] = useState<string | null>(null);
  const juega = partida !== null && partida.ganador() === null && computadoras.includes(partida.jugadorEnTurno().color);
  // La función de la pantalla cambia en cada dibujo; el temporizador usa siempre la última.
  const alCambiarActual = useRef(alCambiar);
  alCambiarActual.current = alCambiar;

  useEffect(() => {
    if (!juega || !activo || pausado || partida === null) return;
    const espera = setTimeout(() => {
      const accion = elegirAccion(partida);
      if (accion === null) return;
      const resultado = partida.aplicar(accion);
      if (!resultado.ok) {
        // No debería pasar: la computadora elige con las reglas del motor. Si pasa, se frena y se avisa.
        setError(`La computadora no pudo jugar: ${resultado.error}`);
        return;
      }
      const enTurno = partida.jugadorEnTurno();
      setUltima({ ...enTurno, texto: contar(accion, partida, resultado.partida) });
      setError(null);
      alCambiarActual.current(resultado.partida);
    }, RITMOS[ritmo]);
    return () => clearTimeout(espera);
  }, [partida, juega, activo, pausado, ritmo]);

  return { juega, ultima, error, ritmo, cambiarRitmo, pausado, cambiarPausa };
}

const ejercitos = (cantidad: number) => `${cantidad} ejército${cantidad === 1 ? "" : "s"}`;

/** Lo que hizo una acción, en palabras, mirando la partida de antes y la de después. */
function contar(accion: Accion, antes: Partida, despues: Partida): string {
  const nombreDe = (color: Color) => antes.ordenDeJuego().find((jugador) => jugador.color === color)?.nombre ?? color;
  if (accion.tipo === "incorporar") return `puso ${ejercitos(accion.cantidad)} en ${accion.pais}.`;
  if (accion.tipo === "atacar") {
    const tirada = despues.ultimaTirada();
    if (tirada === null) return `atacó ${accion.hacia} desde ${accion.desde}.`;
    const { atacante, defensor } = tirada;
    const conquisto = despues.paises().find((pais) => pais.nombre === accion.hacia)?.ocupante === atacante.color;
    return (
      `atacó ${accion.hacia} (${nombreDe(defensor.color)}) desde ${accion.desde}: ` +
      `perdió ${ejercitos(atacante.perdidos)} y el defensor ${ejercitos(defensor.perdidos)}` +
      (conquisto ? `. ¡Conquistó ${accion.hacia}!` : ".")
    );
  }
  if (accion.tipo === "moverAlConquistado") {
    const hacia = antes.conquistaPendiente()?.hacia;
    return `pasó ${ejercitos(accion.cantidad)} a ${hacia ?? "el país conquistado"}.`;
  }
  if (accion.tipo === "reagrupar") {
    return `reagrupó ${ejercitos(accion.cantidad)} de ${accion.desde} a ${accion.hacia}.`;
  }
  if (accion.tipo === "pasarTurno") return "pasó el turno.";
  return "jugó.";
}

/** Un aviso fijo abajo de la pantalla con lo que está haciendo la computadora, el ritmo y la pausa. */
export function AvisoDeLaComputadora({ turno, partida }: { turno: TurnoDeLaComputadora; partida: Partida }) {
  const { juega, ultima, error, ritmo, cambiarRitmo, pausado, cambiarPausa } = turno;
  if (!juega && error === null) return null;
  const enTurno = partida.jugadorEnTurno();
  // Lo último solo se muestra si lo hizo el que está jugando ahora, para no mezclar turnos.
  const jugada = ultima?.color === enTurno.color ? ultima : null;
  return (
    <aside className="aviso-de-la-computadora" aria-live="polite">
      <p>
        <span className="muestra-de-color" style={{ background: ESTILO_DE_COLOR[enTurno.color].fondo }} aria-hidden />{" "}
        Juega la computadora: <strong>{enTurno.nombre}</strong>{" "}
        {pausado ? "(en pausa)" : jugada ? jugada.texto : "está pensando…"}
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="controles-de-la-computadora">
        <button type="button" onClick={() => cambiarPausa(!pausado)}>
          {pausado ? "Seguir" : "Pausar"}
        </button>
        <button type="button" onClick={() => cambiarRitmo(ritmo === "normal" ? "rapido" : "normal")}>
          {ritmo === "normal" ? "Más rápido" : "Ritmo normal"}
        </button>
      </div>
    </aside>
  );
}

/** Mientras `bloqueado`, lo envuelto se ve pero no se puede usar, ni con el mouse ni con el teclado. */
export function Bloqueable({ bloqueado, children }: { bloqueado: boolean; children: ReactNode }) {
  const envoltorio = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (envoltorio.current) envoltorio.current.inert = bloqueado;
  }, [bloqueado]);
  return (
    <div ref={envoltorio} className={bloqueado ? "bloqueado" : undefined}>
      {children}
    </div>
  );
}
