# 04: Registro de la partida y dados que se ven

**What to build:** que el motor anote cada evento de la partida y lo exponga, y que la pantalla muestre un registro legible ("Ana atacó Chile desde Argentina: 6 5 3 contra 4 2. Beto perdió 2.") y los dados de la última tirada con caras de dado y una animación corta. Decisiones en `.scratch/teg-v2/spec.md` (historia 20).

**Blocked by:** 01 (Tarjetas y canjes), para registrar también canjes y tarjetas y no pisarse en el motor.

**Status:** ready-for-agent

- [ ] Eventos: incorporó (país y cantidad), tiró (los dos lados, dados y pérdidas), conquistó, destruyó, movió al conquistado, reagrupó, canjeó (y cuánto recibió), recibió tarjeta (y si puso 2 ejércitos), pasó el turno, empezó una ronda, ganó. Cada uno con el número de ronda y el color del jugador.
- [ ] El estado guarda los últimos 200 eventos; una consulta los devuelve en orden. Sube la `VERSION`.
- [ ] Tests en el seam del motor: cada acción deja su evento con los datos correctos.
- [ ] Pantalla: panel "Lo que pasó" con los últimos eventos en frases en español, el más nuevo arriba y con el color de cada jugador; los dados de la última tirada como caras de dado, con una animación corta al tirar; la conquista y la destrucción se destacan.
- [ ] `npm run typecheck` y `npm test` pasan.
