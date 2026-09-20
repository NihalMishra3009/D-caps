import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: false,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('maplibre-gl') || id.includes('leaflet')) {
              return 'vendor-maps'
            }
            if (id.includes('@cloudscape-design')) {
              return 'vendor-cloudscape'
            }
            if (id.includes('@aws-amplify') || id.includes('aws-amplify')) {
              return 'vendor-amplify'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            if (
              id.includes('react-router-dom') ||
              id.includes('react-dom') ||
              id.includes('/react/')
            ) {
              return 'vendor-react'
            }
          }
        },
      },
    },
  },
})
