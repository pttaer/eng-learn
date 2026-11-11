const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require(path.resolve(__dirname, '../web/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.resolve(__dirname, '../web/dist');
const OUTPUT_DIR = path.resolve(__dirname, '../Mobile/vivo/02-navigation-hud');
const PORT = 4198;
const BASE_URL = `http://localhost:${PORT}/`;

const VIEWPORT = {
  width: 360,
  height: 803,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(DIST_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const indexFallback = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(indexFallback)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(indexFallback).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    }
  });
}

async function run() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Server running on ${BASE_URL}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=360,803'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('eng_theme', 'dark');
    localStorage.setItem('eng_onboarding_completed', 'true');
    localStorage.setItem('eng_spotlight_completed', 'true');
    localStorage.setItem('eng_placement_done', 'true');
    localStorage.setItem('eng_level', 'B2');
    localStorage.setItem('eng_locale', 'vi');
  });

  await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const app = window.__singularityApp;
    if (app && app.headerHud) {
      app.headerHud.openSettingsModal();
    }
  });

  await new Promise(r => setTimeout(r, 600));

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const topPath = path.join(OUTPUT_DIR, '04-settings-modal-01-top.png');
  await page.screenshot({ path: topPath, fullPage: false });
  console.log(`Saved screenshot to ${topPath}`);

  // Also scroll down inside modal body
  await page.evaluate(() => {
    const modalBody = document.querySelector('.settings-modal-body');
    if (modalBody) {
      modalBody.scrollTop = modalBody.scrollHeight;
    }
  });
  await new Promise(r => setTimeout(r, 400));

  const btmPath = path.join(OUTPUT_DIR, '04-settings-modal-02-scrolled.png');
  await page.screenshot({ path: btmPath, fullPage: false });
  console.log(`Saved scrolled screenshot to ${btmPath}`);

  // Check defects on settings modal
  const defects = await page.evaluate(() => {
    const modal = document.querySelector('.settings-modal-card');
    if (!modal) return ['Modal not found'];
    const issues = [];
    const rect = modal.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      issues.push(`Modal extends offscreen: right=${rect.right}, vw=${window.innerWidth}`);
    }
    const children = modal.querySelectorAll('*');
    for (const child of children) {
      const cRect = child.getBoundingClientRect();
      if (cRect.right > rect.right + 2) {
        issues.push(`Child extends outside card: tag=${child.tagName}, class=${child.className}, right=${cRect.right}, cardRight=${rect.right}`);
      }
    }
    return issues;
  });

  console.log('Defects check:', JSON.stringify(defects, null, 2));

  await browser.close();
  server.close();
}

run().catch(console.error);
