import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared')
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    hmr: {
      overlay: false, // Disable the HMR overlay to prevent the error message
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
