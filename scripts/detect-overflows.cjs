const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../web/node_modules/puppeteer-core'));
const fs = require('fs');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.resolve(__dirname, '../web/dist');
const PORT = 4199;
const BASE_URL = `http://localhost:${PORT}/`;

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
  '.ttf': 'font/ttf'
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

async function checkCurrentViewOverflow(page, viewName) {
  return await page.evaluate((name) => {
    const results = [];
    const vw = window.innerWidth;
    if (document.documentElement.scrollWidth > vw) {
      results.push({
        type: 'DOC_HORIZONTAL_OVERFLOW',
        detail: `document.scrollWidth (${document.documentElement.scrollWidth}px) > viewport (${vw}px)`
      });
    }

    function hasScrollableAncestor(elem) {
      if (elem.closest && elem.closest('.hud-scroll-affordance-wrapper, .table-scroll-wrapper, .lexicon-table-scroll-wrapper, .table-scroll-wrap, table, .lexicon-table, tr, td, th')) return true;
      let curr = elem.parentElement || elem.parentNode;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        if (curr.classList && (curr.classList.contains('lexicon-table-scroll-wrapper') || curr.classList.contains('hud-scroll-affordance-wrapper') || curr.tagName === 'TABLE')) return true;
        const s = window.getComputedStyle(curr);
        if (s.overflowX === 'auto' || s.overflowX === 'scroll' || s.overflow === 'auto' || s.overflow === 'scroll') return true;
        curr = curr.parentElement || curr.parentNode;
      }
      return false;
    }

    const allEls = document.querySelectorAll('*');
    for (const el of allEls) {
      if (!el || el.offsetParent === null) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const style = window.getComputedStyle(el);

      const isHorizScroll = (style.overflowX === 'auto' || style.overflowX === 'scroll' || el.classList.contains('track') || el.classList.contains('tabs'));
      if (rect.right > vw + 2 && !isHorizScroll && !hasScrollableAncestor(el)) {
        results.push({
          type: 'ELEMENT_EXTENDS_OFFSCREEN',
          tag: el.tagName,
          class: el.className,
          rectRight: Math.round(rect.right),
          vw,
          text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50)
        });
      }

      const hasEllipsis = style.textOverflow === 'ellipsis';
      if (hasEllipsis && el.scrollWidth > el.clientWidth + 2 && !hasScrollableAncestor(el)) {
        const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (text.length > 5) {
          results.push({
            type: 'TEXT_TRUNCATED_OR_CLIPPED',
            tag: el.tagName,
            class: el.className,
            scrollW: el.scrollWidth,
            clientW: el.clientWidth,
            text: text.slice(0, 80)
          });
        }
      }

      if (style.overflowX === 'visible' && el.parentElement && !hasScrollableAncestor(el)) {
        const pRect = el.parentElement.getBoundingClientRect();
        if (rect.right > pRect.right + 4 && pRect.width > 0) {
          const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
          if (text.length > 5) {
            results.push({
              type: 'TEXT_BLEEDING_OUT_OF_PARENT',
              tag: el.tagName,
              class: el.className,
              parentTag: el.parentElement.tagName,
              parentClass: el.parentElement.className,
              diff: Math.round(rect.right - pRect.right),
              text
            });
          }
        }
      }
    }
    return results;
  }, viewName);
}

async function run() {
  const server = createStaticServer();
  await new Promise(r => server.listen(PORT, r));
  console.log(`Server listening at ${BASE_URL}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=360,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('STARK_ENG_STATE', JSON.stringify({
      version: 5,
      learnerLevel: 'B2',
      placementDone: true,
      cardStates: {},
      totalCardsReviewed: 10,
      streak: { currentStreak: 5, lastActiveDate: new Date().toISOString() },
      history: []
    }));
    localStorage.setItem('eng_onboarding_completed', 'true');
    localStorage.setItem('eng_theme', 'dark');
    localStorage.setItem('eng_locale', 'vi');
  });

  const routes = [
    'tree', 'read', 'write', 'listen', 'speak', 'vocab', 'colloc', 'grammar',
    'tenses', 'habits', 'blitz', 'mediate', 'drills', 'analytics', 'cockpit', 'settings'
  ];

  console.log('\n=== SCANNING ALL 16 MAIN APP ROUTES (360px VIEWPORT) ===\n');

  for (const route of routes) {
    await page.goto(`${BASE_URL}#${route}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 350));
    const issues = await checkCurrentViewOverflow(page, route);
    if (issues.length > 0) {
      console.log(`[ROUTE #${route}] Found ${issues.length} overflow issues:`);
      for (const i of issues.slice(0, 5)) console.log(`  - ${i.type}: ${i.text || i.detail}`);
    } else {
      console.log(`[ROUTE #${route}] ✓ ZERO OVERFLOWS`);
    }
  }

  console.log('\n=== SCANNING ALL 9 IELTS APP ROUTES (ielts.html, 360px VIEWPORT) ===\n');
  const ieltsRoutes = ['home', 'diagnostic', 'reading', 'listening', 'writing', 'speaking', 'vocab', 'strategy', 'mock'];
  for (const ir of ieltsRoutes) {
    await page.goto(`${BASE_URL}ielts.html#${ir}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 350));
    const issues = await checkCurrentViewOverflow(page, ir);
    if (issues.length > 0) {
      console.log(`[IELTS #${ir}] Found ${issues.length} overflow issues:`);
      for (const i of issues.slice(0, 5)) console.log(`  - ${i.type}: ${i.text || i.detail}`);
    } else {
      console.log(`[IELTS #${ir}] ✓ ZERO OVERFLOWS`);
    }
  }

  console.log('\n=== TESTING MODALS & INTERACTIVE FLOWS (360px VIEWPORT) ===\n');

  // 1. Placement Quiz Modal
  await page.goto(`${BASE_URL}#placement`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  let issues = await checkCurrentViewOverflow(page, 'Placement Quiz (Intro)');
  console.log(`[PLACEMENT INTRO] ${issues.length === 0 ? '✓ ZERO OVERFLOWS' : issues.length + ' issues'}`);
  for (const i of issues) console.log('  -', i.type, i.text || i.detail);

  // Start Placement Quiz
  await page.evaluate(() => {
    document.querySelector('.btn-start-placement')?.click();
  });
  await new Promise(r => setTimeout(r, 400));
  issues = await checkCurrentViewOverflow(page, 'Placement Quiz (Question 1)');
  console.log(`[PLACEMENT Q1] ${issues.length === 0 ? '✓ ZERO OVERFLOWS' : issues.length + ' issues'}`);
  for (const i of issues) console.log('  -', i.type, i.text || i.detail);
  await page.evaluate(() => {
    document.querySelector('.btn-close-placement')?.click() || document.getElementById('placement-modal')?.remove();
  });

  // 2. Progression Modal
  await page.evaluate(() => {
    (window).ProgressionModal?.open();
  });
  await new Promise(r => setTimeout(r, 400));
  issues = await checkCurrentViewOverflow(page, 'Progression Modal');
  console.log(`[PROGRESSION MODAL] ${issues.length === 0 ? '✓ ZERO OVERFLOWS' : issues.length + ' issues'}`);
  for (const i of issues) console.log('  -', i.type, i.text || i.detail);
  await page.evaluate(() => {
    document.querySelector('#progression-modal .btn-modal-close')?.click() || document.getElementById('progression-modal')?.remove();
  });

  // 3. MultiSkillQuizModal (Celestial Radar)
  await page.evaluate(() => {
    (window).MultiSkillQuizModal?.open('radar');
  });
  await new Promise(r => setTimeout(r, 400));
  issues = await checkCurrentViewOverflow(page, 'Celestial Radar Modal');
  console.log(`[RADAR MODAL] ${issues.length === 0 ? '✓ ZERO OVERFLOWS' : issues.length + ' issues'}`);
  for (const i of issues) console.log('  -', i.type, i.text || i.detail);
  await page.evaluate(() => {
    document.querySelector('#multi-skill-quiz-modal .btn-close-quiz')?.click() || document.getElementById('multi-skill-quiz-modal')?.remove();
  });

  // 4. Mistake Vault
  await page.evaluate(() => {
    (window).MistakeVault?.open();
  });
  await new Promise(r => setTimeout(r, 400));
  issues = await checkCurrentViewOverflow(page, 'Mistake Vault Modal');
  console.log(`[MISTAKE VAULT] ${issues.length === 0 ? '✓ ZERO OVERFLOWS' : issues.length + ' issues'}`);
  for (const i of issues) console.log('  -', i.type, i.text || i.detail);
  await page.evaluate(() => {
    document.querySelector('#mistake-vault-modal .vault-btn-close')?.click() || document.getElementById('mistake-vault-modal')?.remove();
  });

  // 5. Commute Audio Player
  await page.evaluate(() => {
    (window).CommuteAudioPlayer?.open();
  });
  await new Promise(r => setTimeout(r, 400));
  issues = await checkCurrentViewOverflow(page, 'Commute Audio Player Modal');
  console.log(`[COMMUTE AUDIO] ${issues.length === 0 ? '✓ ZERO OVERFLOWS' : issues.length + ' issues'}`);
  for (const i of issues) console.log('  -', i.type, i.text || i.detail);
  await page.evaluate(() => {
    document.querySelector('#commute-audio-modal .commute-btn-close')?.click() || document.getElementById('commute-audio-modal')?.remove();
  });

  // 6. Reading Dossier: Enter an article to test 4-pass reader
  await page.goto(`${BASE_URL}#read`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    document.querySelector('.article-tab')?.click();
  });
  await new Promise(r => setTimeout(r, 400));
  issues = await checkCurrentViewOverflow(page, 'Reading Dossier (Inside Article)');
  console.log(`[READING ARTICLE VIEW] ${issues.length === 0 ? '✓ ZERO OVERFLOWS' : issues.length + ' issues'}`);
  for (const i of issues) console.log('  -', i.type, i.text || i.detail);

  // 7. Collocations Full Lexicon
  await page.goto(`${BASE_URL}#colloc`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    document.querySelectorAll('.view-toggle-btn')[1]?.click();
  });
  await new Promise(r => setTimeout(r, 400));
  issues = await checkCurrentViewOverflow(page, 'Collocations Lexicon View');
  console.log(`[COLLOCATIONS LEXICON] ${issues.length === 0 ? '✓ ZERO OVERFLOWS' : issues.length + ' issues'}`);
  for (const i of issues) console.log('  -', i.type, i.text || i.detail);

  // 8. Tenses Gauntlet Challenge
  await page.goto(`${BASE_URL}#tenses`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    document.querySelectorAll('.view-toggle-btn')[1]?.click();
  });
  await new Promise(r => setTimeout(r, 400));
  issues = await checkCurrentViewOverflow(page, 'Tenses Gauntlet View');
  console.log(`[TENSES GAUNTLET] ${issues.length === 0 ? '✓ ZERO OVERFLOWS' : issues.length + ' issues'}`);
  for (const i of issues) console.log('  -', i.type, i.text || i.detail);

  // 9. IELTS Cockpit: click Start Exam or switch to Writing
  await page.goto(`${BASE_URL}#cockpit`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    document.querySelector('#btn-module-toggle')?.click();
  });
  await new Promise(r => setTimeout(r, 400));
  issues = await checkCurrentViewOverflow(page, 'Exam Cockpit (Writing Mode)');
  console.log(`[COCKPIT WRITING MODE] ${issues.length === 0 ? '✓ ZERO OVERFLOWS' : issues.length + ' issues'}`);
  for (const i of issues) console.log('  -', i.type, i.text || i.detail);

  await browser.close();
  server.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
