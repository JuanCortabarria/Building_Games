/** Qué pasó con un dado de una tirada al compararlo con el del otro lado: lo ganó, lo perdió o no tuvo par. */
export type ResultadoDelDado = "gano" | "perdio" | "sinPar";

/**
 * Compara los dados de una tirada, cada lado de mayor a menor: de a pares, tantos como dados tiró el lado
 * que tiró menos. El empate lo gana el defensor. Cada dado perdido es un ejército que pierde su lado.
 */
export function compararDados(
  atacante: readonly number[],
  defensor: readonly number[],
): { atacante: ResultadoDelDado[]; defensor: ResultadoDelDado[] } {
  const pares = Math.min(atacante.length, defensor.length);
  const ganaElAtacante = (i: number) => atacante[i]! > defensor[i]!;
  return {
    atacante: atacante.map((_, i) => (i >= pares ? "sinPar" : ganaElAtacante(i) ? "gano" : "perdio")),
    defensor: defensor.map((_, i) => (i >= pares ? "sinPar" : ganaElAtacante(i) ? "perdio" : "gano")),
  };
}

/** Cuántos dados de un lado perdieron su par: los ejércitos que pierde ese lado. */
export function cuantosPerdio(resultados: readonly ResultadoDelDado[]): number {
  return resultados.filter((resultado) => resultado === "perdio").length;
}
