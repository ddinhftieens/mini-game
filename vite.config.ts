import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/mini-game/', // Sử dụng relative path để dễ deploy lên Github Pages (hoặc custom repo path)
})
