# 07: Conquistar, destruir y ganar

**What to build:** cuando un ataque deja al país atacado sin ejércitos, el atacante lo conquista y elige cuántos ejércitos mover a él, entre 1 y 3, siempre dejando al menos 1 en el país desde el que atacó; hasta mover, no puede hacer otra acción. Cuando un jugador pierde su último país, queda destruido: se elimina de la partida y la rotación de rondas lo saltea, manteniendo el orden de los demás. El primer jugador que ocupa 30 países gana en ese mismo momento, aunque esté en medio de su ataque: la pantalla muestra al ganador y no se pueden hacer más acciones.

**Blocked by:** 05 (Rondas de incorporación y rotación), 06 (Atacar con una tirada de dados)

**Status:** done

- [x] Un país que se queda sin ejércitos pasa a ser del atacante.
- [x] El atacante mueve entre 1 y 3 ejércitos al país conquistado, dejando al menos 1 en el de origen; con 2 ejércitos en el origen, solo puede mover 1.
- [x] Hasta mover los ejércitos al país conquistado, cualquier otra acción devuelve un error.
- [x] Un jugador que pierde su último país queda destruido y no vuelve a tener turnos.
- [x] Con A, B y C, si B queda destruido durante la ronda de ataque 2, la ronda de incorporación 2 es C, A.
- [x] Un jugador que llega a 30 países gana en el acto, aunque esté en medio de su turno de ataque.
- [x] Con 2 jugadores, destruir al rival da la victoria (el ganador ocupa los 50 países).
- [x] Con un ganador, el motor rechaza cualquier acción y la pantalla muestra quién ganó.

## Comments

**2026-10-20, lo que dejó el ticket 06:**

- **La conquista provisoria.** Cuando un ataque deja al país atacado en 0 ejércitos, `atacar` (en `src/motor/partida.ts`) lo pasa al atacante y mueve 1 ejército desde el origen, sin preguntar. Está marcado con un comentario. Este ticket lo reemplaza por la elección de 1 a 3 ejércitos y por el bloqueo de cualquier otra acción hasta mover. El test "pasa a ser del atacante, que mueve a él 1 ejército desde el país de origen", en `src/motor/atacar.test.ts`, describe el comportamiento provisorio y hay que reescribirlo.
- **Destruir ya funciona a medias.** Un jugador sin países ya está destruido para la rotación (`estaDestruido`), así que si un ataque le quita el último país pierde sus turnos. Falta lo que pida este ticket sobre eliminarlo de la partida y mostrarlo.
- **No hay ganador.** El motor no controla los 30 países ni que quede un solo jugador: la partida sigue aunque alguien ocupe los 50.
- **La última tirada** guarda el color del defensor de antes del ataque, así que después de una conquista dice quién defendía. La pantalla no dice que hubo conquista: solo se ve que el país cambió de color.

**2026-10-20, decisiones tomadas al implementar** (el ticket no las resolvía; se pueden revisar):

- **El país conquistado nunca queda vacío.** Al conquistar, el país pasa al atacante con 1 ejército, el mínimo que tiene que mover, y el estado anota `conquistaPendiente: { desde, hacia }`. La acción nueva es `{ tipo: "moverAlConquistado", cantidad }`, donde `cantidad` es el total que pasa (de 1 a 3, contando el que ya entró), y el máximo es 3 o los ejércitos del origen menos 1. La consulta `partida.conquistaPendiente()` devuelve `{ desde, hacia, maximo }`, para que la pantalla no tenga que calcular la regla.
- **El bloqueo es uno solo, en el despacho de acciones.** Antes de despachar cualquier acción, `aplicar` mira primero si hay ganador y después si hay una conquista pendiente; cualquier acción que no sea `moverAlConquistado` devuelve "Ana tiene que mover ejércitos a Chile, que acaba de conquistar, antes de hacer otra cosa.". Al integrar con el 08, `reagrupar` queda bloqueado por la misma regla con solo pasar por ese despacho.
- **El ganador es parte del estado** (`ganador: Color | null`, y la consulta `partida.ganador()`). Se controla solo después de una conquista, porque es la única acción que cambia quién ocupa cada país. Así, los tests que restauran estados armados a mano (por ejemplo, Ana con 49 países para destruir al último rival con 2 jugadores) no ganan solos al pasar el turno. Con ganador, cualquier acción devuelve "La partida terminó: ganó Ana.".
- **Ganar en medio de un ataque no deja conquista pendiente.** Si la conquista le da el país 30, la partida termina en ese momento: el país conquistado queda con el ejército que entró al conquistar y no se elige cuántos mover.
- **Un jugador destruido conserva su lugar en el orden de juego.** No se saca de `jugadores`, porque las posiciones de `turno` y `abrioLaRonda`, y la regla de quién abre la ronda siguiente, cuentan con los asientos de los destruidos. Lo "elimina" la consulta nueva `partida.destruidos()` y el salteo que ya había en la rotación.
- **VERSION del guardado pasa a 4** (el 08 también la sube: se resuelve al integrar).
- **La pantalla.** Con una conquista pendiente, la barra del mapa dice "Conquistaste Chile: elegí cuántos ejércitos pasan desde Argentina." y muestra los botones "Pasar 1", "Pasar 2" y "Pasar 3" en lugar de "Pasar el turno", con los que superan el máximo deshabilitados. Debajo de la tirada dice "Ana conquistó Chile." y, si corresponde, "Beto perdió su último país y quedó destruido.". En el orden de juego, los destruidos aparecen tachados y con la palabra "destruido". Con un ganador, la barra muestra "¡Ganó Ana! La partida terminó.", el panel de turno dice "Partida terminada", y los clics en el mapa no hacen nada.
- **El test provisorio del 06** ("pasa a ser del atacante, que mueve a él 1 ejército…") se reemplazó por los de `src/motor/conquistar.test.ts`.
