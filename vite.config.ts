import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API_PROXY_PREFIX = '/argos-api'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      [API_PROXY_PREFIX]: {
        target: 'https://api.argos.o-r.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(API_PROXY_PREFIX, ''),
      },
    },
  },
})
