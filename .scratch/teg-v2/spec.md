# Spec: TEG v2, la partida completa

**Status:** ready-for-agent

## Problem Statement

La v1 (`.scratch/teg/spec.md`) juega la conquista: reparto, rondas, incorporación, ataque, conquista, reagrupamiento y victoria a los 30 países. Le falta lo que hace entretenido al TEG de mesa: las tarjetas y sus canjes, que aceleran la partida; los objetivos secretos, que hacen que cada jugador busque otra cosa; poder jugar aunque falten personas; y un tablero que se vea como el de verdad y cuente lo que pasa. El usuario pidió (2026-10-21) "mucho más funcional, mucho más divertido y entretenido de jugar", sobre el tablero propio y con tests como base.

## Solution

Sobre el motor de la v1 se suman las tarjetas de país con sus canjes, los objetivos secretos con el objetivo común, jugadores manejados por la computadora, un registro de lo que pasa en la partida y una pantalla de victoria. La pantalla pasa al tablero ilustrado con fichas (`docs/reference/teg-tablero.webp`). Todo sigue en español, en una pantalla compartida y en local.

## User Stories

### Tarjetas y canjes

1. Como jugador, quiero recibir una tarjeta de país al terminar mi turno de ataque si conquisté al menos un país, para juntar tarjetas como en la mesa.
2. Como jugador, quiero que después de mi tercer canje me pidan conquistar al menos dos países en el turno para recibir tarjeta, para respetar las reglas.
3. Como jugador, quiero que, si la tarjeta que recibo es de un país que ocupo, se pongan 2 ejércitos en ese país, para aprovecharla.
4. Como jugador, quiero canjear 3 tarjetas (mismo símbolo o los tres distintos, con el comodín valiendo cualquiera) en mi turno de incorporación, para recibir más ejércitos.
5. Como jugador, quiero que cada canje mío valga más que el anterior (4, 7, 10 y después 5 más cada vez), para que guardar tarjetas tenga sentido.
6. Como jugador, quiero quedarme con las tarjetas del jugador que destruyo, como dicen las reglas.
7. Como jugador, quiero ver mis tarjetas con su símbolo y cuánto vale mi próximo canje, y saber cuántas tarjetas tiene cada rival.

### Objetivos

8. Como jugador, quiero elegir al crear la partida si se juega con objetivos secretos o solo con el objetivo común.
9. Como jugador, quiero recibir un objetivo secreto al azar al empezar la partida.
10. Como jugador, quiero ver mi objetivo cuando es mi turno, sin que los demás lo vean si no quiero.
11. Como jugador, quiero ganar en el momento en que cumplo mi objetivo secreto o el común.
12. Como jugador con un objetivo de destrucción, quiero que, si mi color a destruir es el mío o no está en juego, mi objetivo pase a destruir al jugador siguiente en el orden de juego.
13. Como jugador con un objetivo de destrucción, quiero que, si otro destruye a mi víctima, me quede el objetivo común, para no quedar sin forma de ganar.
14. Como jugadores, queremos un telón entre turnos cuando hay objetivos secretos, para pasarnos la pantalla sin ver lo del otro.

### Jugadores de la computadora

15. Como jugador, quiero que algunos de los jugadores sean manejados por la computadora, para jugar aunque seamos pocos o esté solo.
16. Como jugador, quiero ver qué hace la computadora a un ritmo que se pueda seguir, para entender la partida.
17. Como jugador, quiero que la computadora juegue con sentido (reforzar fronteras, atacar con ventaja, buscar continentes, canjear, perseguir su objetivo), para que sea un rival entretenido.

### Tablero y registro

18. Como jugador, quiero jugar sobre el tablero ilustrado con una ficha por país (ticket `teg/12`).
19. Como jugador, quiero que antes de poner ejércitos la pantalla me diga cuántos extra tengo por continente y dónde van (ticket `teg/09`).
20. Como jugador, quiero ver un registro de lo que pasó (ataques con sus dados, conquistas, canjes, tarjetas, destrucciones), para seguir la partida aunque no esté mirando.
21. Como jugador, quiero una pantalla de victoria que diga quién ganó y por qué, y muestre los objetivos de todos.

## Implementation Decisions

Decididas por el agente sin grilling, porque el usuario pidió avanzar sin preguntas (2026-10-21). Son fáciles de revertir y cada una queda anotada acá.

- **El mazo** son las 50 tarjetas de `docs/reference/teg-tarjetas-y-objetivos.md` (17 galeones, 16 cañones, 15 globos y 2 comodines). Se mezcla al crear la partida con la fuente de azar. Las tarjetas canjeadas forman un descarte; cuando el mazo se vacía, el descarte se mezcla y pasa a ser el mazo. Si no hay tarjetas ni en el mazo ni en el descarte, no se recibe tarjeta.
- **Recibir tarjeta** pasa al pasar el turno en una ronda de ataque, si el jugador conquistó en ese turno al menos 1 país (al menos 2 si ya hizo 3 canjes o más). No hay límite de tarjetas en la mano.
- **Los 2 ejércitos por tarjeta** se ponen solos en el país al recibir la tarjeta, si el jugador lo ocupa. Si no lo ocupa en ese momento, esa tarjeta ya no da ejércitos.
- **El canje** es una acción del jugador en su turno de una ronda de incorporación que no sea inicial, en cualquier momento de ese turno. Lo canjeado se suma a los ejércitos generales por poner. Valores: 4, 7, 10, 15, 20…
- **Destruir** a un jugador le pasa sus tarjetas al que lo destruyó.
- **Objetivos:** los 15 de la referencia (9 de ocupación y 6 de destrucción) se reparten al azar sin repetir. "N países de un continente" es "al menos N". El objetivo 2 pide además 3 países propios fuera de América del Sur y de Europa que formen un grupo conectado (cada uno limítrofe de al menos otro de los tres). "El jugador de la derecha" es el siguiente jugador vivo en el orden de juego. Si otro jugador destruye a la víctima, el objetivo pasa a ser solo el común.
- **Victoria:** se controla para el jugador en turno después de cada acción que cambia quién ocupa un país. Gana si cumple su objetivo secreto o el común (30 países).
- **Modo de partida:** "con objetivos secretos" (por defecto) o "solo objetivo común", al crearla.
- **Información oculta (cambia la v1):** las tarjetas y el objetivo de cada jugador solo se muestran en su turno; de los rivales se ve la cantidad de tarjetas. Con objetivos secretos y al menos 2 personas, entre turnos de personas aparece un telón que hay que tocar para empezar el turno.
- **Jugadores de la computadora:** el motor no sabe quién es persona y quién computadora; lo sabe la interfaz y se guarda junto con la partida. La estrategia vive en un módulo propio (`src/rivales/`) que, dada una partida, elige la próxima acción del jugador en turno usando solo la interfaz pública del motor. La pantalla aplica sus acciones de a una, con una pausa corta para que se puedan seguir.
- **Registro:** el motor anota cada evento de la partida (incorporación, tirada, conquista, destrucción, reagrupamiento, canje, tarjeta recibida, fin de turno, victoria) y lo expone en una consulta. El estado guarda los últimos 200.
- **Guardado:** cada cambio en la forma del estado sube la `VERSION` de `src/interfaz/guardado.ts`.

## Testing Decisions

- Igual que la v1: un solo seam, la interfaz pública del motor; dados y mezclas controlados con una fuente de azar fijada a mano; situaciones a mitad de partida con `restaurarPartida`. Los valores esperados salen de las reglas, no de recalcularlos como el motor.
- El módulo de rivales se testea por su función pública contra el motor real: que nunca elija una acción que el motor rechace, que juegue partidas completas entre computadoras hasta que alguien gane, y comportamientos concretos (por ejemplo, que pone los extra de un continente en ese continente).
- La interfaz en React se verifica jugando en el navegador.

## Out of Scope

- Pactos, juego en red, deshacer, más de una partida guardada, publicar en internet, color neutral para 2 o 3 jugadores.

## Tickets

En `.scratch/teg-v2/issues/`, más `teg/09` y `teg/12` de la v1. `teg/13` se cierra: el tablero nuevo ya dibuja todas sus conexiones.
