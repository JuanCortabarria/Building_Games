import type { CSSProperties } from "react";
import type { Color } from "../motor/partida";
import type { ResultadoDelDado } from "../motor/dados";
import { ESTILO_DE_COLOR } from "./colores";
import "./registro.css";

/** Los lugares de una grilla de 3 × 3 (de 0 a 8, por filas) donde va cada punto de cada cara. */
const PUNTOS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

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
            {(PUNTOS[valor] ?? []).map((lugar) => (
              <span
                key={lugar}
                className="punto-del-dado"
                style={{ gridRow: Math.floor(lugar / 3) + 1, gridColumn: (lugar % 3) + 1 }}
              />
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
