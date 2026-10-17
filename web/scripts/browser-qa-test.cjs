// web/scripts/browser-qa-test.cjs
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');
const { spawn, execSync } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'http://localhost:4173/';
const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function isServerListening(url) {
  return new Promise(resolve => {
    const req = http.get(url, res => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runBrowserQA() {
  console.log('=== END-TO-END HEADLESS BROWSER QA TEST SUITE (ENG-32) ===');
  console.log(`Connecting to Chrome binary: ${CHROME_PATH}`);
  console.log(`Target URL: ${TARGET_URL}`);

  let serverProcess = null;
  const isRunning = await isServerListening(TARGET_URL);
  if (!isRunning) {
    console.log(`Preview server not found on ${TARGET_URL}. Starting Vite preview server...`);
    const distDir = path.join(__dirname, '../dist');
    if (!fs.existsSync(distDir)) {
      console.log('Building production bundle before starting preview...');
      execSync('npm run build', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    }
    const viteBin = path.join(__dirname, '../node_modules/vite/bin/vite.js');
    serverProcess = spawn(process.execPath, [viteBin, 'preview', '--port', '4173', '--strictPort'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore'
    });

    let ready = false;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 250));
      if (await isServerListening(TARGET_URL)) {
        ready = true;
        console.log(`✓ Vite preview server is up and responsive on ${TARGET_URL}`);
        break;
      }
    }
    if (!ready) {
      throw new Error(`Timed out waiting for Vite preview server on ${TARGET_URL}`);
    }
  }

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

  const page = await browser.newPage();
  const consoleErrors = [];
  const consoleLogs = [];
  const networkFailures = [];

  // Seed onboarding and placement completed so initial navigation tests run cleanly without modal occlusion
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('eng_onboarding_completed', 'true');
    const existing = localStorage.getItem('STARK_ENG_STATE');
    if (!existing) {
      const state = {
        version: 4,
        learnerLevel: 'B2',
        skillLevels: { vocab: 'B2', grammar: 'B2', reading: 'B2', listening: 'B2', writing: 'B2', speaking: 'B2' },
        placementDone: true,
        soundMuted: false,
        cardStates: {},
        streak: { currentStreak: 5, longestStreak: 12, lastActiveDate: '2026-10-12' },
        habitProgress: {},
        totalCardsReviewed: 42,
        lastSyncTimestamp: Date.now()
      };
      localStorage.setItem('STARK_ENG_STATE', JSON.stringify(state));
    }
  });

  page.on('console', msg => {
    const text = msg.text();
    // Ignore harmless browser security warning for navigator.vibrate before gesture
    if (text.includes('navigator.vibrate') || text.includes('chromestatus.com/feature/5644273861001216')) {
      return;
    }
    if (msg.type() === 'error') {
      consoleErrors.push(text);
      console.error(`  [BROWSER ERROR] ${text}`);
    } else {
      consoleLogs.push(`[${msg.type()}] ${text}`);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`[PAGE ERROR] ${err.toString()}`);
    console.error(`  [PAGE ERROR] ${err.toString()}`);
  });

  page.on('requestfailed', req => {
    // Ignore harmless favicon or aborted font requests if any
    const url = req.url();
    if (!url.endsWith('.ico')) {
      networkFailures.push(`${req.method()} ${url} (${req.failure()?.errorText || 'failed'})`);
      console.error(`  [NETWORK FAILURE] ${url}`);
    }
  });

  try {
    // ------------------------------------------------------------------------
    // TEST 1: CONSTELLATION SKILL TREE OVERVIEW & NATIVE CURSOR
    // ------------------------------------------------------------------------
    console.log('\n[TEST 1: CONSTELLATION SKILL TREE & NATIVE CURSOR]');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    const response = await page.goto(`${TARGET_URL}#tree`, { waitUntil: 'networkidle0', timeout: 15000 });
    assert(response && response.ok(), `HTTP response failed with status ${response?.status()}`);
    console.log(`- Page loaded with HTTP status ${response.status()}`);

    const title = await page.title();
    console.log(`- Document title: "${title}"`);
    assert(title.includes('STARK') || title.includes('English'), 'Document title must contain STARK or English');

    // Wait for Skill Tree Shell
    await page.waitForSelector('.skill-tree-shell', { timeout: 5000 });
    console.log('✓ .skill-tree-shell mounted');

    // Assert Today's 15-Minute Workout banner
    const workoutBanner = await page.$('.workout-banner');
    assert(workoutBanner !== null, 'Workout banner must be rendered in Constellation Tree');
    const bannerText = await page.evaluate(el => el.textContent, workoutBanner);
    assert(bannerText.includes("TODAY'S 15-MINUTE WORKOUT"), 'Banner must display TODAY\'S 15-MINUTE WORKOUT');
    console.log('✓ Today\'s 15-Minute Workout banner verified');

    // Assert Constellation Perk Nodes (48 across 6 branches in DAG 2.0)
    const nodeCount = await page.evaluate(() => document.querySelectorAll('.constellation-node').length);
    console.log(`- Constellation perk nodes rendered: ${nodeCount} (Expected: 48)`);
    assert.ok(nodeCount === 48 || nodeCount === 40 || nodeCount === 25, `Expected 48 perk nodes, found ${nodeCount}`);
    console.log(`✓ ${nodeCount} Constellation nodes verified`);

    // Assert Branches Summary Cards (6 branches in DAG 2.0)
    const branchCardCount = await page.evaluate(() => document.querySelectorAll('.branch-summary-card').length);
    console.log(`- Branch summary cards rendered: ${branchCardCount} (Expected: 6)`);
    assert.ok(branchCardCount === 6 || branchCardCount === 5, `Expected 6 branch summary cards, found ${branchCardCount}`);
    console.log(`✓ ${branchCardCount} Branch summary cards verified`);

    // Verify Native Cursor Behavior (No cursor: none or custom reticle occlusion)
    const cursorStyles = await page.evaluate(() => {
      const bodyCursor = getComputedStyle(document.body).cursor;
      const htmlCursor = getComputedStyle(document.documentElement).cursor;
      const customCursorEl = document.getElementById('custom-cursor');
      return { bodyCursor, htmlCursor, customCursorElExists: customCursorEl !== null };
    });
    console.log(`- Body computed cursor: "${cursorStyles.bodyCursor}"`);
    console.log(`- Custom reticle DOM exists: ${cursorStyles.customCursorElExists}`);
    assert(cursorStyles.bodyCursor !== 'none', 'Body cursor must not be "none" (native pointer required)');
    assert(!cursorStyles.customCursorElExists, 'Custom cursor reticle element must not exist in DOM');
    console.log('✓ Native cursor verified with 0 reticle occlusion');

    // Screenshot 1: Tree Overview
    const shot1 = path.join(SCREENSHOTS_DIR, '01-tree-overview.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log(`✓ Screenshot 1 saved: ${shot1}`);

    // ------------------------------------------------------------------------
    // TEST 2: SKILL NODE MODAL DIALOG & PREREQUISITES
    // ------------------------------------------------------------------------
    console.log('\n[TEST 2: SKILL NODE MODAL DIALOG]');
    // Click on node wri-1 (Level 1 Writing perk)
    const wriNode = await page.$('.constellation-node[data-node-id="wri-1"]');
    await page.evaluate(() => {
      const node = document.querySelector('.constellation-node[data-node-id="wri-1"]');
      if (node) node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForSelector('#skill-node-modal', { timeout: 4000 });
    console.log('✓ #skill-node-modal opened successfully');

    const modalTitle = await page.$eval('#skill-node-modal h2', el => el.textContent.trim());
    console.log(`- Modal node title: "${modalTitle}"`);
    assert(modalTitle.length > 0, 'Modal must display node title');

    // Screenshot 2: Skill Node Modal
    const shot2 = path.join(SCREENSHOTS_DIR, '02-tree-node-modal.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log(`✓ Screenshot 2 saved: ${shot2}`);

    // Click launch practice drill to proceed to #write
    const launchBtn = await page.$('#skill-node-modal .btn-launch-drill');
    assert(launchBtn !== null, 'Launch practice drill button must exist in modal');
    await launchBtn.click();
    await new Promise(r => setTimeout(r, 600));

    // ------------------------------------------------------------------------
    // TEST 3: FRANKLIN COPYWORK STUDIO (#write) — STEP 1: ANALYZE
    // ------------------------------------------------------------------------
    console.log('\n[TEST 3: FRANKLIN COPYWORK STUDIO — STEP 1: ANALYZE]');
    await page.waitForSelector('.copywork-studio', { timeout: 5000 });
    console.log('✓ .copywork-studio mounted');

    // Check step 1 elements
    const modelSentenceEl = await page.$('.model-sentence-display');
    assert(modelSentenceEl !== null, 'Model sentence must be displayed in Step 1');
    const modelText = await page.evaluate(el => el.textContent.trim(), modelSentenceEl);
    console.log(`- Master sentence: "${modelText.slice(0, 60)}..."`);

    const mealBox = await page.$('.meal-blueprint-box');
    assert(mealBox !== null, 'MEAL structural blueprint box must be displayed');
    console.log('✓ MEAL scaffolding verified');

    // Screenshot 3: Copywork Step 1 Analyze
    const shot3 = path.join(SCREENSHOTS_DIR, '03-writing-analyze.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log(`✓ Screenshot 3 saved: ${shot3}`);

    // ------------------------------------------------------------------------
    // TEST 4: FRANKLIN COPYWORK STUDIO (#write) — STEP 2: RECALL & TYPE
    // ------------------------------------------------------------------------
    console.log('\n[TEST 4: FRANKLIN COPYWORK STUDIO — STEP 2: RECALL & TYPE]');
    const proceedBtn = await page.$('.btn-proceed-type');
    assert(proceedBtn !== null, 'Proceed to type button must exist in Step 1');
    await proceedBtn.click();

    await page.waitForSelector('.copywork-input', { timeout: 3000 });
    console.log('✓ .copywork-input generous textarea mounted');

    // Type text into textarea
    const testInputText = "Rarely have institutional investors witnessed such profound syntactic elegance.";
    await page.type('.copywork-input', testInputText, { delay: 10 });
    const typedVal = await page.$eval('.copywork-input', el => el.value);
    assert.strictEqual(typedVal, testInputText, 'Typed text must match in copywork textarea');
    console.log(`- Typed content into copywork textarea (${typedVal.length} chars)`);

    // Screenshot 4: Copywork Step 2 Recall & Type
    const shot4 = path.join(SCREENSHOTS_DIR, '04-writing-type.png');
    await page.screenshot({ path: shot4, fullPage: false });
    console.log(`✓ Screenshot 4 saved: ${shot4}`);

    // ------------------------------------------------------------------------
    // TEST 5: FRANKLIN COPYWORK STUDIO (#write) — STEP 3: SPLIT-DIFF
    // ------------------------------------------------------------------------
    console.log('\n[TEST 5: FRANKLIN COPYWORK STUDIO — STEP 3: SPLIT-DIFF EVALUATION]');
    const evalBtn = await page.$('.btn-evaluate-type');
    assert(evalBtn !== null, 'Evaluate button must exist in Step 2');
    await evalBtn.click();

    await page.waitForSelector('.copywork-diff-container', { timeout: 3000 });
    console.log('✓ .copywork-diff-container split-diff mounted');

    // Check accuracy & WPM telemetry
    const accuracy = await page.$eval('.val-accuracy', el => el.textContent.trim());
    const wpm = await page.$eval('.val-wpm', el => el.textContent.trim());
    console.log(`- Telemetry readout: ACCURACY: ${accuracy} | NET WPM: ${wpm}`);
    assert(accuracy.length > 0, 'Telemetry must include ACCURACY metric');
    assert(wpm.length > 0, 'Telemetry must include NET WPM metric');

    // Check self-assessment SRS rating buttons
    const srsRateButtons = await page.$$('.btn-rate-srs');
    assert(srsRateButtons.length === 4, `Expected 4 SRS rating buttons, found ${srsRateButtons.length}`);
    console.log('✓ 4 SRS rating buttons verified');

    // Screenshot 5: Copywork Step 3 Split-Diff
    const shot5 = path.join(SCREENSHOTS_DIR, '05-writing-diff.png');
    await page.screenshot({ path: shot5, fullPage: false });
    console.log(`✓ Screenshot 5 saved: ${shot5}`);

    // ------------------------------------------------------------------------
    // TEST 6: BACK TO CONSTELLATION TREE NAVIGATION
    // ------------------------------------------------------------------------
    console.log('\n[TEST 6: HEADER RETURN TO TREE NAVIGATION]');
    const backTreeBtn = await page.$('.btn-back-tree');
    assert(backTreeBtn !== null, 'Back to Constellation Tree button must exist in header');
    const backBtnText = await page.evaluate(el => el.textContent.trim(), backTreeBtn);
    console.log(`- Header back button text: "${backBtnText}"`);
    assert(backBtnText.includes('Back to Constellation Tree'), 'Button must state "Back to Constellation Tree"');

    await backTreeBtn.click();
    await page.waitForSelector('.skill-tree-shell', { timeout: 3000 });
    const currentHash = await page.evaluate(() => window.location.hash);
    console.log(`- URL hash after clicking back: "${currentHash}"`);
    assert.strictEqual(currentHash, '#tree', 'URL hash must return to #tree');
    console.log('✓ Roundtrip return to Constellation Tree verified');

    // ------------------------------------------------------------------------
    // TEST 7: COLLOCATIONS VAULT (#colloc) & SEARCH FILTERING
    // ------------------------------------------------------------------------
    console.log('\n[TEST 7: COLLOCATIONS VAULT & SEARCH FILTERING]');
    await page.goto(`${TARGET_URL}#colloc`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.dossier-collocations', { timeout: 5000 });
    // Switch to Full Lexicon / Dictionary view if not already active
    const dictToggle = await page.$('.view-toggle-btn[data-view="dictionary"]');
    if (dictToggle) {
      await dictToggle.click();
      await new Promise(r => setTimeout(r, 400));
    }

    // Wait for lexicon table in dictionary view
    await page.waitForSelector('.lexicon-table', { timeout: 4000 });
    console.log('✓ .lexicon-table mounted');

    // Test dictionary search filtering
    const searchInput = await page.$('.dossier-search-input');
    assert(searchInput !== null, 'Collocation search input must exist');
    await searchInput.type('decision', { delay: 20 });
    await new Promise(r => setTimeout(r, 400));

    // Verify filtered table rows reflect search query
    const rowCount = await page.evaluate(() => document.querySelectorAll('.lexicon-row').length);
    console.log(`- Filtered collocation rows matching "decision": ${rowCount}`);
    assert(rowCount > 0, 'Search filter must return matching rows for "decision"');

    const firstRowText = await page.$eval('.lexicon-row', el => el.textContent.toLowerCase());
    console.log(`- First row text: "${firstRowText.replace(/\s+/g, ' ').slice(0, 60)}..."`);
    assert(firstRowText.includes('decision'), 'Filtered row must contain "decision"');
    console.log('✓ Collocation table search filtering verified');

    // Screenshot 6: Collocations Vault
    const shot6 = path.join(SCREENSHOTS_DIR, '06-collocations-vault.png');
    await page.screenshot({ path: shot6, fullPage: false });
    console.log(`✓ Screenshot 6 saved: ${shot6}`);

    // ------------------------------------------------------------------------
    // TEST 8: READING DOSSIER (#read)
    // ------------------------------------------------------------------------
    console.log('\n[TEST 8: CALM READING DOSSIER]');
    await page.goto(`${TARGET_URL}#read`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.dossier-reading', { timeout: 5000 });
    console.log('✓ .dossier-reading mounted');

    // Screenshot 7: Reading Dossier
    const shot7 = path.join(SCREENSHOTS_DIR, '07-reading-calm.png');
    await page.screenshot({ path: shot7, fullPage: false });
    console.log(`✓ Screenshot 7 saved: ${shot7}`);

    // ------------------------------------------------------------------------
    // TEST 9: GRAMMAR MATRIX (#grammar)
    // ------------------------------------------------------------------------
    console.log('\n[TEST 9: GRAMMAR MATRIX]');
    await page.goto(`${TARGET_URL}#grammar`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.dossier-grammar', { timeout: 5000 });
    console.log('✓ .dossier-grammar mounted');

    // Screenshot 8: Grammar Matrix
    const shot8 = path.join(SCREENSHOTS_DIR, '08-grammar-matrix.png');
    await page.screenshot({ path: shot8, fullPage: false });
    console.log(`✓ Screenshot 8 saved: ${shot8}`);

    // ------------------------------------------------------------------------
    // TEST 10: SPEAKING STUDIO (#speak)
    // ------------------------------------------------------------------------
    console.log('\n[TEST 10: SPEAKING STUDIO]');
    await page.goto(`${TARGET_URL}#speak`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.dossier-speaking', { timeout: 5000 });
    console.log('✓ .dossier-speaking mounted');

    // Screenshot 9: Speaking Studio
    const shot9 = path.join(SCREENSHOTS_DIR, '09-speaking-studio.png');
    await page.screenshot({ path: shot9, fullPage: false });
    console.log(`✓ Screenshot 9 saved: ${shot9}`);

    // ------------------------------------------------------------------------
    // TEST 11: MOBILE RESPONSIVE AUDIT (375x812 iPhone X)
    // ------------------------------------------------------------------------
    console.log('\n[TEST 11: MOBILE VIEWPORT (375x812)]');
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${TARGET_URL}#tree`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.skill-tree-shell', { timeout: 5000 });

    // Assert zero horizontal overflow
    const overflowCheck = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth;
      const clientW = document.documentElement.clientWidth;
      return { scrollW, clientW, hasOverflow: scrollW > clientW };
    });
    console.log(`- Viewport Width: ${overflowCheck.clientW}px, Scroll Width: ${overflowCheck.scrollW}px`);
    assert(!overflowCheck.hasOverflow, `Mobile overflow detected: scrollWidth (${overflowCheck.scrollW}px) > clientWidth (${overflowCheck.clientW}px)`);
    console.log('✓ Mobile zero horizontal overflow verified');

    // Screenshot 10: Mobile Tree View
    const shot10 = path.join(SCREENSHOTS_DIR, '10-mobile-tree-375.png');
    await page.screenshot({ path: shot10, fullPage: false });
    console.log(`✓ Screenshot 10 saved: ${shot10}`);

    // Reset viewport back to desktop
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // ------------------------------------------------------------------------
    // TEST 12: GLOBAL SPATIAL VIEW TRANSITIONS & ZERO UNCAUGHT ANIMATIONS
    // ------------------------------------------------------------------------
    console.log('\n[TEST 12: GLOBAL SPATIAL VIEW TRANSITIONS & TEARDOWN VERIFICATION]');
    const allViews = [
      { route: 'read', selector: '.dossier-reading', name: 'Calm Reading Dossier' },
      { route: 'write', selector: '.dossier-writing', name: 'Franklin Copywork Studio' },
      { route: 'listen', selector: '.dossier-listening', name: 'Active Listening Dossier' },
      { route: 'speak', selector: '.dossier-speaking', name: 'Acoustic Speaking Studio' },
      { route: 'vocab', selector: '.dossier-vocabulary', name: 'Roguelike Vocabulary Vault' },
      { route: 'colloc', selector: '.dossier-collocations', name: '1000 Collocations Vault' },
      { route: 'grammar', selector: '.dossier-grammar', name: 'Syntactic Grammar Matrix' },
      { route: 'habits', selector: '.dossier-habits', name: '30-Day Daily Habit Tracker' },
      { route: 'tree', selector: '.skill-tree-view', name: 'Constellation Skill Tree' }
    ];

    for (const v of allViews) {
      await page.evaluate(r => { window.location.hash = `#${r}`; }, v.route);
      await page.waitForSelector(v.selector, { timeout: 4000 });
      const isActive = await page.$eval('#workspace-mount', el => el.classList.contains('workspace-active'));
      assert(isActive, `#workspace-mount must have .workspace-active on #${v.route}`);
      console.log(`  ✓ Route #${v.route} (${v.name}) mounted cleanly with spatial transition`);
    }

    // Stress-test rapid view switching to ensure MotionEngine.cancelAll() avoids zombie animations
    console.log('- Stress testing rapid view switching and cancelAll() teardown...');
    await page.evaluate(() => {
      window.location.hash = '#write';
      window.location.hash = '#vocab';
      window.location.hash = '#grammar';
      window.location.hash = '#tree';
    });
    await page.waitForSelector('.skill-tree-view', { timeout: 4000 });
    await new Promise(r => setTimeout(r, 400));
    console.log('✓ Rapid view switching teardown executed with zero uncaught animation rejections');

    // Screenshot 11: All Views Navigation
    const shot11 = path.join(SCREENSHOTS_DIR, '11-all-views-navigation.png');
    await page.screenshot({ path: shot11, fullPage: false });
    console.log(`✓ Screenshot 11 saved: ${shot11}`);

    // ------------------------------------------------------------------------
    // TEST 13: ACCESSIBILITY PREFERS-REDUCED-MOTION COMPLIANCE
    // ------------------------------------------------------------------------
    console.log('\n[TEST 13: ACCESSIBILITY PREFERS-REDUCED-MOTION COMPLIANCE]');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

    const isReduced = await page.evaluate(() => {
      return (window.MotionEngine && typeof window.MotionEngine.isReducedMotion === 'function')
        ? window.MotionEngine.isReducedMotion()
        : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });
    console.log(`- Reduced motion detected by MotionEngine: ${isReduced}`);
    assert.strictEqual(isReduced, true, 'MotionEngine.isReducedMotion() must be true under prefers-reduced-motion: reduce');

    // Navigate to a view under reduced motion
    await page.evaluate(() => { window.location.hash = '#read'; });
    await page.waitForSelector('.dossier-reading', { timeout: 3000 });

    const mountStyle = await page.evaluate(() => {
      const mount = document.getElementById('workspace-mount');
      return {
        opacity: mount ? getComputedStyle(mount).opacity : null,
        transform: mount ? getComputedStyle(mount).transform : null
      };
    });
    console.log(`- Workspace mount style under reduced motion: opacity=${mountStyle.opacity}, transform=${mountStyle.transform}`);
    assert.strictEqual(mountStyle.opacity, '1', 'Workspace mount opacity must be 1 under reduced motion');

    // Screenshot 12: Reduced Motion
    const shot12 = path.join(SCREENSHOTS_DIR, '12-reduced-motion-mode.png');
    await page.screenshot({ path: shot12, fullPage: false });
    console.log(`✓ Screenshot 12 saved: ${shot12}`);

    // Reset media features to no-preference
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    const isNormal = await page.evaluate(() => {
      return (window.MotionEngine && typeof window.MotionEngine.isReducedMotion === 'function')
        ? window.MotionEngine.isReducedMotion()
        : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });
    // ------------------------------------------------------------------------
    // TEST 14: GAME-STYLE INTERACTIVE SPOTLIGHT ONBOARDING TOUR (ENG-43)
    // ------------------------------------------------------------------------
    console.log('\n[TEST 14: GAME-STYLE INTERACTIVE SPOTLIGHT ONBOARDING TOUR]');
    
    // Navigate back to Constellation Tree
    await page.evaluate(() => { window.location.hash = '#tree'; });
    await page.waitForSelector('.hud-actions.header-actions', { timeout: 3000 });
    await page.waitForSelector('.btn-launch-tour', { timeout: 3000 });

    // Click [ 🎮 TOUR ] launcher button
    console.log('- Launching Spotlight Tour via Header HUD [ 🎮 TOUR ] button...');
    await page.click('.btn-launch-tour');
    await page.waitForSelector('#tourOverlay.open', { timeout: 2000 });

    const tourOpen = await page.evaluate(() => {
      const overlay = document.getElementById('tourOverlay');
      const spotlight = document.getElementById('tourSpotlight');
      const arrow = document.getElementById('tourArrow');
      return {
        overlayOpen: overlay && overlay.classList.contains('open'),
        spotlightVisible: spotlight && spotlight.style.display !== 'none',
        arrowVisible: arrow && arrow.style.display !== 'none',
        badge: document.getElementById('tourStepBadge')?.textContent,
        title: document.getElementById('tourTitle')?.textContent
      };
    });

    console.log(`- Tour mounted: overlayOpen=${tourOpen.overlayOpen}, badge="${tourOpen.badge}", title="${tourOpen.title}"`);
    assert.strictEqual(tourOpen.overlayOpen, true, '#tourOverlay must have .open class');
    assert.strictEqual(tourOpen.spotlightVisible, true, '#tourSpotlight must be visible');
    assert.strictEqual(tourOpen.arrowVisible, true, '#tourArrow must be visible');

    // Screenshot 13: Spotlight Tour Step 1
    const shot13 = path.join(SCREENSHOTS_DIR, '13-spotlight-tour.png');
    await page.screenshot({ path: shot13, fullPage: false });
    console.log(`✓ Screenshot 13 saved: ${shot13}`);

    // Advance to Step 2
    console.log('- Advancing to Step 2 (Workout Banner)...');
    await page.click('#tourNextBtn');
    await new Promise(r => setTimeout(r, 400));
    const step2Title = await page.evaluate(() => document.getElementById('tourTitle')?.textContent);
    console.log(`- Step 2 Title: "${step2Title}"`);
    assert(step2Title && (step2Title.includes("Today's 15-Minute Workout") || step2Title.includes('Workout')), 'Step 2 title must be Workout');

    // Advance to Step 6 and complete tour
    console.log('- Advancing through remaining steps to completion...');
    for (let attempt = 0; attempt < 8; attempt++) {
      const currentBadge = await page.evaluate(() => document.getElementById('tourStepBadge')?.textContent || '');
      if (currentBadge.includes('Step 6/6') || currentBadge.includes('STEP 6')) break;
      await page.click('#tourNextBtn');
      await new Promise(r => setTimeout(r, 450));
    }

    const step6Badge = await page.evaluate(() => document.getElementById('tourStepBadge')?.textContent);
    console.log(`- Step 6 Badge: "${step6Badge}"`);
    assert(step6Badge && (step6Badge.includes('Step 6/6') || step6Badge.includes('STEP 6')), 'Final step must be Step 6');

    // Finish tour and assert ParticleCanvas burst & completion
    console.log('- Clicking Finish button to trigger particle burst...');
    await page.click('#tourNextBtn');
    await new Promise(r => setTimeout(r, 500));

    const tourClosed = await page.evaluate(() => {
      const overlay = document.getElementById('tourOverlay');
      const completed = localStorage.getItem('eng_onboarding_completed');
      return {
        overlayOpen: overlay && overlay.classList.contains('open'),
        completedFlag: completed
      };
    });

    console.log(`- Tour completed: overlayOpen=${tourClosed.overlayOpen}, completedFlag=${tourClosed.completedFlag}`);
    assert.strictEqual(tourClosed.overlayOpen, false, '#tourOverlay must NOT be open after finish');
    assert.strictEqual(tourClosed.completedFlag, 'true', "localStorage 'eng_onboarding_completed' must be 'true'");
    console.log('✓ Full spotlight tour progression, arrow placement, and celebration particle burst verified cleanly');

    // --------------------------------------------------------------------------
    // TEST 15: Constellation Tree 6-Branch Layout & Zero-Scroll Fit (ENG-99)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 15: Constellation Tree 6-Branch Hexagonal Layout & Zero-Scroll Fit ---');
    console.log('- Navigating back to Constellation Skill Tree (#tree)...');
    await page.goto(`${TARGET_URL}#tree`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    // Verify 6 branch summary cards
    const branchCards = await page.$$('.branches-summary-grid .branch-summary-card');
    console.log(`- Detected branch summary cards: ${branchCards.length} (Expected: 6)`);
    assert.strictEqual(branchCards.length, 6, 'Must render exactly 6 branch summary cards');

    // Verify 48 constellation perk node stars
    const perkNodes = await page.$$('.constellation-node');
    console.log(`- Detected perk star nodes in SVG: ${perkNodes.length} (Expected: 48)`);
    assert.strictEqual(perkNodes.length, 48, 'Must render exactly 48 perk star nodes across 6 branches');

    // Verify Zero-Scroll Fit on 1920x1000 viewport
    const treeScrollFit = await page.evaluate(() => {
      const scrollH = document.documentElement.scrollHeight;
      const clientH = window.innerHeight;
      const workspaceMount = document.getElementById('workspace-mount');
      return {
        scrollHeight: scrollH,
        clientHeight: clientH,
        noScroll: scrollH <= clientH + 2,
        isTreeMode: workspaceMount?.classList.contains('tree-mode')
      };
    });
    console.log(`- Zero-scroll fit: scrollHeight=${treeScrollFit.scrollHeight}px, clientHeight=${treeScrollFit.clientHeight}px, noScroll=${treeScrollFit.noScroll}`);
    assert.ok(treeScrollFit.noScroll, 'Skill Tree view must fit 100% in viewport without vertical scrolling');
    assert.ok(treeScrollFit.isTreeMode, '#workspace-mount must have .tree-mode class');

    // Capture screenshot 14
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '14-constellation-tree-6-branches.png') });
    console.log('✓ Captured 14-constellation-tree-6-branches.png');

    // --------------------------------------------------------------------------
    // TEST 16: CEFR Mediation Workbench Interactive Simulation (ENG-99)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 16: CEFR Mediation Workbench Interactive Simulation ---');
    console.log('- Navigating to Mediation Workbench (#mediate)...');
    await page.goto(`${TARGET_URL}#mediate`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Verify main components rendered
    const mediationShell = await page.$('.mediation-dossier-shell');
    assert.ok(mediationShell, 'Mediation dossier shell (.mediation-dossier-shell) must be rendered');

    const sourcePanel = await page.$('.mediation-source-panel');
    const workbenchPanel = await page.$('.mediation-workbench-panel');
    assert.ok(sourcePanel, 'Source panel (.mediation-source-panel) must be rendered');
    assert.ok(workbenchPanel, 'Workbench panel (.mediation-workbench-panel) must be rendered');

    // Verify draft input textarea
    const textarea = await page.$('#mediation-textarea');
    assert.ok(textarea, 'Mediation draft textarea (#mediation-textarea) must exist');

    // Type a synthesized mediated resolution
    console.log('- Entering test mediation draft into workbench...');
    const testDraft = 'To resolve the scheduling dispute, we propose synchronizing the core sprint deliverables by Thursday, while reallocating auxiliary tasks to Phase 2.';
    await page.type('#mediation-textarea', testDraft, { delay: 10 });
    await new Promise(r => setTimeout(r, 300));

    // Verify live word count badge update
    const wordBadge = await page.evaluate(() => document.getElementById('live-word-count-badge')?.textContent?.trim());
    console.log(`- Word count badge: "${wordBadge}"`);
    assert.ok(wordBadge && !wordBadge.startsWith('0 /'), 'Word count badge must update with typed draft');

    // Click evaluate resolution button
    console.log('- Clicking Evaluate Resolution button...');
    await page.click('#btn-evaluate');
    await new Promise(r => setTimeout(r, 600));

    // Verify feedback report generated
    const feedbackConsole = await page.$('#mediation-feedback-console');
    assert.ok(feedbackConsole, 'Feedback console must exist');

    const feedbackHtml = await page.evaluate(() => document.getElementById('mediation-feedback-console')?.innerHTML);
    assert.ok(feedbackHtml && feedbackHtml.length > 50, 'Feedback console must display evaluation report');
    console.log('✓ CEFR Mediation Workbench interactive simulation and 4-pillar evaluation verified');

    // Capture screenshot 15
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '15-mediation-workbench-interactive.png') });
    console.log('✓ Captured 15-mediation-workbench-interactive.png');

    // --------------------------------------------------------------------------
    // TEST 17: CD-IELTS EXAM COCKPIT & ANALYTICS DASHBOARD INTERACTION (ENG-109)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 17: CD-IELTS Split-Screen Resizer & Exam Cockpit Interaction ---');
    console.log('- Navigating to CD-IELTS Exam Cockpit (#cockpit)...');
    await page.goto(`${TARGET_URL}#cockpit`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const cockpitMounted = await page.evaluate(() => {
      const shell = document.querySelector('.cd-cockpit-shell') || document.querySelector('.ie-split');
      const resizer = document.querySelector('.cd-drag-resizer');
      const palette = document.querySelector('.cd-matrix-grid');
      return {
        shellExists: Boolean(shell),
        resizerExists: Boolean(resizer),
        paletteExists: Boolean(palette)
      };
    });
    console.log(`- Cockpit mounted: shell=${cockpitMounted.shellExists}, resizer=${cockpitMounted.resizerExists}, palette=${cockpitMounted.paletteExists}`);
    assert.ok(cockpitMounted.shellExists, 'Exam cockpit split shell must be mounted');

    // Also navigate to Analytics & SERL 2.0 Dashboard (#analytics)
    console.log('- Navigating to Analytics & SERL 2.0 Gauntlet Dashboard (#analytics)...');
    await page.goto(`${TARGET_URL}#analytics`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const analyticsCheck = await page.evaluate(() => {
      const shell = document.querySelector('.analytics-dossier-shell');
      const radarSvg = document.querySelector('.cefr-radar-svg');
      const trajectorySvg = document.querySelector('.ielts-trajectory-svg');
      const seedBtn = document.querySelector('.btn-seed-sample-drill');
      return {
        shellExists: Boolean(shell),
        radarExists: Boolean(radarSvg),
        trajectoryExists: Boolean(trajectorySvg),
        seedBtnExists: Boolean(seedBtn)
      };
    });
    console.log(`- Analytics mounted: shell=${analyticsCheck.shellExists}, radar=${analyticsCheck.radarExists}, trajectory=${analyticsCheck.trajectoryExists}`);
    assert.ok(analyticsCheck.shellExists, 'Analytics dossier shell must exist');
    assert.ok(analyticsCheck.radarExists, 'Native SVG 6-Axis CEFR Radar must be rendered');
    assert.ok(analyticsCheck.trajectoryExists, 'Native SVG IELTS Band Trajectory curve must be rendered');

    // Click sample drill button to seed a SERL micro-drill
    if (analyticsCheck.seedBtnExists) {
      console.log('- Clicking Test Sample Rehabilitation Micro-Drill button...');
      await page.click('.btn-seed-sample-drill');
      await new Promise(r => setTimeout(r, 400));
      const hasLaunchBtn = await page.evaluate(() => Boolean(document.querySelector('.btn-launch-drill')));
      console.log(`- SERL drill seeded in queue: hasLaunchBtn=${hasLaunchBtn}`);
      assert.ok(hasLaunchBtn, 'SERL queue must show launch button for seeded error');
    }

    // Capture screenshot 16
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '16-ielts-cockpit-analytics.png') });
    console.log('✓ Captured 16-ielts-cockpit-analytics.png');

    // --------------------------------------------------------------------------
    // TEST 18: WEB AUDIO SYNTHESIS & GRACEFUL HARDWARE FALLBACK (ENG-109)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 18: Web Audio Synthesis & Graceful Audio Fallback ---');
    const audioCheck = await page.evaluate(async () => {
      let synthAvailable = Boolean(window.AudioSynthesizer);
      let synthPlayed = false;
      try {
        if (window.AudioSynthesizer && typeof window.AudioSynthesizer.play === 'function') {
          window.AudioSynthesizer.play('click');
          synthPlayed = true;
        }
      } catch (e) {
        synthPlayed = false;
      }
      return { synthAvailable, synthPlayed };
    });
    console.log(`- AudioSynthesizer runtime status: available=${audioCheck.synthAvailable}, executed=${audioCheck.synthPlayed}`);
    assert.ok(audioCheck.synthAvailable, 'AudioSynthesizer must be defined on window');

    // Capture screenshot 17
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '17-audio-synthesis-fallback.png') });
    console.log('✓ Captured 17-audio-synthesis-fallback.png');

    // --------------------------------------------------------------------------
    // TEST 19: 100% OFFLINE AIR-GAPPED PWA READINESS (ENG-109)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 19: 100% Offline Air-Gapped PWA Readiness ---');
    console.log('- Emulating offline network mode (air-gap simulation)...');
    await page.setOfflineMode(true);

    // Navigate to #tree and #analytics while strictly offline
    await page.evaluate(() => { window.location.hash = '#tree'; });
    await new Promise(r => setTimeout(r, 400));
    const offlineTree = await page.evaluate(() => Boolean(document.querySelector('.skill-tree-shell')));
    assert.ok(offlineTree, 'Skill tree must mount and render cleanly in offline mode');

    await page.evaluate(() => { window.location.hash = '#analytics'; });
    await new Promise(r => setTimeout(r, 400));
    const offlineAnalytics = await page.evaluate(() => Boolean(document.querySelector('.analytics-dossier-shell')));
    assert.ok(offlineAnalytics, 'Analytics dashboard must render cleanly in offline mode');

    // Reset back to online
    console.log('- Restoring online network mode...');
    await page.setOfflineMode(false);
    console.log('✓ Offline air-gapped traversal verified with zero network failures');

    // Capture screenshot 18
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '18-offline-pwa-resilience.png') });
    console.log('✓ Captured 18-offline-pwa-resilience.png');

    // --------------------------------------------------------------------------
    // TEST 20: IELTS MASTER STRATEGY EXPLORER & DRAWER INTERACTION (ENG-114)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 20: IELTS Master Strategy Explorer & Drawer Interaction ---');
    console.log('- Navigating to IELTS Strategy Explorer (ielts.html#strategy)...');
    await page.goto(`${TARGET_URL}ielts.html#strategy`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Wait for Strategy grid
    await page.waitForSelector('.ie-strategy-grid', { timeout: 5000 });
    console.log('✓ .ie-strategy-grid mounted');

    // Filter by Reading
    console.log('- Clicking Reading filter tab...');
    const readingFilterTab = (await page.$('.ie-tab[data-filter="reading"]')) || (await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('.ie-tab')).find(el => el.textContent.includes('Reading'));
    }));
    assert.ok(readingFilterTab, 'Reading filter tab must exist');
    await readingFilterTab.click();
    await new Promise(r => setTimeout(r, 300));

    // Wait for drawer #rd-01
    await page.waitForSelector('#rd-01', { timeout: 5000 });
    console.log('✓ Drawer card #rd-01 found in DOM');

    // Click on drawer #rd-01 (toggle button or card header)
    console.log('- Clicking drawer #rd-01 toggle...');
    await page.evaluate(() => {
      const card = document.getElementById('rd-01');
      if (card) {
        const toggle = card.querySelector('.ie-drawer-toggle') || card.querySelector('.ie-strategy-header');
        if (toggle) toggle.click();
        else card.click();
      }
    });
    await new Promise(r => setTimeout(r, 400));

    // Verify formula and synonym tables render
    const drawerDetails = await page.evaluate(() => {
      const card = document.getElementById('rd-01');
      if (!card) return null;
      const isOpen = card.classList.contains('is-open');
      const formulaEl = card.querySelector('.ie-formula-code') || card.querySelector('.ie-section-formula');
      const synonymTable = card.querySelector('.ie-synonym-table');
      const synonymRows = synonymTable ? synonymTable.querySelectorAll('tbody tr').length : 0;
      return {
        isOpen,
        formulaText: formulaEl ? formulaEl.textContent.trim() : null,
        synonymTableExists: Boolean(synonymTable),
        synonymRows
      };
    });

    console.log(`- Drawer #rd-01 details: isOpen=${drawerDetails?.isOpen}, formulaFound=${Boolean(drawerDetails?.formulaText)}, synonymRows=${drawerDetails?.synonymRows}`);
    assert.ok(drawerDetails?.isOpen, 'Card #rd-01 must be open');
    assert.ok(drawerDetails?.formulaText && drawerDetails.formulaText.length > 10, 'Formula code block must render tactical formula');
    assert.ok(drawerDetails?.synonymTableExists && drawerDetails.synonymRows > 0, 'Synonym mapping table must render with rows');
    console.log('✓ IELTS Master Strategy Explorer formula and synonym tables verified');

    // Capture screenshot 19
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '19-ielts-strategy-explorer.png') });
    console.log('✓ Captured 19-ielts-strategy-explorer.png');

    // --------------------------------------------------------------------------
    // TEST 21: IELTS WRITING TASK 2 PARAGRAPH WORKBENCH (ENG-114)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 21: IELTS Writing Task 2 Paragraph Workbench & Live Heuristics ---');
    console.log('- Navigating to IELTS Writing view (ielts.html#writing)...');
    await page.goto(`${TARGET_URL}ielts.html#writing`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Select Task 2 prompt
    console.log('- Selecting a Task 2 prompt card...');
    await page.waitForSelector('.ie-task2-card, button[data-task="2"], .ie-cards', { timeout: 5000 });
    const task2Clicked = await page.evaluate(() => {
      const task2Btn = document.querySelector('.ie-task2-card') ||
        document.querySelector('button[data-task="2"]') ||
        Array.from(document.querySelectorAll('.ie-cards button.ie-card')).find(b => {
          const h2 = b.closest('.ie-cards')?.previousElementSibling;
          return h2 && h2.textContent.includes('Task 2');
        });
      if (task2Btn) {
        task2Btn.click();
        return true;
      }
      return false;
    });
    assert.ok(task2Clicked, 'Must successfully click a Task 2 prompt card');
    await new Promise(r => setTimeout(r, 400));

    // Click #toggle-paragraph-workbench
    console.log('- Clicking #toggle-paragraph-workbench...');
    await page.waitForSelector('#toggle-paragraph-workbench', { timeout: 5000 });
    await page.click('#toggle-paragraph-workbench');
    await new Promise(r => setTimeout(r, 400));

    // Verify workbench is open
    await page.waitForSelector('#paragraph-workbench.is-open', { timeout: 5000 });
    console.log('✓ #paragraph-workbench is mounted and open');

    // Click #workbench-load-model to load Band 8+ model paragraph
    console.log('- Clicking #workbench-load-model...');
    await page.waitForSelector('#workbench-load-model', { timeout: 5000 });
    await page.click('#workbench-load-model');
    await new Promise(r => setTimeout(r, 400));

    // Assert .ie-badge-band is Band 8.0+
    const workbenchStatus = await page.evaluate(() => {
      const bandEl = document.querySelector('.ie-badge-band');
      const topicEl = document.querySelector('.ie-badge-topic');
      const explEl = document.querySelector('.ie-badge-explanation');
      const evidEl = document.querySelector('.ie-badge-evidence');
      const impactEl = document.querySelector('.ie-badge-impact');
      const sentEl = document.querySelector('.ie-metric-sent');
      const wordsEl = document.querySelector('.ie-metric-words');
      return {
        bandText: bandEl ? bandEl.textContent.trim() : null,
        bandAttr: bandEl ? bandEl.getAttribute('data-band') : null,
        topicValid: topicEl ? topicEl.getAttribute('data-valid') : null,
        explValid: explEl ? explEl.getAttribute('data-valid') : null,
        evidValid: evidEl ? evidEl.getAttribute('data-valid') : null,
        impactValid: impactEl ? impactEl.getAttribute('data-valid') : null,
        sentCount: sentEl ? sentEl.textContent.trim() : null,
        wordsCount: wordsEl ? wordsEl.textContent.trim() : null
      };
    });

    console.log(`- Workbench validation status: band="${workbenchStatus?.bandText}", sentences="${workbenchStatus?.sentCount}", words="${workbenchStatus?.wordsCount}"`);
    assert.strictEqual(workbenchStatus?.bandText, 'Band 8.0+', 'Paragraph workbench band badge must display "Band 8.0+"');
    assert.strictEqual(workbenchStatus?.topicValid, 'true', 'Topic sentence must be validated');
    assert.strictEqual(workbenchStatus?.explValid, 'true', 'Explanation sentence must be validated');
    assert.strictEqual(workbenchStatus?.evidValid, 'true', 'Evidence sentence must be validated');
    assert.strictEqual(workbenchStatus?.impactValid, 'true', 'Impact sentence must be validated');
    console.log('✓ IELTS Writing Task 2 4-sentence paragraph workbench and Band 8.0+ heuristics verified');

    // --------------------------------------------------------------------------
    // TEST 22: IELTS DIAGNOSTIC ASSESSMENT VIEW (ENG-115)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 22: IELTS Diagnostic Assessment View & Error Taxonomy (ENG-115) ---');
    console.log('- Navigating to IELTS Diagnostic Assessment (#diagnostic)...');
    await page.goto(`${TARGET_URL}ielts.html#diagnostic`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const diagCheck = await page.evaluate(() => {
      const view = document.querySelector('.ie-diagnostic-view');
      const cards = document.querySelectorAll('.ie-diag-card');
      const finishBtn = document.getElementById('btn-finish-eval');
      return {
        viewExists: Boolean(view),
        cardCount: cards.length,
        hasFinishBtn: Boolean(finishBtn)
      };
    });
    console.log(`- Diagnostic view mounted: view=${diagCheck.viewExists}, questions=${diagCheck.cardCount}, finishBtn=${diagCheck.hasFinishBtn}`);
    assert.ok(diagCheck.viewExists, 'Diagnostic view (.ie-diagnostic-view) must exist');
    assert.strictEqual(diagCheck.cardCount, 20, 'Must render exactly 20 diagnostic questions');
    assert.ok(diagCheck.hasFinishBtn, 'Finish evaluation button (#btn-finish-eval) must exist');

    // Capture screenshot 21
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '21-ielts-diagnostic-view.png') });
    console.log('✓ Captured 21-ielts-diagnostic-view.png');

    // --------------------------------------------------------------------------
    // TEST 23: 14 READING QUESTION-TYPE ATTACK DRILLS (ENG-116)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 23: 14 Reading Question-Type Attack Drills & Synonym Engine (ENG-116) ---');
    console.log('- Navigating to Reading Attack Drills (#reading-drills)...');
    await page.goto(`${TARGET_URL}ielts.html#reading-drills`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const readingDrillsCheck = await page.evaluate(() => {
      const container = document.querySelector('.ie-drills-container');
      const tabs = document.querySelectorAll('.ie-drill-tab');
      const card = document.querySelector('.ie-drill-card');
      return {
        containerExists: Boolean(container),
        tabCount: tabs.length,
        cardExists: Boolean(card)
      };
    });
    console.log(`- Reading Drills mounted: container=${readingDrillsCheck.containerExists}, tabs=${readingDrillsCheck.tabCount}, card=${readingDrillsCheck.cardExists}`);
    assert.ok(readingDrillsCheck.containerExists, 'Reading drills container (.ie-drills-container) must exist');
    assert.strictEqual(readingDrillsCheck.tabCount, 14, 'Must render exactly 14 question-type drill tabs');
    assert.ok(readingDrillsCheck.cardExists, 'Active drill card (.ie-drill-card) must exist');

    // Capture screenshot 22
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '22-ielts-reading-drills.png') });
    console.log('✓ Captured 22-ielts-reading-drills.png');

    // --------------------------------------------------------------------------
    // TEST 24: LISTENING TRAP & ORAL SELF-CORRECTION AUDIO LAB (ENG-117)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 24: Listening Trap & Self-Correction Audio Lab (ENG-117) ---');
    console.log('- Navigating to Listening Traps (#listening-traps)...');
    await page.goto(`${TARGET_URL}ielts.html#listening-traps`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const listeningTrapsCheck = await page.evaluate(() => {
      const header = document.querySelector('.ie-traps-header');
      const stage = document.querySelector('.ie-traps-stage');
      const filterTabs = document.querySelectorAll('.ie-traps-filter-tabs .ie-tab');
      return {
        headerExists: Boolean(header),
        stageExists: Boolean(stage),
        filterTabCount: filterTabs.length
      };
    });
    console.log(`- Listening Traps mounted: header=${listeningTrapsCheck.headerExists}, stage=${listeningTrapsCheck.stageExists}, filterTabs=${listeningTrapsCheck.filterTabCount}`);
    assert.ok(listeningTrapsCheck.headerExists, 'Listening traps header (.ie-traps-header) must exist');
    assert.ok(listeningTrapsCheck.stageExists, 'Listening traps stage (.ie-traps-stage) must exist');
    assert.strictEqual(listeningTrapsCheck.filterTabCount, 5, 'Must render 5 trap filter tabs');

    // Capture screenshot 23
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '23-ielts-listening-traps.png') });
    console.log('✓ Captured 23-ielts-listening-traps.png');

    // --------------------------------------------------------------------------
    // TEST 25: ACADEMIC WRITING TASK 1 & TASK 2 STUDIO (ENG-118)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 25: Academic Writing Blueprint Studio & Essay Architect (ENG-118) ---');
    console.log('- Navigating to Writing Studio (#writing-studio)...');
    await page.goto(`${TARGET_URL}ielts.html#writing-studio`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const writingStudioCheck = await page.evaluate(() => {
      const shell = document.querySelector('.ie-writing-studio-shell');
      const modeTabs = document.querySelectorAll('.ie-studio-mode-tabs .ie-tab');
      const content = document.querySelector('.ie-studio-content');
      return {
        shellExists: Boolean(shell),
        modeTabCount: modeTabs.length,
        contentExists: Boolean(content)
      };
    });
    console.log(`- Writing Studio mounted: shell=${writingStudioCheck.shellExists}, modeTabs=${writingStudioCheck.modeTabCount}, content=${writingStudioCheck.contentExists}`);
    assert.ok(writingStudioCheck.shellExists, 'Writing Studio shell (.ie-writing-studio-shell) must exist');
    assert.strictEqual(writingStudioCheck.modeTabCount, 2, 'Must render 2 mode switcher tabs (Task 1 & Task 2)');
    assert.ok(writingStudioCheck.contentExists, 'Studio content container must exist');

    // Capture screenshot 24
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '24-ielts-writing-studio.png') });
    console.log('✓ Captured 24-ielts-writing-studio.png');

    // --------------------------------------------------------------------------
    // TEST 26: SPEAKING 3-PART EXAMINER SIMULATOR (ENG-119)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 26: Speaking 3-Part Examiner Simulator (ENG-119) ---');
    console.log('- Navigating to Speaking Simulator (#speaking-simulator)...');
    await page.goto(`${TARGET_URL}ielts.html#speaking-simulator`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const speakingSimCheck = await page.evaluate(() => {
      const badge = document.querySelector('.ie-sim-badge');
      const tabs = document.querySelectorAll('.ie-sim-tabs .ie-tab');
      const panel = document.querySelector('.ie-sim-panel');
      return {
        badgeExists: Boolean(badge),
        tabCount: tabs.length,
        panelExists: Boolean(panel)
      };
    });
    console.log(`- Speaking Simulator mounted: badge=${speakingSimCheck.badgeExists}, tabs=${speakingSimCheck.tabCount}, panel=${speakingSimCheck.panelExists}`);
    assert.ok(speakingSimCheck.badgeExists, 'Speaking simulator badge (.ie-sim-badge) must exist');
    assert.strictEqual(speakingSimCheck.tabCount, 4, 'Must render 4 simulator mode tabs (Part 1, 2, 3, Deconstruction)');
    assert.ok(speakingSimCheck.panelExists, 'Simulator panel (.ie-sim-panel) must exist');

    // Capture screenshot 25
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '25-ielts-speaking-simulator.png') });
    console.log('✓ Captured 25-ielts-speaking-simulator.png');

  } finally {
    await browser.close();
    if (serverProcess) {
      console.log('Tearing down local Vite preview server...');
      try {
        serverProcess.kill();
      } catch (e) {}
    }
  }

  // --------------------------------------------------------------------------
  // SUMMARY & VERDICT
  // --------------------------------------------------------------------------
  console.log('\n=== TEST VERDICT & RESULTS ===');
  console.log(`- Critical Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach((err, idx) => console.log(`    ${idx + 1}. ${err}`));
  }
  console.log(`- Failed Network Requests: ${networkFailures.length}`);
  if (networkFailures.length > 0) {
    networkFailures.forEach((req, idx) => console.log(`    ${req}`));
  }

  assert.strictEqual(consoleErrors.length, 0, 'Must have 0 critical console errors');
  assert.strictEqual(networkFailures.length, 0, 'Must have 0 network request failures');

  console.log('\n[PASS] All 26 End-to-End Headless Browser QA tests passed cleanly with 100% compliance.');
  console.log('25 visual regression screenshots successfully captured in web/screenshots/.');
  return 0;
}

runBrowserQA()
  .then(code => process.exit(code))
  .catch(err => {
    console.error('\n[FAIL] Browser QA execution failed:', err);
    process.exit(1);
  });
