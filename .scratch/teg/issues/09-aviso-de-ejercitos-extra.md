# 09: Aviso de los ejércitos extra por continente

**What to build:** cuando a un jugador le tocan ejércitos extra por ocupar un continente entero, la pantalla le dice explícitamente, antes de que ponga el primer ejército, cuántos extra tiene por cada continente y que esos solo se pueden poner en países de ese continente. Hoy la barra que se ve mientras se juega en el mapa solo dice "te quedan N"; el detalle por continente está en el panel de turno, que queda fuera de la pantalla cuando el mapa está a la vista.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Con ejércitos extra, la barra fija arriba del mapa dice, antes de poner el primero, cuántos extra hay por cada continente y que solo van en países de ese continente (por ejemplo: "Tenés 3 ejércitos extra por América del Sur: solo se pueden poner en países de América del Sur").
- [x] El aviso separa los ejércitos generales de los extra, y se actualiza a medida que se ponen.
- [x] Sin ejércitos extra, la barra no cambia.
- [x] Los números salen de la consulta del motor (`ejercitosPorIncorporar()`); la pantalla no calcula reglas.

## Comments

**2026-10-20, pedido del usuario** después de cerrar la v1: "cuando vayas a poner los ejércitos [...] debe decir explícitamente antes de ponerlas [...] que hay que ponerla dentro del continente".

**2026-10-21, construido** (rama `claude/teg-12-tablero-y-09-aviso-093430`): en la ronda de incorporación, si `ejercitosPorIncorporar()` trae extra, la barra fija muestra un recuadro con una línea por continente ("Tenés 3 ejércitos extra por América del Sur: solo se pueden poner en países de América del Sur."), con una etiqueta del color del continente en el tablero, y una última línea con los generales ("Y 12 ejércitos para cualquier país tuyo.", o "No te quedan ejércitos para cualquier país: los que faltan son extra." cuando ya no quedan). No hizo falta lógica nueva en el motor. Probado en el navegador: el recuadro baja de 3 a 2 extra al poner en Brasil, desaparece la línea de América del Sur al terminar sus extra, el motor explica el error si se intenta poner fuera de Oceanía con solo extra de Oceanía, y el recuadro desaparece al poner el último. Sin extra (otro jugador en la misma ronda), la barra queda como antes.

