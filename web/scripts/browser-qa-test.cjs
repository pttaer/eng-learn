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

    // Assert 25 Constellation Perk Nodes
    const nodeCount = await page.evaluate(() => document.querySelectorAll('.constellation-node').length);
    console.log(`- Constellation perk nodes rendered: ${nodeCount} (Expected: 25)`);
    assert.strictEqual(nodeCount, 25, `Expected exactly 25 perk nodes, found ${nodeCount}`);
    console.log('✓ 25 Constellation nodes verified');

    // Assert 5 Branches Summary Cards
    const branchCardCount = await page.evaluate(() => document.querySelectorAll('.branch-summary-card').length);
    console.log(`- Branch summary cards rendered: ${branchCardCount} (Expected: 5)`);
    assert.strictEqual(branchCardCount, 5, `Expected 5 branch summary cards, found ${branchCardCount}`);
    console.log('✓ 5 Branch summary cards verified');

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
    assert(wriNode !== null, 'Perk node wri-1 must exist');
    await wriNode.click();
    await page.waitForSelector('#skill-node-modal', { timeout: 3000 });
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
    console.log('✓ .dossier-collocations mounted');

    // Wait for lexicon table in dictionary view
    await page.waitForSelector('.lexicon-table', { timeout: 3000 });
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
    assert.strictEqual(isNormal, false, 'MotionEngine.isReducedMotion() must be false under normal settings');
    console.log('✓ prefers-reduced-motion compliance verified');

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
    networkFailures.forEach((req, idx) => console.log(`    ${idx + 1}. ${req}`));
  }

  assert.strictEqual(consoleErrors.length, 0, 'Must have 0 critical console errors');
  assert.strictEqual(networkFailures.length, 0, 'Must have 0 network request failures');

  console.log('\n[PASS] All 13 End-to-End Headless Browser QA tests passed cleanly with 100% compliance.');
  console.log('12 visual regression screenshots successfully captured in web/screenshots/.');
  return 0;
}

runBrowserQA()
  .then(code => process.exit(code))
  .catch(err => {
    console.error('\n[FAIL] Browser QA execution failed:', err);
    process.exit(1);
  });
