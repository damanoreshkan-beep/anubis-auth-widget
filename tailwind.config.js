/** @type {import('tailwindcss').Config} */
// Anubis World design system is the canonical source for palette,
// spacing, radius, typography, and keyframes. We extend the shared
// preset with widget-specific concerns only.
//
// `important: '.aw-scope'` (not the `anubis-auth` tag) is used so the
// Modal portal — which renders into document.body, *outside* the
// custom element — can still inherit the utility cascade by wrapping
// its root in `<div class="aw-scope">`. Tag scoping wouldn't reach a
// portaled subtree.
//
// `preflight: false` keeps Tailwind's reset out of the host page —
// without it, common utilities like `.hidden`, `.flex`, `.relative`,
// `.inline-block` become plain global rules that override the host
// page's Tailwind CSS.
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const anubisPreset = require('@anubis/ds/dist/tailwind-preset.cjs')

export default {
  presets: [anubisPreset],
  content: ['./src/**/*.{ts,tsx,html}', './index.html'],
  important: '.aw-scope',
  corePlugins: {
    preflight: false,
  },
}
