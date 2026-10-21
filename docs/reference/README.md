# Material de referencia del TEG

Fuentes que aportó el usuario. Son **hechos sobre el juego de mesa**, no decisiones sobre la aplicación: las decisiones salen del grilling y quedan en `GLOSSARY.md` y `docs/adr/`.

- [`teg-reglas.md`](./teg-reglas.md): guía de reglas del T.E.G. clásico, escrita con palabras propias (no es el manual oficial).
- [`teg-tablero.webp`](./teg-tablero.webp): el tablero propio que dibujó el usuario (versión del 2026-10-21). **Es la fuente de los límites del juego.**
- [`tablero-limites.md`](./tablero-limites.md): los 97 pares de países limítrofes leídos del tablero propio, con las diferencias con el clásico y cómo se leyeron los casos dudosos.
- [`teg-limites.md`](./teg-limites.md): los 89 pares de países limítrofes del TEG clásico, sacados del TEG digital de Ricardo Quesada. Queda como referencia y para decidir los casos en que el tablero es ambiguo.
- [`teg-tarjetas-y-objetivos.md`](./teg-tarjetas-y-objetivos.md): las 50 tarjetas de país con su símbolo, los 15 objetivos secretos y el objetivo común.

## Inconsistencias y huecos conocidos

Se relevaron comparando las dos fuentes entre sí (2026-10-20). Cada uno es una pregunta abierta para el grilling, no una decisión tomada.

### El tablero y las reglas no coinciden del todo

Los 50 países rotulados en el tablero coinciden con los de las reglas, y la cantidad por continente también. Quedan estas diferencias:

- **Tierras sin nombre:** la isla al norte de Yukón, la isla al oeste de Gran Bretaña y las islas chicas al este de Borneo son decoración, no países. (El primer tablero tenía además una región sin nombre al oeste de Zaire; el tablero nuevo ya no la tiene.)
- **Colores:** América del Norte y África usan casi el mismo tono.

### Los límites salen del tablero propio

El primer tablero no coincidía con el TEG clásico (por ejemplo, dibujaba a Tartaria pegada a Rusia) y se usaban los límites del clásico. Desde el 2026-10-21 el usuario rehízo el tablero con sus propias conexiones y ese tablero manda: ver [`tablero-limites.md`](./tablero-limites.md) y [`docs/adr/0001-los-limites-salen-del-tablero.md`](../adr/0001-los-limites-salen-del-tablero.md).

### Las reglas dejan puntos a "según tu edición"

- El reparto inicial cuando los 50 países no se dividen exacto entre los jugadores.
- Cuánto valen las fichas grandes.
- Las restricciones exactas del reagrupamiento.
- Qué pasa con el objetivo de destrucción cuando otro jugador destruye a tu víctima.
- La variante de 2 o 3 jugadores (color neutral o solo objetivo común).
