import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/nephrology-fellowship-scheduler/', // ← change if your repo has a different name
})
