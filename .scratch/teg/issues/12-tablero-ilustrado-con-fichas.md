# 12: Tablero ilustrado con fichas

**What to build:** reemplazar el mapa esquemático (`src/interfaz/MapaEsquematico.tsx`) por el tablero ilustrado (`docs/reference/teg-tablero.webp`) con una ficha por país, como la variante B del prototipo (rama `prototype/mapa-ilustrado`, `src/interfaz/prototipo-mapa-ilustrado/`). Cada ficha tiene el color del ocupante y sus ejércitos; se elige un país tocando su ficha. El componente nuevo recibe lo mismo que el mapa actual (partida, nombreDe, seleccionado, modo, destino, alElegirPais), así que la pantalla de partida no cambia. El código del prototipo es una referencia, no se copia tal cual: no tiene tests y fue escrito para tirarse.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Se ve el tablero ilustrado con 50 fichas, una por país, cada una con el color de su ocupante y su cantidad de ejércitos.
- [x] Las fichas no tapan el nombre de su país (en el prototipo tapaban Brasil, Terranova y Gran Bretaña): las posiciones se acomodan a mano, en un archivo de datos de la interfaz.
- [x] Tocar una ficha (o Enter/Espacio con el foco en ella) tiene el mismo efecto que hoy elegir un país en el mapa.
- [x] El origen elegido y los países atacables, de destino posible y de destino se marcan con un anillo en la ficha, con los mismos datos que usa el mapa actual.
- [x] El tablero entra en una pantalla de 1280×720 sin desplazamiento horizontal.
- [x] La pantalla no contiene reglas: qué se puede atacar o hacia dónde reagrupar sale de las consultas del motor.
- [x] Se borran el mapa esquemático y su disposición (`MapaEsquematico.tsx`, `disposicion-del-mapa.ts`) cuando dejan de usarse.

## Comments

**2026-10-21, tablero nuevo:** el usuario rehízo el tablero y `docs/reference/teg-tablero.webp` ya es la versión nueva (1516×1038). Tiene los mismos 50 países, pero algunos están en otro lugar (por ejemplo, ahora Gobi está entre Irán y China), así que las posiciones de `puntos.ts` del prototipo ya no sirven. Como punto de partida, el centro aproximado del nombre de cada país en la imagen nueva, en píxeles (x, y), medido al leer el tablero:

Alaska (102, 202), Yukón (233, 173), Canadá (283, 250), Groenlandia (470, 173), Labrador (427, 251), Terranova (469, 305), Oregón (100, 305), Nueva York (351, 326), California (253, 372), México (218, 447), Colombia (333, 566), Perú (307, 640), Brasil (465, 656), Chile (307, 750), Argentina (390, 798), Uruguay (492, 750), Islandia (678, 212), Suecia (845, 234), Rusia (972, 231), Gran Bretaña (712, 305), Alemania (826, 338), Polonia (960, 338), Francia (787, 385), Italia (868, 413), España (706, 424), Sahara (756, 566), Egipto (936, 571), Zaire (800, 645), Etiopía (910, 643), Sudáfrica (845, 695), Madagascar (1010, 711), Tartaria (1119, 188), Taimir (1260, 185), Kamchatka (1434, 237), Siberia (1260, 268), Aral (1103, 295), Mongolia (1243, 331), Irán (1114, 390), Gobi (1208, 395), China (1301, 420), Turquía (1000, 408), Israel (1008, 468), Arabia (1094, 480), India (1186, 513), Japón (1452, 404), Malasia (1332, 585), Sumatra (1243, 683), Borneo (1388, 676), Australia (1339, 800), Java (1325, 892).

Las fichas no tienen que ir justo ahí: no deben tapar el nombre.

**2026-10-21, construido** (rama `claude/teg-12-tablero-y-09-aviso-093430`):

- El tablero es `src/interfaz/TableroIlustrado.tsx`, con las mismas props que tenía `MapaEsquematico`. Es un solo SVG con la imagen (importada desde `docs/reference/teg-tablero.webp`, así hay una sola copia) y una ficha por país encima: el color del ocupante, sus ejércitos, un borde oscuro y un brillo. Al cambiar el ocupante o los ejércitos, la ficha "late".
- Las posiciones están a mano en `src/interfaz/fichas-del-tablero.ts`. Se midió con un script descartable dónde está cada nombre en la imagen y se puso la ficha al lado, casi siempre abajo; después se miraron los 50 países ampliados en el navegador. Ninguna ficha tapa su nombre ni el de otro país (la distancia mínima del centro de una ficha a un nombre es igual a su radio, 20 px de la imagen). En los países chicos la ficha se asoma al mar, del lado donde no hay otro país: Islandia (abajo a la izquierda), Labrador (arriba del nombre), Terranova (en la punta este), Madagascar (abajo), Sumatra (arriba), Java (a la izquierda). Groenlandia va arriba de su nombre, Polonia a la derecha y Turquía a la izquierda, para no quedar pegadas a la ficha de un vecino.
- Marcas: el origen lleva un anillo blanco que late, los atacables uno amarillo punteado que gira, los destinos posibles uno verde punteado y el destino uno verde lleno. Cada anillo tiene un fondo oscuro y un halo de su color, para verse sobre cualquier parte del tablero. Los anillos van pegados a la ficha para no tapar nombres; con un origen elegido, las fichas sin marca se apagan un poco. Las animaciones se cortan con `prefers-reduced-motion`.
- Qué se marca sale igual que antes: `limitrofesDe` filtrado por otro ocupante para atacar, y `destinosDeReagrupe` para reagrupar. No se agregó una consulta `atacablesDesde` al motor porque en paralelo otra sesión cambia `partida.ts`; queda como posible mejora.
- Tamaño: el ancho sale de lo que entra en la altura de la pantalla debajo de la barra (y del ancho de la ventana). En 1280×720 el tablero mide 830×568 y entra entero con la barra fija; en 1920×1080, 1355×928. Sin desplazamiento horizontal en los dos.
- Probado jugando en el navegador: rondas iniciales (con clic y con Enter/Espacio), ataque, conquista y paso de ejércitos, reagrupar, y una ronda de incorporación con extra.

