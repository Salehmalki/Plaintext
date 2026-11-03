import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'vite-entry-switcher',
        transformIndexHtml(html) {
          // Both in dev server and during build parsing, map assets/app.js to /src/main.tsx
          return html
            .replace(/<link\b[^>]*href=["'](?:\.\/|\/)?assets\/index\.css["'][^>]*\/?>/gi, '')
            .replace(
              /<script\b[^>]*src=["'](?:\.\/|\/)?assets\/app\.js["'][^>]*>.*?<\/script>/gis,
              '<script type="module" src="/src/main.tsx"></script>'
            );
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/app.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
