# 03: Objetivos secretos, telón entre turnos y pantalla de victoria

**What to build:** el modo de partida (con objetivos secretos o solo objetivo común), el reparto de los 15 objetivos, la victoria por objetivo secreto, los objetivos de destrucción con sus casos especiales, el telón entre turnos de personas y una pantalla de victoria. Decisiones en `.scratch/teg-v2/spec.md` (historias 8 a 14 y 21).

**Blocked by:** 01 (Tarjetas y canjes), porque los dos tocan la destrucción y la victoria en el motor.

**Status:** ready-for-agent

- [ ] Crear partida recibe el modo. Con objetivos, cada jugador recibe uno al azar (la fuente de azar mezcla los 15).
- [ ] Los 9 objetivos de ocupación se cumplen como dice la referencia ("al menos N"), incluido el objetivo 2 con su grupo de 3 países conectados fuera de América del Sur y Europa.
- [ ] Los 6 de destrucción: si el color es el propio o no está en juego, apuntan al siguiente jugador vivo en el orden de juego; si la víctima la destruye otro, queda solo el objetivo común; se cumplen al destruir a la víctima.
- [ ] Después de cada conquista se controla la victoria del jugador en turno: objetivo secreto u objetivo común. El ganador queda con el motivo (consulta).
- [ ] Consultas: el objetivo de un jugador (con su descripción en español y, para destrucción, a quién apunta hoy), y por qué ganó el ganador.
- [ ] Pantalla: selector de modo al crear; "Ver mi objetivo" plegado en el turno propio; telón entre turnos de personas cuando hay objetivos secretos y al menos 2 personas ("Turno de Ana: tocá para empezar"); pantalla de victoria con el ganador, el motivo y los objetivos de todos.
- [ ] Si `02` ya está integrado, el telón no aparece en los turnos de la computadora.
- [ ] Sube la `VERSION`. Tests en el seam del motor para cada objetivo y caso especial. `npm run typecheck` y `npm test` pasan. "Objetivo secreto" en `GLOSSARY.md`.
