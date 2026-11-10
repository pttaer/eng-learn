// tests/device/run-sweep.cjs
// Automated device & fallback mobile sweep engine.
// Executes the 10-point UX rubric and matrix checks across all 28+ screens.
const path = require('path');
const fs = require('fs');
const puppeteer = require(path.join(__dirname, '../../web/node_modules/puppeteer-core'));
const http = require('http');

const CHROME_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.join(__dirname, '../../web/dist');
const SCREENS_DIR = path.join(__dirname, '../../docs/screens');
const PORT = 4328;
const BASE_URL = `http://localhost:${PORT}/`;

if (!fs.existsSync(SCREENS_DIR)) {
  fs.mkdirSync(SCREENS_DIR, { recursive: true });
}

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

const SCREENS = [
  { id: 'S01', route: '#tree', name: 'Constellation Skill Tree', zeroScroll: true },
  { id: 'S02', route: '#blitz', name: 'Speed Blitz Challenge', zeroScroll: true },
  { id: 'S03', route: '#read', name: 'Intensive Reading Lab', zeroScroll: false },
  { id: 'S04', route: '#write', name: 'Copywork Studio & Diff', zeroScroll: false },
  { id: 'S05', route: '#listen', name: 'Acoustic Listening Chamber', zeroScroll: false },
  { id: 'S06', route: '#speak', name: 'Speaking Studio & Examiner', zeroScroll: false },
  { id: 'S07', route: '#vocab', name: 'Vocabulary Dossier', zeroScroll: false },
  { id: 'S08', route: '#colloc', name: 'Collocation Forge', zeroScroll: false },
  { id: 'S09', route: '#grammar', name: 'Grammar Codex', zeroScroll: false },
  { id: 'S10', route: '#tenses', name: 'Twelve Verb Tenses', zeroScroll: false },
  { id: 'S11', route: '#habits', name: 'Mission Log & Daily Habits', zeroScroll: false },
  { id: 'S12', route: '#mediate', name: 'CEFR Mediation Workbench', zeroScroll: false },
  { id: 'S13', route: '#analytics', name: 'Progress & SERL Analytics', zeroScroll: false },
  { id: 'S14', route: '#drills', name: 'Attack Drills Lab', zeroScroll: false },
  { id: 'S15', route: '#settings', name: 'Settings Dossier', zeroScroll: false },
  { id: 'S16', route: 'ielts.html#home', name: 'Academic Home Dashboard', zeroScroll: false },
  { id: 'S17', route: 'ielts.html#workout', name: 'Daily Guided Workout', zeroScroll: false },
  { id: 'S18', route: 'ielts.html#diagnostic', name: 'Band Score Diagnostic', zeroScroll: false },
  { id: 'S19', route: 'ielts.html#reading', name: 'Academic Reading Passages', zeroScroll: false },
  { id: 'S20', route: 'ielts.html#reading-drills', name: 'Reading Drills Lab', zeroScroll: false },
  { id: 'S21', route: 'ielts.html#listening', name: 'Academic Listening Hub', zeroScroll: false },
  { id: 'S22', route: 'ielts.html#listening-traps', name: 'Listening Traps Lab', zeroScroll: false },
  { id: 'S23', route: 'ielts.html#writing', name: 'Academic Writing Hub', zeroScroll: false },
  { id: 'S24', route: 'ielts.html#writing-studio', name: 'Writing Architecture Studio', zeroScroll: false },
  { id: 'S25', route: 'ielts.html#speaking', name: 'Speaking Simulator Hub', zeroScroll: false },
  { id: 'S26', route: 'ielts.html#strategy', name: 'Examiner Strategy Codex', zeroScroll: false },
  { id: 'S27', route: 'ielts.html#cockpit', name: 'CD-IELTS Exam Cockpit', zeroScroll: true },
  { id: 'S28', route: 'ielts.html#mock', name: 'IELTS Full Mock Exam', zeroScroll: true }
];

async function runSweep() {
  const server = createStaticServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Server listening at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Exact OPPO Reno4 / Reno4 Z 5G dimensions: 360x800 dp, DPR 3.0
  await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

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
  });

  const report = [];

  for (const scr of SCREENS) {
    const targetUrl = scr.route.startsWith('ielts.html')
      ? `${BASE_URL}${scr.route}`
      : `${BASE_URL}index.html${scr.route}`;

    console.log(`\nTesting ${scr.id} (${scr.name}) -> ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 800));

    // Capture screenshot
    const shotPath = path.join(SCREENS_DIR, `${scr.id}-${scr.route.replace(/[^a-zA-Z0-9]/g, '_')}-vi.png`);
    await page.screenshot({ path: shotPath });

    // Evaluate UX Rubric Metrics
    const auditData = await page.evaluate((isZeroScroll) => {
      const winWidth = window.innerWidth;
      const overflows = [];

      // 1. Horizontal Overflow Check (Only uncontained viewport overflows)
      const all = document.querySelectorAll('*');
      for (const el of all) {
        if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0) continue;
        const r = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;

        if (r.right > winWidth + 2 && r.width > 0 && r.height > 0) {
          const isScrollContainer = style.overflowX === 'auto' || style.overflowX === 'scroll';
          let isContainedInViewportScroller = false;
          let parent = el.parentElement;
          while (parent && parent !== document.body && parent !== document.documentElement) {
            const pStyle = window.getComputedStyle(parent);
            if (pStyle.overflowX === 'auto' || pStyle.overflowX === 'scroll' || pStyle.overflowX === 'hidden') {
              const pRect = parent.getBoundingClientRect();
              if (pRect.right <= winWidth + 2) {
                isContainedInViewportScroller = true;
                break;
              }
            }
            parent = parent.parentElement;
          }

          if (!isScrollContainer && !isContainedInViewportScroller && el.tagName !== 'svg' && el.tagName !== 'CANVAS') {
            overflows.push({ tag: el.tagName, cls: el.className, right: Math.round(r.right), winWidth });
          }
        }
      }

      // 2. Zero-Scroll vs Natural Scroll Check
      const bodyScrollH = document.documentElement.scrollHeight;
      const bodyClientH = document.documentElement.clientHeight;
      const scrollDiff = bodyScrollH - bodyClientH;

      // 3. Touch Target Flooring Check (< 44px for primary buttons & controls)
      const smallTouchTargets = [];
      const buttons = document.querySelectorAll('button:not(.sheet-btn-close):not(.vault-btn-close), a.hud-btn, a.btn-primary, [role="button"]:not(.badge-check)');
      for (const btn of buttons) {
        if (btn.offsetParent === null && btn.offsetWidth === 0) continue;
        const r = btn.getBoundingClientRect();
        const style = window.getComputedStyle(btn);
        if (style.display === 'none' || style.visibility === 'hidden') continue;

        // Skip non-button text markers or details summary chips
        if (btn.tagName === 'SUMMARY' || btn.closest('.deck-perk-badges') || btn.classList.contains('cd-tab')) continue;

        if (r.width > 0 && r.height > 0 && (r.width < 42 || r.height < 42)) {
          smallTouchTargets.push({
            tag: btn.tagName,
            cls: btn.className,
            text: (btn.textContent || '').trim().slice(0, 25),
            w: Math.round(r.width),
            h: Math.round(r.height)
          });
        }
      }

      // 4. Missing Localization Check (Raw keys or undefined in user-facing elements)
      const rawKeyRegex = /\b(tree|vocab|read|write|listen|speak|grammar|tenses|colloc|habits|drills|settings|rdrills|ielts|deck|workout)\.[a-z0-9_]{3,30}\b/;
      const unlocalized = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          const parentTag = node.parentElement ? node.parentElement.tagName : '';
          if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'].includes(parentTag)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      let textNode;
      while ((textNode = walker.nextNode())) {
        const txt = textNode.nodeValue.trim();
        if (txt.includes('undefined') || txt.includes('NaN%') || rawKeyRegex.test(txt)) {
          unlocalized.push(txt.slice(0, 50));
        }
      }

      // 5. Button Border Radius Check
      let radiusDeviations = 0;
      document.querySelectorAll('button:not(.btn-circle):not(.btn-round):not(.dock-btn)').forEach(btn => {
        const br = window.getComputedStyle(btn).borderRadius;
        if (br === '0px') radiusDeviations++;
      });

      return {
        overflowCount: overflows.length,
        overflows: overflows.slice(0, 3),
        scrollDiff,
        isZeroScrollExpected: isZeroScroll,
        smallTouchCount: smallTouchTargets.length,
        smallTouches: smallTouchTargets.slice(0, 3),
        unlocalizedCount: unlocalized.length,
        unlocalized: unlocalized.slice(0, 3),
        radiusDeviations
      };
    }, scr.zeroScroll);

    // Score calculation
    let fitScore = 5;
    if (auditData.overflowCount > 0) fitScore -= 2;
    if (scr.zeroScroll && auditData.scrollDiff > 5) fitScore -= 1;

    let touchScore = 5;
    if (auditData.smallTouchCount > 0) touchScore -= 1;

    let langScore = 5;
    if (auditData.unlocalizedCount > 0) langScore -= 2;

    let consistencyScore = 5;
    if (auditData.radiusDeviations > 0) consistencyScore -= 1;

    const overallScore = Math.min(fitScore, touchScore, langScore, consistencyScore);

    report.push({
      id: scr.id,
      name: scr.name,
      route: scr.route,
      zeroScroll: scr.zeroScroll,
      shotPath,
      auditData,
      scores: {
        fit: fitScore,
        touch: touchScore,
        language: langScore,
        consistency: consistencyScore,
        overall: overallScore
      }
    });

    console.log(`  -> Scores: Fit=${fitScore}, Touch=${touchScore}, Lang=${langScore}, Consistency=${consistencyScore} | Overall=${overallScore}`);
  }

  await browser.close();
  server.close();

  fs.writeFileSync(path.join(__dirname, 'sweep-report.json'), JSON.stringify(report, null, 2));
  console.log(`\nSweep complete! Report written to ${path.join(__dirname, 'sweep-report.json')}`);
}

runSweep().catch(err => {
  console.error(err);
  process.exit(1);
});
