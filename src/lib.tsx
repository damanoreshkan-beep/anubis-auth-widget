import register from 'preact-custom-element'
import { AuthWidget } from './AuthWidget'
import css from './widget.css?inline'

// CSS injected ONCE into document.head (no Shadow DOM — Stitches/CSS-in-JS
// libraries that Auth UI uses inject globally and can't reach a shadow root).
const STYLE_ID = 'anubis-auth-styles'
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
    const el = document.createElement('style')
    el.id = STYLE_ID
    el.textContent = css
    document.head.appendChild(el)
}

// Defensive URL fix-up — a chain of `resetPasswordForEmail({ redirectTo:
// window.location.href })` calls where the page already carried a hash
// produces a recovery link with a trailing `#`. After Supabase appends its
// own `#access_token=...` the browser ends up at `…/#…#access_token=…`
// (or even just `…/##access_token=…`). supabase-js parses location.hash via
// URLSearchParams which silently fails on the doubled `#` — PASSWORD_RECOVERY
// never fires, the user lands on the homepage with their session in a hash
// no one's looking at. Normalising the hash before createClient runs
// detectSessionInUrl restores the flow.
if (typeof window !== 'undefined' && window.location.hash.startsWith('##')) {
    const fixed = '#' + window.location.hash.replace(/^#+/, '')
    try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search + fixed)
    } catch (_) { /* old browsers — non-fatal */ }
}

register(
    AuthWidget as any,
    'anubis-auth',
    ['supabase-url', 'supabase-key', 'lang', 'launcher-protocol'],
    { shadow: false },
)
