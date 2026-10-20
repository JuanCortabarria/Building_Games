# Material de referencia del TEG

Fuentes que aportó el usuario. Son **hechos sobre el juego de mesa**, no decisiones sobre la aplicación: las decisiones salen del grilling y quedan en `GLOSSARY.md` y `docs/adr/`.

- [`teg-reglas.md`](./teg-reglas.md): guía de reglas del T.E.G. clásico, escrita con palabras propias (no es el manual oficial).
- [`teg-tablero.webp`](./teg-tablero.webp): imagen ilustrativa del tablero. Sirve como referencia visual, **no** como fuente de los límites.
- [`teg-limites.md`](./teg-limites.md): los 89 pares de países limítrofes del TEG clásico, sacados del TEG digital de Ricardo Quesada.
- [`teg-tarjetas-y-objetivos.md`](./teg-tarjetas-y-objetivos.md): las 50 tarjetas de país con su símbolo, los 15 objetivos secretos y el objetivo común.

## Inconsistencias y huecos conocidos

Se relevaron comparando las dos fuentes entre sí (2026-10-20). Cada uno es una pregunta abierta para el grilling, no una decisión tomada.

### El tablero y las reglas no coinciden del todo

Los 50 países rotulados en el tablero coinciden con los de las reglas, y la cantidad por continente también. Quedan estas diferencias:

- **África:** el tablero tiene una región **sin nombre** al oeste de Zaire y al sur del Sahara. Las reglas y la leyenda dicen 6 países. *Resuelto en el grilling: es decoración, no un país.*
- **Oceanía:** hay islas chicas sin nombre al este de Borneo. *Resuelto en el grilling: son decoración.*
- **Colores:** América del Norte y África usan casi el mismo tono.

### Los límites salen de `teg-limites.md`, no de la imagen

Las reglas no listan los pares limítrofes, y la imagen no coincide con el TEG clásico: por ejemplo, dibuja a Tartaria pegada a Rusia, y no son limítrofes. Los límites salen de [`teg-limites.md`](./teg-limites.md).

### Las reglas dejan puntos a "según tu edición"

- El reparto inicial cuando los 50 países no se dividen exacto entre los jugadores.
- Cuánto valen las fichas grandes.
- Las restricciones exactas del reagrupamiento.
- Qué pasa con el objetivo de destrucción cuando otro jugador destruye a tu víctima.
- La variante de 2 o 3 jugadores (color neutral o solo objetivo común).
