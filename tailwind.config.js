/** @type {import('tailwindcss').Config} */
// Palette mirrors AnubisWorld site (minecraft-site/docs/index.html).
// Important: no `preflight` reset so we don't blow up the host page.
//
// `important: 'anubis-auth'` scopes EVERY utility selector to be a descendant
// of <anubis-auth>. Without this, common utilities like `.hidden`, `.flex`,
// `.relative`, `.inline-block` are injected as plain global rules that
// override the host page's Tailwind CSS (host's `.hidden md:flex` nav links
// disappear, `.hero-portrait-wrap` loses its inline-block sizing context, etc).
// Tailwind also tags each utility with !important — fine here because
// they're already scoped, can only affect widget descendants.
export default {
  content: ['./src/**/*.{ts,tsx,html}', './index.html'],
  // `.aw-scope` (not `anubis-auth`) so the Modal portal — which renders into
  // document.body, *outside* the custom element — can still inherit the
  // utility cascade by wrapping its root in `<div class="aw-scope">`. Tag
  // scoping wouldn't reach a portaled subtree.
  important: '.aw-scope',
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
