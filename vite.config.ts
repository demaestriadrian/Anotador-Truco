import { defineConfig, Plugin } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * Plugin que, en modo "lit", reemplaza el index.html principal
 * para servir index-lit.html como punto de entrada en dev.
 */
function litEntryPlugin(): Plugin {
  return {
    name: 'vite-plugin-lit-entry',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          req.url = '/index-lit.html'
        }
        next()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const isLit = mode === 'lit'

  return {
    plugins: [
      tsconfigPaths(),
      // Solo cargar el plugin de React cuando NO estamos en modo Lit
      ...(!isLit ? [react()] : [litEntryPlugin()]),
    ],
    server: {
      port: 5500,
    },
    css: {
      preprocessorOptions: {
        less: {
          math: 'always',
          relativeUrls: true,
          javascriptEnabled: true,
        },
      },
    },
    // En modo Lit, usar index-lit.html como entry point para build
    ...(isLit && {
      build: {
        rollupOptions: {
          input: resolve(__dirname, 'index-lit.html'),
        },
      },
    }),
  }
})
