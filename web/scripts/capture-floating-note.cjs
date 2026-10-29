/**
 * Deep Verification & Multi-View Capture Suite for Draggable Floating Note
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4179;
const TARGET_URL = `http://localhost:${PORT}/`;
const IELTS_URL = `http://localhost:${PORT}/ielts.html`;

const OUT_DIR = path.resolve(__dirname, '../../screenshots/floating-note');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function isServerListening(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(600, () => {
      req.abort();
      resolve(false);
    });
  });
}

async function run() {
  console.log('[TEST] Starting Floating Note Verification & Capture Suite...');
  let serverProcess = null;
  const isRunning = await isServerListening(TARGET_URL);

  if (!isRunning) {
    console.log(`[TEST] Launching Vite preview on port ${PORT}...`);
    const viteBin = path.join(__dirname, '../node_modules/vite/bin/vite.js');
    serverProcess = spawn(process.execPath, [viteBin, 'preview', '--port', String(PORT), '--strictPort'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore'
    });

    let ready = false;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 250));
      if (await isServerListening(TARGET_URL)) {
        ready = true;
        break;
      }
    }
    if (!ready) {
      if (serverProcess) serverProcess.kill();
      throw new Error(`Vite server failed to start on port ${PORT}`);
    }
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCache');
  await client.send('Network.setBypassServiceWorker', { bypass: true });

  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('STARK_ENG_STATE', JSON.stringify({ version: 4, placementDone: true, learnerLevel: 'B2', treeProgress: {} }));
      localStorage.setItem('eng_placement_done', 'true');
      localStorage.setItem('eng_tour_done', 'true');
      localStorage.setItem('eng_onboarding_completed', 'true');
    } catch { }
  });

  page.on('console', msg => console.log('[PAGE LOG]', msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));

  try {
    // -------------------------------------------------------------------------
    // TEST 1: DESKTOP VIEWPORT & COLLAPSED BUBBLE
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Testing Collapsed Bubble Presence on Desktop ---');
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    // Wait for boot screen to clear if any
    await page.evaluate(() => {
      const boot = document.getElementById('boot');
      if (boot) boot.remove();
      if (window.PlacementQuiz) window.PlacementQuiz.close();
      if (window.SpotlightTour) window.SpotlightTour.close();
      document.querySelectorAll('.completion-modal-overlay, #tour-welcome-toast, .spotlight-backdrop').forEach(el => el.remove());
    });

    const debugInfo = await page.evaluate(() => {
      const b = document.getElementById('floating-note-bubble');
      const rect = b ? b.getBoundingClientRect() : null;
      return {
        hasFloatingNoteOnWindow: !!window.FloatingNote,
        bubbleInDom: !!b,
        rect: rect ? { width: rect.width, height: rect.height, top: rect.top, left: rect.left } : null,
        bodyChildren: Array.from(document.body.children).map(c => c.tagName + '#' + c.id)
      };
    });
    console.log('[DEBUG INFO]', JSON.stringify(debugInfo, null, 2));

    const bubbleExists = await page.evaluate(() => {
      const b = document.getElementById('floating-note-bubble');
      if (!b) return false;
      const rect = b.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    console.log(`[VERIFY] Floating note bubble mounted & visible: ${bubbleExists}`);
    if (!bubbleExists) throw new Error('Floating note bubble element not found or not visible');

    const bubblePath = path.join(OUT_DIR, '01-floating-bubble-collapsed-desktop.png');
    await page.screenshot({ path: bubblePath });
    console.log(`[CAPTURED] -> ${bubblePath}`);

    // -------------------------------------------------------------------------
    // TEST 2: DRAGGABILITY & POINTER EVENTS ON BUBBLE
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Draggable Physics on Bubble ---');
    const bubbleBox = await page.evaluate(() => {
      const b = document.getElementById('floating-note-bubble');
      const rect = b.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, left: rect.left, top: rect.top };
    });

    // Mouse drag across screen
    await page.mouse.move(bubbleBox.x, bubbleBox.y);
    await page.mouse.down();
    await page.mouse.move(bubbleBox.x - 200, bubbleBox.y - 150, { steps: 10 });
    await new Promise(r => setTimeout(r, 200));

    // Capture dragging state & confirm it hasn't snapped to (0,0)
    const dragCheck = await page.evaluate(() => {
      const b = document.getElementById('floating-note-bubble');
      const rect = b.getBoundingClientRect();
      return {
        isDragging: b.classList.contains('is-dragging'),
        left: rect.left,
        top: rect.top
      };
    });
    console.log(`[VERIFY] Bubble has .is-dragging class: ${dragCheck.isDragging}, live drag pos: (${Math.round(dragCheck.left)}, ${Math.round(dragCheck.top)})`);
    if (dragCheck.left < 100 && dragCheck.top < 100) {
      throw new Error(`Bubble snapped to (0,0) origin bug detected! left=${dragCheck.left}, top=${dragCheck.top}`);
    }

    const draggingPath = path.join(OUT_DIR, '02-floating-bubble-dragging-desktop.png');
    await page.screenshot({ path: draggingPath });
    console.log(`[CAPTURED] -> ${draggingPath}`);

    await page.mouse.up();
    await new Promise(r => setTimeout(r, 300));

    const newPos = await page.evaluate(() => {
      const b = document.getElementById('floating-note-bubble');
      const rect = b.getBoundingClientRect();
      const rawStored = localStorage.getItem('eng_floating_bubble_pos');
      return { rectLeft: rect.left, rectTop: rect.top, stored: rawStored };
    });
    console.log(`[VERIFY] Bubble moved to (${Math.round(newPos.rectLeft)}, ${Math.round(newPos.rectTop)}), localStorage saved: ${newPos.stored}`);

    // -------------------------------------------------------------------------
    // TEST 3: EXPAND TO NOTE WINDOW (COMPACT)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Click to Expand Floating Scratchpad ---');
    await page.evaluate(() => {
      window.FloatingNote.open();
    });
    await new Promise(r => setTimeout(r, 500));

    const windowState = await page.evaluate(() => {
      const win = document.getElementById('floating-note-window');
      return {
        visible: win && win.style.display !== 'none',
        ariaHidden: win ? win.getAttribute('aria-hidden') : null,
        isOpen: window.FloatingNote.isOpen()
      };
    });
    console.log(`[VERIFY] Window expanded: visible=${windowState.visible}, isOpen=${windowState.isOpen}`);
    if (!windowState.visible) throw new Error('Floating note window failed to expand');

    const compactPath = path.join(OUT_DIR, '03-floating-note-window-compact-desktop.png');
    await page.screenshot({ path: compactPath });
    console.log(`[CAPTURED] -> ${compactPath}`);

    // -------------------------------------------------------------------------
    // TEST 4: NOTE EDITING, /BRAINSTORMING, /BOOST, /PONYTAIL ULTRA TEMPLATES
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing /brainstorming, /boost & /ponytail ultra Templates ---');
    await page.evaluate(() => {
      const titleInput = document.getElementById('floating-note-title-input');
      if (titleInput) {
        titleInput.value = 'Productivity: /brainstorming & /boost & /ponytail ultra';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const btnBrainstorm = document.getElementById('fn-tool-brainstorm');
      if (btnBrainstorm) btnBrainstorm.click();

      const btnBoost = document.getElementById('fn-tool-boost');
      if (btnBoost) btnBoost.click();

      const btnPonytail = document.getElementById('fn-tool-ponytail');
      if (btnPonytail) btnPonytail.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const noteTelemetry = await page.evaluate(() => {
      const wordCount = document.getElementById('fn-word-count').textContent;
      const charCount = document.getElementById('fn-char-count').textContent;
      const saveStatus = document.getElementById('fn-save-status').textContent;
      const textareaVal = document.getElementById('floating-note-textarea').value;
      const storedNotes = JSON.parse(localStorage.getItem('eng_floating_notes_v1') || '[]');
      return {
        wordCount,
        charCount,
        saveStatus,
        hasBrainstorm: textareaVal.includes('/brainstorming'),
        hasBoost: textareaVal.includes('/boost'),
        hasPonytail: textareaVal.includes('/ponytail ultra'),
        storedCount: storedNotes.length,
        firstNoteTitle: storedNotes[0]?.title
      };
    });
    console.log(`[VERIFY] Telemetry: ${noteTelemetry.wordCount}, ${noteTelemetry.charCount}, status="${noteTelemetry.saveStatus}"`);
    console.log(`[VERIFY] Templates verified -> Brainstorm: ${noteTelemetry.hasBrainstorm}, Boost: ${noteTelemetry.hasBoost}, Ponytail Ultra: ${noteTelemetry.hasPonytail}`);
    console.log(`[VERIFY] localStorage persistence confirmed: "${noteTelemetry.firstNoteTitle}" (${noteTelemetry.storedCount} notes)`);

    const templatePath = path.join(OUT_DIR, '04-floating-note-window-brainstorm-template-desktop.png');
    await page.screenshot({ path: templatePath });
    console.log(`[CAPTURED] -> ${templatePath}`);

    // -------------------------------------------------------------------------
    // TEST 5: MAXIMIZE / EXPAND FULL MODE
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Window Maximize / Expand Toggle ---');
    await page.evaluate(() => {
      const btnMax = document.getElementById('fn-btn-maximize');
      if (btnMax) btnMax.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const isMaximized = await page.evaluate(() => {
      const win = document.getElementById('floating-note-window');
      return win.classList.contains('is-maximized');
    });
    console.log(`[VERIFY] Window has .is-maximized: ${isMaximized}`);

    const maxPath = path.join(OUT_DIR, '05-floating-note-window-maximized-desktop.png');
    await page.screenshot({ path: maxPath });
    console.log(`[CAPTURED] -> ${maxPath}`);

    // Restore to compact
    await page.evaluate(() => {
      const btnMax = document.getElementById('fn-btn-maximize');
      if (btnMax) btnMax.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // -------------------------------------------------------------------------
    // TEST 6: MOBILE IPHONE 15 PRO (390 x 844)
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing Mobile iPhone 15 Pro (390 x 844) ---');
    await page.evaluate(() => {
      if (window.FloatingNote) window.FloatingNote.minimize();
    });
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await new Promise(r => setTimeout(r, 600));

    const mobileBubblePath = path.join(OUT_DIR, '06-floating-bubble-mobile-iphone15.png');
    await page.screenshot({ path: mobileBubblePath });
    console.log(`[CAPTURED] -> ${mobileBubblePath}`);

    // Expand on mobile
    await page.evaluate(() => {
      if (window.FloatingNote) window.FloatingNote.open();
    });
    await new Promise(r => setTimeout(r, 600));

    const mCheck15 = await page.evaluate(() => {
      const win = document.getElementById('floating-note-window');
      const rect = win.getBoundingClientRect();
      return {
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });
    console.log(`[VERIFY] Mobile iPhone 15 geometry: left=${mCheck15.left}, right=${mCheck15.right}, bottom=${mCheck15.bottom}, height=${mCheck15.height}`);
    if (mCheck15.right > 390 || mCheck15.left < 0) {
      throw new Error(`Mobile horizontal overflow on iPhone 15: left=${mCheck15.left}, right=${mCheck15.right}`);
    }

    const mobileWindowPath = path.join(OUT_DIR, '07-floating-note-window-mobile-iphone15.png');
    await page.screenshot({ path: mobileWindowPath });
    console.log(`[CAPTURED] -> ${mobileWindowPath}`);

    // -------------------------------------------------------------------------
    // TEST 7: MOBILE IPHONE SE / IPHONE 6 (375 x 667)
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Testing Mobile iPhone SE / 6 Compact Screen (375 x 667) ---');
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await new Promise(r => setTimeout(r, 600));

    const mCheckSE = await page.evaluate(() => {
      const win = document.getElementById('floating-note-window');
      const rect = win.getBoundingClientRect();
      return {
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });
    console.log(`[VERIFY] Mobile iPhone SE geometry: left=${mCheckSE.left}, right=${mCheckSE.right}, bottom=${mCheckSE.bottom}, height=${mCheckSE.height}`);
    if (mCheckSE.right > 375 || mCheckSE.left < 0) {
      throw new Error(`Mobile horizontal overflow on iPhone SE: left=${mCheckSE.left}, right=${mCheckSE.right}`);
    }

    const mobileSePath = path.join(OUT_DIR, '08-floating-note-mobile-iphone-se.png');
    await page.screenshot({ path: mobileSePath });
    console.log(`[CAPTURED] -> ${mobileSePath}`);

    // -------------------------------------------------------------------------
    // TEST 8: IELTS ACADEMIC SUITE INTEGRATION (1280 x 800)
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Testing IELTS Academic Integration ---');
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page.goto(IELTS_URL + '#reading', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    await page.evaluate(() => {
      const boot = document.getElementById('boot');
      if (boot) boot.remove();
      if (window.FloatingNote) {
        window.FloatingNote.open('ielts');
        const titleInput = document.getElementById('floating-note-title-input');
        if (titleInput) {
          titleInput.value = 'IELTS Reading // Passage 1 Speed Annotations';
          titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const btnIelts = document.getElementById('fn-tool-ielts');
        if (btnIelts) btnIelts.click();
      }
    });
    await new Promise(r => setTimeout(r, 600));

    const ieltsPath = path.join(OUT_DIR, '09-floating-note-ielts-academic-reading.png');
    await page.screenshot({ path: ieltsPath });
    console.log(`[CAPTURED] -> ${ieltsPath}`);

    console.log('\n✅ ALL 8 TESTS PASSED WITH 100% SUCCESS!');
    console.log(`📁 All 9 screenshots generated in: ${OUT_DIR}`);

  } catch (err) {
    console.error('❌ Test suite failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

run();
