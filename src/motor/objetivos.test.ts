import { describe, expect, it } from "vitest";
import { partidaDe, partidaEnRondaDeAtaque } from "./ayudas-de-test";
import { fuenteFija } from "./azar";
import { crearPartida, restaurarPartida, type ObjetivoAsignado, type Partida } from "./partida";
import type { NombreDePais } from "./mapa";
import type { NumeroDeOcupacion, Objetivo } from "./objetivos";

const ANA_BETO_CARO = [
  { nombre: "Ana", color: "azul" },
  { nombre: "Beto", color: "rojo" },
  { nombre: "Caro", color: "negro" },
] as const;

describe("repartir los objetivos secretos", () => {
  it("con objetivos secretos, cada jugador recibe el que le deja la mezcla, en el orden de juego", () => {
    const azar = fuenteFija({
      ordenDeJuego: [2, 0, 1],
      primerosObjetivos: [
        { tipo: "ocupacion", numero: 3 },
        { tipo: "ocupacion", numero: 7 },
        { tipo: "ocupacion", numero: 1 },
      ],
    });

    const partida = partidaDe(crearPartida(ANA_BETO_CARO, azar, { modo: "objetivosSecretos" }));

    expect(partida.modo()).toBe("objetivosSecretos");
    expect(partida.objetivoDe("negro")).toEqual({
      tipo: "ocupacion",
      numero: 3,
      descripcion: "Ocupar Asia y 2 países de América del Sur.",
    });
    expect(partida.objetivoDe("azul")).toEqual({
      tipo: "ocupacion",
      numero: 7,
      descripcion: "Ocupar Oceanía, América del Norte y 2 países de Europa.",
    });
    expect(partida.objetivoDe("rojo")).toEqual({
      tipo: "ocupacion",
      numero: 1,
      descripcion: "Ocupar África, 5 países de América del Norte y 4 de Europa.",
    });
  });

  it("solo con el objetivo común, nadie tiene objetivo secreto", () => {
    const partida = partidaDe(crearPartida(ANA_BETO_CARO, fuenteFija(), { modo: "objetivoComun" }));

    expect(partida.modo()).toBe("objetivoComun");
    expect(partida.objetivoDe("azul")).toBeNull();
  });

  it("si no se dice el modo, se juega con objetivos secretos", () => {
    const partida = partidaDe(crearPartida(ANA_BETO_CARO, fuenteFija()));

    expect(partida.modo()).toBe("objetivosSecretos");
    expect(partida.objetivoDe("azul")).not.toBeNull();
  });
});

describe("a quién apunta un objetivo de destrucción", () => {
  /** Ana, Beto y Caro en ese orden de juego, con los objetivos que se den para cada uno, en ese orden. */
  function conObjetivos(...primerosObjetivos: Objetivo[]) {
    return partidaDe(crearPartida(ANA_BETO_CARO, fuenteFija({ primerosObjetivos })));
  }

  it("si el color está en juego y no es el propio, apunta al jugador de ese color", () => {
    const partida = conObjetivos({ tipo: "ocupacion", numero: 1 }, { tipo: "destruccion", color: "negro" });

    expect(partida.objetivoDe("rojo")).toEqual({
      tipo: "destruccion",
      color: "negro",
      descripcion: "Destruir al ejército negro. De ser imposible, al jugador de la derecha.",
      victima: { nombre: "Caro", color: "negro" },
    });
  });

  it("si el color es el propio, apunta al siguiente jugador en el orden de juego", () => {
    const partida = conObjetivos({ tipo: "destruccion", color: "azul" });

    expect(partida.objetivoDe("azul")).toMatchObject({ victima: { nombre: "Beto", color: "rojo" } });
  });

  it("si el color no está en juego, apunta al siguiente jugador en el orden de juego, y el último apunta al primero", () => {
    const partida = conObjetivos(
      { tipo: "ocupacion", numero: 1 },
      { tipo: "ocupacion", numero: 2 },
      { tipo: "destruccion", color: "verde" },
    );

    expect(partida.objetivoDe("negro")).toMatchObject({ victima: { nombre: "Ana", color: "azul" } });
  });
});

const AMERICA_DEL_SUR: NombreDePais[] = ["Argentina", "Brasil", "Chile", "Colombia", "Perú", "Uruguay"];
const AMERICA_DEL_NORTE: NombreDePais[] = [
  "Alaska",
  "California",
  "Canadá",
  "Groenlandia",
  "Labrador",
  "México",
  "Nueva York",
  "Oregón",
  "Terranova",
  "Yukón",
];
const EUROPA: NombreDePais[] = [
  "Alemania",
  "España",
  "Francia",
  "Gran Bretaña",
  "Islandia",
  "Italia",
  "Polonia",
  "Rusia",
  "Suecia",
];
const ASIA: NombreDePais[] = [
  "Arabia",
  "Aral",
  "China",
  "Gobi",
  "India",
  "Irán",
  "Israel",
  "Japón",
  "Kamchatka",
  "Malasia",
  "Mongolia",
  "Siberia",
  "Taimir",
  "Tartaria",
  "Turquía",
];
const AFRICA: NombreDePais[] = ["Egipto", "Etiopía", "Madagascar", "Sahara", "Sudáfrica", "Zaire"];
const OCEANIA: NombreDePais[] = ["Australia", "Borneo", "Java", "Sumatra"];

/**
 * Ana, Beto y Caro en la ronda de ataque 1, en el turno de Ana, que tiene el objetivo dado y los países
 * dados. Beto tiene `falta`, con 1 ejército, y el resto es de Caro. Ana ataca desde `desde`, que tiene 5
 * ejércitos y tiene que ser suyo y limítrofe de `falta`, y los dados le dan la conquista: 6, 6, 6 contra 1.
 */
function anaConquista({
  objetivo,
  suyos,
  falta,
  desde,
}: {
  objetivo: ObjetivoAsignado;
  suyos: NombreDePais[];
  falta: NombreDePais;
  desde: NombreDePais;
}): Partida {
  const partida = partidaEnRondaDeAtaque({
    jugadores: ["Ana", "Beto", "Caro"],
    paises: { Ana: suyos, Beto: [falta] },
    ejercitos: { [desde]: 5 },
    resto: "Caro",
    numero: 1,
    abrio: "Ana",
    enTurno: "Ana",
    dados: [6, 6, 6, 1],
    objetivos: { Ana: objetivo },
  });
  return partidaDe(partida.aplicar({ tipo: "atacar", desde, hacia: falta }));
}

/**
 * Para cada objetivo de ocupación, los países con que Ana lo cumple justo, menos `falta`, que conquista
 * desde `desde`. `porPoco` es un país de los suyos que, si no lo tuviera, la dejaría a uno de cumplirlo.
 */
const CASOS_DE_OCUPACION: {
  numero: NumeroDeOcupacion;
  suyos: NombreDePais[];
  falta: NombreDePais;
  desde: NombreDePais;
  porPoco: NombreDePais;
}[] = [
  {
    numero: 1,
    suyos: [...AFRICA.filter((pais) => pais !== "Zaire"), "Alaska", "California", "Canadá", "Groenlandia", "Labrador", "Alemania", "España", "Francia", "Gran Bretaña"],
    falta: "Zaire",
    desde: "Sahara",
    porPoco: "Gran Bretaña",
  },
  {
    numero: 2,
    suyos: [...AMERICA_DEL_SUR, "Alemania", "España", "Francia", "Gran Bretaña", "Islandia", "Italia", "Polonia", "Egipto", "Sahara"],
    falta: "Zaire",
    desde: "Sahara",
    porPoco: "Polonia",
  },
  {
    numero: 3,
    suyos: [...ASIA.filter((pais) => pais !== "Japón"), "Argentina", "Brasil"],
    falta: "Japón",
    desde: "China",
    porPoco: "Brasil",
  },
  {
    numero: 4,
    suyos: [...EUROPA.filter((pais) => pais !== "Rusia"), "Arabia", "Aral", "China", "Gobi", "Argentina", "Brasil"],
    falta: "Rusia",
    desde: "Suecia",
    porPoco: "Gobi",
  },
  {
    numero: 5,
    suyos: [...AMERICA_DEL_NORTE.filter((pais) => pais !== "Alaska"), "Australia", "Borneo", "Arabia", "Aral", "China", "Gobi"],
    falta: "Alaska",
    desde: "Yukón",
    porPoco: "Borneo",
  },
  {
    numero: 6,
    suyos: ["Australia", "Borneo", "Egipto", "Sahara", "Argentina", "Brasil", "Alemania", "España", "Francia", "Alaska", "California", "Canadá", "Groenlandia", "Arabia", "Aral"],
    falta: "Irán",
    desde: "Aral",
    porPoco: "Egipto",
  },
  {
    numero: 7,
    suyos: [...OCEANIA.filter((pais) => pais !== "Australia"), ...AMERICA_DEL_NORTE, "Alemania", "España"],
    falta: "Australia",
    desde: "Borneo",
    porPoco: "España",
  },
  {
    numero: 8,
    suyos: [...AMERICA_DEL_SUR, ...AFRICA.filter((pais) => pais !== "Sahara"), "Arabia", "Aral", "China", "Gobi"],
    falta: "Sahara",
    desde: "Brasil",
    porPoco: "Gobi",
  },
  {
    numero: 9,
    suyos: [...OCEANIA.filter((pais) => pais !== "Sumatra"), ...AFRICA, "Alaska", "California", "Canadá", "Groenlandia", "Labrador"],
    falta: "Sumatra",
    desde: "Australia",
    porPoco: "Labrador",
  },
];

describe("ganar por un objetivo de ocupación", () => {
  it.each(CASOS_DE_OCUPACION)(
    "objetivo $numero: lo cumple al conquistar el país que le faltaba y gana en el acto",
    ({ numero, suyos, falta, desde }) => {
      const partida = anaConquista({ objetivo: { tipo: "ocupacion", numero }, suyos, falta, desde });

      expect(partida.ganador()).toEqual({ nombre: "Ana", color: "azul" });
      expect(partida.motivoDeLaVictoria()).toEqual({
        tipo: "objetivoSecreto",
        objetivo: expect.objectContaining({ tipo: "ocupacion", numero }),
      });
    },
  );

  it.each(CASOS_DE_OCUPACION)(
    "objetivo $numero: sin $porPoco, la conquista la deja a un país de cumplirlo y la partida sigue",
    ({ numero, suyos, falta, desde, porPoco }) => {
      const partida = anaConquista({
        objetivo: { tipo: "ocupacion", numero },
        suyos: suyos.filter((pais) => pais !== porPoco),
        falta,
        desde,
      });

      expect(partida.ganador()).toBeNull();
      expect(partida.motivoDeLaVictoria()).toBeNull();
    },
  );
});

describe("el objetivo 2 y sus 3 países limítrofes entre sí", () => {
  const SUDAMERICA_Y_SIETE_DE_EUROPA: NombreDePais[] = [
    ...AMERICA_DEL_SUR,
    "Alemania",
    "España",
    "Francia",
    "Gran Bretaña",
    "Islandia",
    "Italia",
    "Polonia",
  ];

  it("dos pares de limítrofes separados no forman un grupo de 3", () => {
    // Egipto y Sahara por un lado, Japón y Kamchatka (el que conquista) por otro.
    const partida = anaConquista({
      objetivo: { tipo: "ocupacion", numero: 2 },
      suyos: [...SUDAMERICA_Y_SIETE_DE_EUROPA, "Egipto", "Sahara", "Japón"],
      falta: "Kamchatka",
      desde: "Japón",
    });

    expect(partida.ganador()).toBeNull();
  });

  it("3 limítrofes en fila valen, aunque el primero y el último no sean limítrofes entre ellos", () => {
    // Egipto y Zaire no son limítrofes, pero los dos lo son de Sahara.
    const partida = anaConquista({
      objetivo: { tipo: "ocupacion", numero: 2 },
      suyos: [...SUDAMERICA_Y_SIETE_DE_EUROPA, "Egipto", "Zaire"],
      falta: "Sahara",
      desde: "Brasil",
    });

    expect(partida.ganador()?.nombre).toBe("Ana");
  });

  it("los países de América del Sur y de Europa no cuentan para el grupo", () => {
    // Rusia y Suecia son de Europa y Brasil de América del Sur: con Sahara forman una cadena, pero no valen.
    const partida = anaConquista({
      objetivo: { tipo: "ocupacion", numero: 2 },
      suyos: [...SUDAMERICA_Y_SIETE_DE_EUROPA, "Rusia", "Suecia", "Zaire"],
      falta: "Sahara",
      desde: "Brasil",
    });

    expect(partida.ganador()).toBeNull();
  });
});

describe("las cantidades de los objetivos son como mínimo", () => {
  it("con más países de los pedidos en un continente, el objetivo también se cumple", () => {
    // El objetivo 3 pide 2 de América del Sur y Ana tiene los 6.
    const partida = anaConquista({
      objetivo: { tipo: "ocupacion", numero: 3 },
      suyos: [...ASIA.filter((pais) => pais !== "Japón"), ...AMERICA_DEL_SUR],
      falta: "Japón",
      desde: "China",
    });

    expect(partida.ganador()?.nombre).toBe("Ana");
  });
});

describe("ganar por un objetivo de destrucción", () => {
  /**
   * Ana, Beto y Caro en la ronda de ataque 1, en el turno de Ana. Beto tiene solo Chile, con 1 ejército, y
   * Ana lo destruye conquistándolo desde Argentina. El resto es de Caro.
   */
  function anaDestruyeABeto(objetivos: Record<string, ObjetivoAsignado>): Partida {
    const partida = partidaEnRondaDeAtaque({
      jugadores: ["Ana", "Beto", "Caro"],
      paises: { Ana: ["Argentina"], Beto: ["Chile"] },
      ejercitos: { Argentina: 5 },
      resto: "Caro",
      numero: 1,
      abrio: "Ana",
      enTurno: "Ana",
      dados: [6, 6, 6, 1],
      objetivos,
    });
    return partidaDe(partida.aplicar({ tipo: "atacar", desde: "Argentina", hacia: "Chile" }));
  }

  it("quien destruye a su víctima cumple su objetivo y gana en el acto", () => {
    const partida = anaDestruyeABeto({ Ana: { tipo: "destruccion", color: "rojo", victima: "rojo" } });

    expect(partida.ganador()).toEqual({ nombre: "Ana", color: "azul" });
    expect(partida.motivoDeLaVictoria()).toEqual({
      tipo: "objetivoSecreto",
      objetivo: {
        tipo: "destruccion",
        color: "rojo",
        descripcion: "Destruir al ejército rojo. De ser imposible, al jugador de la derecha.",
        victima: { nombre: "Beto", color: "rojo" },
      },
    });
  });

  it("la víctima es la que dice el objetivo hoy: si apunta al de la derecha, gana destruyendo a ese", () => {
    // La tarjeta dice azul, el color de Ana, así que su víctima es Beto, el siguiente en el orden de juego.
    const partida = anaDestruyeABeto({ Ana: { tipo: "destruccion", color: "azul", victima: "rojo" } });

    expect(partida.ganador()?.nombre).toBe("Ana");
  });

  it("destruir a otro jugador que no es su víctima no la hace ganar", () => {
    const partida = anaDestruyeABeto({ Ana: { tipo: "destruccion", color: "negro", victima: "negro" } });

    expect(partida.ganador()).toBeNull();
  });

  it("si otro destruye a su víctima, el objetivo deja de apuntar a nadie: le queda solo el objetivo común", () => {
    const partida = anaDestruyeABeto({
      Ana: { tipo: "ocupacion", numero: 1 },
      Caro: { tipo: "destruccion", color: "rojo", victima: "rojo" },
    });

    expect(partida.ganador()).toBeNull();
    expect(partida.objetivoDe("negro")).toEqual({
      tipo: "destruccion",
      color: "rojo",
      descripcion: "Destruir al ejército rojo. De ser imposible, al jugador de la derecha.",
      victima: null,
    });
  });

  it("a quien le destruyeron la víctima gana al cumplir el objetivo común", () => {
    // Caro tiene 29 países y conquista el 30.º, Chile, desde Perú.
    const partida = partidaEnRondaDeAtaque({
      jugadores: ["Ana", "Beto", "Caro"],
      paises: {
        Ana: PAISES_DE_ANA_PARA_QUE_CARO_TENGA_29,
        Beto: ["Chile"],
      },
      ejercitos: { Perú: 5 },
      resto: "Caro",
      numero: 1,
      abrio: "Caro",
      enTurno: "Caro",
      dados: [6, 6, 6, 1],
      objetivos: { Caro: { tipo: "destruccion", color: "verde", victima: null } },
    });

    const despues = partidaDe(partida.aplicar({ tipo: "atacar", desde: "Perú", hacia: "Chile" }));

    expect(despues.ganador()?.nombre).toBe("Caro");
    expect(despues.motivoDeLaVictoria()).toEqual({ tipo: "objetivoComun" });
  });
});

/** 20 países, todos fuera de América del Sur, para que Caro quede con 29 de los otros 30 (Beto tiene Chile). */
const PAISES_DE_ANA_PARA_QUE_CARO_TENGA_29: NombreDePais[] = [...ASIA, ...OCEANIA, "Egipto"];

describe("ganar por el objetivo común", () => {
  /** Caro, en turno, tiene 29 países y conquista el 30.º, Chile, desde Perú. */
  function caroConquistaSuPais30(objetivos?: Record<string, ObjetivoAsignado>): Partida {
    const partida = partidaEnRondaDeAtaque({
      jugadores: ["Ana", "Beto", "Caro"],
      paises: { Ana: PAISES_DE_ANA_PARA_QUE_CARO_TENGA_29, Beto: ["Chile"] },
      ejercitos: { Perú: 5 },
      resto: "Caro",
      numero: 1,
      abrio: "Caro",
      enTurno: "Caro",
      dados: [6, 6, 6, 1],
      objetivos,
    });
    return partidaDe(partida.aplicar({ tipo: "atacar", desde: "Perú", hacia: "Chile" }));
  }

  it("solo con el objetivo común, quien llega a 30 países gana por el objetivo común", () => {
    const partida = caroConquistaSuPais30();

    expect(partida.ganador()?.nombre).toBe("Caro");
    expect(partida.motivoDeLaVictoria()).toEqual({ tipo: "objetivoComun" });
  });

  it("con objetivos secretos, el objetivo común también vale, aunque el secreto no esté cumplido", () => {
    const partida = caroConquistaSuPais30({ Caro: { tipo: "ocupacion", numero: 3 } });

    expect(partida.ganador()?.nombre).toBe("Caro");
    expect(partida.motivoDeLaVictoria()).toEqual({ tipo: "objetivoComun" });
  });

  it("si con la misma conquista cumple su objetivo secreto y el común, gana por el secreto", () => {
    // Caro tiene Europa entera y 5 países de África limítrofes entre sí (todos menos Egipto, que es de Ana).
    // Con Chile completa América del Sur, y con eso el objetivo 2.
    const partida = caroConquistaSuPais30({ Caro: { tipo: "ocupacion", numero: 2 } });

    expect(partida.motivoDeLaVictoria()).toMatchObject({ tipo: "objetivoSecreto" });
  });
});

describe("guardar y restaurar los objetivos", () => {
  it("una partida restaurada conserva el modo, los objetivos y por qué ganó el ganador", () => {
    const partida = anaConquista({
      objetivo: { tipo: "ocupacion", numero: 3 },
      suyos: [...ASIA.filter((pais) => pais !== "Japón"), "Argentina", "Brasil"],
      falta: "Japón",
      desde: "China",
    });
    const guardado = JSON.parse(JSON.stringify(partida.estado()));

    const restaurada = partidaDe(restaurarPartida(guardado, fuenteFija()));

    expect(restaurada.modo()).toBe("objetivosSecretos");
    expect(restaurada.objetivoDe("azul")).toEqual(partida.objetivoDe("azul"));
    expect(restaurada.motivoDeLaVictoria()).toEqual(partida.motivoDeLaVictoria());
  });
});
