# Cotizador Online (BLS)

Aplicación web para **cotizar servicios audiovisuales y eventos** de BLS. El producto centraliza catálogo, clientes, generación de cotizaciones, seguimiento comercial y salidas documentales como PDF/Excel, con runtime server-side en Astro y datos en Firebase/Firestore.

> **Realidad operativa del repo**
>
> - La raíz Git real es `cotizador/`.
> - El runtime actual es **Firestore-first**.
> - `database/schema.sql` existe como artefacto legacy/documental, **pero no es la fuente de verdad operativa**.
> - El working tree puede venir sucio y puede haber otros workers tocando archivos en paralelo.

## Producto en una frase

BLS arma presupuestos para eventos/servicios audiovisuales, administra clientes e items, y hace seguimiento del ciclo de vida de cada cotización.

## Stack verificado

- **Astro 5** con `output: "server"`
- **Tailwind CSS**
- **Netlify adapter** para deploy server-side
- **Firebase client + Firebase Admin + Firestore**
- **Vitest** con `jsdom` y cobertura V8
- Utilidades de documentos/exportación: `pdfmake`, `xlsx`, `mammoth`

## Arquitectura actual

```text
src/
├── pages/        # UI Astro + endpoints /api
├── services/     # lógica de negocio y acceso server-side a Firestore
├── utils/        # Firebase, auth, helpers, export, cache, validaciones
├── components/   # UI reutilizable
├── layouts/      # layouts Astro
├── config/       # configuración de empresa / app
└── types/        # tipos de compatibilidad/legacy
```

## Flujo principal de cotización

1. **Catálogo y clientes**
   - Se administran categorías, items y clientes.
   - El backend real persiste sobre Firestore (`clientes`, `items`, `categorias`, `cotizaciones`, etc.).

2. **Creación de cotización**
   - El flujo crítico pasa por `src/pages/quotes/wizard.astro` y también por `src/pages/quotes/new.astro` / edición / vista.
   - La lógica de dominio y persistencia vive principalmente en services y helpers de cotización.

3. **Compatibilidad de datos**
   - El sistema convive con naming legacy en snake_case y naming nuevo en camelCase.
   - `src/utils/quoteHelpers.ts` normaliza campos como `cliente_id` ⇄ `clienteId` y `created_at` ⇄ `createdAt`.

4. **Seguimiento comercial**
   - `src/services/QuoteTrackingService.ts` y `src/pages/api/quote-tracking.ts` cubren estados, historial, recordatorios y métricas.

5. **Salida documental / comunicación**
   - Hay rutas/utilidades para PDF, Excel y email.
   - Estas áreas son sensibles por compatibilidad y por secretos/configuración histórica.

## Estructura funcional relevante

- `src/pages/api/quotes.ts` — operaciones API de cotizaciones
- `src/pages/api/quote-tracking.ts` — seguimiento y recordatorios
- `src/services/CotizacionService.ts` — CRUD de cotizaciones
- `src/services/QuoteTrackingService.ts` — estados, historial y reminders
- `src/services/ClienteService.ts`, `ItemService.ts`, `CategoriaService.ts` — dominio catálogo/clientes
- `src/utils/firebase.ts` — Firebase cliente
- `src/utils/firebaseAdmin.ts` — Firebase Admin para server runtime
- `src/utils/quoteHelpers.ts` — compatibilidad, numeración y cálculos de cotización
- `src/utils/export.ts`, `src/utils/pdf.ts`, `src/utils/excel.ts` — exportación documental

## Comandos reales del repo

Según `package.json`:

```bash
npm install
npm run dev
npm run dev:auto
npm run test
npm run test:run
npm run test:coverage
npm run build      # existe para CI/Netlify, pero NO usar como verificación rutinaria de agentes
npm run preview
```

## Variables de entorno (alto nivel)

### Firebase cliente (`.env.example`)

```bash
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
NODE_ENV=
```

### Firebase Admin (server-side)

Estas variables se consumen desde `src/utils/firebaseAdmin.ts`:

```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Otras integraciones detectadas

- `SENDGRID_API_KEY` aparece referenciada en `src/services/EmailNotificationService.ts`.
- También hay evidencia de configuración SMTP hardcodeada en servicios/scripts legacy o activos. Tratá esa zona con muchísimo cuidado.

## Riesgos conocidos del repo

- **Firestore-first real vs SQL legacy**: no tomar `database/schema.sql` como contrato productivo.
- **Naming mixto**: snake_case + camelCase conviven por compatibilidad.
- **Acceso a datos inconsistente**: hay lugares que usan services y otros que todavía tocan Firebase más directo.
- **Secretos SMTP hardcodeados**: existen referencias sensibles en algunos servicios/scripts; no tocarlas sin tarea explícita.
- **Working tree sucio**: puede haber cambios ajenos en paralelo; no revertirlos.
- **Export/email/tracking**: son áreas frágiles porque impactan negocio real y compatibilidad histórica.

## Cómo trabajar bien en este repo

### Reglas mínimas

- Trabajá desde `cotizador/`, no desde el parent folder.
- Verificá claims técnicos antes de afirmarlos.
- No hagas build después de cambios si estás actuando como agente.
- No asumas naming uniforme ni modelo de datos “limpio”. Primero verificá compatibilidad.
- Preferí `src/services/*` y `src/pages/api/*` antes que acceso directo desde páginas/componentes.
- Si el cambio toca cotizaciones, tracking o exportación, revisá helpers y compatibilidad legacy antes de editar.

### AI / SDD / Engram

Este repo ahora deja baseline persistido para trabajo asistido por AI:

- `AGENTS.md` — reglas operativas del proyecto
- `.atl/skill-registry.md` — skills globales/proyecto relevantes
- `.agents/skills/cotizador-astro-firebase/SKILL.md` — skill local con convenciones del repo

Recomendación de workflow:

1. **Contexto**: recuperar memoria en Engram si el tema ya se trabajó.
2. **Cambios grandes**: usar SDD (`sdd-explore` → `sdd-propose` → `sdd-spec`/`sdd-design` → `sdd-tasks` → `sdd-apply` → `sdd-verify` → `sdd-archive`).
3. **Cambios chicos**: igual guardar decisiones, descubrimientos y bugs relevantes en Engram.
4. **Verificación**: usar lectura de diff y tests focalizados; no build rutinario.

## Testing

Stack de test verificado:

- `vitest`
- ambiente `jsdom`
- setup en `test/setup.ts`
- cobertura configurada en `vitest.config.ts`

Guideline práctica:

- Para lógica pura o compatibilidad de cotizaciones, empezá por tests focalizados tipo `QuoteHelper`/services.
- No tomes el coverage global como sustituto de entender el flujo de negocio.

## Nota para futuros agentes

Si vas a tocar esta app, no te enamores del primer archivo que veas. Entendé primero **qué capa estás tocando**, **qué naming legacy preserva compatibilidad** y **si el cambio pega en el wizard de cotizaciones o en tracking/export/email**. Ahí se gana o se rompe el sistema.
