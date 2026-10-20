# Guía de aprendizaje: agentes de código con mattpocock/skills y Paperclip

> Este archivo vive en un repositorio de práctica. Tiene dos lectores:
>
> 1. **Vos**, que querés aprender a usar estas herramientas con método.
> 2. **El agente (Claude Code)**, que actúa como tutor y compañero de práctica.
>
> Información relevada en octubre de 2026. Las dos herramientas cambian rápido: ante cualquier duda, la fuente de verdad son los repositorios originales (ver [Fuentes](#13-fuentes)).

---

## Índice

1. [Instrucciones para el agente](#1-instrucciones-para-el-agente)
2. [Cómo usar esta guía (para vos)](#2-cómo-usar-esta-guía-para-vos)
3. [El mapa general: dos capas](#3-el-mapa-general-dos-capas)
4. [Parte A: mattpocock/skills](#4-parte-a-mattpocockskills)
5. [Parte B: Paperclip](#5-parte-b-paperclip)
6. [Contexto: GSD, BMAD y Spec Kit](#6-contexto-gsd-bmad-y-spec-kit)
7. [El proyecto de práctica](#7-el-proyecto-de-práctica)
8. [Plan de aprendizaje por módulos](#8-plan-de-aprendizaje-por-módulos)
9. [Chuleta: qué usar según la situación](#9-chuleta-qué-usar-según-la-situación)
10. [Glosario](#10-glosario)
11. [Errores comunes](#11-errores-comunes)
12. [Registro de progreso](#12-registro-de-progreso)
13. [Fuentes](#13-fuentes)

---

## 1. Instrucciones para el agente

Si sos el agente que lee este archivo, este es tu rol en este repositorio.

### Tu rol

Sos un **tutor práctico**. El usuario es un programador avanzado que quiere **aprender a usar** las skills de Matt Pocock y Paperclip, no solo saber que existen. El objetivo es que al terminar pueda aplicarlas solo en sus propios proyectos.

### Cómo enseñar

- **Un módulo por vez.** Trabajá según el [plan de aprendizaje](#8-plan-de-aprendizaje-por-módulos). Al empezar una sesión, leé el [registro de progreso](#12-registro-de-progreso) y proponé continuar desde el primer módulo no terminado.
- **El usuario ejecuta, vos acompañás.** Las skills de usuario (las que empiezan con `/`) las tipea él. Vos explicás qué va a pasar antes, y qué pasó después.
- **Explicá el porqué.** Cada vez que una skill toma una decisión (crear un ticket, rechazar una hipótesis, pedir un seam), señalá qué principio la guía.
- **Verificá contra la fuente.** Antes de afirmar qué hace una skill, leé su `SKILL.md` instalado. Si algo de esta guía contradice la skill real, gana la skill y lo anotás en el registro de progreso.
- **Cerrá cada módulo con el criterio de completitud.** No des un módulo por terminado hasta que se cumpla su criterio. Después, hacé las preguntas de reflexión.
- **Actualizá el registro de progreso** al terminar cada módulo: fecha, qué se hizo, qué se aprendió, dudas abiertas.
- **No ahorres el esfuerzo de aprender.** Si el usuario pide que hagas todo vos, recordale el objetivo del repo y ofrecé una pista antes que la solución.

### Reglas de seguridad para la parte de Paperclip

- Antes de cualquier ejecución de Paperclip, confirmá con el usuario que hay un **presupuesto mensual bajo** configurado por agente.
- Nunca conectes servicios que envíen mensajes a terceros (correo, redes, clientes) sin aprobación explícita del usuario.
- No pegues claves de API en archivos del repo, comentarios ni logs.

---

## 2. Cómo usar esta guía (para vos)

1. Leé las secciones 3 a 6 para tener el mapa mental. Son la teoría.
2. Abrí Claude Code en este repositorio y decile: *"Leé GUIA-AGENTES.md y arrancamos con el módulo que corresponda."*
3. Trabajá un módulo por sesión. Son cortos a propósito.
4. Usá el [registro de progreso](#12-registro-de-progreso) para retomar donde dejaste.

Consejo: agregá esta línea a tu `CLAUDE.md` para que el agente siempre la encuentre:

```markdown
Este es un repo de aprendizaje. Antes de empezar cualquier sesión, leé `GUIA-AGENTES.md` y seguí sus instrucciones para el agente.
```

---

## 3. El mapa general: dos capas

Las dos herramientas no compiten. Trabajan en niveles distintos:

```
┌──────────────────────────────────────────────────────────┐
│  PAPERCLIP: organiza a MUCHOS agentes                     │
│  Quién hace qué, cuánto cuesta, quién aprueba, cuándo     │
│  se despiertan. Es la "empresa".                          │
└──────────────────────────┬───────────────────────────────┘
                           │ coordina
┌──────────────────────────▼───────────────────────────────┐
│  AGENTES (Claude Code, Codex, Cursor...)                  │
│  Los "empleados" que hacen el trabajo.                    │
└──────────────────────────┬───────────────────────────────┘
                           │ usan
┌──────────────────────────▼───────────────────────────────┐
│  MATTPOCOCK/SKILLS: enseñan a UN agente a trabajar bien   │
│  Alinear antes de empezar, testear, revisar, diseñar      │
│  código ordenado. Es el "oficio".                         │
└──────────────────────────────────────────────────────────┘
```

Por eso el plan va en este orden: primero aprendés el oficio con un solo agente (Parte A), después la organización de varios agentes (Parte B), y al final los combinás.

---

## 4. Parte A: mattpocock/skills

Repositorio: <https://github.com/mattpocock/skills>

### 4.1 Qué es y su filosofía

Es la colección de **skills** (instrucciones empaquetadas que un agente carga bajo demanda) que Matt Pocock usa a diario. Lema: "skills para ingeniería real, no vibe coding".

Su postura es que los frameworks grandes "se adueñan del proceso" y te quitan control (ver [sección 6](#6-contexto-gsd-bmad-y-spec-kit)). Estas skills son lo opuesto: **chicas, componibles y fáciles de modificar**, cada una con un solo trabajo.

Ataca cuatro fallas típicas de los agentes:

| Falla | Causa | Solución |
|---|---|---|
| El agente no hizo lo que yo quería | Desalineación | Interrogatorios: `/grill-me`, `/grill-with-docs` |
| El agente es demasiado verboso | No comparte tu vocabulario | Lenguaje ubicuo en `GLOSSARY.md` y decisiones en ADRs |
| El código no funciona | Falta de feedback | `/tdd` (rojo, verde) y `/diagnosing-bugs` |
| Construimos una bola de barro | La IA acelera la entropía | Módulos profundos: `/codebase-design`, `/improve-codebase-architecture` |

Ejemplo del poder del glosario. Antes: "un problema cuando una lección dentro de una sección de un curso se hace real (recibe un lugar en el sistema de archivos)". Después: "un problema con la *materialization cascade*". Menos tokens, mejores nombres en el código, menos razonamiento desperdiciado.

### 4.2 Instalación en Claude Code

```bash
claude plugin install mattpocock-skills@claude-plugins-official
```

Se actualiza solo. No instales también la versión de `npx skills`, porque duplicás todo.

Después, **una vez por repositorio**:

```
/setup-matt-pocock-skills
```

Te pregunta tres cosas:

- **Issue tracker**: GitHub (con `gh`), GitLab (con `glab`), archivos markdown locales en `.scratch/`, u otro que describas.
- **Etiquetas de triage**: por defecto `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`.
- **Docs de dominio**: un `GLOSSARY.md` + `docs/adr/` en la raíz, o varios contextos si es un monorepo.

Escribe la configuración en `docs/agents/*.md` y agrega una sección `## Agent skills` a tu `CLAUDE.md`.

### 4.3 La distinción clave: quién invoca cada skill

- **User-invoked**: solo se activan si vos las tipeás. Su trabajo es **orquestar**.
- **Model-invoked**: las podés llamar vos, pero el agente también las usa solo cuando la tarea encaja. Contienen la **disciplina reutilizable**.

Una user-invoked puede llamar a model-invoked, nunca a otra user-invoked. Por eso varias son mínimas: `/grill-with-docs` literalmente dice "llamá a `grilling` y a `domain-modeling`".

### 4.4 El flujo principal: de la idea al código

```
/grill-with-docs ──► ¿necesitás ver algo funcionando? ──► /handoff → /prototype → /handoff
       │
       ▼
¿es un build de varias sesiones?
   ├─ Sí ─► /to-spec ─► /to-tickets ─► /implement (uno por ticket, /clear entre cada uno)
   │                                  o /implement-spec (todos en paralelo)
   └─ No ─► /implement en la misma sesión
       │
       ▼   (por dentro: /tdd para construir, /code-review para cerrar, /pr para el PR)
/retro ─► mejora el entorno para la próxima vez
```

Tres entradas alternativas que se suman al flujo:

- **`/triage`**: se acumulan bugs o pedidos que vos no creaste.
- **`/diagnosing-bugs`**: algo está roto.
- **`/wayfinder`**: el proyecto es enorme y no se ve el camino.

Si te perdés, `/ask-matt` es un router que te dice qué usar.

### 4.5 Skills de ingeniería que invocás vos

| Skill | Qué hace | Cuándo usarla |
|---|---|---|
| `/ask-matt` | Router: le contás tu situación y te dice qué skill o flujo usar | Cuando no sabés por dónde empezar |
| `/setup-matt-pocock-skills` | Configura tracker, etiquetas y docs de dominio | Una vez por repo, antes de todo |
| `/grill-with-docs` | Te interroga hasta resolver todo el árbol de diseño y actualiza `GLOSSARY.md` y ADRs mientras tanto | **Cada vez** que vas a hacer un cambio dentro de un repo |
| `/to-spec` | Convierte la conversación en una spec y la publica. No entrevista: sintetiza. Te confirma los seams de test | Después del grilling, si el trabajo ocupa varias sesiones |
| `/to-tickets` | Parte la spec en tickets *tracer bullet* (rebanadas verticales completas), cada uno con sus bloqueos | Después de `/to-spec` |
| `/implement` | Construye un ticket con `/tdd`, cierra con `/code-review` y commitea | Un ticket por vez, con `/clear` entre tickets |
| `/implement-spec` | Construye la spec entera: subagentes en worktrees separados sobre todos los tickets listos, mergeando a una rama de integración | Cuando preferís orquestar en vez de manejar cada ticket |
| `/wayfinder` | Crea un "mapa" de tickets de *decisión* en el tracker y los resuelve uno por sesión. Produce decisiones, no entregables | Proyectos gigantes y difusos. Nunca para una feature bien acotada |
| `/triage` | Mueve issues por estados, reproduce bugs, busca duplicados y rechazos previos, escribe briefs para agentes | Issues que llegan de afuera, no los que creó `/to-tickets` |
| `/improve-codebase-architecture` | Busca oportunidades de "profundizar" módulos y genera un reporte HTML visual | Cada pocos días, como mantenimiento |
| `/retro` | Propone mejoras al **entorno** del agente (no al código): chequeos, estándares, punteros, herramientas | Al terminar una sesión, sobre todo si salió mal |

### 4.6 Skills de ingeniería que el agente usa solo

| Skill | Qué hace | Ideas clave |
|---|---|---|
| `/tdd` | Ciclo rojo, verde | Testear comportamiento por interfaces públicas. Acordar seams antes de escribir tests. Un test, una implementación mínima, repetir. El refactor va en la revisión |
| `/diagnosing-bugs` | Depuración en 6 fases | 1) Loop de feedback que se pone rojo con *este* bug (es "la skill entera"). 2) Reproducir y minimizar. 3) 3 a 5 hipótesis falsables. 4) Instrumentar con logs etiquetados. 5) Test de regresión antes del fix. 6) Limpiar. Prohibido teorizar sin loop |
| `/prototype` | Código descartable para una pregunta de diseño | Lógica: un HTML con botones. UI: varias variantes en una ruta. Sin persistencia ni pulido. Se guarda en una rama `prototype/<nombre>` |
| `/research` | Agente en segundo plano que investiga contra fuentes primarias y deja un Markdown con citas | Delegar lectura mientras seguís trabajando |
| `/domain-modeling` | Mantiene el glosario | Señala términos contradictorios, precisa palabras ambiguas, inventa escenarios límite. ADR solo si es difícil de revertir, sorprendente y fruto de un trade-off real |
| `/codebase-design` | Vocabulario de módulos profundos | Módulo, interfaz, profundidad, seam, adapter, leverage, locality. Test de borrado. "Un adapter es un seam hipotético, dos es uno real" |
| `/code-review` | Revisión en dos ejes con subagentes en paralelo | **Standards** (estándares del repo + 12 code smells de Fowler) y **Spec** (¿hace lo que pedía el ticket?). No mezcla los resultados |
| `/pr` | Formato del cuerpo de un PR | Resumen visual mínimo, evidencia antes/después, puerta de una o dos vías, radio de impacto |
| `/wizard` | Script bash interactivo para pasos que solo un humano puede hacer | Crear cuentas, copiar API keys, cargar secretos de CI |

### 4.7 Skills de productividad

| Skill | Qué hace |
|---|---|
| `/grill-me` | El interrogatorio sin guardar nada. Para planes o textos fuera de un repo |
| `/grilling` | La primitiva de interrogatorio: rondas de preguntas numeradas con respuesta recomendada. Los hechos los busca el agente, las decisiones son tuyas |
| `/handoff` | Resume la sesión en un documento para que otro agente siga. Para cambiar de herramienta, carpeta o persona |
| `/teach` | Convierte la carpeta en un espacio de aprendizaje de varias sesiones con lecciones HTML, referencias y registros |
| `/to-questionnaire` | Cuestionario para la persona que tiene la información que te falta |
| `/wait-what` | Cuando no entendiste lo que dijo el agente: lo re-explica con el vocabulario del glosario |
| `/writing-for-agents` | Cómo escribir skills, `CLAUDE.md` y documentos para agentes |

Hay además skills en beta (`chief-of-staff`, `claude-handoff`, `loop-me`, `setup-ts-deep-modules`, y tres de escritura) y skills congeladas (`git-guardrails-claude-code`, `setup-pre-commit`, `migrate-to-shoehorn`, `scaffold-exercises`). Las beta no vienen en el plugin: se instalan con `npx skills@latest add mattpocock/skills --skill=<nombre>`.

### 4.8 Conceptos transversales

**Higiene de contexto.** El grilling, la spec y los tickets van en **una sola ventana de contexto sin compactar**, para que todo se construya sobre el mismo razonamiento. Cada `/implement` arranca limpio. El límite es la "smart zone": unos 150k tokens, dentro de los cuales el modelo todavía razona bien.

**Qué hacer entre fases.** En el límite entre fases, evaluá en este orden. Gana la primera que aplique:

1. **Seguir** en la sesión, si la fase siguiente necesita esta como fuente primaria o te sobra contexto.
2. **`/clear`**, si nada de lo actual importa para lo que sigue.
3. **`/handoff`**, solo si algo viaja: otra herramienta, otra carpeta u otra persona.
4. **Subagente**, si la tarea puede correr sola sin vos.
5. **`/compact`**, el valor por defecto pero el último recurso.

Todo menos "seguir" convierte una fuente primaria en un resumen que pierde información.

**Módulos profundos.** Mucho comportamiento detrás de una interfaz chica. La interfaz es también la superficie de test. Si tenés que testear "por detrás" de la interfaz, el módulo tiene la forma equivocada.

**Tracer bullets.** Cada ticket atraviesa todas las capas (base de datos, API, UI, tests) de forma fina pero completa, y se puede demostrar solo. Lo contrario son rebanadas horizontales ("primero toda la base de datos").

**Errores mecánicos vs de criterio.** Un error mecánico se convierte en un chequeo automático (lint, pre-commit, CI). Solo las decisiones de criterio van a `CODING_STANDARDS.md`.

---

## 5. Parte B: Paperclip

Repositorio: <https://github.com/paperclipai/paperclip>

### 5.1 Qué es

Un **panel de control para manejar un equipo de agentes de IA como si fuera una empresa**. Lema: si un agente es un *empleado*, Paperclip es la *empresa*.

Es un servidor Node.js con interfaz web en React y base de datos PostgreSQL. **No es un agente**: usa agentes existentes (Claude Code, Codex, Cursor, Gemini CLI, OpenCode, OpenClaw, Hermes, Grok, Kimi, scripts o webhooks) y los organiza. Regla: "si puede recibir un heartbeat, puede ser contratado".

Licencia MIT, autoalojado. Versión al relevar esta guía: 0.3.x (proyecto joven y muy activo).

### 5.2 Conceptos centrales

**Organización.** Tiene un objetivo, empleados (agentes), organigrama, presupuesto mensual y tareas. Una instalación puede manejar varias organizaciones separadas.

**Agentes.** Cada uno tiene un adaptador (con qué herramienta corre), un rol, un jefe (árbol estricto, salvo el CEO), un presupuesto y un estado (activo, en ejecución, pausado, con error, despedido).

**Tareas (issues).** Un solo responsable a la vez, enlazadas a una tarea padre, un proyecto y un objetivo. El agente siempre ve el *por qué*.

```
backlog → todo → in_progress → in_review → done
                     │
                  blocked
```

Tomar una tarea requiere un **checkout atómico**: si dos agentes la piden a la vez, uno recibe `409 Conflict`.

**Heartbeats.** La idea más importante: **los agentes no corren todo el tiempo**. Se despiertan, trabajan y se apagan. Los despierta un horario, una asignación, un comentario, un clic en "Invoke" o una aprobación resuelta. En cada latido siguen un protocolo: identidad, tareas asignadas, elegir, reservar, trabajar, comentar, actualizar estado. Paperclip les inyecta una skill que les enseña ese protocolo y su API.

**Delegación y gobernanza.** Vos sos el **directorio**:

```
Definís un objetivo
 → El CEO propone una estrategia para tu aprobación
 → La aprobás
 → El CEO la parte en tareas y las asigna
 → Si falta gente, pide contratar un agente (podés exigir aprobación)
 → Cada agente trabaja en sus latidos
 → El CEO supervisa y te escala lo que no resuelve
```

Podés pausar, reasignar o despedir cualquier agente. Todo queda en un registro de auditoría.

### 5.3 Funciones principales

- **Control de costos**: presupuestos por empresa, agente y proyecto. Aviso al **80%**, pausa automática al **100%**.
- **Rutinas**: trabajos recurrentes con horario, webhook o API. Cada ejecución crea una tarea con responsable e historial.
- **Etapas de revisión y aprobación** antes de dar una tarea por terminada.
- **Conexiones**: GitHub, Notion, servidores MCP propios. Por acción: *Permitido*, *Preguntar antes* o *Desactivado*.
- **Secretos cifrados** con acceso por agente.
- **Skill Studio**: escribir, probar, versionar y restaurar skills de los agentes.
- **Equipos prearmados**: ejecutivo (CEO, CTO, QA), ingeniería de producto, diseño de producto, y opcionales de contenido y agente telefónico.
- **Exportar e importar** organizaciones completas.
- **Espacios aislados**: git worktrees o sandboxes en la nube.
- **Plugins** para extender sin modificar el núcleo.
- **Experimentales** (desactivados por defecto): chat con agentes y conectores de Slack, Discord, Telegram y correo.

### 5.4 Instalación y uso

Requisitos: Node.js 24.11+ y una clave de API (Anthropic u OpenAI) o una suscripción a Claude o Codex.

Prueba temporal sin compromiso, con un CEO ya creado:

```bash
ANTHROPIC_API_KEY=... npx paperclipai test-drive
```

Instalación persistente:

```bash
npx paperclipai@latest onboard --yes   # queda en http://localhost:3100
npx paperclipai run                     # para volver a arrancarlo
```

Modos de despliegue:

- `local_trusted` (por defecto): solo tu máquina, sin login.
- `authenticated` + `private`: con login, por red privada o Tailscale. Para el celular o un equipo.
- `authenticated` + `public`: expuesto a internet, con controles más estrictos.

Telemetría anónima **activada por defecto**. Se apaga con `PAPERCLIP_TELEMETRY_DISABLED=1` o `DO_NOT_TRACK=1`.

### 5.5 Ventajas

1. Resuelve la coordinación de muchos agentes: tareas con historial que sobreviven reinicios.
2. Control de gasto real, con pausa automática ante bucles descontrolados.
3. No te ata a un proveedor: cada agente puede usar un modelo distinto.
4. Trazabilidad completa de acciones y costos.
5. Vos mantenés las decisiones importantes con aprobaciones.
6. Gratis, código abierto, autoalojado.
7. Proyecto muy activo y con mucha adopción.
8. Sirve para más que código: investigación, contenido, operaciones.

### 5.6 Desventajas

1. **Muy joven**: varias piezas experimentales, cambios frecuentes.
2. **La "empresa sin humanos" no existe todavía**: reseñas reportan datos inventados, sitios con diseño roto y agentes que pierden contexto sin avisar.
3. **La gobernanza controla permisos, no calidad**: las etapas de revisión hay que configurarlas y alguien tiene que revisar de verdad.
4. **Puede salir caro**: estimaciones externas hablan de USD 50 a 200 por mes por agente activo con latidos frecuentes. Son estimaciones de terceros y dependen de la configuración.
5. **Mantenimiento a tu cargo**: si tu servidor se cae, los agentes se detienen.
6. **Curva de aprendizaje**: muchos conceptos nuevos y una superficie enorme.
7. **Riesgo de seguridad**: los agentes pueden actuar con tus credenciales.
8. **No es para tareas rápidas**: para algo puntual, un agente directo es más simple.

### 5.7 Cuándo usarlo

| Situación | ¿Paperclip? |
|---|---|
| Una tarea concreta, hoy | No. Agente directo |
| Un proyecto con un solo agente | Probablemente no. Las skills de la Parte A alcanzan |
| Varios agentes a la vez y perdés el hilo | **Sí** |
| Trabajos que se repiten todas las semanas | **Sí**, por las rutinas |
| Necesitás controlar el gasto en IA | **Sí** |
| Querés que la IA maneje un negocio sola | No, hoy no lo cumple |
| Aprender cómo funcionan los equipos de agentes | **Sí**, con presupuesto bajo |

---

## 6. Contexto: GSD, BMAD y Spec Kit

Matt Pocock critica estos frameworks porque "se adueñan del proceso". Conviene conocerlos para entender las dos filosofías:

- **Spec Kit (GitHub)**: desarrollo guiado por specs en cuatro fases (Spec, Plan, Tasks, Implement). Cada fase deja un Markdown que alimenta la siguiente.
- **BMAD Method** ("Build More Architect Dreams"): simula un equipo ágil con personajes (Product Manager, arquitecto, desarrolladora, Scrum Master, UX) y fases formales con PRD, arquitectura, épicas, historias y sprints.
- **GSD ("Get Shit Done")**: framework de ingeniería de contexto contra el "context rot". Un orquestador lanza subagentes especializados y guarda el estado en archivos fijos (`PROJECT.md`, `ROADMAP.md`, `STATE.md`, `PLAN.md`).

La diferencia es de filosofía:

| Método completo (GSD, BMAD, Spec Kit) | Piezas sueltas (mattpocock/skills) |
|---|---|
| Instalás todo el proceso de una vez | Combinás solo lo que necesitás |
| Estructura si no querés pensar el proceso | Control si querés ajustarlo |
| Difícil saber dónde falló una cadena larga | Cada pieza es chica y legible |

Paperclip está más cerca del primer grupo en cuanto a que trae organigrama y protocolo armados, pero no te dice cómo construir agentes, sino cómo coordinarlos.

---

## 7. El proyecto de práctica

Para aprender hace falta construir algo real pero chico. Propuesta por defecto:

> **Gestor de turnos para un negocio de servicios**: los clientes piden un turno, el negocio confirma o reprograma, y hay un listado diario de turnos.

Por qué sirve:

- Tiene **dominio con términos ambiguos** ("turno", "reserva", "cita", "cliente", "usuario"), ideal para practicar el glosario.
- Tiene **estados** (pedido, confirmado, reprogramado, cancelado, atendido), ideal para un prototipo de lógica.
- Tiene **trabajo recurrente** (el listado diario, recordatorios), ideal para las rutinas de Paperclip.
- Se puede hacer chico: una API y una interfaz mínima.

Podés cambiarlo por cualquier otro proyecto. Si lo cambiás, el agente adapta los ejercicios. Sugerencia de stack: TypeScript con Node, Vitest para tests y SQLite. Cualquier stack que domines sirve.

---

## 8. Plan de aprendizaje por módulos

Cada módulo tiene: **objetivo**, **pasos**, **criterio de completitud** y **preguntas de reflexión**. Un módulo por sesión.

### Módulo 0: Preparación

**Objetivo:** dejar el repo listo para el resto del plan.

**Pasos:**

1. Instalar el plugin: `claude plugin install mattpocock-skills@claude-plugins-official`.
2. Inicializar git en el repo si no existe.
3. Correr `/setup-matt-pocock-skills`. Para aprender, elegí **archivos markdown locales** como tracker (así ves los tickets como archivos en `.scratch/`). Más adelante podés cambiar a GitHub.
4. Agregar a `CLAUDE.md` el puntero a esta guía ([sección 2](#2-cómo-usar-esta-guía-para-vos)).

**Criterio de completitud:** existen `docs/agents/issue-tracker.md`, `docs/agents/domain.md` y una sección `## Agent skills` en `CLAUDE.md`.

**Reflexión:** ¿qué skills dependen de esta configuración y por qué fallarían sin ella?

### Módulo 1: Alinear antes de construir

**Objetivo:** sentir la diferencia entre pedir algo directo y pasar por un interrogatorio.

**Pasos:**

1. Escribí en un párrafo la idea del proyecto de práctica.
2. Corré `/grill-with-docs` con ese párrafo.
3. Respondé las rondas. Observá: preguntas numeradas, respuesta recomendada en cada una, "sí" acepta la recomendación.
4. Cuando el agente te desafíe un término ("¿turno o reserva?"), elegí uno y fijate cómo se actualiza `GLOSSARY.md`.

**Criterio de completitud:** existe `GLOSSARY.md` con al menos 5 términos sin detalles de implementación, y el agente confirma que no quedan preguntas abiertas.

**Reflexión:** ¿qué decisión hubieras tomado distinto si no te preguntaba? ¿Se propuso algún ADR? ¿Cumplía los tres requisitos (difícil de revertir, sorprendente, trade-off real)?

### Módulo 2: Prototipar una pregunta

**Objetivo:** resolver una duda de diseño con código descartable.

**Pasos:**

1. Elegí una pregunta del grilling que no se resolvió bien en papel. Ejemplo: "¿qué pasa si reprogramo un turno ya confirmado?".
2. Pedí: *"Usá la skill prototype para responder esta pregunta."*
3. Abrí el HTML generado y recorré los casos.
4. Guardá la respuesta: el prototipo en una rama `prototype/<nombre>` y la conclusión en el glosario o en un ADR.

**Criterio de completitud:** la pregunta tiene una respuesta escrita y el prototipo está en su rama, fuera de `main`.

**Reflexión:** ¿por qué el prototipo no lleva tests ni persistencia? Bonus: en un proyecto real habrías hecho `/handoff` antes y después. ¿Cuándo te conviene y cuándo no? (Repasá la [sección 4.8](#48-conceptos-transversales).)

### Módulo 3: De la conversación al plan

**Objetivo:** convertir lo hablado en spec y tickets.

**Pasos:**

1. En la **misma sesión** del grilling (o retomándola), corré `/to-spec`.
2. Revisá los seams que propone. Pensá: ¿es el seam más alto posible? ¿Hay uno solo?
3. Corré `/to-tickets`. Revisá la propuesta antes de aceptar: granularidad, bloqueos, ¿cada ticket es vertical?
4. Pedí que fusione o divida al menos un ticket, para practicar el ajuste.

**Criterio de completitud:** existen la spec y entre 3 y 6 tickets en `.scratch/<feature>/issues/`, cada uno con "Bloqueado por" y criterios de aceptación.

**Reflexión:** ¿algún ticket era horizontal ("crear todas las tablas")? ¿Por qué la spec no incluye rutas de archivo?

### Módulo 4: Construir con TDD y revisión

**Objetivo:** implementar tickets con el ciclo rojo, verde y la revisión en dos ejes.

**Pasos:**

1. Corré `/implement` con el primer ticket sin bloqueos.
2. Observá el ciclo: un test que falla, la implementación mínima, repetir.
3. Al final, leé el reporte de `/code-review`: sección **Standards** y sección **Spec** por separado.
4. Hacé `/clear` y repetí con el siguiente ticket.

**Criterio de completitud:** al menos 2 tickets implementados, con tests en verde y un code review cada uno.

**Reflexión:** ¿encontró un code smell? ¿Encontró algo pedido por la spec que faltaba? ¿Por qué el refactor no es parte del ciclo de TDD? ¿Qué cambia hacer `/clear` entre tickets?

### Módulo 5: Depurar con disciplina

**Objetivo:** practicar las seis fases de `/diagnosing-bugs`.

**Pasos:**

1. Pedile al agente que introduzca un bug sutil sin decirte dónde (por ejemplo, un error de zona horaria en los turnos), y que lo guarde en una rama aparte.
2. En una sesión nueva, describí solo el síntoma y decí *"diagnosticá esto"*.
3. Verificá que no teorice antes de tener un comando que se ponga rojo.
4. Revisá las hipótesis que te muestra antes de probarlas.

**Criterio de completitud:** el bug está arreglado, hay un test de regresión, y no quedan logs `[DEBUG-...]`.

**Reflexión:** ¿cuánto tiempo se fue en la fase 1 comparado con el resto? ¿Había un buen seam para el test de regresión?

### Módulo 6: Diseño y arquitectura

**Objetivo:** aprender el vocabulario de módulos profundos y usarlo para mejorar el código.

**Pasos:**

1. Pedile al agente que te explique el vocabulario de `/codebase-design` con ejemplos de tu propio código.
2. Corré `/improve-codebase-architecture`. Abrí el reporte HTML.
3. Elegí un candidato y pasá por el grilling que sigue.
4. Si rechazás un candidato con una razón de peso, aceptá el ADR para que no se vuelva a proponer.

**Criterio de completitud:** leíste el reporte, elegiste un candidato y quedó una decisión escrita (implementar, descartar con ADR, o dejar como ticket).

**Reflexión:** aplicá el test de borrado a un módulo tuyo. ¿La complejidad desaparece o reaparece en otros lugares?

### Módulo 7: Mejorar el entorno y escribir tu propia skill

**Objetivo:** cerrar el ciclo y aprender a escribir para agentes.

**Pasos:**

1. Corré `/retro` sobre una de las sesiones anteriores.
2. Implementá al menos una mejora mecánica (un chequeo de lint, un hook de pre-commit o un script de CI).
3. Leé `/writing-for-agents` y escribí una skill propia chica para algo que repetís en este repo (por ejemplo, "crear un turno de prueba").

**Criterio de completitud:** hay una mejora del entorno commiteada y una skill tuya que el agente encuentra y usa.

**Reflexión:** ¿la descripción de tu skill tiene una palabra ancla clara? ¿Hay alguna frase que sea un no-op?

### Módulo 8 (opcional): Orquestación avanzada

**Objetivo:** probar los flujos más grandes de la Parte A.

**Opción A:** escribí una spec nueva con varios tickets independientes y corré `/implement-spec`. Observá los subagentes en paralelo y la rama de integración.

**Opción B:** corré `/wayfinder` sobre una idea grande ("convertir el gestor de turnos en una plataforma para varios negocios"). Resolvé solo dos tickets del mapa.

**Criterio de completitud:** entendés cuándo elegirías `/implement` frente a `/implement-spec`, y `/grill-with-docs` frente a `/wayfinder`.

### Módulo 9: Primer contacto con Paperclip

**Objetivo:** entender los conceptos de la Parte B sin riesgo.

**Pasos:**

1. Apagá la telemetría si querés: `export PAPERCLIP_TELEMETRY_DISABLED=1`.
2. Corré `npx paperclipai test-drive` con tu clave de API.
3. En la interfaz, encontrá: la organización, el CEO, el organigrama, el tablero de costos.
4. **Configurá un presupuesto mensual bajo** para el CEO.
5. Creá una tarea simple y chica (por ejemplo, "escribí un resumen de una página sobre qué es un gestor de turnos").
6. Mirá el latido: cuándo se despierta, qué hace, qué comentarios deja, cuánto cuesta.

**Criterio de completitud:** la tarea llegó a `done`, viste el registro de la ejecución y sabés cuánto costó.

**Reflexión:** ¿qué despertó al agente? ¿Qué pasaría si otro agente intentara tomar la misma tarea?

### Módulo 10: Paperclip con tu repo de práctica

**Objetivo:** que un agente de Paperclip trabaje sobre el código del Módulo 4.

**Pasos:**

1. Instalá Paperclip de forma persistente (`npx paperclipai@latest onboard --yes`).
2. Creá un proyecto apuntando a este repo, con espacios de trabajo aislados (worktrees).
3. Contratá un agente programador con presupuesto bajo.
4. Configurá una **etapa de revisión** donde vos aprobás antes de que la tarea se cierre.
5. Asignale uno de los tickets pendientes del Módulo 3.
6. Revisá el resultado y aprobá o pedí cambios.

**Criterio de completitud:** un ticket fue implementado por un agente de Paperclip y pasó por tu revisión.

**Reflexión:** ¿qué ganaste comparado con hacer `/implement` vos mismo? ¿Qué perdiste?

### Módulo 11: Rutinas y combinación de las dos capas

**Objetivo:** usar Paperclip para trabajo recurrente y cargarle las prácticas de la Parte A.

**Pasos:**

1. Creá una rutina diaria: "generar el listado de turnos del día" o "revisar si hay tests fallando y abrir una tarea".
2. Cargá en el Skill Studio de Paperclip una skill de la Parte A para el agente programador (por ejemplo, la disciplina de `tdd`), o tu propia skill del Módulo 7.
3. Dejá correr la rutina dos o tres veces y revisá historial y costos.

**Criterio de completitud:** la rutina corrió sola al menos dos veces y podés explicar cuánto cuesta por mes con la configuración actual.

**Reflexión final:** ¿en qué proyecto tuyo real usarías cada capa? Escribí la respuesta en el registro de progreso.

---

## 9. Chuleta: qué usar según la situación

| Situación | Herramienta |
|---|---|
| Repo nuevo, primera vez | `/setup-matt-pocock-skills` |
| No sé qué usar | `/ask-matt` |
| Tengo una idea para el repo | `/grill-with-docs` |
| Tengo una idea sin repo | `/grill-me` |
| No puedo decidir sin verlo funcionando | `/prototype` |
| Ya hablamos todo, quiero un plan | `/to-spec`, después `/to-tickets` |
| Construir un ticket | `/implement` |
| Construir la spec entera en paralelo | `/implement-spec` |
| Proyecto gigante sin camino claro | `/wayfinder` |
| Bug difícil | `/diagnosing-bugs` |
| Se acumulan issues externos | `/triage` |
| Revisar una rama o PR | `/code-review` |
| El código se volvió un lío | `/improve-codebase-architecture` |
| La sesión salió mal | `/retro` |
| Cambio de herramienta, carpeta o persona | `/handoff` |
| Pasos que solo puede hacer un humano | `/wizard` |
| Necesito info de otra persona | `/to-questionnaire` |
| No entendí al agente | `/wait-what` |
| Varios agentes y pierdo el hilo | Paperclip |
| Trabajo recurrente automatizado | Paperclip, rutinas |
| Controlar el gasto de varios agentes | Paperclip, presupuestos |

---

## 10. Glosario

Términos de esta guía. Mantenelo separado del `GLOSSARY.md` de tu proyecto, que es del dominio (turnos, clientes).

**ADR (Architecture Decision Record):** documento corto que registra una decisión difícil de revertir y por qué se tomó.

**Adapter (skills):** algo concreto que cumple una interfaz en un seam. **Adaptador (Paperclip):** el conector entre Paperclip y una herramienta de agente.

**Checkout atómico:** reserva exclusiva de una tarea en Paperclip. Si otro la tiene, devuelve `409`.

**Context rot:** degradación de la calidad del agente a medida que se llena su ventana de contexto.

**Fuente primaria:** la sesión o el artefacto original. Un resumen es una fuente secundaria y pierde información.

**Frontera:** el conjunto de preguntas (en un grilling) o tickets (en un plan) que ya no dependen de nada pendiente.

**Grilling:** interrogatorio por rondas para alinear antes de construir.

**Heartbeat (latido):** ventana corta en la que un agente de Paperclip se despierta, trabaja y se apaga.

**Lenguaje ubicuo:** vocabulario compartido entre vos, el agente y el código (de Domain-Driven Design).

**Módulo profundo:** mucho comportamiento detrás de una interfaz chica.

**Seam:** lugar donde vive la interfaz de un módulo y donde se testea.

**Smart zone:** rango de contexto (unos 150k tokens) en el que el modelo razona bien.

**Test de borrado:** imaginar que se borra un módulo. Si la complejidad reaparece en muchos lugares, el módulo valía la pena.

**Tracer bullet:** rebanada vertical fina que atraviesa todas las capas y se puede demostrar sola.

**User-invoked / model-invoked:** skills que solo activás vos, frente a skills que el agente puede usar solo.

---

## 11. Errores comunes

- **Saltarse el grilling** porque "ya sé lo que quiero". Es justo el caso donde más sirve.
- **Compactar o limpiar contexto entre grilling, spec y tickets.** Se pierde el porqué de las decisiones.
- **Tickets horizontales** ("primero toda la base de datos"). Cada ticket debe ser demostrable solo.
- **Triagear tickets que creó `/to-tickets`.** Ya están listos para agentes.
- **Usar `/wayfinder` para una feature acotada.** Es lento y denso a propósito.
- **Teorizar sobre un bug sin un comando que lo reproduzca.**
- **Meter detalles de implementación en `GLOSSARY.md`.** Es un glosario, nada más.
- **Arrancar Paperclip sin presupuesto bajo.** Un bucle puede gastar mucho antes de que lo notes.
- **Confiar en la salida de Paperclip sin revisarla.** La gobernanza controla permisos, no calidad.
- **Conectar servicios que envían mensajes a terceros sin "Preguntar antes".**

---

## 12. Registro de progreso

El agente actualiza esta tabla al terminar cada módulo.

| Módulo | Estado | Fecha | Qué se hizo | Aprendizajes y dudas |
|---|---|---|---|---|
| 0. Preparación | Terminado | 2026-10-20 | Plugin `mattpocock-skills` 1.3.1 instalado. `/setup-matt-pocock-skills` con tracker en markdown local (`.scratch/`), etiquetas por defecto y docs de dominio single-context. Se escribieron `docs/agents/{issue-tracker,triage-labels,domain}.md` y la sección `## Agent skills` en `CLAUDE.md` | La skill explora antes de preguntar y saltea lo que la exploración ya resolvió (docs de dominio, por no haber monorepo). Con remote en GitHub, su default habría sido GitHub Issues: elegimos local para ver los tickets como archivos. `GLOSSARY.md` y `docs/adr/` se crean recién en el Módulo 1 |
| 1. Alinear antes de construir | Terminado | 2026-10-20 | `/grill-with-docs` en 3 rondas (Q1 a Q26) sobre el TEG digital. La v1 es la conquista local en el navegador para 2 a 6 jugadores, con el objetivo común de 30 países como única forma de ganar. Se creó `GLOSSARY.md` con 15 términos y se sumaron a `docs/reference/` los 89 pares limítrofes (del TEG de Ricardo Quesada) y las tarjetas y objetivos | La primera ronda arrancó sin el párrafo de idea y preguntó lo que el párrafo debía contestar. Un subagente buscó en segundo plano un hecho (los límites) mientras seguía el interrogatorio: los hechos son del agente, las decisiones del usuario. El glosario desafió "ficha" contra "ejército" dos veces, y separó Jugador (nombre) de Color (lo que apuntan los objetivos). No hubo ADR: el reagrupamiento sin límite de distancia es sorprendente y es un trade-off, pero es fácil de revertir. Las ramas de tarjetas, objetivos secretos y pactos se dejaron para después sin interrogarlas |
| 2. Prototipar una pregunta | Pendiente | | | |
| 3. De la conversación al plan | Terminado | 2026-10-20 | `/to-spec` en la misma sesión del grilling: un solo seam (la interfaz pública del motor puro) y `.scratch/teg/spec.md` con 61 historias de usuario. `/to-tickets` propuso 7 tickets verticales; el usuario pidió dividir el primero ("crear partida" y "mapa esquemático") y quedaron 8 en `.scratch/teg/issues/`, cada uno con "Blocked by" y criterios de aceptación | Se hizo antes que el Módulo 2: ninguna pregunta del grilling necesitaba un prototipo, y así la spec se armó sobre la conversación original. El seam incluye la fuente de azar como parámetro (dos adapters desde el día uno, semilla y dados fijos, así que es un seam real) y "restaurar partida", que sirve al guardado y a los tests. Se aceptaron 8 tickets aunque la guía pide de 3 a 6: son verticales y cada uno entra en una sesión. `/to-spec` sumó dos reglas inferidas que no se habían preguntado (no atacar después de reagrupar, mover tras conquistar antes de otra acción): la skill sintetiza sin entrevistar, así que hay que revisar la spec |
| 4. Construir con TDD y revisión | Pendiente | | | |
| 5. Depurar con disciplina | Pendiente | | | |
| 6. Diseño y arquitectura | Pendiente | | | |
| 7. Mejorar el entorno y escribir tu skill | Pendiente | | | |
| 8. Orquestación avanzada (opcional) | Pendiente | | | |
| 9. Primer contacto con Paperclip | Pendiente | | | |
| 10. Paperclip con tu repo | Pendiente | | | |
| 11. Rutinas y combinación | Pendiente | | | |

### Diferencias encontradas entre esta guía y las herramientas reales

*(El agente anota acá cualquier cosa que haya cambiado en las skills o en Paperclip.)*

Relevado el 2026-10-20 contra mattpocock/skills `5beb35b` (plugin v1.3.1) y paperclipai/paperclip `2b16262` (CLI `paperclipai` 0.3.1).

**mattpocock/skills**

- `/setup-matt-pocock-skills` **no pregunta por los docs de dominio**: escribe single-context (un `GLOSSARY.md` + `docs/adr/` en la raíz) sin preguntar, salvo que detecte un monorepo. La pregunta de etiquetas solo aparece si `triage` está instalado (con el plugin, sí). También escribe `docs/agents/triage-labels.md`.
- `GLOSSARY.md` y `docs/adr/` se crean de forma perezosa: recién cuando se resuelve el primer término o hace falta el primer ADR, no en el setup.
- Con tracker local, la spec va a `.scratch/<feature>/spec.md` y cada ticket a `.scratch/<feature>/issues/<NN>-<slug>.md`, con líneas `Blocked by:` y `Status:`.
- `/implement` commitea en la **rama actual**: no crea una rama propia.
- `/tdd` exige confirmar los seams con el usuario **antes** de escribir cualquier test.

**Paperclip**

- Requiere **Node.js 24.11+**. En esta máquina hay Node 22.16: hay que actualizar antes del Módulo 9.
- Los presupuestos se configuran en **centavos** (`budgetMonthlyCents`). Al 80% el agente recibe un aviso para enfocarse solo en tareas críticas; al 100% se pausa y deja de recibir heartbeats.
- Estados de agente: active, **idle**, running, error, paused, terminated (la guía omitía `idle`).
- Contradicción interna en sus docs: `core-concepts` dice que una @-mención en un comentario despierta al agente, pero el FAQ del README dice que una mención sola no asigna trabajo ni lo despierta. Verificarlo en la práctica en el Módulo 9.
- Iniciar sesión con la suscripción local de Claude o Codex requiere Python 3 y el CLI del proveedor en el host.

---

## 13. Fuentes

- mattpocock/skills: <https://github.com/mattpocock/skills>
- Paperclip: <https://github.com/paperclipai/paperclip>
- Documentación de Paperclip: <https://docs.paperclip.ing>
- GitHub Spec Kit: <https://github.github.com/spec-kit/>
- BMAD Method: <https://mintlify.wiki/bmad-code-org/BMAD-METHOD/concepts/framework-overview.md>
- Get Shit Done (GSD): <https://mintlify.wiki/gsd-build/get-shit-done>
- Reseña de Paperclip con costos estimados (Fast.io): <https://fast.io/resources/paperclip-ai-review-2026.md>
- Reseña de Paperclip, experiencia de un fin de semana (Kunal Ganglani): <https://www.kunalganglani.com/blog/paperclip-ai-review-zero-human-company.md>
