import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^tiptap-docs-kit$/,
        replacement: fileURLToPath(new URL('../../packages/tiptap-docs-kit/src/index.ts', import.meta.url)),
      },
      {
        find: 'tiptap-docs-kit/style.css',
        replacement: fileURLToPath(new URL('../../packages/tiptap-docs-kit/src/style.css', import.meta.url)),
      },
    ],
  },
  optimizeDeps: {
    exclude: ['tiptap-docs-kit'],
  },
})
