import { useEffect, useState, useRef } from 'preact/hooks'
import { createPortal } from 'preact/compat'
import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js'

type Locale = 'en' | 'ru' | 'uk' | 'de' | 'pl'
type T = ReturnType<typeof copyFor>

const COPY: Record<Locale, Record<string, string>> = {
    en: {
        login: 'Login',
        logout: 'Logout',
        tabSignIn: 'Sign In', tabSignUp: 'Sign Up',
        emailLabel: 'Email', passwordLabel: 'Password', nicknameLabel: 'Minecraft nickname',
        signInSubmit: 'Sign in', signUpSubmit: 'Create account',
        forgotPassword: 'Forgot password?',
        forgotIntro: 'Enter your email — we\'ll send a one-time 6-digit code to sign you in (no password needed).',
        forgotSendCode: 'Send code', forgotCodeSent: 'Code sent to', forgotCodeLabel: '6-digit code',
        forgotVerify: 'Verify and sign in', forgotResend: 'Resend code', forgotBack: 'Back to sign in',
        forgotEmailFirst: 'Enter your email first', forgotInvalidCode: 'Code must be 6 digits',
        needNickname: 'No nickname on this account yet — set one below',
        nickFormatErr: 'Nick 3-16 chars: letters, digits, underscore', nickTakenErr: 'This nickname is already taken',
        orDivider: 'or', signInDiscord: 'Sign in with Discord',
        setNickTitle: 'Choose your Minecraft nickname',
        setNickHint: 'This name will be shown in-game. It cannot be changed later.',
        setNickPlaceholder: 'Steve_99', setNickSubmit: 'Save',
        welcome: 'Welcome!', welcomeYourNick: 'Your nickname:', welcomeContinue: 'Continue',
    },
    ru: {
        login: 'Войти', logout: 'Выйти',
        tabSignIn: 'Вход', tabSignUp: 'Регистрация',
        emailLabel: 'Email', passwordLabel: 'Пароль', nicknameLabel: 'Никнейм в Minecraft',
        signInSubmit: 'Войти', signUpSubmit: 'Создать аккаунт',
        forgotPassword: 'Забыли пароль?',
        forgotIntro: 'Введи свой email — мы отправим одноразовый 6-значный код для входа (пароль не нужен).',
        forgotSendCode: 'Отправить код', forgotCodeSent: 'Код отправлен на', forgotCodeLabel: '6-значный код',
        forgotVerify: 'Проверить и войти', forgotResend: 'Отправить код заново', forgotBack: 'Назад к входу',
        forgotEmailFirst: 'Сначала введите email', forgotInvalidCode: 'Код должен быть 6 цифр',
        needNickname: 'У аккаунта ещё нет ника — выбери ниже',
        nickFormatErr: 'Ник 3-16 символов: латиница, цифры, _', nickTakenErr: 'Этот ник уже занят',
        orDivider: 'или', signInDiscord: 'Войти через Discord',
        setNickTitle: 'Выбери ник для Minecraft',
        setNickHint: 'Этот ник будет отображаться в игре. Изменить позже нельзя.',
        setNickPlaceholder: 'Steve_99', setNickSubmit: 'Сохранить',
        welcome: 'Добро пожаловать!', welcomeYourNick: 'Твой ник:', welcomeContinue: 'Продолжить',
    },
    uk: {
        login: 'Увійти', logout: 'Вийти',
        tabSignIn: 'Вхід', tabSignUp: 'Реєстрація',
        emailLabel: 'Email', passwordLabel: 'Пароль', nicknameLabel: 'Нікнейм у Minecraft',
        signInSubmit: 'Увійти', signUpSubmit: 'Створити акаунт',
        forgotPassword: 'Забули пароль?',
        forgotIntro: 'Введи свій email — ми надішлемо одноразовий 6-значний код для входу (пароль не потрібен).',
        forgotSendCode: 'Надіслати код', forgotCodeSent: 'Код надіслано на', forgotCodeLabel: '6-значний код',
        forgotVerify: 'Перевірити та увійти', forgotResend: 'Надіслати код повторно', forgotBack: 'Назад до входу',
        forgotEmailFirst: 'Спочатку вкажи email', forgotInvalidCode: 'Код має містити 6 цифр',
        needNickname: 'У акаунта ще нема ніка — обери нижче',
        nickFormatErr: 'Нік 3-16 символів: латиниця, цифри, _', nickTakenErr: 'Цей нік вже зайнято',
        orDivider: 'або', signInDiscord: 'Увійти через Discord',
        setNickTitle: 'Обери нік для Minecraft',
        setNickHint: 'Цей нік буде відображатися у грі. Змінити пізніше не можна.',
        setNickPlaceholder: 'Steve_99', setNickSubmit: 'Зберегти',
        welcome: 'Ласкаво просимо!', welcomeYourNick: 'Твій нік:', welcomeContinue: 'Продовжити',
    },
    de: {
        login: 'Anmelden', logout: 'Abmelden',
        tabSignIn: 'Anmeldung', tabSignUp: 'Registrierung',
        emailLabel: 'E-Mail', passwordLabel: 'Passwort', nicknameLabel: 'Minecraft-Nickname',
        signInSubmit: 'Anmelden', signUpSubmit: 'Konto erstellen',
        forgotPassword: 'Passwort vergessen?',
        forgotIntro: 'Gib deine E-Mail ein — wir senden dir einen einmaligen 6-stelligen Code (kein Passwort nötig).',
        forgotSendCode: 'Code senden', forgotCodeSent: 'Code gesendet an', forgotCodeLabel: '6-stelliger Code',
        forgotVerify: 'Bestätigen und anmelden', forgotResend: 'Code erneut senden', forgotBack: 'Zurück zur Anmeldung',
        forgotEmailFirst: 'Bitte zuerst E-Mail eingeben', forgotInvalidCode: 'Der Code muss 6 Ziffern enthalten',
        needNickname: 'Dieses Konto hat noch keinen Nick — wähle unten einen',
        nickFormatErr: 'Nick 3-16 Zeichen: Buchstaben, Ziffern, _', nickTakenErr: 'Dieser Nickname ist bereits vergeben',
        orDivider: 'oder', signInDiscord: 'Mit Discord anmelden',
        setNickTitle: 'Wähle deinen Minecraft-Nickname',
        setNickHint: 'Dieser Name wird im Spiel angezeigt. Kann später nicht geändert werden.',
        setNickPlaceholder: 'Steve_99', setNickSubmit: 'Speichern',
        welcome: 'Willkommen!', welcomeYourNick: 'Dein Nickname:', welcomeContinue: 'Weiter',
    },
    pl: {
        login: 'Zaloguj', logout: 'Wyloguj',
        tabSignIn: 'Logowanie', tabSignUp: 'Rejestracja',
        emailLabel: 'Email', passwordLabel: 'Hasło', nicknameLabel: 'Nick w Minecraft',
        signInSubmit: 'Zaloguj', signUpSubmit: 'Utwórz konto',
        forgotPassword: 'Zapomniałeś hasła?',
        forgotIntro: 'Wpisz swój email — wyślemy jednorazowy 6-cyfrowy kod (hasło nie jest potrzebne).',
        forgotSendCode: 'Wyślij kod', forgotCodeSent: 'Kod wysłany na', forgotCodeLabel: 'Kod 6-cyfrowy',
        forgotVerify: 'Zweryfikuj i zaloguj', forgotResend: 'Wyślij kod ponownie', forgotBack: 'Wstecz',
        forgotEmailFirst: 'Najpierw wpisz email', forgotInvalidCode: 'Kod musi mieć 6 cyfr',
        needNickname: 'To konto nie ma jeszcze nicka — wybierz poniżej',
        nickFormatErr: 'Nick 3-16 znaków: litery, cyfry, _', nickTakenErr: 'Ten nick jest już zajęty',
        orDivider: 'lub', signInDiscord: 'Zaloguj przez Discord',
        setNickTitle: 'Wybierz swój nick w Minecraft',
        setNickHint: 'Ta nazwa będzie wyświetlana w grze. Nie można jej później zmienić.',
        setNickPlaceholder: 'Steve_99', setNickSubmit: 'Zapisz',
        welcome: 'Witaj!', welcomeYourNick: 'Twój nick:', welcomeContinue: 'Kontynuuj',
    },
}

function copyFor(lang?: string){
    const code = ((lang || 'en').slice(0, 2).toLowerCase()) as Locale
    return code in COPY ? COPY[code] : COPY.en
}

interface Props {
    supabaseUrl?: string
    supabaseKey?: string
    lang?: string
}

const NICK_RE = /^[a-zA-Z0-9_]{3,16}$/

type Pane = 'signin' | 'signup' | 'forgot'

export function AuthWidget({ supabaseUrl, supabaseKey, lang }: Props) {
    const t = copyFor(lang)

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

    function emit(detail: { user: User | null; nick: string | null }) {
        document.dispatchEvent(new CustomEvent('auth-changed', { detail, bubbles: true, composed: true }))
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
                    {view === 'auth' && <AuthForm sb={sb} t={t} />}
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

function AuthForm({ sb, t }: { sb: SupabaseClient; t: T }){
    const [pane, setPane] = useState<Pane>('signin')

    // Sign In
    const [siEmail, setSiEmail] = useState('')
    const [siPassword, setSiPassword] = useState('')
    const [siError, setSiError] = useState('')
    const [siBusy, setSiBusy] = useState(false)

    // Sign Up
    const [suEmail, setSuEmail] = useState('')
    const [suPassword, setSuPassword] = useState('')
    const [suNick, setSuNick] = useState('')
    const [suError, setSuError] = useState('')
    const [suBusy, setSuBusy] = useState(false)

    // Forgot OTP
    const [foEmail, setFoEmail] = useState('')
    const [foCodeStep, setFoCodeStep] = useState(false)
    const [foOtp, setFoOtp] = useState('')
    const [foError, setFoError] = useState('')
    const [foBusy, setFoBusy] = useState(false)

    // Discord
    const [discordBusy, setDiscordBusy] = useState(false)

    async function onSignIn(e: Event) {
        e.preventDefault(); setSiError(''); setSiBusy(true)
        try {
            const { error } = await sb.auth.signInWithPassword({ email: siEmail.trim(), password: siPassword })
            if(error) setSiError(error.message)
        } finally { setSiBusy(false) }
    }

    async function onSignUp(e: Event) {
        e.preventDefault(); setSuError('')
        if(!NICK_RE.test(suNick)){ setSuError(t.nickFormatErr); return }
        setSuBusy(true)
        try {
            const { data: taken } = await sb.from('profiles').select('id').eq('minecraft_nick', suNick).maybeSingle()
            if(taken){ setSuError(t.nickTakenErr); return }
            const { data, error } = await sb.auth.signUp({ email: suEmail.trim(), password: suPassword })
            if(error){ setSuError(error.message); return }
            const userId = data.user?.id
            if(!userId){ setSuError('No user'); return }
            const { error: pErr } = await sb.from('profiles').upsert({ id: userId, minecraft_nick: suNick })
            if(pErr) setSuError(pErr.message)
        } finally { setSuBusy(false) }
    }

    async function onForgotSend(){
        setFoError('')
        if(!foEmail.trim()){ setFoError(t.forgotEmailFirst); return }
        setFoBusy(true)
        try {
            const { error } = await sb.auth.signInWithOtp({ email: foEmail.trim(), options: { shouldCreateUser: false } })
            if(error){ setFoError(error.message); return }
            setFoCodeStep(true)
        } finally { setFoBusy(false) }
    }
    async function onForgotVerify(){
        setFoError('')
        if(!/^\d{6}$/.test(foOtp.trim())){ setFoError(t.forgotInvalidCode); return }
        setFoBusy(true)
        try {
            const { error } = await sb.auth.verifyOtp({ email: foEmail.trim(), token: foOtp.trim(), type: 'email' })
            if(error) setFoError(error.message)
        } finally { setFoBusy(false) }
    }

    async function onDiscord(){
        setDiscordBusy(true)
        try {
            const redirectTo = typeof window !== 'undefined' ? window.location.href : undefined
            const { error } = await sb.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo } })
            if(error){ setDiscordBusy(false); alert(error.message) }
            // On success, browser navigates to Discord. After return, Supabase
            // detectSessionInUrl picks up the tokens and onAuthStateChange fires.
        } catch (e: any) { setDiscordBusy(false); alert(e?.message || String(e)) }
    }

    const tabBtnCls = (active: boolean) => `flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition ${
        active ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-600/30' : 'text-gray-400 hover:text-white'
    }`
    const inputCls = 'w-full px-4 py-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-white placeholder-gray-500 focus:border-brand-400 focus:bg-brand-500/15 focus:outline-none transition'
    const primaryCls = 'btn-glow w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-brand-600/30 disabled:opacity-50 disabled:pointer-events-none'

    return (
        <div class="space-y-4">
            {pane !== 'forgot' && (
                <div class="flex gap-1 p-1 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                    <button type="button" onClick={() => setPane('signin')} class={tabBtnCls(pane === 'signin')}>{t.tabSignIn}</button>
                    <button type="button" onClick={() => setPane('signup')} class={tabBtnCls(pane === 'signup')}>{t.tabSignUp}</button>
                </div>
            )}

            {pane === 'signin' && (
                <form onSubmit={onSignIn} class="space-y-3">
                    <label class="block">
                        <span class="text-xs font-medium text-gray-400 mb-1.5 block">{t.emailLabel}</span>
                        <input type="email" required value={siEmail} onInput={(e)=>setSiEmail((e.target as HTMLInputElement).value)} class={inputCls} placeholder="you@example.com" />
                    </label>
                    <label class="block">
                        <span class="text-xs font-medium text-gray-400 mb-1.5 block">{t.passwordLabel}</span>
                        <input type="password" required minLength={6} value={siPassword} onInput={(e)=>setSiPassword((e.target as HTMLInputElement).value)} class={inputCls} placeholder="••••••" />
                    </label>
                    <p class="text-xs text-rose-400 min-h-[1rem]">{siError}</p>
                    <button type="submit" disabled={siBusy} class={primaryCls}>{t.signInSubmit}</button>
                    <button type="button" onClick={()=>{ setFoEmail(siEmail); setFoCodeStep(false); setFoOtp(''); setFoError(''); setPane('forgot') }} class="block mx-auto text-xs text-brand-400 hover:text-brand-300 hover:underline">{t.forgotPassword}</button>
                </form>
            )}

            {pane === 'signup' && (
                <form onSubmit={onSignUp} class="space-y-3">
                    <label class="block">
                        <span class="text-xs font-medium text-gray-400 mb-1.5 block">{t.emailLabel}</span>
                        <input type="email" required value={suEmail} onInput={(e)=>setSuEmail((e.target as HTMLInputElement).value)} class={inputCls} placeholder="you@example.com" />
                    </label>
                    <label class="block">
                        <span class="text-xs font-medium text-gray-400 mb-1.5 block">{t.passwordLabel}</span>
                        <input type="password" required minLength={6} value={suPassword} onInput={(e)=>setSuPassword((e.target as HTMLInputElement).value)} class={inputCls} placeholder="6+" />
                    </label>
                    <label class="block">
                        <span class="text-xs font-medium text-gray-400 mb-1.5 block">{t.nicknameLabel}</span>
                        <input type="text" required minLength={3} maxLength={16} pattern="[a-zA-Z0-9_]{3,16}" value={suNick} onInput={(e)=>setSuNick((e.target as HTMLInputElement).value)} class={inputCls} placeholder={t.setNickPlaceholder} style="font-family:ui-monospace,SFMono-Regular,monospace" />
                    </label>
                    <p class="text-xs text-rose-400 min-h-[1rem]">{suError}</p>
                    <button type="submit" disabled={suBusy} class={primaryCls}>{t.signUpSubmit}</button>
                </form>
            )}

            {pane === 'forgot' && (
                <div class="space-y-3">
                    <p class="text-xs text-gray-400 text-center leading-relaxed">{t.forgotIntro}</p>
                    <label class="block">
                        <span class="text-xs font-medium text-gray-400 mb-1.5 block">{t.emailLabel}</span>
                        <input type="email" required disabled={foCodeStep} value={foEmail} onInput={(e)=>setFoEmail((e.target as HTMLInputElement).value)} class={inputCls} placeholder="you@example.com" />
                    </label>
                    {!foCodeStep ? (
                        <button type="button" onClick={onForgotSend} disabled={foBusy} class={primaryCls}>{t.forgotSendCode}</button>
                    ) : (
                        <div class="space-y-3 pt-3 border-t border-brand-500/20">
                            <p class="text-xs text-gray-400 text-center">{t.forgotCodeSent} <strong class="text-brand-300 font-mono">{foEmail}</strong></p>
                            <label class="block">
                                <span class="text-xs font-medium text-gray-400 mb-1.5 block">{t.forgotCodeLabel}</span>
                                <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={foOtp} onInput={(e)=>setFoOtp((e.target as HTMLInputElement).value)} class={inputCls + ' text-center font-mono text-lg tracking-[0.4em]'} placeholder="123456" />
                            </label>
                            <button type="button" onClick={onForgotVerify} disabled={foBusy} class={primaryCls}>{t.forgotVerify}</button>
                            <button type="button" onClick={onForgotSend} class="block mx-auto text-xs text-brand-400 hover:text-brand-300">{t.forgotResend}</button>
                        </div>
                    )}
                    <p class="text-xs text-rose-400 min-h-[1rem]">{foError}</p>
                    <button type="button" onClick={()=>setPane('signin')} class="block mx-auto text-xs text-gray-400 hover:text-gray-200 hover:underline">{t.forgotBack}</button>
                </div>
            )}

            {pane !== 'forgot' && (
                <>
                    <div class="flex items-center gap-3 my-4">
                        <div class="flex-1 h-px bg-brand-500/20" />
                        <span class="text-xs text-gray-500 uppercase tracking-wider">{t.orDivider}</span>
                        <div class="flex-1 h-px bg-brand-500/20" />
                    </div>
                    <button type="button" onClick={onDiscord} disabled={discordBusy} class="w-full inline-flex items-center justify-center gap-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-[#5865F2]/20 disabled:opacity-50 disabled:pointer-events-none">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
                        <span>{t.signInDiscord}</span>
                    </button>
                </>
            )}
        </div>
    )
}

function Modal({ children, onClose }: { children: any; onClose: () => void }) {
    function onBackdrop(e: MouseEvent) {
        if (e.target === e.currentTarget) onClose()
    }
    if (typeof document === 'undefined') return null
    // Portal to <body> so the modal escapes any ancestor that creates a new
    // containing block (backdrop-filter, transform, will-change). Otherwise
    // a `glass`-styled navbar traps the fixed-position backdrop and the
    // modal flies up into the navbar instead of centering on the viewport.
    return createPortal(
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
        </div>,
        document.body,
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
}: { sb: SupabaseClient; user: User; t: T; onSaved: (n: string) => void }) {
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

function Welcome({ nick, t, onContinue }: { nick: string; t: T; onContinue: () => void }) {
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
