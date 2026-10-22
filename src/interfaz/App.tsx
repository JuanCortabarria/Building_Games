import { Component, useState, type ReactNode } from "react";
import type { Color, Partida } from "../motor/partida";
import { CrearPartida } from "./CrearPartida";
import { cargarPartida, guardarPartida, type PartidaEnJuego } from "./guardado";
import { Telon, useTelon } from "./Telon";
import { AvisoDeLaComputadora, Bloqueable, useTurnoDeLaComputadora } from "./TurnoDeLaComputadora";
import { Victoria } from "./Victoria";
import { VistaDePartida } from "./VistaDePartida";

/** Sin partida no hay jugadores de la computadora. Es una sola lista, para que no cambie en cada dibujo. */
const NINGUNA_COMPUTADORA: readonly Color[] = [];

export function App() {
  const [enJuego, setEnJuego] = useState<PartidaEnJuego | null>(cargarPartida);
  const partida = enJuego?.partida ?? null;
  // Con una partida guardada, se puede ir a crear otra; la guardada se reemplaza recién al crearla.
  const [creandoOtra, setCreandoOtra] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const empezar = (nueva: PartidaEnJuego) => {
    guardarPartida(nueva);
    setEnJuego(nueva);
    setCreandoOtra(false);
    setAviso(null);
  };

  const computadoras = enJuego?.computadoras ?? NINGUNA_COMPUTADORA;
  const cambiar = (nueva: Partida) => empezar({ partida: nueva, computadoras });

  // Mientras se crea otra partida, la computadora no sigue jugando la guardada.
  const turnoDeLaComputadora = useTurnoDeLaComputadora({
    partida,
    computadoras,
    activo: !creandoOtra,
    alCambiar: cambiar,
  });

  const telon = useTelon({ partida, computadoras });

  const noSePudoMostrar = () => {
    setEnJuego(null);
    setAviso("No se pudo abrir la partida guardada. Podés empezar una nueva.");
  };

  return (
    <main>
      <h1>TEG</h1>
      {partida && !creandoOtra ? (
        <>
          <button type="button" onClick={() => setCreandoOtra(true)}>
            Empezar una partida nueva
          </button>
          <SiFalla alFallar={noSePudoMostrar}>
            {/* Entre turnos de personas, el telón tapa la partida: debajo no se dibuja nada secreto. */}
            {telon.tapa ? (
              <Telon jugador={partida.jugadorEnTurno()} alLevantar={telon.levantar} />
            ) : (
              <>
                {/* En el turno de la computadora, las personas miran pero no pueden actuar ni ver lo secreto. */}
                <Bloqueable bloqueado={turnoDeLaComputadora.juega}>
                  <VistaDePartida
                    partida={partida}
                    alCambiar={cambiar}
                    secretosALaVista={!turnoDeLaComputadora.juega}
                  />
                </Bloqueable>
                <AvisoDeLaComputadora turno={turnoDeLaComputadora} partida={partida} />
              </>
            )}
            {partida.ganador() && (
              <Victoria partida={partida} computadoras={computadoras} alEmpezarOtra={() => setCreandoOtra(true)} />
            )}
          </SiFalla>
        </>
      ) : (
        <>
          {aviso && <p role="alert">{aviso}</p>}
          {partida && (
            <p>
              La partida nueva reemplaza a la guardada.
              <button type="button" onClick={() => setCreandoOtra(false)}>
                Volver a la partida guardada
              </button>
            </p>
          )}
          <CrearPartida alCrear={empezar} />
        </>
      )}
    </main>
  );
}

/**
 * Si lo que envuelve falla al dibujarse, no dibuja nada y avisa. Cubre una partida guardada
 * que se pudo leer pero no tiene la forma de una partida: la aplicación no se rompe.
 */
class SiFalla extends Component<{ alFallar: () => void; children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("No se pudo mostrar la partida.", error);
    this.props.alFallar();
  }

  render() {
    return this.state.fallo ? null : this.props.children;
  }
}
