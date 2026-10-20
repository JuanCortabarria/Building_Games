import { useState } from "react";
import type { Accion, Color, Partida, Ronda } from "../motor/partida";
import { ESTILO_DE_COLOR } from "./colores";
import { MapaEsquematico } from "./MapaEsquematico";

const NOMBRE_DE_LA_RONDA: Record<Ronda["tipo"], string> = {
  inicial: "Ronda inicial",
  ataque: "Ronda de ataque",
};

const TIPO_DE_LA_RONDA: Record<Ronda["tipo"], string> = {
  inicial: "incorporación (inicial)",
  ataque: "ataque",
};

export function VistaDePartida({ partida, alCambiar }: { partida: Partida; alCambiar: (partida: Partida) => void }) {
  const [error, setError] = useState<string | null>(null);
  const jugadores = partida.ordenDeJuego();
  const nombreDe = (color: Color) => jugadores.find((jugador) => jugador.color === color)?.nombre ?? color;
  const enTurno = partida.jugadorEnTurno();
  const ronda = partida.ronda();
  const porIncorporar = partida.ejercitosPorIncorporar();

  const aplicar = (accion: Accion) => {
    const resultado = partida.aplicar(accion);
    if (resultado.ok) {
      setError(null);
      alCambiar(resultado.partida);
    } else {
      setError(resultado.error);
    }
  };

  return (
    <>
      <section className="turno">
        <h2>
          {NOMBRE_DE_LA_RONDA[ronda.tipo]} {ronda.numero}
        </h2>
        <p>Tipo de ronda: {TIPO_DE_LA_RONDA[ronda.tipo]}</p>
        <p className="en-turno">
          <MuestraDeColor color={enTurno.color} />
          Turno de <strong>{enTurno.nombre}</strong> ({enTurno.color})
        </p>
        <p>
          Ejércitos por poner: <strong>{porIncorporar}</strong>
          {porIncorporar > 0 && " (elegí un país tuyo para poner 1)"}
        </p>
        <button type="button" className="principal" onClick={() => aplicar({ tipo: "pasarTurno" })}>
          Pasar el turno
        </button>
        {error && <p role="alert">{error}</p>}
      </section>
      <section>
        <h2>Orden de juego</h2>
        <ol className="orden">
          {jugadores.map((jugador) => (
            <li key={jugador.color}>
              <MuestraDeColor color={jugador.color} />
              {jugador.nombre} ({jugador.color})
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2>Mapa</h2>
        <MapaEsquematico
          partida={partida}
          nombreDe={nombreDe}
          alElegirPais={(pais) => aplicar({ tipo: "incorporar", pais, cantidad: 1 })}
        />
      </section>
    </>
  );
}

function MuestraDeColor({ color }: { color: Color }) {
  return <span className="muestra-de-color" style={{ background: ESTILO_DE_COLOR[color].fondo }} aria-hidden />;
}
