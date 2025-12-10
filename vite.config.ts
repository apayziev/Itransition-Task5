import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/wy-mining-dashboard/', // GitHub Pages repo name
})
