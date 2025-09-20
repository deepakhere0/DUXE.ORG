import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    open: false,
    host: true,
    cors: {
      origin: true, // Allow all origins
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Origin',
        'Content-Type', 
        'Accept',
        'Authorization',
        'X-Requested-With',
        'X-Auth-Token',
        'X-HTTP-Method-Override'
      ]
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  // Only include specific environment variables in production
  envPrefix: process.env.NODE_ENV === 'production' 
    ? ['VITE_FIREBASE_', 'VITE_USE_EMULATOR', 'VITE_DATACONNECT_']
    : ['VITE_']
})
