import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    plugins: [svgr(), react()],
    extends: './vitest.config.base.ts',
    test: {
      name: 'frontend',
      environment: 'jsdom',
      globalSetup: ['./configs/tests/client/global-client-test-setup.ts'],
      setupFiles: ['./configs/tests/client/vitest-client-setup.ts'],
      include: ['src/client/**/*.test.ts', 'src/client/**/*.test.tsx'],
    },
  },
])
