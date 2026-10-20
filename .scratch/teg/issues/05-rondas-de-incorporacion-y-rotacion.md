# 05: Rondas de incorporación y rotación

**What to build:** después de cada ronda de ataque viene una ronda de incorporación, y así se alternan. Cada ronda de incorporación la abre el jugador siguiente al que abrió la anterior, y la ronda de ataque que la sigue usa ese mismo orden. Con A, B y C: rondas iniciales A, B, C; ataque 1 A, B, C; incorporación 1 B, C, A; ataque 2 B, C, A; incorporación 2 C, A, B. En su turno de incorporación, cada jugador recibe la mitad de sus países, sin decimales y con un mínimo de 3, más los ejércitos extra de cada continente que ocupa entero, y tiene que ponerlos todos antes de pasar el turno. La pantalla muestra cuántos ejércitos le quedan por poner y de dónde salen.

**Blocked by:** 04 (Rondas iniciales)

**Status:** ready-for-agent

- [ ] Las rondas de ataque y de incorporación se alternan después de las rondas iniciales.
- [ ] La rotación sigue el ejemplo de A, B y C de arriba.
- [ ] Un jugador con 17 países recibe 8 ejércitos; uno con 4 países recibe 3.
- [ ] Un jugador que ocupa un continente entero recibe sus ejércitos extra (América del Sur 3, América del Norte 5, Europa 5, Asia 7, África 3, Oceanía 2), uno por cada continente completo.
- [ ] Los ejércitos extra de un continente solo se pueden poner en países de ese continente; si no, el motor devuelve un error que lo explica.
- [ ] La cantidad a incorporar se calcula con los países que el jugador tiene al empezar su turno de incorporación.
- [ ] Un jugador no puede pasar el turno de incorporación hasta poner todos sus ejércitos.
- [ ] La pantalla muestra los ejércitos que quedan por poner, separados entre los generales y los de cada continente.
