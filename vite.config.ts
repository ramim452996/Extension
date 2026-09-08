import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * Vite config for Manifest V3 Chrome Extension.
 *
 * Multiple entry points:
 *  - index.html       → dist/index.html (popup)
 *  - serviceWorker.ts → dist/background.js (MV3 service worker)
 *  - PageExtractor.ts → dist/content.js  (injected via scripting API)
 *
 * No eval, no inline scripts — fully MV3-compliant.
 */
export default defineConfig({
  plugins: [react()],

  // Resolve root-relative imports in popup HTML
  root: '.',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Disable source maps in prod for smaller bundle
    sourcemap: false,

    rollupOptions: {
      input: {
        // Popup SPA entry
        popup: resolve(__dirname, 'index.html'),
        // MV3 service worker (must be a single, standalone file)
        background: resolve(__dirname, 'src/background/serviceWorker.ts'),
        // Content / injector script (standalone, no shared chunks)
        content: resolve(__dirname, 'src/content/PageExtractor.ts'),
      },

      output: {
        /**
         * Named entries (background, content) go to dist root.
         * Popup JS chunks go to dist/assets/.
         */
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js'
          if (chunk.name === 'content') return 'content.js'
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
