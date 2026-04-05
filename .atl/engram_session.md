# SDD Engram Session State
_Topic Key_: `sdd/Rediseño-Stitch-Awwwards/state`
_Última actualización_: 2026-04-04 · Sesión f77cc9dc

---

## Resumen del Progreso Global

### Fase 1 — Tokens de Diseño ✅
- Inyección de tokens Deep Dark Mode en `tailwind.config.mjs` (colores `surface-container-*`, `primary-container`, sombras premium, fuente `Inter`).

### Fase 2 — Componentes Base ✅
- `Card.astro`, `Button.astro`, `Input.astro`: glassmorphism, sin bordes sólidos, glow properties.

### Fase 3 — Dashboard Ejecutivo ✅
- `dashboard.astro`: Layout asimétrico Bento Grid, `AnalyticsService.ts` intacto, Sidebar con `backdrop-blur-3xl`.

### Fase 4 — Gestión de Ítems ✅
- `items.astro`: Tabla premium Bento Grid, modal glassmorphism, acciones Editar/Borrar en hover directo. Motor `renderItems` en JS puro.

### Fase 5 — Portafolio de Clientes ✅ (sesión actual)
- `clients.astro`: Bento Grid de tarjetas con avatar (foto o iniciales), badges de estado, acciones contextuales en hover.
- **Avatar upload (base64 + compresión)**: Canvas API comprime a 256px JPEG antes de guardar.
- **Fixes críticos resueltos**:
  - Bug race condition: `wasEditing` capturado antes de `hideModal()` → mensaje "actualizado" vs "creado" correcto.
  - `ClienteService.ts` `mapDocumentToCliente()` no pasaba `imagenBase64` → añadido spread condicional.
  - API `clients.ts` hardcodeaba campos y descartaba `imagenBase64` → añadido a POST y PUT.
  - `ClienteUpdateData` / `ClienteCreateData` interfaces no tenían `imagenBase64` → añadido campo opcional.
- **Feature: quitar foto**: Botón ❌ rojo superpuesto al avatar, `shouldRemovePhoto = true` → API envía `FieldValue.delete()` a Firestore.
- **Commits**: `cee3b37`

### Fase 6 — Historial de Cotizaciones ✅ (sesión actual)
- `quotes.astro`: Migración completa al sistema Deep Dark Mode.
- **Stats Bento** (4 cards): Total, Tasa de Conversión, Total Facturado, Vencidas.
- **Analytics Row**: Distribución por Estado con barras de progreso + Top Clientes Aprobados (ranking con medalla) + Próximos Vencimientos.
- **Widget dólar** (compacto, junto al CTA): Oficial / MEP / Blue via `dolarapi.com`, async, solo aparece si la API responde.
- **Fixes críticos resueltos**:
  - Tasa de conversión: fórmula corregida a `aprobadas / total` (antes dividía por `enviadas` → siempre 0).
  - Estado en card: normalización defensiva del string antes de render → ya no muestra "Borrador" cuando es "Aprobada".
- **Commits**: `2e89192`

### Fase 7 — Vista de Cotización ✅ (sesión actual)
- `quotes/view/[id].astro`: Migración completa.
- **Layout dos columnas** (xl): Izquierda 2/3 (bento detalles del evento + tabla de items), Derecha 1/3 (sidebar).
- **Sidebar**: Card de total prominente, info rápida (número, cliente, fecha, lugar, items), observaciones, condiciones como lista, acciones rápidas (seguimiento + editar).
- **Tabla items**: Hover sutil, footer con subtotal + descuento + total en `text-primary`, mobile cards.
- **Lógica de exportación PDF/Excel**: 100% intacta.
- **Commits**: `0433332`

---

## Arquitectura de Archivos Modificados

| Archivo | Estado | Observaciones |
|---------|--------|---------------|
| `src/pages/clients.astro` | ✅ Migrado | Avatar upload, Bento Grid, modal glassmorphism |
| `src/pages/api/clients.ts` | ✅ Actualizado | imagenBase64 en POST/PUT, FieldValue.delete() |
| `src/services/ClienteService.ts` | ✅ Actualizado | mapDocumentToCliente + interfaces con imagenBase64 |
| `src/pages/quotes.astro` | ✅ Migrado | Stats, analytics, widget dólar, lista con stripe de estado |
| `src/pages/quotes/view/[id].astro` | ✅ Migrado | Two-column layout, bento detalles, sidebar |
| `src/pages/dashboard.astro` | ✅ Migrado (sesión anterior) | — |
| `src/pages/items.astro` | ✅ Migrado (sesión anterior) | — |
| `src/pages/quotes/wizard.astro` | ✅ Migrado (sesión anterior) | — |

---

## Reglas Acordadas con el Usuario
- **Scope estricto**: Solo estilos y semántica DOM. NO tocar states ni endpoints de Firebase ni `pdfmake`.
- **Componentes en `.astro`**, no migrar a React.
- **Deep Dark Mode** inamovible.
- **Commits atómicos** por feature/fase.
- **Sin co-authored-by** ni atribución AI en commits.

---

## Pendiente / Próximos Pasos

| Página | Prioridad | Notas |
|--------|-----------|-------|
| `quotes/tracking/[id].astro` | Alta | Seguimiento de cotización |
| `quotes/edit/[id].astro` | Alta | Edición de cotización |
| `config.astro` | Media | Configuración empresa |
| Dashboard Quick Actions | Baja | Ya funcionales, podría pulirse más |

---

## APIs y Servicios Externos
- **dolarapi.com**: Widget de cotización dólar (Oficial, MEP, Blue). Fetch client-side async, no bloqueante.
- **Firebase/Firestore**: Toda la lógica de persistencia intacta. `FieldValue.delete()` para borrar `imagenBase64`.
- **Canvas API**: Compresión de imágenes a 256px JPEG (calidad 0.8) antes de guardar en Firestore.
