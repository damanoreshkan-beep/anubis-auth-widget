# anubis-auth-widget

Embeddable auth widget for the AnubisWorld site and launcher. One Web Component, one bundle, one source of truth — used by both the static partner site and the Electron launcher.

## What it does

Renders a single login button. After sign-in (email + password or Discord OAuth via Supabase) it switches to a profile pill with the user's Minecraft nickname + logout. New users without a nickname yet get a "set nickname" form.

The Minecraft nickname is the identifier that ends up in-game — same account, same nick on the website and in the launcher.

## Usage

```html
<script type="module" src="https://damanoreshkan-beep.github.io/anubis-auth-widget/anubis-auth.js"></script>

<anubis-auth
    supabase-url="https://ckfinpywlpllvhvzagnw.supabase.co"
    supabase-key="sb_publishable_..."
    lang="uk">
</anubis-auth>
```

Listen for auth state from the host page:

```js
document.addEventListener('auth-changed', (e) => {
    const { user, nick } = e.detail
    // user = Supabase user object | null
    // nick = string | null (null = signed in but no minecraft_nick yet)
})
```

Supported `lang` values: `en`, `ru`, `uk`, `de`, `pl`. Defaults to `en`.

## Architecture

- **Preact 10** + `preact-custom-element` registers the `<anubis-auth>` Custom Element.
- **`@supabase/auth-ui-react`** with a brand-themed `ThemeSupa` provides the email + Discord OAuth UI inside the modal.
- **`react` → `preact/compat`** alias keeps the bundle small (one renderer instead of React + Preact).
- **Light DOM** (no Shadow DOM): the Auth UI uses Stitches CSS-in-JS which can't reach into a shadow root, and the host pages share the same Tailwind palette anyway — so the widget reads as part of the design system rather than an isolated capsule.
- **Tailwind** with `corePlugins.preflight: false` ships only the utility classes the widget actually uses, keeping the host's `<body>` reset untouched.
- Single-file ES module output (`dist/anubis-auth.js`) with CSS inlined via `?inline` import.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173 — embeds the widget on a demo page
```

The demo defaults to the production Supabase project; override locally with a `.env` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=sb_publishable_...
```

## Build & deploy

```bash
npm run build    # → dist/anubis-auth.js (single ES module, CSS inlined)
```

CI builds on push to `main` and deploys `dist/` to GitHub Pages.

## Database schema (Supabase)

```sql
create table public.profiles (
    id uuid primary key references auth.users on delete cascade,
    minecraft_nick text unique,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.profiles
    add constraint nick_format
    check (minecraft_nick is null or minecraft_nick ~ '^[a-zA-Z0-9_]{3,16}$');

alter table public.profiles enable row level security;

create policy "read all"   on public.profiles for select using (true);
create policy "update own" on public.profiles for update using ((select auth.uid()) = id);
create policy "insert own" on public.profiles for insert with check ((select auth.uid()) = id);
```

## License

MIT
