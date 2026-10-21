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
Ronda en la que, en su turno, cada jugador puede atacar, después reagrupar y después pedir tarjeta.

**Ronda de incorporación**:
Ronda en la que, en su turno, cada jugador pone ejércitos nuevos en sus países.

**Ronda inicial**:
Cada una de las dos rondas de incorporación con que empieza una partida, de 5 y de 3 ejércitos, antes de la primera ronda de ataque.

**Turno**:
La parte de una ronda que le corresponde a un jugador.
_Avoid_: Jugada, mano

## Ganar y perder

**Destruir**:
Quitarle a un jugador su último país. El jugador destruido queda eliminado de la partida.
_Avoid_: Matar, eliminar (como acción de otro jugador)

**Objetivo común**:
Ocupar 30 países. Es una condición de victoria que vale para todos los jugadores.
