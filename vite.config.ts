/// <reference types="vitest/config" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts']
  },
  worker: {
    format: 'es'
  },
  server: {
    open: true
  },
  preview: {
    open: true
  }
})
