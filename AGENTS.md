# AGENTS.md — Cotizador

## Identidad del repo

- **Git root real**: `cotizador/`
- Trabajá siempre desde `/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador`.
- Este proyecto es una app **Astro + Tailwind + Netlify + Firebase + Vitest** para cotización de servicios audiovisuales y eventos BLS.

## Verdades operativas del sistema

- **Firestore-first**: la fuente de verdad operativa está en Firebase/Firestore.
- **NO uses `database/schema.sql` como verdad funcional**. Ese SQL es legacy/documental; no describe el runtime real actual.
- `src/utils/firebase.ts` y `src/utils/firebaseAdmin.ts` son la entrada real a Firebase cliente/admin.
- El acceso a datos del lado servidor debería pasar **primero** por `src/services/*` y/o `src/pages/api/*` antes que por lecturas/escrituras directas desde páginas o componentes.
- El flujo crítico del negocio vive alrededor de:
  - `src/pages/quotes/wizard.astro`
  - `src/pages/api/quotes.ts`
  - `src/services/CotizacionService.ts`
  - `src/services/QuoteTrackingService.ts`
  - `src/utils/quoteHelpers.ts`
  - `src/utils/export.ts`, `src/utils/pdf.ts`, `src/utils/excel.ts`

## Convenciones de arquitectura

- Estructura actual:
  - `src/pages` → UI y endpoints Astro API
  - `src/services` → lógica de negocio y acceso server-side a Firestore
  - `src/utils` → helpers transversales, Firebase/auth/export/cache
  - `src/components` → piezas reutilizables de UI
- **Preferí boundaries claros**:
  1. página/componente captura intención,
  2. API o service resuelve la operación,
  3. helper/utilidad solo encapsula lógica transversal.
- Si encontrás lógica de datos duplicada entre páginas y services, **no la “normalices” por reflejo**. Primero verificá impacto y compatibilidad legacy.

## Compatibilidad de datos y naming

- El repo convive con **snake_case y camelCase**, especialmente en cotizaciones (`cliente_id`/`clienteId`, `created_at`/`createdAt`, etc.).
- **No asumas naming único**.
- Antes de renombrar campos o “limpiar” estructuras, verificá usos en:
  - `src/utils/quoteHelpers.ts`
  - tests de `QuoteHelper`
  - services/API afectados
- Preferí **adaptadores/normalización** antes que migraciones masivas.

## Zonas riesgosas — no tocar sin task explícita

- `database/schema.sql` y artefactos SQL legacy
- `src/services/EmailNotificationService.ts`
- `src/services/ReminderAutomationService.ts`
- `src/services/RealEmailService.ts`
- `scripts/archive/*`
- exportación/generación de PDF, Excel, DOCX o emails automáticos
- autenticación/admin Firebase/env sensibles
- cualquier archivo no relacionado con la tarea si el working tree ya está sucio

## Reglas operativas para agentes

- **No hagas build después de cambios.**
- No reviertas cambios ajenos. Este repo puede tener workers en paralelo y el working tree puede venir sucio.
- Verificá claims técnicos en código/config antes de afirmarlos.
- Si algo no está claro, decí **“dejame verificar”** y comprobalo.
- Si una modificación toca flujo crítico, naming legacy o export/email/tracking, explicá riesgo y tradeoffs antes de seguir.
- Preferí cambios pequeños, focalizados y verificables.
- No “modernices” por estética. Priorizá compatibilidad operativa.

## Verificación esperada

- Para cambios de lógica, preferí verificación focalizada:
  - lectura de diff
  - validación estática/manual
  - tests de Vitest puntuales si la tarea lo pide o lo justifica
- **No uses build como verificación rutinaria**.
- Cuando documentes o propongas cambios, citá archivos/fuentes reales del repo.

## AI / SDD / Engram

- Usá **Engram** para recuperar contexto previo y persistir decisiones, descubrimientos, bugs y patrones importantes.
- Usá **SDD** para cambios medianos o grandes:
  - `sdd-init`
  - `sdd-explore`
  - `sdd-propose`
  - `sdd-spec`
  - `sdd-design`
  - `sdd-tasks`
  - `sdd-apply`
  - `sdd-verify`
  - `sdd-archive`
- Si una tarea impacta arquitectura, datos o flujo crítico de cotización, no improvises: proponé o seguí un cambio SDD.

## Tono de trabajo

- Si el prompt entra en español, respondé en **español rioplatense**, directo y pedagógico.
- Priorizá **conceptos, evidencia y tradeoffs** sobre code-dumping.
- Corregí con fundamento técnico, no con opiniones.
