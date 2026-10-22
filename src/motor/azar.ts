import type { NombreDePais } from "./mapa";

export interface FuenteDeAzar {
  sortearOrden<T>(jugadores: readonly T[]): T[];
  mezclarPaises(paises: readonly NombreDePais[]): NombreDePais[];
  /** Mezcla tarjetas de país: el mazo al crear la partida, o el descarte cuando el mazo se acaba. */
  mezclarTarjetas(tarjetas: readonly NombreDePais[]): NombreDePais[];
  /** Tira la cantidad de dados pedida y devuelve sus valores, del 1 al 6, en el orden en que salieron. */
  tirarDados(cantidad: number): number[];
  /**
   * La misma fuente, retomada en el punto de su secuencia que dice `estado`. No cambia a esta fuente,
   * así que reanudar dos veces desde el mismo estado da los mismos resultados.
   */
  reanudar(estado: EstadoDeAzar): FuenteDeAzar;
  /** En qué punto de su secuencia está la fuente, como dato simple para guardarlo con la partida. */
  estado(): EstadoDeAzar;
}

/**
 * El punto de la secuencia en que está una fuente de azar.
 *
 * - `semilla`: con la que arrancó la secuencia.
 * - `avance`: cuántos números se sacaron de la secuencia desde la semilla.
 */
export interface EstadoDeAzar {
  semilla: number;
  avance: number;
}

/** Fuente de azar de la aplicación: la misma semilla da siempre la misma secuencia. */
export function fuenteConSemilla(semilla: number): FuenteDeAzar {
  return reanudarFuente({ semilla, avance: 0 });
}

/** La fuente con semilla, retomada en el punto de su secuencia en que quedó. */
export function reanudarFuente({ semilla, avance }: EstadoDeAzar): FuenteDeAzar {
  // mulberry32: un generador chico y determinista, con un número entre 0 y 1 por llamada.
  // Cada llamada suma la misma constante a `a`, así que reanudar después de `avance`
  // llamadas es sumarla `avance` veces de una (Math.imul se queda con los 32 bits de abajo).
  const PASO = 0x6d2b79f5;
  let a = ((semilla >>> 0) + Math.imul(avance, PASO)) >>> 0;
  let sacados = avance;
  const siguiente = () => {
    sacados++;
    a = (a + PASO) >>> 0;
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
  return {
    sortearOrden: mezclar,
    mezclarPaises: mezclar,
    mezclarTarjetas: mezclar,
    tirarDados: (cantidad) => Array.from({ length: cantidad }, () => Math.floor(siguiente() * 6) + 1),
    reanudar: reanudarFuente,
    estado: () => ({ semilla, avance: sacados }),
  };
}

/**
 * Fuente de azar para los tests, con los resultados fijados a mano.
 *
 * - `ordenDeJuego`: una permutación de posiciones de los jugadores anotados.
 *   `[2, 0, 1]` deja primero a la tercera anotada, después a la primera y después al segundo.
 * - `primerosPaises`: los países que la mezcla deja primeros, en ese orden.
 *   El resto queda después, en el orden en que vienen.
 * - `primerasTarjetas`: las tarjetas que cada mezcla de tarjetas deja primeras, en ese orden, si están
 *   entre las que se mezclan. El resto queda después, en el orden en que vienen.
 * - `dados`: los valores que van saliendo, en orden, tirada tras tirada. En un ataque tira primero
 *   el atacante y después el defensor: `[6, 4, 1, 5, 4]` es el atacante 6, 4, 1 y el defensor 5, 4.
 *
 * Lo que no se fija queda sin mezclar. Su `avance` es cuántos dados de la lista ya salieron.
 */
export function fuenteFija(
  fijados: {
    ordenDeJuego?: number[];
    primerosPaises?: NombreDePais[];
    primerasTarjetas?: NombreDePais[];
    dados?: number[];
  } = {},
  avance = 0,
): FuenteDeAzar {
  const { ordenDeJuego, primerosPaises = [], primerasTarjetas = [], dados = [] } = fijados;
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
    mezclarPaises: (paises) => primeroLosFijados(primerosPaises, paises),
    mezclarTarjetas: (tarjetas) => primeroLosFijados(primerasTarjetas, tarjetas),
    tirarDados(cantidad) {
      if (avance + cantidad > dados.length) {
        throw new Error(
          `Se pidieron ${cantidad} dados y quedan ${dados.length - avance} de los ${dados.length} fijados.`,
        );
      }
      const tirados = dados.slice(avance, avance + cantidad);
      avance += cantidad;
      return tirados;
    },
    reanudar: (estado) => fuenteFija(fijados, estado.avance),
    // No tiene semilla: su secuencia es la lista de dados.
    estado: () => ({ semilla: 0, avance }),
  };
}

/** La lista con los fijados que están en ella primero, en el orden fijado, y el resto después, como viene. */
function primeroLosFijados<T>(fijados: readonly T[], lista: readonly T[]): T[] {
  const primeros = fijados.filter((elemento) => lista.includes(elemento));
  return [...primeros, ...lista.filter((elemento) => !primeros.includes(elemento))];
}
