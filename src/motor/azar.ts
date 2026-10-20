import type { NombreDePais } from "./mapa";

export interface FuenteDeAzar {
  sortearOrden<T>(jugadores: readonly T[]): T[];
  mezclarPaises(paises: readonly NombreDePais[]): NombreDePais[];
}

/** Fuente de azar de la aplicación: la misma semilla da siempre la misma secuencia. */
export function fuenteConSemilla(semilla: number): FuenteDeAzar {
  let a = semilla >>> 0;
  // mulberry32: un generador chico y determinista, con un número entre 0 y 1 por llamada.
  const siguiente = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // Fisher-Yates.
  const mezclar = <T>(lista: readonly T[]): T[] => {
    const mezclada = [...lista];
    for (let i = mezclada.length - 1; i > 0; i--) {
      const j = Math.floor(siguiente() * (i + 1));
      [mezclada[i], mezclada[j]] = [mezclada[j]!, mezclada[i]!];
    }
    return mezclada;
  };
  return { sortearOrden: mezclar, mezclarPaises: mezclar };
}

/**
 * Fuente de azar para los tests, con los resultados fijados a mano.
 *
 * - `ordenDeJuego`: una permutación de posiciones de los jugadores anotados.
 *   `[2, 0, 1]` deja primero a la tercera anotada, después a la primera y después al segundo.
 * - `primerosPaises`: los países que la mezcla deja primeros, en ese orden.
 *   El resto queda después, en el orden en que vienen.
 *
 * Lo que no se fija queda sin mezclar.
 */
export function fuenteFija({
  ordenDeJuego,
  primerosPaises = [],
}: { ordenDeJuego?: number[]; primerosPaises?: NombreDePais[] } = {}): FuenteDeAzar {
  return {
    sortearOrden(jugadores) {
      if (!ordenDeJuego) return [...jugadores];
      if (ordenDeJuego.length !== jugadores.length) {
        throw new Error(
          `El orden de juego fijado tiene ${ordenDeJuego.length} posiciones y hay ${jugadores.length} jugadores.`,
        );
      }
      return ordenDeJuego.map((posicion) => {
        const jugador = jugadores[posicion];
        if (jugador === undefined) throw new Error(`El orden de juego fijado usa la posición ${posicion}, que no existe.`);
        return jugador;
      });
    },
    mezclarPaises(paises) {
      return [...primerosPaises, ...paises.filter((pais) => !primerosPaises.includes(pais))];
    },
  };
}
