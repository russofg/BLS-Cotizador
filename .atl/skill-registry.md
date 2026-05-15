# Skill Registry — bls-cotizador

**Orchestrator use only.** Leé este archivo una vez por sesión para resolver paths y disparadores sin volver a escanear el workspace.

> El mismo set de skills existe en `~/.claude/skills/` (Claude Code) y `~/.codex/skills/` (Codex). Los paths de abajo apuntan a `.claude/` porque es lo que resuelve el harness activo, pero la skill es equivalente en ambos lados.

## Global Skills relevantes

### SDD (planning + execution loop)

| Trigger / Cuándo usarla | Skill | Path |
|---|---|---|
| Inicializar SDD en el proyecto | `sdd-init` | `/Users/fernandogabrielrusso/.claude/skills/sdd-init/SKILL.md` |
| Explorar una idea antes de proponer cambios | `sdd-explore` | `/Users/fernandogabrielrusso/.claude/skills/sdd-explore/SKILL.md` |
| Redactar propuesta de cambio | `sdd-propose` | `/Users/fernandogabrielrusso/.claude/skills/sdd-propose/SKILL.md` |
| Escribir specs (delta specs) | `sdd-spec` | `/Users/fernandogabrielrusso/.claude/skills/sdd-spec/SKILL.md` |
| Diseñar arquitectura/approach técnico | `sdd-design` | `/Users/fernandogabrielrusso/.claude/skills/sdd-design/SKILL.md` |
| Desglosar implementación en tareas | `sdd-tasks` | `/Users/fernandogabrielrusso/.claude/skills/sdd-tasks/SKILL.md` |
| Implementar un cambio ya especificado | `sdd-apply` | `/Users/fernandogabrielrusso/.claude/skills/sdd-apply/SKILL.md` |
| Verificar implementación contra specs/tareas | `sdd-verify` | `/Users/fernandogabrielrusso/.claude/skills/sdd-verify/SKILL.md` |
| Archivar un cambio SDD completo | `sdd-archive` | `/Users/fernandogabrielrusso/.claude/skills/sdd-archive/SKILL.md` |
| Walkthrough guiado del ciclo SDD | `sdd-onboard` | `/Users/fernandogabrielrusso/.claude/skills/sdd-onboard/SKILL.md` |

### Code review / PR / commits

| Trigger / Cuándo usarla | Skill | Path |
|---|---|---|
| Splitear cambios grandes en PRs encadenados (~400 LOC budget) | `chained-pr` | `/Users/fernandogabrielrusso/.claude/skills/chained-pr/SKILL.md` |
| Estructurar commits como work-units (no por tipo de archivo) | `work-unit-commits` | `/Users/fernandogabrielrusso/.claude/skills/work-unit-commits/SKILL.md` |
| Crear un issue siguiendo el flujo Agent Teams Lite | `issue-creation` | `/Users/fernandogabrielrusso/.claude/skills/issue-creation/SKILL.md` |
| Abrir PR siguiendo issue-first | `branch-pr` | `/Users/fernandogabrielrusso/.claude/skills/branch-pr/SKILL.md` |
| Redactar comments/feedback humano (PR, Slack, async) | `comment-writer` | `/Users/fernandogabrielrusso/.claude/skills/comment-writer/SKILL.md` |
| Review adversarial doble + síntesis | `judgment-day` | `/Users/fernandogabrielrusso/.claude/skills/judgment-day/SKILL.md` |

### Documentación / skills

| Trigger / Cuándo usarla | Skill | Path |
|---|---|---|
| Diseñar docs con progressive disclosure, chunking, signposting | `cognitive-doc-design` | `/Users/fernandogabrielrusso/.claude/skills/cognitive-doc-design/SKILL.md` |
| Crear una skill nueva siguiendo el spec | `skill-creator` | `/Users/fernandogabrielrusso/.claude/skills/skill-creator/SKILL.md` |
| Regenerar o actualizar este registry | `skill-registry` | `/Users/fernandogabrielrusso/.claude/skills/skill-registry/SKILL.md` |

### No primarias en este repo

| Skill | Path | Nota |
|---|---|---|
| `go-testing` | `/Users/fernandogabrielrusso/.claude/skills/go-testing/SKILL.md` | Solo si aparece tooling Go externo; este repo es Astro/TS, no aplica como skill primaria. |

## Project Skills

| Trigger / Cuándo usarla | Skill | Path | Por qué conviene usarla acá |
|---|---|---|---|
| Tocar Astro/Firebase/Firestore/Vitest en este repo, especialmente cotizaciones, wizard, services, tracking, export o naming legacy | `cotizador-astro-firebase` | `/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/.agents/skills/cotizador-astro-firebase/SKILL.md` | Encapsula verdades locales: Firestore-first, boundaries services/API, naming mixto y zonas riesgosas. |

## Project Conventions

| File | Path | Notes |
|---|---|---|
| `AGENTS.md` | `/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/AGENTS.md` | Reglas operativas del repo, verificación, tono y zonas sensibles. |
| `README.md` | `/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/README.md` | Overview técnico/funcional, comandos reales, env y riesgos conocidos. |
| `~/.claude/CLAUDE.md` | `/Users/fernandogabrielrusso/.claude/CLAUDE.md` | Reglas globales del usuario (rules, tono, philosophy, Engram protocol). |

## Compact Rules — para inyectar en sub-agents

### `cotizador-astro-firebase` (project)
- Firestore-first: la fuente de verdad runtime es Firebase/Firestore. NO usar `database/schema.sql` como contrato runtime.
- Acceso a datos server-side debe pasar por `src/services/*` y/o `src/pages/api/*` antes que escrituras directas desde páginas/componentes.
- Naming mixto: conviven `snake_case` y `camelCase` (`cliente_id`/`clienteId`, `created_at`/`createdAt`). NO renombrar sin task explícita; centralizar compat en `src/utils/quoteHelpers.ts`.
- Flujo crítico: `src/pages/quotes/wizard.astro`, `src/pages/api/quotes.ts`, `CotizacionService`, `QuoteTrackingService`, `quoteHelpers`, `export.ts`, `pdf.ts`, `excel.ts`. Revisar impacto aguas abajo antes de editar.
- Zonas NO seguras sin task explícita: `database/schema.sql`, `EmailNotificationService`, `ReminderAutomationService`, `RealEmailService`, `scripts/archive/*`, secretos SMTP, env productivo.
- Verificación focalizada: Vitest puntual + lectura de diff. NO usar `npm run build` como verificación rutinaria. `npm run verify` corre `astro check && vitest run`.
- Working tree puede venir sucio; no revertir cambios ajenos.

### `chained-pr`
- Budget cognitivo de review: ~400 LOC cambiados por PR.
- Si el cambio excede el budget → splitear en chained/stacked PRs, no monolito.
- Cada slice debe compilar/pasar tests por sí solo.

### `work-unit-commits`
- Commits agrupados por work unit entregable, NO por tipo de archivo (no “update tests” / “update docs”).
- Tests y docs viajan junto al código que verifican/documentan en el mismo commit.

### `cognitive-doc-design`
- Progressive disclosure: lo más importante arriba, detalles después.
- Recognition over recall: tablas, checklists, signposting, ejemplos concretos.
- Chunking: bloques cortos, scannables.

## Notas operativas

- Repo root real: `/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador`
- Fuente de verdad runtime: **Firestore**, no `database/schema.sql`
- Skill local prioritaria para código del repo: **`cotizador-astro-firebase`**
- Persistencia SDD activa: **engram** (no hay `openspec/`)
- Strict TDD Mode: **enabled** (vitest detectado)
- Comando de verificación combinada: `npm run verify` (`astro check && vitest run`)
- `.atl/` aún NO está en `.gitignore` — no se cambió por restricción explícita previa.
