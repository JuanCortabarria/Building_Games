# Los límites salen del tablero propio, no del TEG clásico

Los límites del juego son los que dibuja el tablero propio ([`docs/reference/teg-tablero.webp`](../reference/teg-tablero.webp)), listados en [`docs/reference/tablero-limites.md`](../reference/tablero-limites.md): 97 pares. Los países, los continentes y sus ejércitos extra siguen siendo los del TEG clásico. Se descartó seguir con los 89 pares del clásico (`teg-limites.md`) y dibujar encima de la imagen las conexiones que no coincidían (tickets 10 y 13), porque el usuario rehízo el tablero con sus propias conexiones y quiere jugar en ese mapa: lo que se ve es lo que vale.

**Consecuencia:** donde el dibujo es ambiguo (países que se tocan en un solo punto, un río, una ruta punteada que se bifurca), decide el TEG clásico. Si el tablero cambia, se vuelve a leer y se actualizan juntos la imagen, `tablero-limites.md`, `src/motor/mapa.ts` y su test.
