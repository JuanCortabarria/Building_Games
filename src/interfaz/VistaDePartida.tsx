import { useState } from "react";
import type { NombreDePais } from "../motor/mapa";
import type { Accion, Color, LadoDeLaTirada, Partida, Ronda, Tirada } from "../motor/partida";
import { ESTILO_DE_COLOR } from "./colores";
import { MapaEsquematico } from "./MapaEsquematico";

const NOMBRE_DEL_TIPO: Record<Ronda["tipo"], string> = {
  incorporacion: "incorporación",
  ataque: "ataque",
};

export function VistaDePartida({ partida, alCambiar }: { partida: Partida; alCambiar: (partida: Partida) => void }) {
  const [error, setError] = useState<string | null>(null);
  // En la ronda de ataque, el país propio elegido para atacar desde él.
  const [origen, setOrigen] = useState<NombreDePais | null>(null);
  const jugadores = partida.ordenDeJuego();
  const nombreDe = (color: Color) => jugadores.find((jugador) => jugador.color === color)?.nombre ?? color;
  const enTurno = partida.jugadorEnTurno();
  const ronda = partida.ronda();
  const paises = partida.paises();
  const { generales, porContinente } = partida.ejercitosPorIncorporar();
  const extras = Object.entries(porContinente);
  const porIncorporar = extras.reduce((total, [, extra]) => total + extra, generales);
  const ejercitosDeOrigen = paises.find((pais) => pais.nombre === origen)?.ejercitos;
  const tirada = partida.ultimaTirada();

  const aplicar = (accion: Accion) => {
    const resultado = partida.aplicar(accion);
    if (resultado.ok) {
      setError(null);
      if (accion.tipo === "pasarTurno") setOrigen(null);
      alCambiar(resultado.partida);
    } else {
      setError(resultado.error);
    }
  };

  const alElegirPais = (pais: NombreDePais) => {
    if (ronda.tipo === "incorporacion") {
      aplicar({ tipo: "incorporar", pais, cantidad: 1 });
      return;
    }
    const esPropio = paises.find((enJuego) => enJuego.nombre === pais)?.ocupante === enTurno.color;
    if (esPropio) {
      // Un país propio cambia el origen; elegir de nuevo el mismo lo suelta.
      setOrigen(pais === origen ? null : pais);
      setError(null);
    } else if (origen === null) {
      setError("Primero elegí un país tuyo para atacar desde él.");
    } else {
      aplicar({ tipo: "atacar", desde: origen, hacia: pais });
    }
  };

  const indicacion =
    ronda.tipo === "incorporacion"
      ? porIncorporar > 0
        ? `Elegí un país tuyo para poner 1 ejército (te quedan ${porIncorporar}).`
        : "Ya pusiste todos tus ejércitos: pasá el turno."
      : origen === null
        ? "Elegí un país tuyo para atacar desde él, o pasá el turno."
        : `Atacando desde ${origen} (${ejercitosDeOrigen} ejército${ejercitosDeOrigen === 1 ? "" : "s"}): elegí un país limítrofe de otro jugador.`;

  return (
    <>
      <section className="turno">
        <h2>
          Ronda {ronda.inicial ? "inicial" : `de ${NOMBRE_DEL_TIPO[ronda.tipo]}`} {ronda.numero}
        </h2>
        <p>Tipo de ronda: {NOMBRE_DEL_TIPO[ronda.tipo]}</p>
        <p className="en-turno">
          <MuestraDeColor color={enTurno.color} />
          Turno de <strong>{enTurno.nombre}</strong> ({enTurno.color})
        </p>
        <p>
          Ejércitos por poner: <strong>{porIncorporar}</strong>
        </p>
        {extras.length > 0 && (
          <ul className="por-incorporar">
            {generales > 0 && <li>{generales} para cualquier país tuyo</li>}
            {extras.map(([continente, extra]) => (
              <li key={continente}>
                {extra} extra por {continente}, solo para países de {continente}
              </li>
            ))}
          </ul>
        )}
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
      <section className="seccion-del-mapa">
        <h2>Mapa</h2>
        {/* Queda pegada arriba mientras se juega en el mapa, para que la tirada y los errores estén a la vista. */}
        <div className="barra-del-mapa">
          <div className="barra-del-mapa-fila">
            <p className="en-turno">
              <MuestraDeColor color={enTurno.color} />
              <span>
                <strong>{enTurno.nombre}</strong>: {indicacion}
              </span>
            </p>
            <button type="button" className="principal" onClick={() => aplicar({ tipo: "pasarTurno" })}>
              Pasar el turno
            </button>
          </div>
          {tirada && <ResultadoDeLaTirada tirada={tirada} nombreDe={nombreDe} />}
          {error && <p role="alert">{error}</p>}
        </div>
        <MapaEsquematico
          partida={partida}
          nombreDe={nombreDe}
          seleccionado={ronda.tipo === "ataque" ? origen : null}
          alElegirPais={alElegirPais}
        />
      </section>
    </>
  );
}

function ResultadoDeLaTirada({ tirada, nombreDe }: { tirada: Tirada; nombreDe: (color: Color) => string }) {
  return (
    <div className="tirada" aria-label="Última tirada">
      <LadoDeTirada titulo="Ataca" lado={tirada.atacante} nombreDe={nombreDe} />
      <LadoDeTirada titulo="Defiende" lado={tirada.defensor} nombreDe={nombreDe} />
    </div>
  );
}

function LadoDeTirada({
  titulo,
  lado,
  nombreDe,
}: {
  titulo: string;
  lado: LadoDeLaTirada;
  nombreDe: (color: Color) => string;
}) {
  const { fondo, texto } = ESTILO_DE_COLOR[lado.color];
  return (
    <p className="lado-de-tirada">
      <span>
        {titulo} <strong>{lado.pais}</strong> ({nombreDe(lado.color)}):
      </span>
      <span className="dados" aria-label={`dados ${lado.dados.join(", ")}`}>
        {lado.dados.map((dado, i) => (
          <span key={i} className="dado" style={{ background: fondo, color: texto }}>
            {dado}
          </span>
        ))}
      </span>
      <span>
        perdió <strong>{lado.perdidos}</strong> ejército{lado.perdidos === 1 ? "" : "s"}
      </span>
    </p>
  );
}

function MuestraDeColor({ color }: { color: Color }) {
  return <span className="muestra-de-color" style={{ background: ESTILO_DE_COLOR[color].fondo }} aria-hidden />;
}
