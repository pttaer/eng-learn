const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require(path.resolve('E:/Eng/web/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.resolve('E:/Eng/web/dist');
const OUTPUT_DIRS = [
  path.resolve('E:/Eng/screenshots/Mobile'),
  path.resolve('E:/Eng/screenshots/mobile'),
  path.resolve('E:/Eng/screenshots/Mobile/1.0.0'),
  path.resolve('E:/Eng/Mobile/1.0.0'),
  path.resolve('C:/Users/Dell/.gemini/antigravity-ide/brain/3e416960-52a7-4e9a-9260-ace1292f65df'),
  path.resolve('C:/Users/Dell/.gemini/antigravity-ide/brain/f94827d0-ed8c-41ca-bb0d-70eb75190845')
];
const PORT = 4195;
const BASE_URL = `http://localhost:${PORT}/`;

OUTPUT_DIRS.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

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

async function run() {
  console.log('=== CAPTURING EVERY SINGLE MOBILE VIEW (FULL AUDIT) ===');
  console.log('Target directories:');
  OUTPUT_DIRS.forEach(d => console.log('  -', d));

  const server = createStaticServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Server listening on ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const captured = [];

  try {
    const page = await browser.newPage();

    // Standard modern mobile viewport (iPhone 14/15 size, DPR 2)
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    await page.evaluateOnNewDocument(() => {
      const state = {
        version: 4,
        learnerLevel: 'B2',
        skillLevels: { vocab: 'B2', grammar: 'C1', reading: 'B2', listening: 'B2', writing: 'B2', speaking: 'B2' },
        placementDone: true,
        soundMuted: true,
        cardStates: {},
        streak: { currentStreak: 7, longestStreak: 14, lastActiveDate: '2026-10-20' },
        habitProgress: {},
        totalCardsReviewed: 150,
        lastSyncTimestamp: Date.now()
      };
      localStorage.setItem('STARK_ENG_STATE', JSON.stringify(state));
      localStorage.setItem('eng_theme', 'dark');
      localStorage.setItem('eng_onboarding_completed', 'true');
      localStorage.setItem('eng_spotlight_completed', 'true');
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
      const d = new Date();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const todayKey = `${d.getFullYear()}-${m}-${day}`;
      localStorage.setItem('eng_reminder_day', todayKey);
      localStorage.setItem('eng_streak_alert_day', todayKey);
    });

    const shot = async (filename, desc, preserveModals = false) => {
      if (!preserveModals) {
        await page.evaluate(() => {
          document.querySelectorAll('.completion-modal-overlay:not(.interactive), #tour-welcome-toast, .spotlight-overlay, .spotlight-tooltip, #notification-toast-container').forEach(el => el.remove());
        });
      }
      await new Promise(r => setTimeout(r, 250));
      const primaryPath = path.join(OUTPUT_DIRS[0], filename);
      await page.screenshot({ path: primaryPath, fullPage: false });

      for (let i = 1; i < OUTPUT_DIRS.length; i++) {
        fs.copyFileSync(primaryPath, path.join(OUTPUT_DIRS[i], filename));
      }
      captured.push({ filename, desc });
      console.log(`[CAPTURED ${captured.length.toString().padStart(2, '0')}] ${filename} — ${desc}`);
    };

    // =========================================================================
    // SECTION 1: MAIN ENGLISH SINGULARITY APP (MOBILE)
    // =========================================================================
    console.log('\n--- SECTION 1: English Singularity Main App Views ---');

    // 01. Constellation Tree Deck
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('01-mobile-constellation-tree.png', 'Constellation Skill Tree (Mobile Deck Layout)');

    // 02. Skill Node Perk Modal
    try {
      await page.evaluate(() => {
        const node = document.querySelector('[data-node-id]') || document.querySelector('.constellation-node');
        if (node) node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
      await new Promise(r => setTimeout(r, 500));
      await shot('02-mobile-tree-node-modal.png', 'Constellation Perk Node Details Modal', true);
      await page.evaluate(() => {
        document.getElementById('skill-node-modal')?.remove();
      });
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn('Node modal error:', e.message);
    }

    // 03. Living Perspective Canvas
    await page.goto(`${BASE_URL}#singularity`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('03-mobile-singularity-canvas.png', 'Living Sea Urchin Perspective Canvas');

    // 04. Calm Reading Dossier
    await page.goto(`${BASE_URL}#read`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('04-mobile-reading-pass.png', 'Calm Reading Dossier (4-Pass Protocol)');

    // 05. Calm Reading Zen Immersion Mode
    try {
      await page.keyboard.press('KeyZ');
      await new Promise(r => setTimeout(r, 500));
      await shot('05-mobile-reading-zen.png', 'Calm Reading in Zen Immersion Mode');
      await page.keyboard.press('KeyZ');
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn('Zen mode error:', e.message);
    }

    // 06. Franklin Copywork Studio - Step 1 (Analyze & Scaffolding)
    await page.goto(`${BASE_URL}#write`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('06-mobile-writing-scaffold.png', 'Franklin Copywork Studio (Step 1: Structural Scaffolding)');

    // 07. Franklin Copywork Studio - Step 2 (Active Recall & Typing)
    try {
      await page.evaluate(() => {
        const btn = document.querySelector('.btn-proceed-type');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 400));
      const copyInput = await page.$('.copywork-input');
      if (copyInput) {
        await copyInput.type('Rarely have institutional investors witnessed such profound syntactic elegance.', { delay: 5 });
      }
      await new Promise(r => setTimeout(r, 400));
      await shot('07-mobile-writing-type.png', 'Franklin Copywork Studio (Step 2: Active Recall & Typing)');

      // 08. Franklin Copywork Studio - Step 3 (Myers Split-Diff & Telemetry)
      await page.evaluate(() => {
        const btn = document.querySelector('.btn-evaluate-type');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('08-mobile-writing-diff.png', 'Franklin Copywork Studio (Step 3: Myers Split-Diff & Telemetry)');
    } catch (e) {
      console.warn('Writing steps error:', e.message);
    }

    // 09. Active Listening & Phonetic Cloze
    await page.goto(`${BASE_URL}#listen`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('09-mobile-listening-transcription.png', 'Active Listening & Phonetic Cloze Transcription');

    // 10. Acoustic Speaking Studio
    await page.goto(`${BASE_URL}#speak`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('10-mobile-speaking-studio.png', 'Acoustic Speaking Studio (Nation 4-3-2 & Dual Oscilloscope)');

    // 11. Roguelike Vocabulary Vault
    await page.goto(`${BASE_URL}#vocab`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('11-mobile-vocabulary-vault.png', 'Roguelike Vocabulary Vault & SRS Flashcard');

    // 12. Collocations Vault (SRS Drill Mode)
    await page.goto(`${BASE_URL}#colloc`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('12-mobile-collocations-drill.png', '1,336 Collocations Vault (SRS Active Drill Mode)');

    // 13. Collocations Vault (Dictionary Table Mode)
    try {
      await page.evaluate(() => {
        const dictBtn = document.querySelector('[data-view="dictionary"]') || document.querySelector('.btn-view-dictionary');
        if (dictBtn) dictBtn.click();
      });
      await new Promise(r => setTimeout(r, 500));
      await shot('13-mobile-collocations-lexicon.png', 'Collocations Full Lexicon Table Search View');
    } catch (e) {
      console.warn('Collocations dict error:', e.message);
    }

    // 14. Syntactic Grammar Matrix
    await page.goto(`${BASE_URL}#grammar`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('14-mobile-grammar-matrix.png', 'Advanced Syntactic Grammar Matrix');

    // 15. 12 Tenses Master Vault - Random Drill
    await page.goto(`${BASE_URL}#tenses`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('15-mobile-tenses-random-drill.png', '12 Tenses Master Vault (102 Questions Random Drill)');

    // 16. 12 Tenses Master Vault - Codex Cards
    try {
      await page.evaluate(() => {
        const codexBtn = document.querySelector('[data-view="reference"]');
        if (codexBtn) codexBtn.click();
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('16-mobile-tenses-codex-cards.png', '12 Tenses Codex Reference Cards');
    } catch (e) {
      console.warn('Tenses codex error:', e.message);
    }

    // 17. 12 Tenses Master Vault - Gauntlet Challenge Diagnostic
    try {
      await page.evaluate(() => {
        const gauntletBtn = document.querySelector('[data-view="gauntlet"]');
        if (gauntletBtn) gauntletBtn.click();
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('17-mobile-tenses-gauntlet-challenge.png', '12-Tense Gauntlet Challenge Diagnostic');
    } catch (e) {
      console.warn('Tenses gauntlet error:', e.message);
    }

    // 18. Habits Mission Log
    await page.goto(`${BASE_URL}#habits`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('18-mobile-habits-mission-log.png', '30-Day Mission Log & Habit Tracker');

    // 19. Speed Blitz Mode
    await page.goto(`${BASE_URL}#blitz`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('19-mobile-speed-blitz.png', 'Speed Blitz 60-Second Roguelike Mode');

    // 20. CEFR Split-Screen Mediation Workbench
    await page.goto(`${BASE_URL}#mediate`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('20-mobile-mediation-workbench.png', 'CEFR Split-Screen Mediation Workbench');

    // 21. Telemetry & Learning Analytics Dossier
    await page.goto(`${BASE_URL}#analytics`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('21-mobile-analytics-dossier.png', 'Telemetry & Learning Analytics Dossier');

    // 22. IELTS CD-Exam Simulation Cockpit Dossier
    await page.goto(`${BASE_URL}#cockpit`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('22-mobile-exam-cockpit.png', 'IELTS CD-Exam Simulation Cockpit Dossier');

    // 23. Mobile Navigation Action Sheet Drawer
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const drawerBtn = document.querySelector('.btn-mobile-menu-drawer');
      if (drawerBtn) drawerBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await shot('23-mobile-navigation-drawer.png', 'Mobile Navigation Action Sheet Drawer', true);
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));

    // 24. Radial Quick-Navigation Corner Compass
    await page.goto(`${BASE_URL}#vocab`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const trigger = document.querySelector('.compass-trigger');
      if (trigger) trigger.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await shot('24-mobile-corner-compass.png', 'Radial Quick-Navigation Corner Compass Menu', true);

    // 25. Celestial Radar Pentagram Diagnostic Modal
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const radarBtn = document.querySelector('.btn-skill-radar');
      if (radarBtn) radarBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await shot('25-mobile-celestial-radar.png', 'CEFR Celestial Radar Multi-Skill Diagnostic Modal', true);
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));

    // 26. RPG Progression, XP Quests & Badges Modal
    await page.evaluate(() => {
      const pill = document.querySelector('.btn-progression-pill') || document.querySelector('.btn-streak-pill');
      if (pill) pill.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await shot('26-mobile-rpg-progression.png', 'RPG Progression, XP Quests & Rewards Modal', true);
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));

    // 27. Settings & Dual-Bus Audio Sliders Modal
    try {
      await page.evaluate(() => {
        const btn = document.querySelector('.btn-settings');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('27-mobile-settings-modal.png', 'Settings Modal (Dual-Bus Audio Sliders, Theme & Storage)', true);
      await page.keyboard.press('Escape');
      await page.evaluate(() => {
        document.getElementById('settings-modal')?.remove();
        document.querySelectorAll('.completion-modal-overlay, .mobile-action-sheet-overlay').forEach(el => el.remove());
      });
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn('Settings modal error:', e.message);
    }

    // 28. In-Text Lexicon Drawer
    try {
      await page.evaluate(() => {
        if (window.LexiconDrawer && typeof window.LexiconDrawer.open === 'function') {
          window.LexiconDrawer.open('ephemeral');
        }
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('28-mobile-lexicon-drawer.png', 'Universal In-Text Lexicon Drawer', true);
      await page.keyboard.press('Escape');
      await page.evaluate(() => {
        document.querySelectorAll('.lexicon-drawer, .completion-modal-overlay, .mobile-action-sheet-overlay').forEach(el => el.remove());
      });
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn('Lexicon drawer error:', e.message);
    }

    // 29. Spotlight Onboarding Tour
    try {
      await page.evaluate(() => {
        localStorage.removeItem('eng_spotlight_completed');
        if (window.SpotlightTour && typeof window.SpotlightTour.start === 'function') {
          window.SpotlightTour.start();
        }
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('29-mobile-spotlight-tour.png', 'Game-Style Spotlight Cutout Onboarding Tour', true);
      await page.keyboard.press('Escape');
      await page.evaluate(() => {
        document.querySelectorAll('.spotlight-overlay, .spotlight-tour, .completion-modal-overlay, .mobile-action-sheet-overlay').forEach(el => el.remove());
      });
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn('Spotlight tour error:', e.message);
    }

    // 30. Daily Streak Protection Toast Notification
    try {
      await page.evaluateOnNewDocument(() => {
        localStorage.removeItem('eng_streak_alert_day');
      });
      await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 700));
      await shot('30-mobile-streak-toast.png', 'Daily Streak Protection Alert Toast Notification', true);
    } catch (e) {
      console.warn('Streak toast error:', e.message);
    }

    // 30a. Intro Quick Placement Assessment (Find Your Level Initial Briefing)
    try {
      await page.evaluate(() => {
        document.querySelectorAll('.completion-modal-overlay, #tour-welcome-toast, #notification-toast-container').forEach(el => el.remove());
        if (window.PlacementQuiz && typeof window.PlacementQuiz.open === 'function') {
          window.PlacementQuiz.open();
        }
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('30a-mobile-placement-quiz-intro.png', 'Intro Quick Assessment (Find Your Level Initial Briefing)', true);

      // 30b. Intro Quick Placement Assessment (Adaptive Question Screen)
      await page.evaluate(() => {
        const startBtn = document.querySelector('.placement-start');
        if (startBtn) startBtn.click();
      });
      await new Promise(r => setTimeout(r, 500));
      await shot('30b-mobile-placement-quiz-question.png', 'Intro Quick Assessment (Active Adaptive Recall Question)', true);

      await page.keyboard.press('Escape');
      await page.evaluate(() => {
        document.querySelectorAll('.completion-modal-overlay').forEach(el => el.remove());
      });
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn('Placement quiz capture error:', e.message);
    }

    // =========================================================================
    // SECTION 2: ACADEMIC IELTS PLATFORM (IELTS.HTML ON MOBILE)
    // =========================================================================
    console.log('\n--- SECTION 2: Academic IELTS Platform Mobile Views ---');

    // 31. IELTS Portal Overview
    await page.goto(`${BASE_URL}ielts.html#home`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('31-mobile-ielts-overview.png', 'IELTS Academic Road to 7.0 Overview & Band Tracker');

    // 32. IELTS Diagnostic Assessment
    await page.goto(`${BASE_URL}ielts.html#diagnostic`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('32-mobile-ielts-diagnostic.png', 'IELTS Academic Diagnostic Assessment Test');

    // 33. IELTS Timed Reading Exam
    await page.goto(`${BASE_URL}ielts.html#reading`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('33-mobile-ielts-reading.png', 'IELTS Academic Timed Reading Exam & Questions Split');

    // 34. IELTS Reading Attack Drills & Synonym Lab
    await page.goto(`${BASE_URL}ielts.html#reading-drills`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('34-mobile-ielts-reading-drills.png', '14 Attack Drills & Synonym Lab (Reading Skills)');

    // 35. IELTS Listening Practice
    await page.goto(`${BASE_URL}ielts.html#listening`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('35-mobile-ielts-listening.png', 'IELTS Sections 1–4 Audio Practice & Questions');

    // 36. IELTS Listening Trap Lab
    await page.goto(`${BASE_URL}ielts.html#listening-traps`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('36-mobile-ielts-listening-traps.png', 'Trap & Self-Correction Audio Lab (Listening Skills)');

    // 37. IELTS Timed Writing Tasks
    await page.goto(`${BASE_URL}ielts.html#writing`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('37-mobile-ielts-writing.png', 'IELTS Timed Tasks 1 & 2 Automated Evaluator');

    // 38. IELTS Writing Studio & Architect
    await page.goto(`${BASE_URL}ielts.html#writing-studio`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('38-mobile-ielts-writing-studio.png', 'Visual Blueprints & 4-Sentence Architect Studio');

    // 39. IELTS Speaking Prompts & Notepad
    await page.goto(`${BASE_URL}ielts.html#speaking`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('39-mobile-ielts-speaking.png', 'IELTS Speaking Prompts & Audio Notepad');

    // 40. IELTS 3-Part Examiner Simulator
    await page.goto(`${BASE_URL}ielts.html#speaking-simulator`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('40-mobile-ielts-speaking-simulator.png', '3-Part Examiner Simulator & Fluency Meter');

    // 41. IELTS Master Topic Lexicon
    await page.goto(`${BASE_URL}ielts.html#vocab`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 700));
    await shot('41-mobile-ielts-topic-lexicon.png', 'IELTS Master Lexicon (3,345 Vocab & 10,015 Collocations)');

    // 42. IELTS Tactical Strategy Codex
    await page.goto(`${BASE_URL}ielts.html#strategy`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('42-mobile-ielts-strategy-codex.png', 'IELTS Tactical Strategy Codex (46 Blueprints)');

    // 43. IELTS Knowledge Vault (746 Tips Articles)
    try {
      await page.goto(`${BASE_URL}ielts.html#strategy`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        const vaultTab = [...document.querySelectorAll('.ie-mode-btn')].find(b => /Vault/.test(b.textContent));
        if (vaultTab) vaultTab.click();
      });
      await new Promise(r => setTimeout(r, 700));
      await shot('43-mobile-ielts-knowledge-vault.png', 'IELTS Knowledge Vault (746 Tips Articles / 415k Words)');
    } catch (e) {
      console.warn('Knowledge vault error:', e.message);
    }

    // 44. IELTS Personalized Study Path
    await page.goto(`${BASE_URL}ielts.html#path`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('44-mobile-ielts-study-path.png', 'IELTS Personalized 12-Week Study Path');

    // 45. IELTS Full CD-Exam Mock Cockpit
    await page.goto(`${BASE_URL}ielts.html#mock`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('45-mobile-ielts-mock-exam.png', 'IELTS Full CD-Exam Mock Cockpit & Band Calculator');

  } catch (err) {
    console.error('Fatal error during capture:', err);
  } finally {
    await browser.close();
    server.close();
  }

  // Generate complete README in all target directories
  const indexMd = `# Complete Mobile Visual Audit Gallery (iPhone 14/15 — 390x844 Retina @2x)

Captured: **${new Date().toISOString()}**  
Total Mobile Views Captured: **${captured.length}**  

## Part 1: English Singularity C2 Mastery App (Mobile)
| # | Filename | View Title & Description |
|---|---|---|
${captured.slice(0, 30).map((c, i) => `| ${i + 1} | [\`${c.filename}\`](./${c.filename}) | **${c.desc}** |`).join('\n')}

## Part 2: Academic IELTS 7.0 Platform (Mobile)
| # | Filename | View Title & Description |
|---|---|---|
${captured.slice(30).map((c, i) => `| ${i + 31} | [\`${c.filename}\`](./${c.filename}) | **${c.desc}** |`).join('\n')}

---
*Captured with automated headless Chrome engine on mobile touch profile.*
`;

  OUTPUT_DIRS.forEach(dir => {
    fs.writeFileSync(path.join(dir, 'README.md'), indexMd, 'utf8');
  });

  console.log(`\n🎉 [ALL DONE] Captured all ${captured.length} mobile views successfully!`);
}

run();
