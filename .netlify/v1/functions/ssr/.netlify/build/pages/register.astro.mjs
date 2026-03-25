/* empty css                                   */
import { c as createComponent, i as renderComponent, j as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B0jxGkjM.mjs';
import 'piccolore';
import { $ as $$Base } from '../chunks/Base_Cc4AJ1Q9.mjs';
import { $ as $$Button } from '../chunks/Button_Qb3BKv6-.mjs';
import { $ as $$Input } from '../chunks/Input_Dg7Aa5ZU.mjs';
/* empty css                                    */
export { renderers } from '../renderers.mjs';

const $$Register = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Registro - BLS Cotizador", "data-astro-cid-qraosrxq": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" data-astro-cid-qraosrxq> <div class="max-w-md w-full space-y-8" data-astro-cid-qraosrxq> <div data-astro-cid-qraosrxq> <div class="flex justify-center" data-astro-cid-qraosrxq> <svg class="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-astro-cid-qraosrxq> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-qraosrxq></path> </svg> </div> <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900" data-astro-cid-qraosrxq>
Crear nueva cuenta
</h2> <p class="mt-2 text-center text-sm text-gray-600" data-astro-cid-qraosrxq>
Únete al sistema de cotizaciones BLS
</p> </div> <form id="register-form" class="mt-8 space-y-6" data-astro-cid-qraosrxq> <div class="space-y-4" data-astro-cid-qraosrxq> <!-- Nombre completo --> ${renderComponent($$result2, "Input", $$Input, { "id": "full-name", "name": "nombre", "type": "text", "required": true, "label": "Nombre completo", "placeholder": "Ej: Juan P\xE9rez", "data-astro-cid-qraosrxq": true })} <!-- Email --> ${renderComponent($$result2, "Input", $$Input, { "id": "email-address", "name": "email", "type": "email", "required": true, "label": "Direcci\xF3n de email", "placeholder": "Ej: juan@empresa.com", "data-astro-cid-qraosrxq": true })} <!-- Contraseña --> <div data-astro-cid-qraosrxq> ${renderComponent($$result2, "Input", $$Input, { "id": "password", "name": "password", "type": "password", "required": true, "label": "Contrase\xF1a", "placeholder": "M\xEDnimo 6 caracteres", "data-astro-cid-qraosrxq": true })} <p class="mt-1 text-sm text-gray-500" data-astro-cid-qraosrxq>
La contraseña debe tener al menos 6 caracteres
</p> </div> <!-- Confirmar contraseña --> ${renderComponent($$result2, "Input", $$Input, { "id": "confirm-password", "name": "confirmPassword", "type": "password", "required": true, "label": "Confirmar contrase\xF1a", "placeholder": "Repite tu contrase\xF1a", "data-astro-cid-qraosrxq": true })} </div> <!-- Términos y condiciones --> <div class="flex items-center" data-astro-cid-qraosrxq> <input id="accept-terms" name="acceptTerms" type="checkbox" required class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" data-astro-cid-qraosrxq> <label for="accept-terms" class="ml-2 block text-sm text-gray-900" data-astro-cid-qraosrxq>
Acepto los
<a href="#" class="text-primary-600 hover:text-primary-500" data-astro-cid-qraosrxq>términos y condiciones</a>
y la
<a href="#" class="text-primary-600 hover:text-primary-500" data-astro-cid-qraosrxq>política de privacidad</a> </label> </div> <div data-astro-cid-qraosrxq> ${renderComponent($$result2, "Button", $$Button, { "id": "register-button", "type": "submit", "variant": "primary", "size": "lg", "class": "w-full", "data-astro-cid-qraosrxq": true }, { "default": async ($$result3) => renderTemplate` <span id="register-text" data-astro-cid-qraosrxq>Crear cuenta</span> ` })} </div> <!-- Login link --> <div class="text-center" data-astro-cid-qraosrxq> <p class="text-sm text-gray-600" data-astro-cid-qraosrxq>
¿Ya tienes una cuenta?
<a href="/login" class="font-medium text-primary-600 hover:text-primary-500 transition-colors" data-astro-cid-qraosrxq>
Inicia sesión aquí
</a> </p> </div> <!-- Info sobre el proceso --> <div class="rounded-md bg-blue-50 p-4" data-astro-cid-qraosrxq> <div class="flex" data-astro-cid-qraosrxq> <div class="flex-shrink-0" data-astro-cid-qraosrxq> <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-qraosrxq> <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" data-astro-cid-qraosrxq></path> </svg> </div> <div class="ml-3" data-astro-cid-qraosrxq> <h3 class="text-sm font-medium text-blue-800" data-astro-cid-qraosrxq>
Información importante
</h3> <div class="mt-2 text-sm text-blue-700" data-astro-cid-qraosrxq> <p data-astro-cid-qraosrxq>
Las nuevas cuentas requieren aprobación del administrador.
</p> <p class="mt-1" data-astro-cid-qraosrxq>
Recibirás un email cuando tu cuenta sea activada.
</p> </div> </div> </div> </div> </form> </div> </div> ` })} ${renderScript($$result, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/register.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/register.astro", void 0);

const $$file = "/Users/fernandogabrielrusso/Desktop/Cotizador-Online/cotizador/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Register,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
