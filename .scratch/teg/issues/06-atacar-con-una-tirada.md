# 06: Atacar con una tirada de dados

**What to build:** en su turno de la ronda de ataque, un jugador elige un país propio y un país limítrofe de otro jugador, y ataca. Cada ataque es una sola tirada: el atacante tira tantos dados como ejércitos tenga en su país menos uno, con un máximo de 3; el defensor tira uno por cada ejército de su país, con un máximo de 3. Los dados de cada lado se ordenan de mayor a menor y se comparan de a pares; en cada par pierde un ejército quien sacó menos, y el empate lo gana el defensor. Se comparan tantos pares como dados tenga el lado que tiró menos. La pantalla muestra los dados de los dos lados y cuántos ejércitos perdió cada uno. Se puede atacar todas las veces que se quiera, desde uno o varios países, o no atacar. Acá entra la fuente de azar con semilla de la aplicación.

**Blocked by:** 04 (Rondas iniciales)

**Status:** ready-for-agent

- [ ] Solo se puede atacar desde un país propio con al menos 2 ejércitos, hacia un país limítrofe de otro jugador; cada caso prohibido devuelve un error que explica la regla.
- [ ] Con 4 ejércitos atacando a 2: el atacante tira 3 dados y el defensor 2, y se comparan 2 pares.
- [ ] Con dados atacante 6, 4, 1 y defensor 5, 4: el defensor pierde 1 ejército y el atacante pierde 1 (el empate en 4 lo gana el defensor).
- [ ] Con dados atacante 3 y defensor 5, 2, 1: se compara un solo par y el atacante pierde 1 ejército.
- [ ] Un jugador puede atacar varias veces en su turno, desde distintos países, y puede pasar el turno sin atacar.
- [ ] La aplicación usa una fuente de azar con semilla, y el estado de esa fuente es parte del estado de la partida: una partida restaurada da los mismos dados que la original.
- [ ] La pantalla muestra los dados de los dos lados y las pérdidas de cada uno en la última tirada.
