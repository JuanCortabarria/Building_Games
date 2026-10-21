# 01: Tarjetas de país y canjes

**What to build:** el mazo de 50 tarjetas de país, recibir tarjeta al pasar el turno de ataque si se conquistó, los 2 ejércitos por tarjeta de un país propio, el canje de 3 tarjetas en el turno de incorporación con valores crecientes, y que el que destruye a un jugador se quede con sus tarjetas. En el motor, con tests, y en la pantalla. Las decisiones están en `.scratch/teg-v2/spec.md` (historias 1 a 7 y "Implementation Decisions").

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] El estado de la partida tiene el mazo, el descarte, las tarjetas de cada jugador, los canjes hechos por cada uno y los países conquistados en el turno en curso. El mazo se mezcla al crear la partida con la fuente de azar.
- [ ] Al pasar el turno en una ronda de ataque, el jugador recibe la primera tarjeta del mazo si conquistó al menos 1 país en ese turno (2 si ya hizo 3 canjes). Si ocupa ese país, se le ponen 2 ejércitos ahí. Si el mazo está vacío, se mezcla el descarte.
- [ ] Nueva acción `canjear` con 3 tarjetas (países): solo en el turno propio de una ronda de incorporación no inicial; vale si son 3 iguales o 3 distintas, con el comodín valiendo cualquiera; suma 4, 7, 10, 15, 20… a los ejércitos generales; las tarjetas van al descarte. Errores claros para cada caso inválido (no son suyas, no forman canje, no es su turno de incorporación).
- [ ] Al destruir a un jugador, sus tarjetas pasan al que lo destruyó.
- [ ] Consultas: las tarjetas de un jugador (país y símbolo), cuántos canjes hizo, cuánto vale su próximo canje, y la tarjeta que recibió el jugador al pasar el turno (para mostrarla).
- [ ] La pantalla muestra las tarjetas del jugador en turno con su símbolo, cuánto vale su próximo canje, permite elegir 3 y canjear en la incorporación, avisa la tarjeta recibida (y los 2 ejércitos si los hubo), y muestra cuántas tarjetas tiene cada rival.
- [ ] Sube la `VERSION` del guardado. Tests en el seam del motor para cada regla; `npm run typecheck` y `npm test` pasan.
- [ ] Términos nuevos (Tarjeta de país, Canje, Mazo) en `GLOSSARY.md`.
