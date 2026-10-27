# Mobile App Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a high-fidelity, battery-friendly, 100% offline Android Home Screen Widget for English Singularity & IELTS displaying active streak, daily goal progress, rotating C2/IELTS vocabulary flashcards, and one-tap deep-links.

**Architecture:** A native Android `AppWidgetProvider` backed by `RemoteViews` styled with our Apple-Calm / Obsidian dark design tokens. State synchronization is mediated via an `@JavascriptInterface` bridge (`AndroidWidgetBridge`) connecting the web learning telemetry (`progression-engine`, `srs-engine`, `mission-log`) to Android `SharedPreferences`. The widget also features offline built-in fallback cards so it functions immediately on first install.

**Tech Stack:** Android SDK (Java 11, `AppWidgetProvider`, `RemoteViews`, `SharedPreferences`), `aapt2`, `d8`, `javac`, TypeScript / Web DOM event bus.

**Spec:** [`docs/MOBILE_FEATURE_PROPOSALS.md`](file:///e:/Eng/docs/MOBILE_FEATURE_PROPOSALS.md)

## Global Constraints

- 100% Client-Side & Offline: Zero internet permissions (`android.permission.INTERNET` strictly forbidden).
- Toolchain: Pure Android SDK build-tools without Gradle or npm native wrappers (`build-apk.cjs`).
- UI Styling: Obsidian `#0d0f12`, Surface `#16181d`, Hairline Border `#242831`, Text Primary `#f0f2f5`, Text Muted `#8b92a0`, Accent Gold `#e6a23c` / Amber `#d97706`.
- Deep-links: Support direct one-tap jumps to Singularity Vocab (`index.html#vocab`) and IELTS Academic Suite (`ielts.html`).

---

### Task 1: Android Widget XML Resources & Provider Info

**Files:**
- Create: `web/android/res/xml/widget_info.xml`
- Create: `web/android/res/drawable/widget_bg.xml`
- Create: `web/android/res/drawable/widget_badge_bg.xml`
- Create: `web/android/res/drawable/widget_btn_bg.xml`
- Create: `web/android/res/layout/widget_singularity.xml`
- Modify: `web/android/res/values/strings.xml`
- Modify: `web/android/res/values/styles.xml`

**Interfaces:**
- Consumes: Standard Android `RemoteViews` XML schema.
- Produces: `@layout/widget_singularity`, `@xml/widget_info`, strings and drawables for `SingularityWidgetProvider`.

- [ ] **Step 1: Define widget metadata in `res/xml/widget_info.xml`**
- [ ] **Step 2: Create rounded dark surface drawables (`widget_bg.xml`, `widget_badge_bg.xml`, `widget_btn_bg.xml`)**
- [ ] **Step 3: Define `widget_singularity.xml` layout featuring Streak Pill, Word of the Day, Phonetics, Gloss, and Deep-Link Buttons**
- [ ] **Step 4: Update `strings.xml` with widget labels and initial strings**

---

### Task 2: Native Android Widget Provider & Bridge (`Java`)

**Files:**
- Create: `web/android/src/app/englishsingularity/SingularityWidgetProvider.java`
- Modify: `web/android/src/app/englishsingularity/MainActivity.java`
- Modify: `web/android/AndroidManifest.xml`

**Interfaces:**
- Consumes: `SharedPreferences` ("widget_prefs") populated by `WebAppInterface`.
- Produces: `@JavascriptInterface` method `updateWidgetData(String json)` and `PendingIntent` handlers for `ACTION_NEXT_WORD`, `ACTION_OPEN_VOCAB`, and `ACTION_OPEN_IELTS`.

- [ ] **Step 1: Write `SingularityWidgetProvider.java` with offline word carousel, streak rendering, and pending intents**
- [ ] **Step 2: Add `@JavascriptInterface` inside `MainActivity.java` to persist streak & vocabulary updates to `SharedPreferences`**
- [ ] **Step 3: Update `MainActivity.java` to handle deep-link intent actions (`ACTION_OPEN_VOCAB`, `ACTION_OPEN_IELTS`)**
- [ ] **Step 4: Register `SingularityWidgetProvider` receiver in `AndroidManifest.xml`**

---

### Task 3: Build Pipeline Update (`build-apk.cjs`)

**Files:**
- Modify: `web/scripts/build-apk.cjs`

**Interfaces:**
- Consumes: All `.java` files under `web/android/src/`.
- Produces: Clean multi-class compilation (`R.java`, `MainActivity.java`, `SingularityWidgetProvider.java`) into `classes.dex` and signed APK.

- [ ] **Step 1: Modify `build-apk.cjs` to discover and compile all `.java` source files in `web/android/src` rather than hardcoding `mainSrc`**
- [ ] **Step 2: Update mtime caching logic to track all Java source and XML resource files**
- [ ] **Step 3: Test clean APK compilation and verify manifest badging and receiver registration**

---

### Task 4: Web Telemetry Sync Engine (`TypeScript`)

**Files:**
- Create: `web/src/core/widget-bridge.ts`
- Modify: `web/src/main.ts`
- Modify: `web/src/ielts/main.ts`

**Interfaces:**
- Consumes: `progression-engine.ts`, `mission-log.ts`, and `srs-engine.ts`.
- Produces: `window.AndroidBridge.updateWidgetData(json)` sync payloads whenever streak, reviews, or vocabulary are mastered.

- [ ] **Step 1: Create `widget-bridge.ts` that formats streak, goal progress, and recently learned words into widget payload**
- [ ] **Step 2: Hook widget sync into initialization and state updates in `main.ts` and `ielts/main.ts`**
- [ ] **Step 3: Handle hash routing / deep-link anchors in `main.ts` when launched from widget actions**

---

### Task 5: End-to-End Build & Verification

**Files:**
- Test: `web/scripts/build-apk.cjs`
- Test: `web/release/android/English-Singularity-debug.apk`

- [ ] **Step 1: Run `npm run build:apk`**
- [ ] **Step 2: Verify `aapt2 dump xmltree` and `badging` confirm `SingularityWidgetProvider` receiver and meta-data**
- [ ] **Step 3: Verify zero network permissions invariant and file size**

