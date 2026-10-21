# 10: Mapa ilustrado a partir de la imagen del tablero

**What to build:** reemplazar el mapa esquemático por un mapa ilustrado basado en la imagen del tablero (`docs/reference/teg-tablero.webp`), separado en sus 50 países. Cada país se puede elegir y muestra el color de su ocupante y sus ejércitos, como hoy. El usuario quiere un mapa "mucho más atractivo y más visual" que el esquema actual.

**Blocked by:** None, pero hay que responder primero con `/prototype` (variante de interfaz) cómo se separa la imagen en países.

**Status:** needs-triage

- [ ] (a definir después del prototipo)

## Comments

**2026-10-20, pedido del usuario** después de cerrar la v1: el mapa esquemático es "muy simple"; el que quiere usar es la imagen del tablero, separada en países "para poder crearle fichas".

Esto cambia decisiones de la spec, que hay que actualizar cuando se resuelva el prototipo:
- "Out of Scope" lista "El mapa ilustrado a partir de la imagen del tablero".
- "Mapa en pantalla" dice "No se usa la imagen del tablero".

Lo que no cambia: los límites siguen saliendo de `docs/reference/teg-limites.md`, no de la imagen. `docs/reference/README.md` anota que la imagen no coincide con el TEG clásico (por ejemplo, dibuja a Tartaria pegada a Rusia, y no son limítrofes), y que tiene regiones sin nombre que son decoración.

Preguntas para el prototipo:
- Cómo se dibuja cada país: contornos trazados sobre la imagen (por ejemplo, polígonos SVG encima de la imagen), un mapa redibujado en SVG inspirado en el tablero, o una combinación.
- Dónde van el color del ocupante y los ejércitos de cada país (un tinte sobre el país, una ficha encima, o las dos cosas), y cómo se marcan el origen y los países atacables.
- Cómo se ven los límites que cruzan el mar (como Kamchatka y Alaska), que en el esquema actual son líneas.
- La imagen viene de un juego comercial: para la aplicación local está bien, pero si alguna vez se publica (hoy está fuera del alcance) habría que revisar si se puede usar.

**2026-10-21, veredicto del prototipo** (rama `prototype/mapa-ilustrado`, commit `3f47a6e`; se ve con `npm run dev` y `?variant=A|B|C|actual`):

- **El usuario eligió la variante B, "Fichas sobre el tablero":** el tablero queda intacto y cada país tiene una ficha del color de su ocupante con sus ejércitos; se elige un país tocando su ficha, y el origen y los atacables o destinos se marcan con un anillo. Se descartaron A (países teñidos con el color del ocupante) y C (banderines chicos y un panel lateral).
- **Arreglo visto en el prototipo:** algunas fichas tapan parte del nombre del país (Brasil, Terranova, Gran Bretaña). Las posiciones de las fichas salen del centro del nombre medido a ojo (`puntos.ts` en la rama del prototipo) y hay que acomodarlas.
- **Lo que no hace falta para B:** la separación automática de la imagen en países (`regiones.ts` del prototipo) solo la usaban A y C. Con fichas alcanza un punto por país. Igual sirvió para comparar la imagen con los límites (ver abajo).
- **Problema encontrado: la imagen no coincide con los límites del juego.** Con la separación del prototipo se comparó qué países se tocan en la imagen contra los 89 pares de `docs/reference/teg-limites.md`. Hay 24 pares limítrofes que no se tocan en la imagen (varios son rutas por mar, como Alaska–Kamchatka o Brasil–Sahara, y otros son de tierra, como Rusia–Turquía o Irán–Rusia) y unos 30 pares que se ven pegados o muy cerca y no son limítrofes (como Rusia–Tartaria, Aral–Turquía o Italia–Polonia; algunos son solo cercanía a través del agua, como Francia–Gran Bretaña). El usuario lo notó al jugar: "el mapa está mal: la comunicación de los países". Hay que decidir cuál manda antes de dividir este ticket.
