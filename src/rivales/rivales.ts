import type { NombreDeContinente, NombreDePais } from "../motor/mapa";
import type { Accion, Color, EjercitosPorIncorporar, PaisEnJuego, Partida } from "../motor/partida";

/**
 * La próxima acción del jugador en turno, si lo maneja la computadora, o nada si la partida ya tiene ganador.
 * Usa solo la interfaz pública del motor, así que la acción elegida siempre la acepta.
 */
export function elegirAccion(partida: Partida): Accion | null {
  if (partida.ganador() !== null) return null;
  const panorama = leerPanorama(partida);
  const conquista = partida.conquistaPendiente();
  if (conquista) return { tipo: "moverAlConquistado", cantidad: cuantosPasan(panorama, conquista) };
  if (partida.ronda().tipo === "incorporacion") {
    return incorporar(panorama, partida.ejercitosPorIncorporar()) ?? { tipo: "pasarTurno" };
  }
  // Después de reagrupar ya no se ataca, así que primero ataca y después reagrupa.
  const ataque = partida.reagrupoEnEsteTurno() ? null : mejorAtaque(panorama);
  return ataque ?? reagrupe(panorama, partida) ?? { tipo: "pasarTurno" };
}

/** Lo que la computadora mira de la partida, leído una vez por decisión. */
interface Panorama {
  color: Color;
  paises: Map<NombreDePais, PaisEnJuego>;
  limitrofes: Map<NombreDePais, readonly NombreDePais[]>;
  /** El continente que el jugador en turno quiere completar, si hay alguno sin completar. */
  objetivo: NombreDeContinente | null;
  /** Los continentes que ocupa entero cada color. */
  completos: Map<NombreDeContinente, Color>;
}

function leerPanorama(partida: Partida): Panorama {
  const { color } = partida.jugadorEnTurno();
  const paises = new Map(partida.paises().map((pais) => [pais.nombre, pais]));
  const limitrofes = new Map([...paises.keys()].map((pais) => [pais, partida.limitrofesDe(pais)]));
  const completos = new Map<NombreDeContinente, Color>();
  let objetivo: NombreDeContinente | null = null;
  let mejorPuntaje = -Infinity;
  for (const continente of partida.continentes()) {
    const suyos = [...paises.values()].filter((pais) => pais.continente === continente.nombre);
    const ocupante = suyos[0]!.ocupante;
    if (suyos.every((pais) => pais.ocupante === ocupante)) completos.set(continente.nombre, ocupante);
    if (ocupante === color && completos.has(continente.nombre)) continue;
    // Conviene el continente que tiene más cerca de completar, y entre parecidos, el que menos ejércitos ajenos tiene.
    const propios = suyos.filter((pais) => pais.ocupante === color).length;
    const ajenos = suyos.filter((pais) => pais.ocupante !== color).reduce((total, pais) => total + pais.ejercitos, 0);
    const puntaje = (2 * propios) / continente.cantidadDePaises + continente.ejercitosExtra / (ajenos + 2);
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      objetivo = continente.nombre;
    }
  }
  return { color, paises, limitrofes, objetivo, completos };
}

function pais(panorama: Panorama, nombre: NombreDePais): PaisEnJuego {
  return panorama.paises.get(nombre)!;
}

function enemigosDe(panorama: Panorama, nombre: NombreDePais): PaisEnJuego[] {
  return panorama.limitrofes
    .get(nombre)!
    .map((limitrofe) => pais(panorama, limitrofe))
    .filter((limitrofe) => limitrofe.ocupante !== panorama.color);
}

/** Un país de frontera tiene al menos un enemigo limítrofe; los demás son interiores. */
function esFrontera(panorama: Panorama, nombre: NombreDePais): boolean {
  return enemigosDe(panorama, nombre).length > 0;
}

function propios(panorama: Panorama): PaisEnJuego[] {
  return [...panorama.paises.values()].filter((enJuego) => enJuego.ocupante === panorama.color);
}

/**
 * Pone ejércitos donde más hacen falta. Los extra de un continente van primero, a ese continente.
 * Reparte de a uno, cada vez en el país más urgente, y aplica de una vez lo que le tocó al que más recibió.
 */
function incorporar(panorama: Panorama, { generales, porContinente }: EjercitosPorIncorporar): Accion | null {
  const extra = (Object.entries(porContinente) as [NombreDeContinente, number][]).find(([, cantidad]) => cantidad > 0);
  const [candidatos, cantidad] = extra
    ? [propios(panorama).filter((enJuego) => enJuego.continente === extra[0]), extra[1]]
    : [propios(panorama), generales];
  if (cantidad === 0) return null;
  const agregados = new Map<NombreDePais, number>(candidatos.map((enJuego) => [enJuego.nombre, 0]));
  for (let i = 0; i < cantidad; i++) {
    const elegido = maximo(candidatos, (enJuego) => urgencia(panorama, enJuego, agregados.get(enJuego.nombre)!));
    agregados.set(elegido.nombre, agregados.get(elegido.nombre)! + 1);
  }
  const [masRecibio, recibe] = maximo([...agregados], ([, recibidos]) => recibidos);
  return { tipo: "incorporar", pais: masRecibio, cantidad: recibe };
}

/**
 * Cuánto necesita un país propio un ejército más: tanto más cuanto más lo superan sus enemigos limítrofes,
 * si protege un continente completo o si desde él se avanza sobre el continente que se quiere completar.
 * Un país sin enemigos limítrofes no lo necesita.
 */
function urgencia(panorama: Panorama, enJuego: PaisEnJuego, agregados: number): number {
  const enemigos = enemigosDe(panorama, enJuego.nombre);
  if (enemigos.length === 0) return -1000 - agregados;
  const amenaza = Math.max(...enemigos.map((enemigo) => enemigo.ejercitos));
  let urgencia = amenaza - (enJuego.ejercitos + agregados);
  if (panorama.completos.get(enJuego.continente) === panorama.color) urgencia += 3;
  if (enemigos.some((enemigo) => enemigo.continente === panorama.objetivo)) urgencia += 3;
  return urgencia;
}

/** El ataque más prometedor entre los que tienen ventaja, o nada si no hay ninguno que convenga. */
function mejorAtaque(panorama: Panorama): Accion | null {
  const ataques = propios(panorama).flatMap((desde) =>
    enemigosDe(panorama, desde.nombre)
      .filter((hacia) => desde.ejercitos - 1 > hacia.ejercitos)
      .map((hacia) => ({ desde, hacia })),
  );
  if (ataques.length === 0) return null;
  const { desde, hacia } = maximo(ataques, ({ desde, hacia }) => {
    let puntaje = desde.ejercitos - 1 - hacia.ejercitos;
    if (hacia.continente === panorama.objetivo) puntaje += 2;
    // Romperle un continente a otro le quita los extra.
    if (panorama.completos.has(hacia.continente)) puntaje += 2;
    return puntaje;
  });
  return { tipo: "atacar", desde: desde.nombre, hacia: hacia.nombre };
}

/**
 * Reagrupa los ejércitos del país interior que más tiene hacia la frontera más urgente a la que se llegue.
 * Solo reagrupa desde países interiores hacia países de frontera, así que en algún momento no queda nada por reagrupar.
 */
function reagrupe(panorama: Panorama, partida: Partida): Accion | null {
  const reagrupes = propios(panorama)
    .filter((desde) => desde.ejercitos > 1 && !esFrontera(panorama, desde.nombre))
    .flatMap((desde) => {
      const frontera = partida
        .destinosDeReagrupe(desde.nombre)
        .map((nombre) => pais(panorama, nombre))
        .filter((destino) => esFrontera(panorama, destino.nombre));
      return frontera.length === 0 ? [] : [{ desde, hacia: maximo(frontera, (destino) => urgencia(panorama, destino, 0)) }];
    });
  if (reagrupes.length === 0) return null;
  const { desde, hacia } = maximo(reagrupes, ({ desde }) => desde.ejercitos);
  return { tipo: "reagrupar", desde: desde.nombre, hacia: hacia.nombre, cantidad: desde.ejercitos - 1 };
}

/**
 * Cuántos ejércitos pasan al país recién conquistado: todos los que se pueda, salvo que el conquistado
 * no tenga enemigos limítrofes, porque ahí no sirven.
 */
function cuantosPasan(panorama: Panorama, conquista: { hacia: NombreDePais; maximo: number }): number {
  return esFrontera(panorama, conquista.hacia) ? conquista.maximo : 1;
}

/** El elemento de mayor valor; ante un empate, el primero. La lista no puede estar vacía. */
function maximo<T>(lista: readonly T[], valor: (elemento: T) => number): T {
  let mejor: T = lista[0] as T;
  let mejorValor = valor(mejor);
  for (const elemento of lista.slice(1)) {
    const v = valor(elemento);
    if (v > mejorValor) {
      mejor = elemento;
      mejorValor = v;
    }
  }
  return mejor;
}
