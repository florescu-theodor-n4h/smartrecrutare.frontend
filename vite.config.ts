import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { transformSync } from '@babel/core'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // Run Babel transform during dev/test so Stage III decorators emit metadata.
    // This ensures Vitest/Vite transform pipeline applies the Stage‑III plugin.
    (function viteBabelPlugin() {
      return {
        name: 'vite:babel-stage3',
        enforce: 'pre',
        async transform(code: string, id: string) {
          if (/node_modules/.test(id)) return null

          // CRITICAL FIX: Only let Babel read raw script files or isolated script sections of Vue files
          const isScript = /\.(ts|js|tsx|jsx)$/.test(id)
          const isVueScript = id.includes('.vue') && id.includes('type=script')

          if (!isScript && !isVueScript) return null

          try {
            const res = transformSync(code, {
              filename: id,
              configFile: true, // Tells Babel to read your standalone babel.config.js
              babelrc: false,
              sourceMaps: true,
              sourceType: 'module',
            })

            if (res && res.code) {
              return { code: res.code, map: res.map || null }
            }
          } catch (err) {
            console.error('[vite:babel-stage3] transform error for', id, err)
            throw err
          }

          return null
        },
      }
    })(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
  },
})
