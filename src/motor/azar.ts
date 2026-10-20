export interface FuenteDeAzar {
  mezclar<T>(lista: readonly T[]): T[];
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
  return {
    mezclar(lista) {
      // Fisher-Yates.
      const mezclada = [...lista];
      for (let i = mezclada.length - 1; i > 0; i--) {
        const j = Math.floor(siguiente() * (i + 1));
        [mezclada[i], mezclada[j]] = [mezclada[j]!, mezclada[i]!];
      }
      return mezclada;
    },
  };
}

/**
 * Fuente de azar para los tests. Cada mezcla es una permutación de posiciones:
 * `[2, 0, 1]` deja primero al tercer elemento, después al primero y después al segundo.
 * Las mezclas se usan en el orden en que el motor las pide; cuando se acaban,
 * la fuente deja las listas como vienen.
 */
export function fuenteFija({ mezclas = [] }: { mezclas?: number[][] } = {}): FuenteDeAzar {
  const pendientes = [...mezclas];
  return {
    mezclar(lista) {
      const permutacion = pendientes.shift();
      if (!permutacion) return [...lista];
      if (permutacion.length !== lista.length) {
        throw new Error(
          `La mezcla fijada tiene ${permutacion.length} posiciones y la lista a mezclar tiene ${lista.length}.`,
        );
      }
      return permutacion.map((posicion) => {
        const elemento = lista[posicion];
        if (elemento === undefined) throw new Error(`La mezcla fijada usa la posición ${posicion}, que no existe.`);
        return elemento;
      });
    },
  };
}
