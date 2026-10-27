import { defineConfig } from 'vite';
import { resolve } from 'path';

// PHONE_PAGE=index.html | ielts.html: one page built as a single chunk for scripts/build-phone.cjs.
// Unset: normal dev server and the two-page build.
const phonePage = process.env.PHONE_PAGE;

export default defineConfig(phonePage ? {
  root: '.',
  base: './',
  json: {
    stringify: true
  },
  build: {
    outDir: `release/phone-build/${phonePage.replace(/\.html$/, '')}`,
    emptyOutDir: true,
    // Older Android System WebView must run the bundle. Emulator (Android 11) ships WebView 83, so target chrome80
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
  root: '.',
  base: './',
  json: {
    stringify: true
  },
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 4000,
    sourcemap: process.env.SOURCEMAP === 'true',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ielts: resolve(__dirname, 'ielts.html')
      }
    }
  }
});
