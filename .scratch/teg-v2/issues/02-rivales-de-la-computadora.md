# 02: Jugadores de la computadora

**What to build:** que al crear la partida cada jugador pueda ser una persona o la computadora, y que la computadora juegue sus turnos sola, con una estrategia razonable. La estrategia vive en un módulo nuevo, `src/rivales/`, que dada una partida devuelve la próxima acción del jugador en turno usando solo la interfaz pública del motor. El motor no cambia. Decisiones en `.scratch/teg-v2/spec.md` (historias 15 a 17).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `src/rivales/` exporta una función que, para una partida sin ganador, devuelve una acción válida del jugador en turno. Cubre todas las situaciones de la v1: rondas iniciales, incorporación (generales y extra por continente), conquista pendiente, ataque, reagrupamiento y pasar el turno.
- [x] Estrategia con sentido: incorpora en países de frontera, prefiriendo el continente que tiene más cerca de completar y defendiendo los continentes que ya tiene; ataca cuando tiene ventaja (por ejemplo, más ejércitos que el defensor) y deja de atacar cuando no la tiene; mueve al conquistado lo que conviene; reagrupa ejércitos de países interiores hacia la frontera; nunca queda en un bucle sin terminar el turno.
- [x] Tests contra el motor real: ninguna acción elegida da error; partidas completas de 2, 4 y 6 jugadores de la computadora, con semillas fijas, terminan con un ganador en una cantidad acotada de acciones; y comportamientos concretos (pone los extra de un continente en ese continente; si tiene conquista pendiente, mueve; no ataca desde un país con 1 ejército).
- [x] En la pantalla de crear partida, cada jugador tiene un selector Persona / Computadora. Se guarda quiénes son de la computadora junto con la partida (sube la `VERSION` del guardado), y al recargar siguen jugando solos.
- [x] En el turno de la computadora, la pantalla aplica sus acciones de a una con una pausa corta (alrededor de medio segundo) y muestra qué está haciendo; las personas no pueden actuar en ese turno. Si hay solo computadoras, la partida se juega sola hasta el final.
- [x] `npm run typecheck` y `npm test` pasan. "Jugador de la computadora" en `GLOSSARY.md`.

## Comments

Las tarjetas (`01`) y los objetivos (`03`) se construyen en paralelo o después: que la computadora canjee y persiga su objetivo es el ticket `05`.

Decisiones tomadas al construirlo (2026-10-21), sin preguntas porque el usuario pidió avanzar:

- `elegirAccion(partida)` devuelve `null` si la partida ya tiene ganador, en vez de tirar un error: la pantalla lo usa para frenar.
- **La estrategia** es determinista (misma partida, misma acción): no usa azar propio, así los tests no dependen de semillas extra. La variedad la ponen los dados.
  - Elige un continente objetivo: el que tiene más cerca de completar, y entre parecidos el que tiene menos ejércitos ajenos y más extra.
  - Incorpora de a tandas: reparte los ejércitos de a uno en el país de frontera más urgente (más superado por sus enemigos limítrofes, +3 si protege un continente completo, +3 si limita con el continente objetivo) y aplica lo que le tocó al que más recibió. Los extra de un continente van primero, a ese continente.
  - Ataca solo con ventaja: los ejércitos que pueden atacar (los del país menos 1) tienen que superar a los del defensor. Entre los posibles, prefiere la mayor diferencia, el continente objetivo y romperle un continente a otro. Cada tirada saca al menos un ejército del tablero, así que los ataques se terminan.
  - Al conquistar, pasa todo lo que puede, salvo que el conquistado no tenga enemigos limítrofes: entonces pasa 1.
  - Después de atacar, reagrupa los ejércitos de cada país interior (sin enemigos limítrofes), empezando por el que más tiene, hacia la frontera más urgente a la que llegue. Solo mueve de interior a frontera, así que se termina; después pasa el turno.
- **La pantalla** (`src/interfaz/TurnoDeLaComputadora.tsx`): un aviso fijo abajo dice qué hizo la computadora; la partida se ve pero queda `inert` en su turno. Suma **Pausar** y **Más rápido** (100 ms en vez de 500 ms), porque una partida de 6 computadoras lleva más de mil acciones. Mientras se está creando otra partida, la computadora no juega la guardada.
- **Nombres:** un jugador de la computadora sin nombre se llama "Computadora N". Al crear, el primer jugador es persona y los que se agregan son de la computadora.
- **Guardado:** `VERSION` 5 → 6, con `computadoras: Color[]` junto al estado. La sesión de tarjetas también sube la versión: al integrar hay que quedarse con un número mayor que el de las dos.
- **Para el ticket 05:** la computadora no canjea todavía. `elegirAccion` cubre las acciones de la v1; cuando exista `canjear`, sumarlo al principio del turno de incorporación. `contar` (el texto del aviso) cae en "jugó." para acciones que no conoce.
- **Pendiente de integración:** la barra de `VistaDePartida` sigue diciendo "Elegí un país tuyo…" en el turno de la computadora (el aviso de abajo aclara quién juega). Conviene que la integración la cambie, o marque a los jugadores de la computadora en el orden de juego.
- **Code review contra `main` (2026-10-21):** se arregló el vocabulario (`Jugada` está en la lista de palabras a evitar de **Turno**; "Compu" se parecía demasiado a "CPU"; `Tablero` pasó a `Panorama`, porque en el ADR 0001 "tablero" es la imagen), la pausa y lo último que hizo la computadora ya no pasan de una partida a otra, `inert` se pone antes de pintar y el test de "no ataca desde 1 ejército" ahora tiene otro país que sí puede atacar. Quedaron sin cambiar, a propósito: `cuantosPasan` pasa siempre el máximo cuando el conquistado sigue en la frontera (alcanza para un rival entretenido), y no hay tests de la pantalla ni del guardado (la spec pide verificarlos jugando en el navegador).

