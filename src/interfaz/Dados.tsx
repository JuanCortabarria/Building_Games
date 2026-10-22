import type { CSSProperties } from "react";
import type { Color, Tirada } from "../motor/partida";
import type { Evento } from "../motor/registro";
import { ESTILO_DE_COLOR } from "./colores";
import "./registro.css";

/** Qué pasó con un dado al compararlo con el del otro lado: lo ganó, lo perdió o no tuvo par. */
export type ResultadoDelDado = "gano" | "perdio" | "sinPar";

/** Las casillas de una grilla de 3 × 3 (de 0 a 8, por filas) donde va cada punto de cada cara. */
const PUNTOS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/**
 * Cómo le fue a cada dado de una tirada. Se comparan de a pares, de mayor a menor, tantos como dados tiró
 * el lado que tiró menos; el empate lo gana el defensor (son las reglas que aplica el motor).
 */
export function resultadosDeLaTirada({ atacante, defensor }: Tirada): {
  atacante: ResultadoDelDado[];
  defensor: ResultadoDelDado[];
} {
  const pares = Math.min(atacante.dados.length, defensor.dados.length);
  const ganaElAtacante = (i: number) => atacante.dados[i]! > defensor.dados[i]!;
  return {
    atacante: atacante.dados.map((_, i) => (i >= pares ? "sinPar" : ganaElAtacante(i) ? "gano" : "perdio")),
    defensor: defensor.dados.map((_, i) => (i >= pares ? "sinPar" : ganaElAtacante(i) ? "perdio" : "gano")),
  };
}

/**
 * Los dados de un lado de una tirada, como caras de dado del color del jugador. Con `tirando`, entran
 * rodando uno tras otro (salvo que se prefiera menos movimiento); `chicos` es para el registro.
 */
export function Dados({
  dados,
  color,
  resultados,
  tirando = false,
  chicos = false,
}: {
  dados: readonly number[];
  color: Color;
  resultados?: readonly ResultadoDelDado[];
  tirando?: boolean;
  chicos?: boolean;
}) {
  const { fondo, texto } = ESTILO_DE_COLOR[color];
  return (
    <span className={`dados-con-caras${chicos ? " chicos" : ""}`} role="img" aria-label={`dados ${dados.join(", ")}`}>
      {dados.map((valor, i) => (
        <span
          key={i}
          className={`dado-que-rueda${tirando ? " tirando" : ""}`}
          style={{ "--orden-del-dado": i } as CSSProperties}
        >
          <span
            className={`cara-de-dado ${resultados?.[i] ?? ""}`}
            style={{ "--fondo-del-dado": fondo, "--punto-del-dado": texto } as CSSProperties}
          >
            {(PUNTOS[valor] ?? []).map((casilla) => (
              <span
                key={casilla}
                className="punto-del-dado"
                style={{ gridRow: Math.floor(casilla / 3) + 1, gridColumn: (casilla % 3) + 1 }}
              />
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Un número distinto para cada tirada de la partida (el lugar de su evento en el registro), para que los
 * dados vuelvan a rodar en cada tirada, aunque salga lo mismo que en la anterior.
 */
export function numeroDeLaUltimaTirada(registro: readonly Evento[]): number | undefined {
  for (let i = registro.length - 1; i >= 0; i--) {
    if (registro[i]!.tipo === "tiro") return registro[i]!.orden;
  }
  return undefined;
}
