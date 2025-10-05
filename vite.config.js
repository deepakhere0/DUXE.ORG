import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    host: true, // Allow network access
    cors: {
      origin: '*', // Allow all origins
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['*'],
      exposedHeaders: ['*']
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disabled temporarily to reduce memory usage
    minify: 'esbuild', // Use esbuild for faster, less memory-intensive builds
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'heavy-deps': ['@tanstack/react-query', 'reactflow']
        },
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      }
    },
  },
  // Environment variable configuration
  envPrefix: ['VITE_'],
  define: {
    __DEV__: process.env.NODE_ENV !== 'production',
  }
})
