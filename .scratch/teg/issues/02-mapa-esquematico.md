# 02: Mapa esquemático

**What to build:** reemplazar la lista de países por un mapa esquemático generado a partir de los datos del mapa. Cada país es un recuadro con su nombre, el color de su ocupante y su cantidad de ejércitos; los recuadros se agrupan por continente y hay líneas entre los países limítrofes, incluidos los que cruzan el mar (como Kamchatka y Alaska, o Brasil y Sahara). No se usa la imagen del tablero. Antes de construirlo conviene responder con `/prototype` (variante de interfaz) cómo debería verse.

**Blocked by:** 01 (Crear una partida)

**Status:** ready-for-agent

- [ ] Se ven los 50 países, agrupados en sus 6 continentes.
- [ ] Cada país muestra su nombre, el color de su ocupante y su cantidad de ejércitos, y se actualiza cuando cambia el estado de la partida.
- [ ] Se ven las 89 líneas entre países limítrofes, incluidas las 15 que cruzan de continente.
- [ ] Elegir un país en el mapa tiene el mismo efecto que elegirlo en la lista que reemplaza: toda acción que ya se podía hacer sobre un país se puede hacer desde el mapa.
- [ ] El mapa se lee en una pantalla de computadora sin tener que desplazarse para ver todos los continentes.
