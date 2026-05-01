import { useEffect, useState, useRef } from 'preact/hooks'
import { createPortal } from 'preact/compat'
import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js'

type Locale = 'en' | 'ru' | 'uk' | 'de' | 'pl'
type T = ReturnType<typeof copyFor>

const COPY: Record<Locale, Record<string, string>> = {
    en: {
        login: 'Login',
        logout: 'Logout',
        startTitle: 'Sign in to Anubis World',
        startSubtitle: 'Choose how you\'d like to continue',
        continueWithEmail: 'Continue with email',
        back: 'Back',
        tabSignIn: 'Sign In', tabSignUp: 'Sign Up',
        emailLabel: 'Email', passwordLabel: 'Password', nicknameLabel: 'Minecraft nickname',
        signInSubmit: 'Sign in', signUpSubmit: 'Create account',
        forgotPassword: 'Forgot password?',
        forgotIntro: 'Enter your email — we\'ll send a one-time code to sign you in (no password needed).',
        forgotSendCode: 'Send code', forgotCodeSent: 'Code sent to', forgotCodeLabel: 'One-time code',
        forgotVerify: 'Verify and sign in', forgotResend: 'Resend code', forgotBack: 'Back to sign in',
        forgotEmailFirst: 'Enter your email first', forgotInvalidCode: 'Code must be 6-8 digits',
        forgotResetLink: 'Or send password reset link instead',
        forgotResetSent: 'Reset link sent to your inbox',
        needNickname: 'No nickname on this account yet — set one below',
        nickFormatErr: 'Nick 3-16 chars: letters, digits, underscore', nickTakenErr: 'This nickname is already taken',
        orDivider: 'or', signInDiscord: 'Sign in with Discord',
        setNickTitle: 'Choose your Minecraft nickname',
        setNickHint: 'This name will be shown in-game. It cannot be changed later.',
        setNickPlaceholder: 'Steve_99', setNickSubmit: 'Save',
        welcome: 'Welcome!', welcomeYourNick: 'Your nickname:', welcomeContinue: 'Continue',
        welcomeOpenLauncher: 'Open launcher', welcomeOpenLauncherHint: 'Already installed? Jump straight to the game.',
        resetTitle: 'Set a new password', resetHint: 'You\'re signed in via the recovery link. Choose a new password to use next time.',
        newPasswordLabel: 'New password', confirmPasswordLabel: 'Confirm password',
        resetSubmit: 'Update password',
        passwordTooShort: 'Password must be at least 6 characters',
        passwordMismatch: 'Passwords don\'t match',
    },
    ru: {
        login: 'Войти', logout: 'Выйти',
        startTitle: 'Вход в Anubis World',
        startSubtitle: 'Выбери способ авторизации',
        continueWithEmail: 'Продолжить через email',
        back: 'Назад',
        tabSignIn: 'Вход', tabSignUp: 'Регистрация',
        emailLabel: 'Email', passwordLabel: 'Пароль', nicknameLabel: 'Никнейм в Minecraft',
        signInSubmit: 'Войти', signUpSubmit: 'Создать аккаунт',
        forgotPassword: 'Забыли пароль?',
        forgotIntro: 'Введи свой email — мы отправим одноразовый код для входа (пароль не нужен).',
        forgotSendCode: 'Отправить код', forgotCodeSent: 'Код отправлен на', forgotCodeLabel: 'Одноразовый код',
        forgotVerify: 'Проверить и войти', forgotResend: 'Отправить код заново', forgotBack: 'Назад к входу',
        forgotEmailFirst: 'Сначала введите email', forgotInvalidCode: 'Код должен быть 6-8 цифр',
        forgotResetLink: 'Или отправить ссылку для сброса пароля',
        forgotResetSent: 'Ссылка для сброса отправлена',
        needNickname: 'У аккаунта ещё нет ника — выбери ниже',
        nickFormatErr: 'Ник 3-16 символов: латиница, цифры, _', nickTakenErr: 'Этот ник уже занят',
        orDivider: 'или', signInDiscord: 'Войти через Discord',
        setNickTitle: 'Выбери ник для Minecraft',
        setNickHint: 'Этот ник будет отображаться в игре. Изменить позже нельзя.',
        setNickPlaceholder: 'Steve_99', setNickSubmit: 'Сохранить',
        welcome: 'Добро пожаловать!', welcomeYourNick: 'Твой ник:', welcomeContinue: 'Продолжить',
        welcomeOpenLauncher: 'Открыть лаунчер', welcomeOpenLauncherHint: 'Уже установлен? Запусти и зайди в игру.',
        resetTitle: 'Установи новый пароль', resetHint: 'Ты вошёл по recovery-ссылке. Выбери новый пароль для входа в следующий раз.',
        newPasswordLabel: 'Новый пароль', confirmPasswordLabel: 'Подтверди пароль',
        resetSubmit: 'Обновить пароль',
        passwordTooShort: 'Пароль должен быть минимум 6 символов',
        passwordMismatch: 'Пароли не совпадают',
    },
    uk: {
        login: 'Увійти', logout: 'Вийти',
        startTitle: 'Вхід до Anubis World',
        startSubtitle: 'Обери спосіб авторизації',
        continueWithEmail: 'Продовжити через email',
        back: 'Назад',
        tabSignIn: 'Вхід', tabSignUp: 'Реєстрація',
        emailLabel: 'Email', passwordLabel: 'Пароль', nicknameLabel: 'Нікнейм у Minecraft',
        signInSubmit: 'Увійти', signUpSubmit: 'Створити акаунт',
        forgotPassword: 'Забули пароль?',
        forgotIntro: 'Введи свій email — ми надішлемо одноразовий код для входу (пароль не потрібен).',
        forgotSendCode: 'Надіслати код', forgotCodeSent: 'Код надіслано на', forgotCodeLabel: 'Одноразовий код',
        forgotVerify: 'Перевірити та увійти', forgotResend: 'Надіслати код повторно', forgotBack: 'Назад до входу',
        forgotEmailFirst: 'Спочатку вкажи email', forgotInvalidCode: 'Код має містити 6-8 цифр',
        forgotResetLink: 'Або надіслати посилання для скидання пароля',
        forgotResetSent: 'Посилання для скидання надіслано',
        needNickname: 'У акаунта ще нема ніка — обери нижче',
        nickFormatErr: 'Нік 3-16 символів: латиниця, цифри, _', nickTakenErr: 'Цей нік вже зайнято',
        orDivider: 'або', signInDiscord: 'Увійти через Discord',
        setNickTitle: 'Обери нік для Minecraft',
        setNickHint: 'Цей нік буде відображатися у грі. Змінити пізніше не можна.',
        setNickPlaceholder: 'Steve_99', setNickSubmit: 'Зберегти',
        welcome: 'Ласкаво просимо!', welcomeYourNick: 'Твій нік:', welcomeContinue: 'Продовжити',
        welcomeOpenLauncher: 'Відкрити лаунчер', welcomeOpenLauncherHint: 'Вже встановлено? Запусти та заходь у гру.',
        resetTitle: 'Встанови новий пароль', resetHint: 'Ти увійшов через recovery-посилання. Обери новий пароль для наступного входу.',
        newPasswordLabel: 'Новий пароль', confirmPasswordLabel: 'Підтверди пароль',
        resetSubmit: 'Оновити пароль',
        passwordTooShort: 'Пароль має бути мінімум 6 символів',
        passwordMismatch: 'Паролі не співпадають',
    },
    de: {
        login: 'Anmelden', logout: 'Abmelden',
        startTitle: 'Anmeldung bei Anubis World',
        startSubtitle: 'Wähle, wie du fortfahren möchtest',
        continueWithEmail: 'Weiter mit E-Mail',
        back: 'Zurück',
        tabSignIn: 'Anmeldung', tabSignUp: 'Registrierung',
        emailLabel: 'E-Mail', passwordLabel: 'Passwort', nicknameLabel: 'Minecraft-Nickname',
        signInSubmit: 'Anmelden', signUpSubmit: 'Konto erstellen',
        forgotPassword: 'Passwort vergessen?',
        forgotIntro: 'Gib deine E-Mail ein — wir senden dir einen einmaligen Code (kein Passwort nötig).',
        forgotSendCode: 'Code senden', forgotCodeSent: 'Code gesendet an', forgotCodeLabel: 'Einmal-Code',
        forgotVerify: 'Bestätigen und anmelden', forgotResend: 'Code erneut senden', forgotBack: 'Zurück zur Anmeldung',
        forgotEmailFirst: 'Bitte zuerst E-Mail eingeben', forgotInvalidCode: 'Der Code muss 6-8 Ziffern enthalten',
        forgotResetLink: 'Oder Link zum Zurücksetzen senden',
        forgotResetSent: 'Reset-Link gesendet',
        needNickname: 'Dieses Konto hat noch keinen Nick — wähle unten einen',
        nickFormatErr: 'Nick 3-16 Zeichen: Buchstaben, Ziffern, _', nickTakenErr: 'Dieser Nickname ist bereits vergeben',
        orDivider: 'oder', signInDiscord: 'Mit Discord anmelden',
        setNickTitle: 'Wähle deinen Minecraft-Nickname',
        setNickHint: 'Dieser Name wird im Spiel angezeigt. Kann später nicht geändert werden.',
        setNickPlaceholder: 'Steve_99', setNickSubmit: 'Speichern',
        welcome: 'Willkommen!', welcomeYourNick: 'Dein Nickname:', welcomeContinue: 'Weiter',
        welcomeOpenLauncher: 'Launcher öffnen', welcomeOpenLauncherHint: 'Schon installiert? Direkt ins Spiel springen.',
        resetTitle: 'Neues Passwort festlegen', resetHint: 'Du bist über den Recovery-Link angemeldet. Wähle ein neues Passwort für die nächste Anmeldung.',
        newPasswordLabel: 'Neues Passwort', confirmPasswordLabel: 'Passwort bestätigen',
        resetSubmit: 'Passwort aktualisieren',
        passwordTooShort: 'Passwort muss mindestens 6 Zeichen haben',
        passwordMismatch: 'Passwörter stimmen nicht überein',
    },
    pl: {
        login: 'Zaloguj', logout: 'Wyloguj',
        startTitle: 'Zaloguj do Anubis World',
        startSubtitle: 'Wybierz sposób logowania',
        continueWithEmail: 'Kontynuuj z e-mailem',
        back: 'Wstecz',
        tabSignIn: 'Logowanie', tabSignUp: 'Rejestracja',
        emailLabel: 'Email', passwordLabel: 'Hasło', nicknameLabel: 'Nick w Minecraft',
        signInSubmit: 'Zaloguj', signUpSubmit: 'Utwórz konto',
        forgotPassword: 'Zapomniałeś hasła?',
        forgotIntro: 'Wpisz swój email — wyślemy jednorazowy kod (hasło nie jest potrzebne).',
        forgotSendCode: 'Wyślij kod', forgotCodeSent: 'Kod wysłany na', forgotCodeLabel: 'Kod jednorazowy',
        forgotVerify: 'Zweryfikuj i zaloguj', forgotResend: 'Wyślij kod ponownie', forgotBack: 'Wstecz',
        forgotEmailFirst: 'Najpierw wpisz email', forgotInvalidCode: 'Kod musi mieć 6-8 cyfr',
        forgotResetLink: 'Lub wyślij link do resetu hasła',
        forgotResetSent: 'Link do resetu został wysłany',
        needNickname: 'To konto nie ma jeszcze nicka — wybierz poniżej',
        nickFormatErr: 'Nick 3-16 znaków: litery, cyfry, _', nickTakenErr: 'Ten nick jest już zajęty',
        orDivider: 'lub', signInDiscord: 'Zaloguj przez Discord',
        setNickTitle: 'Wybierz swój nick w Minecraft',
        setNickHint: 'Ta nazwa będzie wyświetlana w grze. Nie można jej później zmienić.',
        setNickPlaceholder: 'Steve_99', setNickSubmit: 'Zapisz',
        welcome: 'Witaj!', welcomeYourNick: 'Twój nick:', welcomeContinue: 'Kontynuuj',
        welcomeOpenLauncher: 'Otwórz launcher', welcomeOpenLauncherHint: 'Już zainstalowany? Skacz prosto do gry.',
        resetTitle: 'Ustaw nowe hasło', resetHint: 'Zalogowałeś się przez link recovery. Wybierz nowe hasło na następne logowanie.',
        newPasswordLabel: 'Nowe hasło', confirmPasswordLabel: 'Potwierdź hasło',
        resetSubmit: 'Aktualizuj hasło',
        passwordTooShort: 'Hasło musi mieć co najmniej 6 znaków',
        passwordMismatch: 'Hasła nie zgadzają się',
    },
}

function copyFor(lang?: string){
    const code = ((lang || 'en').slice(0, 2).toLowerCase()) as Locale
    return code in COPY ? COPY[code] : COPY.en
}

// Drop the hash before handing the URL to Supabase — otherwise its appended
// `#access_token=…` doubles up into `##access_token=…` and the redirect
// returns the user to a URL the JS auth client can't parse.
function cleanUrl(): string | undefined {
    if (typeof window === 'undefined') return undefined
    return window.location.origin + window.location.pathname + window.location.search
}

interface Props {
    supabaseUrl?: string
    supabaseKey?: string
    lang?: string
    /** Custom URL scheme registered by the desktop launcher (default: anubisworld). */
    launcherProtocol?: string
    /**
     * `web` (default) — full UI with trigger button, profile pill, "Open launcher" button.
     * `launcher` — embedded inside the desktop launcher: form-only (no trigger button,
     *   no profile pill), Discord hidden (browser redirect won't work in renderer),
     *   dispatches `anubis-auth-success` event with session/nick once authed so the
     *   parent can finalize. The host is responsible for unmounting / hiding the widget.
     */
    mode?: 'web' | 'launcher'
}

const NICK_RE = /^[a-zA-Z0-9_]{3,16}$/

type Stage = 'start' | 'email' | 'forgot'

export function AuthWidget({ supabaseUrl, supabaseKey, lang, launcherProtocol, mode }: Props) {
    const t = copyFor(lang)
    const launcherScheme = (launcherProtocol || 'anubisworld').replace(/[^a-z0-9-]/gi, '')
    const inLauncher = mode === 'launcher'

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
    // In launcher mode the modal is the entire UI — keep it permanently open
    // so the embedding host gets a static auth surface (it controls dismissal
    // by unmounting the widget after `anubis-auth-success`).
    const [open, setOpen] = useState(inLauncher)
    const [view, setView] = useState<'auth' | 'setnick' | 'welcome' | 'reset-password'>('auth')
    const [menuOpen, setMenuOpen] = useState(false)
    // Track which (user, nick) pair we've already announced so we don't spam
    // `anubis-auth-success` on every re-render or session refresh tick.
    const successFiredRef = useRef<string>('')
    // Tracks whether the modal was OPEN at the moment a SIGNED_IN event
    // fired — used to decide between "show Welcome" (fresh interactive
    // sign-in) and "do nothing" (silent restore from localStorage on load).
    const openRef = useRef(false)
    useEffect(() => { openRef.current = open }, [open])

    function emit(detail: { user: User | null; nick: string | null }) {
        document.dispatchEvent(new CustomEvent('auth-changed', { detail, bubbles: true, composed: true }))
    }

    // Fire once when the user is fully authed (session + minecraft nickname
    // resolved). The desktop launcher listens for this to call its own
    // `finishAuth` flow and dismiss the widget. Web hosts can listen too,
    // but for them `auth-changed` is usually enough.
    useEffect(() => {
        if (!session?.user || !nick) { successFiredRef.current = ''; return }
        const key = `${session.user.id}:${nick}`
        if (successFiredRef.current === key) return
        successFiredRef.current = key
        document.dispatchEvent(new CustomEvent('anubis-auth-success', {
            detail: {
                userId: session.user.id,
                email: session.user.email ?? null,
                nick,
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
            },
            bubbles: true,
            composed: true,
        }))
    }, [session?.user?.id, nick])

    async function loadProfile(user: User | null, opts: { freshSignIn?: boolean } = {}) {
        if (!sb || !user) { setNick(null); emit({ user: null, nick: null }); return }
        const { data } = await sb.from('profiles').select('minecraft_nick').eq('id', user.id).maybeSingle()
        if (data?.minecraft_nick) {
            setNick(data.minecraft_nick)
            emit({ user, nick: data.minecraft_nick })
            // If the user just authed through the modal, hand them off to
            // the Welcome pane so they can see the "Open launcher" button.
            // Otherwise (silent session restore on page load) leave the
            // current view alone.
            if (opts.freshSignIn && openRef.current) {
                setView('welcome')
            }
        } else {
            setNick(null)
            setView('setnick')
            setOpen(true)
            emit({ user, nick: null })
        }
    }

    useEffect(() => {
        if (!sb) { setLoading(false); return }
        const { data: sub } = sb.auth.onAuthStateChange((event, sess) => {
            setSession(sess)
            setLoading(false)
            // PASSWORD_RECOVERY fires when the user follows a recovery link
            // from email — Supabase auto-parses the URL hash, sets a session
            // in 'recovery' mode, and emits this event. We intercept it to
            // surface the "set new password" form before treating them as
            // signed in.
            if (event === 'PASSWORD_RECOVERY') {
                setView('reset-password')
                setOpen(true)
                return
            }
            loadProfile(sess?.user ?? null, { freshSignIn: event === 'SIGNED_IN' })
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

    // In launcher mode the widget renders only the form surface (no trigger
    // button, no profile pill). Once the user is fully authed and has a nick
    // the host listens for `anubis-auth-success` and unmounts us.
    const triggerSurface = inLauncher ? null : (
        loading ? (
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
                openLauncherLabel={t.welcomeOpenLauncher}
                launcherScheme={launcherScheme}
                onOpenLauncher={() => {
                    setMenuOpen(false)
                    window.location.href = `${launcherScheme}://signed-in?nick=${encodeURIComponent(nick)}`
                }}
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
        )
    )

    // Wrap root in `.aw-scope` so all Tailwind utility classes — scoped to
    // this ancestor by `important: '.aw-scope'` in tailwind.config.js —
    // actually apply. Without the wrapper our compiled CSS would generate
    // `.aw-scope .hidden { ... }` rules that match nothing.
    return (
        <div class="aw-scope">
            {triggerSurface}

            {open && (
                <Modal onClose={() => setOpen(false)} embedded={inLauncher}>
                    {view === 'auth' && <AuthForm sb={sb} t={t} inLauncher={inLauncher} supabaseUrl={supabaseUrl ?? ''} />}
                    {view === 'setnick' && session && (
                        <SetNickForm
                            sb={sb}
                            user={session.user}
                            t={t}
                            onSaved={(savedNick) => { setNick(savedNick); setView('welcome'); emit({ user: session.user, nick: savedNick }) }}
                        />
                    )}
                    {view === 'welcome' && nick && !inLauncher && (
                        <Welcome nick={nick} t={t} launcherScheme={launcherScheme} onContinue={() => setOpen(false)} />
                    )}
                    {/* In launcher mode: show a brief "signing in…" placeholder
                        — `anubis-auth-success` fires immediately and the host
                        does `switchView`, but until that callback runs we want
                        an obviously-non-empty surface (otherwise the modal
                        flashes blank between OTP success and the host swap). */}
                    {view === 'welcome' && nick && inLauncher && (
                        <div class="flex flex-col items-center gap-3 py-6">
                            <div class="w-8 h-8 rounded-full border-2 border-brand-500/30 border-t-brand-400 animate-spin" />
                            <p class="text-sm text-gray-400">{t.welcome} <span class="font-mono text-brand-300">{nick}</span></p>
                        </div>
                    )}
                    {view === 'reset-password' && (
                        <ResetPasswordForm
                            sb={sb}
                            t={t}
                            onDone={async () => {
                                // After password update we want to land on the
                                // Welcome pane (with the Open Launcher button)
                                // — but only once we know the nickname. If
                                // the recovered account already has one, hop
                                // straight to welcome; otherwise drop into
                                // setnick first so the user picks one.
                                if (!session?.user) { setOpen(false); return }
                                const { data } = await sb.from('profiles').select('minecraft_nick').eq('id', session.user.id).maybeSingle()
                                if (data?.minecraft_nick) {
                                    setNick(data.minecraft_nick)
                                    setView('welcome')
                                } else {
                                    setView('setnick')
                                }
                            }}
                        />
                    )}
                </Modal>
            )}
        </div>
    )
}

function AuthForm({ sb, t, inLauncher, supabaseUrl }: { sb: SupabaseClient; t: T; inLauncher: boolean; supabaseUrl: string }){
    const [stage, setStage] = useState<Stage>('start')
    const [pane, setPane] = useState<'signin' | 'signup'>('signin')

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
            const { error } = await sb.auth.signInWithOtp({
                email: foEmail.trim(),
                options: {
                    shouldCreateUser: false,
                    // Pin the magic-link redirect to the current page WITHOUT
                    // its hash. Including the hash ends with `…/#` going into
                    // Supabase, and after it appends `#access_token=…` the
                    // user lands at `…/##access_token=…` — supabase-js's
                    // URLSearchParams parser then misses the keys and the
                    // session is silently dropped.
                    emailRedirectTo: cleanUrl(),
                },
            })
            if(error){ setFoError(error.message); return }
            setFoCodeStep(true)
        } finally { setFoBusy(false) }
    }
    async function onForgotVerify(){
        setFoError('')
        if(!/^\d{6,8}$/.test(foOtp.trim())){ setFoError(t.forgotInvalidCode); return }
        setFoBusy(true)
        try {
            const { error } = await sb.auth.verifyOtp({ email: foEmail.trim(), token: foOtp.trim(), type: 'email' })
            if(error) setFoError(error.message)
        } finally { setFoBusy(false) }
    }

    // Alternative path: real password-reset email (Supabase resetPasswordForEmail).
    // The link returns the user to this same URL with #access_token=&type=recovery,
    // detectSessionInUrl picks it up, the PASSWORD_RECOVERY listener flips us into
    // the reset-password form. Useful when the user can't read the OTP email but
    // can still click a link.
    async function onForgotResetLink(){
        setFoError('')
        if(!foEmail.trim()){ setFoError(t.forgotEmailFirst); return }
        setFoBusy(true)
        try {
            const { error } = await sb.auth.resetPasswordForEmail(foEmail.trim(), {
                redirectTo: cleanUrl(),
            })
            if(error){ setFoError(error.message); return }
            setFoError(t.forgotResetSent)
        } finally { setFoBusy(false) }
    }

    async function onDiscord(){
        setDiscordBusy(true)
        try {
            if (inLauncher) {
                // Browser redirects don't work inside the Electron renderer
                // — the launcher (`loginOptions.js`) intercepts via the
                // `discord-auth-open` IPC, opens a child BrowserWindow that
                // hosts the OAuth round-trip, and hands back the tokens.
                // We hand it the Supabase OAuth URL through a CustomEvent
                // and wait for it to call `onTokens(tokens)` once done.
                const { data, error } = await sb.auth.signInWithOAuth({
                    provider: 'discord',
                    options: {
                        skipBrowserRedirect: true,
                        // Supabase still requires a redirectTo it can return
                        // to after the provider — the embedded BrowserWindow
                        // intercepts that URL before any page loads.
                        redirectTo: `${supabaseUrl}/auth/v1/callback`,
                    },
                })
                if (error || !data?.url) { setDiscordBusy(false); alert(error?.message || 'Discord OAuth init failed'); return }
                document.dispatchEvent(new CustomEvent('anubis-auth-discord-request', {
                    detail: {
                        url: data.url,
                        onTokens: async (tokens: { access_token: string; refresh_token: string } | null) => {
                            try {
                                if (!tokens) { setDiscordBusy(false); return }
                                const { error: setErr } = await sb.auth.setSession(tokens)
                                if (setErr) alert(setErr.message)
                            } finally { setDiscordBusy(false) }
                        },
                        onError: (msg: string) => { setDiscordBusy(false); alert(msg || 'Discord auth failed') },
                    },
                    bubbles: true,
                    composed: true,
                }))
                return
            }
            const { error } = await sb.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: cleanUrl() } })
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

    const BackBtn = ({ onClick }: { onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            class="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition -ml-1 px-2 py-1 rounded-md hover:bg-brand-500/10"
        >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{t.back}</span>
        </button>
    )

    if (stage === 'start') {
        return (
            <div class="space-y-5">
                <div class="text-center space-y-1.5">
                    <div class="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
                         style="background:linear-gradient(135deg,#7c3aed,#a855f7);box-shadow:0 10px 30px rgba(124,58,237,0.4)">
                        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zM3 21h18v-2c0-2.76-2.24-5-5-5h-1l-1 2-1-2H8c-2.76 0-5 2.24-5 5v2zM7 7a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-white">{t.startTitle}</h3>
                    <p class="text-xs text-gray-400">{t.startSubtitle}</p>
                </div>

                <button
                    type="button"
                    onClick={onDiscord}
                    disabled={discordBusy}
                    class="w-full inline-flex items-center justify-center gap-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-[#5865F2]/20 disabled:opacity-50 disabled:pointer-events-none"
                >
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
                    <span>{t.signInDiscord}</span>
                </button>

                <div class="flex items-center gap-3">
                    <div class="flex-1 h-px bg-brand-500/20" />
                    <span class="text-[10px] text-gray-500 uppercase tracking-wider">{t.orDivider}</span>
                    <div class="flex-1 h-px bg-brand-500/20" />
                </div>

                <button
                    type="button"
                    onClick={() => setStage('email')}
                    class="w-full inline-flex items-center justify-center gap-2.5 bg-brand-500/10 hover:bg-brand-500/15 border border-brand-500/30 hover:border-brand-400/50 text-white font-semibold px-6 py-3 rounded-xl transition"
                >
                    <svg class="w-5 h-5 text-brand-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{t.continueWithEmail}</span>
                </button>
            </div>
        )
    }

    if (stage === 'forgot') {
        return (
            <div class="space-y-3">
                <BackBtn onClick={() => setStage('email')} />
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
                            <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={8} pattern="[0-9]{6,8}" value={foOtp} onInput={(e)=>setFoOtp((e.target as HTMLInputElement).value)} class={inputCls + ' text-center font-mono text-lg tracking-[0.4em]'} placeholder="12345678" />
                        </label>
                        <button type="button" onClick={onForgotVerify} disabled={foBusy} class={primaryCls}>{t.forgotVerify}</button>
                        <button type="button" onClick={onForgotSend} class="block mx-auto text-xs text-brand-400 hover:text-brand-300">{t.forgotResend}</button>
                    </div>
                )}
                <p class="text-xs text-rose-400 min-h-[1rem]">{foError}</p>
                <button
                    type="button"
                    onClick={onForgotResetLink}
                    disabled={foBusy}
                    class="block mx-auto text-xs text-brand-400 hover:text-brand-300 hover:underline disabled:opacity-50"
                >
                    {t.forgotResetLink}
                </button>
            </div>
        )
    }

    // stage === 'email'
    return (
        <div class="space-y-4">
            <BackBtn onClick={() => setStage('start')} />

            <div class="flex gap-1 p-1 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                <button type="button" onClick={() => setPane('signin')} class={tabBtnCls(pane === 'signin')}>{t.tabSignIn}</button>
                <button type="button" onClick={() => setPane('signup')} class={tabBtnCls(pane === 'signup')}>{t.tabSignUp}</button>
            </div>

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
                    <button type="button" onClick={()=>{ setFoEmail(siEmail); setFoCodeStep(false); setFoOtp(''); setFoError(''); setStage('forgot') }} class="block mx-auto text-xs text-brand-400 hover:text-brand-300 hover:underline">{t.forgotPassword}</button>
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
        </div>
    )
}

function Modal({ children, onClose, embedded }: { children: any; onClose: () => void; embedded?: boolean }) {
    function onBackdrop(e: MouseEvent) {
        if (e.target === e.currentTarget) onClose()
    }
    if (typeof document === 'undefined') return null

    // Embedded (launcher) mode: render inline, no portal/backdrop/close —
    // the host already provides framing and there's nothing to dismiss.
    if (embedded) {
        return (
            <div class="aw-modal-card glass rounded-2xl p-7 w-full max-w-[440px] mx-auto">
                {children}
            </div>
        )
    }

    // Portal to <body> so the modal escapes any ancestor that creates a new
    // containing block (backdrop-filter, transform, will-change). Otherwise
    // a `glass`-styled navbar traps the fixed-position backdrop and the
    // modal flies up into the navbar instead of centering on the viewport.
    // Outer `.aw-scope` wrapper lets our scoped Tailwind utilities apply
    // even though the portal lives outside <anubis-auth>.
    return createPortal(
        <div class="aw-scope">
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
        </div>,
        document.body,
    )
}

function ProfilePill({
    nick, open, onToggle, onLogout, logoutLabel,
    onOpenLauncher, openLauncherLabel, launcherScheme,
}: {
    nick: string; open: boolean;
    onToggle: () => void; onLogout: () => void; logoutLabel: string;
    onOpenLauncher: () => void; openLauncherLabel: string; launcherScheme: string;
}) {
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
                <div class="absolute right-0 top-full mt-1 glass rounded-xl py-1 min-w-[180px] z-10">
                    <a
                        href={`${launcherScheme}://signed-in?nick=${encodeURIComponent(nick)}`}
                        onClick={(e) => { e.preventDefault(); onOpenLauncher() }}
                        class="w-full flex items-center gap-2 px-4 py-2 text-sm text-brand-300 hover:text-brand-200 hover:bg-brand-500/10 transition cursor-pointer"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14 3l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        {openLauncherLabel}
                    </a>
                    <div class="my-1 mx-2 h-px bg-brand-500/15"></div>
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

function ResetPasswordForm({ sb, t, onDone }: { sb: SupabaseClient; t: T; onDone: () => void }) {
    const [pwd1, setPwd1] = useState('')
    const [pwd2, setPwd2] = useState('')
    const [err, setErr] = useState('')
    const [busy, setBusy] = useState(false)

    async function submit(e: Event) {
        e.preventDefault()
        setErr('')
        if (pwd1.length < 6) { setErr(t.passwordTooShort); return }
        if (pwd1 !== pwd2) { setErr(t.passwordMismatch); return }
        setBusy(true)
        const { error } = await sb.auth.updateUser({ password: pwd1 })
        setBusy(false)
        if (error) { setErr(error.message); return }
        // Strip the `#access_token=...&type=recovery` fragment Supabase left in
        // the URL so a refresh doesn't re-trigger PASSWORD_RECOVERY.
        if (typeof history !== 'undefined' && history.replaceState) {
            history.replaceState(null, '', window.location.pathname + window.location.search)
        }
        onDone()
    }

    const inputCls = 'w-full px-4 py-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-white placeholder-gray-500 focus:border-brand-400 focus:bg-brand-500/15 focus:outline-none transition'

    return (
        <form onSubmit={submit} class="space-y-4">
            <div class="flex items-center justify-center mb-2">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m0 4a9 9 0 110-18 9 9 0 010 18zM7.5 11V7a4.5 4.5 0 119 0v4" />
                    </svg>
                </div>
            </div>
            <h3 class="text-lg font-bold text-white text-center">{t.resetTitle}</h3>
            <p class="text-xs text-gray-400 text-center leading-relaxed">{t.resetHint}</p>
            <label class="block">
                <span class="text-xs font-medium text-gray-400 mb-1.5 block">{t.newPasswordLabel}</span>
                <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={pwd1}
                    onInput={(e) => setPwd1((e.target as HTMLInputElement).value)}
                    class={inputCls}
                    placeholder="6+"
                />
            </label>
            <label class="block">
                <span class="text-xs font-medium text-gray-400 mb-1.5 block">{t.confirmPasswordLabel}</span>
                <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={pwd2}
                    onInput={(e) => setPwd2((e.target as HTMLInputElement).value)}
                    class={inputCls}
                    placeholder="6+"
                />
            </label>
            <p class="text-xs text-rose-400 min-h-[1rem]">{err}</p>
            <button
                type="submit"
                disabled={busy}
                class="btn-glow w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-brand-600/30 disabled:opacity-50 disabled:pointer-events-none"
            >
                {t.resetSubmit}
            </button>
        </form>
    )
}

function Welcome({ nick, t, launcherScheme, onContinue }: { nick: string; t: T; launcherScheme: string; onContinue: () => void }) {
    function openLauncher(){
        // Triggers the OS's protocol handler. If the launcher is installed
        // it pops to focus; if not, the browser silently does nothing — no
        // error UI for us to handle. Add `?nick=` so the launcher could
        // route to a specific screen (login already auto-restores from
        // localStorage, so this is informational for now).
        window.location.href = `${launcherScheme}://signed-in?nick=${encodeURIComponent(nick)}`
    }
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
                onClick={openLauncher}
                class="btn-glow w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-brand-600/30"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 3l7 7m0 0l-7 7m7-7H3" /></svg>
                <span>{t.welcomeOpenLauncher}</span>
            </button>
            <p class="text-[10px] text-gray-500">{t.welcomeOpenLauncherHint}</p>
            <button
                type="button"
                onClick={onContinue}
                class="text-xs text-gray-400 hover:text-gray-200 hover:underline"
            >
                {t.welcomeContinue}
            </button>
        </div>
    )
}
