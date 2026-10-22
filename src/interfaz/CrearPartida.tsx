import { useState } from "react";
import { fuenteConSemilla } from "../motor/azar";
import {
  CANTIDAD_DE_JUGADORES,
  COLORES,
  coloresDisponibles,
  crearPartida,
  type Color,
  type DatosDeJugador,
  type ModoDePartida,
} from "../motor/partida";
import type { PartidaEnJuego } from "./guardado";
import "./objetivos.css";

/** Un jugador por anotar, y si lo maneja una persona o la computadora. */
interface JugadorPorAnotar extends DatosDeJugador {
  computadora: boolean;
}

const JUGADORES_INICIALES: JugadorPorAnotar[] = [
  { nombre: "", color: "azul", computadora: false },
  { nombre: "", color: "rojo", computadora: true },
];

export function CrearPartida({ alCrear }: { alCrear: (enJuego: PartidaEnJuego) => void }) {
  const [jugadores, setJugadores] = useState<JugadorPorAnotar[]>(JUGADORES_INICIALES);
  const [modo, setModo] = useState<ModoDePartida>("objetivosSecretos");
  const [error, setError] = useState<string | null>(null);

  const cambiar = (i: number, cambio: Partial<JugadorPorAnotar>) =>
    setJugadores((actuales) => actuales.map((jugador, j) => (j === i ? { ...jugador, ...cambio } : jugador)));

  const agregar = () =>
    setJugadores((actuales) => {
      const [libre] = coloresDisponibles(actuales);
      return libre ? [...actuales, { nombre: "", color: libre, computadora: true }] : actuales;
    });

  const quitar = (i: number) => setJugadores((actuales) => actuales.filter((_, j) => j !== i));

  const crear = () => {
    // A la computadora sin nombre se le pone uno, para no obligar a inventárselo.
    const datos = jugadores.map(({ nombre, color, computadora }, i) => ({
      nombre: computadora && nombre.trim() === "" ? `Computadora ${i + 1}` : nombre,
      color,
    }));
    const resultado = crearPartida(datos, fuenteConSemilla(Date.now()), { modo });
    if (resultado.ok) {
      const computadoras = jugadores.filter((jugador) => jugador.computadora).map((jugador) => jugador.color);
      alCrear({ partida: resultado.partida, computadoras });
    } else {
      setError(resultado.error);
    }
  };

  return (
    <section>
      <h2>Nueva partida</h2>
      <ol className="jugadores">
        {jugadores.map((jugador, i) => {
          const libres = coloresDisponibles(jugadores.filter((_, j) => j !== i));
          return (
            <li key={i}>
              <input
                aria-label={`Nombre del jugador ${i + 1}`}
                placeholder={jugador.computadora ? `Computadora ${i + 1}` : `Jugador ${i + 1}`}
                value={jugador.nombre}
                onChange={(e) => cambiar(i, { nombre: e.target.value })}
              />
              <select
                aria-label={`Color del jugador ${i + 1}`}
                value={jugador.color}
                onChange={(e) => cambiar(i, { color: e.target.value as Color })}
              >
                {COLORES.map((color) => (
                  <option key={color} value={color} disabled={!libres.includes(color)}>
                    {color}
                  </option>
                ))}
              </select>
              <select
                aria-label={`Quién maneja al jugador ${i + 1}`}
                value={jugador.computadora ? "computadora" : "persona"}
                onChange={(e) => cambiar(i, { computadora: e.target.value === "computadora" })}
              >
                <option value="persona">Persona</option>
                <option value="computadora">Computadora</option>
              </select>
              {jugadores.length > CANTIDAD_DE_JUGADORES.minima && (
                <button type="button" onClick={() => quitar(i)}>
                  Quitar
                </button>
              )}
            </li>
          );
        })}
      </ol>
      {jugadores.length < CANTIDAD_DE_JUGADORES.maxima && (
        <button type="button" onClick={agregar}>
          Agregar jugador
        </button>
      )}
      <fieldset className="modo-de-partida">
        <legend>Cómo se gana</legend>
        <label>
          <input
            type="radio"
            name="modo"
            checked={modo === "objetivosSecretos"}
            onChange={() => setModo("objetivosSecretos")}
          />{" "}
          Con objetivos secretos: cada uno recibe uno al azar, y también vale ocupar 30 países
        </label>
        <label>
          <input type="radio" name="modo" checked={modo === "objetivoComun"} onChange={() => setModo("objetivoComun")} />{" "}
          Solo objetivo común: gana el primero que ocupa 30 países
        </label>
      </fieldset>
      <button type="button" className="principal" onClick={crear}>
        Crear partida
      </button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
