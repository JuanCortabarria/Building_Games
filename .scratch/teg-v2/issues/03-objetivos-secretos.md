# 03: Objetivos secretos, telón entre turnos y pantalla de victoria

**What to build:** el modo de partida (con objetivos secretos o solo objetivo común), el reparto de los 15 objetivos, la victoria por objetivo secreto, los objetivos de destrucción con sus casos especiales, el telón entre turnos de personas y una pantalla de victoria. Decisiones en `.scratch/teg-v2/spec.md` (historias 8 a 14 y 21).

**Blocked by:** 01 (Tarjetas y canjes), porque los dos tocan la destrucción y la victoria en el motor.

**Status:** done

- [x] Crear partida recibe el modo. Con objetivos, cada jugador recibe uno al azar (la fuente de azar mezcla los 15).
- [x] Los 9 objetivos de ocupación se cumplen como dice la referencia ("al menos N"), incluido el objetivo 2 con su grupo de 3 países conectados fuera de América del Sur y Europa.
- [x] Los 6 de destrucción: si el color es el propio o no está en juego, apuntan al siguiente jugador vivo en el orden de juego; si la víctima la destruye otro, queda solo el objetivo común; se cumplen al destruir a la víctima.
- [x] Después de cada conquista se controla la victoria del jugador en turno: objetivo secreto u objetivo común. El ganador queda con el motivo (consulta).
- [x] Consultas: el objetivo de un jugador (con su descripción en español y, para destrucción, a quién apunta hoy), y por qué ganó el ganador.
- [x] Pantalla: selector de modo al crear; "Ver mi objetivo" plegado en el turno propio; telón entre turnos de personas cuando hay objetivos secretos y al menos 2 personas ("Turno de Ana: tocá para empezar"); pantalla de victoria con el ganador, el motivo y los objetivos de todos.
- [x] Si `02` ya está integrado, el telón no aparece en los turnos de la computadora.
- [x] Sube la `VERSION`. Tests en el seam del motor para cada objetivo y caso especial. `npm run typecheck` y `npm test` pasan. "Objetivo secreto" en `GLOSSARY.md`.

## Comments

Hecho en la rama `claude/teg-v2-03-objetivos-611fa7` (2026-10-21). Decisiones tomadas sin preguntar, porque el usuario pidió avanzar sin preguntas:

- **Motor.** `crearPartida(jugadores, azar, { modo })`, con `modo` "objetivosSecretos" (por defecto, como dice la spec) u "objetivoComun". `FuenteDeAzar` suma `mezclarObjetivos`; `fuenteFija` acepta `primerosObjetivos`. El estado guarda `modo`, `objetivos` y `motivoDeLaVictoria`. Consultas nuevas: `modo()`, `objetivoDe(color)` y `motivoDeLaVictoria()`. Los objetivos y la regla de ocupación viven en `src/motor/objetivos.ts`.
- **A quién apunta un objetivo de destrucción** se decide al repartir, cuando todos están vivos: el color de la tarjeta, o el siguiente en el orden de juego si es el propio o no está en juego. Queda guardado. Si a la víctima la destruye otro, el objetivo deja de apuntar (`victima: null`) y le queda solo el común; no pasa a apuntar al siguiente.
- **Si una conquista cumple el objetivo secreto y el común a la vez**, el motivo es el secreto.
- **Objetivo 2.** La descripción que se muestra no es la de la tarjeta ("en cualquier lugar del mapa") sino la regla que aplica la aplicación, según la spec: "3 países limítrofes entre sí fuera de América del Sur y de Europa".
- **Ayudas de test.** `partidaEnRondaDeAtaque` y `partidaEnRondaDeIncorporacion` juegan solo con el objetivo común salvo que se den `objetivos`, así los tests de la v1 siguen diciendo lo mismo.
- **Telón.** Tapa cuando empieza el turno de una persona distinta de la última que lo levantó, si hay objetivos secretos y al menos 2 personas vivas. También al abrir una partida guardada o crear una nueva. Si la misma persona juega dos turnos seguidos (fin de una ronda y principio de la otra), no tapa. Mientras tapa, la partida no se dibuja. Ignora los toques de los primeros 600 ms, porque aparece justo donde se tocó "Pasar el turno" y un doble clic lo levantaba.
- **Turno de la computadora.** `VistaDePartida` recibe `secretosALaVista` (falso en el turno de la computadora): no se muestran las tarjetas (solo cuántas tiene) ni el objetivo.
- **Victoria.** Un cartel sobre el tablero (`Victoria.tsx`) con el ganador, el motivo y el objetivo de cada jugador; se puede cerrar para mirar el tablero y volver a abrir.
- **Interfaz tocada:** archivos nuevos `Objetivo.tsx`, `Telon.tsx`, `Victoria.tsx` y `objetivos.css`; cambios chicos en `App.tsx`, `VistaDePartida.tsx`, `Tarjetas.tsx`, `CrearPartida.tsx`, `colores.ts` y `guardado.ts` (`VERSION` 7 → 8).
- **Pendiente para el ticket de rivales:** la computadora todavía no persigue su objetivo secreto (historia 17); puede usar `objetivoDe`.
