import { PAISES_PARA_GANAR, type ObjetivoDeJugador, type Partida } from "../motor/partida";
import "./objetivos.css";

/**
 * El objetivo secreto del jugador en turno, plegado: se ve solo si lo abre. Se vuelve a plegar en cada
 * turno, porque la pantalla lo arma de nuevo. Solo con el objetivo común, lo recuerda.
 */
export function Objetivo({ partida }: { partida: Partida }) {
  if (partida.ganador() !== null) return null;
  const enTurno = partida.jugadorEnTurno();
  const objetivo = partida.objetivoDe(enTurno.color);
  if (partida.modo() === "objetivoComun" || objetivo === null) {
    return (
      <section className="objetivo">
        <p>
          Se juega solo con el <strong>objetivo común</strong>: gana el primero que ocupa {PAISES_PARA_GANAR} países.
        </p>
      </section>
    );
  }
  return (
    <section className="objetivo">
      <details>
        <summary>Ver mi objetivo ({enTurno.nombre})</summary>
        <div className="tarjeta-de-objetivo">
          <p className="descripcion-del-objetivo">{objetivo.descripcion}</p>
          <ADondeApunta objetivo={objetivo} />
          <p className="objetivo-comun">
            También ganás si ocupás {PAISES_PARA_GANAR} países (el objetivo común).
          </p>
        </div>
      </details>
    </section>
  );
}

/**
 * Para un objetivo de destrucción, a quién hay que destruir hoy, o que ya no se puede. Con la partida
 * terminada lo cuenta en pasado.
 */
export function ADondeApunta({
  objetivo,
  partidaTerminada = false,
}: {
  objetivo: ObjetivoDeJugador;
  partidaTerminada?: boolean;
}) {
  if (objetivo.tipo !== "destruccion") return null;
  if (objetivo.victima === null) {
    return (
      <p className="a-donde-apunta">
        A su víctima la destruyó otro jugador: {partidaTerminada ? "le quedó" : "queda"} solo el objetivo común.
      </p>
    );
  }
  return (
    <p className="a-donde-apunta">
      {partidaTerminada ? "Tenía que destruir a" : "Hoy apunta a"} <strong>{objetivo.victima.nombre}</strong> ({objetivo.victima.color}).
    </p>
  );
}
