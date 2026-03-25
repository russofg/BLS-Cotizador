/* empty css                                   */
import { c as createComponent, i as renderComponent, j as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B0jxGkjM.mjs';
import 'piccolore';
import { $ as $$Base } from '../chunks/Base_DaFcxdZo.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "BLS Cotizador - Sistema de Cotizaciones" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800"> <div class="max-w-md w-full space-y-8 px-4"> <div> <div class="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-primary-600 shadow-lg"> <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <h1 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
BLS Cotizador
</h1> <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
Sistema de cotizaciones para eventos audiovisuales
</p> </div> <div class="mt-8 space-y-6"> <div class="rounded-md shadow-sm space-y-4"> <a href="/login" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
Iniciar Sesión
</a> </div> <div class="grid grid-cols-2 gap-4 mt-6"> <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"> <h3 class="font-medium text-gray-900 dark:text-gray-100">Items</h3> <p class="text-2xl font-bold text-primary-600 dark:text-primary-400" id="items-count"> <span class="inline-block h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span> </p> <p class="text-xs text-gray-500 dark:text-gray-400">servicios activos</p> </div> <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"> <h3 class="font-medium text-gray-900 dark:text-gray-100">Cotizaciones</h3> <p class="text-2xl font-bold text-primary-600 dark:text-primary-400" id="quotes-count"> <span class="inline-block h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span> </p> <p class="text-xs text-gray-500 dark:text-gray-400">totales</p> </div> </div> </div> </div> </div> ` })} ${renderScript($$result, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/index.astro", void 0);

const $$file = "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
