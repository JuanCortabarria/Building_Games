import { useState } from "react";
import type { NombreDeContinente, NombreDePais } from "../motor/mapa";
import type { Accion, Color, LadoDeLaTirada, Partida, Ronda, Tirada } from "../motor/partida";
import { COLOR_DEL_CONTINENTE, ESTILO_DE_COLOR } from "./colores";
import { TableroIlustrado } from "./TableroIlustrado";

/** "1 ejército", "3 ejércitos". */
const plural = (n: number | undefined) => `${n} ejército${n === 1 ? "" : "s"}`;

const NOMBRE_DEL_TIPO: Record<Ronda["tipo"], string> = {
  incorporacion: "incorporación",
  ataque: "ataque",
};

export function VistaDePartida({ partida, alCambiar }: { partida: Partida; alCambiar: (partida: Partida) => void }) {
  const [error, setError] = useState<string | null>(null);
  // En la ronda de ataque, si se está atacando o reagrupando, y el país propio elegido como origen.
  const [modo, setModo] = useState<"atacar" | "reagrupar">("atacar");
  const [origen, setOrigen] = useState<NombreDePais | null>(null);
  // Al reagrupar, el país elegido como destino y cuántos ejércitos se mueven.
  const [destino, setDestino] = useState<NombreDePais | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const jugadores = partida.ordenDeJuego();
  const nombreDe = (color: Color) => jugadores.find((jugador) => jugador.color === color)?.nombre ?? color;
  const enTurno = partida.jugadorEnTurno();
  const ronda = partida.ronda();
  const paises = partida.paises();
  const { generales, porContinente } = partida.ejercitosPorIncorporar();
  const extras = Object.entries(porContinente) as [NombreDeContinente, number][];
  const porIncorporar = extras.reduce((total, [, extra]) => total + extra, generales);
  const ejercitosDeOrigen = paises.find((pais) => pais.nombre === origen)?.ejercitos;
  const tirada = partida.ultimaTirada();
  const conquista = partida.conquistaPendiente();
  const ganador = partida.ganador();
  const destruidos = partida.destruidos();
  const estaDestruido = (color: Color) => destruidos.some((jugador) => jugador.color === color);
  // Después de reagrupar ya no se ataca: el turno sigue en modo reagrupar.
  const reagrupo = partida.reagrupoEnEsteTurno();
  const modoEnJuego = reagrupo ? "reagrupar" : modo;

  const soltarPaises = () => {
    setOrigen(null);
    setDestino(null);
    setCantidad(1);
  };

  const aplicar = (accion: Accion) => {
    const resultado = partida.aplicar(accion);
    if (resultado.ok) {
      setError(null);
      if (accion.tipo === "pasarTurno") {
        setModo("atacar");
        soltarPaises();
      }
      if (accion.tipo === "reagrupar") soltarPaises();
      alCambiar(resultado.partida);
    } else {
      setError(resultado.error);
    }
  };

  const alElegirPais = (pais: NombreDePais) => {
    if (ganador) return;
    if (ronda.tipo === "incorporacion") {
      aplicar({ tipo: "incorporar", pais, cantidad: 1 });
      return;
    }
    const esPropio = paises.find((enJuego) => enJuego.nombre === pais)?.ocupante === enTurno.color;
    if (modoEnJuego === "reagrupar") {
      elegirParaReagrupar(pais, esPropio);
      return;
    }
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

  // El primer país es el origen y el segundo, el destino; elegir de nuevo uno de los dos lo suelta.
  // Si el destino no se puede, lo explica el motor al mover.
  const elegirParaReagrupar = (pais: NombreDePais, esPropio: boolean) => {
    setError(null);
    if (pais === origen) {
      soltarPaises();
    } else if (pais === destino) {
      setDestino(null);
    } else if (origen === null) {
      if (esPropio) setOrigen(pais);
      else setError("Primero elegí un país tuyo para reagrupar desde él.");
    } else {
      setDestino(pais);
    }
  };

  const cambiarDeModo = (nuevo: "atacar" | "reagrupar") => {
    setModo(nuevo);
    soltarPaises();
    setError(null);
  };

  const indicacionDeReagrupe =
    origen === null
      ? reagrupo
        ? "Ya reagrupaste: podés seguir reagrupando o pasar el turno."
        : "Elegí un país tuyo para reagrupar desde él."
      : destino === null
        ? `Reagrupando desde ${origen} (${plural(ejercitosDeOrigen)}): elegí un país tuyo al que se llegue por países tuyos.`
        : `Reagrupando de ${origen} a ${destino}: elegí cuántos ejércitos mover.`;

  const indicacion = conquista
    ? `Conquistaste ${conquista.hacia}: elegí cuántos ejércitos pasan desde ${conquista.desde}.`
    : ronda.tipo === "incorporacion"
      ? porIncorporar > 0
        ? `Elegí un país tuyo para poner 1 ejército (te quedan ${porIncorporar}).`
        : "Ya pusiste todos tus ejércitos: pasá el turno."
      : modoEnJuego === "reagrupar"
        ? indicacionDeReagrupe
        : origen === null
          ? "Elegí un país tuyo para atacar desde él, o pasá el turno."
          : `Atacando desde ${origen} (${plural(ejercitosDeOrigen)}): elegí un país limítrofe de otro jugador.`;

  return (
    <>
      <section className="turno">
        <h2>
          Ronda {ronda.inicial ? "inicial" : `de ${NOMBRE_DEL_TIPO[ronda.tipo]}`} {ronda.numero}
        </h2>
        <p>Tipo de ronda: {NOMBRE_DEL_TIPO[ronda.tipo]}</p>
        {ganador ? (
          <p className="en-turno">
            <MuestraDeColor color={ganador.color} />
            Partida terminada: ganó <strong>{ganador.nombre}</strong> ({ganador.color})
          </p>
        ) : (
          <p className="en-turno">
            <MuestraDeColor color={enTurno.color} />
            Turno de <strong>{enTurno.nombre}</strong> ({enTurno.color})
          </p>
        )}
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
            <li key={jugador.color} className={estaDestruido(jugador.color) ? "destruido" : undefined}>
              <MuestraDeColor color={jugador.color} />
              <span className="nombre-del-jugador">
                {jugador.nombre} ({jugador.color})
              </span>
              {estaDestruido(jugador.color) && <span>destruido</span>}
            </li>
          ))}
        </ol>
      </section>
      <section className="seccion-del-mapa">
        <h2>Mapa</h2>
        {/* Queda pegada arriba mientras se juega en el mapa, para que la tirada y los errores estén a la vista. */}
        <div className="barra-del-mapa">
          {ganador ? (
            <p className="ganador" role="status">
              <MuestraDeColor color={ganador.color} />
              <span>
                ¡Ganó <strong>{ganador.nombre}</strong>! La partida terminó.
              </span>
            </p>
          ) : (
            <>
              <div className="barra-del-mapa-fila">
                <p className="en-turno">
                  <MuestraDeColor color={enTurno.color} />
                  <span>
                    <strong>{enTurno.nombre}</strong>: {indicacion}
                  </span>
                </p>
                {conquista ? (
                  <span className="mover-al-conquistado" role="group" aria-label={`Ejércitos que pasan a ${conquista.hacia}`}>
                    {[1, 2, 3].map((cantidad) => (
                      <button
                        key={cantidad}
                        type="button"
                        className="principal"
                        disabled={cantidad > conquista.maximo}
                        onClick={() => aplicar({ tipo: "moverAlConquistado", cantidad })}
                      >
                        Pasar {cantidad}
                      </button>
                    ))}
                  </span>
                ) : (
                  <button type="button" className="principal" onClick={() => aplicar({ tipo: "pasarTurno" })}>
                    Pasar el turno
                  </button>
                )}
              </div>
              {ronda.tipo === "incorporacion" && extras.length > 0 && (
                <AvisoDeExtra generales={generales} extras={extras} />
              )}
              {/* Mientras haya una conquista pendiente, lo único que se puede hacer es mover al país conquistado. */}
              {ronda.tipo === "ataque" && !conquista && (
                <div className="barra-del-mapa-fila">
                  <div className="modos" role="group" aria-label="Qué hacer en el turno">
                    <button
                      type="button"
                      aria-pressed={modoEnJuego === "atacar"}
                      disabled={reagrupo}
                      title={reagrupo ? "Después de reagrupar no se puede atacar en este turno." : undefined}
                      onClick={() => cambiarDeModo("atacar")}
                    >
                      Atacar
                    </button>
                    <button
                      type="button"
                      aria-pressed={modoEnJuego === "reagrupar"}
                      onClick={() => cambiarDeModo("reagrupar")}
                    >
                      Reagrupar
                    </button>
                  </div>
                  {modoEnJuego === "reagrupar" && origen !== null && destino !== null && (
                    // Sin la validación del navegador: si la cantidad no va, lo explica el motor.
                    <form
                      className="mover"
                      noValidate
                      onSubmit={(evento) => {
                        evento.preventDefault();
                        aplicar({ tipo: "reagrupar", desde: origen, hacia: destino, cantidad });
                      }}
                    >
                      <label>
                        Ejércitos a mover{" "}
                        <input
                          type="number"
                          min={1}
                          max={Math.max(1, (ejercitosDeOrigen ?? 1) - 1)}
                          value={cantidad}
                          onChange={(evento) => setCantidad(evento.target.valueAsNumber)}
                        />
                      </label>
                      <button type="submit" className="principal">
                        Mover
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
          {tirada && (
            <ResultadoDeLaTirada
              tirada={tirada}
              nombreDe={nombreDe}
              conquistado={paises.find((pais) => pais.nombre === tirada.defensor.pais)!.ocupante === tirada.atacante.color}
              destruido={estaDestruido(tirada.defensor.color)}
            />
          )}
          {error && <p role="alert">{error}</p>}
        </div>
        <TableroIlustrado
          partida={partida}
          nombreDe={nombreDe}
          seleccionado={ronda.tipo === "ataque" && !ganador ? origen : null}
          modo={modoEnJuego}
          destino={ronda.tipo === "ataque" && !ganador ? destino : null}
          alElegirPais={alElegirPais}
        />
      </section>
    </>
  );
}

/**
 * Antes de poner ejércitos, avisa cuántos extra hay por cada continente ocupado entero y que solo van
 * en países de ese continente, separados de los que van en cualquier país. Los números son los del motor.
 */
function AvisoDeExtra({ generales, extras }: { generales: number; extras: [NombreDeContinente, number][] }) {
  return (
    <div className="aviso-de-extra" role="note" aria-label="Ejércitos extra por continente">
      <ul>
        {extras.map(([continente, extra]) => (
          <li key={continente}>
            <span className="continente" style={{ background: COLOR_DEL_CONTINENTE[continente] }}>
              +{extra}
            </span>
            <span>
              Tenés <strong>{plural(extra)} extra por {continente}</strong>: solo se pueden
              poner en países de {continente}.
            </span>
          </li>
        ))}
        <li>
          <span className="continente cualquiera">{generales}</span>
          <span>
            {generales === 0
              ? "No te quedan ejércitos para cualquier país: los que faltan son extra."
              : `Y ${plural(generales)} para cualquier país tuyo.`}
          </span>
        </li>
      </ul>
    </div>
  );
}

function ResultadoDeLaTirada({
  tirada,
  nombreDe,
  conquistado,
  destruido,
}: {
  tirada: Tirada;
  nombreDe: (color: Color) => string;
  /** Si con esta tirada el atacante conquistó el país atacado. */
  conquistado: boolean;
  /** Si el defensor quedó sin países. */
  destruido: boolean;
}) {
  const { atacante, defensor } = tirada;
  return (
    <>
      <div className="tirada" aria-label="Última tirada">
        <LadoDeTirada titulo="Ataca" lado={atacante} nombreDe={nombreDe} />
        <LadoDeTirada titulo="Defiende" lado={defensor} nombreDe={nombreDe} />
      </div>
      {conquistado && (
        <p className="conquista">
          {nombreDe(atacante.color)} conquistó {defensor.pais}.
          {destruido && ` ${nombreDe(defensor.color)} perdió su último país y quedó destruido.`}
        </p>
      )}
    </>
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
