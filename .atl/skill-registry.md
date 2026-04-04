# Skill Registry

**Orchestrator use only.** Leé este archivo una vez por sesión para resolver paths y disparadores sin volver a escanear el workspace.

## Global Skills relevantes

| Trigger / Cuándo usarla | Skill | Path | Por qué conviene usarla acá |
|---|---|---|---|
| Crear o actualizar una skill local/proyecto | `skill-creator` | `/Users/fernandogabrielrusso/.codex/skills/.system/skill-creator/SKILL.md` | Este repo ya tiene skill local y va a necesitar mantenerla viva sin inventar formato cada vez. |
| Actualizar el registro de skills del proyecto | `skill-registry` | `/Users/fernandogabrielrusso/.codex/skills/skill-registry/SKILL.md` | Mantiene discoverability para orquestación y evita que cada sesión vuelva a “descubrir” skills a mano. |
| Inicializar SDD en el proyecto | `sdd-init` | `/Users/fernandogabrielrusso/.codex/skills/sdd-init/SKILL.md` | Útil para bootstrap o re-bootstrap de contexto persistido y convenciones. |
| Explorar una idea o cambio antes de implementar | `sdd-explore` | `/Users/fernandogabrielrusso/.codex/skills/sdd-explore/SKILL.md` | Acá hay compatibilidad legacy y Firestore-first; explorar antes de tocar reduce roturas. |
| Redactar propuesta de cambio | `sdd-propose` | `/Users/fernandogabrielrusso/.codex/skills/sdd-propose/SKILL.md` | Sirve cuando el impacto cruza wizard, services, tracking o export. |
| Escribir especificaciones del cambio | `sdd-spec` | `/Users/fernandogabrielrusso/.codex/skills/sdd-spec/SKILL.md` | Aterriza requisitos y escenarios antes de tocar flujos sensibles. |
| Diseñar arquitectura/approach técnico | `sdd-design` | `/Users/fernandogabrielrusso/.codex/skills/sdd-design/SKILL.md` | Muy valioso cuando hay que ordenar boundaries entre pages, API, services y utils. |
| Desglosar implementación en tareas | `sdd-tasks` | `/Users/fernandogabrielrusso/.codex/skills/sdd-tasks/SKILL.md` | Evita cambios grandotes sin plan en un repo con deuda y naming mixto. |
| Implementar un cambio ya especificado | `sdd-apply` | `/Users/fernandogabrielrusso/.codex/skills/sdd-apply/SKILL.md` | Obliga a ejecutar con contexto y alcance claros. |
| Verificar implementación contra specs/tareas | `sdd-verify` | `/Users/fernandogabrielrusso/.codex/skills/sdd-verify/SKILL.md` | Clave cuando se tocan cotizaciones, tracking o compatibilidad de datos. |
| Archivar un cambio SDD completo | `sdd-archive` | `/Users/fernandogabrielrusso/.codex/skills/sdd-archive/SKILL.md` | Cierra el loop y deja memoria reutilizable. |
| Escribir tests Go/Bubbletea | `go-testing` | `/Users/fernandogabrielrusso/.codex/skills/go-testing/SKILL.md` | Globalmente disponible, pero en este repo solo aplica si aparece tooling Go externo; no es skill primaria del proyecto. |

## Project Skills

| Trigger / Cuándo usarla | Skill | Path | Por qué conviene usarla acá |
|---|---|---|---|
| Tocar Astro/Firebase/Firestore/Vitest en este repo, especialmente cotizaciones, wizard, services, tracking, export o naming legacy | `cotizador-astro-firebase` | `/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/.agents/skills/cotizador-astro-firebase/SKILL.md` | Encapsula las verdades locales: Firestore-first, boundaries de services/API, naming mixto y zonas riesgosas. |

## Project Conventions

| File | Path | Notes |
|---|---|---|
| `AGENTS.md` | `/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/AGENTS.md` | Reglas operativas del repo, verificación, tono y zonas sensibles. |
| `README.md` | `/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/README.md` | Overview técnico/funcional, comandos reales, env y riesgos conocidos. |

## Notas operativas

- Repo root real: `/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador`
- Fuente de verdad runtime: **Firestore**, no `database/schema.sql`
- Skill local prioritaria para código del repo: **`cotizador-astro-firebase`**
- Este workspace todavía **no tiene `.atl/` ignorado en `.gitignore`**. No se cambió por restricción explícita de esta tarea.
