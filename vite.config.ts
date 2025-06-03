import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Base public path when served in development or production
    base: env.VITE_BASE_URL || '/',
    
    // Server configuration
    server: {
      port: 3000,
      strictPort: true, // Exit if port 3000 is in use
      cors: true,
      open: true,
      proxy: {
        // Proxy API requests to the backend
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    
    // Plugins to use
    plugins: [
      react(),
      
      // PWA support
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Strangers: After Hours',
          short_name: 'Strangers',
          description: 'A party game for meaningful connections',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
      
      // Visualize bundle size (only in report mode)
      mode === 'report' && visualizer({
        open: true,
        filename: 'dist/report.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    
    // Resolve options
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
        { find: '@/components', replacement: path.resolve(__dirname, './src/components') },
        { find: '@/pages', replacement: path.resolve(__dirname, './src/pages') },
        { find: '@/lib', replacement: path.resolve(__dirname, './src/lib') },
        { find: '@/styles', replacement: path.resolve(__dirname, './src/styles') },
        { find: '@/utils', replacement: path.resolve(__dirname, './src/utils') },
      ],
    },
    
    // Build options
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          },
        },
      },
    },
    
    // CSS options
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables";`,
        },
      },
    },
  };
});
