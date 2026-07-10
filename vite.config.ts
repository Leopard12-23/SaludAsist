import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    // jsdom simula el navegador (localStorage, sessionStorage) para
    // poder testear la lógica de cuentas y datos sin abrir un navegador real.
    environment: 'jsdom',
    globals: true,
  },
})
