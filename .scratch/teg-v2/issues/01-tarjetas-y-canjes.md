# 01: Tarjetas de país y canjes

**What to build:** el mazo de 50 tarjetas de país, recibir tarjeta al pasar el turno de ataque si se conquistó, los 2 ejércitos por tarjeta de un país propio, el canje de 3 tarjetas en el turno de incorporación con valores crecientes, y que el que destruye a un jugador se quede con sus tarjetas. En el motor, con tests, y en la pantalla. Las decisiones están en `.scratch/teg-v2/spec.md` (historias 1 a 7 y "Implementation Decisions").

**Blocked by:** None (can start immediately)

**Status:** done

- [x] El estado de la partida tiene el mazo, el descarte, las tarjetas de cada jugador, los canjes hechos por cada uno y los países conquistados en el turno en curso. El mazo se mezcla al crear la partida con la fuente de azar.
- [x] Al pasar el turno en una ronda de ataque, el jugador recibe la primera tarjeta del mazo si conquistó al menos 1 país en ese turno (2 si ya hizo 3 canjes). Si ocupa ese país, se le ponen 2 ejércitos ahí. Si el mazo está vacío, se mezcla el descarte.
- [x] Nueva acción `canjear` con 3 tarjetas (países): solo en el turno propio de una ronda de incorporación no inicial; vale si son 3 iguales o 3 distintas, con el comodín valiendo cualquiera; suma 4, 7, 10, 15, 20… a los ejércitos generales; las tarjetas van al descarte. Errores claros para cada caso inválido (no son suyas, no forman canje, no es su turno de incorporación).
- [x] Al destruir a un jugador, sus tarjetas pasan al que lo destruyó.
- [x] Consultas: las tarjetas de un jugador (país y símbolo), cuántos canjes hizo, cuánto vale su próximo canje, y la tarjeta que recibió el jugador al pasar el turno (para mostrarla).
- [x] La pantalla muestra las tarjetas del jugador en turno con su símbolo, cuánto vale su próximo canje, permite elegir 3 y canjear en la incorporación, avisa la tarjeta recibida (y los 2 ejércitos si los hubo), y muestra cuántas tarjetas tiene cada rival.
- [x] Sube la `VERSION` del guardado. Tests en el seam del motor para cada regla; `npm run typecheck` y `npm test` pasan.
- [x] Términos nuevos (Tarjeta de país, Canje, Mazo) en `GLOSSARY.md`.

## Comments

Hecho el 2026-10-21 por una sesión de agente, sin preguntas (el usuario pidió avanzar así). Decisiones tomadas donde la spec no decía:

- **Las tarjetas son países.** En el estado, el mazo, el descarte y las tarjetas de cada jugador son listas de `NombreDePais`; el símbolo sale de la tabla de `src/motor/tarjetas.ts`, que también tiene las reglas del canje (`formanCanje`, `valorDelCanje`, `conquistasParaRecibirTarjeta`).
- **Fuente de azar:** suma `mezclarTarjetas`. El mazo se mezcla en `crearPartida` después de sortear el orden y repartir los países, así una misma semilla reparte igual que en la v1. En `fuenteFija`, `primerasTarjetas` se aplica a cada mezcla de tarjetas (la del mazo al crear y la del descarte cuando el mazo se acaba).
- **Más de un canje por turno:** se permite; ni el reglamento ni la spec lo limitan.
- **Los canjes no pasan al destructor:** al destruir a un jugador pasan sus tarjetas, no su cuenta de canjes.
- **La tarjeta recibida** (`tarjetaRecibida()`) queda a la vista hasta el próximo `pasarTurno`, o sea durante el turno del siguiente jugador.
- **Información oculta en el aviso:** como el aviso sale en el turno del siguiente, la pantalla nombra el país solo si se pusieron los 2 ejércitos (eso ya es público en el tablero); si no, dice "X recibió una tarjeta de país". Quien la recibió la ve entre sus tarjetas en su turno. Si se prefiere mostrarla siempre, es un cambio de una línea en `src/interfaz/Tarjetas.tsx`.
- **La pantalla no valida canjes:** para saber si las 3 elegidas se pueden canjear, aplica el canje de prueba con `partida.aplicar` (la partida es inmutable) y muestra el error del motor.
- **Consulta extra:** `tarjetasEnElMazo()`, para observar el mazo en los tests sin mirar el estado; la pantalla no la usa.
- `VERSION` del guardado: 5 → 6. Si otra rama también la sube, al integrar alcanza con dejar un número mayor que ambas.
