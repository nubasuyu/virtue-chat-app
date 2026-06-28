import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Adds Tailwind CSS v4 support
  ],
  server: {
    port: 3000, // Force Vite to run on port 3000
    proxy: {
      // Proxy API requests to the backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Proxy WebSocket requests to the backend
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true, 
        changeOrigin: true,
      }
    }
  }
})