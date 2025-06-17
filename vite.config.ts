import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/n8n': {
        target: 'https://a570-2a00-a041-e569-1e00-fc03-a411-513d-3bb9.ngrok-free.app',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/n8n/, ''),
        secure: false,
      }
    }
  }
})
