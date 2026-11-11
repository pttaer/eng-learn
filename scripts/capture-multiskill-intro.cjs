const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require(path.resolve(__dirname, '../web/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.resolve(__dirname, '../web/dist');
const ARTIFACT_DIR = 'C:\\Users\\thanh\\.gemini\\antigravity\\brain\\260694ce-6483-44dd-b341-67525dada331';
const PORT = 4211;
const BASE_URL = `http://localhost:${PORT}/`;

const VIEWPORT = {
  width: 360,
  height: 803,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true
};

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
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
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Server listening on ${BASE_URL}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=360,803']
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  await page.evaluateOnNewDocument(() => {
    const state = {
      version: 5,
      learnerLevel: 'B2',
      skillLevels: { vocab: 'B2', grammar: 'C1', reading: 'B2', listening: 'B2', writing: 'B2', speaking: 'B2' },
      placementDone: true,
      onboardingCompleted: true,
      spotlightCompleted: true,
      theme: 'dark',
      locale: 'vi'
    };
    localStorage.setItem('STARK_ENG_STATE', JSON.stringify(state));
    localStorage.setItem('eng_theme', 'dark');
    localStorage.setItem('eng_onboarding_completed', 'true');
    localStorage.setItem('eng_spotlight_completed', 'true');
    localStorage.setItem('eng_placement_done', 'true');
    localStorage.setItem('eng_level', 'B2');
    localStorage.setItem('eng_locale', 'vi');
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    window.MultiSkillQuizModal?.open('quiz');
  });
  await new Promise(r => setTimeout(r, 600));

  const outPath = path.join(ARTIFACT_DIR, 'multiskill-assessment-intro.png');
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`Saved screenshot to: ${outPath}`);

  // Also update Mobile/vivo if dir exists
  const vivoDir = path.resolve(__dirname, '../Mobile/vivo/02-navigation-hud');
  if (fs.existsSync(vivoDir)) {
    const vivoPath = path.join(vivoDir, '06b-multiskill-assessment-intro-01-top.png');
    fs.copyFileSync(outPath, vivoPath);
    console.log(`Updated vivo audit screenshot at: ${vivoPath}`);
  }

  await browser.close();
  server.close();
  console.log('Done.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
