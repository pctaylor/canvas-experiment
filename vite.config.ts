import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log('DEBUG: Loading Vite config');

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  logLevel: 'info',
  clearScreen: false
}) 