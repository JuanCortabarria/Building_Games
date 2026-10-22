# TEG

El T.E.G. (Plan Táctico y Estratégico de la Guerra) llevado a una aplicación: jugadores que compiten por ocupar el mapa del mundo con sus ejércitos.

## El mapa

**País**:
Cada uno de los 50 lugares del mapa clásico que un jugador puede ocupar.
_Avoid_: Territorio, región, casilla

**Continente**:
Grupo fijo de países. Quien ocupa todos los países de un continente recibe ejércitos extra.
_Avoid_: Región, zona

**Limítrofe**:
Relación entre dos países que permite atacar o reagrupar de uno a otro, ya sea por frontera o por una ruta marítima. Es simétrica.
_Avoid_: Vecino, adyacente, conectado

## Jugadores

**Jugador**:
Quien juega una partida: una persona o la computadora. Se lo nombra por su nombre y tiene un color propio.
_Avoid_: Ejército (para referirse a un jugador), participante, usuario

**Jugador de la computadora**:
Jugador cuyos turnos juega la aplicación sola, eligiendo cada acción con una estrategia. Para el motor es un jugador como cualquier otro: quién es de la computadora lo sabe la pantalla.
_Avoid_: Bot, IA, CPU, jugador artificial

**Color**:
Uno de seis colores (azul, rojo, negro, amarillo, verde y magenta) que identifica a los ejércitos de un jugador durante una partida. Los objetivos de destrucción apuntan a un color, no a un nombre.

## Ejércitos

**Ejército**:
La unidad que un jugador pone en un país. Un país siempre tiene al menos un ejército de su ocupante.
_Avoid_: Ficha, tropa, unidad, soldado

**Reagrupar**:
Mover ejércitos propios de un país a otro país propio al que se llega pasando solo por países propios limítrofes, sin límite de distancia.
_Avoid_: Mover, fortificar

## El tiempo de juego

**Partida**:
Un juego completo, desde el reparto de los países hasta que un jugador gana.
_Avoid_: Juego, sesión

**Ronda**:
Vuelta completa en la que cada jugador juega un turno. Las rondas son de ataque o de incorporación, y se alternan.
_Avoid_: Vuelta

**Ronda de ataque**:
Ronda en la que, en su turno, cada jugador puede atacar y después reagrupar. Al pasar el turno recibe una tarjeta de país si conquistó lo suficiente.

**Ronda de incorporación**:
Ronda en la que, en su turno, cada jugador pone ejércitos nuevos en sus países.

**Ronda inicial**:
Cada una de las dos rondas de incorporación con que empieza una partida, de 5 y de 3 ejércitos, antes de la primera ronda de ataque.

**Turno**:
La parte de una ronda que le corresponde a un jugador.
_Avoid_: Jugada, mano

## Tarjetas

**Tarjeta de país**:
Cada una de las 50 tarjetas del juego, una por país, con un símbolo: galeón, cañón, globo o comodín. Un jugador recibe una al terminar su turno de ataque si conquistó al menos un país en ese turno (al menos dos después de su tercer canje); si ocupa el país de la tarjeta, se ponen 2 ejércitos ahí.
_Avoid_: Carta, naipe

**Símbolo**:
El dibujo de una tarjeta de país: galeón, cañón, globo o comodín. Hay 17 galeones, 16 cañones, 15 globos y 2 comodines.
_Avoid_: Figura, palo

**Mazo**:
Las tarjetas de país que todavía no recibió nadie, mezcladas y boca abajo.
_Avoid_: Pila, baraja

**Descarte**:
Las tarjetas de país canjeadas. Cuando el mazo se acaba, el descarte se mezcla y pasa a ser el mazo.

**Canje**:
Entregar 3 tarjetas de país del mismo símbolo o de los tres símbolos distintos (el comodín vale por cualquiera) en el turno de una ronda de incorporación que no sea inicial, a cambio de ejércitos: 4 el primero de cada jugador, 7 el segundo, 10 el tercero y después 5 más cada vez.
_Avoid_: Cambio, intercambio

## Ganar y perder

**Destruir**:
Quitarle a un jugador su último país. El jugador destruido queda eliminado de la partida, y quien lo destruyó se queda con sus tarjetas de país.
_Avoid_: Matar, eliminar (como acción de otro jugador)

**Objetivo común**:
Ocupar 30 países. Es una condición de victoria que vale para todos los jugadores.

**Objetivo secreto**:
Condición de victoria propia de cada jugador, recibida al azar al empezar la partida entre 15: 9 de ocupación (continentes enteros y cantidades mínimas de países de otros) y 6 de destrucción, uno por color. Un objetivo de destrucción apunta a una víctima: el jugador de ese color, o el siguiente en el orden de juego si el color es el propio o no está en juego; si a la víctima la destruye otro jugador, al dueño del objetivo le queda solo el objetivo común. Quien cumple su objetivo secreto o el común después de una conquista gana en el acto.
_Avoid_: Misión, meta, carta de objetivo

**Modo de partida**:
Cómo se gana una partida, elegido al crearla: con objetivos secretos (cada jugador gana con el suyo o con el objetivo común) o solo con el objetivo común.

**Telón**:
Pantalla que tapa la partida entre turnos de personas, cuando se juega con objetivos secretos y hay al menos 2 personas, para pasarse la pantalla sin ver las tarjetas ni el objetivo del otro. Se levanta tocándola.
_Avoid_: Cortina, pantalla de espera
