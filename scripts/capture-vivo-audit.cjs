const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const puppeteer = require(path.resolve(__dirname, '../web/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.resolve(__dirname, '../web/dist');
const OUTPUT_BASE = path.resolve(__dirname, '../Mobile/vivo');
const PORT = 4196;
const BASE_URL = `http://localhost:${PORT}/`;

// Vivo V2445A Exact Specifications:
// Physical: 1080 x 2408
// Density: 480 dpi (3.0x scale factor)
// CSS Viewport: 360 x 803
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

const MODAL_SCROLL_SELECTOR = '.modal-body, .mobile-action-sheet, .lexicon-drawer-body, .sheet-body, .drawer-content, .completion-modal-overlay, .commute-player-sheet, .ie-tip-modal-body, .skill-node-card, .ie-tip-modal-box, .cd-band-modal-card, .ie-diag-dashboard, .ie-sim-panel';

const auditIssues = [];
const capturedHashes = new Map(); // hash -> first file path

async function inspectDomDefects(page, screenName) {
  const issues = await page.evaluate((name) => {
    const list = [];
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 1. Root horizontal overflow
    if (document.documentElement.scrollWidth > vw + 1) {
      list.push({
        screen: name,
        severity: 'CRITICAL',
        type: 'DOC_HORIZONTAL_OVERFLOW',
        detail: `document.scrollWidth (${document.documentElement.scrollWidth}px) exceeds viewport (${vw}px)`
      });
    }

    function isInsideScrollable(el) {
      let curr = el;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        if (curr.classList && (
          curr.classList.contains('lexicon-table-scroll-wrapper') ||
          curr.classList.contains('hud-scroll-affordance-wrapper') ||
          curr.classList.contains('table-scroll-wrap') ||
          curr.classList.contains('ie-nav') ||
          curr.classList.contains('subnav-scroll') ||
          curr.classList.contains('track') ||
          curr.classList.contains('tabs') ||
          curr.tagName === 'TABLE'
        )) return true;
        const s = window.getComputedStyle(curr);
        if (s.overflowX === 'auto' || s.overflowX === 'scroll') return true;
        curr = curr.parentElement;
      }
      return false;
    }

    // 2. Element bounds & text clipping
    const allEls = document.querySelectorAll('*');
    for (const el of allEls) {
      if (!el || el.offsetParent === null) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const style = window.getComputedStyle(el);

      // Check offscreen horizontal bleed
      if (rect.right > vw + 2 && !isInsideScrollable(el)) {
        if (style.position === 'fixed' && (rect.left >= vw || style.visibility === 'hidden')) continue;
        list.push({
          screen: name,
          severity: 'HIGH',
          type: 'ELEMENT_EXTENDS_OFFSCREEN',
          tag: el.tagName,
          className: el.className,
          rectRight: Math.round(rect.right),
          text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60)
        });
      }

      // Check inner overflow on buttons, chips, tabs, cards
      if (!isInsideScrollable(el) && (el.tagName === 'BUTTON' || el.classList.contains('ie-btn') || el.classList.contains('hud-btn') || el.classList.contains('level-tab') || el.classList.contains('btn-level'))) {
        if (el.scrollWidth > el.clientWidth + 1) {
          list.push({
            screen: name,
            severity: 'HIGH',
            type: 'INNER_ELEMENT_OVERFLOW',
            tag: el.tagName,
            className: el.className,
            scrollW: el.scrollWidth,
            clientW: el.clientWidth,
            diff: el.scrollWidth - el.clientWidth,
            text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60)
          });
        }
      }

      // Check text clipping / ellipses with hidden text
      if (style.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 2 && !isInsideScrollable(el)) {
        const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (text.length > 5) {
          list.push({
            screen: name,
            severity: 'MEDIUM',
            type: 'TEXT_TRUNCATED_OR_CLIPPED',
            tag: el.tagName,
            className: el.className,
            scrollW: el.scrollWidth,
            clientW: el.clientWidth,
            text: text.slice(0, 80)
          });
        }
      }

      // Check touch target floor on interactive buttons (spec floor: 44px)
      if ((el.tagName === 'BUTTON' || el.classList.contains('ie-btn') || el.classList.contains('btn-action') || el.classList.contains('hud-btn')) && !el.classList.contains('ie-nav-arrow')) {
        if ((rect.height < 44 || rect.width < 44) && style.display !== 'inline') {
          list.push({
            screen: name,
            severity: 'LOW',
            type: 'TOUCH_TARGET_SUB_44PX',
            tag: el.tagName,
            className: el.className,
            height: Math.round(rect.height),
            width: Math.round(rect.width),
            text: (el.innerText || el.textContent || '').trim().slice(0, 40)
          });
        }
      }
    }

    return list;
  }, screenName);

  if (issues.length > 0) {
    auditIssues.push(...issues);
    console.log(`  ⚠️  [${screenName}] Found ${issues.length} potential layout defects`);
    issues.forEach(i => console.log(`     - [${i.severity}] ${i.type}: ${i.text || i.detail || ''}`));
  }
}

async function cleanPopupsAndOverlays(page) {
  await page.evaluate(() => {
    document.getElementById('ielts-confirm-dialog')?.remove();
    document.getElementById('hud-confirm-dialog')?.remove();
    document.getElementById('tour-welcome-toast')?.remove();

    if (window.setIeltsTestInProgress) {
      window.setIeltsTestInProgress(null);
    }

    const bubble = document.getElementById('floating-note-bubble');
    if (bubble && !window.__keepFloatingNoteInPlace) {
      const targetX = Math.max(16, window.innerWidth - 130);
      bubble.style.transform = `translate3d(${targetX}px, 56px, 0)`;
      bubble.style.zIndex = '800';
    }
  });
}

function checkDuplicateHash(filePath, relLabel) {
  const buf = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  if (capturedHashes.has(hash)) {
    const prior = capturedHashes.get(hash);
    const duplicateIssue = {
      screen: relLabel,
      severity: 'CRITICAL',
      type: 'DUPLICATE_SCREENSHOT_HASH',
      detail: `Capture byte-identical to prior screen: ${prior} (hash: ${hash.slice(0, 12)})`
    };
    auditIssues.push(duplicateIssue);
    console.warn(`  🚨 [DUPLICATE DETECTED] ${relLabel} has identical hash to ${prior}`);
  } else {
    capturedHashes.set(hash, relLabel);
  }
}

async function captureFlowView(page, folderName, baseName, label, options = {}) {
  const dir = path.join(OUTPUT_BASE, folderName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await cleanPopupsAndOverlays(page);

  // 1. Top capture
  if (options.scrollToSelector) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, options.scrollToSelector);
  } else if (!options.preserveScroll) {
    await page.evaluate((modalSel) => {
      window.scrollTo(0, 0);
      const m = document.getElementById('workspace-mount');
      if (m) m.scrollTop = 0;
      const body = document.querySelector(modalSel);
      if (body) body.scrollTop = 0;
    }, MODAL_SCROLL_SELECTOR);
  }
  await new Promise(r => setTimeout(r, 400));

  await inspectDomDefects(page, `${folderName}/${baseName}-top`);

  const topPath = path.join(dir, `${baseName}-01-top.png`);
  await page.screenshot({ path: topPath, fullPage: false });
  checkDuplicateHash(topPath, `${folderName}/${baseName}-01-top.png`);
  console.log(`  [📸 TOP] ${folderName}/${baseName}-01-top.png (${label})`);

  if (options.skipScroll) return;

  // 2. Measure scrollability
  const scrollInfo = await page.evaluate((modalSel) => {
    const m = document.getElementById('workspace-mount');
    const modal = document.querySelector(modalSel);
    const doc = document.documentElement;

    let target = null;
    let max = 0;

    if (modal && (modal.scrollHeight - modal.clientHeight > 80)) {
      target = 'modal';
      max = modal.scrollHeight - modal.clientHeight;
    } else if (m && (m.scrollHeight - m.clientHeight > 80)) {
      target = 'mount';
      max = m.scrollHeight - m.clientHeight;
    } else if (doc.scrollHeight - window.innerHeight > 80) {
      target = 'window';
      max = doc.scrollHeight - window.innerHeight;
    }

    return { target, max };
  }, MODAL_SCROLL_SELECTOR);

  if (scrollInfo.target && scrollInfo.max > 100) {
    const midScroll = Math.min(scrollInfo.max, 550);
    await page.evaluate((t, s, modalSel) => {
      if (t === 'mount') {
        const m = document.getElementById('workspace-mount');
        if (m) m.scrollTop = s;
      } else if (t === 'modal') {
        const body = document.querySelector(modalSel);
        if (body) body.scrollTop = s;
      } else {
        window.scrollTo(0, s);
      }
    }, scrollInfo.target, midScroll, MODAL_SCROLL_SELECTOR);
    await new Promise(r => setTimeout(r, 350));

    await inspectDomDefects(page, `${folderName}/${baseName}-mid`);

    const midPath = path.join(dir, `${baseName}-02-scrolled.png`);
    await page.screenshot({ path: midPath, fullPage: false });
    checkDuplicateHash(midPath, `${folderName}/${baseName}-02-scrolled.png`);
    console.log(`  [📜 MID] ${folderName}/${baseName}-02-scrolled.png`);

    if (scrollInfo.max > 900) {
      await page.evaluate((t, s, modalSel) => {
        if (t === 'mount') {
          const m = document.getElementById('workspace-mount');
          if (m) m.scrollTop = s;
        } else if (t === 'modal') {
          const body = document.querySelector(modalSel);
          if (body) body.scrollTop = s;
        } else {
          window.scrollTo(0, s);
        }
      }, scrollInfo.target, scrollInfo.max, MODAL_SCROLL_SELECTOR);
      await new Promise(r => setTimeout(r, 350));

      await inspectDomDefects(page, `${folderName}/${baseName}-bottom`);

      const btmPath = path.join(dir, `${baseName}-03-bottom.png`);
      await page.screenshot({ path: btmPath, fullPage: false });
      checkDuplicateHash(btmPath, `${folderName}/${baseName}-03-bottom.png`);
      console.log(`  [⬇️ BTM] ${folderName}/${baseName}-03-bottom.png`);
    }
  }
}

async function run() {
  console.log('=== VIVO V2445A (1080x2408 / 360x803) PIXEL-PERFECT VISUAL AUDIT & SCREENSHOT SUITE ===\n');
  if (!fs.existsSync(OUTPUT_BASE)) fs.mkdirSync(OUTPUT_BASE, { recursive: true });

  const server = createStaticServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Server listening on ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=360,803']
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Pre-seed local storage with calibrated learner telemetry
  await page.evaluateOnNewDocument(() => {
    const state = {
      version: 5,
      learnerLevel: 'B2',
      skillLevels: { vocab: 'B2', grammar: 'C1', reading: 'B2', listening: 'B2', writing: 'B2', speaking: 'B2' },
      placementDone: true,
      soundMuted: true,
      cardStates: {},
      streak: { currentStreak: 7, longestStreak: 14, lastActiveDate: '2026-10-30' },
      habitProgress: {},
      totalCardsReviewed: 150,
      history: []
    };
    localStorage.setItem('STARK_ENG_STATE', JSON.stringify(state));
    localStorage.setItem('eng_theme', 'dark');
    localStorage.setItem('eng_onboarding_completed', 'true');
    localStorage.setItem('eng_spotlight_completed', 'true');
    localStorage.setItem('eng_placement_done', 'true');
    localStorage.setItem('eng_level', 'B2');
    localStorage.setItem('eng_locale', 'vi');
    localStorage.setItem('eng_floating_bubble_pos', JSON.stringify({ x: 230, y: 55 }));
  });

  try {
    // =========================================================================
    // FLOW 01: ONBOARDING & PLACEMENT
    // =========================================================================
    console.log('\n--- FLOW 01: ONBOARDING & PLACEMENT ---');
    await page.goto(`${BASE_URL}#placement`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '01-onboarding-placement', '01-placement-intro', 'Placement Quiz Intro');

    // Click Start Placement Question
    await page.evaluate(() => {
      document.querySelector('.placement-start, .btn-start-placement')?.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '01-onboarding-placement', '02-placement-question', 'Placement Question View');

    // Placement Result Assessment Screen
    await page.evaluate(() => {
      if (window.PlacementQuiz && window.PlacementQuiz.activeInstance) {
        const inst = window.PlacementQuiz.activeInstance;
        inst.correct = { A1: 2, A2: 2, B1: 2, B2: 2 };
        inst.asked = { A1: 2, A2: 2, B1: 2, B2: 2 };
        inst.renderResult();
      }
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '01-onboarding-placement', '04-placement-result', 'Placement Quiz Result Assessment');
    await page.evaluate(() => {
      document.querySelector('.placement-accept')?.click() || document.getElementById('placement-modal')?.remove();
      document.querySelectorAll('.completion-modal-overlay').forEach(el => el.remove());
    });

    // Spotlight Tour
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      if (window.SpotlightTour) window.SpotlightTour.start(true);
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '01-onboarding-placement', '03-spotlight-tour', 'Interactive Spotlight Tour');
    await page.evaluate(() => {
      if (window.SpotlightTour) window.SpotlightTour.close();
      document.querySelectorAll('.tour-overlay, .spotlight-overlay').forEach(e => e.remove());
    });

    // =========================================================================
    // FLOW 02: NAVIGATION & SYSTEM HUD
    // =========================================================================
    console.log('\n--- FLOW 02: NAVIGATION & SYSTEM HUD ---');
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '02-navigation-hud', '01-constellation-deck', 'Constellation Tree (Mobile Skill Deck)');

    // Living Urchin Canvas
    await page.goto(`${BASE_URL}#singularity`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '02-navigation-hud', '02-living-canvas', 'Living Urchin 2.5D Canvas');

    // Mobile Navigation Drawer
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      document.querySelector('.btn-mobile-menu-drawer')?.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '02-navigation-hud', '03-mobile-drawer', 'Mobile Action Sheet & Language Switcher');
    await page.evaluate(() => {
      document.querySelector('.sheet-btn-close')?.click() || document.querySelector('.mobile-action-sheet')?.remove();
    });

    // Settings Modal
    await page.evaluate(() => {
      const hud = window.HeaderHUD?.getInstance ? window.HeaderHUD.getInstance() : null;
      if (hud) hud.openSettingsModal();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '02-navigation-hud', '04-settings-modal', 'Settings & Localization Controls Modal');
    await page.evaluate(() => {
      document.querySelector('#settings-modal .btn-modal-close')?.click() || document.getElementById('settings-modal')?.remove();
    });

    // Settings Dossier (Full 6-Card)
    await page.goto(`${BASE_URL}#settings`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '02-navigation-hud', '05-settings-dossier', 'Full 6-Card Settings & Audio Dossier');

    // Multi-Skill CEFR Assessment Intro View
    await page.evaluate(() => {
      window.MultiSkillQuizModal?.open('quiz');
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '02-navigation-hud', '06b-multiskill-assessment-intro', 'Multi-Skill CEFR Assessment Intro');

    // Multi-Skill CEFR Assessment Question View
    await page.evaluate(() => {
      const inst = window.MultiSkillQuizModal?.activeInstance;
      if (inst) inst.startQuiz();
      else document.querySelector('.quiz-start-btn')?.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '02-navigation-hud', '06c-multiskill-assessment-question', 'Multi-Skill CEFR Assessment Question');

    // Celestial Radar Modal (Multi-Skill Assessment Results)
    await page.evaluate(() => {
      window.MultiSkillQuizModal?.open('radar');
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '02-navigation-hud', '06-celestial-radar', 'CEFR Celestial Skill Radar');
    await page.evaluate(() => {
      document.querySelectorAll('#multi-skill-quiz-modal, .multi-skill-modal-overlay').forEach(el => el.remove());
    });

    // RPG Progression Modal
    await page.evaluate(() => {
      window.ProgressionModal?.open();
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '02-navigation-hud', '07-rpg-progression', 'RPG Progression & Daily Quests Hub');
    await page.evaluate(() => {
      document.querySelector('#progression-modal .btn-modal-close')?.click() || document.getElementById('progression-modal')?.remove();
    });

    // Smart Mistake Vault
    await page.evaluate(() => {
      window.MistakeVault?.open();
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '02-navigation-hud', '08-mistake-vault', 'Mistake Vault (SM-2 Active Defect Archive)');
    await page.evaluate(() => {
      document.querySelector('#mistake-vault-modal .vault-btn-close')?.click() || document.getElementById('mistake-vault-modal')?.remove();
    });

    // Star Map (2.5D SVG Constellation Tree)
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const btn = document.querySelector('.view-switch-btn[data-view="map"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '02-navigation-hud', '09-star-map-canvas', 'Star Map (2.5D SVG Constellation Tree)');

    // Skill Node Perk Modal
    await page.evaluate(() => {
      const node = document.querySelector('.constellation-node');
      if (node) {
        node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '02-navigation-hud', '10-skill-node-modal', 'Skill Node Perk Modal');
    await page.evaluate(() => {
      document.getElementById('skill-node-modal')?.remove();
    });

    // Corner Compass Radial Menu
    await page.goto(`${BASE_URL}#read`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const trigger = document.querySelector('.compass-orb-trigger, .corner-compass-container canvas');
      if (trigger) trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '02-navigation-hud', '11-corner-compass', 'Corner Compass Radial Navigation Menu');
    await page.evaluate(() => {
      document.body.click();
    });

    // Autonomous Commute Audio Player Loop Sheet
    await page.evaluate(() => {
      if (window.CommuteAudioPlayer) window.CommuteAudioPlayer.open();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '02-navigation-hud', '12-commute-player', 'Autonomous Commute Audio Player Loop');
    await page.evaluate(() => {
      if (window.CommuteAudioPlayer) window.CommuteAudioPlayer.close();
    });

    // Level Picker Modal
    await page.evaluate(() => {
      const hud = window.HeaderHUD?.getInstance ? window.HeaderHUD.getInstance() : null;
      if (hud) hud.openLevelPicker();
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '02-navigation-hud', '13-level-picker-modal', 'CEFR Level Picker Modal');
    await page.evaluate(() => {
      document.querySelector('#level-picker-modal .btn-modal-close')?.click() || document.getElementById('level-picker-modal')?.remove();
    });

    // Floating Scratchpad Note Window
    await page.evaluate(() => {
      if (window.FloatingNote) window.FloatingNote.open();
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '02-navigation-hud', '14-floating-scratchpad', 'Floating Quick Scratchpad Window');
    await page.evaluate(() => {
      if (window.FloatingNote) window.FloatingNote.minimize();
    });

    // =========================================================================
    // FLOW 03: FOUR PILLARS
    // =========================================================================
    console.log('\n--- FLOW 03: FOUR PILLARS STUDY WORKBENCHES ---');
    // Reading Pass 1
    await page.goto(`${BASE_URL}#read`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '03-four-pillars', '01-reading-pass1', 'Reading Lab (Pass 1 Skim Protocol)');

    // Reading Zen Mode
    await page.keyboard.press('KeyZ');
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '03-four-pillars', '02-reading-zen', 'Reading Lab (Zen Immersion Mode)');
    await page.keyboard.press('KeyZ');
    await new Promise(r => setTimeout(r, 400));

    // Writing Studio Step 1 (Scaffold)
    await page.goto(`${BASE_URL}#write`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '03-four-pillars', '03-writing-scaffold', 'Franklin Copywork Studio (Step 1 Scaffolding)');

    // Writing Studio Step 2 (Typing)
    await page.evaluate(() => {
      document.querySelector('.btn-proceed-type')?.click();
    });
    await new Promise(r => setTimeout(r, 400));
    const writeInput = await page.$('.copywork-input');
    if (writeInput) {
      await writeInput.type('Rarely have institutional investors witnessed such profound syntactic elegance.', { delay: 5 });
    }
    await new Promise(r => setTimeout(r, 400));
    await captureFlowView(page, '03-four-pillars', '04-writing-type', 'Franklin Copywork Studio (Step 2 Active Recall)');

    // Writing Studio Step 3 (Myers Split Diff)
    await page.evaluate(() => {
      document.querySelector('.btn-evaluate-type')?.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '03-four-pillars', '05-writing-diff', 'Franklin Copywork Studio (Step 3 Myers Split Diff)');

    // Listening Chamber
    await page.goto(`${BASE_URL}#listen`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '03-four-pillars', '06-listening-chamber', 'Active Listening Chamber & Transcription');

    // Speaking Studio
    await page.goto(`${BASE_URL}#speak`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '03-four-pillars', '07-speaking-studio', 'Acoustic Speaking Studio & Oscilloscope');

    // =========================================================================
    // FLOW 04: MASTERY FOUNDATIONS
    // =========================================================================
    console.log('\n--- FLOW 04: LANGUAGE MASTERY FOUNDATIONS ---');
    // Vocab Vault (Front Face)
    await page.goto(`${BASE_URL}#vocab`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '04-mastery-foundations', '01-vocab-front', 'Vocabulary Vault (Front Flashcard Prompt)');

    // Vocab Vault (Flipped Back Face)
    await page.evaluate(() => {
      document.querySelector('.btn-flip-trigger')?.click() || document.querySelector('.card-face-front')?.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '04-mastery-foundations', '02-vocab-back', 'Vocabulary Vault (Flipped Resolution Face)');

    // Collocations Drill Mode
    await page.goto(`${BASE_URL}#colloc`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '04-mastery-foundations', '03-collocations-drill', 'Collocation Forge (SRS Active Drill Mode)');

    // Collocations Lexicon Dictionary Table
    await page.evaluate(() => {
      const btn = document.querySelector('[data-view="dictionary"]') || document.querySelector('.btn-view-dictionary');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '04-mastery-foundations', '04-collocations-lexicon', 'Collocation Forge (1,000 Searchable Dictionary Table)');

    // Grammar Codex Interactive Transform
    await page.goto(`${BASE_URL}#grammar`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '04-mastery-foundations', '05-grammar-codex', 'Grammar Codex (Syntax Transformation Console)');

    // 12 Verb Tenses (Random Drill)
    await page.goto(`${BASE_URL}#tenses`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '04-mastery-foundations', '06-tenses-drill', '12 Verb Tenses (Random Drill Mode)');

    // 12 Verb Tenses (Codex Cards View)
    await page.evaluate(() => {
      const btn = document.querySelector('[data-view="reference"], [data-mode="codex"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '04-mastery-foundations', '07-tenses-codex', '12 Verb Tenses (Complete Reference Codex Cards)');

    // 12 Verb Tenses (Gauntlet Challenge Question)
    await page.evaluate(() => {
      const btn = document.querySelector('[data-view="gauntlet"], [data-mode="gauntlet"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '04-mastery-foundations', '08-tenses-gauntlet', '12 Verb Tenses (Gauntlet Challenge Workbench)');

    // 12 Verb Tenses (Gauntlet Diagnostic Scorecard Receipt)
    await page.evaluate(() => {
      const app = window.__singularityApp;
      if (app && app.tensesDossier) {
        app.tensesDossier.showSampleScorecard();
      }
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '04-mastery-foundations', '08b-tenses-gauntlet-scorecard', '12-Tense Gauntlet Diagnostic Receipt');

    // In-Text Universal Lexicon Drawer
    await page.evaluate(() => {
      if (window.LexiconDrawer) window.LexiconDrawer.open('ephemeral');
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '04-mastery-foundations', '09-lexicon-drawer', 'In-Text Sliding Lexicon Drawer');
    await page.evaluate(() => {
      document.querySelector('.lexicon-drawer-close')?.click() || document.querySelector('.lexicon-drawer-backdrop')?.remove();
    });

    // Cambridge 36 Practice Drills Sets
    await page.goto(`${BASE_URL}#drills`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '04-mastery-foundations', '10-cambridge-drills', 'Cambridge 36-Set Practice Drills');

    // Phonemic Sounds Interactive Chart
    await page.evaluate(() => {
      const tab = document.querySelector('.drill-tab[data-value="sounds"]');
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '04-mastery-foundations', '11-phonemic-sounds', 'Phonemic IPA Interactive Chart');

    // Business Email Architecture Builder
    await page.evaluate(() => {
      const tab = document.querySelector('.drill-tab[data-value="email"]');
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '04-mastery-foundations', '12-email-builder', 'Business Email Architecture Builder');

    // =========================================================================
    // FLOW 05: SPEED, MEDIATION & HABITS
    // =========================================================================
    console.log('\n--- FLOW 05: SPEED, MEDIATION & HABITS ---');
    // Speed Blitz
    await page.goto(`${BASE_URL}#blitz`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '05-speed-mediation-habits', '01-speed-blitz', 'Roguelike 60-Second Speed Blitz');

    // CEFR Mediation Workbench
    await page.goto(`${BASE_URL}#mediate`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '05-speed-mediation-habits', '02-mediation-workbench', 'CEFR Mediation Workbench');

    // Daily Habits & Mission Log
    await page.goto(`${BASE_URL}#habits`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '05-speed-mediation-habits', '03-mission-log', 'Habit Formation & Daily Mission Log');

    // CEFR Analytics & SERL 2.0
    await page.goto(`${BASE_URL}#analytics`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '05-speed-mediation-habits', '04-analytics-serl', 'CEFR Analytics & SERL 2.0 Cockpit');

    // Exam Cockpit Reading & Writing Modes
    await page.goto(`${BASE_URL}#cockpit`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '05-speed-mediation-habits', '05-exam-cockpit-reading', 'Exam Cockpit (Reading Passage & Gap-Fill Navigator)');

    await page.evaluate(() => {
      document.querySelector('#btn-module-toggle')?.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '05-speed-mediation-habits', '06-exam-cockpit-writing', 'Exam Cockpit (Writing Task 1 & 2 Workbench)');

    // Official Exam Cockpit Band Conversion Report Modal
    await page.evaluate(() => {
      const app = window.__singularityApp;
      if (app && app.examCockpit) {
        app.examCockpit.openBandConversionModal({
          rawScore: 33,
          bandScore: 7.5,
          cefr: 'C1',
          descriptor: 'Good user with operational command',
          pct: 83,
          p1Correct: 11,
          p2Correct: 11,
          p3Correct: 11,
          tfngCorrect: 11,
          mcqCorrect: 11,
          gapCorrect: 11,
          module: 'READING',
          timeSpent: '52m 14s',
          reviewItems: []
        });
      }
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '05-speed-mediation-habits', '07-exam-cockpit-band-modal', 'Exam Cockpit Band Score Report Modal');
    await page.evaluate(() => {
      document.querySelector('#cd-band-conversion-modal .btn-close-report')?.click();
      document.querySelectorAll('#cd-band-conversion-modal').forEach(e => e.remove());
    });

    // =========================================================================
    // FLOW 06: IELTS ACADEMIC SUITE
    // =========================================================================
    console.log('\n--- FLOW 06: IELTS ACADEMIC SUITE ---');

    await page.evaluate(() => {
      const attempts = [
        { skill: 'reading', band: 7.5, raw: 33, of: 40, timestamp: Date.now() },
        { skill: 'listening', band: 7.0, raw: 30, of: 40, timestamp: Date.now() },
        { skill: 'writing', band: 7.0, raw: 7, of: 9, timestamp: Date.now() },
        { skill: 'speaking', band: 7.5, raw: 7.5, of: 9, timestamp: Date.now() }
      ];
      localStorage.setItem('IELTS_STATE', JSON.stringify({ attempts }));

      const report = {
        timestamp: Date.now() - 3600000,
        totalQuestions: 20,
        score: 16,
        percentage: 80,
        bandEstimate: "Band 7.5+",
        subTypeBreakdown: {
          subject_verb: { total: 4, correct: 4, percentage: 100 },
          tenses: { total: 4, correct: 3, percentage: 75 },
          articles: { total: 3, correct: 2, percentage: 67 },
          clauses: { total: 3, correct: 3, percentage: 100 },
          prepositions: { total: 3, correct: 2, percentage: 67 },
          collocations: { total: 3, correct: 2, percentage: 67 }
        },
        flawsDetected: [
          { subType: 'articles', impactOnBand: 'Limits GRA flexibility under time pressure', recommendation: 'Audit zero-article usage with plural/uncountable abstracts.' },
          { subType: 'prepositions', impactOnBand: 'Minor lexical slips in dependent structures', recommendation: 'Drill dependent preposition collocations.' }
        ],
        checklistItems: [
          'Audit zero-article usage with plural/uncountable abstracts.',
          'Drill dependent preposition collocations.'
        ]
      };
      localStorage.setItem('ielts_diagnostic_profile', JSON.stringify(report));
    });

    // 01 Home / Overview
    await page.goto(`${BASE_URL}ielts.html#home`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '01-ielts-overview', 'IELTS Road to 7.0 Overview & Summary');

    // 01b Band Report & 7.0 Readiness Gate (Specifically scrolled to .ie-report)
    await captureFlowView(page, '06-ielts-academic', '01b-ielts-band-readiness-report', 'IELTS 4-Skill Band Report & 7.0 Readiness Gate', {
      scrollToSelector: '.ie-report'
    });

    // 02 Diagnostic Question View (clean state)
    await page.evaluate(() => {
      localStorage.removeItem('ielts_diagnostic_profile');
    });
    await page.goto(`${BASE_URL}ielts.html#diagnostic`, { waitUntil: 'networkidle0' });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '02-ielts-diagnostic', 'IELTS 4-Skill Diagnostic Assessment');

    // 02b Diagnostic 6-Vector Error Taxonomy Assessment Report
    await page.evaluate(() => {
      const report = {
        timestamp: Date.now() - 3600000,
        totalQuestions: 20,
        score: 16,
        percentage: 80,
        bandEstimate: "Band 7.5+",
        subTypeBreakdown: {
          subject_verb: { total: 4, correct: 4, percentage: 100 },
          tenses: { total: 4, correct: 3, percentage: 75 },
          articles: { total: 3, correct: 2, percentage: 67 },
          clauses: { total: 3, correct: 3, percentage: 100 },
          prepositions: { total: 3, correct: 2, percentage: 67 },
          collocations: { total: 3, correct: 2, percentage: 67 }
        },
        flawsDetected: [
          { subType: 'articles', impactOnBand: 'Limits GRA flexibility under time pressure', recommendation: 'Audit zero-article usage with plural/uncountable abstracts.' },
          { subType: 'prepositions', impactOnBand: 'Minor lexical slips in dependent structures', recommendation: 'Drill dependent preposition collocations.' }
        ],
        checklistItems: [
          'Audit zero-article usage with plural/uncountable abstracts.',
          'Drill dependent preposition collocations.'
        ]
      };
      localStorage.setItem('ielts_diagnostic_profile', JSON.stringify(report));
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await page.evaluate(() => {
      document.querySelector('#btn-view-cached')?.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '02b-ielts-diagnostic-taxonomy-report', 'IELTS 6-Vector Error Taxonomy Assessment Report', {
      scrollToSelector: '.ie-diag-dashboard'
    });

    // 03 Reading Timed Passages (Active Test View)
    await page.goto(`${BASE_URL}ielts.html#reading`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await page.evaluate(() => {
      const firstCard = document.querySelector('.ie-passage-card');
      if (firstCard) firstCard.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '03-ielts-reading-timed', 'IELTS Reading (Timed Passages & Question Grid)');

    // 03b Reading Test Calibrated Band Scorecard Result
    await page.evaluate(() => {
      const submitBtn = document.querySelector('.ie-testbar .ie-btn-primary') || Array.from(document.querySelectorAll('.ie-btn')).find(b => b.textContent.includes('Submit'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '03b-ielts-reading-test-result', 'IELTS Reading Calibrated Band Scorecard Result', {
      scrollToSelector: '.ie-result'
    });
    // Cleanly cancel test state so confirm dialog never blocks subsequent pages
    await page.evaluate(() => {
      if (window.setIeltsTestInProgress) window.setIeltsTestInProgress(null);
      document.getElementById('ielts-confirm-dialog')?.remove();
    });

    // 04 Reading 14 Attack Drills Lab
    await page.goto(`${BASE_URL}ielts.html#reading-drills`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '04-ielts-reading-attack-drills', 'IELTS Reading (14 Attack Drills Studio)');

    // 05 Listening Audio Sections (Active Section View)
    await page.goto(`${BASE_URL}ielts.html#listening`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await page.evaluate(() => {
      const firstSection = document.querySelector('.ie-listening-card') || document.querySelector('.ie-cards button.ie-card');
      if (firstSection) firstSection.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '05-ielts-listening-audio', 'IELTS Listening (Sections 1-4 Multi-Accent Audio)');

    // 05b Listening Test Calibrated Band Scorecard Result
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('.ie-testbar button, .ie-testbar .ie-btn')).find(b => b.textContent.includes('Submit') || b.textContent.includes('Nộp bài'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '05b-ielts-listening-test-result', 'IELTS Listening Calibrated Band Scorecard Result', {
      scrollToSelector: '.ie-result'
    });
    // Cleanly cancel test state
    await page.evaluate(() => {
      if (window.setIeltsTestInProgress) window.setIeltsTestInProgress(null);
      document.getElementById('ielts-confirm-dialog')?.remove();
    });

    // 06 Listening Traps Lab
    await page.goto(`${BASE_URL}ielts.html#listening-traps`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '06-ielts-listening-traps', 'IELTS Listening (Traps & Acoustic Self-Correction Lab)');

    // 07 Writing Prompts & Rubrics
    await page.goto(`${BASE_URL}ielts.html#writing`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '07-ielts-writing-prompts', 'IELTS Writing (Prompts & 4-Band Rubrics)');

    // 08 Writing Blueprints & Architect
    await page.goto(`${BASE_URL}ielts.html#writing-studio`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '08-ielts-writing-blueprints', 'IELTS Writing (Blueprints & Paragraph Architect)');

    // 09 Speaking Prompts & Notepad
    await page.goto(`${BASE_URL}ielts.html#speaking`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '09-ielts-speaking-prompts', 'IELTS Speaking (Cue Cards & Notepad Prep)');

    // 10 Speaking Examiner Simulator
    await page.goto(`${BASE_URL}ielts.html#speaking-simulator`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '10-ielts-speaking-simulator', 'IELTS Speaking (AI Examiner Simulator & Nation 4-3-2)');

    // 10b Speaking Simulator 4-Criteria Assessment Feedback (Switch to Comparative Deconstruction)
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('.ie-sim-nav button, .ie-tab')).find(b => b.textContent.includes('Deconstruction') || b.getAttribute('data-mode') === 'deconstruct');
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '10b-ielts-speaking-assessment-feedback', 'IELTS Speaking 4-Criteria Assessment Feedback (Examiner FC/LR/GRA/PR Rubrics)');

    // 11 Topic Lexicon
    await page.goto(`${BASE_URL}ielts.html#vocab`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '11-ielts-vocab-lexicon', 'IELTS Academic Topic Lexicon & Band Collocations');

    // 12 Strategy Codex
    await page.goto(`${BASE_URL}ielts.html#strategy`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '12-ielts-strategy-codex', 'IELTS 46 Master Strategy Cards Codex');

    // 13 Mock Tests
    await page.goto(`${BASE_URL}ielts.html#mock`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '13-ielts-mock-exam', 'IELTS Full Offline Mock Exam Simulation');

    // 14 Guided 7.0 Study Path
    await page.goto(`${BASE_URL}ielts.html#path`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await captureFlowView(page, '06-ielts-academic', '14-ielts-study-path', 'IELTS Guided 7.0 Study Path');

    // 15 Strategy Detail Modal
    await page.goto(`${BASE_URL}ielts.html#strategy`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await page.evaluate(() => {
      const vaultBtn = Array.from(document.querySelectorAll('.ie-mode-btn')).find(b => b.textContent.includes('Vault') || b.textContent.includes('Tips'));
      if (vaultBtn) vaultBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 600));
    await page.evaluate(() => {
      const tip = document.querySelector('.ie-tip-card');
      if (tip) tip.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 500));
    await captureFlowView(page, '06-ielts-academic', '15-ielts-strategy-modal', 'IELTS Strategy Guide Tactical Modal');
    await page.evaluate(() => {
      document.querySelector('.apple-bottom-close-btn, .ie-tip-modal-close')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      document.querySelector('.ie-tip-modal-overlay')?.classList.remove('is-active');
    });

  } catch (err) {
    console.error('Fatal capture error:', err);
  } finally {
    await browser.close();
    server.close();
  }

  // Write audit results
  fs.writeFileSync(path.join(OUTPUT_BASE, 'AUDIT-REPORT.json'), JSON.stringify(auditIssues, null, 2), 'utf8');
  console.log(`\n🎉 [ALL DONE] Captured all screens to ${OUTPUT_BASE}`);
  console.log(`Total detected defects logged: ${auditIssues.length}`);

  const criticals = auditIssues.filter(i => i.severity === 'CRITICAL');
  if (criticals.length > 0) {
    console.error(`\n❌ [AUDIT GATE WARNING] ${criticals.length} CRITICAL issues detected:`);
    criticals.forEach(c => console.error(`  - [${c.screen}] ${c.type}: ${c.detail || ''}`));
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
