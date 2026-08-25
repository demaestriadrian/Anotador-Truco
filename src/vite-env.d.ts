// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite-plugin-pwa/client" />

// Identidad de la build, inyectada por el `define` de vite.config.ts (no existe en runtime:
// el bundler la reemplaza por el objeto literal). La consume src/appVersion.ts.
declare const __APP_BUILD__: {
  version: string      // la del package.json
  rama: string         // rama git (o CF_PAGES_BRANCH en Cloudflare Pages)
  commit: string       // hash corto
  compilado: string    // ISO de cuándo se compiló
}
