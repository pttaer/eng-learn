// web/scripts/capture-vivo-flow.cjs
// Captures full flow views specifically for the connected vivo V2445A (360x802 @ 3.0 DPR)
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.join(__dirname, '../dist');
const OUTPUT_DIR = path.resolve('E:/Eng/screenshots/vivo-360x802');
const ARTIFACT_DIR = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\b808481f-7c23-46d9-8eaa-6f047f6461b0';
const PORT = 4212;
const BASE_URL = `http://localhost:${PORT}/`;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
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

async function captureVivoFlow() {
  console.log('=== VIVO V2445A FULL FLOW VISUAL AUDIT (360x802, DPR 3.0) ===');
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
  const layoutIssues = [];

  try {
    const page = await browser.newPage();
    // Configure viewport matching Vivo V2445A exactly
    await page.setViewport({
      width: 360,
      height: 802,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('eng_theme', 'dark');
      localStorage.setItem('eng_locale', 'vi');
      localStorage.setItem('singularity_locale', 'vi');
      localStorage.setItem('eng_onboarding_completed', 'true');
      localStorage.setItem('singularity_onboarding_completed', 'true');
      localStorage.setItem('singularity_tour_completed', 'true');
      localStorage.setItem('singularity_last_prompt_date', new Date().toISOString().slice(0, 10));
      localStorage.setItem('eng_placement_done', 'true');
      localStorage.setItem('eng_level', 'B2');
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

    const checkOverflow = async (screenName) => {
      const issue = await page.evaluate((name) => {
        const bodyScrollWidth = document.body.scrollWidth;
        const docScrollWidth = document.documentElement.scrollWidth;
        const windowWidth = window.innerWidth;
        const overflows = [];
        
        if (docScrollWidth > windowWidth + 1 || bodyScrollWidth > windowWidth + 1) {
          // Find culprit elements
          const allElements = document.querySelectorAll('*');
          for (const el of allElements) {
            const rect = el.getBoundingClientRect();
            if (rect.right > windowWidth + 1) {
              const cls = el.className || el.tagName;
              overflows.push(`${el.tagName}.${cls} (right: ${Math.round(rect.right)}px > ${windowWidth}px)`);
              if (overflows.length >= 5) break;
            }
          }
        }
        return {
          screen: name,
          hasOverflow: docScrollWidth > windowWidth + 1,
          docScrollWidth,
          windowWidth,
          overflowCulprits: overflows
        };
      }, screenName);

      if (issue.hasOverflow) {
        layoutIssues.push(issue);
        console.warn(`⚠️ [OVERFLOW DETECTED] ${screenName}: docWidth=${issue.docScrollWidth} > windowWidth=${issue.windowWidth}`);
        console.warn(`   Culprits:`, issue.overflowCulprits);
      }
    };

    const shot = async (filename, description, category) => {
      const targetPath = path.join(OUTPUT_DIR, filename);
      await page.screenshot({ path: targetPath, fullPage: false });
      const artifactPath = path.join(ARTIFACT_DIR, filename);
      fs.copyFileSync(targetPath, artifactPath);
      captured.push({ filename, path: targetPath, artifactPath, description, category });
      console.log(`[CAPTURED] ${filename} — ${description}`);
    };

    const safeCaptureView = async (urlHash, selector, filename, desc, cat) => {
      try {
        await page.goto(`${BASE_URL}${urlHash}`, { waitUntil: 'networkidle0', timeout: 12000 });
        if (selector) {
          await page.waitForSelector(selector, { timeout: 4000 });
        }
        await new Promise(r => setTimeout(r, 600));
        // Dismiss any transient toasts
        await page.evaluate(() => {
          document.querySelectorAll('.apple-toast, .streak-alert-toast, .toast-notification, [role="alert"]').forEach(el => el.remove());
        });
        await checkOverflow(desc);
        await shot(filename, desc, cat);
      } catch (err) {
        console.warn(`[WARN] Could not capture ${filename}: ${err.message}`);
        try {
          await shot(filename, desc, cat);
        } catch (_) {}
      }
    };

    // --- 1. ENGLISH SINGULARITY FLOWS ---
    console.log('\n--- 1. English Singularity Core Flows ---');
    await safeCaptureView('#tree', '.skill-tree-view, .skill-tree-shell', 'vivo-01-tree.png', 'Skill Tree Constellation & Roadmap', 'Singularity');
    await safeCaptureView('#read', '.dossier-reading', 'vivo-02-reading.png', 'Intensive 4-Pass Reading & Mining', 'Singularity');
    await safeCaptureView('#write', '.copywork-studio', 'vivo-03-copywork.png', 'Benjamin Franklin Syntactic Copywork', 'Singularity');
    await safeCaptureView('#listen', '.dossier-listening', 'vivo-04-listening.png', 'Transcription & Phonetics Cloze', 'Singularity');
    await safeCaptureView('#speak', '.dossier-speaking', 'vivo-05-speaking.png', '4-3-2 Fluency Speaking Studio', 'Singularity');
    await safeCaptureView('#vocab', '.dossier-vocabulary', 'vivo-06-vocab.png', 'Roguelike Multi-Mode Vocabulary Vault', 'Singularity');
    await safeCaptureView('#colloc', '.dossier-collocations', 'vivo-07-collocations.png', '1000 Collocations Spaced Repetition', 'Singularity');
    await safeCaptureView('#grammar', '.dossier-grammar', 'vivo-08-grammar.png', 'C1/C2 Syntactic Matrix & Reversal', 'Singularity');
    await safeCaptureView('#blitz', '.blitz-dossier-shell', 'vivo-09-blitz.png', '60-Second Speed Blitz Sprint', 'Singularity');
    await safeCaptureView('#habits', '.dossier-habits', 'vivo-10-habits.png', 'Daily Mission Log & Habit Tracker', 'Singularity');
    await safeCaptureView('#settings', '.settings-dossier', 'vivo-11-settings.png', 'Executive Settings & Audio Tuning', 'Singularity');

    // --- 2. ACADEMIC IELTS FLOWS ---
    console.log('\n--- 2. Academic IELTS Flows ---');
    await safeCaptureView('ielts.html#home', '.ie-cards, .ie-title, h1', 'vivo-12-ielts-home.png', 'IELTS Road to 7.0 Hub', 'IELTS');
    await safeCaptureView('ielts.html#diagnostic', '.ie-title, .ie-diag, .ie-cards, h1', 'vivo-13-ielts-diagnostic.png', 'IELTS Diagnostic Radar & Gap Analysis', 'IELTS');
    await safeCaptureView('ielts.html#reading', '.ie-title, .ie-reading-hub-actions, .ie-cards', 'vivo-14-ielts-reading.png', 'IELTS Reading Passages & Question Formats', 'IELTS');
    await safeCaptureView('ielts.html#reading-drills', '.ie-title, .ie-drills, .ie-drill-card', 'vivo-15-ielts-reading-drills.png', 'IELTS 14 Reading Attack Drills Lab', 'IELTS');
    await safeCaptureView('ielts.html#listening', '.ie-title, .ie-cards, .ie-audio-controls', 'vivo-16-ielts-listening.png', 'IELTS Listening Studio Sections 1-4', 'IELTS');
    await safeCaptureView('ielts.html#listening-traps', '.ie-title, .ie-traps, .ie-traps-lab', 'vivo-17-ielts-listening-traps.png', 'IELTS Listening Traps & Distractor Lab', 'IELTS');
    await safeCaptureView('ielts.html#writing', '.ie-title, .ie-cards, .ie-writing-studio', 'vivo-18-ielts-writing.png', 'IELTS Writing Studio Task 1 & Task 2', 'IELTS');
    await safeCaptureView('ielts.html#writing-studio', '.ie-title, .ie-studio, .ie-blueprint', 'vivo-19-ielts-writing-blueprints.png', 'IELTS Paragraph Blueprint Architect', 'IELTS');
    await safeCaptureView('ielts.html#speaking', '.ie-title, .ie-cards, .ie-speaking', 'vivo-20-ielts-speaking.png', 'IELTS Speaking Studio Part 1-3 Prompts', 'IELTS');
    await safeCaptureView('ielts.html#strategy', '.ie-title, .ie-strategy, .ie-cards', 'vivo-21-ielts-strategy.png', 'IELTS Band 7 Strategy Codex', 'IELTS');
    await safeCaptureView('ielts.html#mock', '.ie-title, .cd-cockpit-shell, .ie-cards', 'vivo-22-ielts-mock.png', 'IELTS Full Mock Exam Station', 'IELTS');

    // --- 3. MODALS & DRAWERS ---
    console.log('\n--- 3. Modals & Action Sheets ---');
    // Mobile Drawer
    try {
      await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.btn-mobile-menu-drawer', { timeout: 4000 });
      await page.evaluate(() => {
        const btn = document.querySelector('.btn-mobile-menu-drawer');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 500));
      await checkOverflow('Mobile Menu Drawer');
      await shot('vivo-23-mobile-drawer.png', 'Mobile Executive Action Sheet Drawer', 'Modals');
    } catch (e) {
      console.warn('Mobile Drawer error:', e.message);
    }

    // RPG Progression Hub Modal
    try {
      await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        if (window.ProgressionModal) window.ProgressionModal.open();
      });
      await new Promise(r => setTimeout(r, 600));
      await checkOverflow('Progression Modal');
      await shot('vivo-24-progression-modal.png', 'RPG Progression Hub Modal', 'Modals');
      await page.evaluate(() => {
        document.querySelectorAll('.completion-modal-overlay, #progression-modal').forEach(el => el.remove());
      });
    } catch (e) {
      console.warn('Progression Modal error:', e.message);
    }

    // Placement Quiz Modal
    try {
      await page.goto(`${BASE_URL}#tree`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        if (window.PlacementQuiz) window.PlacementQuiz.open();
      });
      await new Promise(r => setTimeout(r, 600));
      await checkOverflow('Placement Quiz Modal');
      await shot('vivo-25-placement-quiz.png', 'CEFR Placement Quiz Modal', 'Modals');
    } catch (e) {
      console.warn('Placement Quiz error:', e.message);
    }

  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\n🎉 [COMPLETE] Successfully captured ${captured.length} views for Vivo V2445A (360x802)!`);
  console.log(`Layout Issues Detected: ${layoutIssues.length}`);
  if (layoutIssues.length > 0) {
    console.log(JSON.stringify(layoutIssues, null, 2));
  }
}

captureVivoFlow().catch(err => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});

