# Material de referencia del TEG

Fuentes que aportó el usuario. Son **hechos sobre el juego de mesa**, no decisiones sobre la aplicación: las decisiones salen del grilling y quedan en `GLOSSARY.md` y `docs/adr/`.

- [`teg-reglas.md`](./teg-reglas.md): guía de reglas del T.E.G. clásico, escrita con palabras propias (no es el manual oficial).
- [`teg-tablero.webp`](./teg-tablero.webp): imagen del tablero con los países y continentes.

## Inconsistencias y huecos conocidos

Se relevaron comparando las dos fuentes entre sí (2026-10-20). Cada uno es una pregunta abierta para el grilling, no una decisión tomada.

### El tablero y las reglas no coinciden del todo

Los 50 países rotulados en el tablero coinciden con los de las reglas, y la cantidad por continente también. Quedan estas diferencias:

- **África:** el tablero tiene una región **sin nombre** al oeste de Zaire y al sur del Sahara. Las reglas y la leyenda dicen 6 países.
- **Oceanía:** hay islas chicas sin nombre al este de Borneo. Pueden ser decorativas.
- **Colores:** América del Norte y África usan casi el mismo tono.

### Ninguna fuente define los límites entre países

Las reglas dicen que dos países son limítrofes si comparten frontera o están unidos por una línea de navegación, pero no listan los pares. En la imagen las líneas punteadas son ambiguas: no se distingue cuáles son rutas reales y cuáles adorno. **El grafo de límites completo no está en ninguna de las dos fuentes.**

### Las reglas dejan puntos a "según tu edición"

- El reparto inicial cuando los 50 países no se dividen exacto entre los jugadores.
- Cuánto valen las fichas grandes.
- Las restricciones exactas del reagrupamiento.
- Qué pasa con el objetivo de destrucción cuando otro jugador destruye a tu víctima.
- La variante de 2 o 3 jugadores (color neutral o solo objetivo común).
- **La lista concreta de objetivos secretos no está.**
- Qué tarjetas son comodín y qué símbolo tiene cada tarjeta de país.
