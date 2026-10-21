# 06: Atacar con una tirada de dados

**What to build:** en su turno de la ronda de ataque, un jugador elige un país propio y un país limítrofe de otro jugador, y ataca. Cada ataque es una sola tirada: el atacante tira tantos dados como ejércitos tenga en su país menos uno, con un máximo de 3; el defensor tira uno por cada ejército de su país, con un máximo de 3. Los dados de cada lado se ordenan de mayor a menor y se comparan de a pares; en cada par pierde un ejército quien sacó menos, y el empate lo gana el defensor. Se comparan tantos pares como dados tenga el lado que tiró menos. La pantalla muestra los dados de los dos lados y cuántos ejércitos perdió cada uno. Se puede atacar todas las veces que se quiera, desde uno o varios países, o no atacar. Acá entra la fuente de azar con semilla de la aplicación.

**Blocked by:** 04 (Rondas iniciales)

**Status:** done

- [x] Solo se puede atacar desde un país propio con al menos 2 ejércitos, hacia un país limítrofe de otro jugador; cada caso prohibido devuelve un error que explica la regla.
- [x] Con 4 ejércitos atacando a 2: el atacante tira 3 dados y el defensor 2, y se comparan 2 pares.
- [x] Con dados atacante 6, 4, 1 y defensor 5, 4: el defensor pierde 1 ejército y el atacante pierde 1 (el empate en 4 lo gana el defensor).
- [x] Con dados atacante 3 y defensor 5, 2, 1: se compara un solo par y el atacante pierde 1 ejército.
- [x] Un jugador puede atacar varias veces en su turno, desde distintos países, y puede pasar el turno sin atacar.
- [x] La aplicación usa una fuente de azar con semilla, y el estado de esa fuente es parte del estado de la partida: una partida restaurada da los mismos dados que la original.
- [x] La pantalla muestra los dados de los dos lados y las pérdidas de cada uno en la última tirada.

## Comments

**2026-10-20, decisiones tomadas al implementar** (el ticket no las resolvía; se pueden revisar):

- **La acción es `{ tipo: "atacar", desde, hacia }`** y hace una sola tirada. Las validaciones van en este orden, y cada una devuelve un error que explica la regla: que sea una ronda de ataque, que los dos sean países del mapa, que el origen sea del jugador en turno, que el atacado no sea suyo, que sean limítrofes y que el origen tenga al menos 2 ejércitos.
- **Cómo se tiran los dados sin perder la pureza.** Toda fuente de azar suma `tirarDados(cantidad)` y `reanudar(estadoDeAzar)`, que devuelve la misma fuente retomada en ese punto sin cambiar a la original. La partida conserva la fuente que recibió al crearse o restaurarse, pero nunca la avanza: cada ataque hace `azar.reanudar(estado.azar)`, tira con esa copia y guarda su `estado()` en la partida nueva. Así, aplicar dos veces el mismo ataque a la misma partida da los mismos dados, y una partida restaurada con `reanudarFuente(estado.azar)` sigue la misma secuencia. Cada dado avanza en 1 el `avance`.
- **La fuente fija de los tests** recibe `dados`, una sola lista que se consume en orden, tirada tras tirada: primero los del atacante y después los del defensor. Su `avance` es cuántos dados de la lista ya salieron, y `reanudar` usa ese número como posición. Si un test pide más dados de los fijados, la fuente tira un error que lo dice. Su semilla sigue siendo 0.
- **La última tirada es parte del estado** (`ultimaTirada`, y la consulta `partida.ultimaTirada()`): país, color, dados de mayor a menor y ejércitos perdidos de cada lado. Así sobrevive a recargar la página. Se borra al empezar cada turno, para que el jugador siguiente no vea la tirada de otro como si fuera suya. Con este campo cambió la forma del estado, así que `VERSION` del guardado pasó a 3.
- **Si el atacado se queda sin ejércitos**, el motor hace lo mínimo para que ningún país quede vacío: el país pasa al atacante, que mueve 1 ejército desde el origen. Al origen siempre le quedan al menos 2 en ese caso, porque el defensor tuvo que perder todos los pares. Lo demás es del ticket 07 (ver sus comentarios).
- **La pantalla.** En la ronda de ataque, un clic en un país propio lo elige como origen (otro clic en el mismo lo suelta, y un clic en otro propio cambia el origen), y un clic en un país de otro jugador ataca desde el origen. El origen queda marcado con un borde grueso y sus limítrofes de otros jugadores con un borde punteado. Como un clic en un país propio cambia el origen, el error "no se puede atacar a un país propio" del motor no aparece en la pantalla. Arriba del mapa hay una barra que queda pegada arriba mientras se juega en el mapa, con el jugador en turno, qué tiene que hacer, la última tirada, los errores y el botón de pasar el turno. El botón y los errores se mudaron del panel de turno a esa barra, que también sirve en las rondas de incorporación: así se resuelve el pendiente de que los errores quedaban fuera de la pantalla.
