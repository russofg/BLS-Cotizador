import { c as createComponent, d as createAstro, m as maybeRenderHead, f as addAttribute, r as renderTemplate } from './astro/server_B0jxGkjM.mjs';
import 'piccolore';
import 'clsx';

const $$Astro = createAstro();
const $$Textarea = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Textarea;
  const {
    name,
    id,
    placeholder,
    value,
    required = false,
    disabled = false,
    readonly = false,
    rows = 3,
    class: className = "",
    label,
    helperText,
    error
  } = Astro2.props;
  const baseClasses = "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white";
  const errorClasses = error ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500" : "";
  const disabledClasses = disabled ? "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" : "";
  const textareaClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;
  return renderTemplate`${maybeRenderHead()}<div class="w-full"> ${label && renderTemplate`<label${addAttribute(id, "for")} class="block text-sm font-medium text-gray-700 dark:text-gray-300"> ${label} ${required && renderTemplate`<span class="text-red-500 dark:text-red-400 ml-1">*</span>`} </label>`} <textarea${addAttribute(name, "name")}${addAttribute(id, "id")}${addAttribute(placeholder, "placeholder")}${addAttribute(required, "required")}${addAttribute(disabled, "disabled")}${addAttribute(readonly, "readonly")}${addAttribute(rows, "rows")}${addAttribute(textareaClasses, "class")}>${value}</textarea> ${helperText && !error && renderTemplate`<p class="mt-1 text-sm text-gray-500">${helperText}</p>`} ${error && renderTemplate`<p class="mt-1 text-sm text-red-600">${error}</p>`} </div>`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/components/ui/Textarea.astro", void 0);

export { $$Textarea as $ };
