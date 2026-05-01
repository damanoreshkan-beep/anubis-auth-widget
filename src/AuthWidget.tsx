import { useEffect, useState, useRef } from 'preact/hooks'
import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

type Locale = 'en' | 'ru' | 'uk' | 'de' | 'pl'

const COPY: Record<Locale, Record<string, string>> = {
    en: { login: 'Login', logout: 'Logout', orDivider: 'or', setNickTitle: 'Choose your Minecraft nickname',
          setNickHint: 'This name will be shown in-game.', setNickPlaceholder: 'Steve_99', setNickSubmit: 'Save',
          nickFormatErr: 'Nick 3-16 chars: letters, digits, underscore', nickTakenErr: 'This nickname is already taken',
          welcome: 'Welcome!', welcomeYourNick: 'Your nickname:', welcomeContinue: 'Continue' },
    ru: { login: 'Войти', logout: 'Выйти', orDivider: 'или', setNickTitle: 'Выбери ник для Minecraft',
          setNickHint: 'Этот ник будет отображаться в игре.', setNickPlaceholder: 'Steve_99', setNickSubmit: 'Сохранить',
          nickFormatErr: 'Ник 3-16 символов: латиница, цифры, _', nickTakenErr: 'Этот ник уже занят',
          welcome: 'Добро пожаловать!', welcomeYourNick: 'Твой ник:', welcomeContinue: 'Продолжить' },
    uk: { login: 'Увійти', logout: 'Вийти', orDivider: 'або', setNickTitle: 'Обери нік для Minecraft',
          setNickHint: 'Цей нік буде відображатися у грі.', setNickPlaceholder: 'Steve_99', setNickSubmit: 'Зберегти',
          nickFormatErr: 'Нік 3-16 символів: латиниця, цифри, _', nickTakenErr: 'Цей нік вже зайнято',
          welcome: 'Ласкаво просимо!', welcomeYourNick: 'Твій нік:', welcomeContinue: 'Продовжити' },
    de: { login: 'Anmelden', logout: 'Abmelden', orDivider: 'oder', setNickTitle: 'Wähle deinen Minecraft-Nickname',
          setNickHint: 'Dieser Name wird im Spiel angezeigt.', setNickPlaceholder: 'Steve_99', setNickSubmit: 'Speichern',
          nickFormatErr: 'Nick 3-16 Zeichen: Buchstaben, Ziffern, _', nickTakenErr: 'Dieser Nickname ist bereits vergeben',
          welcome: 'Willkommen!', welcomeYourNick: 'Dein Nickname:', welcomeContinue: 'Weiter' },
    pl: { login: 'Zaloguj', logout: 'Wyloguj', orDivider: 'lub', setNickTitle: 'Wybierz swój nick w Minecraft',
          setNickHint: 'Ta nazwa będzie wyświetlana w grze.', setNickPlaceholder: 'Steve_99', setNickSubmit: 'Zapisz',
          nickFormatErr: 'Nick 3-16 znaków: litery, cyfry, _', nickTakenErr: 'Ten nick jest już zajęty',
          welcome: 'Witaj!', welcomeYourNick: 'Twój nick:', welcomeContinue: 'Kontynuuj' },
}

interface Props {
    supabaseUrl?: string
    supabaseKey?: string
    lang?: string
}

const NICK_RE = /^[a-zA-Z0-9_]{3,16}$/

export function AuthWidget({ supabaseUrl, supabaseKey, lang }: Props) {
    const locale: Locale = ((lang || 'en').slice(0, 2).toLowerCase() as Locale) in COPY ? (lang!.slice(0, 2).toLowerCase() as Locale) : 'en'
    const t = COPY[locale]

    const sbRef = useRef<SupabaseClient | null>(null)
    if (!sbRef.current && supabaseUrl && supabaseKey) {
        sbRef.current = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        })
    }
    const sb = sbRef.current

    const [session, setSession] = useState<Session | null>(null)
    const [nick, setNick] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [view, setView] = useState<'auth' | 'setnick' | 'welcome'>('auth')
    const [menuOpen, setMenuOpen] = useState(false)

    // Emit auth-changed events for host (site / launcher)
    function emit(detail: { user: User | null; nick: string | null }) {
        const root = (sbRef as any).__hostElement as HTMLElement | undefined
        ;(root || document).dispatchEvent(new CustomEvent('auth-changed', { detail, bubbles: true, composed: true }))
    }

    async function loadProfile(user: User | null) {
        if (!sb || !user) { setNick(null); emit({ user: null, nick: null }); return }
        const { data } = await sb.from('profiles').select('minecraft_nick').eq('id', user.id).maybeSingle()
        if (data?.minecraft_nick) {
            setNick(data.minecraft_nick)
            emit({ user, nick: data.minecraft_nick })
        } else {
            setNick(null)
            setView('setnick')
            setOpen(true)
            emit({ user, nick: null })
        }
    }

    useEffect(() => {
        if (!sb) { setLoading(false); return }
        const { data: sub } = sb.auth.onAuthStateChange((_event, sess) => {
            setSession(sess)
            setLoading(false)
            loadProfile(sess?.user ?? null)
        })
        return () => sub.subscription.unsubscribe()
    }, [sb])

    async function handleSignOut() {
        await sb?.auth.signOut()
        setMenuOpen(false)
    }

    if (!sb) {
        return <div class="px-3 py-2 text-xs text-rose-400">missing supabase-url/key</div>
    }

    return (
        <>
            {loading ? (
                <div class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500/10 text-gray-400 text-sm">
                    <div class="w-4 h-4 rounded-full border-2 border-brand-500/30 border-t-brand-400 animate-spin" />
                </div>
            ) : !session ? (
                <button
                    type="button"
                    onClick={() => { setView('auth'); setOpen(true) }}
                    class="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-brand-400 px-3 py-2 rounded-lg hover:bg-brand-500/10 transition"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M22 17l-2 2-2-2M20 19V7m-8-2a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{t.login}</span>
                </button>
            ) : nick ? (
                <ProfilePill
                    nick={nick}
                    open={menuOpen}
                    onToggle={() => setMenuOpen(!menuOpen)}
                    onLogout={handleSignOut}
                    logoutLabel={t.logout}
                />
            ) : (
                <button
                    type="button"
                    onClick={() => { setView('setnick'); setOpen(true) }}
                    class="inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 transition"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                    </svg>
                    <span>{t.setNickTitle}</span>
                </button>
            )}

            {open && (
                <Modal onClose={() => setOpen(false)}>
                    {view === 'auth' && (
                        <Auth
                            supabaseClient={sb}
                            providers={['discord']}
                            redirectTo={typeof window !== 'undefined' ? window.location.href : undefined}
                            socialLayout="horizontal"
                            localization={{ variables: {} }}
                            theme="dark"
                            appearance={{
                                theme: ThemeSupa,
                                variables: {
                                    default: {
                                        colors: {
                                            brand: '#7c3aed',
                                            brandAccent: '#a855f7',
                                            brandButtonText: '#ffffff',
                                            defaultButtonBackground: 'rgba(139,92,246,0.10)',
                                            defaultButtonBackgroundHover: 'rgba(139,92,246,0.20)',
                                            defaultButtonBorder: 'rgba(168,85,247,0.30)',
                                            defaultButtonText: '#ffffff',
                                            inputBackground: 'rgba(139,92,246,0.10)',
                                            inputBorder: 'rgba(168,85,247,0.30)',
                                            inputBorderHover: 'rgba(168,85,247,0.50)',
                                            inputBorderFocus: '#a855f7',
                                            inputText: '#ffffff',
                                            inputPlaceholder: '#6b7280',
                                            inputLabelText: '#9ca3af',
                                            messageText: '#fca5a5',
                                            messageBackground: 'rgba(220,38,38,0.10)',
                                            messageBorder: 'rgba(220,38,38,0.30)',
                                            anchorTextColor: '#a78bfa',
                                            anchorTextHoverColor: '#c4b5fd',
                                            dividerBackground: 'rgba(168,85,247,0.20)',
                                        },
                                        radii: { borderRadiusButton: '12px', buttonBorderRadius: '12px', inputBorderRadius: '12px' },
                                        space: { inputPadding: '12px 14px', buttonPadding: '12px 18px' },
                                        fonts: { bodyFontFamily: 'Inter, system-ui, sans-serif', buttonFontFamily: 'Inter, system-ui, sans-serif', inputFontFamily: 'Inter, system-ui, sans-serif', labelFontFamily: 'Inter, system-ui, sans-serif' },
                                    },
                                },
                            }}
                        />
                    )}
                    {view === 'setnick' && session && (
                        <SetNickForm
                            sb={sb}
                            user={session.user}
                            t={t}
                            onSaved={(savedNick) => { setNick(savedNick); setView('welcome'); emit({ user: session.user, nick: savedNick }) }}
                        />
                    )}
                    {view === 'welcome' && nick && (
                        <Welcome nick={nick} t={t} onContinue={() => setOpen(false)} />
                    )}
                </Modal>
            )}
        </>
    )
}

function Modal({ children, onClose }: { children: any; onClose: () => void }) {
    function onBackdrop(e: MouseEvent) {
        if (e.target === e.currentTarget) onClose()
    }
    return (
        <div class="aw-modal-backdrop" onClick={onBackdrop}>
            <div class="aw-modal-card glass rounded-2xl p-7 w-[min(440px,calc(100vw-2rem))] max-h-[90vh] overflow-y-auto relative">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="close"
                    class="absolute top-4 right-4 text-gray-400 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-500/15"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {children}
            </div>
        </div>
    )
}

function ProfilePill({
    nick, open, onToggle, onLogout, logoutLabel,
}: { nick: string; open: boolean; onToggle: () => void; onLogout: () => void; logoutLabel: string }) {
    const initial = nick[0].toUpperCase()
    return (
        <div class="relative inline-flex">
            <button
                type="button"
                onClick={onToggle}
                class="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-brand-500/10 border border-brand-500/25 hover:bg-brand-500/15 transition"
            >
                <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style="background:linear-gradient(135deg,#8b5cf6,#a855f7)">{initial}</span>
                <span class="text-sm font-semibold text-white max-w-[140px] truncate">{nick}</span>
                <svg class={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div class="absolute right-0 top-full mt-1 glass rounded-xl py-1 min-w-[140px] z-10">
                    <button
                        type="button"
                        onClick={onLogout}
                        class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-rose-300 hover:bg-rose-500/10 transition"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {logoutLabel}
                    </button>
                </div>
            )}
        </div>
    )
}

function SetNickForm({
    sb, user, t, onSaved,
}: { sb: SupabaseClient; user: User; t: any; onSaved: (n: string) => void }) {
    const [val, setVal] = useState('')
    const [err, setErr] = useState('')
    const [busy, setBusy] = useState(false)

    async function submit(e: Event) {
        e.preventDefault()
        setErr('')
        if (!NICK_RE.test(val)) { setErr(t.nickFormatErr); return }
        setBusy(true)
        const { data: taken } = await sb.from('profiles').select('id').eq('minecraft_nick', val).maybeSingle()
        if (taken) { setErr(t.nickTakenErr); setBusy(false); return }
        const { error } = await sb.from('profiles').upsert({ id: user.id, minecraft_nick: val })
        setBusy(false)
        if (error) { setErr(error.message); return }
        onSaved(val)
    }

    return (
        <form onSubmit={submit} class="space-y-4">
            <div class="flex items-center justify-center mb-2">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
            <h3 class="text-lg font-bold text-white text-center">{t.setNickTitle}</h3>
            <p class="text-xs text-gray-400 text-center">{t.setNickHint}</p>
            <input
                type="text"
                required
                minLength={3}
                maxLength={16}
                pattern="[a-zA-Z0-9_]{3,16}"
                value={val}
                onInput={(e) => setVal((e.target as HTMLInputElement).value)}
                placeholder={t.setNickPlaceholder}
                class="w-full px-4 py-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-white placeholder-gray-500 focus:border-brand-400 focus:bg-brand-500/15 focus:outline-none transition"
                style="font-family:ui-monospace,SFMono-Regular,monospace"
            />
            <p class="text-xs text-rose-400 min-h-[1rem]">{err}</p>
            <button
                type="submit"
                disabled={busy}
                class="btn-glow w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-brand-600/30 disabled:opacity-50 disabled:pointer-events-none"
            >
                {t.setNickSubmit}
            </button>
        </form>
    )
}

function Welcome({ nick, t, onContinue }: { nick: string; t: any; onContinue: () => void }) {
    return (
        <div class="space-y-4 text-center">
            <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                 style="background:linear-gradient(135deg,#8b5cf6,#22d3ee)">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h3 class="text-xl font-bold gold-text inline-block">{t.welcome}</h3>
            <p class="text-xs text-gray-500">
                <span>{t.welcomeYourNick}</span>{' '}
                <span class="font-bold text-brand-400" style="font-family:ui-monospace,SFMono-Regular,monospace">{nick}</span>
            </p>
            <button
                type="button"
                onClick={onContinue}
                class="btn-glow w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-brand-600/30"
            >
                {t.welcomeContinue}
            </button>
        </div>
    )
}
