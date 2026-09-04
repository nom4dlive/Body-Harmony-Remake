import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/frontend/test/setup.js',
        include: ['src/frontend/test/**/*.{test,spec}.{js,jsx,ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/frontend/test/',
                '**/*.config.js',
                '**/dist/**'
            ]
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src/frontend/src')
        }
    }
});
