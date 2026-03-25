import { AnalyticsService } from '../../chunks/AnalyticsService_rWPlso16.mjs';
import { c as checkRateLimit } from '../../chunks/rateLimit_BZOM_jHI.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url, request }) => {
  try {
    const limited = checkRateLimit(request, "READ", "analytics");
    if (limited) return limited;
    const type = url.searchParams.get("type") || "dashboard";
    let analytics;
    switch (type) {
      case "quotes":
        analytics = await AnalyticsService.getQuoteAnalytics();
        break;
      case "clients":
        analytics = await AnalyticsService.getClientAnalytics();
        break;
      case "items":
        analytics = await AnalyticsService.getItemAnalytics();
        break;
      case "dashboard":
      default:
        analytics = await AnalyticsService.getDashboardAnalytics();
        break;
    }
    return new Response(JSON.stringify(analytics), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("Error getting analytics:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error al obtener estadísticas"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
