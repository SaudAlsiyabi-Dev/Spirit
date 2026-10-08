import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Relative, so the built page works when opened straight off disk — which is
  // how a packaged desktop app loads it.
  base: './',
  build: { outDir: 'dist', assetsInlineLimit: 0 },
  server: { port: 5180, strictPort: true },
})
