import { useState } from "react";
import type { Partida } from "../motor/partida";
import { CrearPartida } from "./CrearPartida";
import { VistaDePartida } from "./VistaDePartida";

export function App() {
  const [partida, setPartida] = useState<Partida | null>(null);

  return (
    <main>
      <h1>TEG</h1>
      {partida ? <VistaDePartida partida={partida} alCambiar={setPartida} /> : <CrearPartida alCrear={setPartida} />}
    </main>
  );
}
