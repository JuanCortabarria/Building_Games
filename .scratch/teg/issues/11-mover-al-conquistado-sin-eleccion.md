# 11: Sin elección, el ejército pasa solo al país conquistado

**What to build:** después de conquistar un país, el atacante elige cuántos ejércitos pasan (de 1 a 3, dejando al menos 1 en el origen). Cuando la única opción es 1, porque en el origen quedaron solo 2 ejércitos al conquistar, no hay nada que elegir: el ejército que entró al conquistar se queda en el país conquistado, no queda una conquista pendiente y la pantalla no muestra el botón "Pasar 1". El jugador sigue jugando su turno.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Si al conquistar el máximo a mover es 1, no queda conquista pendiente: el país conquistado queda con 1 ejército y el jugador puede seguir atacando, reagrupar o pasar el turno.
- [x] Si el máximo es 2 o 3, sigue igual que antes: hay que elegir cuántos pasan antes de otra acción.
- [x] La pantalla no muestra los botones "Pasar 1/2/3" cuando no hay nada que elegir; la regla vive en el motor.

## Comments

**2026-10-21, pedido del usuario** al probar el prototipo del mapa: "si solo tenemos la opción de pasar un ejército, ese botón debe ser evitado. No debe estar la opción, simplemente debe seguir".
