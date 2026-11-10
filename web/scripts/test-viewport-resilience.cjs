const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORT = 4216;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(DIST_DIR, reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const indexFallback = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(indexFallback)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(indexFallback).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    }
  });
}

async function runTest() {
  const server = createStaticServer();
  await new Promise(r => server.listen(PORT, r));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const testViewports = [
    { name: 'Small (320px - iPhone 5/SE1)', width: 320, height: 568 },
    { name: 'iPhone 6 Resilience (375x667)', width: 375, height: 667 },
    { name: 'Large Phone (412x915)', width: 412, height: 915 }
  ];

  const routes = ['#tree', '#read', '#write', '#blitz', '#cockpit', 'ielts.html#writing'];

  for (const vp of testViewports) {
    console.log(`\nTesting Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('singularity_locale', 'vi');
      localStorage.setItem('eng_locale', 'vi');
      localStorage.setItem('eng_onboarding_completed', 'true');
    });

    for (const route of routes) {
      const url = `http://localhost:${PORT}/${route}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
      await new Promise(r => setTimeout(r, 400));

      const overflow = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const bodyW = document.body.scrollWidth;
        const hasHorizontal = docW > winW || bodyW > winW;
        return { hasHorizontal, docW, winW, bodyW };
      });

      if (overflow.hasHorizontal) {
        console.error(`  ✗ [FAIL] ${route} has horizontal overflow! docW=${overflow.docW}, winW=${overflow.winW}, bodyW=${overflow.bodyW}`);
      } else {
        console.log(`  ✓ [PASS] ${route} cleanly fits width.`);
      }
    }
    await page.close();
  }

  await browser.close();
  server.close();
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
