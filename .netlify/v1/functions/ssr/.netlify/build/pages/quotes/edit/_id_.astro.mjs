/* empty css                                         */
import { c as createComponent, d as createAstro, i as renderComponent, r as renderTemplate, j as renderScript, m as maybeRenderHead, u as unescapeHTML, f as addAttribute, k as Fragment } from '../../../chunks/astro/server_B0jxGkjM.mjs';
import 'piccolore';
import { $ as $$Dashboard } from '../../../chunks/Dashboard_B-pf1Dyi.mjs';
import { a as cotizacionService, c as clienteService } from '../../../chunks/database_DkOv4JpX.mjs';
import { D as DateHelper } from '../../../chunks/dateHelpers_DuxKPoxD.mjs';
import { Q as QuoteHelper } from '../../../chunks/quoteHelpers_BMbd_S8Y.mjs';
import { $ as $$DescriptionNote } from '../../../chunks/DescriptionNote_D34TZpQ3.mjs';
import { $ as $$ScrollbarStyles } from '../../../chunks/ScrollbarStyles_BaxEijLZ.mjs';
import { D as DEFAULT_QUOTE_TEXTS } from '../../../chunks/company_BReyN6Nc.mjs';
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
  let clientes = [];
  let error = "";
  let allMasterItems = [];
  try {
    if (id) {
      const cotizaciones = await cotizacionService.getAll();
      cotizacion = cotizaciones.find((c) => c.id === id);
      if (!cotizacion) {
        error = "Cotizaci\xF3n no encontrada";
      } else {
        clientes = await clienteService.getAll();
        const cliente = clientes.find((c) => c.id === cotizacion.cliente_id);
        cotizacion.numeroMejorado = QuoteHelper.generateQuoteNumber(cotizacion, cliente);
        cotizacion.items = QuoteHelper.normalizeItems(cotizacion.items);
        if (cotizacion.fechaEvento && !cotizacion.fechaEventoFin) {
          const normalizedQuote = QuoteHelper.calculateEndDateIfMissing(cotizacion);
          cotizacion.fechaEventoFin = normalizedQuote.fechaEventoFin;
          console.log("\u{1F6E0}\uFE0F Fecha de fin calculada autom\xE1ticamente:", DateHelper.safeFormatDateForInput(normalizedQuote.fechaEventoFin));
        }
        console.log("\u{1F50D} Debug de fechas de la cotizaci\xF3n:", {
          fechaEvento: cotizacion.fechaEvento,
          fechaEventoFin: cotizacion.fechaEventoFin,
          fechaEvento_formatted: safeFormatDate(cotizacion.fechaEvento),
          fechaEventoFin_formatted: safeFormatDate(cotizacion.fechaEventoFin),
          tipoFechaEvento: typeof cotizacion.fechaEvento,
          tipoFechaEventoFin: typeof cotizacion.fechaEventoFin
        });
      }
    } else {
      error = "ID de cotizaci\xF3n no proporcionado";
    }
  } catch (err) {
    console.error("Error loading cotizacion:", err);
    error = `Error al cargar la cotizaci\xF3n: ${err}`;
  }
  try {
    const { itemService } = await import('../../../chunks/database_DkOv4JpX.mjs').then(n => n.d);
    allMasterItems = await itemService.getAll();
    console.log("\u{1F6CD}\uFE0F Master items cargados:", allMasterItems.length);
  } catch (itemErr) {
    console.error("\u274C Error loading master items:", itemErr);
    allMasterItems = [];
  }
  function safeFormatDate(dateValue) {
    if (!dateValue) return "";
    if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    if (typeof dateValue === "string") {
      try {
        if (dateValue.includes("T") || dateValue.includes("Z")) {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) {
            console.warn("Invalid date value:", dateValue);
            return "";
          }
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } else {
          const date = /* @__PURE__ */ new Date(dateValue + "T12:00:00");
          if (isNaN(date.getTime())) {
            console.warn("Invalid date value:", dateValue);
            return "";
          }
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        }
      } catch (error2) {
        console.warn("Error formatting date string:", dateValue, error2);
        return "";
      }
    }
    if (dateValue instanceof Date) {
      if (isNaN(dateValue.getTime())) {
        console.warn("Invalid Date object:", dateValue);
        return "";
      }
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, "0");
      const day = String(dateValue.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    if (dateValue && typeof dateValue === "object" && dateValue.toDate) {
      const date = dateValue.toDate();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    if (dateValue && typeof dateValue === "object" && typeof dateValue.seconds === "number") {
      const date = new Date(dateValue.seconds * 1e3);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    try {
      const date = /* @__PURE__ */ new Date(dateValue + "T12:00:00");
      if (isNaN(date.getTime())) {
        console.warn("Cannot convert to valid date:", dateValue);
        return "";
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error2) {
      console.warn("Error formatting date value:", dateValue, error2);
      return "";
    }
  }
  return renderTemplate`${renderComponent($$result, "Dashboard", $$Dashboard, { "title": "Editar Cotizaci\xF3n - BLS Cotizador", "activeSection": "quotes" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "ScrollbarStyles", $$ScrollbarStyles, {})} ${error ? renderTemplate`${maybeRenderHead()}<div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4"> <div class="flex"> <div class="flex-shrink-0"> <svg class="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path> </svg> </div> <div class="ml-3"> <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Error</h3> <div class="mt-2 text-sm text-red-700 dark:text-red-400"> <p>${error}</p> </div> </div> </div> </div>` : cotizacion ? renderTemplate(_a || (_a = __template(['<div class="max-w-7xl mx-auto space-y-6"> <!-- Header --> <div class="bg-white dark:bg-gray-800 shadow rounded-lg"> <div class="px-4 py-5 sm:px-6"> <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"> <div> <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Editar Cotizaci\xF3n</h1> <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 break-words"> ', ' </p> </div> <div class="flex justify-start sm:justify-end"> <a href="/quotes" class="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 touch-scroll-item"> <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path> </svg>\nVolver a Cotizaciones\n</a> </div> </div> </div> </div> <!-- Formulario Principal --> <form id="quote-form" class="space-y-6"> <input type="hidden" id="quote-id" name="quote-id"', '> <!-- Informaci\xF3n General --> <div class="bg-white dark:bg-gray-800 shadow rounded-lg"> <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6"> <h3 class="text-xl leading-6 font-medium text-gray-900 dark:text-white mb-4">Informaci\xF3n General</h3> <div class="grid grid-cols-1 sm:grid-cols-2 gap-5"> <!-- Cliente --> <div class="col-span-1 sm:col-span-2"> <label for="cliente_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">\nCliente *\n</label> <select id="cliente_id" name="cliente_id" required class="mt-1.5 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"> <option value="">Seleccionar cliente...</option> ', ' </select> </div> <!-- T\xEDtulo --> <div class="col-span-1 sm:col-span-2"> <label for="titulo" class="block text-sm font-medium text-gray-700 dark:text-gray-300">\nT\xEDtulo de la cotizaci\xF3n *\n</label> <input type="text" id="titulo" name="titulo" required', ' class="mt-1.5 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"> </div> <!-- Grid para fecha y duraci\xF3n --> <div class="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"> <!-- Fecha de Inicio --> <div> <label for="fecha_evento" class="block text-sm font-medium text-gray-700 dark:text-gray-300">\nFecha de inicio del evento\n</label> <input type="date" id="fecha_evento" name="fecha_evento"', ' class="mt-1.5 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"> </div> <!-- Fecha de Fin --> <div> <label for="fecha_evento_fin" class="block text-sm font-medium text-gray-700 dark:text-gray-300">\nFecha de fin del evento\n</label> <input type="date" id="fecha_evento_fin" name="fecha_evento_fin"', ' class="mt-1.5 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"> </div> <!-- Duraci\xF3n --> <div> <label for="duracion_dias" class="block text-sm font-medium text-gray-700 dark:text-gray-300">\nDuraci\xF3n (d\xEDas)\n</label> <div class="mt-1.5 relative"> <input type="number" id="duracion_dias" name="duracion_dias" min="1"', ' class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"> <p class="absolute text-xs text-gray-500 dark:text-gray-400 mt-1.5">\nSe calcula autom\xE1ticamente entre fechas\n</p> </div> </div> </div> <!-- Lugar del evento --> <div class="col-span-1 sm:col-span-2"> <label for="lugar_evento" class="block text-sm font-medium text-gray-700 dark:text-gray-300">\nLugar del evento\n</label> <input type="text" id="lugar_evento" name="lugar_evento"', ' placeholder="Ej: Hotel Hilton, Centro de Convenciones..." class="mt-1.5 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"> </div> <!-- Estado --> <div class="col-span-1 sm:col-span-2 md:col-span-1"> <label for="estado" class="block text-sm font-medium text-gray-700 dark:text-gray-300">\nEstado\n</label> <select id="estado" name="estado" class="mt-1.5 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2"> ', ' </select> </div> </div> </div> </div> <!-- Items de la Cotizaci\xF3n --> <div class="bg-white dark:bg-gray-800 shadow rounded-lg"> <div class="px-4 py-5 sm:p-6"> <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"> <h3 class="text-xl leading-6 font-medium text-gray-900 dark:text-white">Items de la Cotizaci\xF3n</h3> <button type="button" id="add-item-btn" class="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 dark:bg-primary-900 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 w-full sm:w-auto justify-center touch-scroll-item"> <svg class="-ml-0.5 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15"></path> </svg>\nAgregar Item\n</button> </div> ', ' <div id="items-container" class="space-y-0 custom-scrollbar"> <!-- Table Header (with responsive design) --> <div class="hidden md:grid grid-cols-12 gap-4 py-3 px-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 rounded-t-md font-medium text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300"> <div class="col-span-7">Descripci\xF3n</div> <div class="col-span-1 text-center">Cantidad</div> <div class="col-span-1 text-right">Precio</div> <div class="col-span-1 text-right">Total</div> <div class="col-span-2 text-center">Acci\xF3n</div> </div> <!-- Mobile header - only visible on small screens --> <div class="md:hidden flex justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 rounded-t-md font-medium text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300"> <div>Items</div> <div>Detalles</div> </div> <!-- Los items se cargar\xE1n din\xE1micamente aqu\xED --> </div> <!-- Totales --> <div class="mt-6 sm:mt-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 sm:p-6 border dark:border-gray-600 shadow-sm"> <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen de Totales</h4> <div class="space-y-4"> <div class="flex justify-between items-center py-2"> <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal:</span> <span id="subtotal-display" class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">$0</span> </div> <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-t border-gray-200 dark:border-gray-600 space-y-2 sm:space-y-0"> <div class="flex items-center space-x-2 sm:space-x-3"> <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Descuento:</span> <div class="flex items-center space-x-2"> <input type="number" id="descuento" name="descuento" min="0" max="100" step="0.1"', ' class="w-20 sm:w-24 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:border-primary-500 focus:ring-primary-500 text-center touch-scroll-item"> <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">%</span> </div> </div> <span id="descuento-display" class="text-base sm:text-lg text-red-600 dark:text-red-400 font-semibold">-$0</span> </div> <div class="flex justify-between items-center py-3 sm:py-4 border-t-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md px-4 sm:px-5 shadow-sm"> <span class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Total:</span> <span id="total-display" class="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">$0</span> </div> </div> </div> </div> </div> <!-- Observaciones --> <div class="bg-white dark:bg-gray-800 shadow rounded-lg"> <div class="px-4 py-5 sm:p-6"> <h3 class="text-xl leading-6 font-medium text-gray-900 dark:text-white mb-4">Observaciones</h3> <textarea id="observaciones" name="observaciones" rows="5"', ' placeholder="T\xE9rminos y condiciones, notas especiales, etc..." class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm px-4 py-3"></textarea> </div> </div> <!-- Condiciones Comerciales --> <div class="bg-white dark:bg-gray-800 shadow rounded-lg"> <div class="px-4 py-5 sm:p-6"> <h3 class="text-xl leading-6 font-medium text-gray-900 dark:text-white mb-4">Condiciones Comerciales</h3> <textarea id="condiciones" name="condiciones" rows="15"', ` placeholder="Edita las condiciones comerciales que aparecer\xE1n en el PDF..." class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm px-4 py-3"></textarea> <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
Estas condiciones aparecer\xE1n autom\xE1ticamente en el PDF de la cotizaci\xF3n. Puedes personalizarlas seg\xFAn el cliente o tipo de evento.
</p> </div> </div> <!-- Botones de Acci\xF3n --> <div class="bg-white dark:bg-gray-800 shadow rounded-lg"> <div class="px-4 py-4 sm:py-5 bg-gray-50 dark:bg-gray-700 sm:px-6 rounded-b-lg flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:space-x-3"> <button type="button" onclick="window.location.href='/quotes'" class="w-full sm:w-auto bg-white dark:bg-gray-700 py-2.5 px-5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 touch-scroll-item">
Cancelar
</button> <button type="submit" id="submit-btn" class="w-full sm:w-auto px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 touch-scroll-item">
Actualizar Cotizaci\xF3n
</button> </div> </div> </form> <!-- Hidden inputs para totales --> <input type="hidden" id="subtotal" name="subtotal"`, '> <input type="hidden" id="total" name="total"', '> <!-- Hidden data para JavaScript --> <script type="application/json" id="items-data">', '<\/script> <!-- Hidden data for ALL MASTER JavaScript Items/Services --> <script type="application/json" id="all-master-items-data">', "<\/script> </div>"])), cotizacion.numeroMejorado || cotizacion.numero || `COT-${new Date(cotizacion.created_at).getFullYear()}-${String(cotizacion.id).padStart(3, "0")}`, addAttribute(cotizacion.id, "value"), clientes.map((cliente) => {
    const isSelected = cliente.id === cotizacion.cliente_id || cliente.id === cotizacion.clienteId;
    return renderTemplate`<option${addAttribute(cliente.id, "value")}${addAttribute(isSelected, "selected")}> ${cliente.nombre}${cliente.empresa ? ` - ${cliente.empresa}` : ""} </option>`;
  }), addAttribute(cotizacion.titulo || "", "value"), addAttribute(safeFormatDate(cotizacion.fechaEvento), "value"), addAttribute(safeFormatDate(cotizacion.fechaEventoFin), "value"), addAttribute(cotizacion.duracion_dias || 1, "value"), addAttribute(cotizacion.lugar_evento || "", "value"), (() => {
    const s = String(cotizacion.estado || "borrador").toLowerCase();
    return renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <option value="borrador"${addAttribute(s.includes("borrador"), "selected")}>Borrador</option> <option value="enviado"${addAttribute(s.includes("enviad"), "selected")}>Enviado</option> <option value="aprobado"${addAttribute(s.includes("aprob"), "selected")}>Aprobado</option> <option value="rechazado"${addAttribute(s.includes("recha"), "selected")}>Rechazado</option> ` })}`;
  })(), renderComponent($$result2, "DescriptionNote", $$DescriptionNote, {}), addAttribute(cotizacion.descuento || 0, "value"), addAttribute(cotizacion.observaciones || defaultObservaciones, "value"), addAttribute(cotizacion.condiciones || defaultCondiciones, "value"), addAttribute(cotizacion.subtotal || 0, "value"), addAttribute(cotizacion.total || 0, "value"), unescapeHTML(
    JSON.stringify(
      Array.isArray(cotizacion.items) ? cotizacion.items : cotizacion.items && typeof cotizacion.items === "object" ? Object.values(cotizacion.items) : []
    )
  ), unescapeHTML(JSON.stringify(allMasterItems))) : renderTemplate`<div class="text-center py-12"> <p class="text-gray-500 dark:text-gray-400">Cargando cotización...</p> </div>`} <div id="item-modal" class="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-black dark:bg-opacity-80 hidden overflow-y-auto h-full w-full z-50"> <div class="relative top-0 sm:top-8 mx-auto p-4 border dark:border-gray-700 w-full sm:w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-screen sm:max-h-[90vh] overflow-hidden flex flex-col h-full sm:h-auto"> <div class="mt-2 flex-1 flex flex-col min-h-0"> <div class="flex items-center justify-between mb-4"> <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Seleccionar Item/Servicio</h3> <button type="button" id="close-modal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 touch-scroll-item"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> <!-- Búsqueda --> <div class="mb-4"> <div class="relative"> <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"> <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> </div> <input type="text" id="search-items" placeholder="Buscar item o servicio..." class="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"> </div> </div> <!-- Lista de Items --> <div id="items-list" class="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md dark:bg-gray-700 min-h-0 custom-scrollbar"> <!-- Los items se cargarán dinámicamente aquí --> </div> <div class="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"> <button type="button" id="cancel-modal" class="w-full sm:w-auto px-5 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-medium text-sm touch-scroll-item flex items-center justify-center"> <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg>
Cancelar
</button> <button type="button" id="add-empty-item" class="w-full sm:w-auto px-5 py-3 bg-primary-600 dark:bg-primary-700 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 font-medium text-sm touch-scroll-item flex items-center justify-center"> <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path> </svg>
Agregar Item Vacío
</button> </div> </div> </div> </div> ${renderScript($$result2, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/quotes/edit/[id].astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/quotes/edit/[id].astro", void 0);

const $$file = "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/quotes/edit/[id].astro";
const $$url = "/quotes/edit/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
