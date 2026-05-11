import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          filters: ['./src/data/filters.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})