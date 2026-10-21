# 02: Jugadores de la computadora

**What to build:** que al crear la partida cada jugador pueda ser una persona o la computadora, y que la computadora juegue sus turnos sola, con una estrategia razonable. La estrategia vive en un módulo nuevo, `src/rivales/`, que dada una partida devuelve la próxima acción del jugador en turno usando solo la interfaz pública del motor. El motor no cambia. Decisiones en `.scratch/teg-v2/spec.md` (historias 15 a 17).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `src/rivales/` exporta una función que, para una partida sin ganador, devuelve una acción válida del jugador en turno. Cubre todas las situaciones de la v1: rondas iniciales, incorporación (generales y extra por continente), conquista pendiente, ataque, reagrupamiento y pasar el turno.
- [ ] Estrategia con sentido: incorpora en países de frontera, prefiriendo el continente que tiene más cerca de completar y defendiendo los continentes que ya tiene; ataca cuando tiene ventaja (por ejemplo, más ejércitos que el defensor) y deja de atacar cuando no la tiene; mueve al conquistado lo que conviene; reagrupa ejércitos de países interiores hacia la frontera; nunca queda en un bucle sin terminar el turno.
- [ ] Tests contra el motor real: ninguna acción elegida da error; partidas completas de 2, 4 y 6 jugadores de la computadora, con semillas fijas, terminan con un ganador en una cantidad acotada de acciones; y comportamientos concretos (pone los extra de un continente en ese continente; si tiene conquista pendiente, mueve; no ataca desde un país con 1 ejército).
- [ ] En la pantalla de crear partida, cada jugador tiene un selector Persona / Computadora. Se guarda quiénes son de la computadora junto con la partida (sube la `VERSION` del guardado), y al recargar siguen jugando solos.
- [ ] En el turno de la computadora, la pantalla aplica sus acciones de a una con una pausa corta (alrededor de medio segundo) y muestra qué está haciendo; las personas no pueden actuar en ese turno. Si hay solo computadoras, la partida se juega sola hasta el final.
- [ ] `npm run typecheck` y `npm test` pasan. "Jugador de la computadora" en `GLOSSARY.md`.

## Comments

Las tarjetas (`01`) y los objetivos (`03`) se construyen en paralelo o después: que la computadora canjee y persiga su objetivo es el ticket `05`.
