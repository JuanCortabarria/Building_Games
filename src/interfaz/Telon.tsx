import { useRef, useState } from "react";
import type { Color, DatosDeJugador, Partida } from "../motor/partida";
import { variablesDeColor } from "./colores";
import "./objetivos.css";

export interface EstadoDelTelon {
  /** Si el telón tapa la partida. */
  tapa: boolean;
  /** Lo levanta: el jugador en turno ya está frente a la pantalla. */
  levantar: () => void;
}

/**
 * Con objetivos secretos y al menos 2 personas en juego, el telón tapa la partida cada vez que empieza
 * el turno de una persona distinta de la última que la miró, para que se pasen la pantalla sin ver las
 * tarjetas ni el objetivo del otro. En los turnos de la computadora no hay nada secreto a la vista, así
 * que no aparece. Al abrir una partida guardada o crear una nueva, también tapa.
 */
export function useTelon({
  partida,
  computadoras,
}: {
  partida: Partida | null;
  computadoras: readonly Color[];
}): EstadoDelTelon {
  // La última persona que levantó el telón, en qué partida. Mientras siga su turno, o le toque otro turno
  // seguido, no tapa. Una partida nueva trae su propia lista de computadoras: ahí vuelve a tapar, ya desde
  // el primer dibujo, para que no se vea nada secreto ni por un instante.
  const [levanto, setLevanto] = useState<{ computadoras: readonly Color[]; color: Color } | null>(null);
  const ultimaQueMiro = levanto?.computadoras === computadoras ? levanto.color : null;

  if (partida === null || partida.modo() !== "objetivosSecretos" || partida.ganador() !== null) {
    return { tapa: false, levantar: () => {} };
  }
  const destruidos = partida.destruidos().map((jugador) => jugador.color);
  const personas = partida
    .ordenDeJuego()
    .filter(({ color }) => !computadoras.includes(color) && !destruidos.includes(color));
  const enTurno = partida.jugadorEnTurno().color;
  const tapa = personas.length >= 2 && !computadoras.includes(enTurno) && ultimaQueMiro !== enTurno;
  return { tapa, levantar: () => setLevanto({ computadoras, color: enTurno }) };
}

/**
 * Cuánto tiempo después de aparecer el telón no hace caso a los toques, en milisegundos. Aparece justo
 * donde se tocó "Pasar el turno": sin esta espera, un doble clic lo levantaría sin querer.
 */
const ESPERA_PARA_LEVANTAR = 600;

/** Tapa toda la pantalla hasta que la toque el jugador en turno. */
export function Telon({ jugador, alLevantar }: { jugador: DatosDeJugador; alLevantar: () => void }) {
  const aparecio = useRef(performance.now());
  return (
    <button
      type="button"
      className="telon"
      style={variablesDeColor(jugador.color)}
      onClick={() => {
        if (performance.now() - aparecio.current >= ESPERA_PARA_LEVANTAR) alLevantar();
      }}
      autoFocus
    >
      <span className="telon-muestra-de-color" aria-hidden />
      <span className="telon-titulo">
        Turno de <strong>{jugador.nombre}</strong>
      </span>
      <span className="telon-indicacion">Tocá para empezar</span>
      <span className="telon-aviso">Que los demás no miren: vas a ver tus tarjetas y tu objetivo.</span>
    </button>
  );
}
