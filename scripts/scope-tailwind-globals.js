// Tailwind v3 emits two unscopeable globals into compiled CSS that survive
// our `important: '.aw-scope'` config:
//   1. `*, :before, :after { --tw-…: 0 … }` — initialises every CSS custom
//      property Tailwind utilities use (--tw-shadow, --tw-blur, --tw-scale…).
//   2. `::backdrop { --tw-…: 0 … }` — same set, scoped to ::backdrop pseudo.
//
// When this CSS lands in the launcher's renderer it RESETS the launcher's
// own --tw-shadow / --tw-blur / --tw-scale-* on every element → every
// shadow, blur, transform utility on launcher elements collapses to 0.
//
// Tailwind doesn't expose a knob to disable this (preflight: false leaves
// it untouched, since the vars are baked into utility runtime, not preflight).
// So we post-process the bundle: rewrite both selectors to be scoped under
// `.aw-scope` so the resets only apply to widget descendants.
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'dist/anubis-auth.js'
const original = readFileSync(FILE, 'utf8')

const replacements = [
    // The `*,:before,:after { … }` block initialising every --tw-* var.
    {
        pattern: /\*,:before,:after\{/g,
        replacement: '.aw-scope,.aw-scope :before,.aw-scope :after{',
        label: '*, :before, :after',
    },
    {
        pattern: /::backdrop\{/g,
        replacement: '.aw-scope ::backdrop{',
        label: '::backdrop',
    },
]

let patched = original
let totalHits = 0
for (const { pattern, replacement, label } of replacements) {
    const before = patched.length
    const matches = patched.match(pattern)
    if (matches) {
        patched = patched.replace(pattern, replacement)
        totalHits += matches.length
        console.log(`  scoped ${matches.length}× ${label}`)
    } else {
        console.log(`  no match for ${label}`)
    }
}

if (totalHits === 0) {
    console.warn('No globals found to scope — Tailwind output may have changed format.')
    process.exit(0)
}

writeFileSync(FILE, patched)
console.log(`Patched ${FILE} (${totalHits} replacement${totalHits === 1 ? '' : 's'}).`)
