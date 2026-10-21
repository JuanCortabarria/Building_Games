# 05: La computadora canjea y persigue su objetivo

**What to build:** que los jugadores de la computadora (`02`) usen las tarjetas (`01`) y los objetivos (`03`): canjean cuando pueden (o cuando conviene juntar para un canje mayor), y orientan la incorporación y los ataques hacia su objetivo secreto.

**Blocked by:** 01, 02, 03

**Status:** ready-for-agent

- [ ] La computadora canjea en su incorporación cuando tiene un canje válido (por ejemplo, siempre que tenga 3 tarjetas que formen canje, o al tener 5).
- [ ] Con objetivo de ocupación, prioriza los continentes y países que pide su objetivo; con objetivo de destrucción, ataca a su víctima cuando puede.
- [ ] Tests: partidas completas entre computadoras, con objetivos y tarjetas, terminan con ganador sin acciones inválidas; casos concretos de canje y de prioridad de objetivo.
- [ ] `npm run typecheck` y `npm test` pasan.
