import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'node:path'

// Two outputs:
//   `vite`        → dev server with src/main.tsx (demo + widget)
//   `vite build`  → library build of src/lib.tsx → dist/anubis-auth.js (single ES module,
//                   CSS inlined into the bundle so consumers only ship one <script>)
export default defineConfig(({ command }) => ({
    plugins: [preact()],
    resolve: {
        // @supabase/auth-ui-react ships React. Alias to Preact's compat layer
        // so the same component tree is rendered by the same renderer the
        // widget itself uses (one runtime, no React duplication).
        alias: {
            react: 'preact/compat',
            'react-dom': 'preact/compat',
            'react/jsx-runtime': 'preact/jsx-runtime',
        },
        dedupe: ['preact'],
    },
    define: {
        // Make sure NODE_ENV is statically replaced in vendor builds (some
        // packages key off it for prod-mode toggles).
        'process.env.NODE_ENV': JSON.stringify(command === 'build' ? 'production' : 'development'),
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/lib.tsx'),
            formats: ['es'],
            fileName: () => 'anubis-auth.js',
        },
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
            },
        },
        outDir: 'dist',
        emptyOutDir: true,
        target: 'es2022',
    },
}))
