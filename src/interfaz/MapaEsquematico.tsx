import type { KeyboardEvent } from "react";
import type { NombreDeContinente, NombreDePais } from "../motor/mapa";
import type { Color, PaisEnJuego, Partida } from "../motor/partida";
import { ESTILO_DE_COLOR } from "./colores";
import {
  ALTO_DEL_MAPA,
  ALTO_DEL_PAIS,
  ANCHO_DEL_MAPA,
  ANCHO_DEL_PAIS,
  MARGEN_DEL_CONTINENTE,
  POSICION_DEL_NOMBRE_DEL_CONTINENTE,
  POSICION_DEL_PAIS,
  danLaVuelta,
} from "./disposicion-del-mapa";

// Tonos pálidos para que la mancha de un continente no se confunda con el color de un ocupante.
const COLOR_DEL_CONTINENTE: Record<NombreDeContinente, { mancha: string; nombre: string }> = {
  "América del Norte": { mancha: "#f1e2b8", nombre: "#7a5f14" },
  "América del Sur": { mancha: "#d7e8c6", nombre: "#3f6a22" },
  Europa: { mancha: "#d3e1f1", nombre: "#2f5682" },
  África: { mancha: "#f0d9bd", nombre: "#7d4f1c" },
  Asia: { mancha: "#f4cfc6", nombre: "#97382a" },
  Oceanía: { mancha: "#e2d4ef", nombre: "#5f3f86" },
};

type Limite = readonly [PaisEnJuego, PaisEnJuego];

export function MapaEsquematico({
  partida,
  nombreDe,
  alElegirPais,
}: {
  partida: Partida;
  nombreDe: (color: Color) => string;
  alElegirPais: (pais: NombreDePais) => void;
}) {
  const paises = partida.paises();
  const porNombre = new Map(paises.map((pais) => [pais.nombre, pais]));
  // Cada par limítrofe una sola vez: se anota desde el país cuyo nombre se ordena primero.
  const limites: Limite[] = paises.flatMap((pais) =>
    partida
      .limitrofesDe(pais.nombre)
      .filter((otro) => pais.nombre < otro)
      .map((otro): Limite => [pais, porNombre.get(otro)!]),
  );

  return (
    <svg className="mapa" viewBox={`0 0 ${ANCHO_DEL_MAPA} ${ALTO_DEL_MAPA}`} role="group" aria-label="Mapa">
      {partida.continentes().map((continente) => (
        <Mancha
          key={continente.nombre}
          continente={continente.nombre}
          paises={paises.filter((pais) => pais.continente === continente.nombre)}
          limites={limites.filter(([a, b]) => a.continente === continente.nombre && b.continente === continente.nombre)}
        />
      ))}
      {partida.continentes().map((continente) => (
        <text
          key={continente.nombre}
          className="nombre-de-continente"
          {...POSICION_DEL_NOMBRE_DEL_CONTINENTE[continente.nombre]}
          fill={COLOR_DEL_CONTINENTE[continente.nombre].nombre}
        >
          {continente.nombre} (+{continente.ejercitosExtra})
        </text>
      ))}
      <g>
        {limites.map(([a, b]) => (
          <LineaLimitrofe key={`${a.nombre}-${b.nombre}`} a={a} b={b} />
        ))}
      </g>
      {paises.map((pais) => (
        <RecuadroDePais key={pais.nombre} pais={pais} nombreDe={nombreDe} alElegir={() => alElegirPais(pais.nombre)} />
      ))}
    </svg>
  );
}

/**
 * El fondo de un continente: los recuadros de sus países agrandados, unidos por bandas a lo largo de sus límites
 * internos, y con los huecos entre bandas rellenos por los triángulos que forma cada país con dos de sus limítrofes.
 */
function Mancha({ continente, paises, limites }: { continente: NombreDeContinente; paises: PaisEnJuego[]; limites: Limite[] }) {
  const color = COLOR_DEL_CONTINENTE[continente].mancha;
  const ancho = ANCHO_DEL_PAIS + 2 * MARGEN_DEL_CONTINENTE;
  const alto = ALTO_DEL_PAIS + 2 * MARGEN_DEL_CONTINENTE;
  const triangulos = paises.flatMap((pais) => {
    const vecinos = limites.flatMap(([a, b]) => (a === pais ? [b] : b === pais ? [a] : []));
    return vecinos.flatMap((b, i) => vecinos.slice(i + 1).map((c) => [pais, b, c]));
  });
  return (
    <g fill={color} stroke={color} strokeWidth={alto} strokeLinecap="round">
      {triangulos.map((vertices) => (
        <polygon
          key={vertices.map((pais) => pais.nombre).join("-")}
          points={vertices.map(({ nombre }) => `${POSICION_DEL_PAIS[nombre].x},${POSICION_DEL_PAIS[nombre].y}`).join(" ")}
          stroke="none"
        />
      ))}
      {limites.map(([a, b]) => {
        const desde = POSICION_DEL_PAIS[a.nombre];
        const hasta = POSICION_DEL_PAIS[b.nombre];
        return <line key={`${a.nombre}-${b.nombre}`} x1={desde.x} y1={desde.y} x2={hasta.x} y2={hasta.y} />;
      })}
      {paises.map((pais) => {
        const { x, y } = POSICION_DEL_PAIS[pais.nombre];
        return (
          <rect key={pais.nombre} x={x - ancho / 2} y={y - alto / 2} width={ancho} height={alto} rx={alto / 2} stroke="none" />
        );
      })}
    </g>
  );
}

function LineaLimitrofe({ a, b }: { a: PaisEnJuego; b: PaisEnJuego }) {
  const clase = a.continente === b.continente ? "limite" : "limite entre-continentes";
  const desde = POSICION_DEL_PAIS[a.nombre];
  const hasta = POSICION_DEL_PAIS[b.nombre];
  if (!danLaVuelta(a.nombre, b.nombre)) {
    return <line className={clase} x1={desde.x} y1={desde.y} x2={hasta.x} y2={hasta.y} />;
  }
  // El límite da la vuelta al mundo: cada extremo sale hacia su borde del mapa, rotulado (arriba del
  // recuadro, para que no lo tape) con el país del otro lado.
  const [izquierdo, derecho] = desde.x < hasta.x ? [a, b] : [b, a];
  const pi = POSICION_DEL_PAIS[izquierdo.nombre];
  const pd = POSICION_DEL_PAIS[derecho.nombre];
  const arribaDelRecuadro = ALTO_DEL_PAIS / 2 + 6;
  return (
    <g>
      <path className={clase} d={`M 0 ${pi.y} H ${pi.x} M ${pd.x} ${pd.y} H ${ANCHO_DEL_MAPA}`} />
      <text className="rotulo-de-borde" x={4} y={pi.y - arribaDelRecuadro}>
        ← {derecho.nombre}
      </text>
      <text className="rotulo-de-borde" x={ANCHO_DEL_MAPA - 4} y={pd.y - arribaDelRecuadro} textAnchor="end">
        {izquierdo.nombre} →
      </text>
    </g>
  );
}

function RecuadroDePais({
  pais,
  nombreDe,
  alElegir,
}: {
  pais: PaisEnJuego;
  nombreDe: (color: Color) => string;
  alElegir: () => void;
}) {
  const { x, y } = POSICION_DEL_PAIS[pais.nombre];
  const estilo = ESTILO_DE_COLOR[pais.ocupante];
  const descripcion = `${pais.nombre}: ${nombreDe(pais.ocupante)} (${pais.ocupante}), ${pais.ejercitos} ejército(s)`;
  const alApretarTecla = (evento: KeyboardEvent) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      alElegir();
    }
  };
  return (
    <g
      className="pais-del-mapa"
      transform={`translate(${x} ${y})`}
      role="button"
      tabIndex={0}
      aria-label={descripcion}
      onClick={alElegir}
      onKeyDown={alApretarTecla}
    >
      <title>{descripcion}</title>
      <rect
        x={-ANCHO_DEL_PAIS / 2}
        y={-ALTO_DEL_PAIS / 2}
        width={ANCHO_DEL_PAIS}
        height={ALTO_DEL_PAIS}
        rx={6}
        fill={estilo.fondo}
      />
      <text textAnchor="middle" y={-5} fill={estilo.texto} className="nombre-de-pais">
        {pais.nombre}
      </text>
      <text textAnchor="middle" y={15} fill={estilo.texto} className="ejercitos-de-pais">
        {pais.ejercitos}
      </text>
    </g>
  );
}
