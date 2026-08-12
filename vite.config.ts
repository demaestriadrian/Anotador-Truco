import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import solidPlugin from 'vite-plugin-solid'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    solidPlugin(),
    VitePWA({
      // El service worker nuevo toma control solo, sin preguntarle al usuario.
      registerType: 'autoUpdate',
      // `manifest.json` en vez del default `manifest.webmanifest`: Cloudflare Pages
      // garantiza servir `.json` como `application/json` (un JSON MIME valido para
      // el manifest) y manda `x-content-type-options: nosniff`, asi que conviene no
      // depender de que su tabla MIME reconozca la extension `.webmanifest`.
      manifestFilename: 'manifest.json',
      workbox: {
        // El default (js,css,html,ico,png,svg) dejaria afuera el paño y los sonidos.
        // Se excluye `ico` a proposito: public/img/favicon.ico pesa ~750 KB y no
        // tiene sentido precachearlo habiendo iconos SVG/PNG.
        globPatterns: ['**/*.{js,css,html,svg,png,webp,mp3,woff2}'],
        cleanupOutdatedCaches: true
      },
      // El SW solo se genera en build/preview, para no pelear con la cache en `pnpm dev`.
      devOptions: { enabled: false },
      manifest: {
        id: '/',
        name: 'Anotador de Truco',
        short_name: 'Truco',
        description: 'Anotador de fosforos para el Truco Argentino: arrastra y suelta para llevar el puntaje.',
        lang: 'es',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        // El tablero es 9/16 (ver src/ui/styles/scorekeeper.css)
        orientation: 'portrait',
        // Identico al background-color de `html` en index.css: evita el flash de barra
        theme_color: '#106138',
        background_color: '#106138',
        categories: ['games', 'utilities'],
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
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
