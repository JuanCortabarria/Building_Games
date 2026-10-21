# 13: Rutas por agua y líneas al elegir un país

**What to build:** sobre el tablero ilustrado del ticket 12, dibujar siempre las 22 fronteras por agua como líneas punteadas entre fichas (por ejemplo Alaska–Kamchatka o Brasil–Sahara, que la imagen no une), y al elegir un país dibujar líneas desde su ficha hacia todos sus limítrofes. Así la imagen, que dibuja algunos límites distinto del TEG clásico (ver los comentarios del ticket 10), no confunde: la verdad aparece cuando hace falta.

**Blocked by:** 12 (Tablero ilustrado con fichas)

**Status:** wontfix

- [ ] Los datos del mapa en el motor saben de qué tipo es cada frontera (tierra o agua), según `docs/reference/teg-limites.md`: 67 por tierra y 22 por agua. Una consulta del motor lo expone, y un test lo verifica (por ejemplo, Alaska–Kamchatka es por agua y Argentina–Brasil por tierra).
- [ ] Las 22 rutas por agua se ven siempre como líneas punteadas entre las fichas. Las que cruzan el borde del tablero (Alaska–Kamchatka, Chile–Australia) salen hacia su borde con el nombre del país del otro lado, como en el mapa esquemático.
- [ ] Al elegir un país como origen, salen líneas desde su ficha hacia todos sus limítrofes, incluidas las fronteras por tierra que la imagen no dibuja (como Rusia–Turquía).
- [ ] Las líneas no tapan las fichas ni impiden tocarlas.

## Comments

**2026-10-21, tablero nuevo:** este ticket existía porque la imagen no coincidía con los límites del TEG clásico. El usuario rehízo el tablero y ahora sus conexiones son los límites del juego (`docs/reference/tablero-limites.md`, ADR 0001): la imagen ya dibuja todas las fronteras y las 26 rutas punteadas, y la división en tierra o agua del clásico ya no aplica. Hay que decidir si se cierra (wontfix) o si se mantiene solo "líneas al elegir un país", por ejemplo para los límites que se tocan en un punto (Oregón–Yukón, Sahara–Etiopía, China–Kamchatka).

**2026-10-21, cerrado:** el usuario pidió avanzar sin más preguntas. Se cierra: el tablero nuevo dibuja todas sus conexiones, y el ticket 12 ya marca con un anillo los países atacables y de destino al elegir un origen, que cubre lo que daban las líneas.
