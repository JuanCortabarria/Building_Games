import { useState } from "react";
import type { Partida } from "../motor/partida";
import { CrearPartida } from "./CrearPartida";
import { cargarPartida, guardarPartida } from "./guardado";
import { VistaDePartida } from "./VistaDePartida";

export function App() {
  const [partida, setPartida] = useState<Partida | null>(cargarPartida);
  // Con una partida guardada, se puede ir a crear otra; la guardada se reemplaza recién al crearla.
  const [creandoOtra, setCreandoOtra] = useState(false);

  const cambiar = (nueva: Partida) => {
    guardarPartida(nueva);
    setPartida(nueva);
    setCreandoOtra(false);
  };

  return (
    <main>
      <h1>TEG</h1>
      {partida && !creandoOtra ? (
        <>
          <button type="button" onClick={() => setCreandoOtra(true)}>
            Empezar una partida nueva
          </button>
          <VistaDePartida partida={partida} alCambiar={cambiar} />
        </>
      ) : (
        <>
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
