# Límites entre países del tablero propio

Fuente: el tablero que dibujó el usuario, [`teg-tablero.webp`](./teg-tablero.webp) (2026-10-21). Dos países son limítrofes si comparten una línea de frontera o si los une una ruta punteada (por mar, o la de los aviones entre Rusia e Irán). Los países y los continentes son los del TEG clásico; los límites no: la decisión está en [`docs/adr/0001-los-limites-salen-del-tablero.md`](../adr/0001-los-limites-salen-del-tablero.md).

**97 pares.** La relación es simétrica: si A limita con B, B limita con A. Atacar y reagrupar valen igual por tierra que por mar.

## América del Sur (9)

- Argentina – Brasil
- Argentina – Chile
- Argentina – Perú
- Argentina – Uruguay
- Brasil – Colombia
- Brasil – Perú
- Brasil – Uruguay
- Chile – Perú
- Colombia – Perú

## América del Norte (16)

- Alaska – Oregón
- Alaska – Yukón
- California – México
- California – Nueva York
- California – Oregón
- California – Terranova
- Canadá – Labrador
- Canadá – Nueva York
- Canadá – Oregón
- Canadá – Yukón
- Groenlandia – Labrador
- Groenlandia – Terranova
- Labrador – Nueva York
- Labrador – Terranova
- Nueva York – Terranova
- Oregón – Yukón

## Europa (12)

- Alemania – Francia
- Alemania – Gran Bretaña
- Alemania – Italia
- Alemania – Polonia
- España – Francia
- España – Gran Bretaña
- Francia – Italia
- Gran Bretaña – Islandia
- Islandia – Suecia
- Italia – Polonia
- Polonia – Rusia
- Rusia – Suecia

## Asia (30)

- Arabia – India
- Arabia – Irán
- Arabia – Israel
- Arabia – Turquía
- Aral – Irán
- Aral – Mongolia
- Aral – Siberia
- Aral – Tartaria
- China – Gobi
- China – India
- China – Irán
- China – Japón
- China – Kamchatka
- China – Malasia
- China – Mongolia
- China – Siberia
- Gobi – India
- Gobi – Irán
- Gobi – Mongolia
- India – Irán
- Irán – Mongolia
- Irán – Turquía
- Israel – Turquía
- Japón – Kamchatka
- Kamchatka – Siberia
- Kamchatka – Taimir
- Mongolia – Siberia
- Siberia – Taimir
- Siberia – Tartaria
- Taimir – Tartaria

## África (10)

- Egipto – Etiopía
- Egipto – Madagascar
- Egipto – Sahara
- Etiopía – Madagascar
- Etiopía – Sahara
- Etiopía – Sudáfrica
- Etiopía – Zaire
- Madagascar – Sudáfrica
- Sahara – Zaire
- Sudáfrica – Zaire

## Oceanía (3)

- Australia – Borneo
- Australia – Java
- Australia – Sumatra

## Entre continentes (17)

- Alaska (América del Norte) – Kamchatka (Asia)
- Aral (Asia) – Polonia (Europa)
- Aral (Asia) – Rusia (Europa)
- Australia (Oceanía) – Chile (América del Sur)
- Borneo (Oceanía) – Malasia (Asia)
- Brasil (América del Sur) – Sahara (África)
- Colombia (América del Sur) – México (América del Norte)
- Egipto (África) – Israel (Asia)
- Egipto (África) – Polonia (Europa)
- Egipto (África) – Turquía (Asia)
- España (Europa) – Sahara (África)
- Groenlandia (América del Norte) – Islandia (Europa)
- India (Asia) – Sumatra (Oceanía)
- Irán (Asia) – Polonia (Europa)
- Irán (Asia) – Rusia (Europa)
- Polonia (Europa) – Turquía (Asia)
- Rusia (Europa) – Tartaria (Asia)

## Cantidad de límites por país

- **América del Sur:** Argentina 4, Brasil 5, Chile 3, Colombia 3, Perú 4, Uruguay 2
- **América del Norte:** Alaska 3, California 4, Canadá 4, Groenlandia 3, Labrador 4, México 2, Nueva York 4, Oregón 4, Terranova 4, Yukón 3
- **Europa:** Alemania 4, España 3, Francia 3, Gran Bretaña 3, Islandia 3, Italia 3, Polonia 7, Rusia 5, Suecia 2
- **Asia:** Arabia 4, Aral 6, China 8, Gobi 4, India 5, Irán 9, Israel 3, Japón 2, Kamchatka 5, Malasia 2, Mongolia 5, Siberia 6, Taimir 3, Tartaria 4, Turquía 5
- **África:** Egipto 6, Etiopía 5, Madagascar 3, Sahara 5, Sudáfrica 3, Zaire 3
- **Oceanía:** Australia 4, Borneo 2, Java 1, Sumatra 2

## Rutas punteadas

El tablero dibuja con línea punteada 26 de los 97 límites; el resto son fronteras por tierra (Groenlandia–Labrador es un estrecho angosto sin línea punteada).

Alaska–Kamchatka y Chile–Australia salen por el borde del tablero y siguen del otro lado. Groenlandia–Islandia, Groenlandia–Terranova, Terranova–California, Colombia–México, Brasil–Sahara, Islandia–Suecia, Islandia–Gran Bretaña, Alemania–Gran Bretaña, España–Gran Bretaña, España–Sahara, Egipto–Polonia, Egipto–Turquía, Egipto–Israel, Egipto–Madagascar, Etiopía–Madagascar, Madagascar–Sudáfrica, Irán–Rusia (la de los aviones), Japón–Kamchatka, China–Japón, India–Sumatra, Borneo–Malasia, Australia–Sumatra, Australia–Borneo y Australia–Java.

## Diferencias con el TEG clásico

Comparado con los 89 pares de [`teg-limites.md`](./teg-limites.md):

- **Se agregan 14:** Canadá–Labrador, Labrador–Nueva York, Groenlandia–Terranova, California–Terranova, Italia–Polonia, Rusia–Tartaria, Aral–Polonia, Irán–Polonia, Kamchatka–Taimir, Arabia–Irán, Arabia–India, Gobi–India, Etiopía–Madagascar y Madagascar–Sudáfrica.
- **Se sacan 6:** Canadá–Terranova, Groenlandia–Nueva York, Nueva York–Oregón, Rusia–Turquía, India–Malasia y Madagascar–Zaire.

## Cómo se leyeron los casos dudosos

Regla: **donde el dibujo es ambiguo, decide el TEG clásico.**

- **Se tocan en un solo punto:** Oregón–Yukón, Sahara–Etiopía y China–Kamchatka (en la punta de una bahía) son limítrofes, como en el clásico. Canadá–California, Egipto–Zaire y Suecia–Polonia no lo son, como en el clásico.
- **Los separa un río:** Canadá–Oregón (el río baja hasta el lago) son limítrofes, como en el clásico.
- **La ruta del Atlántico** sale de un cruce sobre la ruta Groenlandia–Islandia, baja hasta la isla al este de Terranova y sigue hasta la punta este de California. Se lee como Terranova–California; el tramo de arriba no agrega Islandia–Terranova, que no existe en el clásico.
- **La ruta que llega a Egipto por el oeste** sale del canal entre Italia y Turquía, debajo de Polonia. Se lee como Egipto–Polonia, como en el clásico.

## Decoración

No son países: la isla sin nombre al norte de Yukón, la isla al oeste de Gran Bretaña y las islas chicas al este de Borneo. La parte oeste de Suecia (como Noruega) es parte de Suecia.
