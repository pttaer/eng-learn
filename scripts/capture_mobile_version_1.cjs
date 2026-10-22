const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require(path.resolve(__dirname, '../web/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.resolve('E:/Eng/web/dist');
const OUTPUT_DIR_MOBILE = path.resolve('E:/Eng/Mobile/1.0.0');
const OUTPUT_DIR_SCREENSHOTS = path.resolve('E:/Eng/screenshots/Mobile/1.0.0');
const PORT = 4199;
const BASE_URL = `http://localhost:${PORT}/`;

[OUTPUT_DIR_MOBILE, OUTPUT_DIR_SCREENSHOTS].forEach(dir => {
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
  console.log('=== CAPTURING ALL MOBILE VIEWS FOR VERSION 1.0.0 ===');
  console.log(`Target Directories:\n  - ${OUTPUT_DIR_MOBILE}\n  - ${OUTPUT_DIR_SCREENSHOTS}`);

  const server = createStaticServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Server listening on ${BASE_URL}`);

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

    const todayKey = (() => {
      const d = new Date();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${m}-${day}`;
    })();

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

    // Second script removes streak alert key for shot-29 to capture the toast
    await page.evaluateOnNewDocument(() => {
      localStorage.removeItem('eng_streak_alert_day');
    });

    const shot = async (filename, desc, preserveModals = false) => {
      if (!preserveModals) {
        await page.evaluate(() => {
          document.querySelectorAll('.completion-modal-overlay, #tour-welcome-toast, .spotlight-overlay, .spotlight-tooltip, #notification-toast-container').forEach(el => el.remove());
        });
      }
      await new Promise(r => setTimeout(r, 200));
      const p1 = path.join(OUTPUT_DIR_MOBILE, filename);
      const p2 = path.join(OUTPUT_DIR_SCREENSHOTS, filename);
      await page.screenshot({ path: p1, fullPage: false });
      fs.copyFileSync(p1, p2);
      captured.push({ filename, desc });
      console.log(`[CAPTURED] ${filename} - ${desc}`);
    };

    // 1. Constellation Tree
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('01-mobile-constellation-tree.png', 'Constellation Skill Tree (Mobile Layout)');

    // 2. Reading Dossier
    await page.goto(`${BASE_URL}#read`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('02-mobile-reading-pass.png', 'Calm Reading Dossier (4-Pass Protocol)');

    // 3. Writing Copywork
    await page.goto(`${BASE_URL}#write`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('03-mobile-writing-copywork.png', 'Franklin Copywork Studio (Mobile)');

    // 4. Listening Cloze
    await page.goto(`${BASE_URL}#listen`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('04-mobile-listening-transcription.png', 'Active Listening & Phonetic Cloze');

    // 5. Speaking Studio
    await page.goto(`${BASE_URL}#speak`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('05-mobile-speaking-studio.png', 'Acoustic Speaking Studio (Nation 4-3-2)');

    // 6. Vocabulary Vault
    await page.goto(`${BASE_URL}#vocab`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('06-mobile-vocabulary-vault.png', 'Roguelike Vocabulary Vault');

    // 7. Collocations Vault - Drill
    await page.goto(`${BASE_URL}#colloc`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('07-mobile-collocations-drill.png', '1,336 Collocations Vault (SRS Drill)');

    // 8. Collocations Vault - Full Lexicon Table
    await page.evaluate(() => {
      const dictBtn = document.querySelector('[data-view="dictionary"]') || document.querySelector('.btn-view-dictionary');
      if (dictBtn) dictBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await shot('08-mobile-collocations-lexicon.png', 'Collocations Full Lexicon Table (Mobile)');

    // 9. Grammar Matrix
    await page.goto(`${BASE_URL}#grammar`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('09-mobile-grammar-matrix.png', 'Advanced Syntactic Grammar Matrix');

    // 10. 12 Tenses Master Vault - Random Drill
    await page.goto(`${BASE_URL}#tenses`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('10-mobile-tenses-random-drill.png', '12 Tenses Master Vault (102 Questions Random Drill)');

    // 11. 12 Tenses Master Vault - 12 Tenses Codex
    await page.evaluate(() => {
      const codexBtn = document.querySelector('[data-view="reference"]');
      if (codexBtn) codexBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await shot('11-mobile-tenses-codex-cards.png', '12 Tenses Codex Reference Cards');

    // 12. 12 Tenses Master Vault - Gauntlet Challenge
    await page.evaluate(() => {
      const gauntletBtn = document.querySelector('[data-view="gauntlet"]');
      if (gauntletBtn) gauntletBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await shot('12-mobile-tenses-gauntlet-challenge.png', '12-Tense Gauntlet Challenge (Diagnostic)');

    // 13. Habits Mission Log
    await page.goto(`${BASE_URL}#habits`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('13-mobile-habits-mission-log.png', '30-Day Mission Log & Habit Tracker');

    // 14. Speed Blitz Mode
    await page.goto(`${BASE_URL}#blitz`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('14-mobile-speed-blitz.png', 'Speed Blitz 60-Second Roguelike Mode');

    // 15. Mobile Navigation Action Sheet Drawer
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const drawerBtn = document.querySelector('.btn-mobile-menu-drawer');
      if (drawerBtn) drawerBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await shot('15-mobile-navigation-drawer.png', 'Mobile Navigation Action Sheet Drawer');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));

    // 16. Radial Corner Compass Menu
    await page.goto(`${BASE_URL}#vocab`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const trigger = document.querySelector('.compass-trigger');
      if (trigger) trigger.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await shot('16-mobile-corner-compass.png', 'Radial Quick-Navigation Corner Compass');

    // 17. Celestial Radar Diagnostic Modal
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const radarBtn = document.querySelector('.btn-skill-radar');
      if (radarBtn) radarBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await shot('17-mobile-celestial-radar.png', 'CEFR Celestial Radar Multi-Skill Diagnostic', true);
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));

    // 18. RPG Progression & Level Quests Modal
    await page.evaluate(() => {
      const pill = document.querySelector('.btn-progression-pill') || document.querySelector('.btn-streak-pill');
      if (pill) pill.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await shot('18-mobile-rpg-progression.png', 'RPG Progression, XP Quests & Rewards Modal', true);
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));

    // 19. Corner Version Tag (v1.0.0)
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await shot('19-mobile-corner-version-tag.png', 'Version 1.0.0 Display on Corner Overlay');

    // ------------------------------------------------------------------------
    // SECTION 2: IELTS SUITE (MOBILE 390x844)
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: IELTS Suite Views (Mobile) ---');

    // 20. IELTS Portal Overview
    await page.goto(`${BASE_URL}ielts.html`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('20-mobile-ielts-overview.png', 'IELTS Portal Hub (Mobile)');

    // 21. IELTS Reading Simulator
    await page.goto(`${BASE_URL}ielts.html#reading`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('21-mobile-ielts-reading.png', 'IELTS Reading Simulation (400 Questions Bank)');

    // 22. IELTS Listening Simulator
    await page.goto(`${BASE_URL}ielts.html#listening`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('22-mobile-ielts-listening.png', 'IELTS Listening Simulation (240 Questions Bank)');

    // 23. IELTS Writing Studio
    await page.goto(`${BASE_URL}ielts.html#writing`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('23-mobile-ielts-writing.png', 'IELTS Writing Studio (76 Band 9 Model Essays)');

    // 24. IELTS Speaking Simulator
    await page.goto(`${BASE_URL}ielts.html#speaking`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('24-mobile-ielts-speaking.png', 'IELTS Speaking Simulator (60 Cue Cards)');

    // 25. IELTS Master Topic Lexicon
    await page.goto(`${BASE_URL}ielts.html#vocab`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 700));
    await shot('25-mobile-ielts-topic-lexicon.png', 'IELTS Master Lexicon (3,345 Vocab & 10,015 Collocations)');

    // 26. IELTS Tactical Strategy Codex
    await page.goto(`${BASE_URL}ielts.html#strategy`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('26-mobile-ielts-strategy-codex.png', 'IELTS Tactical Strategy Codex (46 Blueprints)');

    // 27. IELTS Knowledge Vault (746 Tips Articles)
    await page.evaluate(() => {
      const vaultBtn = document.querySelector('[data-mode="vault"]');
      if (vaultBtn) vaultBtn.click();
    });
    await new Promise(r => setTimeout(r, 700));
    await shot('27-mobile-ielts-knowledge-vault.png', 'IELTS Knowledge Vault (746 Tips Articles / 415k Words)');

    // 28. IELTS Full Mock Exam Cockpit
    await page.goto(`${BASE_URL}ielts.html#mock`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await shot('28-mobile-ielts-mock-exam.png', 'IELTS Full CD-Exam Mock Cockpit');

    // 29. Streak Protection Alert Toast (once per day, requires fresh load without the key set)
    await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    try {
      await page.waitForSelector('#notification-toast-container .notification-toast', { visible: true, timeout: 2000 });
    } catch (e) {
      console.warn('[WARNING] Streak notification toast did not appear within 2s. Notification check may be delayed. Shot captured anyway.');
    }
    await shot('29-mobile-streak-toast.png', 'Streak protection toast (once per day)', true);

  } catch (err) {
    console.error('Error during mobile capture:', err);
  } finally {
    await browser.close();
    server.close();
  }

  // Generate README in Mobile/1.0.0
  const readmeContent = `# English Singularity - Mobile Views (Version 1.0.0)

Total Screenshots Captured: **${captured.length}**  
Target Viewport: **390 x 844 (Retina DPR 2)**  
Generated At: **${new Date().toISOString()}**

## Captured Views Gallery

| # | View Name | Description | File |
|---|:---|:---|:---|
${captured.map((c, i) => `| ${i + 1} | **${c.desc}** | Mobile layout for ${c.desc} | [\`${c.filename}\`](./${c.filename}) |`).join('\n')}

---
*Generated automatically by whole-app mobile visual audit engine.*
`;

  fs.writeFileSync(path.join(OUTPUT_DIR_MOBILE, 'README.md'), readmeContent, 'utf8');
  fs.writeFileSync(path.join(OUTPUT_DIR_SCREENSHOTS, 'README.md'), readmeContent, 'utf8');
  console.log(`\n✓ SUCCESS: Captured ${captured.length} mobile screenshots to:\n  - ${OUTPUT_DIR_MOBILE}\n  - ${OUTPUT_DIR_SCREENSHOTS}`);
}

run();
