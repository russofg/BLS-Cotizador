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
import { $ as $$ScrollbarStyles } from '../chunks/ScrollbarStyles_BaxEijLZ.mjs';
export { renderers } from '../renderers.mjs';

const $$Items = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Dashboard", $$Dashboard, { "title": "Gesti\xF3n de Items - BLS Cotizador", "activeSection": "items" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "ScrollbarStyles", $$ScrollbarStyles, {})} ${maybeRenderHead()}<div class="space-y-6"> <!-- Header --> ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": "Gesti\xF3n de Items", "subtitle": "Administra los servicios y productos disponibles para cotizar" }, { "actions": async ($$result3) => renderTemplate`<div class="flex space-x-3"> ${renderComponent($$result3, "Button", $$Button, { "id": "refresh-btn", "variant": "secondary", "size": "md" }, { "default": async ($$result4) => renderTemplate` <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path> </svg>
Actualizar
` })} ${renderComponent($$result3, "Button", $$Button, { "id": "add-item-btn", "variant": "primary", "size": "md" }, { "default": async ($$result4) => renderTemplate` <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15"></path> </svg>
Nuevo Item
` })} </div>` })} <!-- Status and Stats --> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> ${renderComponent($$result2, "StatCard", $$StatCard, { "title": "Total Items", "value": "0", "valueId": "total-items", "icon": "cubes", "color": "blue" })} ${renderComponent($$result2, "StatCard", $$StatCard, { "title": "Items Activos", "value": "0", "valueId": "active-items", "icon": "check-circle", "color": "green" })} ${renderComponent($$result2, "StatCard", $$StatCard, { "title": "Categor\xEDas", "value": "0", "valueId": "total-categories", "icon": "collection", "color": "purple" })} ${renderComponent($$result2, "StatCard", $$StatCard, { "title": "Precio Promedio", "value": "$0", "valueId": "avg-price", "icon": "currency-dollar", "color": "yellow" })} </div> <!-- Filters --> ${renderComponent($$result2, "Card", $$Card, { "class": "mb-8 shadow-premium overflow-visible" }, { "default": async ($$result3) => renderTemplate` <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end"> ${renderComponent($$result3, "Input", $$Input, { "id": "search", "placeholder": "Buscar por nombre o descripci\xF3n...", "label": "Buscar items" })} ${renderComponent($$result3, "Select", $$Select, { "id": "category", "label": "Filtrar por categor\xEDa", "options": [{ value: "", label: "Todas las categor\xEDas" }] })} ${renderComponent($$result3, "Select", $$Select, { "id": "status", "label": "Estado de disponibilidad", "options": [
    { value: "", label: "Todos los estados" },
    { value: "active", label: "Solo Activos" },
    { value: "inactive", label: "Solo Inactivos" }
  ] })} <div class="flex space-x-2"> ${renderComponent($$result3, "Button", $$Button, { "id": "clear-filters", "variant": "secondary", "class": "flex-1" }, { "default": async ($$result4) => renderTemplate`
Limpiar Filtros
` })} </div> </div> ` })} <!-- Items Table/Cards Container --> ${renderComponent($$result2, "Card", $$Card, { "class": "shadow-premium overflow-hidden" }, { "default": async ($$result3) => renderTemplate` <div class=""> <!-- Desktop Table View (hidden on mobile) --> <div class="hidden sm:block"> <div class="flow-root"> <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 custom-scrollbar"> <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"> <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> <thead> <tr> <th scope="col" class="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 sm:pl-0">
Item / Servicio
</th> <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
Categoría
</th> <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
Precio Base
</th> <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
Unidad
</th> <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
Estado
</th> <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
Acciones
</th> </tr> </thead> <tbody class="divide-y divide-gray-200 dark:divide-gray-600" id="items-tbody-desktop"> <tr> <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400"> <svg class="animate-spin h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
Cargando items...
</td> </tr> </tbody> </table> </div> </div> </div> </div> <!-- Mobile Card View (visible only on mobile) --> <div class="sm:hidden"> <div id="items-cards-mobile" class="space-y-4"> <div class="text-center py-8 text-gray-500 dark:text-gray-400"> <svg class="animate-spin h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
Cargando items...
</div> </div> </div> </div> ` })}</div>  <div id="loading-overlay" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50"> <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-sm w-full mx-4"> <div class="text-center"> <svg class="animate-spin h-12 w-12 mx-auto mb-4 text-primary-600" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
Cargando datos...
</h3> <p class="text-sm text-gray-500 dark:text-gray-400">
Conectando con Firebase
</p> </div> </div> </div>  <div id="item-modal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm hidden overflow-y-auto h-full w-full z-50 transition-all duration-300" role="dialog" aria-modal="true" aria-labelledby="modal-title"> <div class="relative top-5 sm:top-10 mx-auto p-0 border-0 w-11/12 max-w-2xl shadow-premium rounded-3xl bg-white dark:bg-gray-800 overflow-hidden anime-fade-in" role="document"> <div class="px-8 py-6 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"> <h3 class="text-2xl font-heading font-extrabold text-gray-900 dark:text-white" id="modal-title">
Nuevo Item
</h3> <button type="button" id="modal-close-btn" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Cerrar"> <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> <div class="p-8"> <form id="item-form" class="space-y-6" novalidate> <div class="grid grid-cols-1 sm:grid-cols-2 gap-6"> <!-- Nombre --> ${renderComponent($$result2, "Input", $$Input, { "id": "item-nombre", "name": "nombre", "required": true, "label": "Nombre del Item / Servicio", "placeholder": "Ej: Sistema de Sonido Pro" })} <!-- Categoría --> ${renderComponent($$result2, "Select", $$Select, { "id": "item-categoria", "name": "categoria", "required": true, "label": "Categor\xEDa del servicio", "placeholder": "Seleccionar...", "options": [] })} <!-- Precio Base --> ${renderComponent($$result2, "Input", $$Input, { "id": "item-precio", "name": "precioBase", "type": "number", "required": true, "label": "Precio Base (AR$)", "placeholder": "0", "min": "0", "step": "0.01" })} <!-- Unidad --> ${renderComponent($$result2, "Select", $$Select, { "id": "item-unidad", "name": "unidad", "required": true, "label": "Unidad de medida", "options": [
    { value: "servicio", label: "Servicio Completo" },
    { value: "evento", label: "Por Evento" },
    { value: "jornada", label: "Por Jornada" },
    { value: "metro", label: "Por Metro" },
    { value: "m\xB2", label: "Por Metro cuadrado" },
    { value: "hora", label: "Por Hora" },
    { value: "d\xEDa", label: "Por D\xEDa" },
    { value: "unidad", label: "Por Unidad" }
  ] })} </div> <!-- Descripción --> <div class="w-full"> <label for="item-descripcion" class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
Descripción técnica y alcances
</label> <textarea id="item-descripcion" name="descripcion" rows="3" class="block w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm placeholder:italic" placeholder="Detalla qué incluye este servicio o item..."></textarea> </div> <!-- Estado Activo --> <div class="flex items-center p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:bg-white dark:hover:bg-gray-800"> <input id="item-activo" name="activo" type="checkbox" checked class="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded-lg transition-all"> <div class="ml-3"> <label for="item-activo" class="block text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
Item activo para cotizaciones
</label> <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
Desactiva este item para ocultarlo temporalmente del catálogo sin eliminarlo.
</p> </div> </div> </form> <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-3 sm:gap-0 mt-8"> ${renderComponent($$result2, "Button", $$Button, { "id": "cancel-item-btn", "variant": "secondary", "class": "w-full sm:w-auto" }, { "default": async ($$result3) => renderTemplate`
Cancelar
` })} ${renderComponent($$result2, "Button", $$Button, { "id": "save-item-btn", "variant": "primary", "type": "submit", "class": "w-full sm:w-auto font-bold" }, { "default": async ($$result3) => renderTemplate`
Guardar Item en Catálogo
` })} </div> </div> </div> </div> ${renderScript($$result2, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/items.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/items.astro", void 0);

const $$file = "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/items.astro";
const $$url = "/items";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Items,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
