import { useState } from "react";
import type { NombreDePais } from "../motor/mapa";
import type { Accion, Partida } from "../motor/partida";
import type { Simbolo } from "../motor/tarjetas";

const DIBUJO: Record<Simbolo, string> = {
  galeón: "⛵",
  cañón: "💣",
  globo: "🎈",
  comodín: "🃏",
};

/**
 * Las tarjetas de país del jugador en turno, la que recibió el último que pasó el turno y el canje.
 * Las de los rivales no se muestran: de ellos se ve solo cuántas tienen, en el orden de juego.
 * Se puede elegir 3 en cualquier momento; si forman un canje que se puede hacer ahora lo dice el motor.
 */
export function Tarjetas({ partida, alAplicar }: { partida: Partida; alAplicar: (accion: Accion) => void }) {
  const [elegidas, setElegidas] = useState<NombreDePais[]>([]);
  const enTurno = partida.jugadorEnTurno();
  const tarjetas = partida.tarjetasDe(enTurno.color);
  const recibida = partida.tarjetaRecibida();
  const terminada = partida.ganador() !== null;
  const canjes = partida.canjesDe(enTurno.color);
  const canje = { tipo: "canjear", tarjetas: elegidas } as const;
  // El motor dice si el canje elegido se puede hacer; si no, por qué.
  const resultado = elegidas.length === 3 ? partida.aplicar(canje) : null;

  const elegir = (pais: NombreDePais) =>
    setElegidas((antes) =>
      antes.includes(pais) ? antes.filter((otro) => otro !== pais) : antes.length < 3 ? [...antes, pais] : antes,
    );

  return (
    <section className="tarjetas">
      <h2>Tarjetas de país</h2>
      {recibida && (
        <p className="tarjeta-recibida" role="status">
          {recibida.jugador.nombre} recibió la tarjeta de <strong>{recibida.tarjeta.pais}</strong> (
          {DIBUJO[recibida.tarjeta.simbolo]} {recibida.tarjeta.simbolo})
          {recibida.ejercitos > 0
            ? ` y se pusieron ${recibida.ejercitos} ejércitos en ${recibida.tarjeta.pais}.`
            : "."}
        </p>
      )}
      {!terminada && (
        <>
          <p>
            Tarjetas de <strong>{enTurno.nombre}</strong>: {tarjetas.length === 0 ? "ninguna." : `${tarjetas.length}.`}{" "}
            Su próximo canje vale <strong>{partida.valorDelProximoCanje(enTurno.color)}</strong> ejércitos (lleva{" "}
            {canjes === 1 ? "1 canje" : `${canjes} canjes`}).
          </p>
          {tarjetas.length > 0 && (
            <ul className="mano" aria-label={`Tarjetas de ${enTurno.nombre}`}>
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
          {tarjetas.length >= 3 && (
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
                Canjear {elegidas.length === 3 ? elegidas.join(", ") : "3 tarjetas"}
              </button>
              <span>
                {elegidas.length < 3
                  ? "Elegí 3 tarjetas del mismo símbolo, o de los tres símbolos distintos (el comodín vale por cualquiera)."
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
