// Phone build: one entry page per run, all JS in one chunk so it can be inlined into a single HTML file.
// Used by scripts/build-phone.cjs (PHONE_PAGE=index.html | ielts.html). Normal dev/build still uses vite.config.ts.
import { defineConfig } from 'vite';
import { resolve } from 'path';

const page = process.env.PHONE_PAGE ?? 'index.html';
const outName = page.replace(/\.html$/, '');

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: `release/phone-build/${outName}`,
    emptyOutDir: true,
    // Older Android System WebView must run the bundle. Emulator (Android 11) ships WebView 83, so target chrome80
    target: ['es2020', 'chrome80'],
    sourcemap: false,
    rollupOptions: {
      input: resolve(__dirname, page),
      output: { inlineDynamicImports: true },
    },
  },
});
