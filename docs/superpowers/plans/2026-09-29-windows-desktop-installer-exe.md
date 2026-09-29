# Windows Desktop Installer (.exe) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package the complete English Singularity C2 web learning platform into a standalone Windows Desktop Installer (`.exe`) featuring a guided NSIS Setup Wizard, Desktop shortcut, Start Menu integration, bundled Chromium runtime, native Web Audio DSP / speech support, and multi-resolution Windows icon.

**Architecture:** Electron 33+ wrapped around Vite production build (`dist/`). Configured via `electron-builder` with an NSIS installer target (`nsis`) that generates a production-ready Windows setup executable (`release/English Singularity Setup 1.0.0.exe`).

**Tech Stack:** Electron, electron-builder, NSIS, Node.js v22, Vite 5.4, TypeScript 5.5.

**Documentation Authority:** `https://www.electronjs.org/docs/latest/` & `https://www.electron.build/configuration/nsis`.

## Global Constraints

- **Installer Format:** Windows NSIS Setup Wizard (`.exe`) with customizable install path, desktop shortcut, start menu entry, and clean uninstaller.
- **Audio & Media:** Full permission grant for `AudioContext`, `MediaRecorder` microphone capture, and Web Speech synthesis (`window.speechSynthesis`).
- **Window Specs:** 1280x860 default viewport, min 1024x720, dark charcoal titlebar styling matching Soft Paper Ink palette (`#fafaf9` background).
- **Assets & Icons:** Multi-size Windows icon (`icon.ico`) with embedded 256, 128, 64, 48, 32, 16 px resolutions.
- **Bundle Integrity:** 0 runtime errors on app launch, local storage and SM-2 persistence preserved across restarts.

---

### Task 1: Desktop Shell Architecture & Multi-Resolution Windows Icon

**Files:**
- Create: `web/scripts/generate-ico.cjs`
- Create: `web/electron/main.cjs`
- Create: `web/public/icon.ico`
- Test: `web/scripts/verify-desktop-shell.cjs`

**Interfaces:**
- Produces: `web/public/icon.ico`, `web/electron/main.cjs`.
- Verification: `node web/scripts/verify-desktop-shell.cjs`.

- [ ] **Step 1: Write the failing test**

Create `web/scripts/verify-desktop-shell.cjs`:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[DESKTOP TEST 1] Verifying Desktop Shell & Icon Architecture...');

const mainPath = path.join(__dirname, '../electron/main.cjs');
assert(fs.existsSync(mainPath), 'electron/main.cjs must exist');

const icoPath = path.join(__dirname, '../public/icon.ico');
assert(fs.existsSync(icoPath), 'public/icon.ico must exist');

// Verify ICO header (0x00 0x00 0x01 0x00)
const icoBuf = fs.readFileSync(icoPath);
assert(icoBuf.readUInt16LE(0) === 0, 'ICO reserved field must be 0');
assert(icoBuf.readUInt16LE(2) === 1, 'ICO type field must be 1 (icon)');
const imageCount = icoBuf.readUInt16LE(4);
assert(imageCount >= 4, `ICO must contain at least 4 image resolutions, found ${imageCount}`);

const mainCode = fs.readFileSync(mainPath, 'utf-8');
assert(mainCode.includes('BrowserWindow'), 'main.cjs must create BrowserWindow');
assert(mainCode.includes('loadFile'), 'main.cjs must load local dist/index.html');
assert(mainCode.includes('icon.ico') || mainCode.includes('icon-512.png'), 'main.cjs must specify icon');

console.log('✅ [DESKTOP TEST 1 PASSED] Desktop shell and icon verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-desktop-shell.cjs`  
Expected: FAIL (files do not exist yet).

- [ ] **Step 3: Implement minimal code to make test pass**

1. Create `web/scripts/generate-ico.cjs` to construct a multi-resolution `.ico` file containing 256, 128, 64, 48, 32, 16 px PNG frames.
2. Run `node web/scripts/generate-ico.cjs` to create `web/public/icon.ico`.
3. Create `web/electron/main.cjs` with:
   - BrowserWindow creation (1280x860, min 1024x720, backgroundColor: `#fafaf9`).
   - Local loading of `dist/index.html`.
   - Audio and microphone permission handler.
   - External link delegation to OS default browser.

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-desktop-shell.cjs`  
Expected: `✅ [DESKTOP TEST 1 PASSED] Desktop shell and icon verified.`

- [ ] **Step 5: Commit**

```bash
git add web/scripts/generate-ico.cjs web/public/icon.ico web/electron/main.cjs web/scripts/verify-desktop-shell.cjs
git commit -m "feat(desktop): configure Electron desktop shell and multi-resolution Windows icon"
```

---

### Task 2: Electron Packaging & NSIS Windows Installer Configuration

**Files:**
- Modify: `web/package.json`
- Test: `web/scripts/verify-installer-config.cjs`

**Interfaces:**
- Produces: `package.json` scripts (`dist:win`) and `build` configuration block for `electron-builder`.

- [ ] **Step 1: Write the failing test**

Create `web/scripts/verify-installer-config.cjs`:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[DESKTOP TEST 2] Verifying Installer Configuration...');

const pkgPath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

assert(pkg.main === 'electron/main.cjs', "package.json 'main' must point to 'electron/main.cjs'");
assert(pkg.scripts && pkg.scripts['dist:win'], "package.json must contain 'dist:win' script");
assert(pkg.build, "package.json must contain 'build' configuration for electron-builder");
assert(pkg.build.win && pkg.build.win.target.includes('nsis'), "win.target must include 'nsis'");
assert(pkg.build.nsis && pkg.build.nsis.createDesktopShortcut === true, 'nsis must create desktop shortcut');
assert(pkg.build.nsis && pkg.build.nsis.createStartMenuShortcut === true, 'nsis must create start menu shortcut');

console.log('✅ [DESKTOP TEST 2 PASSED] Installer configuration verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-installer-config.cjs`  
Expected: FAIL.

- [ ] **Step 3: Implement minimal code to make test pass**

Update `web/package.json`:
- Set `"main": "electron/main.cjs"`
- Add devDependencies: `electron`, `electron-builder`
- Add script `"dist:win": "npm run build && electron-builder --win nsis"`
- Add `"build"` object with complete NSIS configuration.

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-installer-config.cjs`  
Expected: `✅ [DESKTOP TEST 2 PASSED] Installer configuration verified.`

- [ ] **Step 5: Commit**

```bash
git add web/package.json web/scripts/verify-installer-config.cjs
git commit -m "feat(desktop): configure electron-builder NSIS Windows installer setup"
```

---

### Task 3: Build & Package Windows Installer Executable

**Files:**
- Output: `web/release/English Singularity Setup 1.0.0.exe`
- Test: `web/scripts/verify-installer-artifact.cjs`

- [ ] **Step 1: Install Electron dependencies**

Run: `npm install -D electron electron-builder` in `web/`.

- [ ] **Step 2: Execute Windows installer build**

Run: `npm run dist:win` in `web/`.
Expected: Electron-builder bundles production assets, packages Chromium x64, compiles NSIS setup script, and emits `English Singularity Setup 1.0.0.exe` into `web/release/`.

- [ ] **Step 3: Write and run artifact verification test**

Create `web/scripts/verify-installer-artifact.cjs`:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[DESKTOP TEST 3] Verifying Installer Artifact...');

const releaseDir = path.join(__dirname, '../release');
assert(fs.existsSync(releaseDir), 'release/ directory must exist');

const files = fs.readdirSync(releaseDir);
const exeFile = files.find(f => f.endsWith('.exe') && f.includes('Setup'));
assert(exeFile, `Expected Setup .exe in release/, found: ${files.join(', ')}`);

const exePath = path.join(releaseDir, exeFile);
const stats = fs.statSync(exePath);
console.log(`- Found installer executable: ${exeFile} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
assert(stats.size > 40 * 1024 * 1024, 'Installer executable must be > 40 MB');

// Verify PE binary header ('MZ')
const fd = fs.openSync(exePath, 'r');
const header = Buffer.alloc(2);
fs.readSync(fd, header, 0, 2, 0);
fs.closeSync(fd);
assert(header.toString('ascii') === 'MZ', 'File must be a valid Windows PE executable (MZ header)');

console.log('✅ [DESKTOP TEST 3 PASSED] Windows Installer .exe verified.');
```

Run: `node web/scripts/verify-installer-artifact.cjs`.  
Expected: `✅ [DESKTOP TEST 3 PASSED] Windows Installer .exe verified.`

- [ ] **Step 4: Commit**

```bash
git add web/scripts/verify-installer-artifact.cjs
git commit -m "feat(release): generate Windows installer executable English Singularity Setup 1.0.0.exe"
```

---

### Task 4: Hive Ledger & User Handoff

**Files:**
- Modify: `hive/tasks.json`
- Modify: `hive/board.md`
- Modify: `hive/agents/god/memory.md`

- [ ] **Step 1: Record Initiative 13 in Hive Ledger**
- [ ] **Step 2: Commit and present direct executable paths to User**
