# Límites entre países del TEG clásico

Fuente: `common/limitrof.h` y `common/country.cpp` del TEG digital de Ricardo Quesada (*Tenes Empanadas Graciela*), repo `wfx/teg`, commit `47b44af`. Se tomó solo el dato de qué países son limítrofes, no el código (que es GPL). La versión de 2014 del mismo repo tiene los mismos pares.

**89 pares.** La relación es simétrica: si A limita con B, B limita con A. No se distingue frontera terrestre de ruta marítima: las dos cuentan igual.

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

## América del Norte (15)

- Alaska – Oregón
- Alaska – Yukón
- California – México
- California – Nueva York
- California – Oregón
- Canadá – Nueva York
- Canadá – Oregón
- Canadá – Terranova
- Canadá – Yukón
- Groenlandia – Labrador
- Groenlandia – Nueva York
- Labrador – Terranova
- Nueva York – Oregón
- Nueva York – Terranova
- Oregón – Yukón

## Europa (11)

- Alemania – Francia
- Alemania – Gran Bretaña
- Alemania – Italia
- Alemania – Polonia
- España – Francia
- España – Gran Bretaña
- Francia – Italia
- Gran Bretaña – Islandia
- Islandia – Suecia
- Polonia – Rusia
- Rusia – Suecia

## Asia (27)

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
- Gobi – Irán
- Gobi – Mongolia
- India – Irán
- India – Malasia
- Irán – Mongolia
- Irán – Turquía
- Israel – Turquía
- Japón – Kamchatka
- Kamchatka – Siberia
- Mongolia – Siberia
- Siberia – Taimir
- Siberia – Tartaria
- Taimir – Tartaria

## África (9)

- Egipto – Etiopía
- Egipto – Madagascar
- Egipto – Sahara
- Etiopía – Sahara
- Etiopía – Sudáfrica
- Etiopía – Zaire
- Madagascar – Zaire
- Sahara – Zaire
- Sudáfrica – Zaire

## Oceanía (3)

- Australia – Borneo
- Australia – Java
- Australia – Sumatra

## Entre continentes (15)

- Alaska (América del Norte) – Kamchatka (Asia)
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
- Irán (Asia) – Rusia (Europa)
- Polonia (Europa) – Turquía (Asia)
- Rusia (Europa) – Turquía (Asia)

## Cantidad de límites por país

- **América del Sur:** Argentina 4, Brasil 5, Chile 3, Colombia 3, Perú 4, Uruguay 2
- **América del Norte:** Alaska 3, California 3, Canadá 4, Groenlandia 3, Labrador 2, México 2, Nueva York 5, Oregón 5, Terranova 3, Yukón 3
- **Europa:** Alemania 4, España 3, Francia 3, Gran Bretaña 3, Islandia 3, Italia 2, Polonia 4, Rusia 5, Suecia 2
- **Asia:** Arabia 2, Aral 5, China 8, Gobi 3, India 4, Irán 7, Israel 3, Japón 2, Kamchatka 4, Malasia 3, Mongolia 5, Siberia 6, Taimir 2, Tartaria 3, Turquía 6
- **África:** Egipto 6, Etiopía 4, Madagascar 2, Sahara 5, Sudáfrica 2, Zaire 4
- **Oceanía:** Australia 4, Borneo 2, Java 1, Sumatra 2

## Tipo de cada frontera: tierra o agua

Aporte del usuario (2026-10-21): la misma lista de 89 pares, verificada par por par contra la de arriba, con el tipo de cada frontera. El tipo no cambia nada en el juego (atacar y reagrupar valen igual por tierra o por agua); sirve para dibujar el tablero, por ejemplo las rutas por mar.

**67 por tierra y 22 por agua.** Son por agua:

- Brasil – Sahara
- Chile – Australia
- Alaska – Kamchatka
- Groenlandia – Labrador
- Groenlandia – Nueva York
- Groenlandia – Islandia
- Alemania – Gran Bretaña
- España – Gran Bretaña
- España – Sahara
- Gran Bretaña – Islandia
- Islandia – Suecia
- Polonia – Egipto
- China – Japón
- India – Sumatra
- Japón – Kamchatka
- Malasia – Borneo
- Turquía – Egipto
- Egipto – Madagascar
- Madagascar – Zaire
- Australia – Borneo
- Australia – Java
- Australia – Sumatra

Todas las demás son por tierra. Según el aporte, el tipo de tres no está confirmado: Egipto – Israel (tierra), Egipto – Turquía (agua) y Labrador – Terranova (tierra). El texto original tenía dos errores que no se copiaron: ponía "oceania" como un séptimo país de África, y su columna "dudoso" decía "no" en todas las filas, aunque nombraba esas tres como dudosas.
