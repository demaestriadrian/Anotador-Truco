import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5500
  },
  css: {
    preprocessorOptions: {
      less: {
        math: "always",
        relativeUrls: true,
        javascriptEnabled: true,
        rootpath: "./src/view"
      },
    }
  }

})