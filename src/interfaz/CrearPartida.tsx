import { useState } from "react";
import { fuenteConSemilla } from "../motor/azar";
import { crearPartida, type Color, type DatosDeJugador, type Partida } from "../motor/partida";
import { COLORES } from "./colores";

const JUGADORES_INICIALES: DatosDeJugador[] = [
  { nombre: "", color: "azul" },
  { nombre: "", color: "rojo" },
];

export function CrearPartida({ alCrear }: { alCrear: (partida: Partida) => void }) {
  const [jugadores, setJugadores] = useState<DatosDeJugador[]>(JUGADORES_INICIALES);
  const [error, setError] = useState<string | null>(null);

  const cambiar = (i: number, cambio: Partial<DatosDeJugador>) =>
    setJugadores((actuales) => actuales.map((jugador, j) => (j === i ? { ...jugador, ...cambio } : jugador)));

  const agregar = () =>
    setJugadores((actuales) => {
      const libre = COLORES.find((color) => !actuales.some((jugador) => jugador.color === color));
      return libre ? [...actuales, { nombre: "", color: libre }] : actuales;
    });

  const quitar = (i: number) => setJugadores((actuales) => actuales.filter((_, j) => j !== i));

  const crear = () => {
    const resultado = crearPartida(jugadores, fuenteConSemilla(Date.now()));
    if (resultado.ok) alCrear(resultado.partida);
    else setError(resultado.error);
  };

  return (
    <section>
      <h2>Nueva partida</h2>
      <ol className="jugadores">
        {jugadores.map((jugador, i) => (
          <li key={i}>
            <input
              aria-label={`Nombre del jugador ${i + 1}`}
              placeholder={`Jugador ${i + 1}`}
              value={jugador.nombre}
              onChange={(e) => cambiar(i, { nombre: e.target.value })}
            />
            <select
              aria-label={`Color del jugador ${i + 1}`}
              value={jugador.color}
              onChange={(e) => cambiar(i, { color: e.target.value as Color })}
            >
              {COLORES.map((color) => (
                <option
                  key={color}
                  value={color}
                  disabled={jugadores.some((otro, j) => j !== i && otro.color === color)}
                >
                  {color}
                </option>
              ))}
            </select>
            {jugadores.length > 2 && (
              <button type="button" onClick={() => quitar(i)}>
                Quitar
              </button>
            )}
          </li>
        ))}
      </ol>
      {jugadores.length < 6 && (
        <button type="button" onClick={agregar}>
          Agregar jugador
        </button>
      )}
      <button type="button" className="principal" onClick={crear}>
        Crear partida
      </button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
