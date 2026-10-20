import type { Partida, ResultadoDePartida } from "./partida";

/** Saca la partida de un resultado que tiene que haber salido bien; si vino un error, el test falla mostrándolo. */
export function partidaDe(resultado: ResultadoDePartida): Partida {
  if (!resultado.ok) throw new Error(`Se esperaba una partida y vino el error: ${resultado.error}`);
  return resultado.partida;
}
