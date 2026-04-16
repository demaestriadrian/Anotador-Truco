/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import solidPlugin from 'vite-plugin-solid'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tsconfigPaths(), solidPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5500
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  css: {
    preprocessorOptions: {
      less: {
        math: 'always',
        relativeUrls: true,
        javascriptEnabled: true
      }
    }
  }
})
