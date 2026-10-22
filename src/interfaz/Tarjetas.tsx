import { useState } from "react";
import type { NombreDePais } from "../motor/mapa";
import type { Accion, Partida } from "../motor/partida";
import { TARJETAS_POR_CANJE, type Simbolo } from "../motor/tarjetas";

const DIBUJO: Record<Simbolo, string> = {
  galeón: "⛵",
  cañón: "💣",
  globo: "🎈",
  comodín: "🃏",
};

/**
 * Las tarjetas de país del jugador en turno, la que recibió el último que pasó el turno y el canje.
 * Las de los rivales no se muestran: de ellos se ve solo cuántas tienen, en el orden de juego. Sin
 * `secretosALaVista` (en el turno de la computadora) tampoco se muestran las del jugador en turno.
 * Las tarjetas para canjear se eligen en cualquier momento: si forman un canje que se puede hacer ahora
 * lo dice el motor, aplicándolo de prueba (la partida no cambia hasta que se aplica de verdad).
 */
export function Tarjetas({
  partida,
  alAplicar,
  secretosALaVista = true,
}: {
  partida: Partida;
  alAplicar: (accion: Accion) => void;
  secretosALaVista?: boolean;
}) {
  const [elegidas, setElegidas] = useState<NombreDePais[]>([]);
  const enTurno = partida.jugadorEnTurno();
  const tarjetas = partida.tarjetasDe(enTurno.color);
  const recibida = partida.tarjetaRecibida();
  const terminada = partida.ganador() !== null;
  const canjes = partida.canjesDe(enTurno.color);
  const canje = { tipo: "canjear", tarjetas: elegidas } as const;
  // El motor dice si el canje elegido se puede hacer; si no, por qué.
  const completas = elegidas.length === TARJETAS_POR_CANJE;
  const resultado = completas ? partida.aplicar(canje) : null;

  const elegir = (pais: NombreDePais) =>
    setElegidas((antes) =>
      antes.includes(pais)
        ? antes.filter((otro) => otro !== pais)
        : antes.length < TARJETAS_POR_CANJE
          ? [...antes, pais]
          : antes,
    );

  return (
    <section className="tarjetas">
      <h2>Tarjetas de país</h2>
      {recibida && (
        // El aviso sale en el turno del siguiente: el país solo se nombra si los 2 ejércitos ya lo hicieron
        // público en el tablero. Quien la recibió la ve entre sus tarjetas en su turno.
        <p className="tarjeta-recibida" role="status">
          {recibida.ejercitos > 0 ? (
            <>
              {recibida.jugador.nombre} recibió la tarjeta de <strong>{recibida.tarjeta.pais}</strong> (
              {DIBUJO[recibida.tarjeta.simbolo]} {recibida.tarjeta.simbolo}) y se pusieron {recibida.ejercitos}{" "}
              ejércitos en {recibida.tarjeta.pais}.
            </>
          ) : (
            `${recibida.jugador.nombre} recibió una tarjeta de país.`
          )}
        </p>
      )}
      {!terminada && !secretosALaVista && (
        <p>
          Las tarjetas de {enTurno.nombre} no se muestran: tiene{" "}
          {tarjetas.length === 1 ? "1 tarjeta" : `${tarjetas.length} tarjetas`}.
        </p>
      )}
      {!terminada && secretosALaVista && (
        <>
          <p>
            Tarjetas de <strong>{enTurno.nombre}</strong>: {tarjetas.length === 0 ? "ninguna." : `${tarjetas.length}.`}{" "}
            Su próximo canje vale <strong>{partida.valorDelProximoCanje(enTurno.color)}</strong> ejércitos (lleva{" "}
            {canjes === 1 ? "1 canje" : `${canjes} canjes`}).
          </p>
          {tarjetas.length > 0 && (
            <ul className="tarjetas-del-jugador" aria-label={`Tarjetas de ${enTurno.nombre}`}>
              {tarjetas.map(({ pais, simbolo }) => (
                <li key={pais}>
                  <button
                    type="button"
                    className="tarjeta"
                    aria-pressed={elegidas.includes(pais)}
                    aria-label={`${pais}, ${simbolo}`}
                    onClick={() => elegir(pais)}
                  >
                    <span className="dibujo" aria-hidden>
                      {DIBUJO[simbolo]}
                    </span>
                    <span className="pais-de-tarjeta">{pais}</span>
                    <span className="simbolo">{simbolo}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {tarjetas.length >= TARJETAS_POR_CANJE && (
            <p className="canje">
              <button
                type="button"
                className="principal"
                disabled={!resultado?.ok}
                onClick={() => {
                  alAplicar(canje);
                  setElegidas([]);
                }}
              >
                Canjear {completas ? elegidas.join(", ") : `${TARJETAS_POR_CANJE} tarjetas`}
              </button>
              <span>
                {!completas
                  ? `Elegí ${TARJETAS_POR_CANJE} tarjetas para canjearlas.`
                  : resultado && !resultado.ok
                    ? resultado.error
                    : `Suma ${partida.valorDelProximoCanje(enTurno.color)} ejércitos para poner.`}
              </span>
            </p>
          )}
        </>
      )}
    </section>
  );
}
