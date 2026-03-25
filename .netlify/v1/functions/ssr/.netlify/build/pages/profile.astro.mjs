/* empty css                                   */
import { c as createComponent, d as createAstro, m as maybeRenderHead, f as addAttribute, j as renderScript, r as renderTemplate, i as renderComponent } from '../chunks/astro/server_B0jxGkjM.mjs';
import 'piccolore';
import { $ as $$Dashboard } from '../chunks/Dashboard_BaYgvqpS.mjs';
import { $ as $$PageHeader } from '../chunks/PageHeader_DzmpkV0U.mjs';
import { $ as $$Card } from '../chunks/Card_DppfKCyF.mjs';
import { $ as $$Button } from '../chunks/Button_Qb3BKv6-.mjs';
import { $ as $$Input } from '../chunks/Input_Dg7Aa5ZU.mjs';
import 'clsx';
import { $ as $$ScrollbarStyles } from '../chunks/ScrollbarStyles_BaxEijLZ.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro$2 = createAstro();
const $$ThemeModeSelector = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$ThemeModeSelector;
  const { currentMode, onChange, id } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="space-y-3"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
Modo de Tema
</label> <div class="grid grid-cols-3 gap-2"> <!-- Light Mode --> <button type="button" id="theme-light"${addAttribute(`p-3 border-2 rounded-lg transition-all duration-200 ${currentMode === "light" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`, "class")}> <div class="flex flex-col items-center space-y-2"> <div class="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center"> <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path> </svg> </div> <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Claro</span> </div> </button> <!-- Dark Mode --> <button type="button" id="theme-dark"${addAttribute(`p-3 border-2 rounded-lg transition-all duration-200 ${currentMode === "dark" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`, "class")}> <div class="flex flex-col items-center space-y-2"> <div class="w-8 h-8 bg-gray-800 border border-gray-600 rounded flex items-center justify-center"> <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"> <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path> </svg> </div> <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Oscuro</span> </div> </button> <!-- Auto Mode --> <button type="button" id="theme-auto"${addAttribute(`p-3 border-2 rounded-lg transition-all duration-200 ${currentMode === "auto" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`, "class")}> <div class="flex flex-col items-center space-y-2"> <div class="w-8 h-8 bg-gradient-to-r from-white to-gray-800 border border-gray-300 rounded flex items-center justify-center"> <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd"></path> </svg> </div> <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Auto</span> </div> </button> </div> <p class="text-xs text-gray-500 dark:text-gray-400">
El modo automático usa la preferencia de tu sistema
</p> </div> ${renderScript($$result, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/components/ui/ThemeModeSelector.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/components/ui/ThemeModeSelector.astro", void 0);

const $$Astro$1 = createAstro();
const $$ColorSelector = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ColorSelector;
  const { currentColor, id } = Astro2.props;
  const colors = [
    { name: "blue", label: "Azul", class: "bg-blue-500" },
    { name: "green", label: "Verde", class: "bg-green-500" },
    { name: "purple", label: "P\xFArpura", class: "bg-purple-500" },
    { name: "red", label: "Rojo", class: "bg-red-500" },
    { name: "orange", label: "Naranja", class: "bg-orange-500" }
  ];
  return renderTemplate`${maybeRenderHead()}<div class="space-y-3"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
Color Principal
</label> <div class="grid grid-cols-5 gap-3"> ${colors.map((color) => renderTemplate`<button type="button"${addAttribute(`color-${color.name}`, "id")}${addAttribute(`relative p-2 border-2 rounded-lg transition-all duration-200 ${currentColor === color.name ? "border-gray-400 ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`, "class")}${addAttribute(color.label, "title")}> <div${addAttribute(`w-8 h-8 ${color.class} rounded-full mx-auto`, "class")}></div> ${currentColor === color.name && renderTemplate`<div class="absolute inset-0 flex items-center justify-center"> <svg class="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path> </svg> </div>`} </button>`)} </div> <p class="text-xs text-gray-500 dark:text-gray-400">
El color se aplicará a botones, enlaces y elementos destacados
</p> </div> ${renderScript($$result, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/components/ui/ColorSelector.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/components/ui/ColorSelector.astro", void 0);

const $$Astro = createAstro();
const $$FontSizeSelector = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$FontSizeSelector;
  const { currentSize, id } = Astro2.props;
  const sizes = [
    { name: "small", label: "Peque\xF1o", description: "14px - Compacto" },
    { name: "medium", label: "Normal", description: "16px - Por defecto" },
    { name: "large", label: "Grande", description: "18px - C\xF3modo" }
  ];
  return renderTemplate`${maybeRenderHead()}<div class="space-y-3"> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
Tamaño de Fuente
</label> <div class="space-y-2"> ${sizes.map((size) => renderTemplate`<button type="button"${addAttribute(`size-${size.name}`, "id")}${addAttribute(`w-full p-3 border-2 rounded-lg text-left transition-all duration-200 ${currentSize === size.name ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`, "class")}> <div class="flex items-center justify-between"> <div> <div${addAttribute(`font-medium text-gray-900 dark:text-gray-100 ${size.name === "small" ? "text-sm" : size.name === "medium" ? "text-base" : "text-lg"}`, "class")}> ${size.label} </div> <div class="text-xs text-gray-500 dark:text-gray-400"> ${size.description} </div> </div> ${currentSize === size.name && renderTemplate`<svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path> </svg>`} </div> </button>`)} </div> <p class="text-xs text-gray-500 dark:text-gray-400">
El tamaño se aplicará a todo el texto de la aplicación
</p> </div> ${renderScript($$result, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/components/ui/FontSizeSelector.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/components/ui/FontSizeSelector.astro", void 0);

const $$Profile = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Dashboard", $$Dashboard, { "title": "Mi Perfil - BLS Cotizador", "activeSection": "profile" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "ScrollbarStyles", $$ScrollbarStyles, {})} ${maybeRenderHead()}<div class="space-y-6"> <!-- Header --> ${renderComponent($$result2, "PageHeader", $$PageHeader, { "title": "Mi Perfil", "subtitle": "Administra tu informaci\xF3n personal y configuraci\xF3n de cuenta" })} <div class="grid grid-cols-1 lg:grid-cols-3 gap-6"> <!-- Foto de Perfil --> <div class="lg:col-span-3"> ${renderComponent($$result2, "Card", $$Card, { "title": "Foto de Perfil" }, { "default": async ($$result3) => renderTemplate` <div class="flex items-center space-x-6"> <!-- Avatar actual --> <div class="shrink-0"> <div id="current-avatar" class="h-20 w-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-lg font-medium relative overflow-hidden"> <span id="avatar-initials">?</span> <img id="avatar-image" class="h-full w-full object-cover hidden" alt="Avatar"> </div> </div> <!-- Controles de avatar --> <div class="flex-1"> <div class="space-y-3"> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
Cambiar foto de perfil
</label> <div class="flex items-center space-x-3"> <input type="file" id="avatar-upload" accept="image/*" class="hidden"> <button type="button" id="upload-avatar-btn" class="inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500 border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm">
Subir foto
</button> <button type="button" id="remove-avatar-btn" class="hidden" data-classes="inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500 border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm">
Quitar foto
</button> </div> </div> <p class="text-xs text-gray-500 dark:text-gray-400">
JPG, PNG o GIF hasta 2MB. Se mostrará como un círculo.
</p> </div> </div> </div> ` })} </div> <!-- Información del Perfil --> <div class="lg:col-span-2"> ${renderComponent($$result2, "Card", $$Card, { "title": "Informaci\xF3n Personal" }, { "default": async ($$result3) => renderTemplate` <form id="profile-form" class="space-y-6"> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <!-- Nombre --> ${renderComponent($$result3, "Input", $$Input, { "id": "profile-nombre", "name": "nombre", "required": true, "label": "Nombre completo", "placeholder": "Tu nombre completo" })} <!-- Email --> ${renderComponent($$result3, "Input", $$Input, { "id": "profile-email", "name": "email", "type": "email", "required": true, "label": "Email", "placeholder": "tu@email.com" })} <!-- Email Verification Status --> <div id="email-verification-status" class="mt-2 text-sm" style="display: none;"> <div id="email-verified" class="flex items-center text-green-600 dark:text-green-400"> <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path> </svg>
Email verificado
</div> <div id="email-pending" class="flex items-center text-orange-600 dark:text-orange-400"> <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path> </svg> <span>Email pendiente de verificación</span> <button id="resend-verification" class="ml-2 text-blue-600 dark:text-blue-400 hover:underline" onclick="resendEmailVerification()">
Reenviar verificación
</button> </div> </div> </div> <!-- Rol --> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
Rol en el sistema
</label> <p id="profile-rol" class="mt-1 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
Cargando...
</p> </div> <!-- Estado --> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
Estado de la cuenta
</label> <div id="profile-status" class="mt-1"> <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
Cargando...
</span> </div> </div> <!-- Fecha de registro --> <div> <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
Fecha de registro
</label> <p id="profile-created" class="mt-1 text-sm text-gray-900 dark:text-gray-100">
Cargando...
</p> </div> <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700"> ${renderComponent($$result3, "Button", $$Button, { "id": "cancel-profile-btn", "variant": "secondary", "size": "md" }, { "default": async ($$result4) => renderTemplate`
Cancelar
` })} ${renderComponent($$result3, "Button", $$Button, { "id": "save-profile-btn", "variant": "primary", "size": "md" }, { "default": async ($$result4) => renderTemplate`
Guardar Cambios
` })} </div> </form> ` })} </div> <!-- Panel de Acciones --> <div class="space-y-6"> <!-- Cambiar Contraseña --> ${renderComponent($$result2, "Card", $$Card, { "title": "Seguridad" }, { "default": async ($$result3) => renderTemplate` <div class="space-y-4"> <p class="text-sm text-gray-600 dark:text-gray-300">
Actualiza tu contraseña para mantener tu cuenta segura.
</p> ${renderComponent($$result3, "Button", $$Button, { "id": "change-password-btn", "variant": "secondary", "size": "md", "class": "w-full" }, { "default": async ($$result4) => renderTemplate`
Cambiar Contraseña
` })} </div> ` })} <!-- Temas y Personalización --> ${renderComponent($$result2, "Card", $$Card, { "title": "Temas y Personalizaci\xF3n" }, { "default": async ($$result3) => renderTemplate` <div class="space-y-6"> <!-- Se inicializa con valores por defecto, pero se actualizará con JavaScript --> ${renderComponent($$result3, "ThemeModeSelector", $$ThemeModeSelector, { "currentMode": "light" })} <!-- Color Principal --> ${renderComponent($$result3, "ColorSelector", $$ColorSelector, { "currentColor": "blue" })} <!-- Tamaño de Fuente --> ${renderComponent($$result3, "FontSizeSelector", $$FontSizeSelector, { "currentSize": "medium" })} <!-- Botón para restablecer --> <div class="pt-4 border-t border-gray-200 dark:border-gray-700"> ${renderComponent($$result3, "Button", $$Button, { "id": "reset-theme-btn", "variant": "secondary", "size": "sm", "class": "w-full" }, { "default": async ($$result4) => renderTemplate`
Restablecer a valores por defecto
` })} </div> </div> ` })} <!-- Información de la Cuenta --> ${renderComponent($$result2, "Card", $$Card, { "title": "Informaci\xF3n de la Cuenta" }, { "default": async ($$result3) => renderTemplate` <div class="space-y-3 text-sm"> <div class="flex justify-between"> <span class="text-gray-600 dark:text-gray-400">Última conexión:</span> <span id="last-login" class="text-gray-900 dark:text-gray-100">Cargando...</span> </div> <div class="flex justify-between"> <span class="text-gray-600 dark:text-gray-400">Sesiones activas:</span> <span class="text-gray-900 dark:text-gray-100">1</span> </div> </div> ` })} <!-- Acciones de Cuenta --> ${renderComponent($$result2, "Card", $$Card, { "title": "Acciones de Cuenta" }, { "default": async ($$result3) => renderTemplate` <div class="space-y-3"> ${renderComponent($$result3, "Button", $$Button, { "id": "download-data-btn", "variant": "secondary", "size": "sm", "class": "w-full" }, { "default": async ($$result4) => renderTemplate`
Descargar Mis Datos
` })} ${renderComponent($$result3, "Button", $$Button, { "id": "delete-account-btn", "variant": "danger", "size": "sm", "class": "w-full" }, { "default": async ($$result4) => renderTemplate`
Eliminar Cuenta
` })} </div> ` })} </div> </div> </div> ` })} ${renderScript($$result, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/profile.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/profile.astro", void 0);

const $$file = "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/profile.astro";
const $$url = "/profile";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Profile,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
