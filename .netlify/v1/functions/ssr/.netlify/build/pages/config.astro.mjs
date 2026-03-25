/* empty css                                   */
import { c as createComponent, i as renderComponent, j as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B0jxGkjM.mjs';
import 'piccolore';
import { $ as $$Dashboard } from '../chunks/Dashboard_B-pf1Dyi.mjs';
import { $ as $$PageHeader } from '../chunks/PageHeader_DzmpkV0U.mjs';
import { $ as $$Card } from '../chunks/Card_DppfKCyF.mjs';
import { $ as $$Button } from '../chunks/Button_Qb3BKv6-.mjs';
import { $ as $$Select } from '../chunks/Select_DO73WNwS.mjs';
import { $ as $$ScrollbarStyles } from '../chunks/ScrollbarStyles_BaxEijLZ.mjs';
/* empty css                                  */
export { renderers } from '../renderers.mjs';

const $$Config = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Dashboard", $$Dashboard, { "title": "Configuraci\xF3n - BLS Cotizador", "activeSection": "config", "data-astro-cid-kp3sq5ur": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ScrollbarStyles", $$ScrollbarStyles, { "data-astro-cid-kp3sq5ur": true })} ${maybeRenderHead()}<div class="space-y-6" data-astro-cid-kp3sq5ur> <!-- Header --> ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": "Configuraci\xF3n", "subtitle": "Ajusta las preferencias del sistema y personaliza tu experiencia", "data-astro-cid-kp3sq5ur": true })} <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" data-astro-cid-kp3sq5ur> <!-- Configuración General --> ${renderComponent($$result2, "Card", $$Card, { "title": "Configuraci\xF3n General", "data-astro-cid-kp3sq5ur": true }, { "default": ($$result3) => renderTemplate` <form id="config-form" class="space-y-6" data-astro-cid-kp3sq5ur> <!-- Idioma --> ${renderComponent($$result3, "Select", $$Select, { "id": "config-language", "name": "language", "label": "Idioma", "options": [
    { value: "es", label: "Espa\xF1ol" },
    { value: "en", label: "English" },
    { value: "pt", label: "Portugu\xEAs" }
  ], "data-astro-cid-kp3sq5ur": true })} <!-- Zona horaria --> ${renderComponent($$result3, "Select", $$Select, { "id": "config-timezone", "name": "timezone", "label": "Zona horaria", "options": [
    {
      value: "America/Argentina/Buenos_Aires",
      label: "Buenos Aires (GMT-3)"
    },
    { value: "America/Sao_Paulo", label: "S\xE3o Paulo (GMT-3)" },
    { value: "America/Santiago", label: "Santiago (GMT-3)" },
    { value: "America/Montevideo", label: "Montevideo (GMT-3)" }
  ], "data-astro-cid-kp3sq5ur": true })} <!-- Formato de fecha --> ${renderComponent($$result3, "Select", $$Select, { "id": "config-date-format", "name": "dateFormat", "label": "Formato de fecha", "options": [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" }
  ], "data-astro-cid-kp3sq5ur": true })} <!-- Moneda --> ${renderComponent($$result3, "Select", $$Select, { "id": "config-currency", "name": "currency", "label": "Moneda", "options": [
    { value: "ARS", label: "Peso Argentino (ARS)" },
    { value: "USD", label: "D\xF3lar Estadounidense (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "BRL", label: "Real Brasile\xF1o (BRL)" }
  ], "data-astro-cid-kp3sq5ur": true })} <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700" data-astro-cid-kp3sq5ur> ${renderComponent($$result3, "Button", $$Button, { "id": "reset-config-btn", "variant": "secondary", "size": "md", "data-astro-cid-kp3sq5ur": true }, { "default": ($$result4) => renderTemplate`
Restablecer
` })} ${renderComponent($$result3, "Button", $$Button, { "id": "save-config-btn", "variant": "primary", "size": "md", "data-astro-cid-kp3sq5ur": true }, { "default": ($$result4) => renderTemplate`
Guardar Configuración
` })} </div> </form> ` })} <!-- Notificaciones --> ${renderComponent($$result2, "Card", $$Card, { "title": "Notificaciones", "data-astro-cid-kp3sq5ur": true }, { "default": ($$result3) => renderTemplate` <form id="notifications-form" class="space-y-6" data-astro-cid-kp3sq5ur> <div class="space-y-4" data-astro-cid-kp3sq5ur> <!-- Email notifications --> <div class="flex items-center justify-between" data-astro-cid-kp3sq5ur> <div data-astro-cid-kp3sq5ur> <label class="text-sm font-medium text-gray-900 dark:text-gray-100" data-astro-cid-kp3sq5ur>
Notificaciones por email
</label> <p class="text-sm text-gray-500 dark:text-gray-400" data-astro-cid-kp3sq5ur>
Recibe emails sobre cotizaciones y cambios importantes
</p> </div> <div class="flex items-center" data-astro-cid-kp3sq5ur> <input id="email-notifications" name="emailNotifications" type="checkbox" checked class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded" data-astro-cid-kp3sq5ur> </div> </div> <!-- Push notifications --> <div class="flex items-center justify-between" data-astro-cid-kp3sq5ur> <div data-astro-cid-kp3sq5ur> <label class="text-sm font-medium text-gray-900 dark:text-gray-100" data-astro-cid-kp3sq5ur>
Notificaciones push
</label> <p class="text-sm text-gray-500 dark:text-gray-400" data-astro-cid-kp3sq5ur>
Notificaciones en tiempo real en el navegador
</p> </div> <div class="flex items-center" data-astro-cid-kp3sq5ur> <input id="push-notifications" name="pushNotifications" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded" data-astro-cid-kp3sq5ur> </div> </div> <!-- Weekly reports --> <div class="flex items-center justify-between" data-astro-cid-kp3sq5ur> <div data-astro-cid-kp3sq5ur> <label class="text-sm font-medium text-gray-900 dark:text-gray-100" data-astro-cid-kp3sq5ur>
Reportes semanales
</label> <p class="text-sm text-gray-500 dark:text-gray-400" data-astro-cid-kp3sq5ur>
Resumen semanal de actividad y estadísticas
</p> </div> <div class="flex items-center" data-astro-cid-kp3sq5ur> <input id="weekly-reports" name="weeklyReports" type="checkbox" checked class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded" data-astro-cid-kp3sq5ur> </div> </div> </div> <div class="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700" data-astro-cid-kp3sq5ur> ${renderComponent($$result3, "Button", $$Button, { "id": "save-notifications-btn", "variant": "primary", "size": "md", "data-astro-cid-kp3sq5ur": true }, { "default": ($$result4) => renderTemplate`
Guardar Notificaciones
` })} </div> </form> ` })} <!-- Apariencia --> ${renderComponent($$result2, "Card", $$Card, { "title": "Apariencia", "data-astro-cid-kp3sq5ur": true }, { "default": ($$result3) => renderTemplate` <div class="space-y-6" data-astro-cid-kp3sq5ur> <!-- Tema --> <div data-astro-cid-kp3sq5ur> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3" data-astro-cid-kp3sq5ur>
Tema
</label> <div class="grid grid-cols-3 gap-3" data-astro-cid-kp3sq5ur> <button id="theme-light" class="theme-option p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-200" data-theme="light" data-astro-cid-kp3sq5ur> <div class="w-full h-6 bg-white border border-gray-200 dark:border-gray-600 rounded mb-2" data-astro-cid-kp3sq5ur></div> <span class="text-sm" data-astro-cid-kp3sq5ur>Claro</span> </button> <button id="theme-dark" class="theme-option p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-200" data-theme="dark" data-astro-cid-kp3sq5ur> <div class="w-full h-6 bg-gray-800 rounded mb-2" data-astro-cid-kp3sq5ur></div> <span class="text-sm" data-astro-cid-kp3sq5ur>Oscuro</span> </button> <button id="theme-auto" class="theme-option p-3 border border-primary-500 rounded-lg text-center bg-primary-50 dark:bg-primary-900/20" data-theme="auto" data-astro-cid-kp3sq5ur> <div class="w-full h-6 bg-gradient-to-r from-white to-gray-800 rounded mb-2" data-astro-cid-kp3sq5ur></div> <span class="text-sm font-medium text-primary-700 dark:text-primary-300" data-astro-cid-kp3sq5ur>Auto</span> </button> </div> </div> <!-- Densidad --> ${renderComponent($$result3, "Select", $$Select, { "id": "config-density", "name": "density", "label": "Densidad de la interfaz", "options": [
    { value: "compact", label: "Compacta" },
    { value: "normal", label: "Normal" },
    { value: "comfortable", label: "C\xF3moda" }
  ], "data-astro-cid-kp3sq5ur": true })} </div> ` })} <!-- Información del Sistema --> ${renderComponent($$result2, "Card", $$Card, { "title": "Informaci\xF3n del Sistema", "data-astro-cid-kp3sq5ur": true }, { "default": ($$result3) => renderTemplate` <div class="space-y-4" data-astro-cid-kp3sq5ur> <div class="flex justify-between text-sm" data-astro-cid-kp3sq5ur> <span class="text-gray-600 dark:text-gray-400" data-astro-cid-kp3sq5ur>Versión:</span> <span class="text-gray-900 dark:text-gray-100" data-astro-cid-kp3sq5ur>1.0.0</span> </div> <div class="flex justify-between text-sm" data-astro-cid-kp3sq5ur> <span class="text-gray-600 dark:text-gray-400" data-astro-cid-kp3sq5ur>Última actualización:</span> <span class="text-gray-900 dark:text-gray-100" data-astro-cid-kp3sq5ur>16 de junio, 2025</span> </div> <div class="flex justify-between text-sm" data-astro-cid-kp3sq5ur> <span class="text-gray-600 dark:text-gray-400" data-astro-cid-kp3sq5ur>Servidor:</span> <span class="text-gray-900 dark:text-gray-100" data-astro-cid-kp3sq5ur>En línea</span> </div> <div class="pt-4 border-t border-gray-200 dark:border-gray-700" data-astro-cid-kp3sq5ur> ${renderComponent($$result3, "Button", $$Button, { "id": "check-updates-btn", "variant": "secondary", "size": "sm", "class": "w-full", "data-astro-cid-kp3sq5ur": true }, { "default": ($$result4) => renderTemplate`
Buscar Actualizaciones
` })} </div> </div> ` })} </div> </div> ` })} ${renderScript($$result, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/config.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/config.astro", void 0);

const $$file = "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/config.astro";
const $$url = "/config";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Config,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
