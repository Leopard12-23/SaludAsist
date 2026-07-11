import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  // En el deploy integrado este módulo vive en /vue/ dentro de la
  // contenedora (ver README "Deploy integrado"). En dev (`npm run dev`)
  // se sirve desde la raíz para poder trabajar en el módulo por separado.
  base: command === 'build' ? '/vue/' : '/',
  test: {
    // jsdom simula el navegador (localStorage, sessionStorage) para
    // poder testear la lógica de cuentas y datos sin abrir un navegador real.
    environment: 'jsdom',
    globals: true,
  },
}))
