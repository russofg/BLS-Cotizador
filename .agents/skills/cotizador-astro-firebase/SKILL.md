---
name: cotizador-astro-firebase
description: Convenciones operativas para trabajar en Cotizador Online, una app Astro + Tailwind + Netlify + Firebase/Firestore + Vitest. Usar cuando una tarea toque páginas Astro, endpoints API, services, helpers de cotización, wizard de quotes, tracking, exportación, compatibilidad snake_case/camelCase, Firebase cliente/admin o testing del repo.
---

# Cotizador Astro Firebase

## Empezar por lo que es verdad

- Tratar este repo como **Firestore-first**.
- Considerar `database/schema.sql` y otros artefactos SQL como **legacy/documentales**, no como contrato runtime.
- Verificar la capa real en código antes de proponer cambios de datos.
- Tomar `src/utils/firebase.ts` y `src/utils/firebaseAdmin.ts` como entradas reales a Firebase.

## Respetar boundaries

- Preferir `src/services/*` para lógica de negocio y acceso server-side a Firestore.
- Preferir `src/pages/api/*` para exponer operaciones a la UI.
- Mantener `src/pages/*` orientado a UI/orquestación, no a lógica de negocio pesada.
- Usar `src/utils/*` para helpers transversales, no para meter reglas de dominio arbitrarias.
- Si encontrás acceso directo a Firebase desde páginas, no asumir que todo debe migrarse ya: evaluar compatibilidad y alcance primero.

## Tratar cotizaciones como flujo crítico

Revisar con cuidado cualquier tarea que toque:

- `src/pages/quotes/wizard.astro`
- `src/pages/api/quotes.ts`
- `src/services/CotizacionService.ts`
- `src/services/QuoteTrackingService.ts`
- `src/utils/quoteHelpers.ts`
- `src/utils/export.ts`
- `src/utils/pdf.ts`
- `src/utils/excel.ts`

Pensar el flujo así:

1. selección/configuración de cliente e items,
2. armado de cotización,
3. normalización de datos legacy,
4. persistencia Firestore,
5. tracking/recordatorios/estado,
6. salida documental o email.

Si una tarea entra en uno de esos pasos, revisar impacto aguas abajo antes de editar.

## Preservar compatibilidad de naming

- Aceptar que conviven `snake_case` y `camelCase`.
- No renombrar masivamente campos tipo `cliente_id`, `fecha_evento`, `created_at` si no existe tarea explícita de migración.
- Centralizar compatibilidad en helpers/adaptadores cuando sea posible.
- Revisar `src/utils/quoteHelpers.ts` y sus tests antes de tocar serialización/normalización.

## Moverse seguro en zonas delicadas

### Zonas relativamente seguras

- documentación del repo,
- tests de Vitest,
- helpers puros con buena cobertura,
- services o endpoints con alcance acotado y validación clara.

### Zonas NO seguras sin task explícita

- `database/schema.sql`
- `src/services/EmailNotificationService.ts`
- `src/services/ReminderAutomationService.ts`
- `src/services/RealEmailService.ts`
- `scripts/archive/*`
- secretos SMTP, credenciales Firebase, env productivo
- exportación PDF/Excel/email cuando no sea el foco del trabajo

## Testing y verificación

- Usar **Vitest** para validaciones focalizadas.
- Empezar por tests de helpers/services cuando la lógica sea pura o aislable.
- No usar build como verificación rutinaria.
- No declarar “esto funciona” sin evidencia en código, diff o test focalizado.
- Si el cambio es documental, verificar con paths, comandos y config reales del repo.

## Trabajar con otros workers

- Asumir working tree sucio.
- No revertir cambios ajenos.
- No tocar archivos fuera del alcance pedido.
- Si aparece conflicto conceptual con cambios en paralelo, priorizar adaptación y documentar el riesgo.

## AI / SDD / Engram

- Recuperar contexto previo con Engram si el tema ya se trabajó.
- Guardar descubrimientos, decisiones, bugs y patrones con `mem_save`.
- Para cambios medianos/grandes, usar SDD antes de implementar:
  - `sdd-explore`
  - `sdd-propose`
  - `sdd-spec`
  - `sdd-design`
  - `sdd-tasks`
  - `sdd-apply`
  - `sdd-verify`
  - `sdd-archive`

## Checklist mental antes de editar

1. Verificar si la fuente de verdad es Firestore o compat legacy.
2. Identificar si el cambio vive en UI, API, service o helper.
3. Revisar si toca wizard de cotización, tracking o export/email.
4. Confirmar impacto de naming mixto.
5. Elegir verificación focalizada sin build.
6. Guardar aprendizajes/decisiones en Engram.
