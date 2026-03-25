import { c as createComponent, d as createAstro, f as addAttribute, j as renderScript, l as renderHead, o as renderSlot, r as renderTemplate } from './astro/server_B0jxGkjM.mjs';
import 'piccolore';
import 'clsx';
/* empty css                           */

const $$Astro = createAstro();
const $$Base = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Base;
  const {
    title,
    description = "Cotizador de servicios audiovisuales para eventos"
  } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"${addAttribute(description, "content")}><title>${title}</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><!-- Google Fonts: Inter for body, Outfit for headings --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet"><!-- Global Error Boundary -->${renderScript($$result, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/layouts/Base.astro?astro&type=script&index=0&lang.ts")}${renderHead()}</head> <body class="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200 antialiased text-gray-900 dark:text-gray-100"> ${renderSlot($$result, $$slots["default"])} <!-- Theme initialization script --> ${renderScript($$result, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/layouts/Base.astro?astro&type=script&index=1&lang.ts")} </body> </html> `;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/layouts/Base.astro", void 0);

export { $$Base as $ };
