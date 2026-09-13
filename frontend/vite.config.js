import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/despensa/',
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
})
