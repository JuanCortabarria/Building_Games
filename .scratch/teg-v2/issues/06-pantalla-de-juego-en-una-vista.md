# 06: La pantalla de juego en una sola vista

**What to build:** reordenar la pantalla de partida para que se juegue mirando el tablero, sin desplazarse. Hoy, con los paneles de turno, tarjetas, orden de juego y "Lo que pasó" apilados arriba, el tablero empieza a más de 1100 px del borde superior. También pulir la creación de la partida. No cambia ninguna regla: todo sale de las consultas del motor.

**Blocked by:** 03 (objetivos, telón y victoria), porque toca los mismos componentes de pantalla.

**Status:** ready-for-agent

- [ ] En una pantalla de 1280×720 o más grande, el tablero y la barra de la acción en curso se ven enteros sin desplazarse. Al costado del tablero hay un panel con: el turno y la ronda; cada jugador con su color, cuántos países y ejércitos tiene y cuántas tarjetas; las tarjetas y el objetivo del jugador en turno (plegables); y "Lo que pasó" con desplazamiento propio y altura acotada.
- [ ] En pantallas angostas (menos de unos 1100 px), el panel pasa debajo del tablero y el tablero sigue entrando a lo ancho.
- [ ] La barra de la acción (qué hacer ahora, dados de la última tirada, mover al conquistado, botones) queda pegada al tablero y no lo tapa.
- [ ] Crear partida: si una persona no escribe nombre, se usa el que se ve sugerido (como ya pasa con la computadora); muestras de color en vez de solo texto; un encabezado con el nombre del juego. El modo de partida (con objetivos o solo común) se ve claro.
- [ ] Se ve como un juego: una paleta y tipografía coherentes con el tablero ilustrado, buen contraste, y nada que se desarme entre 1024 y 1920 px de ancho.
- [ ] Verificado en el navegador a 1280×720, 1920×1080 y 1024×768, jugando una partida con una persona y dos computadoras. `npm run typecheck` y `npm test` pasan.
