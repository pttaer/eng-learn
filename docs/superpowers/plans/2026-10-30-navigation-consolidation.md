# Navigation Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn 17 flat, unevenly exposed routes into five clear mobile destinations — Today · Learn · Words · IELTS · Me — without deleting a single view or breaking a single deep link.

**Architecture:** Navigation-only change inside `HeaderHUD` (`web/src/modules/header-hud.ts`). A `ROUTE_TAB` map assigns every `RouteId` to one bottom-nav tab. Learn and Words open a route sheet built on the shell extracted from the existing "More" sheet. The trimmed "More" sheet becomes "Me". The router, all 17 views, and every hash stay untouched.

**Tech Stack:** TypeScript, Vite, vanilla DOM (no framework), CSS tokens in `web/src/assets/styles/hud-base.css`, i18n dictionaries in `web/src/core/i18n.ts`.

**Spec:** none. Derived from the 2026-10-30 chat ("Too much for one app?"). Decisions are recorded below.

## Global Constraints

- No new dependency. No view or route deleted. `RouteId` in `web/src/core/router.ts:1` is unchanged.
- Every bottom-nav button and every sheet item is at least 44×44 px on phones (`--touch-target-min`). Sheet items use 48px min-height to match the existing sheet.
- Buttons use `border-radius: var(--radius-btn, 10px)`. Icon buttons use `display: inline-flex; align-items: center; gap: 8px`, and icons use `flex-shrink: 0; display: block`.
- New route-sheet items (`.sheet-nav-item`, Learn and Words) have no border inside the sheet card (no concentric outlines). Use a tonal background only. Existing Me-sheet rows keep their current inline style so that sheet stays uniform; restyling them is Phase 2.
- Line numbers in this plan are pre-Task-1. After earlier tasks shift them, find the spot by the named symbol (`onNavigateToCockpit`, `<nav class="hud-bottom-nav"`, the `bnavBlitz` block, `sheet-btn-analytics`).
- Mobile breakpoint is `max-width: 768px` only. No new media queries.
- Every new UI string gets an EN key and a VI key in `web/src/core/i18n.ts`. Bottom-nav labels are one short word.
- **Testing:** following the user's CLAUDE.md, write no new test files. Edit only the existing verify assertions this change breaks. Each task states its success criteria; the user confirms on device.
- After any layout change, screenshot `#tree`, `#read`, `#vocab`, `#habits` and an open sheet at 390×844, 375×667 and 1440×900, and look at them.

---

## Decisions (made in chat; change here before executing)

1. **Bottom nav (5 slots, mobile ≤768px only):**

   | Slot | Class | Action | Active when route is |
   |---|---|---|---|
   | Today | `bnav-tree` | `#tree` (relabelled; the route id stays `tree`) | `tree`, `singularity` |
   | Learn | `bnav-learn` | opens Learn sheet | `read`, `write`, `listen`, `speak`, `mediate`, `drills` |
   | Words | `bnav-words` | opens Words sheet | `vocab`, `colloc`, `grammar`, `tenses`, `blitz` |
   | IELTS | `bnav-ielts` | `./ielts.html` (after the exit guard) | `cockpit` |
   | Me | `bnav-me` | opens Me sheet (the trimmed "More") | `habits`, `analytics`, `settings` |

   This is 5 slots, not the 6-row table from chat. Progress and the old "More" collapse into **Me** so the bar fits 375px and the existing 5-button QA assertion still holds.

2. **Today = the existing skill tree.** `tree` already renders the daily workout banner (`skill-tree-view.ts:279-356`, `getWorkout()`). Relabel only. Renaming the route would touch about 10 hardcoded `#tree` returns (Escape, `bnav-done`, blitz, settings, the `matchHash` fallback, the `mistakes` alias).

3. **Drills (`#drills`, Sound Lab & Email) moves whole into Learn.** Splitting the module is out of scope.

4. **Skill Radar** (`MultiSkillQuizModal.open('radar')`, a modal, not a route) moves from the bottom nav into the Me sheet.

5. **Exam Cockpit** leaves the bottom nav. `#cockpit` still works (the `C` shortcut, desktop HUD button, deep link) and highlights the IELTS tab. Merging Cockpit with `ielts/views/mock.ts` is a separate, later decision.

6. **Desktop (>768px) is out of scope for this plan.** The More/Me sheet is mobile-only: its only header trigger `.btn-mobile-menu-drawer` is `display: none` above 768px (`hud-base.css:1387`), and its other callers are the bottom nav and the sheet itself. So trimming it in Task 4 removes nothing from desktop. The header HUD's ~18 buttons and the 11-route CornerCompass are Phase 2, a separate plan (see the end).

## Deep links that must keep working (do not touch)

- Android `web/android/src/app/englishsingularity/MainActivity.java:153-197`: `#vocab`, `#reading`, `#writing`, `#listening`, `#speaking`.
- Notifications `web/src/core/notification-catalog.ts`: `#collocations` (22), `#mistakes` (6), `ielts.html#listening|speaking|writing`.
- Keyboard: `M` to `mediate`, `C` to `cockpit`, `Ctrl+K` to collocation search (`main.ts:490-515`).
- Spotlight tour targets (`core/spotlight-tour.ts:16-56`): `.hud-telemetry-cluster`, `.workout-banner`, `.constellation-container`, `.branches-summary-grid`, `.hud-actions`. None of them is in the bottom nav.

## File map

| File | Change |
|---|---|
| `web/src/modules/header-hud.ts` | `ROUTE_TAB` map, sheet shell extraction, route sheets, new bottom nav, trimmed Me sheet |
| `web/src/main.ts` | wire `onOpenIelts` with the active-dossier exit guard |
| `web/src/assets/styles/hud-base.css` | `.sheet-nav-list`, `.sheet-nav-item` |
| `web/src/core/i18n.ts` | EN and VI keys for the new labels and titles |
| `web/scripts/verify-mobile-nav.cjs` | rename bnav classes and listener names in the assertions |
| `web/scripts/verify-exam-exit-guard.cjs:75` | update the paint-selector literal |
| `web/scripts/verify-mobile-touch-qa.cjs:193` | update the assertion message only (count stays 5) |

---

### Task 1: Extract the sheet shell from `openMobileActionSheet`

Behaviour-preserving refactor so the Learn, Words and Me sheets share one overlay, close and focus implementation.

**Files:**
- Modify: `web/src/modules/header-hud.ts:720-869` (`openMobileActionSheet`)

**Interfaces:**
- Produces: `private openSheetShell(id: string, title: string, bodyHtml: string): { sheet: HTMLElement; close: () => void }`

- [ ] **Step 1: Add the import**

Change line 5:

```ts
import { icon, IconName } from '../utils/icons';
```

(`IconName` is used in Task 2.)

- [ ] **Step 2: Add `openSheetShell` directly above `openMobileActionSheet`**

Move the overlay creation, header, footer, Escape, backdrop and close-button logic out of `openMobileActionSheet` verbatim. The outer card keeps its current inline style. Only the header title and the body become parameters.

```ts
  private openSheetShell(id: string, title: string, bodyHtml: string): { sheet: HTMLElement; close: () => void } {
    document.getElementById(id)?.remove();
    const opener = document.activeElement as HTMLElement | null;

    // Dismiss any active floating toast notifications so they don't occlude modal header
    document.querySelectorAll('.apple-toast, .streak-freeze-card, .toast-container').forEach(t => t.remove());

    const sheet = document.createElement('div');
    sheet.id = id;
    sheet.className = 'completion-modal-overlay interactive mobile-action-sheet-overlay';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', title);

    sheet.innerHTML = `
      <div class="completion-receipt-card mobile-action-sheet" style="max-width: 500px; width: 92%; max-height: 85dvh; display: flex; flex-direction: column; overflow: hidden; padding: 20px; align-items: stretch; text-align: left; box-sizing: border-box;">
        <div class="mobile-action-sheet-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box; margin-bottom: 16px; border-bottom: 1px solid var(--border-hairline); padding-bottom: 12px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
            <span style="color: var(--accent-gold); display: flex; align-items: center; flex-shrink: 0;">${icon('menu', 16)}</span>
            <span class="telemetry-label" style="font-weight: 700; color: var(--ink-primary); white-space: normal; line-height: 1.3;">${title}</span>
          </div>
          <button type="button" class="sheet-btn-close btn-modal-close" aria-label="${t('common.close', undefined, 'Close')}">✕</button>
        </div>
        ${bodyHtml}
        <div class="apple-modal-footer">
          <button type="button" class="apple-bottom-close-btn btn-modal-close sheet-btn-close" aria-label="${t('common.close', undefined, 'Close')}">
            ${t('common.close', undefined, 'Close')}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(sheet);

    const close = () => {
      sheet.remove();
      document.removeEventListener('keydown', onKey, true);
      opener?.focus();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('keydown', onKey, true);

    sheet.querySelectorAll('.btn-modal-close, .sheet-btn-close').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        close();
      });
    });

    sheet.addEventListener('click', (e) => {
      if (e.target === sheet) {
        AudioSynthesizer.play('click');
        close();
      }
    });

    return { sheet, close };
  }
```

- [ ] **Step 3: Make `openMobileActionSheet` call the shell**

In `openMobileActionSheet`:
- Delete the `existing` removal, the `opener` const, the toast dismissal, the `createElement` block, the header and footer markup, `appendChild`, `close`, `onKey` and the close/backdrop listeners. Each of these now lives in the shell.
- Keep the state reads (`isMuted`, `isZen`, `currentTheme`, `ambientMode`, `progression`).
- Keep the `<div class="mobile-sheet-grid" …> … </div>` block byte-for-byte as `body`.
- Keep every `sheet.querySelector('.sheet-btn-…')` listener below it unchanged.

```ts
  public openMobileActionSheet(): void {
    const isMuted = AudioSynthesizer.isMute();
    const isZen = ZenMode.isZen();
    const currentTheme = this.currentTheme;
    const ambientMode = ambientMusicEngine.getMode();
    const progression = ProgressionEngine.getState();

    const body = `
        <div class="mobile-sheet-grid" ...>   <!-- unchanged block from the old innerHTML -->
        </div>`;

    const { sheet, close } = this.openSheetShell('mobile-action-sheet', t('nav.mobile_controls', undefined, 'MOBILE CONTROLS'), body);

    sheet.querySelector('.sheet-btn-budget')?.addEventListener('click', () => {
    // ...all existing item listeners unchanged...
```

- [ ] **Step 4: Check**

Run: `cd web && npx tsc --noEmit`
Expected: no errors. `sheet` and `close` are still in scope for every existing listener.

Manual check at 390px: tap **More**. The sheet looks identical to before. Escape, the backdrop, ✕ and Close all dismiss it, and focus returns to the More button.

- [ ] **Step 5: Commit**

```bash
git add web/src/modules/header-hud.ts
git commit -m "Update: extract mobile sheet shell for reuse"
```

---

### Task 2: Route sheets (Learn, Words) and their styles

**Files:**
- Modify: `web/src/modules/header-hud.ts` (constants near `ROUTE_NAMES` at line 33, and a method next to `openSheetShell`)
- Modify: `web/src/assets/styles/hud-base.css` (append near `.bnav-btn`, around line 1475)

**Interfaces:**
- Consumes: `openSheetShell` (Task 1), `getRouteName(route)` (`header-hud.ts:29`, already localised through `nav.route_*` keys)
- Produces: `private openRouteSheet(title: string, items: Array<[RouteId, IconName]>): void`, plus the constants `LEARN_SHEET` and `WORDS_SHEET`

- [ ] **Step 1: Add the `RouteId` import**

```ts
import type { RouteId } from '../core/router';
```

- [ ] **Step 2: Add the sheet constants under `ROUTE_NAMES`**

```ts
const LEARN_SHEET: Array<[RouteId, IconName]> = [
  ['read', 'book'],
  ['write', 'edit'],
  ['listen', 'headphones'],
  ['speak', 'mic'],
  ['mediate', 'scale'],
  ['drills', 'note'],
];

const WORDS_SHEET: Array<[RouteId, IconName]> = [
  ['vocab', 'layers'],
  ['colloc', 'grid'],
  ['grammar', 'landmark'],
  ['tenses', 'clock'],
  ['blitz', 'zap'],
];
```

- [ ] **Step 3: Add `openRouteSheet` below `openSheetShell`**

```ts
  private openRouteSheet(title: string, items: Array<[RouteId, IconName]>): void {
    const body = `
      <div class="sheet-nav-list">
        ${items.map(([route, ic]) => `
          <button type="button" class="hud-btn sheet-nav-item" data-route="${route}">
            ${icon(ic, 16)}<span>${getRouteName(route)}</span>
          </button>`).join('')}
      </div>`;
    const { sheet, close } = this.openSheetShell('mobile-route-sheet', title, body);
    sheet.querySelectorAll<HTMLElement>('.sheet-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        HapticEngine.trigger('selection');
        close();
        window.location.hash = `#${btn.dataset.route}`;
      });
    });
  }
```

Navigating by hash goes through `Router.handleHashChange`, so the active dossier's `canDeactivate` guard still runs.

- [ ] **Step 4: Add styles to `hud-base.css`**

```css
.sheet-nav-list {
  display: flex;
  flex-direction: column;
  gap: var(--gap-element);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.sheet-nav-item {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 8px !important;
  width: 100%;
  min-height: 48px;
  padding: 10px 16px;
  border: none;
  border-radius: var(--radius-btn, 10px);
  background: var(--bg-card);
  color: var(--ink-primary);
  font-size: var(--font-body);
  font-weight: 600;
  text-align: left;
}

.sheet-nav-item svg {
  flex-shrink: 0;
  display: block;
}

.sheet-nav-item span {
  white-space: normal;
}
```

- [ ] **Step 5: Check**

Run: `cd web && npx tsc --noEmit`. Expected: no errors. The sheets have no trigger yet; Task 3 wires them.

- [ ] **Step 6: Commit**

```bash
git add web/src/modules/header-hud.ts web/src/assets/styles/hud-base.css
git commit -m "Update: add Learn and Words route sheets"
```

---

### Task 3: New bottom nav — Today · Learn · Words · IELTS · Me

**Files:**
- Modify: `web/src/modules/header-hud.ts:56-61` (callbacks), `:215-235` (markup), `:605-649` (listeners)
- Modify: `web/src/main.ts:327` (wiring next to `onNavigateToCockpit`)

**Interfaces:**
- Consumes: `openRouteSheet`, `LEARN_SHEET`, `WORDS_SHEET` (Task 2), and `openMobileActionSheet` (Task 1)
- Produces: `ROUTE_TAB: Record<RouteId, BnavTab>` and `public onOpenIelts?: () => void | Promise<void>`

- [ ] **Step 1: Add the tab map under `WORDS_SHEET`**

```ts
type BnavTab = 'today' | 'learn' | 'words' | 'ielts' | 'me';

const ROUTE_TAB: Record<RouteId, BnavTab> = {
  tree: 'today', singularity: 'today',
  read: 'learn', write: 'learn', listen: 'learn', speak: 'learn', mediate: 'learn', drills: 'learn',
  vocab: 'words', colloc: 'words', grammar: 'words', tenses: 'words', blitz: 'words',
  cockpit: 'ielts',
  habits: 'me', analytics: 'me', settings: 'me',
};
```

Typing it as `Record<RouteId, …>` makes `tsc` fail if a route is ever added without a tab.

- [ ] **Step 2: Add the callback next to the other `onNavigateTo*` fields (line 61)**

```ts
  public onOpenIelts?: () => void | Promise<void>;
```

- [ ] **Step 3: Replace the five bottom-nav buttons (lines 216-235)**

Compute the active tab once at the top of `render()`, next to `isTree` on line 119:

```ts
    const tab = ROUTE_TAB[this.currentRoute as RouteId] ?? 'today';
```

Replace the contents of `<nav class="hud-bottom-nav" …>`:

```ts
        <button class="bnav-btn bnav-tree ${tab === 'today' ? 'is-active btn-route-active' : ''}" aria-label="${t('nav.today', undefined, 'Today')}" title="${t('nav.today', undefined, 'Today')}">
          <span class="bnav-icon">${icon('sparkles', 18)}</span>
          <span class="bnav-label">${t('nav.today', undefined, 'Today')}</span>
        </button>
        <button class="bnav-btn bnav-learn ${tab === 'learn' ? 'is-active btn-route-active' : ''}" aria-label="${t('nav.learn', undefined, 'Learn')}" title="${t('nav.learn', undefined, 'Learn')}" aria-haspopup="dialog">
          <span class="bnav-icon">${icon('book', 18)}</span>
          <span class="bnav-label">${t('nav.learn', undefined, 'Learn')}</span>
        </button>
        <button class="bnav-btn bnav-words ${tab === 'words' ? 'is-active btn-route-active' : ''}" aria-label="${t('nav.words', undefined, 'Words')}" title="${t('nav.words', undefined, 'Words')}" aria-haspopup="dialog">
          <span class="bnav-icon">${icon('layers', 18)}</span>
          <span class="bnav-label">${t('nav.words', undefined, 'Words')}</span>
        </button>
        <button class="bnav-btn bnav-ielts ${tab === 'ielts' ? 'is-active btn-route-active' : ''}" aria-label="${t('nav.ielts', undefined, 'IELTS')}" title="${t('nav.ielts', undefined, 'IELTS')}">
          <span class="bnav-icon">${icon('graduationCap', 18)}</span>
          <span class="bnav-label">${t('nav.ielts', undefined, 'IELTS')}</span>
        </button>
        <button class="bnav-btn bnav-me ${tab === 'me' ? 'is-active btn-route-active' : ''}" aria-label="${t('nav.me', undefined, 'Me')}" title="${t('nav.me', undefined, 'Me')}" aria-haspopup="dialog">
          <span class="bnav-icon">${icon('trophy', 18)}</span>
          <span class="bnav-label">${t('nav.me', undefined, 'Me')}</span>
        </button>
```

`isTree` stays because lines 127-131 (the route badge) still use it.

- [ ] **Step 4: Replace the listeners (lines 615-649)**

Keep `bnavTree` (lines 605-613) as it is. Replace the `bnavBlitz`, `bnavRadar`, `bnavCockpit` and `bnavMore` blocks and the paint `forEach` with:

```ts
    const bnavLearn = this.element.querySelector('.bnav-learn');
    bnavLearn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.openRouteSheet(t('nav.learn_sheet', undefined, 'Learn'), LEARN_SHEET);
    });

    const bnavWords = this.element.querySelector('.bnav-words');
    bnavWords?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.openRouteSheet(t('nav.words_sheet', undefined, 'Words & Grammar'), WORDS_SHEET);
    });

    const bnavIelts = this.element.querySelector('.bnav-ielts');
    bnavIelts?.addEventListener('click', async () => {
      AudioSynthesizer.play('click');
      if (this.onOpenIelts) await this.onOpenIelts();
      else window.location.href = './ielts.html';
    });

    const bnavMe = this.element.querySelector('.bnav-me');
    bnavMe?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.openMobileActionSheet();
    });

    this.element.querySelectorAll<HTMLElement>('.bnav-tree').forEach((btn) => {
      btn.addEventListener('click', () => this.paintBnav(btn));
    });
```

Only Today paints on tap, because the other tabs open sheets. After a sheet item is chosen, `updateTelemetry` re-renders and `syncBnavPaint` paints the `is-active` tab.

- [ ] **Step 5: Wire the IELTS exit guard in `main.ts` (after the `onNavigateToCockpit` block at line 329)**

A full-page jump to `ielts.html` bypasses the router guard. Without this step, tapping IELTS mid-exam in Cockpit or Blitz would drop the session silently.

```ts
    // Bottom nav IELTS: leaving the page must still respect the active dossier's exit guard
    this.headerHud.onOpenIelts = async () => {
      const handle = this.activeDossierHandle;
      if (handle && typeof handle.canDeactivate === 'function' && !(await handle.canDeactivate('tree'))) return;
      window.location.href = './ielts.html';
    };
```

- [ ] **Step 6: Check**

Run: `cd web && npx tsc --noEmit`. Expected: no errors.

Manual check at 390px:
- On `#tree`, Today is highlighted.
- Learn opens 6 items. Tapping Reading routes to `#read`, and Learn becomes highlighted.
- Words opens 5 items. Tapping 12 Tenses routes to `#tenses`, and Words is highlighted.
- IELTS opens `ielts.html`. The IELTS back link returns to `index.html`.
- Start a Cockpit exam (`C`) and tap IELTS: the leave-exam confirm appears, and Cancel stays on the exam.
- `#cockpit` highlights IELTS.
- `#habits` highlights Me.
- The contextual dock (Done ✕) in drills still replaces the bar and restores it on exit.

- [ ] **Step 7: Commit**

```bash
git add web/src/modules/header-hud.ts web/src/main.ts
git commit -m "Update: bottom nav Today, Learn, Words, IELTS, Me"
```

---

### Task 4: Trim "More" into "Me"

Remove the items that now live in Learn, Words or the IELTS slot, and add Radar.

**Files:**
- Modify: `web/src/modules/header-hud.ts` (the `openMobileActionSheet` body and listeners)

- [ ] **Step 1: Retitle the sheet**

In the `openSheetShell(...)` call from Task 1, replace `t('nav.mobile_controls', undefined, 'MOBILE CONTROLS')` with `t('nav.me_sheet', undefined, 'Me: progress & settings')`.

- [ ] **Step 2: Delete four buttons from the body and their listeners**

| Remove button (body) | Remove listener |
|---|---|
| `sheet-btn-ielts-suite` (`<a href="./ielts.html">`, old line 774) | `.sheet-btn-ielts-suite` (old line 906) |
| `sheet-btn-mediation` (old line 777) | `.sheet-btn-mediation` (old line 911) |
| `sheet-btn-drills` (old line 780) | `.sheet-btn-drills` (old line 918) |
| `sheet-btn-tenses` (old line 786) | `.sheet-btn-tenses` (old line 931) |

Keep: budget, exam, locale, progression, habits, analytics, mistake-vault, commute-audio, theme, sound, music, zen, tour, export, import and settings.

- [ ] **Step 3: Add Radar directly after the `sheet-btn-analytics` button**

Copy the analytics button's inline style exactly so the list stays visually uniform:

```ts
          <button class="hud-btn sheet-btn-radar" style="min-height: 48px; padding: 12px 14px; justify-content: flex-start; font-weight: 600; background: var(--bg-card); border: 1px solid var(--border-hairline); color: var(--ink-primary); border-radius: var(--radius-btn, 10px); gap: 10px;">
            ${icon('target', 16)} <span>${t('nav.radar_full', undefined, 'Skill Radar check')}</span>
          </button>
```

Add the listener next to the analytics listener:

```ts
    sheet.querySelector('.sheet-btn-radar')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      close();
      MultiSkillQuizModal.open('radar');
    });
```

- [ ] **Step 4: Remove orphans**

Run: `cd web && npx tsc --noEmit`. Grep `header-hud.ts` for `onNavigateToMediation`. It is still used by the desktop `.btn-mediation` (line 438), so keep it. Delete only symbols that become unused.

- [ ] **Step 5: Check**

At 390px, Me shows 16 items (down from 21) with no duplicate of anything reachable from Learn, Words or IELTS. Radar opens the quiz modal.

- [ ] **Step 6: Commit**

```bash
git add web/src/modules/header-hud.ts
git commit -m "Update: trim More sheet into Me"
```

---

### Task 5: i18n keys

**Files:**
- Modify: `web/src/core/i18n.ts` (EN dictionary next to `'nav.more'` around line 73; VI dictionary next to `'nav.more'` around line 2014)

- [ ] **Step 1: EN, after `'nav.more': 'More',`**

```ts
  'nav.today': 'Today',
  'nav.learn': 'Learn',
  'nav.words': 'Words',
  'nav.ielts': 'IELTS',
  'nav.me': 'Me',
  'nav.learn_sheet': 'Learn: skills',
  'nav.words_sheet': 'Words & Grammar',
  'nav.me_sheet': 'Me: progress & settings',
  'nav.radar_full': 'Skill Radar check',
```

- [ ] **Step 2: VI, after `'nav.more': 'Thêm',`**

```ts
  'nav.today': 'Hôm nay',
  'nav.learn': 'Học',
  'nav.words': 'Từ vựng',
  'nav.ielts': 'IELTS',
  'nav.me': 'Tôi',
  'nav.learn_sheet': 'Học: kỹ năng',
  'nav.words_sheet': 'Từ vựng & Ngữ pháp',
  'nav.me_sheet': 'Tôi: tiến độ & cài đặt',
  'nav.radar_full': 'Kiểm tra Radar kỹ năng',
```

- [ ] **Step 3: Check**

Switch the locale in Me, then the language toggle. All 5 bottom labels change. "Hôm nay" and "Từ vựng" fit one line at 375px without ellipsis.

- [ ] **Step 4: Commit**

```bash
git add web/src/core/i18n.ts
git commit -m "Update: EN/VI labels for new bottom nav"
```

---

### Task 6: Update the existing verify assertions this change breaks

Not new tests: these assertions hardcode the old bar, so `npm test` fails without this edit. A full grep of `web/scripts/*.cjs` for `bnav-`, the removed `sheet-btn-*` classes, `Mobile Navigation Menu` and `MOBILE CONTROLS` matched only these three files. `.mobile-action-sheet-overlay` and `.mobile-action-sheet` (used by `verify-mobile-touch-qa.cjs` and `interactive-layout-tester.cjs`) are kept by the shell in Task 1.

**Files:**
- Modify: `web/scripts/verify-mobile-nav.cjs:61-79`
- Modify: `web/scripts/verify-exam-exit-guard.cjs:75`
- Modify: `web/scripts/verify-mobile-touch-qa.cjs:193`

- [ ] **Step 1: `verify-mobile-nav.cjs`**

Replace lines 61-65 with:

```js
assert.ok(hudSrc.includes('bnav-tree'), 'Missing [ Today ] primary bottom thumb action');
assert.ok(hudSrc.includes('bnav-learn'), 'Missing [ Learn ] primary bottom thumb action');
assert.ok(hudSrc.includes('bnav-words'), 'Missing [ Words ] primary bottom thumb action');
assert.ok(hudSrc.includes('bnav-ielts'), 'Missing [ IELTS ] primary bottom thumb action');
assert.ok(hudSrc.includes('bnav-me'), 'Missing [ Me ] primary bottom thumb action');
```

Line 68 array:

```js
['bnav-tree', 'bnav-learn', 'bnav-words', 'bnav-ielts', 'bnav-me'].forEach(cls => {
```

Lines 75-79:

```js
assert.ok(hudSrc.includes('bnavTree'), 'Missing bnavTree listener binding');
assert.ok(hudSrc.includes('bnavLearn'), 'Missing bnavLearn listener binding');
assert.ok(hudSrc.includes('bnavWords'), 'Missing bnavWords listener binding');
assert.ok(hudSrc.includes('bnavIelts'), 'Missing bnavIelts listener binding');
assert.ok(hudSrc.includes('bnavMe'), 'Missing bnavMe listener binding');
```

Read lines 66-72 first. If the aria-label regex there depends on button order or old label text, adjust only that.

- [ ] **Step 2: `verify-exam-exit-guard.cjs:75`**

```js
assert.ok(hudSrc.includes("querySelectorAll<HTMLElement>('.bnav-tree')"), 'Only the Today route button in bottom nav should trigger paintBnav');
```

- [ ] **Step 3: `verify-mobile-touch-qa.cjs:193`** (message only; the count stays 5)

```js
      assert.strictEqual(bottomNavStats.buttonCount, 5, 'Bottom nav must have exactly 5 thumb actions (Today, Learn, Words, IELTS, Me)');
```

- [ ] **Step 4: Run the full suites**

```bash
cd web && npm test
cd web && npm run test:mobile
```

Expected: `91/91 verify scripts passed` (or the current total; compare with `git stash` if unsure) and 0 `[FAIL]` in mobile touch QA. If another script fails on a `bnav-` or `sheet-btn-` selector, `grep -n "bnav-\|sheet-btn-" web/scripts/*.cjs` and update only that selector.

- [ ] **Step 5: Commit**

```bash
git add web/scripts/verify-mobile-nav.cjs web/scripts/verify-exam-exit-guard.cjs web/scripts/verify-mobile-touch-qa.cjs
git commit -m "Update: verify scripts for new bottom nav"
```

---

### Task 7: Visual QA (project CLAUDE.md requirement)

- [ ] **Step 1: Build and serve**

```bash
cd web && npm run build:fast && npx vite preview --port 4173
```

- [ ] **Step 2: Screenshot each state at 390×844, 375×667 and 1440×900**

States: `#tree`, `#read`, `#vocab`, `#habits`, `#cockpit`, the Learn sheet open, the Words sheet open, and the Me sheet open.

Use the existing `web/scripts/capture-all-views.cjs` if it accepts a route list; otherwise capture by hand in Chrome DevTools device mode.

- [ ] **Step 3: Look at every screenshot and confirm**

- 5 bottom buttons, each at least 44×44, labels on one line, active tab correct.
- Sheet items are at least 48px tall with an 8px gap, no border inside the sheet card, and text left-aligned.
- Content is not hidden under the bar (`--safe-bottom-dock`).
- At 1440 nothing changed (the bar is hidden above 768px).

- [ ] **Step 4: Hand off to the user**

The user confirms on device (Android APK via `npm run build:apk`).

---

## Phase 2+ (separate plans; decide before writing)

1. **Desktop header (>768px).** The HUD has about 18 buttons (`header-hud.ts:140-212`): streak, budget, exam, radar, blitz, mediation, analytics, cockpit, export, import, level, scaffolding mode, zen, theme, locale, tour, music, sound and settings. Proposal: the same five destinations as header tabs, plus theme, sound and settings. Move export, import, locale, tour, music, zen and scaffolding mode into `#settings`.
2. **CornerCompass (desktop only; already hidden ≤768px at `ux-c.css:69`).** Its 11 route buttons duplicate the tabs after item 1. Proposal: delete it.
3. **Progress screens.** Tree, Singularity canvas, Analytics and Radar overlap. Decide which survive as Me's progress view.
4. **Cockpit vs the IELTS app.** `#cockpit` (40-question exam) and `ielts/views/mock.ts` overlap. Decide whether to merge, link or keep both.
5. **`#mistakes` deep link.** It aliases to `tree` (`router.ts:37`) and does not open the Mistake Vault. Six notifications send people there.

## Noticed, not touched

- `main.ts:233-246` calls `router.setBeforeNavigate` twice with identical bodies. The first call is dead.
