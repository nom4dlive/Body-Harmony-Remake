import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/frontend/src'),
        '@components': path.resolve(__dirname, './src/frontend/src/components'),
        '@pages': path.resolve(__dirname, './src/frontend/src/pages'),
        '@assets': path.resolve(__dirname, './src/frontend/src/assets'),
        '@styles': path.resolve(__dirname, './src/frontend/src/styles'),
        '@context': path.resolve(__dirname, './src/frontend/src/context'),
        '@hooks': path.resolve(__dirname, './src/frontend/src/hooks'),
      },
    },
    build: {
      outDir: path.resolve(__dirname, './build/public_html'),
      emptyOutDir: false,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: {
            vendor: ['react', 'react-dom', 'styled-components', 'framer-motion']
          }
        }
      }
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: {
        clientPort: 5173,
      },
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://127.0.0.1:8080',
          changeOrigin: true,
          secure: false,
        },
      }
    }
  }
})


