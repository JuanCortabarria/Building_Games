import { describe, expect, it } from "vitest";
import { crearPartida, type Partida } from "./partida";
import { fuenteFija } from "./azar";
import { partidaDe } from "./ayudas-de-test";

function unaPartida(): Partida {
  return partidaDe(
    crearPartida(
      [
        { nombre: "Ana", color: "azul" },
        { nombre: "Beto", color: "rojo" },
      ],
      fuenteFija(),
    ),
  );
}

describe("el mapa", () => {
  it("tiene 50 países en 6 continentes, cada uno con sus ejércitos extra", () => {
    const partida = unaPartida();

    expect(partida.paises()).toHaveLength(50);
    expect(partida.continentes()).toEqual([
      { nombre: "América del Sur", cantidadDePaises: 6, ejercitosExtra: 3 },
      { nombre: "América del Norte", cantidadDePaises: 10, ejercitosExtra: 5 },
      { nombre: "Europa", cantidadDePaises: 9, ejercitosExtra: 5 },
      { nombre: "Asia", cantidadDePaises: 15, ejercitosExtra: 7 },
      { nombre: "África", cantidadDePaises: 6, ejercitosExtra: 3 },
      { nombre: "Oceanía", cantidadDePaises: 4, ejercitosExtra: 2 },
    ]);
  });

  it("cada país tiene los límites de la referencia, y los pares limítrofes son 89", () => {
    const partida = unaPartida();
    // Tabla "Cantidad de límites por país" de docs/reference/teg-limites.md.
    const limitesPorPais = {
      Argentina: 4, Brasil: 5, Chile: 3, Colombia: 3, Perú: 4, Uruguay: 2,
      Alaska: 3, California: 3, Canadá: 4, Groenlandia: 3, Labrador: 2, México: 2, "Nueva York": 5, Oregón: 5, Terranova: 3, Yukón: 3,
      Alemania: 4, España: 3, Francia: 3, "Gran Bretaña": 3, Islandia: 3, Italia: 2, Polonia: 4, Rusia: 5, Suecia: 2,
      Arabia: 2, Aral: 5, China: 8, Gobi: 3, India: 4, Irán: 7, Israel: 3, Japón: 2, Kamchatka: 4, Malasia: 3, Mongolia: 5, Siberia: 6, Taimir: 2, Tartaria: 3, Turquía: 6,
      Egipto: 6, Etiopía: 4, Madagascar: 2, Sahara: 5, Sudáfrica: 2, Zaire: 4,
      Australia: 4, Borneo: 2, Java: 1, Sumatra: 2,
    };

    const limitesEnJuego = Object.fromEntries(
      partida.paises().map((pais) => [pais.nombre, partida.limitrofesDe(pais.nombre).length]),
    );
    const pares = new Set(
      partida
        .paises()
        .flatMap((pais) => partida.limitrofesDe(pais.nombre).map((otro) => [pais.nombre, otro].sort().join(" – "))),
    );

    expect(limitesEnJuego).toEqual(limitesPorPais);
    expect(pares.size).toBe(89);
  });

  it("los límites son simétricos", () => {
    const partida = unaPartida();

    const asimetricos = partida
      .paises()
      .flatMap((pais) =>
        partida
          .limitrofesDe(pais.nombre)
          .filter((otro) => !partida.limitrofesDe(otro).includes(pais.nombre))
          .map((otro) => `${pais.nombre} → ${otro}`),
      );
    expect(asimetricos).toEqual([]);
  });

  it("Kamchatka y Alaska son limítrofes; Tartaria y Rusia no", () => {
    const partida = unaPartida();

    expect(partida.limitrofesDe("Kamchatka")).toContain("Alaska");
    expect(partida.limitrofesDe("Tartaria")).not.toContain("Rusia");
  });
});
