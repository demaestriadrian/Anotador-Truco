import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import solidPlugin from 'vite-plugin-solid'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

// Rama y commit de la build. Cloudflare Pages no deja un `.git` utilizable en el contenedor de
// build, pero expone los datos por env; en local se leen de git. Si no responde ninguno de los
// dos (p. ej. un tarball sin git), queda 'desconocida' en vez de romper el build.
const desdeEnvOGit = (envVar: string, comando: string) => {
  const deEnv = process.env[envVar]
  if (deEnv) return deEnv
  try {
    return execSync(comando, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'desconocida'
  }
}

// Se inyecta con `define` (reemplazo literal en tiempo de build): la app no lee package.json ni
// ejecuta git en el navegador. Ver src/appVersion.ts.
const BUILD = {
  version: pkg.version as string,
  rama: desdeEnvOGit('CF_PAGES_BRANCH', 'git rev-parse --abbrev-ref HEAD'),
  commit: desdeEnvOGit('CF_PAGES_COMMIT_SHA', 'git rev-parse --short HEAD').slice(0, 7),
  compilado: new Date().toISOString()
}

export default defineConfig({
  define: {
    __APP_BUILD__: JSON.stringify(BUILD)
  },
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
