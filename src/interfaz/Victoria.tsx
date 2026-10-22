import { useState } from "react";
import { PAISES_PARA_GANAR, type Color, type MotivoDeLaVictoria, type Partida } from "../motor/partida";
import { ESTILO_DE_COLOR, variablesDeColor } from "./colores";
import { ADondeApunta } from "./Objetivo";
import "./objetivos.css";

/**
 * La pantalla de victoria: quién ganó, por qué, y el objetivo de cada jugador, que ya no es secreto.
 * Se puede cerrar para mirar cómo quedó el tablero, y volver a abrir.
 */
export function Victoria({
  partida,
  computadoras,
  alEmpezarOtra,
}: {
  partida: Partida;
  computadoras: readonly Color[];
  alEmpezarOtra: () => void;
}) {
  const [abierta, setAbierta] = useState(true);
  const ganador = partida.ganador();
  const motivo = partida.motivoDeLaVictoria();
  if (ganador === null) return null;
  if (!abierta) {
    return (
      <button type="button" className="principal volver-a-la-victoria" onClick={() => setAbierta(true)}>
        🏆 Ver quién ganó
      </button>
    );
  }
  const destruidos = partida.destruidos().map((jugador) => jugador.color);
  const paises = partida.paises();
  const cuantosPaises = (color: Color) => paises.filter((pais) => pais.ocupante === color).length;
  const conObjetivos = partida.modo() === "objetivosSecretos";

  return (
    <div className="fondo-de-la-victoria">
      <section
        className="victoria"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-de-la-victoria"
        style={variablesDeColor(ganador.color)}
      >
        <header className="victoria-encabezado">
          <span className="trofeo" aria-hidden>
            🏆
          </span>
          <h2 id="titulo-de-la-victoria">¡Ganó {ganador.nombre}!</h2>
          <p className="motivo">{motivo && textoDelMotivo(motivo)}</p>
        </header>
        <h3>{conObjetivos ? "Los objetivos de todos" : "Cómo quedaron"}</h3>
        <ul className="objetivos-de-todos">
          {partida.ordenDeJuego().map((jugador) => {
            const objetivo = partida.objetivoDe(jugador.color);
            const esGanador = jugador.color === ganador.color;
            return (
              <li key={jugador.color} className={esGanador ? "es-ganador" : undefined}>
                <span
                  className="muestra-de-color"
                  style={{ background: ESTILO_DE_COLOR[jugador.color].fondo }}
                  aria-hidden
                />
                <div>
                  <p className="quien">
                    <strong>{jugador.nombre}</strong> ({jugador.color})
                    {computadoras.includes(jugador.color) && " · computadora"}
                    {" · "}
                    {destruidos.includes(jugador.color)
                      ? "destruido"
                      : `${cuantosPaises(jugador.color)} ${cuantosPaises(jugador.color) === 1 ? "país" : "países"}`}
                    {esGanador && " · ganó"}
                  </p>
                  {objetivo && (
                    <>
                      <p className="descripcion-del-objetivo">{objetivo.descripcion}</p>
                      <ADondeApunta objetivo={objetivo} partidaTerminada />
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="victoria-botones">
          <button type="button" className="principal" onClick={alEmpezarOtra} autoFocus>
            Jugar otra partida
          </button>
          <button type="button" onClick={() => setAbierta(false)}>
            Ver el tablero
          </button>
        </div>
      </section>
    </div>
  );
}

function textoDelMotivo(motivo: MotivoDeLaVictoria): string {
  if (motivo.tipo === "objetivoComun") return `Ocupó ${PAISES_PARA_GANAR} países: cumplió el objetivo común.`;
  const { objetivo } = motivo;
  if (objetivo.tipo === "destruccion" && objetivo.victima) {
    return `Cumplió su objetivo secreto: destruyó a ${objetivo.victima.nombre} (${objetivo.victima.color}).`;
  }
  return `Cumplió su objetivo secreto: ${minuscula(objetivo.descripcion)}`;
}

function minuscula(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}
