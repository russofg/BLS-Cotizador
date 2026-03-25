import { c as createComponent, d as createAstro, m as maybeRenderHead, f as addAttribute, o as renderSlot, r as renderTemplate } from './astro/server_B0jxGkjM.mjs';
import 'piccolore';
import 'clsx';

const $$Astro = createAstro();
const $$PageHeader = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PageHeader;
  const { title, subtitle, class: className = "" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`sm:flex sm:items-center sm:justify-between mb-8 ${className}`, "class")}> <div class="min-w-0 flex-1"> <h1 class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight"> ${title} </h1> ${subtitle && renderTemplate`<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">${subtitle}</p>`} </div> <div class="mt-4 flex md:ml-4 md:mt-0 space-x-3"> ${renderSlot($$result, $$slots["actions"])} </div> </div>`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/components/ui/PageHeader.astro", void 0);

export { $$PageHeader as $ };
