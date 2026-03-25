import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_CFJ9A_VI.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/analytics.astro.mjs');
const _page2 = () => import('./pages/api/clients.astro.mjs');
const _page3 = () => import('./pages/api/items.astro.mjs');
const _page4 = () => import('./pages/api/quote-tracking.astro.mjs');
const _page5 = () => import('./pages/api/quotes.astro.mjs');
const _page6 = () => import('./pages/api/users.astro.mjs');
const _page7 = () => import('./pages/clients.astro.mjs');
const _page8 = () => import('./pages/config.astro.mjs');
const _page9 = () => import('./pages/dashboard.astro.mjs');
const _page10 = () => import('./pages/items.astro.mjs');
const _page11 = () => import('./pages/login.astro.mjs');
const _page12 = () => import('./pages/profile.astro.mjs');
const _page13 = () => import('./pages/quotes/edit/_id_.astro.mjs');
const _page14 = () => import('./pages/quotes/edit-simple/_id_.astro.mjs');
const _page15 = () => import('./pages/quotes/new.astro.mjs');
const _page16 = () => import('./pages/quotes/tracking/_id_.astro.mjs');
const _page17 = () => import('./pages/quotes/view/_id_.astro.mjs');
const _page18 = () => import('./pages/quotes/wizard.astro.mjs');
const _page19 = () => import('./pages/quotes.astro.mjs');
const _page20 = () => import('./pages/register.astro.mjs');
const _page21 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/analytics.ts", _page1],
    ["src/pages/api/clients.ts", _page2],
    ["src/pages/api/items.ts", _page3],
    ["src/pages/api/quote-tracking.ts", _page4],
    ["src/pages/api/quotes.ts", _page5],
    ["src/pages/api/users.ts", _page6],
    ["src/pages/clients.astro", _page7],
    ["src/pages/config.astro", _page8],
    ["src/pages/dashboard.astro", _page9],
    ["src/pages/items.astro", _page10],
    ["src/pages/login.astro", _page11],
    ["src/pages/profile.astro", _page12],
    ["src/pages/quotes/edit/[id].astro", _page13],
    ["src/pages/quotes/edit-simple/[id].astro", _page14],
    ["src/pages/quotes/new.astro", _page15],
    ["src/pages/quotes/tracking/[id].astro", _page16],
    ["src/pages/quotes/view/[id].astro", _page17],
    ["src/pages/quotes/wizard.astro", _page18],
    ["src/pages/quotes.astro", _page19],
    ["src/pages/register.astro", _page20],
    ["src/pages/index.astro", _page21]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "ef4eb955-6fca-4544-bbf1-eeb3b35b884d"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
