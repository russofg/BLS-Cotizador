// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";
import pwa from "@vite-pwa/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    pwa({
      registerType: "autoUpdate",
      manifest: false, // Usamos el archivo manual en public
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        navigateFallback: "/dashboard",
      },
    }),
  ],
  output: "server",
  adapter: netlify(),
});
