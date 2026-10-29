// web/scripts/audit-360-overflow.cjs
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.join(__dirname, '../dist');
const PORT = 4215;
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
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
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

async function audit() {
  const server = createStaticServer();
  await new Promise(r => server.listen(PORT, r));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const routes = [
    // Singularity
    '#tree',
    '#read',
    '#write',
    '#listen',
    '#speak',
    '#vocab',
    '#colloc',
    '#grammar',
    '#tenses',
    '#habits',
    '#blitz',
    '#mediate',
    '#analytics',
    '#cockpit',
    '#drills',
    '#settings',
    // IELTS
    'ielts.html#home',
    'ielts.html#diagnostic',
    'ielts.html#reading',
    'ielts.html#reading-drills',
    'ielts.html#listening',
    'ielts.html#listening-traps',
    'ielts.html#writing',
    'ielts.html#writing-studio',
    'ielts.html#speaking',
    'ielts.html#speaking-simulator',
    'ielts.html#vocab',
    'ielts.html#path',
    'ielts.html#strategy',
    'ielts.html#mock'
  ];

  const results = {};

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 360, height: 802, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('eng_theme', 'dark');
      localStorage.setItem('eng_locale', 'vi');
      localStorage.setItem('singularity_locale', 'vi');
      localStorage.setItem('eng_onboarding_completed', 'true');
      localStorage.setItem('singularity_onboarding_completed', 'true');
      localStorage.setItem('singularity_tour_completed', 'true');
      localStorage.setItem('eng_placement_done', 'true');
      localStorage.setItem('eng_level', 'B2');
      const todayStr = new Date().toISOString().slice(0, 10);
      const state = {
        version: 4,
        learnerLevel: 'B2',
        skillLevels: { vocab: 'B2', grammar: 'B2', reading: 'B2', listening: 'B2', writing: 'B2', speaking: 'B2' },
        placementDone: true,
        streak: { currentStreak: 5, longestStreak: 12, lastActiveDate: todayStr },
        audioTuning: { autoTtsOnFlip: false, ttsRate: 0.9, ambientVolume: 0.2 },
        onboardingCompleted: true
      };
      localStorage.setItem('STARK_ENG_STATE', JSON.stringify(state));
      localStorage.setItem('singularity_state', JSON.stringify(state));
    });

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 800));

      // Scroll down to trigger lazy sections and render everything
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight / 2);
        await new Promise(r => setTimeout(r, 200));
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(r => setTimeout(r, 200));
        window.scrollTo(0, 0);
      });

      const report = await page.evaluate((currRoute) => {
        const issues = [];
        const winWidth = window.innerWidth; // 360

        // 1. Check viewport overflow
        const docW = document.documentElement.scrollWidth;
        const bodyW = document.body.scrollWidth;
        const pageOverflow = docW > winWidth || bodyW > winWidth;

        // 2. Scan every rendered element
        const all = document.querySelectorAll('*');
        for (const el of all) {
          if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0) continue;
          
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') continue;

          // Check if right edge exceeds viewport
          if (rect.right > winWidth + 2 && rect.width > 0 && rect.height > 0) {
            // Check if it's intentional scroll container or pure overflow
            const isScrollContainer = style.overflowX === 'auto' || style.overflowX === 'scroll';
            issues.push({
              type: isScrollContainer ? 'scroll-container-bleed' : 'viewport-bleed',
              tag: el.tagName.toLowerCase(),
              className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : '',
              id: el.id || '',
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
              text: el.innerText ? el.innerText.slice(0, 40).replace(/\n/g, ' ') : ''
            });
          }

          // Check for internal scroll overflow inside fixed containers where not intended
          if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
            const isScrollable = style.overflowX === 'auto' || style.overflowX === 'scroll';
            if (!isScrollable && style.overflowX !== 'hidden') {
              issues.push({
                type: 'uncontained-inner-overflow',
                tag: el.tagName.toLowerCase(),
                className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : '',
                id: el.id || '',
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
                text: el.innerText ? el.innerText.slice(0, 40).replace(/\n/g, ' ') : ''
              });
            }
          }
        }

        return {
          route: currRoute,
          pageOverflow,
          docW,
          winWidth,
          issuesCount: issues.length,
          issues: issues.slice(0, 15) // top 15
        };
      }, route);

      results[route] = report;
      if (report.pageOverflow || report.issuesCount > 0) {
        console.log(`❌ [OVERFLOW] ${route}: pageOverflow=${report.pageOverflow} (${report.docW}px > 360px), elementIssues=${report.issuesCount}`);
        for (const iss of report.issues.slice(0, 5)) {
          console.log(`   - [${iss.type}] <${iss.tag} class="${iss.className}"> width:${iss.width} right:${iss.right} text:"${iss.text}"`);
        }
      } else {
        console.log(`✓ [PASS] ${route}`);
      }
    }

  } finally {
    await browser.close();
    server.close();
  }

  fs.writeFileSync('e:/Eng/screenshots/overflow_audit_360.json', JSON.stringify(results, null, 2));
}

audit().catch(console.error);

