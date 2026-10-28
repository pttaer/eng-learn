const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'http://localhost:4173/';

function isServerListening(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.abort();
      resolve(false);
    });
  });
}

(async () => {
  let serverProcess = null;
  const isRunning = await isServerListening(TARGET_URL);

  if (!isRunning) {
    const viteBin = path.join(__dirname, '../node_modules/vite/bin/vite.js');
    serverProcess = spawn(process.execPath, [viteBin, 'preview', '--port', '4173', '--strictPort'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore'
    });

    let ready = false;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 250));
      if (await isServerListening(TARGET_URL)) {
        ready = true;
        break;
      }
    }
    if (!ready) {
      if (serverProcess) serverProcess.kill();
      throw new Error('Vite server failed to start');
    }
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    // 1. Capture iPhone 15 Pro (390 x 844)
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4173/#tree', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    await page.evaluate(() => {
      document.querySelectorAll('.placement-quiz-overlay, .placement-quiz-card, .app-toast, .notification-toast, .hud-toast, [class*="toast"]').forEach(el => el.remove());
    });

    const scroll15 = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      overflow: document.documentElement.scrollHeight - window.innerHeight
    }));
    console.log('iPhone 15 Pro check:', JSON.stringify(scroll15));

    const outBrain = 'C:/Users/Dell/.gemini/antigravity/brain/4f436827-4dcb-4d7e-97df-15edff2c1947/tree-grid-mobile.png';
    const outMobile = path.join(__dirname, '../../Mobile/1.0.0/01-mobile-constellation-tree.png');
    await page.screenshot({ path: outBrain });
    fs.copyFileSync(outBrain, outMobile);

    // 2. Capture iPhone 6 (375 x 667)
    const page6 = await browser.newPage();
    await page6.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
    await page6.evaluateOnNewDocument(() => {
      localStorage.setItem('eng_notifications_enabled', 'false');
      localStorage.setItem('eng_onboarding_completed', 'true');
      localStorage.setItem('eng_study_streak', '14');
      localStorage.setItem('STARK_ENG_STATE', JSON.stringify({ placementDone: true, learnerLevel: 'B2' }));
    });
    await page6.goto('http://localhost:4173/#tree', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    await page6.evaluate(() => {
      document.querySelectorAll('.placement-quiz-overlay, .placement-quiz-card, .app-toast, .notification-toast, .hud-toast, [class*="toast"]').forEach(el => el.remove());
    });

    const scroll6 = await page6.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasHorizOverflow: document.documentElement.scrollWidth > window.innerWidth
    }));
    console.log('iPhone 6 check:', JSON.stringify(scroll6));

    const outIphone6 = 'C:/Users/Dell/.gemini/antigravity/brain/4f436827-4dcb-4d7e-97df-15edff2c1947/iphone6-tree.png';
    await page6.screenshot({ path: outIphone6 });
    console.log('iPhone 6 screenshot saved to:', outIphone6);

    // Also scroll down on iPhone 6 to check bottom clearance
    await page6.evaluate(() => {
      const scrollEl = document.querySelector('.skill-tree-view') || document.documentElement;
      scrollEl.scrollTop = 300;
    });
    await new Promise(r => setTimeout(r, 400));
    const outIphone6Scrolled = 'C:/Users/Dell/.gemini/antigravity/brain/4f436827-4dcb-4d7e-97df-15edff2c1947/iphone6-tree-scrolled.png';
    await page6.screenshot({ path: outIphone6Scrolled });
    console.log('iPhone 6 scrolled screenshot saved to:', outIphone6Scrolled);
    console.log('Screenshots saved successfully!');
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
})();
