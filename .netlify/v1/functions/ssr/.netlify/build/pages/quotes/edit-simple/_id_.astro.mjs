/* empty css                                         */
import { c as createComponent, d as createAstro, i as renderComponent, r as renderTemplate, j as renderScript, m as maybeRenderHead, u as unescapeHTML, f as addAttribute, k as Fragment } from '../../../chunks/astro/server_B0jxGkjM.mjs';
import 'piccolore';
import { $ as $$Dashboard } from '../../../chunks/Dashboard_B-pf1Dyi.mjs';
import { a as cotizacionService, c as clienteService } from '../../../chunks/database_DkOv4JpX.mjs';
import { $ as $$DescriptionNote } from '../../../chunks/DescriptionNote_D34TZpQ3.mjs';
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
  const { id } = Astro2.params;
  const defaultObservaciones = DEFAULT_QUOTE_TEXTS.observaciones;
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
        if (!cotizacion.numero || cotizacion.numero.includes("mvG2cFN4sBXIfjxxnYAL")) {
          try {
            const fechaCreacion = cotizacion.created_at ? new Date(cotizacion.created_at) : new Date(cotizacion.createdAt);
            const fechaFormateada = fechaCreacion.toISOString().slice(0, 10).replace(/-/g, "");
            const cliente = clientes.find((c) => c.id === cotizacion.cliente_id);
            const clienteNombre = (cliente?.nombre || "CLIENTE").replace(/\s+/g, "").substring(0, 10).toUpperCase();
            const eventoNombre = (cotizacion.titulo || "EVENTO").replace(/\s+/g, "").substring(0, 10).toUpperCase();
            const numeroSecuencial = "001";
            cotizacion.numeroMejorado = `COT-${numeroSecuencial}-${fechaFormateada}-${clienteNombre}-${eventoNombre}`;
          } catch (numberError) {
            console.error("Error generating quote number:", numberError);
            cotizacion.numeroMejorado = `COT-001-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "")}-CLIENTE-EVENTO`;
          }
        } else {
          cotizacion.numeroMejorado = cotizacion.numero;
        }
        if (cotizacion.items && typeof cotizacion.items === "object" && !Array.isArray(cotizacion.items)) {
          cotizacion.items = Object.values(cotizacion.items);
        } else if (!Array.isArray(cotizacion.items)) {
          cotizacion.items = [];
        }
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
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          console.warn("Invalid date value:", dateValue);
          return "";
        }
        return date.toISOString().split("T")[0];
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
      return dateValue.toISOString().split("T")[0];
    }
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        console.warn("Cannot convert to valid date:", dateValue);
        return "";
      }
      return date.toISOString().split("T")[0];
    } catch (error2) {
      console.warn("Error formatting date value:", dateValue, error2);
      return "";
    }
  }
  return renderTemplate`${renderComponent($$result, "Dashboard", $$Dashboard, { "title": "Editar Cotizaci\xF3n - BLS Cotizador", "activeSection": "quotes" }, { "default": async ($$result2) => renderTemplate`${error ? renderTemplate`${maybeRenderHead()}<div class="bg-red-50 border border-red-200 rounded-md p-4"> <div class="flex"> <div class="flex-shrink-0"> <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path> </svg> </div> <div class="ml-3"> <h3 class="text-sm font-medium text-red-800">Error</h3> <div class="mt-2 text-sm text-red-700"> <p>${error}</p> </div> </div> </div> </div>` : cotizacion ? renderTemplate(_a || (_a = __template(['<div class="max-w-4xl mx-auto space-y-6"> <!-- Header --> <div class="bg-white shadow rounded-lg"> <div class="px-4 py-5 sm:px-6"> <div class="flex items-center justify-between"> <div> <h1 class="text-2xl font-bold text-gray-900">Editar Cotizaci\xF3n</h1> <p class="mt-1 text-sm text-gray-500"> ', ' </p> </div> <div> <a href="/quotes" class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"> <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"></svg>\nVolver a Cotizaciones\n</a> </div> </div> </div> </div> <!-- Formulario Principal --> <form id="quote-form" class="space-y-6"> <input type="hidden" id="quote-id" name="quote-id"', '> <!-- Informaci\xF3n General --> <div class="bg-white shadow rounded-lg"> <div class="px-4 py-5 sm:p-6"> <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Informaci\xF3n General</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <!-- Cliente --> <div> <label for="cliente_id" class="block text-sm font-medium text-gray-700">\nCliente *\n</label> <select id="cliente_id" name="cliente_id" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"> <option value="">Seleccionar cliente...</option> ', ' </select> </div> <!-- T\xEDtulo --> <div> <label for="titulo" class="block text-sm font-medium text-gray-700">\nT\xEDtulo de la cotizaci\xF3n *\n</label> <input type="text" id="titulo" name="titulo" required', ' class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"> </div> <!-- Fecha de Inicio --> <div> <label for="fecha_evento" class="block text-sm font-medium text-gray-700">\nFecha de inicio del evento\n</label> <input type="date" id="fecha_evento" name="fecha_evento"', ' class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"> </div> <!-- Fecha de Fin --> <div> <label for="fecha_evento_fin" class="block text-sm font-medium text-gray-700">\nFecha de fin del evento\n</label> <input type="date" id="fecha_evento_fin" name="fecha_evento_fin"', ' class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"> </div> <!-- Duraci\xF3n --> <div> <label for="duracion_dias" class="block text-sm font-medium text-gray-700">\nDuraci\xF3n (d\xEDas)\n</label> <input type="number" id="duracion_dias" name="duracion_dias" min="1"', ' class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"> </div> <!-- Estado --> <div> <label for="estado" class="block text-sm font-medium text-gray-700">\nEstado\n</label> <select id="estado" name="estado" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"> ', ' </select> </div> </div> </div> </div> <!-- Items de la Cotizaci\xF3n --> <div class="bg-white shadow rounded-lg"> <div class="px-4 py-5 sm:p-6"> <div class="flex justify-between items-center mb-4"> <h3 class="text-lg leading-6 font-medium text-gray-900">Items de la Cotizaci\xF3n</h3> <button type="button" id="add-item-btn" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"> <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15"></path> </svg>\nAgregar Item\n</button> </div> ', ' <div id="items-container" class="space-y-4"> <!-- Los items se cargar\xE1n din\xE1micamente aqu\xED --> </div> <!-- Totales --> <div class="mt-6 bg-gray-50 rounded-lg p-4"> <div class="space-y-2"> <div class="flex justify-between items-center"> <span class="text-sm font-medium text-gray-700">Subtotal:</span> <span id="subtotal-display" class="text-sm font-medium text-gray-900">$0</span> </div> <div class="flex justify-between items-center"> <div class="flex items-center space-x-2"> <span class="text-sm font-medium text-gray-700">Descuento:</span> <input type="number" id="descuento" name="descuento" min="0" max="100" step="0.1"', ' class="w-16 px-2 py-1 text-xs border border-gray-300 rounded-md"> <span class="text-sm text-gray-500">%</span> </div> <span id="descuento-display" class="text-sm text-red-600">-$0</span> </div> <div class="flex justify-between items-center text-lg font-semibold pt-2 border-t border-gray-200"> <span class="text-gray-900">Total:</span> <span id="total-display" class="text-primary-600">$0</span> </div> </div> </div> </div> </div> <!-- Observaciones --> <div class="bg-white shadow rounded-lg"> <div class="px-4 py-5 sm:p-6"> <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Observaciones</h3> <textarea id="observaciones" name="observaciones" rows="4"', ` placeholder="T\xE9rminos y condiciones, notas especiales, etc..." class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"></textarea> </div> </div> <!-- Botones de Acci\xF3n --> <div class="bg-white shadow rounded-lg"> <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg"> <button type="button" onclick="window.location.href='/quotes'" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">
Cancelar
</button> <button type="submit" id="submit-btn" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
Actualizar Cotizaci\xF3n
</button> </div> </div> </form> <!-- Hidden inputs para totales --> <input type="hidden" id="subtotal" name="subtotal"`, '> <input type="hidden" id="total" name="total"', '> <!-- Hidden data para JavaScript --> <script type="application/json" id="items-data">', '<\/script> <!-- Hidden data for ALL MASTER JavaScript Items/Services --> <script type="application/json" id="all-master-items-data">', "<\/script> </div>"])), cotizacion.numeroMejorado || cotizacion.numero || `COT-${new Date(cotizacion.created_at).getFullYear()}-${String(cotizacion.id).padStart(3, "0")}`, addAttribute(cotizacion.id, "value"), clientes.map((cliente) => {
    const isSelected = cliente.id === cotizacion.cliente_id || cliente.id === cotizacion.clienteId;
    return renderTemplate`<option${addAttribute(cliente.id, "value")}${addAttribute(isSelected, "selected")}> ${cliente.nombre}${cliente.empresa ? ` - ${cliente.empresa}` : ""} </option>`;
  }), addAttribute(cotizacion.titulo || "", "value"), addAttribute(safeFormatDate(cotizacion.fecha_evento || cotizacion.fechaEvento), "value"), addAttribute(safeFormatDate(cotizacion.fecha_evento_fin || cotizacion.fechaEventoFin || cotizacion.fecha_evento || cotizacion.fechaEvento), "value"), addAttribute(cotizacion.duracion_dias || 1, "value"), (() => {
    const s = String(cotizacion.estado || "borrador").toLowerCase();
    return renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <option value="borrador"${addAttribute(s.includes("borrador"), "selected")}>Borrador</option> <option value="enviado"${addAttribute(s.includes("enviad"), "selected")}>Enviado</option> <option value="aprobado"${addAttribute(s.includes("aprob"), "selected")}>Aprobado</option> <option value="rechazado"${addAttribute(s.includes("recha"), "selected")}>Rechazado</option> ` })}`;
  })(), renderComponent($$result2, "DescriptionNote", $$DescriptionNote, {}), addAttribute(cotizacion.descuento || 0, "value"), addAttribute(cotizacion.observaciones || defaultObservaciones, "value"), addAttribute(cotizacion.subtotal || 0, "value"), addAttribute(cotizacion.total || 0, "value"), unescapeHTML(
    JSON.stringify(
      Array.isArray(cotizacion.items) ? cotizacion.items : cotizacion.items && typeof cotizacion.items === "object" ? Object.values(cotizacion.items) : []
    )
  ), unescapeHTML(JSON.stringify(allMasterItems))) : renderTemplate`<div class="text-center py-12"> <p class="text-gray-500">Cargando cotización...</p> </div>`}${renderScript($$result2, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/quotes/edit-simple/[id].astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/quotes/edit-simple/[id].astro", void 0);

const $$file = "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/quotes/edit-simple/[id].astro";
const $$url = "/quotes/edit-simple/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
