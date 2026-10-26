import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: {
      input: {
        observatorio: resolve('index.html'),
        ficha: resolve('ficha.html'),
        criacao: resolve('criacao.html')
      }
    }
  }
});
