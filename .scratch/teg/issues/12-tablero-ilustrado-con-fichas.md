# 12: Tablero ilustrado con fichas

**What to build:** reemplazar el mapa esquemático (`src/interfaz/MapaEsquematico.tsx`) por el tablero ilustrado (`docs/reference/teg-tablero.webp`) con una ficha por país, como la variante B del prototipo (rama `prototype/mapa-ilustrado`, `src/interfaz/prototipo-mapa-ilustrado/`). Cada ficha tiene el color del ocupante y sus ejércitos; se elige un país tocando su ficha. El componente nuevo recibe lo mismo que el mapa actual (partida, nombreDe, seleccionado, modo, destino, alElegirPais), así que la pantalla de partida no cambia. El código del prototipo es una referencia, no se copia tal cual: no tiene tests y fue escrito para tirarse.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Se ve el tablero ilustrado con 50 fichas, una por país, cada una con el color de su ocupante y su cantidad de ejércitos.
- [ ] Las fichas no tapan el nombre de su país (en el prototipo tapaban Brasil, Terranova y Gran Bretaña): las posiciones se acomodan a mano, en un archivo de datos de la interfaz.
- [ ] Tocar una ficha (o Enter/Espacio con el foco en ella) tiene el mismo efecto que hoy elegir un país en el mapa.
- [ ] El origen elegido y los países atacables, de destino posible y de destino se marcan con un anillo en la ficha, con los mismos datos que usa el mapa actual.
- [ ] El tablero entra en una pantalla de 1280×720 sin desplazamiento horizontal.
- [ ] La pantalla no contiene reglas: qué se puede atacar o hacia dónde reagrupar sale de las consultas del motor.
- [ ] Se borran el mapa esquemático y su disposición (`MapaEsquematico.tsx`, `disposicion-del-mapa.ts`) cuando dejan de usarse.
