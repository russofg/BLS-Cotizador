/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'system-ui', 'sans-serif'],
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
      },
      boxShadow: {
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
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
