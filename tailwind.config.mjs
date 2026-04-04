/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#36abf7",
          500: "#0c8de0",
          600: "#026fc2",
          700: "#02599e",
          800: "#064b81",
          900: "#0b3f6b",
          950: "#072848",
        },
        background: "#0c1324",
        "on-background": "#e2e8f0",
        surface: "#10162a",
        "surface-container": "#13192c",
        "surface-container-low": "#151b2d",
        "surface-container-lowest": "#0a0f1d",
        "on-surface": "#cbd5e1",
        "primary-container": "#2563eb",
        "on-primary-container": "#ffffff",
        "on-primary": "#002a78",
        "outline-variant": "rgba(255, 255, 255, 0.08)",
        "surface-tint": "rgba(37, 99, 235, 0.15)",
      },
      boxShadow: {
        'premium': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'premium-hover': '0 12px 48px 0 rgba(37, 99, 235, 0.15)',
        'glass': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      },
      fontSize: {
        xs: ["calc(0.75rem * var(--font-scale, 1))", { lineHeight: "1rem" }],
        sm: ["calc(0.875rem * var(--font-scale, 1))", { lineHeight: "1.25rem" }],
        base: ["var(--font-size-base, 1rem)", { lineHeight: "1.5rem" }],
        lg: ["calc(1.125rem * var(--font-scale, 1))", { lineHeight: "1.75rem" }],
        xl: ["calc(1.25rem * var(--font-scale, 1))", { lineHeight: "1.75rem" }],
        "2xl": ["calc(1.5rem * var(--font-scale, 1))", { lineHeight: "2rem" }],
        "3xl": ["calc(1.875rem * var(--font-scale, 1))", { lineHeight: "2.25rem" }],
        "4xl": ["calc(2.25rem * var(--font-scale, 1))", { lineHeight: "2.5rem" }],
        "5xl": ["calc(3rem * var(--font-scale, 1))", { lineHeight: "1" }],
        "6xl": ["calc(3.75rem * var(--font-scale, 1))", { lineHeight: "1" }],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
