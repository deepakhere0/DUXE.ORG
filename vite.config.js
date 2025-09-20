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
    sourcemap: false, // Disabled temporarily to reduce memory usage
    minify: 'esbuild', // Use esbuild for faster, less memory-intensive builds
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: ['mammoth', 'pdfjs-dist', 'html2canvas'], // Externalize heavy deps
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'heavy-deps': ['@tanstack/react-query', 'reactflow'],
        },
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
      },
    },
  },
  // Only include specific environment variables in production
  envPrefix: process.env.NODE_ENV === 'production' 
    ? ['VITE_FIREBASE_', 'VITE_USE_EMULATOR', 'VITE_DATACONNECT_']
    : ['VITE_']
})
