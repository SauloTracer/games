import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import vuetify from './src/plugins/vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vuetify],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
