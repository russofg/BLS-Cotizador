/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // New design system tokens (CSS var-backed)
        bg: {
          DEFAULT: 'var(--bg)',
          elev:    'var(--bg-elev)',
          sunken:  'var(--bg-sunken)',
          sidebar: 'var(--bg-sidebar)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong:  'var(--line-strong)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          mute:    'var(--ink-mute)',
          faint:   'var(--ink-faint)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          soft:    'var(--accent-soft)',
          wash:    'var(--accent-wash)',
        },
        ok:   'var(--ok)',
        warn: 'var(--warn)',
        err:  'var(--err)',
        // Legacy compat tokens
        primary: {
          50: "#f0f7ff", 100: "#e0effe", 200: "#bae0fd",
          300: "#7cc8fb", 400: "#36abf7", 500: "#3b82f6",
          600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af",
          900: "#1e3a8a", 950: "#172554",
        },
        background:               "#080c14",
        "on-background":          "#e7ecf3",
        surface:                  "#0d121c",
        "surface-container":      "#0d121c",
        "surface-container-low":  "#0a0f18",
        "surface-container-lowest": "#05080e",
        "on-surface":             "#e7ecf3",
        "primary-container":      "#1d4ed8",
        "on-primary-container":   "#e0eaff",
        "on-primary":             "#f1f6ff",
        "outline-variant":        "rgba(255,255,255,0.06)",
        "surface-tint":           "rgba(59,130,246,0.06)",
      },
      fontSize: {
        micro: ['10px',  { lineHeight: '14px', letterSpacing: '0.08em' }],
        tiny:  ['11px',  { lineHeight: '16px' }],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
