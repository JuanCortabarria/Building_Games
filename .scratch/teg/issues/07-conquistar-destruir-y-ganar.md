# 07: Conquistar, destruir y ganar

**What to build:** cuando un ataque deja al país atacado sin ejércitos, el atacante lo conquista y elige cuántos ejércitos mover a él, entre 1 y 3, siempre dejando al menos 1 en el país desde el que atacó; hasta mover, no puede hacer otra acción. Cuando un jugador pierde su último país, queda destruido: se elimina de la partida y la rotación de rondas lo saltea, manteniendo el orden de los demás. El primer jugador que ocupa 30 países gana en ese mismo momento, aunque esté en medio de su ataque: la pantalla muestra al ganador y no se pueden hacer más acciones.

**Blocked by:** 05 (Rondas de incorporación y rotación), 06 (Atacar con una tirada de dados)

**Status:** ready-for-agent

- [ ] Un país que se queda sin ejércitos pasa a ser del atacante.
- [ ] El atacante mueve entre 1 y 3 ejércitos al país conquistado, dejando al menos 1 en el de origen; con 2 ejércitos en el origen, solo puede mover 1.
- [ ] Hasta mover los ejércitos al país conquistado, cualquier otra acción devuelve un error.
- [ ] Un jugador que pierde su último país queda destruido y no vuelve a tener turnos.
- [ ] Con A, B y C, si B queda destruido durante la ronda de ataque 2, la ronda de incorporación 2 es C, A.
- [ ] Un jugador que llega a 30 países gana en el acto, aunque esté en medio de su turno de ataque.
- [ ] Con 2 jugadores, destruir al rival da la victoria (el ganador ocupa los 50 países).
- [ ] Con un ganador, el motor rechaza cualquier acción y la pantalla muestra quién ganó.

## Comments

**2026-10-20, lo que dejó el ticket 06:**

- **La conquista provisoria.** Cuando un ataque deja al país atacado en 0 ejércitos, `atacar` (en `src/motor/partida.ts`) lo pasa al atacante y mueve 1 ejército desde el origen, sin preguntar. Está marcado con un comentario. Este ticket lo reemplaza por la elección de 1 a 3 ejércitos y por el bloqueo de cualquier otra acción hasta mover. El test "pasa a ser del atacante, que mueve a él 1 ejército desde el país de origen", en `src/motor/atacar.test.ts`, describe el comportamiento provisorio y hay que reescribirlo.
- **Destruir ya funciona a medias.** Un jugador sin países ya está destruido para la rotación (`estaDestruido`), así que si un ataque le quita el último país pierde sus turnos. Falta lo que pida este ticket sobre eliminarlo de la partida y mostrarlo.
- **No hay ganador.** El motor no controla los 30 países ni que quede un solo jugador: la partida sigue aunque alguien ocupe los 50.
- **La última tirada** guarda el color del defensor de antes del ataque, así que después de una conquista dice quién defendía. La pantalla no dice que hubo conquista: solo se ve que el país cambió de color.
