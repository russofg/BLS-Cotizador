/* empty css                                   */
import { c as createComponent, i as renderComponent, j as renderScript, r as renderTemplate, m as maybeRenderHead, f as addAttribute } from '../chunks/astro/server_B0jxGkjM.mjs';
import 'piccolore';
import { $ as $$Dashboard } from '../chunks/Dashboard_BaYgvqpS.mjs';
import { a as cotizacionService, c as clienteService } from '../chunks/database_DkOv4JpX.mjs';
import { D as DateHelper } from '../chunks/dateHelpers_DuxKPoxD.mjs';
import { Q as QuoteHelper } from '../chunks/quoteHelpers_BMbd_S8Y.mjs';
import { $ as $$PageHeader } from '../chunks/PageHeader_DzmpkV0U.mjs';
import { $ as $$Card } from '../chunks/Card_DppfKCyF.mjs';
import { $ as $$StatCard } from '../chunks/StatCard_CZJEbzwA.mjs';
import { $ as $$Button } from '../chunks/Button_Qb3BKv6-.mjs';
import { $ as $$Badge } from '../chunks/Badge_CwFCCCK3.mjs';
import { $ as $$ScrollbarStyles } from '../chunks/ScrollbarStyles_BaxEijLZ.mjs';
import { Q as QuoteTrackingService } from '../chunks/QuoteTrackingService_CCG5jZ1B.mjs';
export { renderers } from '../renderers.mjs';

const $$Quotes = createComponent(async ($$result, $$props, $$slots) => {
  const safeFormatDate = DateHelper.safeFormatDate;
  let cotizaciones = [];
  let clientes = [];
  let trackingStats = null;
  let error = "";
  try {
    cotizaciones = await cotizacionService.getAll();
    clientes = await clienteService.getAll();
    try {
      trackingStats = await QuoteTrackingService.getTrackingStats();
    } catch (trackingError) {
      console.warn("Error loading tracking stats:", trackingError);
    }
    cotizaciones = cotizaciones.map((cotizacion) => {
      const normalizedQuote = QuoteHelper.normalizeQuoteData(cotizacion);
      const enrichedQuote = QuoteHelper.enrichQuoteWithClient(
        normalizedQuote,
        clientes
      );
      const fechaParaMostrar = normalizedQuote.fechaEvento || normalizedQuote.fecha_evento || normalizedQuote.created_at || normalizedQuote.createdAt;
      const esEventoDate = !!(normalizedQuote.fechaEvento || normalizedQuote.fecha_evento);
      return {
        ...enrichedQuote,
        numero_display: QuoteHelper.generateQuoteNumber(
          normalizedQuote,
          clientes.find(
            (c) => c.id === normalizedQuote.cliente_id || c.id === normalizedQuote.clienteId
          )
        ),
        fecha_display: safeFormatDate(fechaParaMostrar),
        fecha_tipo: esEventoDate ? "evento" : "creacion"
      };
    });
    console.log("Cotizaciones cargadas:", cotizaciones.length);
  } catch (e) {
    error = "Error al cargar las cotizaciones";
    console.error("Error loading quotes:", e);
  }
  return renderTemplate`${renderComponent($$result, "Dashboard", $$Dashboard, { "title": "Cotizaciones" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "ScrollbarStyles", $$ScrollbarStyles, {})} ${maybeRenderHead()}<div class="space-y-6 pb-6"> <!-- Header --> ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": "Cotizaciones", "subtitle": "Gestiona todas las cotizaciones de tu negocio" }, { "actions": async ($$result3) => renderTemplate`<div class="flex space-x-3"> ${renderComponent($$result3, "Button", $$Button, { "href": "/quotes/wizard", "variant": "primary", "size": "md" }, { "default": async ($$result4) => renderTemplate` <span class="flex items-center"> <span class="mr-1">➕</span> Nueva Cotización
</span> ` })} </div>` })} ${error && renderTemplate`<div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded"> ${error} </div>`} <!-- Estadísticas de Seguimiento --> ${trackingStats && renderTemplate`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> ${renderComponent($$result2, "StatCard", $$StatCard, { "title": "Total Cotizaciones", "value": trackingStats.totalCotizaciones.toString(), "icon": "collection", "color": "blue" })} ${renderComponent($$result2, "StatCard", $$StatCard, { "title": "Tasa de Conversi\xF3n", "value": `${trackingStats.conversionRate.toFixed(1)}%`, "icon": "trending-up", "color": "green" })} ${renderComponent($$result2, "StatCard", $$StatCard, { "title": "Cotizaciones Vencidas", "value": trackingStats.cotizacionesVencidas.toString(), "icon": "exclamation-circle", "color": "red" })} ${renderComponent($$result2, "StatCard", $$StatCard, { "title": "Promedio Aprobaci\xF3n", "value": `${trackingStats.tiempoPromedioAprobacion.toFixed(0)} d\xEDas`, "icon": "clock", "color": "purple" })} </div>`} <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"> <!-- Distribución por Estado --> ${trackingStats && trackingStats.porEstado.length > 0 && renderTemplate`${renderComponent($$result2, "Card", $$Card, { "title": "Distribuci\xF3n por Estado", "class": "shadow-premium h-full" }, { "default": async ($$result3) => renderTemplate` <div class="space-y-4"> ${trackingStats.porEstado.map((estado) => renderTemplate`<div class="group"> <div class="flex items-center justify-between mb-2"> <div class="flex items-center space-x-3"> <div${addAttribute(`w-2 h-2 rounded-full ${estado.estado === "aprobada" ? "bg-green-500" : estado.estado === "enviada" ? "bg-blue-500" : estado.estado === "revisada" ? "bg-orange-500" : estado.estado === "rechazada" ? "bg-red-500" : "bg-gray-400"}`, "class")}></div> <span class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest"> ${QuoteTrackingService.getStatusDisplayName(estado.estado)} </span> </div> <span class="text-xs font-heading font-extrabold text-gray-900 dark:text-white"> ${estado.count} </span> </div> <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden"> <div${addAttribute(`h-full rounded-full transition-all duration-1000 ${estado.estado === "aprobada" ? "bg-green-500" : estado.estado === "enviada" ? "bg-blue-500" : estado.estado === "revisada" ? "bg-orange-500" : estado.estado === "rechazada" ? "bg-red-500" : "bg-gray-400"}`, "class")}${addAttribute(`width: ${estado.porcentaje}%`, "style")}></div> </div> </div>`)} </div> ` })}`} <!-- Próximos Vencimientos --> ${trackingStats && trackingStats.proximosVencimientos.length > 0 && renderTemplate`${renderComponent($$result2, "Card", $$Card, { "title": "Pr\xF3ximos Vencimientos", "class": "lg:col-span-2 shadow-premium h-full" }, { "default": async ($$result3) => renderTemplate` <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> ${trackingStats.proximosVencimientos.slice(0, 4).map((cotizacion) => renderTemplate`<div class="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-300"> <div class="flex-1 truncate mr-4"> <div class="font-heading font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors truncate"> ${cotizacion.numero} </div> <div class="text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-widest mt-1 truncate"> ${cotizacion.clienteNombre} • $${cotizacion.total.toLocaleString()} </div> </div> <div class="flex flex-col items-end"> <span class="text-lg font-heading font-extrabold text-orange-600 dark:text-orange-400"> ${cotizacion.diasVencimiento} </span> <span class="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Días</span> </div> </div>`)} </div> ` })}`} </div> <!-- Lista de Cotizaciones --> <div class="space-y-4"> ${cotizaciones.length === 0 ? renderTemplate`${renderComponent($$result2, "Card", $$Card, { "class": "shadow-premium py-20 px-6 text-center" }, { "default": async ($$result3) => renderTemplate` <div class="w-20 h-20 mx-auto mb-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl flex items-center justify-center border border-gray-100 dark:border-gray-800"> <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> </div> <h3 class="text-2xl font-heading font-extrabold text-gray-900 dark:text-white mb-2">
No hay cotizaciones aún
</h3> <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
Comienza creando tu primera cotización profesional para impresionar a tus clientes.
</p> ${renderComponent($$result3, "Button", $$Button, { "href": "/quotes/wizard", "variant": "primary", "size": "lg", "class": "shadow-premium" }, { "default": async ($$result4) => renderTemplate`
Crear Primera Cotización
` })} ` })}` : renderTemplate`<div class="grid grid-cols-1 gap-4"> ${cotizaciones.map((cotizacion) => renderTemplate`${renderComponent($$result2, "Card", $$Card, { "padding": "none", "class": "group hover:shadow-premium hover:-translate-y-1 transition-all duration-300 overflow-hidden border-transparent hover:border-primary-100 dark:hover:border-primary-900/30" }, { "default": async ($$result3) => renderTemplate` <div class="flex flex-col lg:flex-row">  <div${addAttribute(`w-full lg:w-1.5 h-1.5 lg:h-auto ${(() => {
    const statusInfo = QuoteHelper.getQuoteStatusInfo(cotizacion.estado);
    return statusInfo.color === "success" ? "bg-green-500" : statusInfo.color === "info" ? "bg-blue-500" : statusInfo.color === "danger" ? "bg-red-500" : "bg-orange-500";
  })()}`, "class")}></div> <div class="flex-1 p-5 sm:p-6"> <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6"> <div class="flex-1 min-w-0"> <div class="flex items-center gap-3 mb-2"> <span class="text-[10px] font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded border border-primary-100 dark:border-primary-800"> ${cotizacion.numero_display} </span> ${(() => {
    const statusInfo = QuoteHelper.getQuoteStatusInfo(cotizacion.estado);
    return renderTemplate`${renderComponent($$result3, "Badge", $$Badge, { "variant": statusInfo.color, "size": "sm" }, { "default": async ($$result4) => renderTemplate`${statusInfo.label}` })}`;
  })()} </div> <h3 class="text-xl font-heading font-extrabold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors truncate"> ${cotizacion.titulo || "Sin t\xEDtulo"} </h3> <div class="flex flex-wrap items-center gap-x-6 gap-y-2"> <div class="flex items-center text-sm text-gray-500 dark:text-gray-400"> <span class="mr-2 text-gray-400">👤</span> <span class="font-bold text-gray-700 dark:text-gray-300">${cotizacion.cliente_nombre}</span> </div> <div class="flex items-center text-sm text-gray-500 dark:text-gray-400"> <span class="mr-2 text-gray-400">📅</span> <span>${cotizacion.fecha_display}</span> ${cotizacion.fecha_tipo === "evento" && renderTemplate`<span class="ml-1.5 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">Evento</span>`} </div> </div> ${cotizacion.descripcion && renderTemplate`<p class="mt-4 text-sm text-gray-400 dark:text-gray-500 line-clamp-1 italic"> ${cotizacion.descripcion} </p>`} </div> <div class="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-4 py-4 lg:py-0 border-t sm:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 lg:pl-8"> <div class="text-left sm:text-left lg:text-right"> <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Inversión Total</p> <p class="text-3xl font-heading font-extrabold text-gray-900 dark:text-white"> <span class="text-primary-600 dark:text-primary-400 text-xl font-medium mr-0.5">$</span> ${Number(cotizacion.total || 0).toLocaleString("es-AR")} </p> </div> <div class="flex items-center gap-2"> ${renderComponent($$result3, "Button", $$Button, { "href": `/quotes/view/${cotizacion.id}`, "variant": "secondary", "size": "sm", "class": "px-3", "title": "Ver Detalle" }, { "default": async ($$result4) => renderTemplate` <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path> </svg> ` })} ${renderComponent($$result3, "Button", $$Button, { "href": `/quotes/edit/${cotizacion.id}`, "variant": "secondary", "size": "sm", "class": "px-3", "title": "Editar" }, { "default": async ($$result4) => renderTemplate` <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path> </svg> ` })} ${renderComponent($$result3, "Button", $$Button, { "href": `/quotes/tracking/${cotizacion.id}`, "variant": "secondary", "size": "sm", "class": "px-3", "title": "Seguimiento" }, { "default": async ($$result4) => renderTemplate` <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path> </svg> ` })} <button${addAttribute(`deleteQuote('${cotizacion.id}', '${cotizacion.titulo || cotizacion.numero_display}')`, "onclick")} class="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Eliminar"> <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path> </svg> </button> </div> </div> </div> </div> </div> ` })}`)} </div>`} </div> </div> ` })} ${renderScript($$result, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/quotes.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/quotes.astro", void 0);

const $$file = "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/quotes.astro";
const $$url = "/quotes";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Quotes,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
