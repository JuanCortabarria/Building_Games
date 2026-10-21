# Spec: TEG v1, la conquista

**Status:** ready-for-agent

## Problem Statement

Para jugar al TEG hace falta el juego de cartón, una mesa y que alguien lleve la cuenta: cuántos ejércitos le tocan a cada uno, quién tiene cada continente, de quién es el turno, qué países son limítrofes y si una tirada de dados se resolvió bien. Una partida dura horas, y si se desarma la mesa se pierde. Hoy no hay una forma de jugar al TEG clásico en la computadora, con las reglas que este grupo de jugadores usa, en la que las cuentas y las reglas las aplique el juego y no las personas.

## Solution

Una aplicación web, en español, en la que de 2 a 6 jugadores comparten una pantalla y juegan una partida completa de TEG en su versión de conquista. Se usa el mapa clásico de 50 países y 6 continentes. La aplicación reparte los países, sortea el orden, lleva las rondas y los turnos, calcula los ejércitos a incorporar, tira y compara los dados, impide las acciones que las reglas no permiten y declara ganador al primer jugador que ocupa 30 países. La partida se guarda sola: si se recarga la página, sigue donde estaba.

## User Stories

### Empezar una partida

1. Como jugador, quiero crear una partida nueva indicando entre 2 y 6 jugadores, para poder jugar con los que estemos.
2. Como jugador, quiero escribir mi nombre, para que la pantalla me nombre a mí y no a un número.
3. Como jugador, quiero elegir mi color entre azul, rojo, negro, amarillo, verde y magenta, para reconocer mis ejércitos en el mapa.
4. Como jugador, quiero que la aplicación no deje elegir un color que ya eligió otro, para que no haya dos jugadores iguales en el mapa.
5. Como jugador, quiero que no se pueda crear una partida con menos de 2 o más de 6 jugadores, para respetar las reglas del juego.
6. Como jugador, quiero que el orden de juego se sortee, para que nadie tenga ventaja por cómo se anotó.
7. Como jugador, quiero que los 50 países se mezclen y se repartan de a uno en el orden de juego, para que el reparto sea justo como al repartir cartas.
8. Como jugador, quiero que, si los países no se dividen exacto, los primeros en el orden reciban un país más, para saber de antemano cómo queda el reparto.
9. Como jugador, quiero que cada país arranque con 1 ejército de su ocupante, para que todo el mapa esté ocupado desde el principio.

### Rondas iniciales

10. Como jugador, quiero una primera ronda inicial en la que cada jugador pone 5 ejércitos en sus países, en el orden de juego, para armar mi posición antes de pelear.
11. Como jugador, quiero una segunda ronda inicial en la que cada jugador pone 3 ejércitos, en el mismo orden que la primera, para terminar de prepararme.
12. Como jugador, quiero poder repartir los ejércitos de la ronda inicial entre mis países como quiera, para elegir dónde reforzarme.
13. Como jugador, quiero que la aplicación no me deje poner ejércitos en un país que no ocupo, para respetar las reglas.

### Rondas y turnos

14. Como jugador, quiero que después de las rondas iniciales empiece una ronda de ataque, en el mismo orden de juego, para que la partida arranque como en la mesa.
15. Como jugador, quiero que las rondas de ataque y de incorporación se alternen, para jugar con el ritmo del TEG clásico.
16. Como jugador, quiero que cada ronda de incorporación la abra el jugador siguiente al que abrió la anterior, para que la ventaja de jugar primero vaya rotando.
17. Como jugador, quiero que la ronda de ataque que sigue a una ronda de incorporación tenga el mismo orden que esa incorporación, para atacar en el mismo orden en que me reforcé.
18. Como jugador, quiero ver siempre de quién es el turno, con su nombre y su color, para saber a quién le toca la pantalla.
19. Como jugador, quiero ver siempre qué ronda se está jugando y de qué tipo es, para entender qué acciones se pueden hacer.
20. Como jugador, quiero que un jugador destruido ya no tenga turnos y que el resto mantenga su orden, para que la partida siga sin él.

### Incorporación

21. Como jugador, quiero recibir en mi turno de incorporación la mitad de mis países, sin decimales y con un mínimo de 3, para reforzarme según cuánto ocupo.
22. Como jugador, quiero recibir además los ejércitos extra de cada continente que ocupo entero (América del Sur 3, América del Norte 5, Europa 5, Asia 7, África 3, Oceanía 2), para que valga la pena completar continentes.
23. Como jugador, quiero que los ejércitos extra de un continente solo se puedan poner en países de ese continente, para respetar las reglas.
24. Como jugador, quiero ver cuántos ejércitos me quedan por poner y de dónde salen, para no tener que hacer la cuenta.
25. Como jugador, quiero que la aplicación no me deje pasar el turno de incorporación hasta poner todos mis ejércitos, porque en el TEG no se guardan ejércitos para después.
26. Como jugador, quiero que la cantidad de ejércitos a incorporar se calcule con los países que tengo al empezar mi turno de incorporación, para que el cálculo sea predecible.

### Ataque

27. Como jugador, en la ronda de ataque, quiero atacar desde un país mío a un país limítrofe de otro jugador, para conquistar países.
28. Como jugador, quiero que la aplicación no me deje atacar a un país que no es limítrofe, para respetar el mapa.
29. Como jugador, quiero que la aplicación no me deje atacar a un país propio, para no cometer errores.
30. Como jugador, quiero que la aplicación no me deje atacar desde un país con un solo ejército, porque siempre tiene que quedar uno custodiándolo.
31. Como jugador, quiero que cada vez que ataco se haga una sola tirada de dados, para seguir la pelea tirada por tirada como en la mesa.
32. Como atacante, quiero tirar tantos dados como ejércitos tenga en el país menos uno, con un máximo de 3, para respetar las reglas.
33. Como defensor, quiero tirar un dado por cada ejército de mi país, con un máximo de 3, para defenderme como dicen las reglas.
34. Como jugador, quiero que los dados de cada lado se ordenen de mayor a menor y se comparen de a pares, para resolver el combate según las reglas.
35. Como defensor, quiero ganar los empates, porque así lo dicen las reglas.
36. Como jugador, quiero que solo se comparen tantos pares como dados tenga el lado que tiró menos, para respetar las reglas.
37. Como jugador, quiero ver los dados de los dos lados y cuántos ejércitos perdió cada uno en cada tirada, para entender qué pasó.
38. Como jugador, quiero atacar tantas veces como quiera en mi turno, desde uno o varios países, para llevar adelante mi estrategia.
39. Como jugador, quiero poder no atacar en mi turno, porque atacar es opcional.

### Conquista

40. Como atacante, quiero ocupar el país atacado cuando se queda sin ejércitos, para conquistarlo.
41. Como atacante, quiero elegir cuántos ejércitos muevo al país conquistado, entre 1 y 3, siempre dejando al menos 1 en el país desde el que ataqué, para decidir cuánto me expongo.
42. Como jugador, quiero que el país conquistado pase a mostrar mi color, para ver el mapa actualizado.
43. Como jugador, quiero que, cuando un jugador pierde su último país, quede destruido y eliminado de la partida, para que el juego siga solo con los que quedan.

### Reagrupar

44. Como jugador, al terminar de atacar, quiero reagrupar ejércitos entre mis países, para preparar mi defensa.
45. Como jugador, quiero mover ejércitos de un país mío a cualquier otro país mío al que se llegue pasando solo por países míos limítrofes, sin límite de distancia, para reorganizarme sin restricciones artificiales.
46. Como jugador, quiero que la aplicación no me deje reagrupar hacia un país al que no llego pasando por países míos, para respetar el mapa.
47. Como jugador, quiero que la aplicación no me deje dejar ningún país con 0 ejércitos, porque cada país siempre tiene al menos 1 ejército.
48. Como jugador, quiero que la aplicación no me deje atacar después de haber empezado a reagrupar, para respetar el orden del turno.
49. Como jugador, quiero poder no reagrupar, porque reagrupar es opcional.
50. Como jugador, quiero pasar el turno cuando terminé, para que juegue el siguiente.

### Ganar

51. Como jugador, quiero ganar en el momento en que ocupo 30 países, aunque esté en medio de mi ataque, para que el objetivo común se cumpla en el acto.
52. Como jugador, quiero ver claramente quién ganó y que la partida termine ahí, para que no se puedan hacer más acciones.
53. Como jugador, quiero que, si destruyo al último rival, también gane, porque en ese caso ocupo los 50 países.

### Mapa

54. Como jugador, quiero ver los 50 países agrupados por continente, para ubicarme en el mapa.
55. Como jugador, quiero ver en cada país el color de su ocupante y cuántos ejércitos tiene, para leer la situación de un vistazo.
56. Como jugador, quiero ver qué países son limítrofes entre sí, incluidos los que cruzan el mar como Kamchatka y Alaska, para planear ataques y reagrupamientos.
57. Como jugador, quiero hacer las acciones eligiendo países en el mapa, para jugar sin escribir nombres.
58. Como jugador, quiero que la aplicación me diga por qué una acción no está permitida, para entender las reglas cuando me equivoco.

### Guardar

59. Como jugador, quiero que la partida se guarde sola después de cada acción, para no perderla si recargo o cierro la página.
60. Como jugador, quiero que al volver a abrir la aplicación la partida siga exactamente donde estaba, para retomar una partida larga.
61. Como jugador, quiero poder empezar una partida nueva cuando hay una guardada, para no quedar atado a la anterior.

## Implementation Decisions

### Módulos

- **Motor del juego.** Contiene todas las reglas y no sabe nada de pantallas ni del navegador. Es puro: recibe un estado de partida y una acción, y devuelve el nuevo estado o un error que explica qué regla impide la acción. Es el módulo profundo del proyecto: mucho comportamiento detrás de una interfaz chica.
- **Datos del mapa.** Los 50 países, los 6 continentes con sus ejércitos extra y los 97 pares limítrofes. Los países y continentes son los del TEG clásico; los límites son los del tablero propio (`docs/reference/teg-tablero.webp`, listados en `docs/reference/tablero-limites.md`; ver `docs/adr/0001-los-limites-salen-del-tablero.md`).
- **Interfaz.** Una aplicación en React que muestra el estado de la partida y traduce los clics a acciones del motor. No contiene reglas.
- **Guardado.** Guarda el estado de la partida en el almacenamiento del navegador después de cada acción, y lo restaura al abrir la aplicación. Hay una sola partida guardada a la vez.

### Interfaz del motor

- **Crear partida:** recibe los jugadores (nombre y color) y una fuente de azar. Sortea el orden de juego, reparte los países y deja la partida en la primera ronda inicial.
- **Aplicar acción:** recibe el estado y una acción, y devuelve el nuevo estado o un error. Las acciones son: incorporar ejércitos en un país, atacar de un país a otro, mover ejércitos a un país recién conquistado, reagrupar ejércitos entre dos países y pasar el turno.
- **Restaurar partida:** recibe un estado guardado y continúa desde ahí.
- **Consultas:** de quién es el turno, qué ronda se juega y de qué tipo, cuántos ejércitos le quedan por incorporar al jugador en turno y en qué continentes, qué países son limítrofes, el resultado de la última tirada, y si hay ganador.

### Decisiones de diseño

- El estado de la partida es un dato simple que se puede guardar y restaurar tal cual.
- **El azar entra por parámetro.** El motor no tira dados por su cuenta: los pide a una fuente de azar recibida al crear o restaurar la partida. En la aplicación es una fuente con semilla; en los tests, una lista de dados fijada a mano. La semilla es parte de lo guardado, de modo que una partida restaurada sigue la misma secuencia.
- **Orden de rondas:** dos rondas iniciales (5 y 3 ejércitos) con el orden sorteado; después se alternan rondas de ataque y de incorporación. Cada ronda de incorporación la abre el jugador siguiente al que abrió la anterior, y la ronda de ataque que la sigue usa el mismo orden. Los jugadores destruidos se saltean. "El siguiente" es el primer jugador vivo sentado después del que abrió la anterior, aunque ese ya esté destruido (decidido con el prototipo de la rama `prototype/rotacion-de-rondas`; ver el ticket 05).
- **Turno de ataque:** primero atacar (opcional y repetible), después reagrupar (opcional) y después pasar el turno. Una vez que se reagrupa, ya no se puede atacar en ese turno. Después de una conquista, el atacante debe mover ejércitos al país conquistado antes de cualquier otra acción.
- **Reagrupar** es posible entre dos países propios cuando existe un camino de países propios limítrofes entre ellos, sin límite de distancia. Cada país conserva al menos 1 ejército.
- **Victoria:** gana el primer jugador que ocupa 30 países, y la partida termina en ese momento. Se controla después de cada conquista, que es la única acción que cambia quién ocupa un país: el efecto es el mismo que controlarla después de cada acción (aprobado por el usuario al integrar el ticket 07).
- **Jugador destruido:** queda eliminado de la partida en el sentido de la historia 43 (no tiene más turnos, no abre rondas y se muestra como destruido), pero sigue en la lista de jugadores, porque la rotación de rondas cuenta desde su asiento (aprobado por el usuario al integrar el ticket 07).
- **Incorporación:** el total se calcula al empezar el turno, con los países que tiene el jugador en ese momento. Hay que poner todos los ejércitos antes de pasar el turno. Los ejércitos extra de un continente solo pueden ir a países de ese continente.
- **Mapa en pantalla:** la v1 se construyó con un esquema generado a partir de los datos del mapa (ticket 02). Se reemplaza por el tablero ilustrado (`docs/reference/teg-tablero.webp`) con una ficha por país, del color de su ocupante y con sus ejércitos; se elige un país tocando su ficha. Decidido con el prototipo de la rama `prototype/mapa-ilustrado` (variante B); ver el ticket 10. Desde el 2026-10-21 el tablero es el que rehízo el usuario y sus conexiones son los límites del juego, así que la imagen ya muestra todas las fronteras y rutas punteadas (antes se pensaba dibujar líneas encima porque la imagen no coincidía con el clásico; ver el ticket 13).
- **No hay información oculta:** todo el estado está a la vista de todos los jugadores.
- **No hay deshacer.**
- **Idioma:** español en la pantalla y en los nombres del dominio dentro del código, usando el vocabulario de `GLOSSARY.md`. La unidad se llama siempre Ejército.
- **Herramientas:** TypeScript, Vite, React y Vitest. La aplicación corre en local.

## Testing Decisions

- **Un solo seam: la interfaz pública del motor.** Todos los tests entran por crear, restaurar, aplicar acción y las consultas. Ningún test mira el interior del motor.
- **Qué es un buen test acá:** describe una regla del juego en palabras del dominio y la verifica por su efecto visible. Por ejemplo: "en un empate gana el defensor", "no se puede atacar a un país que no es limítrofe", "Juan gana al conquistar su país número 30". Un test tiene que seguir pasando aunque se reescriba el interior del motor, siempre que las reglas no cambien.
- **Dados controlados:** los tests usan una fuente de azar con los dados fijados a mano, de modo que el resultado de cada tirada se conoce de antemano. Los valores esperados salen de las reglas y de ejemplos resueltos a mano, nunca recalculados con la misma lógica que el motor.
- **Situaciones a mitad de partida:** se arman restaurando un estado construido para el caso (por ejemplo, un jugador con 29 países), en vez de jugar muchas rondas para llegar ahí.
- **Qué se testea:** reparto y sorteo, rondas iniciales, alternancia y rotación de rondas, cálculo de la incorporación y de los ejércitos extra por continente, todas las validaciones de ataque, la comparación de dados y los empates, la conquista y el movimiento posterior, el reagrupamiento a cualquier distancia, la destrucción y eliminación de un jugador, la victoria a los 30 países, y que una partida guardada y restaurada siga igual. También se verifica, a través de las consultas, que el mapa tenga 50 países, los 6 continentes correctos y los 97 pares limítrofes.
- **Qué no se testea en la v1:** la interfaz en React y el guardado en el navegador. Son capas finas y se verifican jugando la aplicación.
- **Antecedentes en el código:** ninguno. Es el primer código del repositorio; estos tests son los que van a servir de ejemplo para los que vengan.

## Out of Scope

- Tarjetas de país, pedido de tarjeta al final del turno y canjes.
- Objetivos secretos, incluidos los de destrucción de un color.
- Pactos entre jugadores.
- Juego en red y jugadores manejados por la computadora.
- Deshacer acciones.
- Más de una partida guardada, y partidas guardadas entre dispositivos.
- Ocultar información a algunos jugadores.
- Un botón de ataque continuo ("atacar hasta conquistar").
- Publicar la aplicación en internet.
- Variantes con color neutral para 2 o 3 jugadores.

## Further Notes

- La rama de objetivos secretos y tarjetas tiene ambigüedades ya anotadas en `docs/reference/teg-tarjetas-y-objetivos.md`, por ejemplo qué significa "el jugador de la derecha" en una pantalla compartida. Hay que resolverlas en su propio grilling antes de construir esa versión.
- Para que esas versiones entren sin rehacer el motor, el estado de la partida debería poder sumar más adelante el mazo de tarjetas, los objetivos y el número de canjes de cada jugador. No hace falta construir nada de eso ahora.
- Cómo se ve el mapa esquemático es una buena pregunta para `/prototype` en su variante de interfaz, antes de construir el ticket de pantalla.
- Durante el grilling no se registró ningún ADR. El reagrupamiento sin límite de distancia se aparta del TEG clásico de forma deliberada, pero es fácil de revertir.
