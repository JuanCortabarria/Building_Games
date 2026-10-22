import type { KeyboardEvent } from "react";
import imagenDelTablero from "../../docs/reference/teg-tablero.webp";
import type { NombreDePais } from "../motor/mapa";
import type { Color, PaisEnJuego, Partida } from "../motor/partida";
import { ESTILO_DE_COLOR } from "./colores";
import { ALTO_DEL_TABLERO, ANCHO_DEL_TABLERO, POSICION_DE_LA_FICHA, RADIO_DE_LA_FICHA } from "./fichas-del-tablero";

type Marca = "seleccionado" | "atacable" | "destino" | "destino-posible";

const DETALLE_DE_LA_MARCA: Record<Marca, string> = {
  seleccionado: ", elegido como origen",
  atacable: ", se puede atacar",
  destino: ", elegido como destino",
  "destino-posible": ", se puede reagrupar hacia él",
};

/**
 * El tablero ilustrado con una ficha por país, del color de su ocupante y con sus ejércitos.
 * Se elige un país tocando su ficha.
 */
export function TableroIlustrado({
  partida,
  nombreDe,
  seleccionado = null,
  modo = "atacar",
  destino = null,
  alElegirPais,
}: {
  partida: Partida;
  nombreDe: (color: Color) => string;
  /**
   * El país elegido como origen. Al atacar se marcan también sus limítrofes de otros jugadores;
   * al reagrupar, los países propios a los que se puede reagrupar desde él.
   */
  seleccionado?: NombreDePais | null;
  modo?: "atacar" | "reagrupar";
  /** Al reagrupar, el país elegido como destino. */
  destino?: NombreDePais | null;
  alElegirPais: (pais: NombreDePais) => void;
}) {
  const paises = partida.paises();
  const porNombre = new Map(paises.map((pais) => [pais.nombre, pais]));
  const ocupanteDelSeleccionado = seleccionado && porNombre.get(seleccionado)!.ocupante;
  const atacables =
    seleccionado && modo === "atacar"
      ? partida.limitrofesDe(seleccionado).filter((pais) => porNombre.get(pais)!.ocupante !== ocupanteDelSeleccionado)
      : [];
  const destinosPosibles = seleccionado && modo === "reagrupar" ? partida.destinosDeReagrupe(seleccionado) : [];
  const marcaDe = (pais: NombreDePais): Marca | null =>
    pais === seleccionado
      ? "seleccionado"
      : pais === destino
        ? "destino"
        : atacables.includes(pais)
          ? "atacable"
          : destinosPosibles.includes(pais)
            ? "destino-posible"
            : null;

  return (
    <svg
      className={seleccionado ? "tablero con-origen" : "tablero"}
      viewBox={`0 0 ${ANCHO_DEL_TABLERO} ${ALTO_DEL_TABLERO}`}
      role="group"
      aria-label="Mapa"
    >
      <defs>
        {/* Un brillo arriba a la izquierda, para que la ficha parezca de plástico. */}
        <radialGradient id="brillo-de-ficha" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.55} />
          <stop offset="45%" stopColor="#fff" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.25} />
        </radialGradient>
      </defs>
      <image href={imagenDelTablero} width={ANCHO_DEL_TABLERO} height={ALTO_DEL_TABLERO} />
      {paises.map((pais) => (
        <Ficha
          key={pais.nombre}
          pais={pais}
          marca={marcaDe(pais.nombre)}
          nombreDe={nombreDe}
          alElegir={() => alElegirPais(pais.nombre)}
        />
      ))}
    </svg>
  );
}

function Ficha({
  pais,
  marca,
  nombreDe,
  alElegir,
}: {
  pais: PaisEnJuego;
  marca: Marca | null;
  nombreDe: (color: Color) => string;
  alElegir: () => void;
}) {
  const { x, y } = POSICION_DE_LA_FICHA[pais.nombre];
  const { fondo, texto } = ESTILO_DE_COLOR[pais.ocupante];
  const r = RADIO_DE_LA_FICHA;
  const detalle = marca ? DETALLE_DE_LA_MARCA[marca] : "";
  const ejercitos = `${pais.ejercitos} ejército${pais.ejercitos === 1 ? "" : "s"}`;
  const descripcion = `${pais.nombre}: ${nombreDe(pais.ocupante)} (${pais.ocupante}), ${ejercitos}${detalle}`;
  const alApretarTecla = (evento: KeyboardEvent) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      alElegir();
    }
  };
  return (
    <g
      className={marca ? `ficha ${marca}` : "ficha"}
      transform={`translate(${x} ${y})`}
      role="button"
      tabIndex={0}
      aria-label={descripcion}
      onClick={alElegir}
      onKeyDown={alApretarTecla}
    >
      <title>{descripcion}</title>
      {/* El anillo va pegado a la ficha, debajo de ella, para no tapar el nombre del país. */}
      {marca && (
        <g className="anillo">
          <circle r={r + 2} className="anillo-fondo" />
          <circle r={r + 2} className="anillo-color" />
        </g>
      )}
      {/* Cambia de clave cuando cambia el ocupante o los ejércitos, así la ficha late al cambiar. */}
      <g key={`${pais.ocupante}-${pais.ejercitos}`} className="cuerpo">
        <ellipse cx={2} cy={r * 0.75} rx={r * 0.95} ry={r * 0.4} className="sombra" />
        <circle r={r} className="borde" />
        <circle r={r - 2} fill={fondo} stroke="#fff" strokeWidth={2.5} />
        <circle r={r - 2} fill="url(#brillo-de-ficha)" />
        <text dy="0.36em" fill={texto} className="numero">
          {pais.ejercitos}
        </text>
      </g>
    </g>
  );
}
