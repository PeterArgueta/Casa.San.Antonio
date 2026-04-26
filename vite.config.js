import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Casa.San.Antonio/',  // ← el nombre exacto de tu repo
})