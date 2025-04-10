import react from '@vitejs/plugin-react';
import svgr from "vite-plugin-svgr";
import path from 'path';

import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svgr(), react()],
    test: {
        env: {
            NODE_ENV: 'test',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'assets': path.resolve(__dirname, './src/client/assets'),
            'C': path.resolve(__dirname, './src/client'),
            'S': path.resolve(__dirname, './src/server'),
        }
    }
});
