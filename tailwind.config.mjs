/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--color-primary-50, #eff6ff)",
          100: "var(--color-primary-100, #dbeafe)",
          200: "var(--color-primary-200, #bfdbfe)",
          300: "var(--color-primary-300, #93c5fd)",
          400: "var(--color-primary-400, #60a5fa)",
          500: "var(--color-primary-500, #3b82f6)",
          600: "var(--color-primary-600, #2563eb)",
          700: "var(--color-primary-700, #1d4ed8)",
          800: "var(--color-primary-800, #1e40af)",
          900: "var(--color-primary-900, #1e3a8a)",
        },
      },
      fontSize: {
        xs: ["calc(0.75rem * var(--font-scale, 1))", { lineHeight: "1rem" }],
        sm: [
          "calc(0.875rem * var(--font-scale, 1))",
          { lineHeight: "1.25rem" },
        ],
        base: ["var(--font-size-base, 1rem)", { lineHeight: "1.5rem" }],
        lg: [
          "calc(1.125rem * var(--font-scale, 1))",
          { lineHeight: "1.75rem" },
        ],
        xl: ["calc(1.25rem * var(--font-scale, 1))", { lineHeight: "1.75rem" }],
        "2xl": ["calc(1.5rem * var(--font-scale, 1))", { lineHeight: "2rem" }],
        "3xl": [
          "calc(1.875rem * var(--font-scale, 1))",
          { lineHeight: "2.25rem" },
        ],
        "4xl": [
          "calc(2.25rem * var(--font-scale, 1))",
          { lineHeight: "2.5rem" },
        ],
        "5xl": ["calc(3rem * var(--font-scale, 1))", { lineHeight: "1" }],
        "6xl": ["calc(3.75rem * var(--font-scale, 1))", { lineHeight: "1" }],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
