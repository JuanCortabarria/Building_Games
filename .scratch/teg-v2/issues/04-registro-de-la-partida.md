# 04: Registro de la partida y dados que se ven

**What to build:** que el motor anote cada evento de la partida y lo exponga, y que la pantalla muestre un registro legible ("Ana atacó Chile desde Argentina: 6 5 3 contra 4 2. Beto perdió 2.") y los dados de la última tirada con caras de dado y una animación corta. Decisiones en `.scratch/teg-v2/spec.md` (historia 20).

**Blocked by:** 01 (Tarjetas y canjes), para registrar también canjes y tarjetas y no pisarse en el motor.

**Status:** done

- [x] Eventos: incorporó (país y cantidad), tiró (los dos lados, dados y pérdidas), conquistó, destruyó, movió al conquistado, reagrupó, canjeó (y cuánto recibió), recibió tarjeta (y si puso 2 ejércitos), pasó el turno, empezó una ronda, ganó. Cada uno con el número de ronda y el color del jugador.
- [x] El estado guarda los últimos 200 eventos; una consulta los devuelve en orden. Sube la `VERSION`.
- [x] Tests en el seam del motor: cada acción deja su evento con los datos correctos.
- [x] Pantalla: panel "Lo que pasó" con los últimos eventos en frases en español, el más nuevo arriba y con el color de cada jugador; los dados de la última tirada como caras de dado, con una animación corta al tirar; la conquista y la destrucción se destacan.
- [x] `npm run typecheck` y `npm test` pasan.

## Comments

**2026-10-21, agente (sin preguntas, a pedido del usuario).** Decisiones tomadas:

- **Dónde vive:** `src/motor/registro.ts`. Los eventos se derivan del estado de antes y de después de cada acción, y se anotan en un solo punto de `aplicar`. Así las funciones de cada acción de `partida.ts` no cambiaron, y la integración con objetivos secretos es simple.
- **Forma:** `{ orden, ronda, color } & DatosDelEvento`, una unión discriminada por `tipo`:
  - `incorporo`
  - `tiro`
  - `conquisto`
  - `destruyo`
  - `movioAlConquistado`
  - `reagrupo`
  - `canjeo`
  - `recibioTarjeta`
  - `pasoElTurno`
  - `empezoLaRonda`
  - `gano { motivo }`
- **La ronda entera, no solo su número:** la incorporación N y el ataque N comparten número, y las iniciales se distinguen por `inicial`.
- **`orden`:** numera los eventos de la partida y no se repite aunque se descarten los viejos.
- **Incorporaciones juntas:** las seguidas del mismo jugador en el mismo país, en su turno, se anotan como una sola con el total. Poner de a 1 ejército no llena el tope de 200.
- **Comienzo de la partida:** arranca con "empezó la ronda inicial 1", a nombre del primero en jugar.
- **Tarjeta recibida:** el evento guarda el país, pero la pantalla solo lo nombra si se pusieron los 2 ejércitos. Si no, es un secreto de quien la recibió ("Información oculta").
- **Destrucción:** el evento dice cuántas tarjetas se quedó el que destruyó.
- **El motivo de "ganó"** por ahora es solo `objetivoComun`. Objetivos secretos (ticket 03) le suma variantes y cambia `motivoDeVictoria()` en `registro.ts`.
- **Dados:** la comparación de a pares pasó a `src/motor/dados.ts` (`compararDados`). La usan el ataque del motor y la pantalla, que marca qué dado ganó su par y apaga el que lo perdió.
- **Pantalla:**
  - El panel es `src/interfaz/LoQuePaso.tsx`; las caras de dado, `src/interfaz/Dados.tsx`; los estilos, `src/interfaz/registro.css`, para no chocar con el tablero nuevo en `estilos.css`.
  - En `VistaDePartida.tsx` solo se monta el panel después de "Orden de juego" y se cambian los dados de la barra del mapa.
  - Las reglas `.dado` y `.dados` de `estilos.css` quedaron sin uso: se pueden borrar al integrar.
- **"Registro"** se sumó a `GLOSSARY.md`.
- **Probado en el navegador:**
  - Una partida entera entre 3 computadoras: el registro se llena, queda en 200 y termina con "ganó".
  - Un ataque de una persona: los dados ruedan en cada tirada.
  - Una destrucción real y un registro armado con todos los tipos de evento, para ver cómo se ve cada uno.

