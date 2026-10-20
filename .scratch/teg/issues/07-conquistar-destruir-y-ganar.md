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
