import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    open: false,
    host: true
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
