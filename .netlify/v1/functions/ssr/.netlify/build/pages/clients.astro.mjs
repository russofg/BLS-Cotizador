/* empty css                                   */
import { c as createComponent, i as renderComponent, r as renderTemplate, m as maybeRenderHead, j as renderScript } from '../chunks/astro/server_B0jxGkjM.mjs';
import 'piccolore';
import { $ as $$Dashboard } from '../chunks/Dashboard_B-pf1Dyi.mjs';
import { $ as $$PageHeader } from '../chunks/PageHeader_DzmpkV0U.mjs';
import { $ as $$StatCard } from '../chunks/StatCard_CZJEbzwA.mjs';
import { $ as $$Card } from '../chunks/Card_DppfKCyF.mjs';
import { $ as $$Button } from '../chunks/Button_Qb3BKv6-.mjs';
import { $ as $$Input } from '../chunks/Input_Dg7Aa5ZU.mjs';
import { $ as $$Select } from '../chunks/Select_DO73WNwS.mjs';
import { $ as $$Textarea } from '../chunks/Textarea_CUgfNQm4.mjs';
import { $ as $$ScrollbarStyles } from '../chunks/ScrollbarStyles_BaxEijLZ.mjs';
export { renderers } from '../renderers.mjs';

const $$Clients = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Dashboard", $$Dashboard, { "title": "Clientes - BLS Cotizador", "activeSection": "clients" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "ScrollbarStyles", $$ScrollbarStyles, {})} ${maybeRenderHead()}<div class="space-y-6"> <!-- Header --> ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": "Gesti\xF3n de Clientes", "subtitle": "Administra la base de datos de clientes y venues" }, { "actions": async ($$result3) => renderTemplate`<div class="flex space-x-3"> ${renderComponent($$result3, "Button", $$Button, { "id": "refresh-btn", "variant": "secondary", "size": "md" }, { "default": async ($$result4) => renderTemplate` <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path> </svg>
Actualizar
` })} ${renderComponent($$result3, "Button", $$Button, { "id": "add-client-btn", "variant": "primary", "size": "md" }, { "default": async ($$result4) => renderTemplate` <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15"></path> </svg>
Nuevo Cliente
` })} </div>` })} <!-- Statistics --> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> ${renderComponent($$result2, "StatCard", $$StatCard, { "title": "Total Clientes", "value": "0", "valueId": "total-clients", "icon": "users", "color": "blue" })} ${renderComponent($$result2, "StatCard", $$StatCard, { "title": "Clientes Activos", "value": "0", "valueId": "active-clients", "icon": "check-circle", "color": "green" })} ${renderComponent($$result2, "StatCard", $$StatCard, { "title": "Con Cotizaciones", "value": "0", "valueId": "clients-with-quotes", "icon": "document-check", "color": "purple" })} ${renderComponent($$result2, "StatCard", $$StatCard, { "title": "\xDAltimos 30 d\xEDas", "value": "0", "valueId": "recent-clients", "icon": "calendar", "color": "yellow" })} </div> <!-- Filters --> ${renderComponent($$result2, "Card", $$Card, { "class": "mb-8 shadow-premium overflow-visible" }, { "default": async ($$result3) => renderTemplate` <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end"> ${renderComponent($$result3, "Input", $$Input, { "id": "search", "placeholder": "Buscar clientes...", "label": "Buscar por nombre o email" })} ${renderComponent($$result3, "Select", $$Select, { "id": "status", "label": "Estado del cliente", "options": [
    { value: "", label: "Todos los estados" },
    { value: "active", label: "Solo Activos" },
    { value: "inactive", label: "Solo Inactivos" }
  ] })} ${renderComponent($$result3, "Input", $$Input, { "id": "company", "placeholder": "Filtrar por empresa...", "label": "Empresa / Instituci\xF3n" })} <div class="flex space-x-2"> ${renderComponent($$result3, "Button", $$Button, { "id": "clear-filters", "variant": "secondary", "class": "flex-1" }, { "default": async ($$result4) => renderTemplate`
Limpiar
` })} </div> </div> ` })} <!-- Clients Table/Cards Container --> ${renderComponent($$result2, "Card", $$Card, { "class": "shadow-premium overflow-hidden" }, { "default": async ($$result3) => renderTemplate` <div class=""> <!-- Desktop Table View (hidden on mobile) --> <div class="hidden sm:block"> <div class="flow-root"> <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 custom-scrollbar"> <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"> <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> <thead> <tr> <th scope="col" class="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 sm:pl-0">
Cliente
</th> <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
Empresa
</th> <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
Contacto
</th> <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
Cotizaciones
</th> <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
Estado
</th> <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
Acciones
</th> </tr> </thead> <tbody class="divide-y divide-gray-200 dark:divide-gray-600" id="clients-tbody-desktop"> <tr> <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400"> <svg class="animate-spin h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
Cargando clientes...
</td> </tr> </tbody> </table> </div> </div> </div> </div> <!-- Mobile Card View (visible only on mobile) --> <div class="sm:hidden"> <div id="clients-cards-mobile" class="space-y-4"> <div class="text-center py-8 text-gray-500 dark:text-gray-400"> <svg class="animate-spin h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
Cargando clientes...
</div> </div> </div> </div> ` })}</div>  <div id="client-modal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm hidden overflow-y-auto h-full w-full z-50 transition-all duration-300"> <div class="relative top-5 sm:top-20 mx-auto p-0 border-0 w-11/12 sm:w-[450px] shadow-premium rounded-3xl bg-white dark:bg-gray-800 overflow-hidden anime-fade-in"> <div class="px-8 py-6 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"> <h3 class="text-2xl font-heading font-extrabold text-gray-900 dark:text-white" id="modal-title">
Nuevo Cliente
</h3> <button type="button" id="modal-close-btn" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Cerrar"> <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> <div class="p-8"> <form id="client-form" class="space-y-5"> ${renderComponent($$result2, "Input", $$Input, { "id": "client-nombre", "required": true, "label": "Nombre completo", "placeholder": "Ej: Juan P\xE9rez" })} ${renderComponent($$result2, "Input", $$Input, { "id": "client-empresa", "label": "Empresa / Organizaci\xF3n", "placeholder": "Opcional" })} <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"> ${renderComponent($$result2, "Input", $$Input, { "id": "client-email", "type": "email", "label": "Email", "placeholder": "juan@ejemplo.com" })} ${renderComponent($$result2, "Input", $$Input, { "id": "client-telefono", "type": "tel", "label": "Tel\xE9fono", "placeholder": "+54..." })} </div> ${renderComponent($$result2, "Textarea", $$Textarea, { "id": "client-direccion", "rows": 2, "label": "Direcci\xF3n f\xEDsica", "placeholder": "Opcional" })} <div class="flex items-center p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:bg-white dark:hover:bg-gray-800"> <input id="client-activo" type="checkbox" checked class="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded-lg transition-all"> <label for="client-activo" class="ml-3 block text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Cliente activo comercialmente</label> </div> </form> <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-3 sm:gap-0 mt-8"> ${renderComponent($$result2, "Button", $$Button, { "id": "cancel-client-btn", "variant": "secondary", "class": "w-full sm:w-auto" }, { "default": async ($$result3) => renderTemplate`
Cancelar
` })} ${renderComponent($$result2, "Button", $$Button, { "id": "save-client-btn", "variant": "primary", "type": "submit", "class": "w-full sm:w-auto" }, { "default": async ($$result3) => renderTemplate`
Guardar Cliente
` })} </div> </div> </div> </div>  <div id="loading-overlay" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50"> <div class="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 max-w-sm w-full mx-4"> <div class="text-center"> <svg class="animate-spin h-12 w-12 mx-auto mb-4 text-primary-600" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
Procesando...
</h3> <p class="text-sm text-gray-500 dark:text-gray-400">
Conectando con Firebase
</p> </div> </div> </div> ${renderScript($$result2, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/clients.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/clients.astro", void 0);

const $$file = "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/clients.astro";
const $$url = "/clients";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Clients,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
