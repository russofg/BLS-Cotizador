import { c as createComponent, d as createAstro, m as maybeRenderHead, f as addAttribute, o as renderSlot, r as renderTemplate } from './astro/server_B0jxGkjM.mjs';
import 'piccolore';
import 'clsx';

const $$Astro = createAstro();
const $$Card = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Card;
  const {
    title,
    subtitle,
    padding = "md",
    shadow = "md",
    hover = false,
    class: className = ""
  } = Astro2.props;
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8"
  };
  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-premium",
    lg: "shadow-premium-hover"
  };
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 ${shadowClasses[shadow]} ${paddingClasses[padding]} ${hover ? "hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300" : "transition-all duration-300"} ${className}`, "class")}> ${(title || subtitle) && renderTemplate`<div class="mb-5"> ${title && renderTemplate`<h3 class="text-xl font-heading font-bold text-gray-900 dark:text-white tracking-tight"> ${title} </h3>`} ${subtitle && renderTemplate`<p class="mt-1.5 text-sm font-medium text-gray-500 dark:text-gray-400"> ${subtitle} </p>`} </div>`} ${renderSlot($$result, $$slots["default"])} </div>`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/components/ui/Card.astro", void 0);

export { $$Card as $ };
