import { useEffect, useState } from 'preact/hooks'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ckfinpywlpllvhvzagnw.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_Bl6csDnCJ5LIJsIsCafMYQ_5zwLTgvR'

export function App() {
    const [lang, setLang] = useState('uk')
    const [event, setEvent] = useState<string>('')

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail
            setEvent(JSON.stringify({ user: detail.user?.email || null, nick: detail.nick }, null, 2))
        }
        document.addEventListener('auth-changed', handler)
        return () => document.removeEventListener('auth-changed', handler)
    }, [])

    return (
        <div class="min-h-screen bg-surface-950 text-white font-sans p-12">
            <div class="max-w-3xl mx-auto">
                <h1 class="text-3xl font-black tracking-tight mb-2">anubis-auth-widget · dev</h1>
                <p class="text-gray-400 mb-6">
                    Standalone web component preview. Host pages embed it via{' '}
                    <code class="text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded font-mono text-sm">
                        {'<anubis-auth supabase-url=… supabase-key=… lang=…>'}
                    </code>
                    .
                </p>

                <div class="flex items-center gap-2 mb-8 flex-wrap">
                    <span class="text-gray-500 text-sm">locale:</span>
                    {(['en', 'ru', 'uk', 'de', 'pl'] as const).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            class={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                lang === l
                                    ? 'bg-brand-600/50 border-brand-500 text-white'
                                    : 'border-brand-500/30 text-gray-300 hover:bg-brand-500/15'
                            }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                <div class="p-6 border border-dashed border-brand-500/30 rounded-2xl bg-brand-500/5 mb-6">
                    <p class="text-gray-500 text-xs uppercase tracking-wider mb-3">embedded widget:</p>
                    {/* @ts-ignore */}
                    <anubis-auth
                        supabase-url={SUPABASE_URL}
                        supabase-key={SUPABASE_KEY}
                        lang={lang}
                    />
                </div>

                <details class="text-gray-500 text-xs">
                    <summary class="cursor-pointer hover:text-gray-300">last <code class="font-mono">auth-changed</code> event</summary>
                    <pre class="bg-surface-900 border border-brand-500/20 rounded-lg p-3 mt-2 overflow-auto">
                        {event || '(none yet — sign in or out)'}
                    </pre>
                </details>
            </div>
        </div>
    )
}
