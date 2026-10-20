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

## Comments

**2026-10-20, pendientes del ticket 04:**

- **Hoy a una ronda de ataque le sigue otra ronda de ataque.** Es provisorio, para que la partida no se trabe: está en `siguienteRonda`, en `src/motor/partida.ts`, con un comentario. Este ticket lo reemplaza por la alternancia con las rondas de incorporación.
- **Decidir el tipo de ronda antes de empezar.** El motor expone `tipo: "inicial" | "ataque"`, pero el glosario dice que las rondas son de ataque o de incorporación, y que la ronda inicial es una de incorporación. La pantalla lo compensa con su propio texto, "incorporación (inicial)", en `TIPO_DE_LA_RONDA`, y eso es una regla dentro de la interfaz. Con el tipo `"incorporacion"` que suma este ticket, la pregunta "¿es de incorporación?" tendría dos respuestas posibles. Una opción es `{ tipo: "incorporacion", inicial: boolean }`, y que la pantalla solo traduzca nombres. La decisión es del usuario.
- **El code review del 04 marcó Repeated Switches sobre `ronda.tipo`:** se decide en `incorporar`, `siguienteRonda` y `ejercitosDeLaRonda`, y en los dos textos de la pantalla. Este ticket pasa por todos esos lugares, así que es un buen momento para juntarlos.

**2026-10-20, decisiones del prototipo de rotación** (el prototipo está en la rama `prototype/rotacion-de-rondas`, en `src/motor/PROTOTIPO-rotacion-de-rondas.html`; su primer `<script>` es un módulo puro con la lógica validada):

- **Quién abre cada ronda de incorporación: la regla 1, "siguiente al que abrió".** La abre el primer jugador vivo sentado después del que abrió la ronda anterior (en el orden de juego), **aunque ese jugador ya esté destruido**: se cuenta desde su asiento. Se descartaron dos lecturas: "asiento fijo", que puede hacer abrir dos veces seguidas al mismo jugador, y "cuenta sobre los vivos", que saltea a un jugador cuando destruyen al que abrió. Con Ana, Beto, Caro y Dani, si en la ronda de ataque 2 (abierta por Beto) Dani destruye a Beto, la incorporación 2 la abre Caro.
- **La ronda de ataque usa el mismo orden que la incorporación que la precede**, sin los destruidos. Un jugador destruido a mitad de ronda pierde los turnos que le quedaban en esa ronda.
- **El tipo de ronda pasa a ser `{ tipo: "incorporacion" | "ataque", inicial: boolean, numero: number }`.** Las dos rondas iniciales son `{ tipo: "incorporacion", inicial: true, numero: 1 | 2 }`, como dice el glosario. Las incorporaciones normales se numeran desde 1, igual que los ataques. Así, "¿se ponen ejércitos?" se responde solo con `tipo`, y la pantalla solo traduce nombres: hay que sacar `TIPO_DE_LA_RONDA` de `VistaDePartida.tsx`. El comentario anterior sobre decidir el tipo de ronda queda resuelto.
