import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [tsconfigPaths(), solidPlugin()],
  server: {
    // Respeta la variable PORT si está definida (p. ej. tooling de preview); si no, usa 5500.
    port: Number(process.env.PORT) || 5500
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
