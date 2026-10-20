# 04: Rondas iniciales

**What to build:** después del reparto, la partida juega sus dos rondas iniciales. En la primera, cada jugador, en el orden de juego, pone 5 ejércitos en sus países, eligiéndolos uno por uno; en la segunda, pone 3, en el mismo orden. La pantalla muestra de quién es el turno (nombre y color), qué ronda se juega y cuántos ejércitos le quedan por poner. Al terminar la segunda ronda inicial, la partida pasa a la ronda de ataque 1, en el mismo orden, donde por ahora cada jugador solo puede pasar el turno.

**Blocked by:** 01 (Crear una partida)

**Status:** ready-for-agent

- [ ] En la primera ronda inicial cada jugador pone 5 ejércitos, y en la segunda 3, en el orden de juego sorteado.
- [ ] Un jugador solo puede poner ejércitos en países que ocupa; si no, el motor devuelve un error que lo explica.
- [ ] Un jugador no puede pasar el turno hasta poner todos los ejércitos que le tocan.
- [ ] Un jugador puede repartir sus ejércitos entre sus países como quiera.
- [ ] Después de la segunda ronda inicial empieza la ronda de ataque 1, con el mismo orden, y cada jugador puede pasar su turno.
- [ ] La pantalla muestra siempre el jugador en turno, la ronda que se juega y su tipo, y los ejércitos que quedan por poner.

## Comments

**2026-10-20, pendientes del code review del ticket 01:**

- **`estado()` devuelve el objeto interno, sin copiarlo,** y `restaurarPartida` tampoco copia el que recibe. Hasta ahora no importaba porque la partida no cambiaba. Con este ticket el motor empieza a aplicar acciones, y la spec dice que "recibe un estado de partida y una acción, y devuelve el nuevo estado": aplicar una acción no tiene que modificar el estado anterior, ni el que tenga guardado otro.
- **Se puede crear una partida con nombres vacíos o repetidos.** El ticket 01 no lo pedía, así que el motor no lo valida, y la pantalla muestra "(amarillo)" sin nombre. Como este ticket muestra al jugador en turno por su nombre, conviene decidir si el motor rechaza nombres vacíos (y repetidos) o si la pantalla pone uno por defecto.
- **El test "no se puede crear una partida con menos de 2 ni con más de 6 jugadores"** repite el azul en el caso de 7 jugadores, porque hay solo 6 colores. Pasa porque la cantidad se valida antes que el color. Si se cambia ese orden, el test falla (no da un falso positivo). Vale un comentario en el test, o que compruebe solo el mensaje de cantidad.
