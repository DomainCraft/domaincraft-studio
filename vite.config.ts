import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.BASE_PATH || '/domaincraft-studio/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'react-vendor';
            }
            if (id.includes('@xyflow/react') || id.includes('reactflow')) {
              return 'reactflow';
            }
            if (id.includes('@monaco-editor/react') || id.includes('monaco-editor')) {
              return 'monaco';
            }
            if (id.includes('zustand')) {
              return 'state';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
})
