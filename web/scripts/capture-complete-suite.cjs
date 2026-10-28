// web/scripts/capture-complete-suite.cjs
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.join(__dirname, '../dist');
const OUTPUT_DIR = path.resolve('E:/Eng/screenshots');
const PORT = 4210;
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

async function captureCompleteSuite() {
  console.log('=== COMPLETE VISUAL SUITE CAPTURE ENGINE ===');
  console.log(`Chrome: ${CHROME_PATH}`);
  console.log(`Serving dist from: ${DIST_DIR}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

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
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('eng_theme', 'dark');
      localStorage.setItem('eng_locale', 'vi');
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

    const shot = async (filename, description, category = 'General') => {
      const targetPath = path.join(OUTPUT_DIR, filename);
      await page.screenshot({ path: targetPath, fullPage: false });
      captured.push({ filename, path: targetPath, description, category });
      console.log(`[CAPTURED] ${filename} — ${description}`);
    };

    const safeCaptureView = async (urlHash, selector, filename, desc, cat) => {
      try {
        await page.goto(`${BASE_URL}${urlHash}`, { waitUntil: 'networkidle0' });
        if (selector) {
          await page.waitForSelector(selector, { timeout: 4000 });
        }
        await new Promise(r => setTimeout(r, 600));
        await shot(filename, desc, cat);
      } catch (err) {
        console.warn(`[WARN] Could not capture ${filename}: ${err.message}`);
        // Attempt fallback shot anyway
        try {
          await shot(filename, desc, cat);
        } catch (_) { }
      }
    };

    // =========================================================================
    // SECTION 1: ALL 17 ENGLISH SINGULARITY DESKTOP VIEWS
    // =========================================================================
    console.log('\n--- SECTION 1: English Singularity Core Suite (17 Desktop Views) ---');

    await safeCaptureView('#tree', '.skill-tree-view, .skill-tree-shell', 'view-01-tree.png', 'Constellation Skill Tree & Summit Roadmap', 'Singularity Views');
    await safeCaptureView('#singularity', '#canvas-2d', 'view-02-singularity.png', 'Living Sea Urchin Perspective Canvas', 'Singularity Views');
    await safeCaptureView('#read', '.dossier-reading', 'view-03-reading.png', 'Intensive 4-Pass Reading & Sentence Mining Dossier', 'Singularity Views');
    await safeCaptureView('#write', '.copywork-studio', 'view-04-writing.png', 'Benjamin Franklin Syntactic Copywork Dossier', 'Singularity Views');
    await safeCaptureView('#listen', '.dossier-listening', 'view-05-listening.png', 'Active Transcription & Phonetic Cloze Dossier', 'Singularity Views');
    await safeCaptureView('#speak', '.dossier-speaking', 'view-06-speaking.png', '4-3-2 Fluency & Dual-Oscilloscope Speaking Dossier', 'Singularity Views');
    await safeCaptureView('#vocab', '.dossier-vocabulary', 'view-07-vocabulary.png', 'Roguelike Multi-Mode Vocabulary Vault Dossier', 'Singularity Views');
    await safeCaptureView('#colloc', '.dossier-collocations', 'view-08-collocations.png', '1,000 Collocations Spaced Repetition Vault Dossier', 'Singularity Views');
    await safeCaptureView('#grammar', '.dossier-grammar', 'view-09-grammar.png', 'C1/C2 Syntactic Matrix & Reversal Dossier', 'Singularity Views');
    await safeCaptureView('#tenses', '.dossier-tenses', 'view-10-tenses.png', '12 Tenses Master Vault & Random Drill Dossier', 'Singularity Views');
    await safeCaptureView('#habits', '.dossier-habits', 'view-11-habits.png', '30-Day Daily Habit Tracker & Mission Log Dossier', 'Singularity Views');
    await safeCaptureView('#blitz', '.blitz-dossier-shell', 'view-12-blitz.png', '60-Second Roguelike Speed Blitz Sprint Dossier', 'Singularity Views');
    await safeCaptureView('#mediate', '.mediation-dossier-shell', 'view-13-mediation.png', 'CEFR C1/C2 Split-Screen Mediation Workbench Dossier', 'Singularity Views');
    await safeCaptureView('#analytics', '.analytics-dossier-shell', 'view-14-analytics.png', 'CEFR Analytics & SERL 2.0 Gauntlet Dossier', 'Singularity Views');
    await safeCaptureView('#cockpit', '.cd-cockpit-shell', 'view-15-cockpit.png', 'CD-IELTS 40-Question Official Exam Cockpit Dossier', 'Singularity Views');
    await safeCaptureView('#drills', '.drills-dossier', 'view-16-drills.png', 'Sound Lab & Professional Email Drills Dossier', 'Singularity Views');
    await safeCaptureView('#settings', '.settings-dossier', 'view-17-settings.png', 'Profile, Audio, Language & Backup Settings Dossier', 'Singularity Views');

    // =========================================================================
    // SECTION 2: ALL 14 ACADEMIC IELTS PLATFORM VIEWS (ielts.html)
    // =========================================================================
    console.log('\n--- SECTION 2: Academic IELTS 7.0 Suite (14 Desktop Views) ---');

    await safeCaptureView('ielts.html#home', '.ie-cards, .ie-title, h1', 'view-18-ielts-home.png', 'IELTS Academic Road to 7.0 Overview & Progress Summary', 'IELTS Views');
    await safeCaptureView('ielts.html#diagnostic', '.ie-title, .ie-diag, .ie-cards, h1', 'view-19-ielts-diagnostic.png', 'IELTS 4-Skill Full Diagnostic Assessment & Gap Radar', 'IELTS Views');
    await safeCaptureView('ielts.html#reading', '.ie-title, .ie-reading-hub-actions, .ie-cards', 'view-20-ielts-reading.png', 'IELTS Academic Reading Module & Timed Passages', 'IELTS Views');
    await safeCaptureView('ielts.html#reading-drills', '.ie-title, .ie-drills, .ie-drill-card', 'view-21-ielts-reading-drills.png', '14 Reading Attack Drills Lab (Skim, Scan, TFNG...)', 'IELTS Views');
    await safeCaptureView('ielts.html#listening', '.ie-title, .ie-cards, .ie-audio-controls', 'view-22-ielts-listening.png', 'IELTS Listening Studio (Sections 1–4 Audio Practice)', 'IELTS Views');
    await safeCaptureView('ielts.html#listening-traps', '.ie-title, .ie-traps, .ie-traps-lab', 'view-23-ielts-listening-traps.png', 'IELTS Listening Traps & Distractor Spotting Lab', 'IELTS Views');
    await safeCaptureView('ielts.html#writing', '.ie-title, .ie-cards, .ie-writing-studio', 'view-24-ielts-writing.png', 'IELTS Writing Studio (Task 1 & Task 2 Rubrics Evaluator)', 'IELTS Views');
    await safeCaptureView('ielts.html#writing-studio', '.ie-title, .ie-studio, .ie-blueprint', 'view-25-ielts-writing-studio.png', 'IELTS Writing Blueprints & Structural Paragraph Architect', 'IELTS Views');
    await safeCaptureView('ielts.html#speaking', '.ie-title, .ie-cards, .ie-speaking', 'view-26-ielts-speaking.png', 'IELTS Speaking Studio (Part 1–3 Prompts & Scratchpad)', 'IELTS Views');
    await safeCaptureView('ielts.html#speaking-simulator', '.ie-title, .ie-speaking-sim, .ie-cards', 'view-27-ielts-speaking-simulator.png', 'IELTS Speaking Examiner Simulator with Acoustic Feedback', 'IELTS Views');
    await safeCaptureView('ielts.html#vocab', '.ie-title, .ie-vocab, .ie-cards', 'view-28-ielts-vocab.png', 'Academic Vocabulary Engine (AWL & Band 7+ Lexicon)', 'IELTS Views');
    await safeCaptureView('ielts.html#path', '.ie-title, .ie-path, .ie-roadmap', 'view-29-ielts-path.png', 'IELTS Study Path & Summit Milestones to Band 7.5+', 'IELTS Views');
    await safeCaptureView('ielts.html#strategy', '.ie-title, .ie-strategy, .ie-cards', 'view-30-ielts-strategy.png', 'IELTS Band 7.0 Strategy Codex & Question Type Guides', 'IELTS Views');
    await safeCaptureView('ielts.html#mock', '.ie-title, .cd-cockpit-shell, .ie-cards', 'view-31-ielts-mock.png', 'IELTS Academic Full Mock Exam Station & Conversion Tables', 'IELTS Views');

    // =========================================================================
    // SECTION 3: ALL POPUPS, MODALS, DRAWERS & OVERLAYS (16 TYPES)
    // =========================================================================
    console.log('\n--- SECTION 3: Popups, Modals, Drawers & Overlays ---');

    // 32. Placement Quiz Modal
    try {
      await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        if (window.PlacementQuiz) window.PlacementQuiz.open();
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-01-placement-quiz.png', 'Placement Quiz Modal (CEFR Entry Assessment)', 'Modals & Popups');
      await page.evaluate(() => {
        document.querySelectorAll('.placement-quiz-modal, .completion-modal-overlay').forEach(el => el.remove());
      });
    } catch (e) {
      console.warn('Placement Quiz capture issue:', e.message);
    }

    // 33. Skill Node Detail Modal
    try {
      await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.constellation-node', { timeout: 4000 });
      await page.evaluate(() => {
        const node = document.querySelector('.constellation-node');
        if (node) node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-02-skill-node-detail.png', 'Skill Node Detail & Prerequisite Gating Modal', 'Modals & Popups');
      await page.evaluate(() => {
        const el = document.getElementById('skill-node-modal');
        if (el) el.remove();
      });
    } catch (e) {
      console.warn('Skill Node Modal capture issue:', e.message);
    }

    // 34. Multi-Skill CEFR Quiz & Celestial Radar Modal
    try {
      await page.evaluate(() => {
        if (window.MultiSkillQuizModal) window.MultiSkillQuizModal.open('radar');
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-03-celestial-radar-modal.png', 'Multi-Skill CEFR Quiz & Celestial Radar Pentagram Modal', 'Modals & Popups');
      await page.evaluate(() => {
        if (window.MultiSkillQuizModal) window.MultiSkillQuizModal.closeActive();
        document.querySelectorAll('.completion-modal-overlay').forEach(el => el.remove());
      });
    } catch (e) {
      console.warn('Celestial Radar capture issue:', e.message);
    }

    // 35. RPG Progression Modal
    try {
      await page.evaluate(() => {
        if (window.ProgressionModal) window.ProgressionModal.open();
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-04-rpg-progression.png', 'RPG Progression Hub (XP Level, Streaks & Badges)', 'Modals & Popups');
      await page.evaluate(() => {
        document.querySelectorAll('.completion-modal-overlay, #progression-modal').forEach(el => el.remove());
      });
    } catch (e) {
      console.warn('Progression Modal capture issue:', e.message);
    }

    // 36. Universal Sliding Lexicon Drawer
    try {
      await page.evaluate(() => {
        if (window.LexiconDrawer) window.LexiconDrawer.open('mitigate');
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-05-lexicon-drawer.png', 'Universal In-Text Sliding Lexicon Drawer', 'Modals & Popups');
      await page.evaluate(() => {
        if (window.LexiconDrawer) window.LexiconDrawer.close();
      });
    } catch (e) {
      console.warn('Lexicon Drawer capture issue:', e.message);
    }

    // 37. Smart Mistake Vault Modal
    try {
      await page.evaluate(() => {
        if (window.MistakeVault) window.MistakeVault.open();
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-06-mistake-vault.png', 'Smart Mistake Vault & Blitz Review Modal', 'Modals & Popups');
      await page.evaluate(() => {
        if (window.MistakeVault) window.MistakeVault.close();
        document.querySelectorAll('.completion-modal-overlay').forEach(el => el.remove());
      });
    } catch (e) {
      console.warn('Mistake Vault capture issue:', e.message);
    }

    // 38. Commute Hands-Free Audio Player Modal
    try {
      await page.evaluate(() => {
        if (window.CommuteAudioPlayer) window.CommuteAudioPlayer.open();
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-07-commute-player.png', 'Commute Hands-Free Audio Player Modal', 'Modals & Popups');
      await page.evaluate(() => {
        if (window.CommuteAudioPlayer) window.CommuteAudioPlayer.close();
        document.querySelectorAll('.completion-modal-overlay').forEach(el => el.remove());
      });
    } catch (e) {
      console.warn('Commute Player capture issue:', e.message);
    }

    // 39. Spotlight Onboarding Tour Overlay
    try {
      await page.evaluate(() => {
        if (window.SpotlightTour) window.SpotlightTour.start(true);
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-08-spotlight-tour.png', 'Spotlight Onboarding Guided Tour Cutout Overlay', 'Modals & Popups');
      await page.evaluate(() => {
        if (window.SpotlightTour) window.SpotlightTour.close();
      });
    } catch (e) {
      console.warn('Spotlight Tour capture issue:', e.message);
    }

    // 40. CEFR Level Picker Modal
    try {
      await page.evaluate(() => {
        if (window.__singularityApp && window.__singularityApp.headerHud) {
          window.__singularityApp.headerHud.openLevelPicker();
        }
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-09-level-picker.png', 'CEFR Level Picker Quick Modal', 'Modals & Popups');
      await page.evaluate(() => {
        document.querySelectorAll('.completion-modal-overlay, #level-picker-modal').forEach(el => el.remove());
      });
    } catch (e) {
      console.warn('Level Picker capture issue:', e.message);
    }

    // 41. Quick HUD Settings Modal
    try {
      await page.evaluate(() => {
        if (window.__singularityApp && window.__singularityApp.headerHud) {
          window.__singularityApp.headerHud.openSettingsModal();
        }
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-10-quick-hud-settings.png', 'Quick HUD Settings & Audio Bus Modal', 'Modals & Popups');
      await page.evaluate(() => {
        document.querySelectorAll('#settings-modal, .completion-modal-overlay').forEach(el => el.remove());
      });
    } catch (e) {
      console.warn('HUD Settings capture issue:', e.message);
    }

    // 42. CD-IELTS Exam Submission Confirmation Modal
    try {
      await page.goto(`${BASE_URL}#cockpit`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => {
        if (window.__singularityApp && window.__singularityApp.examCockpit) {
          window.__singularityApp.examCockpit.promptSubmitExam();
        }
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-11-exam-submission-confirm.png', 'Official CD-IELTS Submission Summary Confirmation Modal', 'Modals & Popups');
      await page.evaluate(() => {
        document.querySelectorAll('.completion-modal-overlay').forEach(el => el.remove());
      });
    } catch (e) {
      console.warn('Exam Submit Confirmation capture issue:', e.message);
    }

    // 43. Official Cambridge 9.0 Band Conversion Score Report Modal
    try {
      await page.evaluate(() => {
        if (window.__singularityApp && window.__singularityApp.examCockpit) {
          window.__singularityApp.examCockpit.openBandConversionModal({
            rawScore: 33,
            bandScore: 7.5,
            cefr: 'C1',
            descriptor: 'Good User',
            pct: 83,
            p1Correct: 12,
            p2Correct: 11,
            p3Correct: 10,
            tfngCorrect: 11,
            mcqCorrect: 11,
            gapCorrect: 11
          });
        }
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-12-cambridge-band-report.png', 'Official Cambridge 9.0 Band Score Conversion Report Modal', 'Modals & Popups');
      await page.evaluate(() => {
        const el = document.getElementById('cd-band-conversion-modal');
        if (el) el.remove();
      });
    } catch (e) {
      console.warn('Band Conversion Report capture issue:', e.message);
    }

    // 44. Routine Completion Receipt Modal
    try {
      await page.evaluate(() => {
        if (window.__singularityApp && typeof window.__singularityApp.showCompletionReceipt === 'function') {
          window.__singularityApp.showCompletionReceipt('FRANKLIN // SYNTACTIC COPYWORK MASTERED');
        }
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-13-completion-receipt.png', 'Mission Directive Routine Completion Receipt Modal', 'Modals & Popups');
      await page.evaluate(() => {
        document.querySelectorAll('.completion-modal-overlay').forEach(el => el.remove());
      });
    } catch (e) {
      console.warn('Completion Receipt capture issue:', e.message);
    }

    // 45. IELTS Strategy Tip Modal
    try {
      await page.goto(`${BASE_URL}ielts.html#strategy`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => {
        const card = document.querySelector('.ie-strategy-card') || document.querySelector('.ie-card');
        if (card) card.click();
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-14-ielts-strategy-tip.png', 'IELTS Question-Type Strategy Deep-Dive Modal', 'Modals & Popups');
    } catch (e) {
      console.warn('IELTS Strategy Tip capture issue:', e.message);
    }

    // 46. Zen Focus Mode Fullscreen Overlay
    try {
      await page.goto(`${BASE_URL}#read`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        if (window.ZenMode) window.ZenMode.setZenMode(true);
      });
      await new Promise(r => setTimeout(r, 500));
      await shot('popup-15-zen-focus-overlay.png', 'Calm Reading in Zen Focus Immersion Mode', 'Modals & Popups');
      await page.evaluate(() => {
        if (window.ZenMode) window.ZenMode.setZenMode(false);
      });
    } catch (e) {
      console.warn('Zen Focus capture issue:', e.message);
    }

    // 47. Mobile Menu Action Sheet Drawer (375x812)
    try {
      await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.btn-mobile-menu-drawer', { timeout: 4000 });
      await page.evaluate(() => {
        const btn = document.querySelector('.btn-mobile-menu-drawer');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 600));
      await shot('popup-16-mobile-menu-drawer.png', 'Mobile Executive Action Sheet & Navigation Drawer', 'Modals & Popups');
    } catch (e) {
      console.warn('Mobile Drawer capture issue:', e.message);
    }

    // =========================================================================
    // SECTION 4: MOBILE RESPONSIVE FLOWS (iPhone X 375x812)
    // =========================================================================
    console.log('\n--- SECTION 4: Mobile Responsive Flows (iPhone 375x812) ---');
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

    await safeCaptureView('#tree', '.skill-tree-view, .skill-tree-shell', 'flow-mobile-01-tree.png', 'Mobile Constellation Tree & Daily Quests', 'Mobile Flows');
    await safeCaptureView('#read', '.dossier-reading', 'flow-mobile-02-reading.png', 'Mobile Intensive Reading & Sentence Mining', 'Mobile Flows');
    await safeCaptureView('#write', '.copywork-studio', 'flow-mobile-03-copywork.png', 'Mobile Benjamin Franklin Syntactic Copywork', 'Mobile Flows');
    await safeCaptureView('#listen', '.dossier-listening', 'flow-mobile-04-listening.png', 'Mobile Active Transcription & Phonetics', 'Mobile Flows');
    await safeCaptureView('#speak', '.dossier-speaking', 'flow-mobile-05-speaking.png', 'Mobile 4-3-2 Fluency Speaking Studio', 'Mobile Flows');
    await safeCaptureView('#vocab', '.dossier-vocabulary', 'flow-mobile-06-vocab.png', 'Mobile Roguelike Vocabulary Vault', 'Mobile Flows');
    await safeCaptureView('#blitz', '.blitz-dossier-shell', 'flow-mobile-07-blitz.png', 'Mobile 60-Second Speed Blitz Sprint', 'Mobile Flows');
    await safeCaptureView('#cockpit', '.cd-cockpit-shell', 'flow-mobile-08-cockpit.png', 'Mobile CD-IELTS 40-Q Exam Cockpit', 'Mobile Flows');
    await safeCaptureView('ielts.html#home', '.ie-cards, .ie-title, h1', 'flow-mobile-09-ielts-home.png', 'Mobile IELTS Academic Road to 7.0 Hub', 'Mobile Flows');
    await safeCaptureView('ielts.html#writing', '.ie-title, .ie-cards, .ie-writing-studio', 'flow-mobile-10-ielts-writing.png', 'Mobile IELTS Writing Studio & Prompts', 'Mobile Flows');

  } finally {
    await browser.close();
    server.close();
  }

  // Generate complete index README.md
  const categories = ['Singularity Views', 'IELTS Views', 'Modals & Popups', 'Mobile Flows'];
  const sections = categories.map(cat => {
    const items = captured.filter(c => c.category === cat);
    return [
      `### ${cat} (${items.length} screenshots)`,
      '',
      ...items.map(c => `- **[${c.filename}](./${c.filename})** — *${c.description}*<br>\n  ![${c.description}](./${c.filename})\n`),
      ''
    ].join('\n');
  }).join('\n');

  const fullReadme = [
    '# Visual Showcase — English Singularity & IELTS 7.0 (Complete Suite)',
    '',
    `*Generated: ${new Date().toISOString()}*  `,
    `*Total Screenshots Captured: ${captured.length}*`,
    '',
    '## Catalog of Views & Popups',
    '',
    sections
  ].join('\n');

  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), fullReadme, 'utf8');

  console.log(`\n🎉 [ALL COMPLETE] Successfully captured all ${captured.length} views and popups!`);
  console.log(`Artifacts saved in: ${OUTPUT_DIR}`);
}

captureCompleteSuite().catch(err => {
  console.error('[ERROR] Complete capture failed:', err);
  process.exit(1);
});
