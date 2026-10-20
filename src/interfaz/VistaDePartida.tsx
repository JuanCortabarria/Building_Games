import type { Color, Partida } from "../motor/partida";
import { ESTILO_DE_COLOR } from "./colores";

export function VistaDePartida({ partida }: { partida: Partida }) {
  const jugadores = partida.ordenDeJuego();
  const nombreDe = (color: Color) => jugadores.find((jugador) => jugador.color === color)?.nombre ?? color;

  return (
    <>
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
        <h2>Países</h2>
        <div className="continentes">
          {partida.continentes().map((continente) => (
            <div key={continente.nombre} className="continente">
              <h3>
                {continente.nombre} <small>(+{continente.ejercitosExtra})</small>
              </h3>
              <ul>
                {partida
                  .paises()
                  .filter((pais) => pais.continente === continente.nombre)
                  .map((pais) => (
                    <li
                      key={pais.nombre}
                      className="pais"
                      style={{ background: ESTILO_DE_COLOR[pais.ocupante].fondo, color: ESTILO_DE_COLOR[pais.ocupante].texto }}
                      title={`${pais.nombre}: ${nombreDe(pais.ocupante)}, ${pais.ejercitos} ejército(s)`}
                    >
                      <span>{pais.nombre}</span>
                      <strong>{pais.ejercitos}</strong>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function MuestraDeColor({ color }: { color: Color }) {
  return <span className="muestra-de-color" style={{ background: ESTILO_DE_COLOR[color].fondo }} aria-hidden />;
}
