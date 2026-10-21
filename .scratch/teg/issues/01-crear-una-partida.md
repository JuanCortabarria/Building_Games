# 01: Crear una partida

**What to build:** desde el navegador, cargar de 2 a 6 jugadores, cada uno con su nombre y un color, y crear la partida. La aplicación sortea el orden de juego, reparte los 50 países de a uno en ese orden y pone 1 ejército en cada país. La pantalla muestra el orden de juego y los países agrupados por continente, cada uno con el color de su ocupante y su cantidad de ejércitos. En este ticket se arma el proyecto (TypeScript, Vite, React y Vitest) y se cargan los datos del mapa: los 50 países, los 6 continentes con sus ejércitos extra y los 89 pares limítrofes de `docs/reference/teg-limites.md`. El motor también ofrece restaurar una partida desde un estado, que los tickets siguientes usan para armar situaciones de test.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Se puede crear una partida con 2 a 6 jugadores; con menos de 2 o más de 6, el motor devuelve un error que lo explica.
- [x] Cada jugador tiene nombre y uno de los seis colores (azul, rojo, negro, amarillo, verde, magenta); dos jugadores no pueden tener el mismo color.
- [x] El orden de juego sale de la fuente de azar recibida al crear la partida.
- [x] Los 50 países se reparten de a uno en el orden de juego; si no se dividen exacto, los primeros en el orden tienen un país más (por ejemplo, con 4 jugadores: 13, 13, 12 y 12).
- [x] Cada país empieza con 1 ejército de su ocupante.
- [x] Las consultas del motor exponen el mapa: 50 países, 6 continentes con la cantidad de países y los ejércitos extra de cada uno, y 89 pares limítrofes simétricos (por ejemplo, Kamchatka y Alaska son limítrofes; Tartaria y Rusia no).
- [x] Restaurar una partida a partir de su estado da una partida igual a la original.
- [x] La pantalla muestra el orden de juego y los países por continente con el color de su ocupante y sus ejércitos.
- [x] Los tests del motor entran solo por su interfaz pública y usan una fuente de azar fijada a mano.
