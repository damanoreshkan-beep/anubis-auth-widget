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

register(
    AuthWidget as any,
    'anubis-auth',
    ['supabase-url', 'supabase-key', 'lang', 'launcher-protocol'],
    { shadow: false },
)
