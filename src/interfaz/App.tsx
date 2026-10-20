import { Component, useState, type ReactNode } from "react";
import type { Partida } from "../motor/partida";
import { CrearPartida } from "./CrearPartida";
import { cargarPartida, guardarPartida } from "./guardado";
import { VistaDePartida } from "./VistaDePartida";

export function App() {
  const [partida, setPartida] = useState<Partida | null>(cargarPartida);
  // Con una partida guardada, se puede ir a crear otra; la guardada se reemplaza recién al crearla.
  const [creandoOtra, setCreandoOtra] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const cambiar = (nueva: Partida) => {
    guardarPartida(nueva);
    setPartida(nueva);
    setCreandoOtra(false);
    setAviso(null);
  };

  const noSePudoMostrar = () => {
    setPartida(null);
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
            <VistaDePartida partida={partida} alCambiar={cambiar} />
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
          <CrearPartida alCrear={cambiar} />
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
