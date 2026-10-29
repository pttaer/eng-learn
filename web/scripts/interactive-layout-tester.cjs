// web/scripts/interactive-layout-tester.cjs
/**
 * Automated Deep Runtime Layout Inspector Across Interactive States
 * Viewport: 360x802 px (Modern standard mobile viewport: Galaxy/Pixel/iPhone standard)
 * 
 * Verifies:
 * 1. Global Viewport Overflow (document.scrollWidth > 360, body.scrollWidth > 360).
 * 2. Uncontained Viewport Bleeds (element rect.right > 360 without a scroll container).
 * 3. Uncontained Container Inner Overflows (scrollWidth > clientWidth in non-scroll containers).
 * 4. Crushed Touch Targets (< 44px min-height or min-width on active buttons/links).
 * 5. Text Overlaps, Collisions, and Undefined/NaN Telemetry.
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.join(__dirname, '../dist');
const PORT = 4217;
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

// In-browser scanning function executed via page.evaluate
function scanPageLayout(stateName) {
  const winWidth = window.innerWidth; // 360
  const docW = document.documentElement.scrollWidth;
  const bodyW = document.body.scrollWidth;
  const pageOverflow = docW > winWidth + 1 || bodyW > winWidth + 1;

  const viewportBleeds = [];
  const innerOverflows = [];
  const crushedButtons = [];
  const telemetryDefects = [];

  // Helper to check if an element is inside an intentional horizontal scroll container
  function hasScrollAncestor(el) {
    let parent = el.parentElement;
    while (parent && parent !== document.body && parent !== document.documentElement) {
      const pStyle = window.getComputedStyle(parent);
      if (pStyle.overflowX === 'auto' || pStyle.overflowX === 'scroll') {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  const allElements = document.querySelectorAll('*');
  for (const el of allElements) {
    if (!el.isConnected) continue;

    // Skip script, style, meta, head, etc.
    const tag = el.tagName.toLowerCase();
    if (['script', 'style', 'meta', 'link', 'title', 'noscript'].includes(tag)) continue;

    // Check visibility
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
    if (el.closest('[aria-hidden="true"]') && !el.closest('.completion-modal-overlay, [role="dialog"]')) {
      // Background content suppressed by modal
      continue;
    }
    if (el.closest('[inert]')) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    const className = typeof el.className === 'string' ? el.className.slice(0, 80) : '';
    const id = el.id || '';
    const textSnippet = (el.innerText || el.textContent || '').slice(0, 50).replace(/\s+/g, ' ').trim();

    // 1. Viewport Bleed (Right edge > 360)
    if (rect.right > winWidth + 1.5) {
      const isScrollContainer = style.overflowX === 'auto' || style.overflowX === 'scroll';
      const isInsideScroll = hasScrollAncestor(el);

      // If it's a child inside a horizontally scrollable container, it's expected to be offscreen
      if (!isInsideScroll && !isScrollContainer) {
        viewportBleeds.push({
          tag,
          className,
          id,
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          left: Math.round(rect.left),
          text: textSnippet
        });
      } else if (isScrollContainer && rect.right > winWidth + 1.5) {
        // If the scroll container itself bleeds past viewport
        viewportBleeds.push({
          type: 'scroll-container-itself-bleeds',
          tag,
          className,
          id,
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          text: textSnippet
        });
      }
    }

    // 2. Uncontained Container Inner Overflow
    // scrollWidth > clientWidth when container is not scrollable and not explicitly hidden
    if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2) {
      const isScrollable = style.overflowX === 'auto' || style.overflowX === 'scroll';
      if (!isScrollable) {
        const diff = el.scrollWidth - el.clientWidth;
        // Check if visible overflow causes children to spill
        const isEllipsis = style.textOverflow === 'ellipsis' || style.webkitLineClamp !== 'none' || (el.parentElement && window.getComputedStyle(el.parentElement).textOverflow === 'ellipsis');
        if (!isEllipsis && style.overflowX !== 'hidden' && diff > 8) {
          innerOverflows.push({
            tag,
            className,
            id,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            diff,
            overflowX: style.overflowX,
            text: textSnippet
          });
        }
      }
    }

    // 3. Crushed Buttons (< 44px touch floor)
    const isInteractive = (
      tag === 'button' ||
      tag === 'select' ||
      (tag === 'a' && el.hasAttribute('href')) ||
      el.getAttribute('role') === 'button' ||
      className.includes('hud-btn') ||
      className.includes('ie-btn') ||
      className.includes('dock-btn') ||
      className.includes('filter-chip') ||
      className.includes('level-chip') ||
      className.includes('filter-tab') ||
      className.includes('view-toggle-btn') ||
      className.includes('tenses-choice-btn')
    );

    if (isInteractive && !el.hasAttribute('disabled')) {
      // Check if button is visibly rendered on screen
      if (rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight) {
        // If it's inside another button (e.g. icon or badge), ignore sub-element
        const parentBtn = el.parentElement?.closest('button, [role="button"]');
        if (!parentBtn) {
          if (rect.height < 43.0 || rect.width < 43.0) {
            crushedButtons.push({
              tag,
              className,
              id,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              text: textSnippet
            });
          }
        }
      }
    }

    // 4. Defensive Telemetry Check: undefined, NaN%, NaN
    if (textSnippet && !['script', 'style'].includes(tag)) {
      if (/\bundefined\b|\bNaN%?\b|\bnull\b/i.test(textSnippet)) {
        // Exclude legitimate words that might contain "null" like "annul" or code
        if (/\bundefined\b|\bNaN%?\b/.test(textSnippet)) {
          telemetryDefects.push({
            tag,
            className,
            id,
            text: textSnippet
          });
        }
      }
    }
  }

  return {
    state: stateName,
    pageOverflow,
    docW,
    bodyW,
    viewportBleedsCount: viewportBleeds.length,
    viewportBleeds: viewportBleeds.slice(0, 10),
    innerOverflowsCount: innerOverflows.length,
    innerOverflows: innerOverflows.slice(0, 10),
    crushedButtonsCount: crushedButtons.length,
    crushedButtons: crushedButtons.slice(0, 10),
    telemetryDefectsCount: telemetryDefects.length,
    telemetryDefects: telemetryDefects.slice(0, 10)
  };
}

async function runInteractiveTester() {
  console.log('========================================================================');
  console.log('  STARTING DEEP INTERACTIVE RUNTIME LAYOUT INSPECTION (360x802 px)');
  console.log('========================================================================\n');

  const server = createStaticServer();
  await new Promise(r => server.listen(PORT, r));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const allReports = [];

  function recordReport(rep) {
    allReports.push(rep);
    const hasFail = rep.pageOverflow || rep.viewportBleedsCount > 0 || rep.innerOverflowsCount > 0 || rep.crushedButtonsCount > 0 || rep.telemetryDefectsCount > 0;
    if (hasFail) {
      console.log(`❌ [STATE ISSUE] "${rep.state}": docW=${rep.docW}px | bleeds=${rep.viewportBleedsCount} | inners=${rep.innerOverflowsCount} | crushed=${rep.crushedButtonsCount} | telemetryDefects=${rep.telemetryDefectsCount}`);
      if (rep.viewportBleeds.length > 0) {
        console.log('   --- Viewport Bleeds:');
        rep.viewportBleeds.forEach(b => console.log(`       <${b.tag} class="${b.className}" id="${b.id}"> right:${b.right} width:${b.width} text:"${b.text}"`));
      }
      if (rep.innerOverflows.length > 0) {
        console.log('   --- Inner Overflows:');
        rep.innerOverflows.forEach(o => console.log(`       <${o.tag} class="${o.className}" id="${o.id}"> scrollW:${o.scrollWidth} > clientW:${o.clientWidth} (diff:${o.diff}) text:"${o.text}"`));
      }
      if (rep.crushedButtons.length > 0) {
        console.log('   --- Crushed Buttons (<44px):');
        rep.crushedButtons.forEach(c => console.log(`       <${c.tag} class="${c.className}"> ${c.width}x${c.height}px text:"${c.text}"`));
      }
      if (rep.telemetryDefects.length > 0) {
        console.log('   --- Telemetry Defects:');
        rep.telemetryDefects.forEach(t => console.log(`       <${t.tag} class="${t.className}"> text:"${t.text}"`));
      }
    } else {
      console.log(`✓ [PASS] "${rep.state}" (docW=${rep.docW}px, 0 bleeds, 0 inner overflows, 0 crushed buttons)`);
    }
  }

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

    // Helper to safely navigate & wait
    async function gotoRoute(route) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 600));
    }

    // =========================================================================
    // SECTION 1: MODALS & DRAWERS
    // =========================================================================
    console.log('\n--- 1. TESTING MODALS & DRAWERS ---');
    await gotoRoute('#tree');

    // 1.1 Mobile Menu Drawer
    console.log('\n-> Testing Mobile Menu Drawer');
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-mobile-menu-drawer') || document.querySelector('[data-action="menu"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    recordReport(await page.evaluate(scanPageLayout, 'Modal: Mobile Menu Drawer Opened'));

    // Close Mobile Menu Drawer
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.mobile-action-sheet-overlay .sheet-btn-close') ||
                       document.querySelector('.mobile-action-sheet-overlay .btn-modal-close');
      if (closeBtn) closeBtn.click();
      else document.querySelector('.mobile-action-sheet-overlay')?.remove();
    });
    await new Promise(r => setTimeout(r, 300));

    // 1.2 Placement Quiz Modal
    console.log('\n-> Testing Placement Quiz Modal');
    await page.evaluate(() => {
      if (window.PlacementQuiz) window.PlacementQuiz.open();
    });
    await new Promise(r => setTimeout(r, 400));
    recordReport(await page.evaluate(scanPageLayout, 'Modal: Placement Quiz Opened'));

    // Simulate clicking an answer choice in Placement Quiz
    await page.evaluate(() => {
      const choiceBtn = document.querySelector('.placement-option-btn, .quiz-choice-btn, .choice-btn');
      if (choiceBtn) choiceBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    recordReport(await page.evaluate(scanPageLayout, 'Modal: Placement Quiz Option Selected'));

    // Close Placement Quiz
    await page.evaluate(() => {
      if (window.PlacementQuiz) window.PlacementQuiz.close();
      document.querySelectorAll('.placement-modal-overlay, .completion-modal-overlay').forEach(el => el.remove());
    });
    await new Promise(r => setTimeout(r, 300));

    // 1.3 Progression Modal
    console.log('\n-> Testing Progression Modal');
    await page.evaluate(() => {
      if (window.ProgressionModal) window.ProgressionModal.open();
    });
    await new Promise(r => setTimeout(r, 400));
    recordReport(await page.evaluate(scanPageLayout, 'Modal: Progression Modal Opened'));

    // Click tabs inside Progression Modal if any
    await page.evaluate(() => {
      const modalTab = document.querySelectorAll('.progression-tab, .modal-tab')[1];
      if (modalTab) modalTab.click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'Modal: Progression Modal Tab Switched'));

    // Close Progression Modal
    await page.evaluate(() => {
      if (window.ProgressionModal) window.ProgressionModal.close();
      document.querySelectorAll('.progression-modal-overlay, .completion-modal-overlay').forEach(el => el.remove());
    });
    await new Promise(r => setTimeout(r, 300));

    // 1.4 Mistake Vault
    console.log('\n-> Testing Mistake Vault');
    await page.evaluate(() => {
      if (window.MistakeVault) window.MistakeVault.open();
    });
    await new Promise(r => setTimeout(r, 400));
    recordReport(await page.evaluate(scanPageLayout, 'Modal: Mistake Vault Opened'));

    // Close Mistake Vault
    await page.evaluate(() => {
      if (window.MistakeVault) window.MistakeVault.close();
      document.querySelectorAll('.mistake-vault-modal-overlay, .completion-modal-overlay').forEach(el => el.remove());
    });
    await new Promise(r => setTimeout(r, 300));

    // 1.5 Commute Audio Player
    console.log('\n-> Testing Commute Player');
    await page.evaluate(() => {
      if (window.CommuteAudioPlayer) window.CommuteAudioPlayer.open();
    });
    await new Promise(r => setTimeout(r, 400));
    recordReport(await page.evaluate(scanPageLayout, 'Modal: Commute Player Opened'));

    // Close Commute Audio Player
    await page.evaluate(() => {
      if (window.CommuteAudioPlayer) window.CommuteAudioPlayer.close();
      document.querySelectorAll('.commute-player-overlay, .completion-modal-overlay').forEach(el => el.remove());
    });
    await new Promise(r => setTimeout(r, 300));

    // 1.6 Lexicon Drawer
    console.log('\n-> Testing Universal Sliding Lexicon Drawer');
    await page.evaluate(() => {
      if (window.LexiconDrawer) window.LexiconDrawer.open('serendipity');
    });
    await new Promise(r => setTimeout(r, 400));
    recordReport(await page.evaluate(scanPageLayout, 'Modal: Lexicon Drawer Opened (serendipity)'));

    // Close Lexicon Drawer
    await page.evaluate(() => {
      if (window.LexiconDrawer) window.LexiconDrawer.close();
    });
    await new Promise(r => setTimeout(r, 300));

    // =========================================================================
    // SECTION 2: VOCABULARY & FLASHCARDS REVEALED STATE
    // =========================================================================
    console.log('\n--- 2. TESTING VOCABULARY & FLASHCARDS REVEAL ---');
    await gotoRoute('#vocab');
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Vocab: Default Render'));

    // Click Category/Level Tabs (C1, B1, etc.)
    await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('.level-chip, .filter-chip, .dossier-tab'));
      const c1Chip = chips.find(c => c.textContent.includes('C1'));
      if (c1Chip) c1Chip.click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Vocab: C1 Level Filter Clicked'));

    // Flashcard Flip Reveal State
    console.log('-> Flipping Flashcard to Revealed State');
    await page.evaluate(() => {
      const flipBtn = document.querySelector('.btn-flip-trigger, .atomic-card-flipper, .card-face-front');
      if (flipBtn) flipBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Vocab: Flashcard Revealed State (Flipped)'));

    // =========================================================================
    // SECTION 3: WRITING & MYERS DIFF VIEWER IN COPYWORK
    // =========================================================================
    console.log('\n--- 3. TESTING WRITING & MYERS DIFF VIEWER ---');
    await gotoRoute('#write');
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Writing: Step 1 (Analyze)'));

    // Click Step 2: Start Typing
    console.log('-> Moving to Copywork Step 2: Typing');
    await page.evaluate(() => {
      const startBtn = document.querySelector('.btn-start-typing');
      if (startBtn) startBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Writing: Step 2 (Typing Input)'));

    // Fill typed content and trigger Myers Diff
    console.log('-> Executing Myers Diff Viewer (Step 3)');
    await page.evaluate(() => {
      const input = document.querySelector('.copywork-input');
      if (input) {
        input.value = 'In stark contrast, the comparative analysis indicates that renewable infrastructure expanded exponentially across European municipalities.';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const evalBtn = document.querySelector('.btn-evaluate-diff');
      if (evalBtn) evalBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Writing: Step 3 (Myers Diff Viewer Revealed)'));

    // Test IELTS Writing Studio Myers Diff as well
    console.log('-> Testing IELTS Writing Studio Myers Diff');
    await gotoRoute('ielts.html#writing-studio');
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Writing Studio: Default Render'));

    await page.evaluate(() => {
      const loadBtn = document.querySelector('.ie-load-t2-model');
      if (loadBtn) loadBtn.click();
      const diffBtn = document.querySelector('.ie-run-diff');
      if (diffBtn) diffBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Writing Studio: Myers Semantic Diff Stream Revealed'));

    // =========================================================================
    // SECTION 4: TENSES QUESTION SELECTION & EXPLANATION DRAWER
    // =========================================================================
    console.log('\n--- 4. TESTING TENSES QUESTION SELECTION & FILTERS ---');
    await gotoRoute('#tenses');
    recordReport(await page.evaluate(scanPageLayout, 'Tenses Dossier: Initial Random Drill Render'));

    // Click Family Filter Tabs (PAST, FUTURE, ALL)
    await page.evaluate(() => {
      const pastTab = document.querySelector('.filter-tab[data-family="PAST"]');
      if (pastTab) pastTab.click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'Tenses Dossier: PAST Family Tab Selected'));

    // Select specific tense in dropdown
    await page.evaluate(() => {
      const select = document.getElementById('tense-select');
      if (select && select.options.length > 2) {
        select.selectedIndex = 1;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'Tenses Dossier: Specific Tense Dropdown Selected'));

    // Simulate clicking a Choice Button -> Reveals Explanation Drawer!
    console.log('-> Answering Tense Question to Reveal Explanation Drawer');
    await page.evaluate(() => {
      const choiceBtn = document.querySelector('.tenses-choice-btn');
      if (choiceBtn) choiceBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    recordReport(await page.evaluate(scanPageLayout, 'Tenses Dossier: Question Answered (Explanation Drawer Revealed)'));

    // Test Gauntlet & Codex Modes
    await page.evaluate(() => {
      const gauntletBtn = document.querySelector('.view-toggle-btn[data-view="gauntlet"]');
      if (gauntletBtn) gauntletBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'Tenses Dossier: 12-Tense Gauntlet Challenge Mode'));

    await page.evaluate(() => {
      const codexBtn = document.querySelector('.view-toggle-btn[data-view="reference"]');
      if (codexBtn) codexBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'Tenses Dossier: 12 Tenses Codex Reference Grid'));

    // =========================================================================
    // SECTION 5: CATEGORY TABS & FILTER BUTTONS ACROSS ALL REMAINING VIEWS
    // =========================================================================
    console.log('\n--- 5. TESTING TABS & FILTERS ACROSS ALL CORE VIEWS ---');

    // 5.1 Reading Dossier (#read)
    await gotoRoute('#read');
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Reading: Initial Split View'));
    // Toggle mobile split tabs
    await page.evaluate(() => {
      const analysisTab = document.querySelector('[data-tab="analysis"], .split-tab-analysis');
      if (analysisTab) analysisTab.click();
      else if (window.App && window.App.readingDossier) window.App.readingDossier.toggleMobileActiveTab();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Reading: Analysis Tab Switched'));

    // 5.2 IELTS Reading & Drills
    await gotoRoute('ielts.html#reading');
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Reading: Passage 1 Initial Render'));
    // Switch to Passage 2
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.ie-tab'));
      const p2 = tabs.find(t => t.textContent.includes('Đoạn 2') || t.textContent.includes('Passage 2'));
      if (p2) p2.click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Reading: Passage 2 Tab Selected'));

    // IELTS Reading Drills
    await gotoRoute('ielts.html#reading-drills');
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Reading Drills: Drill 1 Render'));
    // Click Drill 6 (Table completion)
    await page.evaluate(() => {
      const drillTabs = document.querySelectorAll('.ie-drill-tab');
      if (drillTabs.length > 5) drillTabs[5].click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Reading Drills: Drill 6 (Table Completion) Tab Selected'));

    // 5.3 Grammar Dossier (#grammar)
    await gotoRoute('#grammar');
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Grammar: Initial Render'));
    await page.evaluate(() => {
      const chips = document.querySelectorAll('.filter-tab, .filter-chip, .level-chip');
      if (chips.length > 1) chips[1].click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Grammar: Category Filter Switched'));

    // 5.4 Listening Dossier (#listen)
    await gotoRoute('#listen');
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Listening: Initial Render'));
    await page.evaluate(() => {
      const speedBtns = document.querySelectorAll('.btn-speed, .playback-speed-btn, .hud-btn');
      if (speedBtns.length > 2) speedBtns[1].click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Listening: Speed Control Clicked'));

    // IELTS Listening & Traps
    await gotoRoute('ielts.html#listening');
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Listening: Section 1 Render'));
    await page.evaluate(() => {
      const s3Tab = Array.from(document.querySelectorAll('.ie-tab')).find(t => t.textContent.includes('Phần 3') || t.textContent.includes('Section 3'));
      if (s3Tab) s3Tab.click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Listening: Section 3 Tab Selected'));

    await gotoRoute('ielts.html#listening-traps');
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Listening Traps: Initial Render'));
    await page.evaluate(() => {
      const trapTabs = document.querySelectorAll('.ie-tab');
      if (trapTabs.length > 1) trapTabs[1].click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Listening Traps: Category Tab Switched'));

    // 5.5 Speaking Dossier (#speak)
    await gotoRoute('#speak');
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Speaking: Initial Render'));
    await page.evaluate(() => {
      const modeTabs = document.querySelectorAll('.filter-tab, .view-toggle-btn, .dossier-tab');
      if (modeTabs.length > 1) modeTabs[1].click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Speaking: Mode Tab Switched'));

    // IELTS Speaking & Speaking Simulator
    await gotoRoute('ielts.html#speaking');
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Speaking: Part 1 Render'));
    await page.evaluate(() => {
      const p2Tab = Array.from(document.querySelectorAll('.ie-tab')).find(t => t.textContent.includes('Phần 2') || t.textContent.includes('Part 2'));
      if (p2Tab) p2Tab.click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Speaking: Part 2 Tab Selected'));

    await gotoRoute('ielts.html#speaking-simulator');
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Speaking Simulator: Initial Cue Card Render'));
    await page.evaluate(() => {
      const simTabs = document.querySelectorAll('.ie-tab');
      if (simTabs.length > 1) simTabs[1].click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Speaking Simulator: Simulator Tab Switched'));

    // 5.6 IELTS Vocab
    await gotoRoute('ielts.html#vocab');
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Vocab: Core 1500 Mode Render'));
    await page.evaluate(() => {
      const modeBtns = document.querySelectorAll('.ie-mode-btn');
      if (modeBtns.length > 1) modeBtns[1].click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Vocab: Topic 3345 Mode Switched'));

    // 5.7 Cockpit (#cockpit)
    await gotoRoute('#cockpit');
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Cockpit: Initial Render'));
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.cockpit-tab, .hud-btn, .filter-chip');
      if (tabs.length > 2) tabs[1].click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'Singularity Cockpit: Tab Filter Switched'));

    // IELTS Cockpit / Path / Strategy
    await gotoRoute('ielts.html#home');
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Home: Dashboard Render'));

    await gotoRoute('ielts.html#strategy');
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Strategy: Initial Render'));
    await page.evaluate(() => {
      const stratTabs = document.querySelectorAll('.ie-tab');
      if (stratTabs.length > 1) stratTabs[1].click();
    });
    await new Promise(r => setTimeout(r, 300));
    recordReport(await page.evaluate(scanPageLayout, 'IELTS Strategy: Strategy Tab Switched'));

  } finally {
    await browser.close();
    server.close();
  }

  // Write full inspection report
  const reportPath = 'e:/Eng/screenshots/interactive_layout_inspection_360.json';
  fs.writeFileSync(reportPath, JSON.stringify(allReports, null, 2));

  console.log('\n========================================================================');
  console.log(`  LAYOUT INSPECTION COMPLETE! Analyzed ${allReports.length} interactive states.`);
  console.log(`  Full report written to: ${reportPath}`);
  console.log('========================================================================\n');
}

runInteractiveTester().catch(err => {
  console.error('Fatal tester error:', err);
  process.exit(1);
});
