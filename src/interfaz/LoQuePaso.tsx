import type { CSSProperties, ReactNode } from "react";
import type { Color, Partida, Ronda } from "../motor/partida";
import type { Evento, MotivoDeVictoria } from "../motor/registro";
import { ESTILO_DE_COLOR } from "./colores";
import { Dados, resultadosDeLaTirada } from "./Dados";
import "./registro.css";

/**
 * El registro de la partida en frases: el evento más nuevo arriba, cada uno con el color de su jugador,
 * y las conquistas, destrucciones y la victoria destacadas. El comienzo de cada ronda separa las rondas.
 */
export function LoQuePaso({ partida }: { partida: Partida }) {
  const jugadores = partida.ordenDeJuego();
  const nombreDe = (color: Color) => jugadores.find((jugador) => jugador.color === color)?.nombre ?? color;
  const eventos = [...partida.registro()].reverse();
  return (
    <section className="lo-que-paso" aria-labelledby="titulo-lo-que-paso">
      <h2 id="titulo-lo-que-paso">Lo que pasó</h2>
      <ol className="eventos">
        {eventos.map((evento) => (
          <li
            key={evento.orden}
            className={`evento ${evento.tipo}`}
            style={{ "--color-del-evento": ESTILO_DE_COLOR[evento.color].fondo } as CSSProperties}
          >
            <Frase evento={evento} nombreDe={nombreDe} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function Frase({ evento, nombreDe }: { evento: Evento; nombreDe: (color: Color) => string }): ReactNode {
  const quien = <Jugador color={evento.color} nombreDe={nombreDe} />;
  switch (evento.tipo) {
    case "empezoLaRonda":
      return (
        <>
          Empieza la ronda {nombreDeLaRonda(evento.ronda)}. Abre {quien}.
        </>
      );
    case "incorporo":
      return (
        <>
          {quien} puso {ejercitos(evento.cantidad)} en <strong>{evento.pais}</strong>.
        </>
      );
    case "tiro": {
      const { atacante, defensor } = evento;
      const resultados = resultadosDeLaTirada(evento);
      const atacanteNombre = <Jugador color={atacante.color} nombreDe={nombreDe} />;
      const defensorNombre = <Jugador color={defensor.color} nombreDe={nombreDe} />;
      return (
        <>
          {quien} atacó <strong>{defensor.pais}</strong> desde <strong>{atacante.pais}</strong>:{" "}
          <Dados dados={atacante.dados} color={atacante.color} resultados={resultados.atacante} chicos /> contra{" "}
          <Dados dados={defensor.dados} color={defensor.color} resultados={resultados.defensor} chicos />.{" "}
          {atacante.perdidos > 0 && defensor.perdidos > 0 ? (
            <>
              {atacanteNombre} perdió {atacante.perdidos} y {defensorNombre} perdió {defensor.perdidos}.
            </>
          ) : atacante.perdidos > 0 ? (
            <>
              {atacanteNombre} perdió {atacante.perdidos}.
            </>
          ) : (
            <>
              {defensorNombre} perdió {defensor.perdidos}.
            </>
          )}
        </>
      );
    }
    case "conquisto":
      return (
        <>
          <span className="icono-del-evento" aria-hidden>🚩</span>
          {quien} conquistó <strong>{evento.pais}</strong>, que era de{" "}
          <Jugador color={evento.defensor} nombreDe={nombreDe} />.
        </>
      );
    case "destruyo":
      return (
        <>
          <span className="icono-del-evento" aria-hidden>💥</span>
          {quien} destruyó a <Jugador color={evento.destruido} nombreDe={nombreDe} />
          {evento.tarjetas === 0
            ? ", que no tenía tarjetas."
            : ` y se quedó con ${evento.tarjetas === 1 ? "su tarjeta" : `sus ${evento.tarjetas} tarjetas`}.`}
        </>
      );
    case "movioAlConquistado":
      return (
        <>
          {quien} pasó {ejercitos(evento.cantidad)} de {evento.desde} a <strong>{evento.hacia}</strong>.
        </>
      );
    case "reagrupo":
      return (
        <>
          {quien} reagrupó {ejercitos(evento.cantidad)} de {evento.desde} a <strong>{evento.hacia}</strong>.
        </>
      );
    case "canjeo":
      return (
        <>
          <span className="icono-del-evento" aria-hidden>🃏</span>
          {quien} canjeó {lista(evento.tarjetas)} por <strong>{ejercitos(evento.ejercitos)}</strong>.
        </>
      );
    case "recibioTarjeta":
      // El país de la tarjeta es secreto de quien la recibió, salvo que los 2 ejércitos lo hayan hecho público.
      return evento.ejercitos > 0 ? (
        <>
          {quien} recibió la tarjeta de <strong>{evento.pais}</strong> y puso {ejercitos(evento.ejercitos)} ahí.
        </>
      ) : (
        <>{quien} recibió una tarjeta de país.</>
      );
    case "pasoElTurno":
      return <>{quien} pasó el turno.</>;
    case "gano":
      return (
        <>
          <span className="icono-del-evento" aria-hidden>🏆</span>
          {quien} ganó la partida. {porQueGano(evento.motivo)}
        </>
      );
  }
}

function Jugador({ color, nombreDe }: { color: Color; nombreDe: (color: Color) => string }) {
  return (
    <span className="jugador-del-evento">
      <span className="muestra-de-color" style={{ background: ESTILO_DE_COLOR[color].fondo }} aria-hidden />
      <strong>{nombreDe(color)}</strong>
    </span>
  );
}

function porQueGano(motivo: MotivoDeVictoria): string {
  switch (motivo.tipo) {
    case "objetivoComun":
      return "Cumplió el objetivo común: ocupar 30 países.";
  }
}

function nombreDeLaRonda(ronda: Ronda): string {
  if (ronda.inicial) return `inicial ${ronda.numero}`;
  return `de ${ronda.tipo === "ataque" ? "ataque" : "incorporación"} ${ronda.numero}`;
}

function ejercitos(cantidad: number): string {
  return `${cantidad} ejército${cantidad === 1 ? "" : "s"}`;
}

function lista(cosas: readonly string[]): string {
  return cosas.length < 2 ? cosas.join("") : `${cosas.slice(0, -1).join(", ")} y ${cosas.at(-1)}`;
}
