/* empty css                                   */
import { c as createComponent, i as renderComponent, j as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B0jxGkjM.mjs';
import 'piccolore';
import { $ as $$Base } from '../chunks/Base_DaFcxdZo.mjs';
import { $ as $$Input } from '../chunks/Input_Dg7Aa5ZU.mjs';
import { $ as $$Button } from '../chunks/Button_Qb3BKv6-.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const isDev = false;
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Iniciar Sesión - BLS Cotizador", "data-astro-cid-sgpqyurt": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" data-astro-cid-sgpqyurt> <div class="max-w-md w-full space-y-8" data-astro-cid-sgpqyurt> <div data-astro-cid-sgpqyurt> <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100" data-astro-cid-sgpqyurt> <svg class="h-8 w-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-sgpqyurt> <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-sgpqyurt></path> </svg> </div> <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900" data-astro-cid-sgpqyurt>
BLS Cotizador
</h2> <p class="mt-2 text-center text-sm text-gray-600" data-astro-cid-sgpqyurt>
Sistema de Cotizaciones Audiovisuales
</p> </div> <form class="mt-8 space-y-6" id="login-form" data-astro-cid-sgpqyurt> <input type="hidden" name="remember" value="true" data-astro-cid-sgpqyurt> <div class="space-y-4" data-astro-cid-sgpqyurt> ${renderComponent($$result2, "Input", $$Input, { "id": "email-address", "name": "email", "type": "email", "autocomplete": "email", "required": true, "placeholder": "Dirección de email", "label": "Email", "data-astro-cid-sgpqyurt": true })} ${renderComponent($$result2, "Input", $$Input, { "id": "password", "name": "password", "type": "password", "autocomplete": "current-password", "required": true, "placeholder": "Contraseña", "label": "Contraseña", "data-astro-cid-sgpqyurt": true })} </div> <div class="flex items-center justify-between" data-astro-cid-sgpqyurt> <div class="flex items-center" data-astro-cid-sgpqyurt> <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" data-astro-cid-sgpqyurt> <label for="remember-me" class="ml-2 block text-sm text-gray-900" data-astro-cid-sgpqyurt>
Recordarme
</label> </div> <div class="text-sm" data-astro-cid-sgpqyurt> <a href="#" class="font-medium text-primary-600 hover:text-primary-500" data-astro-cid-sgpqyurt>
¿Olvidaste tu contraseña?
</a> </div> </div> <div data-astro-cid-sgpqyurt> ${renderComponent($$result2, "Button", $$Button, { "type": "submit", "id": "login-button", "variant": "primary", "size": "lg", "class": "w-full", "data-astro-cid-sgpqyurt": true }, { "default": async ($$result3) => renderTemplate` <span class="absolute left-0 inset-y-0 flex items-center pl-3" data-astro-cid-sgpqyurt> <svg class="h-5 w-5 text-primary-500 group-hover:text-primary-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" data-astro-cid-sgpqyurt> <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" data-astro-cid-sgpqyurt></path> </svg> </span> <span id="login-text" data-astro-cid-sgpqyurt>Iniciar Sesión</span> ` })} </div> <!-- Error message --> <div id="error-message" class="hidden rounded-md bg-red-50 p-4" data-astro-cid-sgpqyurt> <div class="flex" data-astro-cid-sgpqyurt> <div class="flex-shrink-0" data-astro-cid-sgpqyurt> <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-sgpqyurt> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" data-astro-cid-sgpqyurt></path> </svg> </div> <div class="ml-3" data-astro-cid-sgpqyurt> <h3 class="text-sm font-medium text-red-800" data-astro-cid-sgpqyurt>
Error de autenticación
</h3> <div class="mt-2 text-sm text-red-700" id="error-text" data-astro-cid-sgpqyurt>
Las credenciales proporcionadas no son válidas.
</div> </div> </div> </div>  ${isDev} <!-- Registro link --> <div class="mt-6 text-center space-y-2" data-astro-cid-sgpqyurt> <p class="text-sm text-gray-600" data-astro-cid-sgpqyurt>
¿No tienes una cuenta?
<a href="/register" class="font-medium text-primary-600 hover:text-primary-500 transition-colors" data-astro-cid-sgpqyurt>
Regístrate aquí
</a> </p> <p class="text-sm text-gray-600" data-astro-cid-sgpqyurt> <a href="#" id="forgot-password-link" class="font-medium text-primary-600 hover:text-primary-500 transition-colors" data-astro-cid-sgpqyurt>
¿Olvidaste tu contraseña?
</a> </p> </div> </form> </div> </div> ` })} ${renderScript($$result, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/login.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/login.astro", void 0);
const $$file = "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
