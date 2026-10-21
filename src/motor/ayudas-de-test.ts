import { COLORES, crearPartida, restaurarPartida, type Partida, type ResultadoDePartida } from "./partida";
import { fuenteFija } from "./azar";
import { PAISES, type NombreDePais } from "./mapa";

/** Saca la partida de un resultado que tiene que haber salido bien; si vino un error, el test falla mostrándolo. */
export function partidaDe(resultado: ResultadoDePartida): Partida {
  if (!resultado.ok) throw new Error(`Se esperaba una partida y vino el error: ${resultado.error}`);
  return resultado.partida;
}

/**
 * Una partida a mitad de una ronda de ataque, armada restaurando un estado construido para el caso.
 *
 * - `jugadores`: los nombres en orden de juego. Los colores se asignan en el orden de `COLORES`.
 * - `paises`: los países de cada jugador. Los que no se nombran quedan para `resto`.
 *   Un jugador sin países está destruido.
 * - `ejercitos`: los ejércitos de los países que no tienen 1.
 * - `abrio` y `enTurno`: quién abrió la ronda y de quién es el turno.
 * - `dados`: los dados que va a tirar la partida, en orden (ver `fuenteFija`).
 */
export function partidaEnRondaDeAtaque({
  jugadores,
  paises,
  ejercitos = {},
  resto,
  numero,
  abrio,
  enTurno,
  dados,
}: {
  jugadores: string[];
  paises: Record<string, NombreDePais[]>;
  ejercitos?: Partial<Record<NombreDePais, number>>;
  resto: string;
  numero: number;
  abrio: string;
  enTurno: string;
  dados?: number[];
}): Partida {
  const datos = jugadores.map((nombre, i) => ({ nombre, color: COLORES[i]! }));
  const posicionDe = (nombre: string) => {
    const posicion = jugadores.indexOf(nombre);
    if (posicion === -1) throw new Error(`${nombre} no está entre los jugadores.`);
    return posicion;
  };
  const estado = partidaDe(crearPartida(datos, fuenteFija())).estado();
  for (const pais of PAISES) estado.paises[pais.nombre] = { ocupante: datos[posicionDe(resto)]!.color, ejercitos: 1 };
  for (const [nombre, suyos] of Object.entries(paises)) {
    for (const pais of suyos) estado.paises[pais] = { ocupante: datos[posicionDe(nombre)]!.color, ejercitos: 1 };
  }
  for (const [pais, cantidad] of Object.entries(ejercitos) as [NombreDePais, number][]) {
    estado.paises[pais].ejercitos = cantidad;
  }
  return partidaDe(
    restaurarPartida(
      {
        ...estado,
        ronda: { tipo: "ataque", inicial: false, numero },
        abrioLaRonda: posicionDe(abrio),
        turno: posicionDe(enTurno),
        ejercitosPorIncorporar: { generales: 0, porContinente: {} },
      },
      fuenteFija({ dados }),
    ),
  );
}
