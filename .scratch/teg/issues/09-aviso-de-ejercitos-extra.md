# 09: Aviso de los ejércitos extra por continente

**What to build:** cuando a un jugador le tocan ejércitos extra por ocupar un continente entero, la pantalla le dice explícitamente, antes de que ponga el primer ejército, cuántos extra tiene por cada continente y que esos solo se pueden poner en países de ese continente. Hoy la barra que se ve mientras se juega en el mapa solo dice "te quedan N"; el detalle por continente está en el panel de turno, que queda fuera de la pantalla cuando el mapa está a la vista.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Con ejércitos extra, la barra fija arriba del mapa dice, antes de poner el primero, cuántos extra hay por cada continente y que solo van en países de ese continente (por ejemplo: "Tenés 3 ejércitos extra por América del Sur: solo se pueden poner en países de América del Sur").
- [ ] El aviso separa los ejércitos generales de los extra, y se actualiza a medida que se ponen.
- [ ] Sin ejércitos extra, la barra no cambia.
- [ ] Los números salen de la consulta del motor (`ejercitosPorIncorporar()`); la pantalla no calcula reglas.

## Comments

**2026-10-20, pedido del usuario** después de cerrar la v1: "cuando vayas a poner los ejércitos [...] debe decir explícitamente antes de ponerlas [...] que hay que ponerla dentro del continente".
