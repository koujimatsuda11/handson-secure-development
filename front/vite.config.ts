/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Docker対応
    port: 5173,
    proxy: {
      // APIリクエストをbackendコンテナにプロキシ（同一オリジン化）
      '/api': {
        target: 'http://app:3000',
        changeOrigin: true,
        secure: false,
      },
      // Cognito emulator(Magnito)を同一オリジン化する。
      // Codespacesでは 5050 の転送URLが5173と別オリジンになるため、ブラウザ直アクセスを避ける。
      '/cognito': {
        target: 'http://magnito:5050',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cognito/, ''),
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/__test__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
