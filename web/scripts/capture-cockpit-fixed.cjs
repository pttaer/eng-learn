const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const TARGET_URL = 'http://localhost:4173/';
const CHROME_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function isServerListening(urlStr) {
  return new Promise(resolve => {
    const url = new URL(urlStr);
    const req = http.request({
      method: 'HEAD',
      host: url.hostname,
      port: url.port,
      path: url.pathname,
      timeout: 1000
    }, res => resolve(res.statusCode >= 200 && res.statusCode < 500));
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

(async () => {
  let serverProcess = null;
  const isListening = await isServerListening(TARGET_URL);
  if (!isListening) {
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
        console.log(`[SERVER] ✓ Vite preview server ready on ${TARGET_URL}`);
        break;
      }
    }
    if (!ready) {
      if (serverProcess) serverProcess.kill();
      throw new Error(`Timed out waiting for Vite preview server on ${TARGET_URL}`);
    }
  }

  const artifactDir = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\1a9d7002-bb96-43a2-a245-95546ee016da';
  const outDir = path.resolve(__dirname, '../screenshots/mobile');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('eng_locale', 'vi');
      localStorage.setItem('singularity_locale', 'vi');
      localStorage.setItem('eng_onboarding_completed', 'true');
      localStorage.setItem('singularity_notifications_enabled', 'false');
      localStorage.setItem('singularity_tour_completed', 'true');
      localStorage.setItem('singularity_last_prompt_date', new Date().toISOString().slice(0, 10));
      const todayStr = new Date().toISOString().slice(0, 10);
      const state = {
        version: 4,
        learnerLevel: 'B2',
        skillLevels: { vocab: 'B2', grammar: 'B2', reading: 'B2', listening: 'B2', writing: 'B2', speaking: 'B2' },
        placementDone: true,
        soundMuted: false,
        cardStates: {},
        streak: { currentStreak: 5, longestStreak: 12, lastActiveDate: todayStr },
        history: [],
        savedVocab: [],
        customCards: [],
        reviewQueue: [],
        grammarState: {},
        audioTuning: { autoTtsOnFlip: false, ttsRate: 0.9, ambientVolume: 0.2 },
        onboardingCompleted: true
      };
      localStorage.setItem('STARK_ENG_STATE', JSON.stringify(state));
      localStorage.setItem('singularity_state', JSON.stringify(state));
    });

    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

    // 1. Navigate to #cockpit
    await page.goto(`${TARGET_URL}#cockpit`, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.waitForSelector('.cd-test-hub-overlay', { timeout: 5000 });

    // Capture Hub Modal
    const hubPath = path.join(outDir, '01-cd-ielts-hub-modal.png');
    await page.screenshot({ path: hubPath });
    fs.copyFileSync(hubPath, path.join(artifactDir, '01-cd-ielts-hub-modal.png'));
    console.log('Saved 01-cd-ielts-hub-modal.png');

    // 2. Dismiss Hub Modal by clicking 'Xem trước đề thi'
    await page.evaluate(() => {
      // Remove any notification/streak toasts
      document.querySelectorAll('.apple-toast, .streak-alert-toast, .toast-notification, [role="alert"]').forEach(el => el.remove());
      const btn = document.querySelector('#btn-preview-exam-station') || document.querySelector('#btn-start-selected-exam');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Remove any post-render toasts before screenshot
    await page.evaluate(() => {
      document.querySelectorAll('.apple-toast, .streak-alert-toast, .toast-notification, [role="alert"]').forEach(el => el.remove());
    });

    // 3. Capture Exam Station
    const stationPath = path.join(outDir, '02-cd-ielts-exam-station.png');
    await page.screenshot({ path: stationPath });
    fs.copyFileSync(stationPath, path.join(artifactDir, '02-cd-ielts-exam-station.png'));
    console.log('Saved 02-cd-ielts-exam-station.png');

    const topbarDebug = await page.evaluate(() => {
      function getBox(el) {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height), text: el.innerText };
      }
      return {
        topBar: getBox(document.querySelector('.cd-top-bar')),
        topLeft: getBox(document.querySelector('.cd-top-left')),
        topCenter: getBox(document.querySelector('.cd-top-center')),
        topRight: getBox(document.querySelector('.cd-top-right')),
        btnHub: getBox(document.querySelector('#btn-open-test-hub')),
        timer: getBox(document.querySelector('.cd-timer-box')),
        btnStart: getBox(document.querySelector('#btn-start-exam-inline'))
      };
    });
    const btnStartStyles = await page.evaluate(() => {
      const btn = document.querySelector('#btn-start-exam-inline');
      if (!btn) return null;
      const s = window.getComputedStyle(btn);
      const parentS = window.getComputedStyle(btn.parentElement);
      return {
        pos: s.position,
        left: s.left,
        right: s.right,
        margin: s.margin,
        transform: s.transform,
        display: s.display,
        width: s.width,
        parentWidth: parentS.width,
        parentDisplay: parentS.display,
        parentGridCol: parentS.gridColumn,
        parentFlex: parentS.flex
      };
    });
    const gridDebug = await page.evaluate(() => {
      const topBar = document.querySelector('.cd-top-bar');
      const s = window.getComputedStyle(topBar);
      return {
        gridTemplateColumns: s.gridTemplateColumns,
        gap: s.gap,
        padding: s.padding,
        clientWidth: topBar.clientWidth,
        scrollWidth: topBar.scrollWidth
      };
    });
    const childrenDebug = await page.evaluate(() => {
      const topBar = document.querySelector('.cd-top-bar');
      return Array.from(topBar.children).map(c => ({
        tag: c.tagName,
        class: c.className,
        width: c.offsetWidth,
        rect: c.getBoundingClientRect()
      }));
    });
    const rulesDebug = await page.evaluate(() => {
      const el = document.querySelector('.cd-top-right');
      const s = window.getComputedStyle(el);
      return {
        width: s.width,
        minWidth: s.minWidth,
        maxWidth: s.maxWidth,
        flex: s.flex,
        justifySelf: s.justifySelf,
        alignSelf: s.alignSelf,
        overflow: s.overflow
      };
    });
    const nodesDebug = await page.evaluate(() => {
      const topBar = document.querySelector('.cd-top-bar');
      return Array.from(topBar.childNodes).map(n => ({
        nodeName: n.nodeName,
        nodeType: n.nodeType,
        text: n.textContent?.trim().slice(0, 20)
      }));
    });
    console.log('TOPBAR NODES:', JSON.stringify(nodesDebug, null, 2));

    // 4. Capture Bottom Bar Crop
    const bottomBarClip = await page.evaluate(() => {
      const bar = document.querySelector('.cd-bottom-bar');
      if (!bar) return null;
      const rect = bar.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      };
    });

    if (bottomBarClip) {
      const barPath = path.join(outDir, '03-cd-ielts-bottom-bar-crop.png');
      await page.screenshot({ path: barPath, clip: bottomBarClip });
      fs.copyFileSync(barPath, path.join(artifactDir, '03-cd-ielts-bottom-bar-crop.png'));
      console.log('Saved 03-cd-ielts-bottom-bar-crop.png');
    }

    console.log('All screenshots captured and copied successfully!');
  } finally {
    await browser.close();
    if (serverProcess) serverProcess.kill();
  }
})();
