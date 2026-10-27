// web/scripts/build-phone.cjs
// Fully offline phone build: one HTML file per page, no server needed.
// Output: web/release/phone/index.html and ielts.html. Open them from disk.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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

  const skeleton = html.replace(/<script type="module">[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '');
  const local = skeleton.match(/<(script|link|img)[^>]*\b(src|href)="\.\/[^"]*"/g) || [];
  if (local.length) throw new Error(`${page}: unresolved local references: ${local.join(', ')}`);
  return html;
}

function getLatestMtime(target) {
  let latest = 0;
  if (!fs.existsSync(target)) return latest;
  const stat = fs.statSync(target);
  if (!stat.isDirectory()) return stat.mtimeMs;
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'release', '.git'].includes(entry.name)) continue;
      latest = Math.max(latest, getLatestMtime(full));
    } else {
      latest = Math.max(latest, fs.statSync(full).mtimeMs);
    }
  }
  return latest;
}

function isPhoneFresh() {
  if (process.argv.includes('--force')) return false;
  const p1 = path.join(OUT, 'index.html');
  const p2 = path.join(OUT, 'ielts.html');
  if (!fs.existsSync(p1) || !fs.existsSync(p2)) return false;
  const oldestOut = Math.min(fs.statSync(p1).mtimeMs, fs.statSync(p2).mtimeMs);

  const inputs = [
    path.join(WEB, 'src'),
    path.join(WEB, 'public'),
    path.join(WEB, 'index.html'),
    path.join(WEB, 'ielts.html'),
    path.join(WEB, 'vite.config.ts'),
    __filename
  ];
  const newestIn = Math.max(...inputs.map(getLatestMtime));
  return oldestOut > newestIn;
}

function runVite(page) {
  return new Promise((resolve, reject) => {
    const p = spawn('npx', ['vite', 'build'], {
      cwd: WEB,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PHONE_PAGE: page }
    });
    p.on('close', code => (code === 0 ? resolve() : reject(new Error(`${page} vite build exited with ${code}`))));
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  if (isPhoneFresh()) {
    console.log(`[PHONE] Up-to-date in 0.01s (cached -> ${path.relative(WEB, OUT)}, use --force to rebuild)`);
    return;
  }

  const t0 = Date.now();
  await Promise.all(PAGES.map(runVite));

  for (const page of PAGES) {
    const out = inlinePage(page);
    fs.writeFileSync(path.join(OUT, page), out, 'utf8');
    const remote = [...new Set(out.match(/https?:\/\/[^"'\s)<>]+/g) || [])];
    console.log(`[PHONE] ${page}: ${Math.round(out.length / 1024)} KB, remote-looking strings: ${remote.length}`);
  }
  console.log(`[PHONE] done in ${((Date.now() - t0) / 1000).toFixed(2)}s -> ${path.relative(WEB, OUT)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
