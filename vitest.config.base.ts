import dotenv from 'dotenv';
import path from 'path'
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./configs/tests/test-setup.ts'],
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: 'C',
        replacement: path.resolve(__dirname, './src/client'),
      },
      {
        find: 'S',
        replacement: path.resolve(__dirname, './src/server'),
      },
      {
        find: /^assets\/.+\.svg(\?react)?$/,
        replacement: path.resolve(__dirname, './src/client/__mocks__/svg.tsx'),
      },
    ],
    clearMocks: true,
  },
})
