# 03: Guardado automático

**What to build:** la partida se guarda sola en el navegador después de cada acción. Al abrir o recargar la aplicación, la partida guardada sigue exactamente donde estaba. Si hay una partida guardada, se puede empezar una nueva, que reemplaza a la anterior. Hay una sola partida guardada a la vez.

**Blocked by:** 01 (Crear una partida)

**Status:** ready-for-agent

- [ ] Después de cada acción, el estado de la partida queda guardado en el navegador.
- [ ] Al recargar la página, la partida sigue con los mismos jugadores, países, ejércitos, ronda y turno.
- [ ] Desde una partida guardada se puede empezar una partida nueva; la anterior se descarta.
- [ ] Si no hay partida guardada, la aplicación abre en la pantalla para crear una.
- [ ] Guardar y restaurar usa la capacidad de restaurar del motor; no hay reglas del juego fuera del motor.

## Comments

**2026-10-20, pendiente del code review del ticket 01:** la semilla de la fuente de azar todavía no forma parte del estado de la partida. La spec dice "La semilla es parte de lo guardado, de modo que una partida restaurada sigue la misma secuencia". Hoy `EstadoDePartida` no la tiene, la pantalla crea la fuente con `fuenteConSemilla(Date.now())` y `restaurarPartida` recibe la fuente pero la ignora. Para que una partida recargada siga la misma secuencia de azar, el estado tiene que guardar la semilla y también cuánto se avanzó en la secuencia. Se vuelve importante con los dados del ticket 06.
