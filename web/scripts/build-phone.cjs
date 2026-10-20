// web/scripts/build-phone.cjs
// Fully offline phone build: one HTML file per page, no server needed.
// Output: web/release/phone/index.html and ielts.html. Open them from disk.
// Each page is built alone (vite.phone.config.ts) so its JS is one chunk, then the JS, CSS
// and fonts are inlined. Does not run the content compiler, so no tracked JSON is rewritten.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WEB = path.join(__dirname, '..');
const OUT = path.join(WEB, 'release', 'phone');
const PAGES = ['index.html', 'ielts.html'];

const buildDir = page => path.join(WEB, 'release', 'phone-build', page.replace(/\.html$/, ''));
const readBuild = (page, rel) => fs.readFileSync(path.join(buildDir(page), rel), 'utf8');
const dataUri = (file, mime) => `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;

// A "</script" inside the bundle would end the inline tag early; escaping it keeps the same string value
const safeJs = js => js
  .replace(/\/\/# sourceMappingURL=.*$/gm, '')
  .replace(/<\/script/gi, '<\\/script');

const inlineFontUrls = (page, css) => css.replace(/url\(\.{1,2}\/fonts\/([^)]+)\)/g, (_, f) =>
  `url(${dataUri(path.join(buildDir(page), 'fonts', f), 'font/woff2')})`);

function inlinePage(page) {
  let html = readBuild(page, page);

  // JS bundle -> inline module script; it must be a single chunk with no imports of other files
  html = html.replace(/<script type="module"[^>]*src="\.\/([^"]+\.js)"[^>]*><\/script>/g, (_, p) => {
    const js = readBuild(page, p);
    if (/from ?"\.\/|import\("\.\//.test(js)) throw new Error(`${page}: ${p} still imports another chunk file`);
    return `<script type="module">${safeJs(js)}</script>`;
  });

  // CSS (bundle + fonts.css) -> inline style, fonts as data URIs
  html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/([^"]+\.css)"[^>]*\/?>/g,
    (_, p) => `<style>${inlineFontUrls(page, readBuild(page, p))}</style>`);

  // Links that only make sense on a server or the network
  html = html.replace(/<link rel="(modulepreload|preload|manifest|apple-touch-icon|preconnect)"[^>]*>\s*/g, '');
  html = html.replace(/<link rel="icon"[^>]*>/,
    `<link rel="icon" href="${dataUri(path.join(buildDir(page), 'icon.svg'), 'image/svg+xml')}" />`);

  // Nothing in a tag may still point at a file next to the page (anchors like ./ielts.html are fine:
  // both outputs sit in the same folder). Check the markup only, not the inlined code.
  const skeleton = html.replace(/<script type="module">[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '');
  const local = skeleton.match(/<(script|link|img)[^>]*\b(src|href)="\.\/[^"]*"/g) || [];
  if (local.length) throw new Error(`${page}: unresolved local references: ${local.join(', ')}`);
  return html;
}

fs.mkdirSync(OUT, { recursive: true });
for (const page of PAGES) {
  execSync('npx vite build --config vite.phone.config.ts', {
    cwd: WEB,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PHONE_PAGE: page },
  });
  const out = inlinePage(page);
  fs.writeFileSync(path.join(OUT, page), out, 'utf8');
  const remote = [...new Set(out.match(/https?:\/\/[^"'\s)<>]+/g) || [])];
  console.log(`[PHONE] ${page}: ${Math.round(out.length / 1024)} KB, remote-looking strings: ${remote.length}`);
  remote.forEach(u => console.log(`         ${u}`));
}
console.log(`[PHONE] done -> ${path.relative(WEB, OUT)}`);
