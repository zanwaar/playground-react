import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^tiptap-extension-word-page$/,
        replacement: fileURLToPath(new URL('../../packages/tiptap-extension-word-page/src/index.ts', import.meta.url)),
      },
      {
        find: 'tiptap-extension-word-page/style.css',
        replacement: fileURLToPath(new URL('../../packages/tiptap-extension-word-page/src/style.css', import.meta.url)),
      },
    ],
  },
  optimizeDeps: {
    exclude: ['tiptap-extension-word-page'],
  },
})
