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

**2026-10-20, decisiones de la implementación:**

- **La forma del estado del azar.** `EstadoDePartida.azar` es `{ semilla, avance }`: la semilla con la que arrancó la fuente y cuántos números se sacaron de su secuencia. Es un dato simple, se guarda con el resto del estado. `reanudarFuente(estado.azar)` (en `azar.ts`) da la fuente con semilla retomada en ese punto, y `fuenteConSemilla(semilla)` es reanudarla en el avance 0. Toda fuente de azar responde `estado()`; la fuente fija de los tests no sigue una secuencia y responde siempre `{ semilla: 0, avance: 0 }`.
- **Restaurar toma el azar de la fuente que recibe.** `restaurarPartida(estado, azar)` deja en la partida el `azar.estado()` de la fuente recibida, no el que venía en el estado. Así el estado de la partida siempre dice dónde está la fuente que la partida usa. Para que una partida restaurada siga la misma secuencia, quien restaura pasa `reanudarFuente(estado.azar)`; eso hace el guardado de la interfaz. Los tests pueden restaurar con una fuente fija.
- **Para el ticket 06 (dados).** Sumar `tirarDados` a la fuente no cambia nada de esto: cada número de los dados avanza `avance`. Lo que queda por decidir ahí es la pureza: hoy la partida no guarda la fuente, porque después de crearla no sortea nada. Si `aplicar` tira dados con una fuente que comparten la partida de antes y la de después, aplicar dos veces la misma acción a la misma partida daría dados distintos. Una forma de evitarlo es que la partida reanude la fuente desde su `estado.azar` en cada acción que tira dados; para eso la fuente fija también tendría que poder reanudarse (por ejemplo, usando `avance` como posición en su lista de dados).
- **Formato de lo guardado.** Se guarda `{ version, estado }` en `localStorage`, bajo la clave `teg:partida`. Lo que tiene otra versión, o no es JSON, o no se puede restaurar, se descarta y la aplicación abre la pantalla para crear una partida. **Si cambia la forma de `EstadoDePartida` (por ejemplo, la ronda del ticket 05), hay que subir `VERSION` en `src/interfaz/guardado.ts`:** un estado con la versión correcta pero con otra forma hoy deja la página en blanco, porque nadie valida la forma del estado.
- **Empezar una partida nueva** lleva a la pantalla de crear, con un botón para volver a la guardada. La guardada se reemplaza recién cuando se crea la nueva, así que un clic de más no pierde la partida.
