# 02: Mapa esquemático

**What to build:** reemplazar la lista de países por un mapa esquemático generado a partir de los datos del mapa. Cada país es un recuadro con su nombre, el color de su ocupante y su cantidad de ejércitos; los recuadros se agrupan por continente y hay líneas entre los países limítrofes, incluidos los que cruzan el mar (como Kamchatka y Alaska, o Brasil y Sahara). No se usa la imagen del tablero. Antes de construirlo conviene responder con `/prototype` (variante de interfaz) cómo debería verse.

**Blocked by:** 01 (Crear una partida)

**Status:** ready-for-agent

- [ ] Se ven los 50 países, agrupados en sus 6 continentes.
- [ ] Cada país muestra su nombre, el color de su ocupante y su cantidad de ejércitos, y se actualiza cuando cambia el estado de la partida.
- [ ] Se ven las 89 líneas entre países limítrofes, incluidas las 15 que cruzan de continente.
- [ ] Elegir un país en el mapa tiene el mismo efecto que elegirlo en la lista que reemplaza: toda acción que ya se podía hacer sobre un país se puede hacer desde el mapa.
- [ ] El mapa se lee en una pantalla de computadora sin tener que desplazarse para ver todos los continentes.

## Comments

**2026-10-20, decisiones de diseño que el ticket no resolvía:**

- **No se corrió `/prototype`.** El ticket lo sugería, pero esta vez se pidió implementarlo directo. Si el resultado no convence, el prototipo se puede hacer igual sobre esta versión.
- **Las posiciones están a mano, en `src/interfaz/disposicion-del-mapa.ts`.** Siguen a grandes rasgos el tablero, corridas para que ningún par de recuadros se toque, ninguna línea pase por debajo de un país que no es uno de sus extremos y las manchas de dos continentes no se pisen. Eso se comprobó con un script descartable, no con tests (la spec no testea la interfaz). Si se mueve un país, hay que volver a mirarlo en pantalla.
- **Cada continente es una mancha, no un rectángulo.** Asia tiene a Turquía e Israel pegados a Europa y África, así que un rectángulo o una envolvente convexa por continente se superponían. La mancha son los recuadros agrandados, unidos por bandas a lo largo de los límites internos y rellenos con triángulos. El nombre del continente y sus ejércitos extra van en un rótulo al lado.
- **Alaska–Kamchatka y Chile–Australia dan la vuelta al mundo.** En vez de una línea que cruce todo el mapa, cada extremo sale hacia su borde, con el nombre del país del otro lado. Cada par sigue siendo una sola línea de las 89.
- **Las 15 líneas entre continentes van punteadas**, como las rutas marítimas del tablero.
- **El mapa es más ancho que el resto de la página** (hasta 1520 px) y su alto no pasa el de la pantalla, así que entra entero sin desplazarse: se probó en 1440×900 y en 1280×720.
- **Cada país es un botón del SVG** (`role="button"`, con foco por teclado y Enter o Espacio). Al elegirlo hace lo mismo que el botón de la lista que reemplaza: `incorporar` 1 ejército, y si el motor da un error se muestra en el panel de turno.

**Pendiente para el panel de turno (ticket 05 o después):** con el mapa a la vista, el panel de turno queda arriba, fuera de la pantalla, y con él el mensaje de error. Conviene poner el panel al lado del mapa o dejarlo fijo arriba.
