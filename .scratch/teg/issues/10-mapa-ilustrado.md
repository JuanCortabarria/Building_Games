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
