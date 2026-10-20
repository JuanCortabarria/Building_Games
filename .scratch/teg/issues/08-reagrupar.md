# 08: Reagrupar

**What to build:** en su turno de la ronda de ataque, después de atacar (o sin atacar), un jugador puede reagrupar: mover ejércitos de un país propio a otro país propio al que se llega pasando solo por países propios limítrofes, sin límite de distancia. Cada país conserva siempre al menos 1 ejército. Una vez que el jugador reagrupa, ya no puede atacar en ese turno. Reagrupar es opcional.

**Blocked by:** 06 (Atacar con una tirada de dados)

**Status:** ready-for-agent

- [ ] Se pueden mover ejércitos entre dos países propios limítrofes.
- [ ] Se pueden mover ejércitos entre dos países propios no limítrofes si hay un camino de países propios limítrofes entre ellos (por ejemplo, de Brasil a Chile pasando por Argentina, si los tres son del jugador).
- [ ] No se puede reagrupar hacia un país al que no se llega pasando solo por países propios; el motor devuelve un error que lo explica.
- [ ] No se puede dejar un país con 0 ejércitos.
- [ ] Después de reagrupar, intentar atacar en el mismo turno devuelve un error.
- [ ] Un jugador puede pasar el turno sin reagrupar.
