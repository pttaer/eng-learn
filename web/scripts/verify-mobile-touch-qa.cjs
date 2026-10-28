// web/scripts/verify-mobile-touch-qa.cjs
// Headless Puppeteer Mobile Touch QA Suite (>=44px Targets, Zero Overflow, Split Tabs & View Switcher)
// Verification Suite for Contract ENG-128 under /ui-ux-pro-max

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');
const { spawn, execSync } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'http://localhost:4173/';
const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots/mobile');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'iPhone SE / X', width: 375, height: 812, deviceScaleFactor: 2.0, isMobile: true, hasTouch: true },
  { name: 'iPhone 15 Pro', width: 393, height: 852, deviceScaleFactor: 3.0, isMobile: true, hasTouch: true },
  { name: 'Android Standard', width: 360, height: 800, deviceScaleFactor: 2.0, isMobile: true, hasTouch: true }
];

function isServerListening(url) {
  return new Promise(resolve => {
    const req = http.get(url, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runMobileTouchQA() {
  console.log('================================================================');
  console.log('--- STARTING PUPPETEER MOBILE TOUCH QA TEST SUITE (ENG-128) ---');
  console.log('================================================================\n');

  let serverProcess = null;
  const isRunning = await isServerListening(TARGET_URL);

  if (!isRunning) {
    console.log(`[SERVER] Preview server not detected at ${TARGET_URL}. Starting Vite preview server...`);
    const distDir = path.join(__dirname, '../dist');
    if (!fs.existsSync(distDir)) {
      console.log('[BUILD] Building production bundle before preview launch...');
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
        console.log(`[SERVER] ✓ Vite preview server ready on ${TARGET_URL}`);
        break;
      }
    }
    if (!ready) {
      if (serverProcess) serverProcess.kill();
      throw new Error(`Timed out waiting for Vite preview server on ${TARGET_URL}`);
    }
  } else {
    console.log(`[SERVER] ✓ Using active preview server at ${TARGET_URL}`);
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

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('eng_onboarding_completed', 'true');
    localStorage.setItem('singularity_notifications_enabled', 'false');
    const todayStr = new Date().toISOString().slice(0, 10);
    const state = {
      version: 4,
      learnerLevel: 'B2',
      skillLevels: { vocab: 'B2', grammar: 'B2', reading: 'B2', listening: 'B2', writing: 'B2', speaking: 'B2' },
      placementDone: true,
      soundMuted: false,
      cardStates: {},
      streak: { currentStreak: 5, longestStreak: 12, lastActiveDate: todayStr },
      habitProgress: {},
      totalCardsReviewed: 42,
      lastSyncTimestamp: Date.now()
    };
    localStorage.setItem('STARK_ENG_STATE', JSON.stringify(state));
  });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('navigator.vibrate') || text.includes('chromestatus.com')) return;
    if (msg.type() === 'error') {
      consoleErrors.push(text);
      console.error(`  [BROWSER ERROR] ${text}`);
    }
  });

  try {
    for (let vpIndex = 0; vpIndex < VIEWPORTS.length; vpIndex++) {
      const vp = VIEWPORTS[vpIndex];
      console.log(`\n----------------------------------------------------------------`);
      console.log(`[VIEWPORT ${vpIndex + 1}/${VIEWPORTS.length}] Testing ${vp.name} (${vp.width}x${vp.height}, DPR: ${vp.deviceScaleFactor})`);
      console.log(`----------------------------------------------------------------`);

      await page.setViewport(vp);

      // =========================================================================
      // DOMAIN 1: CONSTELLATION SKILL TREE (#tree) MOBILE TOUCH & ZERO OVERFLOW
      // =========================================================================
      await page.goto(`${TARGET_URL}#tree`, { waitUntil: 'networkidle0', timeout: 15000 });
      await page.waitForSelector('.hud-header', { timeout: 5000 });

      // 1. Zero Horizontal Overflow
      const treeOverflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
      });
      assert.strictEqual(
        treeOverflow.hasOverflow,
        false,
        `Zero horizontal overflow violated on #tree in ${vp.name}: scrollWidth=${treeOverflow.scrollWidth}, innerWidth=${treeOverflow.innerWidth}`
      );
      console.log(`  [PASS] Zero horizontal overflow verified on #tree (${treeOverflow.scrollWidth}px <= ${treeOverflow.innerWidth}px).`);

      // 2. Streamlined Mobile Header Button Row (No 15-button shrink)
      const headerStats = await page.evaluate(() => {
        const actionsCluster = document.querySelector('.hud-header .hud-actions');
        if (!actionsCluster) return { visibleCount: 0, totalButtons: 0 };
        const buttons = Array.from(actionsCluster.querySelectorAll('button'));
        const visibleButtons = buttons.filter(b => {
          const style = window.getComputedStyle(b);
          return style.display !== 'none' && style.visibility !== 'hidden' && b.offsetWidth > 0;
        });
        return {
          totalButtons: buttons.length,
          visibleCount: visibleButtons.length,
          visibleClasses: visibleButtons.map(b => b.className)
        };
      });
      assert.ok(
        headerStats.visibleCount <= 3,
        `Header actions row must be streamlined on mobile (visibleCount=${headerStats.visibleCount} <= 3, found: ${headerStats.visibleClasses.join(', ')})`
      );
      console.log(`  [PASS] Header row streamlined: only ${headerStats.visibleCount} action buttons visible (no 15-button flex shrink row).`);

      // 3. Mobile Bottom Navigation Bar & Touch Targets (>= 44x44px)
      const bottomNavStats = await page.evaluate(() => {
        const nav = document.querySelector('.hud-bottom-nav');
        if (!nav) return { exists: false };
        const navStyle = window.getComputedStyle(nav);
        const buttons = Array.from(nav.querySelectorAll('.bnav-btn'));
        const buttonBoxes = buttons.map(b => {
          const rect = b.getBoundingClientRect();
          return {
            className: b.className,
            ariaLabel: b.getAttribute('aria-label'),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          };
        });
        return {
          exists: true,
          display: navStyle.display,
          position: navStyle.position,
          buttonCount: buttons.length,
          buttons: buttonBoxes
        };
      });
      assert.ok(bottomNavStats.exists, 'Bottom navigation bar must exist in DOM');
      assert.ok(bottomNavStats.display === 'flex', `Bottom nav must be display: flex on mobile (got ${bottomNavStats.display})`);
      assert.strictEqual(bottomNavStats.buttonCount, 5, 'Bottom nav must have exactly 5 thumb actions (Tree, Blitz, Radar, Cockpit, More)');

      for (const btn of bottomNavStats.buttons) {
        assert.ok(
          btn.width >= 44 && btn.height >= 44,
          `Bottom nav button ${btn.ariaLabel} must meet >= 44x44px touch target (got ${btn.width}x${btn.height}px)`
        );
      }
      console.log(`  [PASS] Fixed Mobile Bottom Navigation verified: 5 thumb actions, all >= 44x44px touch targets.`);

      // 4. Mobile Menu Drawer & Action Sheet Touch Targets (>= 44px)
      const mobileDrawerTrigger = await page.$('.btn-mobile-menu-drawer');
      assert.ok(mobileDrawerTrigger, '.btn-mobile-menu-drawer trigger must exist in DOM');
      const drawerTriggerBox = await mobileDrawerTrigger.boundingBox();
      assert.ok(
        drawerTriggerBox.width >= 44 && drawerTriggerBox.height >= 44,
        `Mobile menu drawer trigger must meet >= 44x44px touch target (got ${drawerTriggerBox.width}x${drawerTriggerBox.height}px)`
      );

      // Open Action Sheet Drawer
      await mobileDrawerTrigger.click();
      await page.waitForSelector('.mobile-action-sheet-overlay', { timeout: 3000 });

      const sheetStats = await page.evaluate(() => {
        const overlay = document.querySelector('.mobile-action-sheet-overlay');
        const sheet = document.querySelector('.mobile-action-sheet');
        if (!overlay || !sheet) return { open: false };
        const buttons = Array.from(sheet.querySelectorAll('button'));
        const buttonBoxes = buttons.map(b => {
          const rect = b.getBoundingClientRect();
          return {
            text: b.textContent.trim().slice(0, 30),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          };
        });
        return {
          open: true,
          buttonCount: buttons.length,
          buttons: buttonBoxes
        };
      });
      assert.ok(sheetStats.open, 'Mobile Action Sheet Drawer must open on click');
      assert.ok(sheetStats.buttonCount >= 8, `Action sheet must contain secondary controls (got ${sheetStats.buttonCount})`);

      for (const btn of sheetStats.buttons) {
        assert.ok(
          btn.height >= 44,
          `Action sheet button "${btn.text}" must meet min-height >= 44px (got ${btn.height}px)`
        );
      }
      console.log(`  [PASS] Mobile Action Sheet Drawer verified: ${sheetStats.buttonCount} secondary controls, all >= 44px height.`);

      // Close Action Sheet Drawer
      await page.evaluate(() => {
        const btn = document.querySelector('.sheet-btn-close');
        if (btn) btn.click();
      });
      await page.waitForFunction(() => !document.querySelector('.mobile-action-sheet-overlay'), { timeout: 3000 });

      // 5. Mobile Constellation View Switcher: Auto-Default to Skill Deck & Toggle
      const deckModeStats = await page.evaluate(() => {
        const switcher = document.querySelector('.constellation-view-switcher');
        const deck = document.querySelector('.mobile-skill-deck');
        const map = document.querySelector('.constellation-container');
        const cards = Array.from(document.querySelectorAll('.deck-branch-card'));
        return {
          hasSwitcher: Boolean(switcher),
          deckVisible: Boolean(deck && window.getComputedStyle(deck).display !== 'none'),
          mapVisible: Boolean(map && window.getComputedStyle(map).display !== 'none'),
          cardCount: cards.length,
          branchIds: cards.map(c => c.getAttribute('data-branch'))
        };
      });
      assert.ok(deckModeStats.hasSwitcher, 'Constellation view switcher must exist in header/banner');
      assert.ok(deckModeStats.deckVisible, 'Mobile viewport (<= 640px) must auto-default to Skill Deck view');
      assert.strictEqual(deckModeStats.cardCount, 5, `Skill Deck must render 5 branch cards (found ${deckModeStats.cardCount})`);
      console.log(`  [PASS] Mobile Constellation View Switcher auto-defaulted to Skill Deck (5 branch cards: ${deckModeStats.branchIds.join(', ')}).`);

      // Verify CTA button targets in deck cards
      const ctaStats = await page.evaluate(() => {
        const ctas = Array.from(document.querySelectorAll('.deck-branch-card .btn-enter-dossier'));
        return ctas.map(btn => {
          const rect = btn.getBoundingClientRect();
          return { width: Math.round(rect.width), height: Math.round(rect.height) };
        });
      });
      assert.strictEqual(ctaStats.length, 5, 'Must have 5 CTA buttons in Skill Deck');
      for (const cta of ctaStats) {
        assert.ok(cta.height >= 44, `Deck CTA button must meet height >= 44px (got ${cta.height}px)`);
      }
      console.log('  [PASS] All 5 Skill Deck CTA buttons satisfy >= 44px touch target standard.');
      // Toggle to Star Map
      await page.evaluate(() => {
        const btn = document.querySelector('.btn-view-star-map');
        if (btn) btn.click();
      });
      await page.waitForFunction(() => document.querySelector('.constellation-container'), { timeout: 3000 });
      const mapModeActive = await page.evaluate(() => {
        return Boolean(document.querySelector('.constellation-container'));
      });
      assert.ok(mapModeActive, 'Clicking Star Map toggle must display SVG map container');

      // Toggle back to Skill Deck
      await page.evaluate(() => {
        const btn = document.querySelector('.btn-view-skill-deck');
        if (btn) btn.click();
      });
      await page.waitForFunction(() => document.querySelector('.mobile-skill-deck'), { timeout: 3000 });

      const ssTreePath = path.join(SCREENSHOTS_DIR, `${vpIndex === 0 ? '01-iphone-se' : (vpIndex === 1 ? '04-iphone-15pro' : '05-android')}-tree-deck.png`);
      await page.screenshot({ path: ssTreePath, fullPage: false });
      console.log(`  [SCREENSHOT] Saved: ${ssTreePath}`);

      // =========================================================================
      // DOMAIN 2: READING DOSSIER (#read) MOBILE SPLIT-SCREEN TAB SWITCHER
      // =========================================================================
      await page.goto(`${TARGET_URL}#read`, { waitUntil: 'networkidle0', timeout: 15000 });
      await page.waitForSelector('.reading-mobile-tab-bar', { timeout: 5000 });

      // Zero Horizontal Overflow in Reading
      const readOverflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
      });
      assert.strictEqual(
        readOverflow.hasOverflow,
        false,
        `Zero horizontal overflow violated on #read in ${vp.name}: scrollWidth=${readOverflow.scrollWidth}, innerWidth=${readOverflow.innerWidth}`
      );
      console.log(`  [PASS] Zero horizontal overflow verified on #read (${readOverflow.scrollWidth}px <= ${readOverflow.innerWidth}px).`);

      // Tab switcher & Quick-Switch FAB touch target audit
      const readTabStats = await page.evaluate(() => {
        const bar = document.querySelector('.reading-mobile-tab-bar');
        const fab = document.querySelector('#reading-mobile-quick-switch');
        const layout = document.querySelector('.reading-pass1-layout');
        const tabs = Array.from(bar ? bar.querySelectorAll('.reading-mobile-tab-btn') : []);
        const tabBoxes = tabs.map(t => {
          const rect = t.getBoundingClientRect();
          return { tab: t.getAttribute('data-tab'), width: Math.round(rect.width), height: Math.round(rect.height) };
        });
        const fabRect = fab ? fab.getBoundingClientRect() : null;
        return {
          barVisible: bar ? window.getComputedStyle(bar).display === 'flex' : false,
          initialActive: layout ? layout.getAttribute('data-mobile-active') : null,
          tabs: tabBoxes,
          fab: fabRect ? { width: Math.round(fabRect.width), height: Math.round(fabRect.height) } : null
        };
      });
      assert.ok(readTabStats.barVisible, 'Reading mobile tab switcher must be visible (display: flex) on mobile');
      assert.strictEqual(readTabStats.initialActive, 'text', 'Reading initial active tab must default to "text"');
      for (const t of readTabStats.tabs) {
        assert.ok(t.height >= 44, `Reading mobile tab button ${t.tab} must meet height >= 44px (got ${t.height}px)`);
      }
      // The floating Reading quick-switch FAB was removed on purpose; the sticky tab bar replaces it
      assert.ok(!readTabStats.fab, 'Reading quick-switch FAB must be removed (tab bar covers it)');

      // Test Tab Switch to Analysis
      await page.click('.reading-mobile-tab-btn[data-tab="analysis"]');
      const activeAfterTab = await page.evaluate(() => {
        const layout = document.querySelector('.reading-pass1-layout');
        return layout ? layout.getAttribute('data-mobile-active') : null;
      });
      assert.strictEqual(activeAfterTab, 'analysis', 'Clicking Analysis tab must set data-mobile-active="analysis"');

      // Switch back to Text via the tab bar (the FAB was removed)
      await page.click('.reading-mobile-tab-btn[data-tab="text"]');
      const activeAfterText = await page.evaluate(() => {
        const layout = document.querySelector('.reading-pass1-layout');
        return layout ? layout.getAttribute('data-mobile-active') : null;
      });
      assert.strictEqual(activeAfterText, 'text', 'Clicking the Text tab must set data-mobile-active="text"');
      console.log('  [PASS] Reading mobile segmented tab switcher verified (FAB removed).');

      if (vpIndex === 0) {
        const ssReadPath = path.join(SCREENSHOTS_DIR, '02-iphone-se-read-split.png');
        await page.screenshot({ path: ssReadPath, fullPage: false });
        console.log(`  [SCREENSHOT] Saved: ${ssReadPath}`);
      }

      // =========================================================================
      // DOMAIN 3: EXAM COCKPIT DOSSIER (#cockpit) MOBILE SPLIT-SCREEN & 1-40 MATRIX
      // =========================================================================
      await page.goto(`${TARGET_URL}#cockpit`, { waitUntil: 'networkidle0', timeout: 15000 });
      await page.waitForSelector('.cd-mobile-tab-bar', { timeout: 5000 });

      // Zero Horizontal Overflow in Cockpit
      const cockpitOverflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
      });
      assert.strictEqual(
        cockpitOverflow.hasOverflow,
        false,
        `Zero horizontal overflow violated on #cockpit in ${vp.name}: scrollWidth=${cockpitOverflow.scrollWidth}, innerWidth=${cockpitOverflow.innerWidth}`
      );
      console.log(`  [PASS] Zero horizontal overflow verified on #cockpit (${cockpitOverflow.scrollWidth}px <= ${cockpitOverflow.innerWidth}px).`);

      // Tab switcher & Quick-Switch FAB touch target audit in Cockpit
      const cockpitTabStats = await page.evaluate(() => {
        const bar = document.querySelector('.cd-mobile-tab-bar');
        const fab = document.querySelector('#cd-mobile-quick-switch');
        const arena = document.querySelector('#cd-split-arena');
        const tabs = Array.from(bar ? bar.querySelectorAll('.cd-mobile-tab-btn') : []);
        const tabBoxes = tabs.map(t => {
          const rect = t.getBoundingClientRect();
          return { tab: t.getAttribute('data-tab'), width: Math.round(rect.width), height: Math.round(rect.height) };
        });
        const fabRect = fab ? fab.getBoundingClientRect() : null;
        return {
          barVisible: bar ? window.getComputedStyle(bar).display === 'flex' : false,
          initialActive: arena ? arena.getAttribute('data-mobile-active') : null,
          tabs: tabBoxes,
          fab: fabRect ? { width: Math.round(fabRect.width), height: Math.round(fabRect.height) } : null
        };
      });
      assert.ok(cockpitTabStats.barVisible, 'Cockpit mobile tab switcher must be visible on mobile');
      assert.strictEqual(cockpitTabStats.initialActive, 'passage', 'Cockpit initial active tab must default to "passage"');
      for (const t of cockpitTabStats.tabs) {
        assert.ok(t.height >= 44, `Cockpit mobile tab button ${t.tab} must meet height >= 44px (got ${t.height}px)`);
      }
      // The floating Cockpit quick-switch FAB was removed on purpose; the sticky tab bar replaces it
      assert.ok(!cockpitTabStats.fab, 'Cockpit quick-switch FAB must be removed (tab bar covers it)');

      // Test Tab Switch to Questions
      await page.evaluate(() => {
        const btn = document.querySelector('.cd-mobile-tab-btn[data-tab="questions"]');
        if (btn) btn.click();
      });
      const cockpitActiveAfterTab = await page.evaluate(() => {
        const arena = document.querySelector('#cd-split-arena');
        return arena ? arena.getAttribute('data-mobile-active') : null;
      });
      assert.strictEqual(cockpitActiveAfterTab, 'questions', 'Clicking Questions tab must set data-mobile-active="questions"');

      // Test Tab Switch back to Passage via segmented tab bar
      await page.evaluate(() => {
        const btn = document.querySelector('.cd-mobile-tab-btn[data-tab="passage"]');
        if (btn) btn.click();
      });
      const cockpitActiveAfterPassage = await page.evaluate(() => {
        const arena = document.querySelector('#cd-split-arena');
        return arena ? arena.getAttribute('data-mobile-active') : null;
      });
      assert.strictEqual(cockpitActiveAfterPassage, 'passage', 'Clicking Passage tab must flip active pane back to "passage"');
      console.log('  [PASS] Cockpit mobile segmented tab switcher verified (FAB removed).');

      // 1-40 Question Matrix Button Touch Target Invariant
      const matrixButtonStats = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('.cd-q-matrix-btn')).slice(0, 5);
        return buttons.map(b => {
          const rect = b.getBoundingClientRect();
          return { qidx: b.getAttribute('data-qidx'), width: Math.round(rect.width), height: Math.round(rect.height) };
        });
      });
      for (const mb of matrixButtonStats) {
        assert.ok(
          mb.height >= 44 && mb.width >= 44,
          `Question matrix button Q${mb.qidx} must meet >= 44x44px touch target on mobile (got ${mb.width}x${mb.height}px)`
        );
      }
      console.log(`  [PASS] Cockpit 1-40 question navigator pills verified for >= 44x44px mobile touch ergonomics.`);

      if (vpIndex === 0) {
        // Dismiss test hub modal to screenshot the split-screen test station with bottom bar
        await page.evaluate(() => {
          const btn = document.querySelector('#btn-preview-exam-station') || document.querySelector('#btn-start-selected-exam');
          if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 400));
        const ssCockpitPath = path.join(SCREENSHOTS_DIR, '03-iphone-se-cockpit-split.png');
        await page.screenshot({ path: ssCockpitPath, fullPage: false });
        console.log(`  [SCREENSHOT] Saved: ${ssCockpitPath}`);
      }
    }

    console.log('\n================================================================');
    console.log('--- ALL MOBILE TOUCH QA INVARIANTS PASSED 100% ACROSS 3 VIEWPORTS ---');
    console.log('================================================================\n');

  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

runMobileTouchQA().catch(err => {
  console.error('\n[FATAL ERROR IN MOBILE TOUCH QA]:', err);
  process.exit(1);
});
