# 08: Reagrupar

**What to build:** en su turno de la ronda de ataque, después de atacar (o sin atacar), un jugador puede reagrupar: mover ejércitos de un país propio a otro país propio al que se llega pasando solo por países propios limítrofes, sin límite de distancia. Cada país conserva siempre al menos 1 ejército. Una vez que el jugador reagrupa, ya no puede atacar en ese turno. Reagrupar es opcional.

**Blocked by:** 06 (Atacar con una tirada de dados)

**Status:** done

- [x] Se pueden mover ejércitos entre dos países propios limítrofes.
- [x] Se pueden mover ejércitos entre dos países propios no limítrofes si hay un camino de países propios limítrofes entre ellos (por ejemplo, de Brasil a Chile pasando por Argentina, si los tres son del jugador).
- [x] No se puede reagrupar hacia un país al que no se llega pasando solo por países propios; el motor devuelve un error que lo explica.
- [x] No se puede dejar un país con 0 ejércitos.
- [x] Después de reagrupar, intentar atacar en el mismo turno devuelve un error.
- [x] Un jugador puede pasar el turno sin reagrupar.

## Comments

**2026-10-20, decisiones tomadas al implementar** (el ticket no las resolvía; se pueden revisar):

- **La acción es `{ tipo: "reagrupar", desde, hacia, cantidad }`.** Las validaciones van en este orden, y cada una devuelve un error que explica la regla: que sea una ronda de ataque, que la cantidad sea un entero de 1 en adelante, que los dos sean países del mapa, que sean distintos, que el origen y el destino sean del jugador en turno, que haya un camino de países suyos limítrofes y que al origen le quede al menos 1 ejército.
- **Se puede reagrupar varias veces en el mismo turno**, desde y hacia los países que se quiera. La spec habla de "haber empezado a reagrupar", así que reagrupar es una etapa del turno y no una sola acción. Tampoco hay una regla de que un ejército que ya se movió no se pueda volver a mover: la historia 45 pide reorganizarse "sin restricciones artificiales", y las restricciones exactas del reagrupamiento cambian según la edición (`docs/reference/README.md`).
- **El estado suma `reagrupoEnEsteTurno`**, que se pone en `true` al reagrupar y se borra al empezar cada turno. Con él, `atacar` devuelve "ya reagrupó en este turno, y después de reagrupar no se puede atacar". La conquista pendiente es del ticket 07: al integrar, reagrupar también tiene que quedar bloqueado por ella. Con este campo cambió la forma del estado, así que `VERSION` del guardado pasó a 4 (el 07 también la sube: el conflicto se resuelve al integrar).
- **Dos consultas nuevas:** `partida.reagrupoEnEsteTurno()` y `partida.destinosDeReagrupe(desde)`, los países a los que se llega desde uno pasando solo por países de su mismo ocupante. La pantalla las usa para marcar los destinos posibles y para no dejar atacar después de reagrupar, sin repetir la búsqueda del camino fuera del motor.
- **La pantalla.** En la ronda de ataque, la barra fija tiene dos botones, "Atacar" y "Reagrupar". Atacar sigue como estaba. En "Reagrupar", el primer clic en un país propio lo elige como origen (borde grueso) y marca con un borde de puntos los países a los que se puede reagrupar; el segundo clic elige el destino (borde grueso cortado), y aparece un campo con la cantidad y el botón "Mover". Otro clic en el origen suelta los dos, y otro clic en el destino suelta solo el destino. El destino puede ser cualquier país, aunque no esté marcado: si no se puede, lo explica el motor al mover. Por eso el formulario no usa la validación del navegador, que además daba el mensaje en inglés. Después de reagrupar, "Atacar" queda deshabilitado y la barra sigue en "Reagrupar" hasta pasar el turno, que vuelve a "Atacar".

