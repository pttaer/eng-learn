# Architecture Plan: Decoupling English Singularity & IELTS Academic Cockpit

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cleanly decouple the unified codebase into two independent, standalone applications — **English Singularity** (C2 Native Mastery & Habit System) and **IELTS Academic Cockpit** (Full Exam & 4-Skills Simulator) — with independent navigation, build pipelines, and APK packaging, while keeping shared core utilities conflict-free during active multi-agent development.

**Architecture:** A 3-phase non-destructive decoupling strategy. Phase 1 defines a boundary guard script to prevent cross-domain imports and cuts hardcoded cross-page URL jumps. Phase 2 equips IELTS with its own dedicated bottom-nav shell. Phase 3 decouples Vite and Android build pipelines into independent packaging targets.

**Tech Stack:** TypeScript (strict, vanilla DOM), Vite 5, Node.js scripts (`.cjs`), Android SDK CLI (`aapt2`, `d8`, `zipalign`, `apksigner`).

**Spec:** Context derived from architectural audit on 2026-11-05 regarding app scope, cognitive overload, and concurrent agent development.

---

## Global Constraints

1. **Zero Downtime for Concurrent Agents:** Do not rename or delete existing dossiers (`web/src/modules/*.ts`) while parallel agents are actively committing layout or styling fixes.
2. **Touch Floor & Canonical Spacing Invariant:** All new or decoupled navigation components must strictly comply with AGENTS.md § 1.1–1.16 (44px touch targets, `--radius-btn: 10px`, max-width 768px mobile breakpoint).
3. **Independent Build Deliverables:** The build pipeline must produce two distinct sets of artifacts:
   - Web: `dist/singularity/` and `dist/ielts/`
   - Android: `release/android/English-Singularity-debug.apk` and `release/android/IELTS-Cockpit-debug.apk`
4. **Preserve Deep Links & Test Harness:** Existing verification scripts (`web/scripts/verify-*.cjs`) must continue to pass.

---

## File Map

| Path | Action | Description |
|---|---|---|
| `web/scripts/verify-decoupling-integrity.cjs` | Create | Single boundary guard: no cross-domain imports, no hardcoded ielts.html redirects, IELTS manifest check |
| `web/src/ielts/nav/ielts-nav.ts` | Create | Dedicated, self-contained Bottom Nav for IELTS |
| `web/src/ielts/nav/ielts-nav.css` | Create | Canonical styling for IELTS independent navigation |
| `web/src/modules/header-hud.ts` | Modify | Remove hardcoded `./ielts.html` redirection |
| `web/src/main.ts` | Modify | Remove `onOpenIelts` bridge handler and isolate Singularity routing |
| `web/src/ielts/main.ts` | Modify | Initialize independent `IeltsNav` shell |
| `web/vite.config.ts` | Modify | Support target-specific builds (`APP_TARGET=singularity|ielts`) |
| `web/scripts/build-phone.cjs` | Modify | Support single-app phone bundle generation |
| `web/scripts/build-apk.cjs` | Modify | Support `--app=ielts` flag for separate APK output |
| `web/android/AndroidManifest-ielts.xml` | Create | Independent Android manifest with unique package ID `com.ielts.cockpit` |
| `web/package.json` | Modify | Add `test:boundaries` and target build scripts |

---

## Phase 1: Boundary Guard & Cross-Link Removal

### Task 1: Create Unified Boundary Guard and Cut Cross-App Links

**Files:**
- Create: `web/scripts/verify-decoupling-integrity.cjs`
- Modify: `web/src/modules/header-hud.ts`
- Modify: `web/src/main.ts`
- Modify: `web/package.json`

**Interfaces:**
- Consumes: None
- Produces: `verify-decoupling-integrity.cjs` script (single source of all architectural boundary assertions), cleaned HUD and main.ts without hardcoded `ielts.html` redirects.

- [ ] **Step 1: Write the unified boundary guard script**

Create `web/scripts/verify-decoupling-integrity.cjs`:
```javascript
const fs = require('fs');
const path = require('path');

const WEB_SRC = path.join(__dirname, '..', 'src');
const IELTS_DIR = path.join(WEB_SRC, 'ielts');
const MODULES_DIR = path.join(WEB_SRC, 'modules');

let violations = 0;

function fail(msg) { console.error(`[VIOLATION] ${msg}`); violations++; }

// --- Import boundary scan ---
function scanDir(dir, forbiddenPattern, label) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules') {
      scanDir(full, forbiddenPattern, label);
    } else if (f.isFile() && /\.[tj]s$/.test(f.name)) {
      const matches = fs.readFileSync(full, 'utf8').match(forbiddenPattern);
      if (matches) fail(`${label} in ${path.relative(WEB_SRC, full)}: ${matches.join(', ')}`);
    }
  }
}

// 1. IELTS must not import Singularity dossiers (floating-note is shared, exempt)
scanDir(IELTS_DIR, /from\s+['"][^'"]*\/modules\/(?!floating-note)[^'"]+['"]/g, 'IELTS→Singularity');

// 2. Singularity modules must not import IELTS internals
scanDir(MODULES_DIR, /from\s+['"][^'"]*\/ielts\/[^'"]+['"]/g, 'Singularity→IELTS');

// --- Hardcoded redirect check ---
for (const rel of ['modules/header-hud.ts', 'main.ts']) {
  const p = path.join(WEB_SRC, rel);
  if (!fs.existsSync(p)) continue;
  if (fs.readFileSync(p, 'utf8').includes("window.location.href = './ielts.html'"))
    fail(`Hardcoded ielts.html redirect in ${rel}`);
}

// --- IELTS manifest check (Phase 3 gate — skip if file doesn't exist yet) ---
const manifestIelts = path.join(__dirname, '../android/AndroidManifest-ielts.xml');
if (fs.existsSync(manifestIelts)) {
  const xml = fs.readFileSync(manifestIelts, 'utf8');
  if (!xml.includes('package="com.ielts.cockpit"'))
    fail('AndroidManifest-ielts.xml missing package="com.ielts.cockpit"');
  if (!xml.includes('android:label="IELTS Cockpit"'))
    fail('AndroidManifest-ielts.xml missing android:label="IELTS Cockpit"');
}

if (violations > 0) {
  console.error(`\nFailed with ${violations} boundary violations.`);
  process.exit(1);
} else {
  console.log('[PASS] Decoupling boundaries verified.');
  process.exit(0);
}
```

- [ ] **Step 2: Run script to capture current state**

Run: `node web/scripts/verify-decoupling-integrity.cjs`
Expected: May flag existing cross-domain leaks (floating-note is exempt) and WILL flag hardcoded `ielts.html` redirects in header-hud.ts and main.ts.

- [ ] **Step 3: Remove hardcoded `ielts.html` redirects from `header-hud.ts`**

Find the line `window.location.href = './ielts.html'` (around the IELTS bottom-nav button handler) and replace with a configurable callback:
```typescript
// Before:
else window.location.href = './ielts.html';

// After:
else this.onLaunchExternalApp?.('ielts');
```

Add the callback field to the class:
```typescript
public onLaunchExternalApp?: (appId: string) => void;
```

- [ ] **Step 4: Remove hardcoded `ielts.html` redirect from `main.ts`**

Find `window.location.href = './ielts.html'` and replace with the callback wiring:
```typescript
// In the HUD initialization:
hud.onLaunchExternalApp = (appId) => {
  if (appId === 'ielts') window.location.href = './ielts.html';
};
```

This keeps the behavior identical but moves the coupling to one wiring point that standalone packaging can omit.

- [ ] **Step 5: Add npm script to `web/package.json`**

Add to `"scripts"`:
```json
"test:boundaries": "node scripts/verify-decoupling-integrity.cjs"
```

- [ ] **Step 6: Run boundary guard to verify pass**

Run: `node web/scripts/verify-decoupling-integrity.cjs`
Expected: `[PASS] Decoupling boundaries verified.`

- [ ] **Step 7: Run existing regression tests**

Run: `npm test` (inside `web/`)
Expected: All standard tests pass.

- [ ] **Step 8: Commit**

```bash
git add web/scripts/verify-decoupling-integrity.cjs web/src/modules/header-hud.ts web/src/main.ts web/package.json
git commit -m "arch: add boundary guard, decouple hardcoded ielts.html redirects"
```

---

## Phase 2: Independent IELTS Navigation Shell

### Task 2: Build Self-Contained IELTS Bottom Nav

**Files:**
- Create: `web/src/ielts/nav/ielts-nav.ts`
- Create: `web/src/ielts/nav/ielts-nav.css`
- Modify: `web/src/ielts/main.ts`

**Interfaces:**
- Consumes: `t()` from `core/i18n`, `icon()` from `utils/icons`.
- Produces: `class IeltsNav` with `setActiveRoute(hash: string): void`, managing 5 IELTS tabs.

- [ ] **Step 1: Create `web/src/ielts/nav/ielts-nav.ts`**

```typescript
import { t } from '../../core/i18n';
import { icon, IconName } from '../../utils/icons';

const TABS: { id: string; icon: IconName; label: string }[] = [
  { id: 'roadmap',        icon: 'compass',    label: 'ielts_nav_roadmap' },
  { id: 'reading',        icon: 'book-open',  label: 'ielts_nav_reading' },
  { id: 'listening',      icon: 'headphones', label: 'ielts_nav_listening' },
  { id: 'writing-studio', icon: 'pen-tool',   label: 'ielts_nav_writing' },
  { id: 'mock',           icon: 'award',      label: 'ielts_nav_mock' },
];

export class IeltsNav {
  private el: HTMLElement;
  private active = 'roadmap';

  constructor(mount: HTMLElement) {
    this.el = mount;
    this.render();
    this.el.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.ie-bnav-btn');
      if (btn?.dataset.route) window.location.hash = `#${btn.dataset.route}`;
    });
  }

  setActiveRoute(hash: string): void {
    this.active = (hash || '#roadmap').replace(/^#/, '');
    this.el.querySelectorAll<HTMLButtonElement>('.ie-bnav-btn').forEach(btn => {
      const on = btn.dataset.route === this.active;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', String(on));
    });
  }

  private render(): void {
    this.el.innerHTML = `<nav class="ie-bottom-nav" role="tablist" aria-label="IELTS Navigation">${
      TABS.map(tab => `<button type="button" class="ie-bnav-btn${tab.id === this.active ? ' active' : ''}"
        data-route="${tab.id}" role="tab" aria-selected="${tab.id === this.active}">
        <span class="ie-bnav-icon">${icon(tab.icon, 20)}</span>
        <span class="ie-bnav-label">${t(tab.label)}</span>
      </button>`).join('')
    }</nav>`;
  }
}
```

- [ ] **Step 2: Create `web/src/ielts/nav/ielts-nav.css`**

```css
.ie-bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 64px;
  background: var(--bg-card, #121826);
  border-top: 1px solid var(--border-hairline, rgba(255,255,255,0.08));
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  z-index: var(--z-nav, 800);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.ie-bnav-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; min-height: var(--touch-target-min, 44px);
  background: transparent; border: none; cursor: pointer; padding: 4px 0;
  color: var(--ink-muted, #94a3b8);
  font: var(--font-kicker, 11px) var(--font-sans, system-ui, sans-serif);
  letter-spacing: var(--font-kicker-spacing, 0.08em);
  transition: color 0.15s ease;
}
.ie-bnav-btn.active { color: var(--accent-gold, #f59e0b); }
.ie-bnav-icon { display: block; flex-shrink: 0; margin-bottom: 2px; }

@media (min-width: 769px) { .ie-bottom-nav { display: none; } }
```

- [ ] **Step 3: Wire IeltsNav into `web/src/ielts/main.ts`**

At the end of the IELTS app initialization, after the existing header/view setup:
```typescript
import { IeltsNav } from './nav/ielts-nav';
import './nav/ielts-nav.css';

// After existing init code:
const navMount = document.createElement('div');
document.body.appendChild(navMount);
const ieltsNav = new IeltsNav(navMount);

// In the existing hashchange handler:
window.addEventListener('hashchange', () => ieltsNav.setActiveRoute(location.hash));
ieltsNav.setActiveRoute(location.hash);
```

- [ ] **Step 4: Add i18n keys to `web/src/core/i18n.ts`**

Add to the EN and VI dictionaries:
```typescript
// EN:
ielts_nav_roadmap: 'Path',
ielts_nav_reading: 'Read',
ielts_nav_listening: 'Listen',
ielts_nav_writing: 'Write',
ielts_nav_mock: 'Mock',

// VI:
ielts_nav_roadmap: 'Lộ trình',
ielts_nav_reading: 'Đọc',
ielts_nav_listening: 'Nghe',
ielts_nav_writing: 'Viết',
ielts_nav_mock: 'Thi thử',
```

- [ ] **Step 5: Run tsc and existing tests**

Run: `npm test` (inside `web/`)
Expected: All tests pass (tsc compiles IeltsNav; no verify scripts touch IELTS nav yet).

- [ ] **Step 6: Commit**

```bash
git add web/src/ielts/nav/ web/src/ielts/main.ts web/src/core/i18n.ts
git commit -m "feat(ielts): self-contained IELTS bottom navigation"
```

---

## Phase 3: Multi-Target Build & Packaging

### Task 3: Target-Specific Vite Bundling

**Files:**
- Modify: `web/vite.config.ts`
- Modify: `web/package.json`

**Interfaces:**
- Consumes: Environment variable `APP_TARGET=singularity|ielts`
- Produces: Isolated output directories `dist/singularity` and `dist/ielts`.

- [ ] **Step 1: Update `web/vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

const phonePage = process.env.PHONE_PAGE;
const appTarget = process.env.APP_TARGET; // 'singularity' | 'ielts' | undefined

const shared = { root: '.', base: './', json: { stringify: true } };

const inputMap: Record<string, string> = {
  singularity: resolve(__dirname, 'index.html'),
  ielts:       resolve(__dirname, 'ielts.html'),
};

export default defineConfig(phonePage ? {
  ...shared,
  build: {
    outDir: `release/phone-build/${phonePage.replace(/\.html$/, '')}`,
    emptyOutDir: true,
    target: ['es2020', 'chrome80'],
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      input: resolve(__dirname, phonePage),
      output: { inlineDynamicImports: true },
    },
  },
} : {
  ...shared,
  server: { port: 3000, open: false },
  build: {
    outDir: appTarget ? `dist/${appTarget}` : 'dist',
    target: 'esnext',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 4000,
    sourcemap: process.env.SOURCEMAP === 'true',
    rollupOptions: {
      input: appTarget
        ? inputMap[appTarget]
        : { main: inputMap.singularity, ielts: inputMap.ielts },
    },
  },
});
```

- [ ] **Step 2: Add npm target scripts to `web/package.json`**

Add to `"scripts"` (no `cross-env` — Vite reads `process.env` natively on all platforms via its own env loading):
```json
"build:singularity": "APP_TARGET=singularity vite build",
"build:ielts": "APP_TARGET=ielts vite build"
```

For Windows compat, executor should use `set APP_TARGET=singularity&& vite build` or invoke via `node -e "process.env.APP_TARGET='singularity'; require('child_process').execSync('npx vite build', {stdio:'inherit'})"` if cross-platform npm script is needed.

- [ ] **Step 3: Test targeted build**

Run (from `web/`): `set APP_TARGET=ielts&& npx vite build`
Expected: Output written to `dist/ielts/` containing a single-page IELTS app.

- [ ] **Step 4: Test default build still works**

Run: `npm run build:fast` (from `web/`)
Expected: Output written to `dist/` containing both `index.html` and `ielts.html`.

- [ ] **Step 5: Commit**

```bash
git add web/vite.config.ts web/package.json
git commit -m "build(vite): add APP_TARGET for independent singularity/ielts builds"
```

---

### Task 4: Dual-APK Generation

**Files:**
- Create: `web/android/AndroidManifest-ielts.xml`
- Modify: `web/scripts/build-apk.cjs`

**Interfaces:**
- Consumes: `--app=ielts` CLI flag
- Produces: `release/android/IELTS-Cockpit-debug.apk` with package ID `com.ielts.cockpit`.

- [ ] **Step 1: Create `web/android/AndroidManifest-ielts.xml`**

Clone `web/android/AndroidManifest.xml`, replace:
- `package="com.english.singularity"` → `package="com.ielts.cockpit"`
- `android:label="English Singularity"` → `android:label="IELTS Cockpit"`
- Initial `loadUrl` target: `file:///android_asset/ielts.html` (remove the `index.html` branch in the intent routing).

- [ ] **Step 2: Add `--app` flag parsing to `web/scripts/build-apk.cjs`**

Near the top constants, after the existing `const WEB = ...`:
```javascript
const isIelts = process.argv.includes('--app=ielts');
const APP_LABEL = isIelts ? 'IELTS-Cockpit' : 'English-Singularity';
const MANIFEST = path.join(ANDROID_SRC, isIelts ? 'AndroidManifest-ielts.xml' : 'AndroidManifest.xml');
const APK = path.join(OUT, `${APP_LABEL}-debug.apk`);
```

Replace the existing hardcoded `AndroidManifest.xml` reference with `MANIFEST`. Replace the hardcoded APK filename with `APK`.

- [ ] **Step 3: Run boundary guard to check manifest**

Run: `node web/scripts/verify-decoupling-integrity.cjs`
Expected: `[PASS] Decoupling boundaries verified.` (manifest check now finds the file and validates package/label).

- [ ] **Step 4: Test IELTS APK build (requires Android SDK)**

Run: `node web/scripts/build-apk.cjs --app=ielts`
Expected: `release/android/IELTS-Cockpit-debug.apk` produced.

- [ ] **Step 5: Test default APK build unchanged**

Run: `node web/scripts/build-apk.cjs`
Expected: `release/android/English-Singularity-debug.apk` produced (same as before).

- [ ] **Step 6: Commit**

```bash
git add web/android/AndroidManifest-ielts.xml web/scripts/build-apk.cjs
git commit -m "build(android): support --app=ielts for independent IELTS Cockpit APK"
```

---

## Verification & Acceptance Checklist

- [ ] `node web/scripts/verify-decoupling-integrity.cjs` passes with 0 violations.
- [ ] `npm test` inside `web/` passes with zero regressions.
- [ ] `set APP_TARGET=ielts&& npx vite build` produces `dist/ielts/`.
- [ ] `node web/scripts/build-apk.cjs --app=ielts` produces `IELTS-Cockpit-debug.apk`.
- [ ] Default `npm run build:fast` and `node web/scripts/build-apk.cjs` still work identically.
