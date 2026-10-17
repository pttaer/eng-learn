// web/scripts/capture-all-views.cjs
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.join(__dirname, '../dist');
const OUTPUT_DIR = path.resolve('E:/Eng/screenshots');
const PORT = 4188;
const BASE_URL = `http://localhost:${PORT}/`;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // Fallback for SPA routing
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

async function captureAllViews() {
  console.log('=== WHOLE-APP VISUAL CAPTURE ENGINE ===');
  console.log(`Chrome binary: ${CHROME_PATH}`);
  console.log(`Serving dist from: ${DIST_DIR}`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`✓ Static server listening on ${BASE_URL}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const captured = [];

  try {
    const page = await browser.newPage();

    // Default desktop resolution
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // Seed storage with comprehensive progress & dark theme
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('eng_theme', 'dark');
      localStorage.setItem('eng_onboarding_completed', 'true');
      localStorage.setItem('eng_placement_done', 'true');
      localStorage.setItem('eng_level', 'B2');
      localStorage.setItem('eng_skill_levels', JSON.stringify({
        vocabulary: 'B2',
        collocations: 'B2',
        grammar: 'C1',
        reading: 'B2',
        listening: 'B2',
        writing: 'B2'
      }));
    });

    page.on('console', msg => console.log(`  [BROWSER] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.error(`  [PAGE ERROR] ${err.toString()}`));

    const shot = async (filename, description) => {
      const targetPath = path.join(OUTPUT_DIR, filename);
      await page.screenshot({ path: targetPath, fullPage: false });
      captured.push({ filename, path: targetPath, description });
      console.log(`[CAPTURED] ${filename} — ${description}`);
    };

    // ------------------------------------------------------------------------
    // SECTION 1: MAIN ENGLISH SINGULARITY APP (DESKTOP 1440x900)
    // ------------------------------------------------------------------------
    console.log('\n--- Section 1: Main Application Views (Desktop) ---');

    // 1. Constellation Skill Tree Overview
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.skill-tree-shell', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 600));
    await shot('01-tree-overview.png', 'Constellation Skill Tree Overview');

    // 2. Skill Node Prerequisite Modal
    console.log('- Triggering node modal...');
    await page.evaluate(() => {
      const node = document.querySelector('.constellation-node');
      if (node) {
        node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    });
    try {
      await page.waitForSelector('#skill-node-modal', { timeout: 4000 });
      await new Promise(r => setTimeout(r, 400));
      await shot('02-tree-node-modal.png', 'Constellation Perk Node Details Modal');
      // Close modal
      await page.evaluate(() => {
        const modal = document.getElementById('skill-node-modal');
        if (modal) modal.remove();
      });
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn('Could not open #skill-node-modal:', e.message);
    }

    // 3. Living Sea Urchin Perspective Canvas
    await page.goto(`${BASE_URL}#singularity`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#canvas-2d', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 600));
    await shot('03-singularity-canvas.png', 'Living Sea Urchin Perspective Canvas');

    // 4. Calm Reading Dossier
    await page.goto(`${BASE_URL}#read`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.dossier-reading', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));
    await shot('04-reading-calm.png', 'Calm Reading Dossier (Multi-Pass Intensive Reading)');

    // 5. Calm Reading in Zen Immersion Mode
    await page.keyboard.press('KeyZ');
    await new Promise(r => setTimeout(r, 500));
    await shot('05-reading-zen-mode.png', 'Calm Reading in Zen Immersion Mode');
    // Exit Zen Mode
    await page.keyboard.press('KeyZ');
    await new Promise(r => setTimeout(r, 300));

    // 6. Franklin Copywork Studio — Step 1: Analyze
    try {
      await page.goto(`${BASE_URL}#write`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.copywork-studio', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 600));
      await shot('06-writing-analyze.png', 'Franklin Copywork Studio (Step 1: Structural Scaffolding)');

      // 7. Franklin Copywork Studio — Step 2: Recall & Type
      await page.evaluate(() => {
        const btn = document.querySelector('.btn-proceed-type');
        if (btn) btn.click();
      });
      await page.waitForSelector('.copywork-input', { timeout: 4000 });
      await page.type('.copywork-input', 'Rarely have institutional investors witnessed such profound syntactic elegance.', { delay: 10 });
      await new Promise(r => setTimeout(r, 400));
      await shot('07-writing-type.png', 'Franklin Copywork Studio (Step 2: Active Recall & Typing)');

      // 8. Franklin Copywork Studio — Step 3: Split-Diff & Telemetry
      await page.evaluate(() => {
        const btn = document.querySelector('.btn-evaluate-type');
        if (btn) btn.click();
      });
      await page.waitForSelector('.copywork-diff-container', { timeout: 4000 });
      await new Promise(r => setTimeout(r, 600));
      await shot('08-writing-split-diff.png', 'Franklin Copywork Studio (Step 3: Myers Split-Diff & Telemetry)');
    } catch (e) {
      console.warn('Writing studio capture issue:', e.message);
    }

    // 9. Active Listening Dossier (Cloze Mode)
    try {
      await page.goto(`${BASE_URL}#listen`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.dossier-listening', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 600));
      await shot('09-listening-cloze.png', 'Active Listening Dossier (Cloze Transcription Mode)');
    } catch (e) {
      console.warn('Listening dossier capture issue:', e.message);
    }

    // 10. Acoustic Speaking Studio
    try {
      await page.goto(`${BASE_URL}#speak`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.dossier-speaking', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 600));
      await shot('10-speaking-studio.png', 'Acoustic Speaking Studio (Nation 4-3-2 & Dual Oscilloscope)');
    } catch (e) {
      console.warn('Speaking studio capture issue:', e.message);
    }

    // 11. Roguelike Vocabulary Vault
    try {
      await page.goto(`${BASE_URL}#vocab`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.dossier-vocabulary', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 600));
      await shot('11-vocabulary-vault.png', 'Roguelike Multi-Mode Vocabulary Vault');
    } catch (e) {
      console.warn('Vocabulary vault capture issue:', e.message);
    }

    // 12. 1,000 Collocations Vault (Drill View)
    try {
      await page.goto(`${BASE_URL}#colloc`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.dossier-collocations', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 600));
      await shot('12-collocations-drill.png', '1,000 Collocations Vault (Active Flashcard Drill Mode)');

      // 13. 1,000 Collocations Vault (Dictionary Table View)
      await page.evaluate(() => {
        const toggle = document.querySelector('.btn-view-dictionary') || document.querySelector('.btn-switch-view') || document.querySelector('[data-view="dict"]');
        if (toggle) toggle.click();
      });
      await new Promise(r => setTimeout(r, 400));
      const searchCollocInput = await page.$('.dossier-search-input');
      if (searchCollocInput) {
        await searchCollocInput.type('decision', { delay: 10 });
        await new Promise(r => setTimeout(r, 400));
      }
      await shot('13-collocations-dictionary.png', '1,000 Collocations Full Dictionary Table View');
    } catch (e) {
      console.warn('Collocations capture issue:', e.message);
    }

    // 14. Advanced Syntactic Grammar Matrix
    try {
      await page.goto(`${BASE_URL}#grammar`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.dossier-grammar', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 600));
      await shot('14-grammar-matrix.png', 'Advanced Syntactic Grammar Matrix');
    } catch (e) {
      console.warn('Grammar matrix capture issue:', e.message);
    }

    // 15. 30-Day Daily Habit Tracker & Mission Log
    try {
      await page.goto(`${BASE_URL}#habits`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.dossier-habits', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 600));
      await shot('15-habits-tracker.png', '30-Day Daily Habit Tracker & Mission Log');
    } catch (e) {
      console.warn('Habits tracker capture issue:', e.message);
    }

    // 16. 60-Second Roguelike Speed Blitz Mode
    try {
      await page.goto(`${BASE_URL}#blitz`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.blitz-dossier-shell', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 600));
      await shot('16-blitz-sprint.png', '60-Second Roguelike Speed Blitz Mode');
    } catch (e) {
      console.warn('Blitz capture issue:', e.message);
    }

    // 17. Settings & Audio HUD Modal
    try {
      await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        const btn = document.querySelector('.btn-settings-hud') || document.querySelector('.btn-settings');
        if (btn) btn.click();
      });
      await page.waitForSelector('#settings-modal, .settings-dialog, .settings-modal-overlay', { timeout: 3000 });
      await new Promise(r => setTimeout(r, 400));
      await shot('17-settings-modal.png', 'Settings Modal (Dual-Bus Audio Sliders, Theme & Notifications)');
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn('Settings modal capture issue:', e.message);
    }

    // 18. RPG Progression Hub Modal
    try {
      await page.evaluate(() => {
        if (window.ProgressionModal && typeof window.ProgressionModal.open === 'function') {
          window.ProgressionModal.open();
        }
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('18-rpg-progression-modal.png', 'RPG Progression Hub (XP Level, Streaks, Daily Quests & Badges)');
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn('Progression modal capture issue:', e.message);
    }

    // 19. Celestial Radar Pentagram Modal (Multi-Skill Diagnostic)
    try {
      await page.evaluate(() => {
        if (window.MultiSkillQuizModal && typeof window.MultiSkillQuizModal.open === 'function') {
          window.MultiSkillQuizModal.open();
        }
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('19-celestial-radar-modal.png', 'Celestial Radar Pentagram Diagnostic Modal');
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn('Celestial radar capture issue:', e.message);
    }

    // 20. Game-Style Spotlight Onboarding Tour
    try {
      await page.evaluate(() => {
        if (window.SpotlightTour && typeof window.SpotlightTour.start === 'function') {
          window.SpotlightTour.start();
        }
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('20-spotlight-onboarding-tour.png', 'Game-Style Spotlight Cutout Onboarding Tour');
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn('Spotlight tour capture issue:', e.message);
    }

    // 21. Sliding In-Text Lexicon Drawer
    try {
      await page.evaluate(() => {
        if (window.LexiconDrawer && typeof window.LexiconDrawer.open === 'function') {
          window.LexiconDrawer.open('ephemeral');
        }
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('21-lexicon-drawer.png', 'Universal In-Text Lexicon Drawer');
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn('Lexicon drawer capture issue:', e.message);
    }

    // ------------------------------------------------------------------------
    // SECTION 2: MOBILE VIEWPORTS (375x812 - iPhone X)
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Mobile Responsive Views (375x812) ---');
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

    // 22. Mobile Constellation Tree
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await shot('22-mobile-tree.png', 'Mobile Constellation Skill Tree (375x812)');

    // 23. Mobile Calm Reading
    await page.goto(`${BASE_URL}#read`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await shot('23-mobile-reading.png', 'Mobile Reading Dossier (375x812)');

    // 24. Mobile Franklin Copywork
    await page.goto(`${BASE_URL}#write`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await shot('24-mobile-writing.png', 'Mobile Franklin Copywork (375x812)');

    // 25. Mobile Active Listening
    await page.goto(`${BASE_URL}#listen`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await shot('25-mobile-listening.png', 'Mobile Active Listening (375x812)');

    // 26. Mobile Acoustic Speaking Studio
    await page.goto(`${BASE_URL}#speak`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await shot('26-mobile-speaking.png', 'Mobile Acoustic Speaking Studio (375x812)');

    // 27. Mobile Collocations Vault
    await page.goto(`${BASE_URL}#colloc`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await shot('27-mobile-collocations.png', 'Mobile 1,000 Collocations Vault (375x812)');

    // 28. Mobile Grammar Matrix
    await page.goto(`${BASE_URL}#grammar`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await shot('28-mobile-grammar.png', 'Mobile Syntactic Grammar Matrix (375x812)');

    // 29. Mobile Roguelike Blitz
    await page.goto(`${BASE_URL}#blitz`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await shot('29-mobile-blitz.png', 'Mobile 60-Second Roguelike Speed Blitz (375x812)');

    // ------------------------------------------------------------------------
    // SECTION 3: ACADEMIC IELTS PLATFORM (ielts.html - 1440x900)
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: Academic IELTS 7.0 Platform Views ---');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // 30. IELTS Home / Overview
    await page.goto(`${BASE_URL}ielts.html#home`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('30-ielts-overview.png', 'IELTS Academic Road to 7.0 Overview & Skill Cards');

    // 31. IELTS Reading Module
    await page.goto(`${BASE_URL}ielts.html#reading`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await shot('31-ielts-reading.png', 'IELTS Academic Reading Module & Timed Passage');

    // 32. IELTS Listening Module
    await page.goto(`${BASE_URL}ielts.html#listening`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await shot('32-ielts-listening.png', 'IELTS Academic Listening Module & Audio Practice');

    // 33. IELTS Writing Task 1 & 2
    await page.goto(`${BASE_URL}ielts.html#writing`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await shot('33-ielts-writing.png', 'IELTS Academic Writing Tasks (Task 1 & Task 2 Evaluator)');

    // 34. IELTS Speaking 3-Part Interview
    await page.goto(`${BASE_URL}ielts.html#speaking`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await shot('34-ielts-speaking.png', 'IELTS Academic Speaking 3-Part Practice & Rubrics');

    // 35. IELTS Strategy & Band 7.0 Guide
    await page.goto(`${BASE_URL}ielts.html#strategy`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await shot('35-ielts-strategy.png', 'IELTS Band 7.0 Strategy & Preparation Guide');

    // 36. IELTS Full Mock Tests & Band Calculator
    await page.goto(`${BASE_URL}ielts.html#mock`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await shot('36-ielts-mock-tests.png', 'IELTS Academic Full Mock Tests & Official Score Conversion');

  } finally {
    await browser.close();
    server.close();
  }

  // Generate an index markdown inside the screenshots directory
  const indexMdContent = [
    '# Visual Showcase — English Singularity & IELTS 7.0',
    '',
    `Captured: ${new Date().toISOString()}`,
    `Total Views Captured: ${captured.length}`,
    '',
    '## Desktop Views (English Singularity C2)',
    ...captured.slice(0, 21).map(c => `- [${c.filename}](${c.filename}) — **${c.description}**`),
    '',
    '## Mobile Responsive Views (iPhone X — 375x812)',
    ...captured.slice(21, 29).map(c => `- [${c.filename}](${c.filename}) — **${c.description}**`),
    '',
    '## Academic IELTS 7.0 Platform Views',
    ...captured.slice(29).map(c => `- [${c.filename}](${c.filename}) — **${c.description}**`),
    ''
  ].join('\n');

  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), indexMdContent, 'utf8');

  console.log(`\n🎉 [COMPLETE] Successfully captured all ${captured.length} views!`);
  console.log(`All files saved into: ${OUTPUT_DIR}`);
  console.log(`Index generated: ${path.join(OUTPUT_DIR, 'README.md')}\n`);
}

captureAllViews().catch(err => {
  console.error('[ERROR] Screenshot capture failed:', err);
  process.exit(1);
});
