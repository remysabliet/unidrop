import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    plugins: [svgr(), react()],
    extends: './vitest.config.base.ts',
    test: {
      name: 'client',
      environment: 'jsdom',
      globalSetup: ['./configs/tests/client/global-client-test-setup.ts'],
      setupFiles: ['./configs/tests/client/vitest-client-setup.ts'],
      include: ['src/client/**/*.test.ts', 'src/client/**/*.test.tsx'],
    },
  }, {
    extends: './vitest.config.base.ts',
    test: {
      name: 'server',
      environment: 'node',
      globalSetup: ['./configs/tests/server/global-server-test-setup.ts'],
      setupFiles: ['./configs/tests/server/vitest-server-setup.ts'],
      include: ['src/server/**/*.test.ts', 'src/server/**/*.test.tsx', 'src/server/**/*.spec.ts'],
      poolOptions: {
        threads: {
          singleThread: true,
        },
      },
    },
  },
])
