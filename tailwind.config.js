/** @type {import('tailwindcss').Config} */
// Palette mirrors AnubisWorld site (minecraft-site/docs/index.html).
// Important: no `preflight` reset so we don't blow up the host page.
export default {
  content: ['./src/**/*.{ts,tsx,html}', './index.html'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        violet: {
          400: '#c084fc',
          500: '#a855f7',
        },
        egypt: {
          400: '#22d3ee',
        },
        amber: {
          400: '#fbbf24',
        },
        surface: {
          900: '#070612',
          950: '#040309',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
