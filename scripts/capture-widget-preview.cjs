const fs = require('fs');
const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../web/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\0f5fbc01-6124-48ab-a316-b4087fedc59d';
const CURRENT_ARTIFACT_DIR = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\7bbbfdf2-564d-4905-a502-fc0de784a312';
const CONV_ARTIFACT_DIR = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\997abe58-555a-4005-bd69-5a7af3eb396d';
const THIS_CONV_ARTIFACT_DIR = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\0306873f-c6bd-441f-96ec-cb4603b2f84b';
const OUT_FILE_LOCAL = path.resolve(__dirname, '../screenshots/mobile-widget-preview.png');
const OUT_FILE_ARTIFACT = path.join(ARTIFACT_DIR, 'mobile-widget-preview.png');
const OUT_FILE_CURRENT = path.join(CURRENT_ARTIFACT_DIR, 'mobile-widget-preview.png');
const OUT_FILE_CONV = path.join(CONV_ARTIFACT_DIR, 'mobile-widget-preview.png');
const OUT_FILE_THIS_CONV = path.join(THIS_CONV_ARTIFACT_DIR, 'mobile-widget-preview.png');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #080a0f;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 32px 28px;
  }

  .showcase-container {
    display: flex;
    gap: 32px;
    align-items: flex-start;
    max-width: 1520px;
    width: 100%;
  }

  /* Phone mock */
  .phone-frame {
    width: 384px;
    height: 870px;
    border-radius: 46px;
    background: radial-gradient(circle at 50% 20%, #151a28 0%, #080a0f 80%);
    border: 3px solid #2a3040;
    box-shadow: 0 25px 60px -15px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 16px 18px 20px;
    flex-shrink: 0;
  }

  /* Status Bar */
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    padding: 6px 12px 12px;
    color: #cbd5e1;
  }
  .status-icons {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
  }

  /* Home clock */
  .home-header {
    text-align: center;
    margin: 6px 0 16px;
  }
  .home-clock {
    font-size: 46px;
    font-weight: 300;
    letter-spacing: -1px;
    line-height: 1;
    color: #ffffff;
  }
  .home-date {
    font-size: 12.5px;
    color: #94a3b8;
    margin-top: 4px;
    font-weight: 500;
  }

  /* COMMON WIDGET SURFACE */
  .singularity-widget {
    background-color: #12141a;
    border: 1px solid #262a36;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    display: flex;
    flex-direction: column;
  }

  /* CLEAN SEGMENTED TAB CONTROLLER (Zero Double Outline) */
  .widget-tab-strip {
    display: flex;
    gap: 3px;
    margin-bottom: 8px;
    background: #141822;
    border-radius: 9px;
    padding: 3px;
    border: 1px solid #232a3a;
  }
  .widget-tab-btn {
    flex: 1;
    text-align: center;
    padding: 6px 0;
    font-size: 11.5px;
    font-weight: 600;
    border-radius: 7px;
    border: none;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .widget-tab-btn.active {
    background: #242c3f;
    color: #a5b4fc;
    font-weight: 700;
    box-shadow: 0 1px 3px rgba(0,0,0,0.35);
  }

  /* SEAMLESS CONTENT BODY (Zero Inner Box Border) */
  .widget-folder-body {
    background: transparent;
    border: none;
    padding: 0;
    box-shadow: none;
  }

  /* Streak / Pill */
  .widget-streak-badge {
    background: #1c2233;
    border: 1px solid #2f3647;
    border-radius: 999px;
    padding: 2.5px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #a5b4fc;
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .widget-badge-cefr {
    background: #1c2233;
    border: 1px solid #2f3647;
    border-radius: 999px;
    padding: 2.5px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #a5b4fc;
    letter-spacing: 0.08em;
    margin-left: 6px;
  }
  .widget-btn-next {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 9px;
    padding: 3px 9px;
    font-size: 11px;
    font-weight: 700;
    color: #9ca3af;
    cursor: pointer;
  }

  /* Word row */
  .widget-word-line {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
  }
  .widget-word {
    font-size: 18.5px;
    font-weight: 700;
    color: #f3f4f6;
    letter-spacing: -0.2px;
  }
  .widget-phonetic {
    font-size: 12px;
    color: #a5b4fc;
    font-family: -apple-system, monospace;
    opacity: 0.95;
  }

  /* Utility controls (Dual Audio + Active Recall) */
  .widget-utility-row {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 4px;
  }
  .widget-util-btn {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 8px;
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #a5b4fc;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
  .widget-util-btn.secondary {
    color: #9ca3af;
  }

  /* Section labels */
  .widget-section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #64748b;
    text-transform: uppercase;
    margin-top: 4px;
    display: block;
  }
  .widget-meaning {
    font-size: 12px;
    line-height: 1.4;
    color: #f3f4f6;
    margin-top: 1px;
  }
  .widget-example {
    font-size: 11.5px;
    line-height: 1.35;
    color: #9ca3af;
    font-style: italic;
    margin-top: 1px;
  }
  .widget-tags-box {
    background: #181f2f;
    border: 1px solid #2a354d;
    border-radius: 8px;
    padding: 4px 8px;
    margin-top: 5px;
    font-size: 11px;
    color: #a5b4fc;
    line-height: 1.35;
  }

  /* TAB 2: Quests Styling */
  .widget-quest-banner {
    background: #1c2233;
    border: 1px solid #2f3647;
    border-radius: 999px;
    padding: 5px 10px;
    font-size: 11.5px;
    font-weight: 700;
    color: #a5b4fc;
    text-align: center;
  }
  .widget-goal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 8px 0 4px;
  }
  .widget-progress-track {
    width: 100%;
    height: 6px;
    background: #1e2230;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  .widget-progress-fill {
    width: 67%;
    height: 100%;
    background: #a5b4fc;
    border-radius: 4px;
  }
  .widget-quest-item {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 9px;
    padding: 6px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }
  .widget-quest-text {
    font-size: 11.5px;
    color: #f3f4f6;
  }
  .widget-quest-text.done {
    color: #a5b4fc;
    font-weight: 700;
  }
  .widget-quest-status {
    font-size: 11px;
    color: #64748b;
  }
  .widget-quest-status.action {
    color: #a5b4fc;
    font-weight: 700;
  }

  /* TAB 3: 4 Pillars Tiles */
  .widget-tiles-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 5px;
  }
  .widget-pillar-tile {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 9px;
    padding: 8px 9px;
    cursor: pointer;
  }
  .widget-tile-title {
    font-size: 12px;
    font-weight: 700;
    color: #f3f4f6;
  }
  .widget-tile-desc {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
  }
  .widget-suite-btn {
    background: #22283a;
    border: 1.5px solid #a5b4fc;
    border-radius: 9px;
    padding: 7px 10px;
    font-size: 11.5px;
    font-weight: 700;
    color: #a5b4fc;
    text-align: center;
    margin-top: 8px;
    cursor: pointer;
  }

  /* Bottom Actions Bar */
  .widget-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
  .widget-kicker {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #64748b;
  }
  .widget-actions {
    display: flex;
    gap: 6px;
  }
  .widget-btn {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 9px;
    padding: 4px 11px;
    font-size: 11px;
    font-weight: 700;
    color: #f3f4f6;
    cursor: pointer;
  }
  .widget-btn.ielts {
    color: #a5b4fc;
    border-color: rgba(165, 180, 252, 0.28);
  }

  /* App Icons Grid */
  .apps-grid {
    margin-top: auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px 12px;
    padding: 12px 4px 10px;
    text-align: center;
  }
  .app-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  .app-icon {
    width: 48px;
    height: 48px;
    border-radius: 13px;
    background: #1e2433;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    position: relative;
  }
  .app-icon.singularity {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(255,255,255,0.12);
    color: #a5b4fc;
    font-weight: 800;
    font-size: 19px;
  }
  .app-icon.singularity .badge {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 15px;
    height: 15px;
    background: #ef4444;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .app-label {
    font-size: 11px;
    color: #cbd5e1;
    font-weight: 500;
  }
  .gesture-bar {
    width: 90px;
    height: 4px;
    background: #94a3b8;
    border-radius: 99px;
    margin: 4px auto 0;
    opacity: 0.6;
  }

  /* Right Side Detail Showcase */
  .details-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .panel-header {
    background: #0f1218;
    border: 1px solid #1f2430;
    border-radius: 16px;
    padding: 14px 18px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .panel-header-title {
    font-size: 15px;
    letter-spacing: 0.06em;
    color: #a5b4fc;
    font-weight: 700;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .panel-header-desc {
    font-size: 12.5px;
    color: #94a3b8;
    line-height: 1.5;
    margin-top: 4px;
  }

  .tabs-trio-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .tab-card-wrapper {
    background: #12141a;
    border: 1px solid #262a36;
    border-radius: 16px;
    padding: 12px 14px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .tab-card-wrapper .singularity-widget {
    background: transparent;
    border: none;
    padding: 0;
    box-shadow: none;
  }
  .tab-header-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tab-title {
    font-size: 12px;
    font-weight: 700;
    color: #f1f5f9;
  }
  .tab-badge {
    background: #1c2233;
    border: 1px solid #2a354d;
    border-radius: 6px;
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 600;
    color: #a5b4fc;
    font-family: monospace;
  }

  /* Responsive Small & Medium Matrix row */
  .responsive-row {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 12px;
  }
  .mini-card-wrapper {
    background: #0f1218;
    border: 1px solid #1f2430;
    border-radius: 16px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
</head>
<body>

<div class="showcase-container">
  <!-- Mobile Phone Mock with Live Tabbed Expanded Widget -->
  <div class="phone-frame">
    <!-- Status Bar -->
    <div class="status-bar">
      <span>12:30</span>
      <div class="status-icons">
        <span>5G</span>
        <span>●●●</span>
        <span>100%</span>
      </div>
    </div>

    <!-- Home Clock -->
    <div class="home-header">
      <div class="home-clock">12:30</div>
      <div class="home-date">Tuesday, October 27</div>
    </div>

    <!-- EXPANDED TABBED WIDGET (Active on Home Screen) -->
    <div class="singularity-widget" style="padding: 12px;">
      <!-- Tab Strip: File Explorer Layered Folder Tabs -->
      <div class="widget-tab-strip">
        <button class="widget-tab-btn active">📖 Word Card</button>
        <button class="widget-tab-btn">🎯 Quests</button>
        <button class="widget-tab-btn">⚡ 4 Pillars</button>
      </div>

      <!-- Folder Body Container -->
      <div class="widget-folder-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div style="display: flex; align-items: center;">
            <span class="widget-streak-badge">🔥 12-Day Streak</span>
            <span class="widget-badge-cefr">C2 ACADEMIC</span>
          </div>
          <button class="widget-btn-next">Next ↻</button>
        </div>

        <div class="widget-word-line">
          <span class="widget-word">Ephemeral</span>
          <span class="widget-phonetic">/ɪˈfem.ər.əl/ • adj</span>
        </div>

        <!-- Dual Audio + Active Recall Controls -->
        <div class="widget-utility-row">
          <button class="widget-util-btn" title="Pronounce headword">🔊 Word</button>
          <button class="widget-util-btn" title="Pronounce model sentence">🎧 Sentence</button>
          <button class="widget-util-btn secondary" title="Toggle active recall mask">👁 Hide</button>
        </div>

        <span class="widget-section-label">Definition</span>
        <div class="widget-meaning">Lasting for only a short period of time; fleeting or transient.</div>

        <span class="widget-section-label">Contextual Example</span>
        <div class="widget-example">“Fame in the digital era is intensely ephemeral, vanishing as swiftly as it emerges.”</div>

        <div class="widget-tags-box">
          ✦ Collocations: ephemeral nature, ephemeral pleasure  •  Synonyms: transient, fleeting
        </div>
      </div>

      <div class="widget-footer">
        <span class="widget-kicker">ENGLISH SINGULARITY</span>
        <div class="widget-actions">
          <button class="widget-btn">Study</button>
          <button class="widget-btn ielts">IELTS</button>
        </div>
      </div>
    </div>

    <!-- App Icons Grid -->
    <div class="apps-grid">
      <div class="app-item">
        <div class="app-icon singularity">
          S
          <div class="badge">3</div>
        </div>
        <span class="app-label">Singularity</span>
      </div>
      <div class="app-item">
        <div class="app-icon">📚</div>
        <span class="app-label">Books</span>
      </div>
      <div class="app-item">
        <div class="app-icon">🎧</div>
        <span class="app-label">Audio</span>
      </div>
      <div class="app-item">
        <div class="app-icon">⚙️</div>
        <span class="app-label">Settings</span>
      </div>
    </div>

    <div class="gesture-bar"></div>
  </div>

  <!-- Right Side: Full 3-Tab Showcase + Responsive Matrix -->
  <div class="details-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="panel-header-title">
        <span>⚡ Tabbed Expanded Android Widget & Responsive Matrix</span>
      </div>
      <p class="panel-header-desc">
        Full tabbed expanded widget powered by native <code style="color: #a5b4fc;">ViewFlipper</code> animated transitions, offline dual TTS audio (<code style="color: #a5b4fc;">🔊 Word</code> & <code style="color: #a5b4fc;">🎧 Sentence</code>), active recall mask toggle (<code style="color: #a5b4fc;">👁 Hide / Reveal</code>), live quest checklist, and direct 4 Pillars launchers.
      </p>
    </div>

    <!-- 3 Expanded Tabs Side-by-Side Trio Grid -->
    <div class="tabs-trio-grid">
      <!-- 1. TAB 1: Word Card -->
      <div class="tab-card-wrapper">
        <div class="tab-header-label">
          <span class="tab-title">📖 Tab 1: Word Card</span>
          <span class="tab-badge">Dual Audio & Recall</span>
        </div>
        <div class="singularity-widget" style="padding: 10px;">
          <div class="widget-tab-strip">
            <button class="widget-tab-btn active">📖 Word</button>
            <button class="widget-tab-btn">🎯 Quests</button>
            <button class="widget-tab-btn">⚡ 4 Pillars</button>
          </div>

          <div class="widget-folder-body" style="padding: 8px 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
              <div style="display: flex; align-items: center;">
                <span class="widget-streak-badge">🔥 12d</span>
                <span class="widget-badge-cefr">C2 ACADEMIC</span>
              </div>
              <button class="widget-btn-next">↻</button>
            </div>

            <div class="widget-word-line">
              <span class="widget-word" style="font-size: 16px;">Ephemeral</span>
              <span class="widget-phonetic">/ɪˈfem.ər.əl/</span>
            </div>

            <div class="widget-utility-row" style="margin-top: 3px;">
              <button class="widget-util-btn" style="padding: 2.5px 6px;">🔊 Word</button>
              <button class="widget-util-btn" style="padding: 2.5px 6px;">🎧 Sentence</button>
              <button class="widget-util-btn secondary" style="padding: 2.5px 6px;">👁 Hide</button>
            </div>

            <span class="widget-section-label" style="margin-top: 3px;">Definition</span>
            <div class="widget-meaning" style="font-size: 11.5px;">Lasting for only a short period of time; fleeting or transient.</div>

            <span class="widget-section-label" style="margin-top: 3px;">Contextual Example</span>
            <div class="widget-example" style="font-size: 11px;">“Fame in the digital era is intensely ephemeral.”</div>

            <div class="widget-tags-box" style="font-size: 11px; padding: 3px 6px; margin-top: 4px;">
              ✦ Collocations: ephemeral nature • Synonyms: fleeting
            </div>
          </div>

          <div class="widget-footer" style="margin-top: 5px; padding-top: 4px;">
            <span class="widget-kicker">SINGULARITY</span>
            <div class="widget-actions">
              <button class="widget-btn" style="padding: 2.5px 8px;">Study</button>
              <button class="widget-btn ielts" style="padding: 2.5px 8px;">IELTS</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. TAB 2: Quests & Streak -->
      <div class="tab-card-wrapper">
        <div class="tab-header-label">
          <span class="tab-title">🎯 Tab 2: Quests</span>
          <span class="tab-badge">Streak & Checklist</span>
        </div>
        <div class="singularity-widget" style="padding: 10px;">
          <div class="widget-tab-strip">
            <button class="widget-tab-btn">📖 Word</button>
            <button class="widget-tab-btn active">🎯 Quests</button>
            <button class="widget-tab-btn">⚡ 4 Pillars</button>
          </div>

          <div class="widget-folder-body" style="padding: 8px 10px; border-radius: 14px;">
            <!-- Banner -->
            <div class="widget-quest-banner">🔥 12-Day Streak • Lv.4 Explorer</div>

            <!-- Goal -->
            <div class="widget-goal-header">
              <span class="widget-section-label" style="margin-top: 0;">DAILY GOAL</span>
              <span style="font-size: 11px; font-weight: 700; color: #a5b4fc;">2/3 Done (67%)</span>
            </div>
            <div class="widget-progress-track">
              <div class="widget-progress-fill"></div>
            </div>

            <!-- 3 Live Quests -->
            <div class="widget-quest-item">
              <span class="widget-quest-text done">✔ 15 SRS Cards Reviewed</span>
              <span class="widget-quest-status">+50 XP</span>
            </div>
            <div class="widget-quest-item">
              <span class="widget-quest-text">○ 1 Rhetorical Copywork</span>
              <span class="widget-quest-status action">Start →</span>
            </div>
            <div class="widget-quest-item">
              <span class="widget-quest-text">○ 1 Speaking Simulation</span>
              <span class="widget-quest-status action">Start →</span>
            </div>
          </div>

          <div class="widget-footer" style="margin-top: 5px; padding-top: 4px;">
            <span class="widget-kicker">SINGULARITY</span>
            <div class="widget-actions">
              <button class="widget-btn" style="padding: 2.5px 8px;">Quests</button>
              <button class="widget-btn ielts" style="padding: 2.5px 8px;">IELTS</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. TAB 3: 4 Pillars Studios -->
      <div class="tab-card-wrapper">
        <div class="tab-header-label">
          <span class="tab-title">⚡ Tab 3: 4 Pillars</span>
          <span class="tab-badge">Studio Launchers</span>
        </div>
        <div class="singularity-widget" style="padding: 10px;">
          <div class="widget-tab-strip">
            <button class="widget-tab-btn">📖 Word</button>
            <button class="widget-tab-btn">🎯 Quests</button>
            <button class="widget-tab-btn active">⚡ 4 Pillars</button>
          </div>

          <div class="widget-folder-body" style="padding: 8px 10px; border-radius: 14px 0 14px 14px;">
            <span class="widget-section-label" style="margin-top: 2px;">CORE ACADEMIC STUDIOS</span>
            <div class="widget-tiles-grid">
              <div class="widget-pillar-tile">
                <div class="widget-tile-title">📖 Reading</div>
                <div class="widget-tile-desc">Speed & Synthesis</div>
              </div>
              <div class="widget-pillar-tile">
                <div class="widget-tile-title">✍️ Writing</div>
                <div class="widget-tile-desc">Task 1 & 2 Studio</div>
              </div>
              <div class="widget-pillar-tile">
                <div class="widget-tile-title">🎧 Listening</div>
                <div class="widget-tile-desc">Acoustic Drills</div>
              </div>
              <div class="widget-pillar-tile">
                <div class="widget-tile-title">🗣️ Speaking</div>
                <div class="widget-tile-desc">Examiner Sim</div>
              </div>
            </div>

            <div class="widget-suite-btn">🏛️ Launch IELTS Suite →</div>
          </div>

          <div class="widget-footer" style="margin-top: 5px; padding-top: 4px;">
            <span class="widget-kicker">SINGULARITY</span>
            <div class="widget-actions">
              <button class="widget-btn" style="padding: 2.5px 8px;">Studios</button>
              <button class="widget-btn ielts" style="padding: 2.5px 8px;">IELTS</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Responsive Matrix: Compact (2x1) & Standard (4x2) Showcase -->
    <div class="responsive-row">
      <!-- Compact Widget -->
      <div class="mini-card-wrapper">
        <div class="tab-header-label">
          <span class="tab-title">🔹 Compact Size (2x1 / 2x2)</span>
          <span class="tab-badge">&lt; 90dp height</span>
        </div>
        <div class="singularity-widget" style="padding: 10px; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="widget-streak-badge">🔥 12d</span>
            <button class="widget-btn-next" style="padding: 2px 7px;">↻</button>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
            <span class="widget-word" style="font-size: 15px;">Ephemeral</span>
            <button class="widget-util-btn" style="padding: 2px 6px;">🔊</button>
          </div>
          <div class="widget-phonetic" style="font-size: 11px;">/ɪˈfem.ər.əl/ • adj</div>
          <div style="font-size: 11px; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            Lasting for only a short period; fleeting.
          </div>
        </div>
      </div>

      <!-- Standard Widget -->
      <div class="mini-card-wrapper">
        <div class="tab-header-label">
          <span class="tab-title">🔸 Standard Size (4x1 / 4x2 Default)</span>
          <span class="tab-badge">90dp–170dp height</span>
        </div>
        <div class="singularity-widget" style="padding: 10px; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center;">
              <span class="widget-streak-badge">🔥 12-Day Streak</span>
              <span style="font-size: 11px; color: #9ca3af; margin-left: 8px;">Lv.4 • 2/3 Quests</span>
            </div>
            <button class="widget-btn-next">Next ↻</button>
          </div>

          <div style="display: flex; align-items: center; gap: 7px; margin-top: 2px;">
            <span class="widget-word" style="font-size: 16.5px;">Ubiquitous</span>
            <button class="widget-util-btn" style="padding: 2px 6px;">🔊</button>
            <span class="widget-phonetic" style="font-size: 11.5px;">/juːˈbɪk.wɪ.təs/ • adj</span>
          </div>
          <div class="widget-meaning" style="font-size: 11.5px;">Present, appearing, or found everywhere simultaneously.</div>
          <div class="widget-example" style="font-size: 11px;">“Mobile devices have become ubiquitous in daily life.”</div>

          <div class="widget-footer" style="margin-top: 4px; padding-top: 4px;">
            <span class="widget-kicker">ENGLISH SINGULARITY</span>
            <div class="widget-actions">
              <button class="widget-btn" style="padding: 3px 9px;">Study</button>
              <button class="widget-btn ielts" style="padding: 3px 9px;">IELTS</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

</body>
</html>
`;

async function main() {
  console.log('[Puppeteer] Launching Chrome for tabbed expanded widget showcase...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1540, height: 950, deviceScaleFactor: 2 });
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Save to screenshots/
  await page.screenshot({ path: OUT_FILE_LOCAL, type: 'png' });
  console.log('[Puppeteer] Saved screenshot to:', OUT_FILE_LOCAL);

  // Copy to Artifact directories
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(OUT_FILE_LOCAL, OUT_FILE_ARTIFACT);
    console.log('[Puppeteer] Copied screenshot to Artifact directory:', OUT_FILE_ARTIFACT);
  }
  if (fs.existsSync(CURRENT_ARTIFACT_DIR)) {
    fs.copyFileSync(OUT_FILE_LOCAL, OUT_FILE_CURRENT);
    console.log('[Puppeteer] Copied screenshot to Current Artifact directory:', OUT_FILE_CURRENT);
  }
  if (fs.existsSync(CONV_ARTIFACT_DIR)) {
    fs.copyFileSync(OUT_FILE_LOCAL, OUT_FILE_CONV);
    console.log('[Puppeteer] Copied screenshot to Conversation Artifact directory:', OUT_FILE_CONV);
  }
  if (fs.existsSync(THIS_CONV_ARTIFACT_DIR)) {
    fs.copyFileSync(OUT_FILE_LOCAL, OUT_FILE_THIS_CONV);
    console.log('[Puppeteer] Copied screenshot to This Session Artifact directory:', OUT_FILE_THIS_CONV);
  }

  await browser.close();
}

main().catch(err => {
  console.error('[Puppeteer] Error capturing screenshot:', err);
  process.exit(1);
});
