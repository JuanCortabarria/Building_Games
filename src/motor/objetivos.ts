// Los 15 objetivos secretos del TEG: 9 de ocupación y 6 de destrucción, uno por color
// (docs/reference/teg-tarjetas-y-objetivos.md).
import { CONTINENTES, PAISES, PARES_LIMITROFES, type NombreDeContinente, type NombreDePais } from "./mapa";
import type { Color } from "./partida";

/** Un objetivo secreto, tal como está en su tarjeta. */
export type Objetivo = { tipo: "ocupacion"; numero: NumeroDeOcupacion } | { tipo: "destruccion"; color: Color };

export type NumeroDeOcupacion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Lo que pide un objetivo de ocupación. Las cantidades son "al menos": quien ocupa más países de un
 * continente que los pedidos también lo cumple.
 */
export interface Ocupacion {
  /** Los continentes que hay que ocupar enteros. */
  continentes: readonly NombreDeContinente[];
  /** Cuántos países hay que ocupar, como mínimo, de cada continente. */
  paises: Partial<Record<NombreDeContinente, number>>;
  /**
   * Cuántos países propios fuera de los continentes nombrados tienen que formar un grupo de limítrofes
   * entre sí: cada uno limítrofe de al menos otro del grupo. Solo lo pide el objetivo 2.
   */
  limitrofesEntreSi?: number;
  descripcion: string;
}

export const OCUPACIONES: Record<NumeroDeOcupacion, Ocupacion> = {
  1: {
    continentes: ["África"],
    paises: { "América del Norte": 5, Europa: 4 },
    descripcion: "Ocupar África, 5 países de América del Norte y 4 de Europa.",
  },
  2: {
    continentes: ["América del Sur"],
    paises: { Europa: 7 },
    limitrofesEntreSi: 3,
    descripcion:
      "Ocupar América del Sur, 7 países de Europa y 3 países limítrofes entre sí fuera de América del Sur y de Europa.",
  },
  3: {
    continentes: ["Asia"],
    paises: { "América del Sur": 2 },
    descripcion: "Ocupar Asia y 2 países de América del Sur.",
  },
  4: {
    continentes: ["Europa"],
    paises: { Asia: 4, "América del Sur": 2 },
    descripcion: "Ocupar Europa, 4 países de Asia y 2 de América del Sur.",
  },
  5: {
    continentes: ["América del Norte"],
    paises: { Oceanía: 2, Asia: 4 },
    descripcion: "Ocupar América del Norte, 2 países de Oceanía y 4 de Asia.",
  },
  6: {
    continentes: [],
    paises: { Oceanía: 2, África: 2, "América del Sur": 2, Europa: 3, "América del Norte": 4, Asia: 3 },
    descripcion:
      "Ocupar 2 países de Oceanía, 2 de África, 2 de América del Sur, 3 de Europa, 4 de América del Norte y 3 de Asia.",
  },
  7: {
    continentes: ["Oceanía", "América del Norte"],
    paises: { Europa: 2 },
    descripcion: "Ocupar Oceanía, América del Norte y 2 países de Europa.",
  },
  8: {
    continentes: ["América del Sur", "África"],
    paises: { Asia: 4 },
    descripcion: "Ocupar América del Sur, África y 4 países de Asia.",
  },
  9: {
    continentes: ["Oceanía", "África"],
    paises: { "América del Norte": 5 },
    descripcion: "Ocupar Oceanía, África y 5 países de América del Norte.",
  },
};

/** Los 15 objetivos, en el orden de la referencia: los de ocupación del 1 al 9 y los de destrucción por color. */
export const OBJETIVOS: readonly Objetivo[] = [
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((numero) => ({ tipo: "ocupacion", numero }) as const),
  // Los mismos colores que COLORES de partida.ts, escritos de nuevo: importarlo armaría un ciclo de módulos.
  ...(["azul", "rojo", "negro", "amarillo", "verde", "magenta"] as const).map(
    (color) => ({ tipo: "destruccion", color }) as const,
  ),
];

export function descripcionDeDestruccion(color: Color): string {
  return `Destruir al ejército ${color}. De ser imposible, al jugador de la derecha.`;
}

export function mismoObjetivo(a: Objetivo, b: Objetivo): boolean {
  return a.tipo === "ocupacion"
    ? b.tipo === "ocupacion" && a.numero === b.numero
    : b.tipo === "destruccion" && a.color === b.color;
}

/** Si quien ocupa los países para los que `esSuyo` dice que sí cumple el objetivo de ocupación dado. */
export function cumpleOcupacion(numero: NumeroDeOcupacion, esSuyo: (pais: NombreDePais) => boolean): boolean {
  const { continentes, paises, limitrofesEntreSi } = OCUPACIONES[numero];
  const suyosEn = (continente: NombreDeContinente) =>
    PAISES.filter((pais) => pais.continente === continente && esSuyo(pais.nombre)).length;
  const completos = continentes.every((nombre) =>
    CONTINENTES.find((continente) => continente.nombre === nombre)!.paises.every(esSuyo),
  );
  const cantidades = (Object.entries(paises) as [NombreDeContinente, number][]).every(
    ([continente, cantidad]) => suyosEn(continente) >= cantidad,
  );
  if (!completos || !cantidades) return false;
  if (limitrofesEntreSi === undefined) return true;
  // El grupo es de países propios fuera de los continentes que nombra el objetivo.
  const nombrados = new Set<NombreDeContinente>([...continentes, ...(Object.keys(paises) as NombreDeContinente[])]);
  const candidatos = PAISES.filter((pais) => !nombrados.has(pais.continente) && esSuyo(pais.nombre)).map(
    (pais) => pais.nombre,
  );
  return mayorGrupoDeLimitrofes(candidatos) >= limitrofesEntreSi;
}

/**
 * La cantidad de países del grupo más grande en que cada uno es limítrofe de al menos otro, pasando
 * solo por los países dados. Un grupo de N o más contiene uno de exactamente N con esa propiedad.
 */
function mayorGrupoDeLimitrofes(paises: readonly NombreDePais[]): number {
  const porVisitar = new Set(paises);
  let mayor = 0;
  for (const inicio of paises) {
    if (!porVisitar.delete(inicio)) continue;
    const pendientes = [inicio];
    let tamano = 0;
    for (let pais = pendientes.pop(); pais !== undefined; pais = pendientes.pop()) {
      tamano++;
      for (const [a, b] of PARES_LIMITROFES) {
        const limitrofe = a === pais ? b : b === pais ? a : null;
        if (limitrofe !== null && porVisitar.delete(limitrofe)) pendientes.push(limitrofe);
      }
    }
    mayor = Math.max(mayor, tamano);
  }
  return mayor;
}
