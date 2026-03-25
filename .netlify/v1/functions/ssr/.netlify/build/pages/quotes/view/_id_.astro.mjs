/* empty css                                         */
import { c as createComponent, d as createAstro, r as renderTemplate, j as renderScript, n as defineScriptVars, i as renderComponent, m as maybeRenderHead, f as addAttribute, u as unescapeHTML } from '../../../chunks/astro/server_B0jxGkjM.mjs';
import 'piccolore';
import { $ as $$Dashboard } from '../../../chunks/Dashboard_B-pf1Dyi.mjs';
import { a as cotizacionService, c as clienteService } from '../../../chunks/database_DkOv4JpX.mjs';
import { D as DateHelper } from '../../../chunks/dateHelpers_DuxKPoxD.mjs';
import { Q as QuoteHelper } from '../../../chunks/quoteHelpers_BMbd_S8Y.mjs';
import { $ as $$ScrollbarStyles } from '../../../chunks/ScrollbarStyles_BaxEijLZ.mjs';
import { D as DEFAULT_QUOTE_TEXTS, C as COMPANY_INFO } from '../../../chunks/company_BReyN6Nc.mjs';
export { renderers } from '../../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const defaultObservaciones = DEFAULT_QUOTE_TEXTS.observaciones;
  const defaultCondiciones = DEFAULT_QUOTE_TEXTS.condiciones;
  const { id } = Astro2.params;
  let cotizacion = null;
  let cliente = null;
  let error = "";
  const safeFormatDate = DateHelper.safeFormatDate;
  try {
    if (id) {
      const cotizaciones = await cotizacionService.getAll();
      cotizacion = cotizaciones.find((c) => c.id === id);
      if (cotizacion) {
        console.log("\u{1F50D} Server-side cotizacion object:", JSON.stringify(cotizacion, null, 2));
        const clientes = await clienteService.getAll();
        cliente = clientes.find((c) => c.id === cotizacion.cliente_id || c.id === cotizacion.clienteId);
        cotizacion.numeroMejorado = QuoteHelper.generateQuoteNumber(cotizacion, cliente);
      } else {
        error = "Cotizaci\xF3n no encontrada";
      }
    } else {
      error = "ID de cotizaci\xF3n no proporcionado";
    }
  } catch (err) {
    console.error("Error loading quote:", err);
    error = "Error al cargar la cotizaci\xF3n";
  }
  let itemsToShow = [];
  if (cotizacion && cotizacion.items) {
    itemsToShow = QuoteHelper.normalizeItems(cotizacion.items);
  }
  return renderTemplate(_a || (_a = __template(["", " <script>(function(){", "\n  // Make data available globally for export functions\n  window.cotizacion = cotizacion;\n  window.cliente = cliente;\n  window.itemsToShow = itemsToShow;\n  window.COMPANY_INFO = COMPANY_INFO;\n  window.defaultObservaciones = defaultObservaciones;\n  window.defaultCondiciones = defaultCondiciones;\n})();<\/script> ", ""])), renderComponent($$result, "Dashboard", $$Dashboard, { "title": "Ver Cotizaci\xF3n - BLS Cotizador", "activeSection": "quotes" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "ScrollbarStyles", $$ScrollbarStyles, {})} ${error ? renderTemplate`${maybeRenderHead()}<div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4"> <div class="flex"> <div class="flex-shrink-0"> <svg class="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path> </svg> </div> <div class="ml-3"> <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Error</h3> <div class="mt-2 text-sm text-red-700 dark:text-red-400"> <p>${error}</p> </div> </div> </div> </div>` : cotizacion ? renderTemplate`<div class="space-y-6"> <!-- Header --> <div class="bg-white dark:bg-gray-800 shadow rounded-lg"> <div class="px-4 py-5 sm:px-6"> <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> <div> <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words"> ${cotizacion.numeroMejorado || cotizacion.numero || `COT-${new Date(cotizacion.created_at).getFullYear()}-${String(cotizacion.id).padStart(3, "0")}`} </h1> <p class="mt-1 text-sm text-gray-500 dark:text-gray-400"> ${cotizacion.titulo || "Sin t\xEDtulo"} </p> </div> <div class="flex flex-wrap gap-2"> <button id="export-pdf-btn" class="inline-flex items-center justify-center px-3 py-2.5 border border-emerald-300 dark:border-emerald-600 shadow-sm text-sm font-medium rounded-md text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 flex-1 sm:flex-none touch-scroll-item transition-colors" title="Exportar como PDF"> <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path> </svg>
PDF
</button> <button id="export-excel-btn" class="inline-flex items-center justify-center px-3 py-2.5 border border-blue-300 dark:border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 flex-1 sm:flex-none touch-scroll-item transition-colors" title="Exportar como Excel"> <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2"></path> </svg>
Excel
</button> <a${addAttribute(`/quotes/edit/${cotizacion.id}`, "href")} class="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 flex-1 sm:flex-none touch-scroll-item"> <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path> </svg>
Editar
</a> <a href="/quotes" class="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 flex-1 sm:flex-none touch-scroll-item">
Volver a Cotizaciones
</a> </div> </div> </div> </div> <!-- Quote Details --> <div class="bg-white dark:bg-gray-800 shadow rounded-lg"> <div class="px-4 py-5 sm:p-6"> <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Detalles de la Cotización</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"> <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label> <p class="mt-1 text-sm text-gray-900 dark:text-gray-200 font-medium"> ${cliente ? `${cliente.nombre}${cliente.empresa ? ` - ${cliente.empresa}` : ""}` : "Cliente no encontrado"} </p> </div> <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label> <p class="mt-1"> ${(() => {
    const statusInfo = QuoteHelper.getQuoteStatusInfo(cotizacion.estado);
    return renderTemplate`<span${addAttribute(`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgClass} ${statusInfo.textClass}`, "class")}> ${statusInfo.text} </span>`;
  })()} </p> </div> <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Inicio del Evento</label> <p class="mt-1 text-sm text-gray-900 dark:text-gray-200 font-medium"> ${cotizacion.fecha_evento ? safeFormatDate(cotizacion.fecha_evento) : cotizacion.fechaEvento ? safeFormatDate(cotizacion.fechaEvento) : "No especificada"} </p> </div> <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Fin del Evento</label> <p class="mt-1 text-sm text-gray-900 dark:text-gray-200 font-medium"> ${cotizacion.fecha_evento_fin ? safeFormatDate(cotizacion.fecha_evento_fin) : cotizacion.fechaEventoFin ? safeFormatDate(cotizacion.fechaEventoFin) : cotizacion.fecha_evento ? safeFormatDate(cotizacion.fecha_evento) : cotizacion.fechaEvento ? safeFormatDate(cotizacion.fechaEvento) : "No especificada"} </p> </div> <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Lugar del Evento</label> <p class="mt-1 text-sm text-gray-900 dark:text-gray-200 font-medium"> ${cotizacion.lugar_evento || "No especificado"} </p> </div> <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Duración del Evento</label> <div class="mt-1 flex flex-wrap items-center gap-2"> <span class="text-sm text-gray-900 dark:text-gray-200 font-medium"> ${cotizacion.duracion_dias || (cotizacion.duracion_horas ? Math.ceil(cotizacion.duracion_horas / 24) : 1)} día(s)
</span> ${cotizacion.requiere_armado && renderTemplate`<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
+ Día de armado previo
</span>`} </div> </div> <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Armado Previo</label> <div class="mt-1"> ${cotizacion.requiere_armado ? renderTemplate`<div class="flex items-center text-sm text-gray-900 dark:text-gray-200"> <svg class="h-5 w-5 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg> <span>Incluye día de armado previo al evento</span> </div>` : renderTemplate`<div class="flex items-center text-sm text-gray-500 dark:text-gray-400"> <svg class="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> <span>No requiere día de armado previo</span> </div>`} </div> </div> <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Total</label> <p class="mt-1 text-lg font-semibold text-primary-600 dark:text-primary-400">
$${(cotizacion.total || 0).toLocaleString("es-AR")} </p> </div> ${cotizacion.descripcion && renderTemplate`<div class="md:col-span-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-md"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label> <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">${cotizacion.descripcion}</p> </div>`} ${cotizacion.observaciones && renderTemplate`<div class="md:col-span-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-md"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones</label> <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">${cotizacion.observaciones}</p> </div>`} ${(cotizacion.condiciones || cotizacion.condiciones === "") && renderTemplate`<div class="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800"> <label class="block text-sm font-medium text-blue-700 dark:text-blue-300">Condiciones Comerciales</label> <p class="mt-1 text-sm text-gray-900 dark:text-gray-200 whitespace-pre-wrap"> ${cotizacion.condiciones || defaultCondiciones} </p> </div>`} </div> </div> </div> <!-- Items Section --> ${itemsToShow.length > 0 ? renderTemplate`<div class="bg-white dark:bg-gray-800 shadow rounded-lg"> <div class="px-4 py-5 sm:p-6"> <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Items de la Cotización</h3> <!-- Desktop table (hidden on small screens) --> <div class="hidden sm:block overflow-x-auto custom-scrollbar"> <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600"> <thead> <tr> <th class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
Descripción
</th> <th class="px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
Cantidad
</th> <th class="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
Precio Unit.
</th> <th class="px-3 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
Total
</th> </tr> </thead> <tbody class="divide-y divide-gray-200 dark:divide-gray-600"> ${itemsToShow.map((item) => {
    const { displayText } = QuoteHelper.formatItemForDisplay(item);
    const cantidad = item.cantidad || item.quantity || 1;
    const precioUnitario = item.precio_unitario || item.precio || item.price || 0;
    const total = item.total || cantidad * precioUnitario;
    return renderTemplate`<tr> <td class="px-3 py-4 text-sm text-gray-900 dark:text-white">${unescapeHTML(displayText)}</td> <td class="px-3 py-4 text-sm text-gray-900 dark:text-white text-center">${cantidad}</td> <td class="px-3 py-4 text-sm text-gray-900 dark:text-white text-right font-medium">$${precioUnitario.toLocaleString("es-AR")}</td> <td class="px-3 py-4 text-sm text-gray-900 dark:text-white text-right font-semibold">$${total.toLocaleString("es-AR")}</td> </tr>`;
  })} </tbody> <tfoot class="bg-gray-50 dark:bg-gray-700"> <tr> <td colspan="3" class="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">Subtotal:</td> <td class="px-3 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">$${(cotizacion.subtotal || 0).toLocaleString("es-AR")}</td> </tr> ${cotizacion.descuento > 0 && renderTemplate`<tr> <td colspan="3" class="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">Descuento (${cotizacion.descuento}%):</td> <td class="px-3 py-3 text-sm font-semibold text-red-600 dark:text-red-400 text-right">-$${((cotizacion.subtotal || 0) * (cotizacion.descuento / 100)).toLocaleString("es-AR")}</td> </tr>`} <tr class="border-t-2 border-gray-300 dark:border-gray-600"> <td colspan="3" class="px-3 py-3 text-base font-bold text-gray-900 dark:text-white text-right">Total:</td> <td class="px-3 py-3 text-base font-bold text-primary-600 dark:text-primary-400 text-right">$${(cotizacion.total || 0).toLocaleString("es-AR")}</td> </tr> </tfoot> </table> </div> <!-- Mobile card view (visible only on small screens) --> <div class="sm:hidden space-y-4"> ${itemsToShow.map((item) => {
    const { displayText } = QuoteHelper.formatItemForDisplay(item);
    const cantidad = item.cantidad || item.quantity || 1;
    const precioUnitario = item.precio_unitario || item.precio || item.price || 0;
    const total = item.total || cantidad * precioUnitario;
    return renderTemplate`<div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm"> <div class="text-sm text-gray-900 dark:text-white">${unescapeHTML(displayText)}</div> <div class="grid grid-cols-3 gap-2 mt-3"> <div> <span class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cantidad</span> <span class="text-sm font-medium text-gray-900 dark:text-white">${cantidad}</span> </div> <div> <span class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Precio Unit.</span> <span class="text-sm font-medium text-gray-900 dark:text-white">$${precioUnitario.toLocaleString("es-AR")}</span> </div> <div> <span class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</span> <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">$${total.toLocaleString("es-AR")}</span> </div> </div> </div>`;
  })} <!-- Mobile Totals --> <div class="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-md"> <div class="flex justify-between items-center mb-2"> <span class="text-sm font-medium text-gray-900 dark:text-white">Subtotal:</span> <span class="text-sm font-semibold text-gray-900 dark:text-white">$${(cotizacion.subtotal || 0).toLocaleString("es-AR")}</span> </div> ${cotizacion.descuento > 0 && renderTemplate`<div class="flex justify-between items-center mb-2"> <span class="text-sm font-medium text-gray-900 dark:text-white">Descuento (${cotizacion.descuento}%):</span> <span class="text-sm font-semibold text-red-600 dark:text-red-400">-$${((cotizacion.subtotal || 0) * (cotizacion.descuento / 100)).toLocaleString("es-AR")}</span> </div>`} <div class="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-600"> <span class="text-base font-bold text-gray-900 dark:text-white">Total:</span> <span class="text-base font-bold text-primary-600 dark:text-primary-400">$${(cotizacion.total || 0).toLocaleString("es-AR")}</span> </div> </div> </div> </div> </div>` : renderTemplate`<div class="bg-white dark:bg-gray-800 shadow rounded-lg"> <div class="px-4 py-5 sm:p-6"> <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Items de la Cotización</h3> <div class="text-center py-10"> <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center"> <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path> </svg> </div> <p class="text-center text-gray-500 dark:text-gray-400">No hay items en esta cotización</p> </div> </div> </div>`} </div>` : renderTemplate`<div class="text-center py-12"> <p class="text-gray-500 dark:text-gray-400">Cargando cotización...</p> </div>`}` }), defineScriptVars({ cotizacion, cliente, itemsToShow, COMPANY_INFO, defaultObservaciones, defaultCondiciones }), renderScript($$result, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/quotes/view/[id].astro?astro&type=script&index=0&lang.ts"));
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/quotes/view/[id].astro", void 0);

const $$file = "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/quotes/view/[id].astro";
const $$url = "/quotes/view/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
