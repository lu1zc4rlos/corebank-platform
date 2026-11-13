import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Em desenvolvimento, /api é encaminhado para o Spring Boot (evita CORS).
// Para apontar para outro servidor, defina VITE_PROXY_TARGET.
const target = process.env.VITE_PROXY_TARGET || 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target, changeOrigin: true } },
  },
})
