import {
  COLORES,
  crearPartida,
  restaurarPartida,
  type ObjetivoAsignado,
  type Partida,
  type ResultadoDePartida,
} from "./partida";
import { fuenteFija } from "./azar";
import { PAISES, type NombreDePais } from "./mapa";

/** Saca la partida de un resultado que tiene que haber salido bien; si vino un error, el test falla mostrándolo. */
export function partidaDe(resultado: ResultadoDePartida): Partida {
  if (!resultado.ok) throw new Error(`Se esperaba una partida y vino el error: ${resultado.error}`);
  return resultado.partida;
}

export interface Situacion {
  jugadores: string[];
  paises: Record<string, NombreDePais[]>;
  ejercitos?: Partial<Record<NombreDePais, number>>;
  resto: string;
  numero: number;
  abrio: string;
  enTurno: string;
  dados?: number[];
  primerasTarjetas?: NombreDePais[];
  tarjetas?: Record<string, NombreDePais[]>;
  canjes?: Record<string, number>;
  mazo?: NombreDePais[];
  descarte?: NombreDePais[];
  objetivos?: Record<string, ObjetivoAsignado>;
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
 * - `primerasTarjetas`: las tarjetas con que empieza el mazo, y las que deja primeras cada mezcla (ver `fuenteFija`).
 * - `tarjetas` y `canjes`: las tarjetas que tiene cada jugador y cuántos canjes hizo. Las tarjetas
 *   que se reparten así salen del mazo.
 * - `mazo` y `descarte`: si se dan, el mazo y el descarte exactos.
 * - `objetivos`: el objetivo secreto de cada jugador. Si se dan, se juega con objetivos secretos y los
 *   jugadores que no se nombran no tienen ninguno. Si no, se juega solo con el objetivo común.
 */
export function partidaEnRondaDeAtaque(situacion: Situacion): Partida {
  return partidaEnRonda({ ...situacion, tipo: "ataque" });
}

/**
 * Una partida a mitad de una ronda de incorporación que no es inicial, como `partidaEnRondaDeAtaque`.
 * `porIncorporar` son los ejércitos generales que le quedan por poner al jugador en turno.
 */
export function partidaEnRondaDeIncorporacion(situacion: Situacion & { porIncorporar?: number }): Partida {
  return partidaEnRonda({ ...situacion, tipo: "incorporacion" });
}

function partidaEnRonda({
  jugadores,
  paises,
  ejercitos = {},
  resto,
  numero,
  abrio,
  enTurno,
  dados,
  primerasTarjetas,
  tarjetas = {},
  canjes = {},
  mazo,
  descarte,
  objetivos,
  tipo,
  porIncorporar = 0,
}: Situacion & { tipo: "ataque" | "incorporacion"; porIncorporar?: number }): Partida {
  const datos = jugadores.map((nombre, i) => ({ nombre, color: COLORES[i]! }));
  const posicionDe = (nombre: string) => {
    const posicion = jugadores.indexOf(nombre);
    if (posicion === -1) throw new Error(`${nombre} no está entre los jugadores.`);
    return posicion;
  };
  const colorDe = (nombre: string) => datos[posicionDe(nombre)]!.color;
  const modo = objetivos ? "objetivosSecretos" : "objetivoComun";
  const estado = partidaDe(crearPartida(datos, fuenteFija({ primerasTarjetas }), { modo })).estado();
  estado.objetivos = {};
  for (const [nombre, objetivo] of Object.entries(objetivos ?? {})) estado.objetivos[colorDe(nombre)] = objetivo;
  for (const pais of PAISES) estado.paises[pais.nombre] = { ocupante: colorDe(resto), ejercitos: 1 };
  for (const [nombre, suyos] of Object.entries(paises)) {
    for (const pais of suyos) estado.paises[pais] = { ocupante: colorDe(nombre), ejercitos: 1 };
  }
  for (const [pais, cantidad] of Object.entries(ejercitos) as [NombreDePais, number][]) {
    estado.paises[pais].ejercitos = cantidad;
  }
  for (const [nombre, suyas] of Object.entries(tarjetas)) {
    estado.tarjetas[colorDe(nombre)] = suyas;
    estado.mazo = estado.mazo.filter((tarjeta) => !suyas.includes(tarjeta));
  }
  for (const [nombre, cantidad] of Object.entries(canjes)) estado.canjes[colorDe(nombre)] = cantidad;
  if (mazo) estado.mazo = mazo;
  if (descarte) estado.descarte = descarte;
  return partidaDe(
    restaurarPartida(
      {
        ...estado,
        ronda: { tipo, inicial: false, numero },
        abrioLaRonda: posicionDe(abrio),
        turno: posicionDe(enTurno),
        ejercitosPorIncorporar: { generales: porIncorporar, porContinente: {} },
      },
      fuenteFija({ dados, primerasTarjetas }),
    ),
  );
}
