import { defineConfig } from 'vite';
import { resolve } from 'path';

const phonePage = process.env.PHONE_PAGE;
const appTarget = process.env.APP_TARGET; // 'singularity' | 'ielts' | undefined

const shared = { root: '.', base: './', json: { stringify: true } };

const inputMap: Record<string, string> = {
  singularity: resolve(__dirname, 'index.html'),
  ielts:       resolve(__dirname, 'ielts.html'),
};

export default defineConfig(phonePage ? {
  ...shared,
  build: {
    outDir: `release/phone-build/${phonePage.replace(/\.html$/, '')}`,
    emptyOutDir: true,
    target: ['es2020', 'chrome80'],
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      input: resolve(__dirname, phonePage),
      output: { inlineDynamicImports: true },
    },
  },
} : {
  ...shared,
  server: { port: 3000, open: false },
  build: {
    outDir: appTarget ? `dist/${appTarget}` : 'dist',
    target: 'esnext',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 4000,
    sourcemap: process.env.SOURCEMAP === 'true',
    rollupOptions: {
      input: appTarget
        ? inputMap[appTarget]
        : { main: inputMap.singularity, ielts: inputMap.ielts },
    },
  },
});
