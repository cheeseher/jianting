import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      'path': 'path-browserify'
    }
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true,
    },
    cors: true,
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', '@element-plus/icons-vue', 'element-plus'],
  },
  css: {
    devSourcemap: true,
  }
}) 