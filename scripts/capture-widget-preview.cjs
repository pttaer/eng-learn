const fs = require('fs');
const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../web/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const THIS_CONV_ARTIFACT_DIR = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\f76ddff8-47df-43a5-a968-4f3ee2b4bde2';
const OUT_FILE_LOCAL = path.resolve(__dirname, '../screenshots/mobile-widget-preview.png');
const OUT_FILE_THIS_CONV = path.join(THIS_CONV_ARTIFACT_DIR, 'mobile-widget-preview.png');
const OUT_FILE_FLOWS = path.resolve(__dirname, '../Mobile/flows/07-android-widgets/01-widget-showcase-all-sizes.png');

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
    padding: 24px 28px;
  }

  .showcase-container {
    display: flex;
    gap: 28px;
    align-items: flex-start;
    max-width: 1680px;
    width: 100%;
  }

  /* Phone mock */
  .phone-frame {
    width: 380px;
    height: 890px;
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
    padding: 6px 12px 10px;
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
    margin: 4px 0 14px;
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
    padding: 10px 10px 8px;
  }

  /* ========================================================
     AUTHENTIC FILE EXPLORER FOLDER TABS (Strictly Equal 25% Grid)
     ======================================================== */
  .widget-folder-tab-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    width: 100%;
    position: relative;
    z-index: 2;
  }
  .widget-folder-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3.5px;
    padding: 6.5px 2px 5.5px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 8px 8px 0 0;
    border: 1px solid #252e42;
    border-bottom: 1px solid #2d384e;
    background: #11151f;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
  }
  .widget-folder-tab.active {
    background: #182030;
    border: 1px solid #2d384e;
    border-bottom: 1px solid #182030; /* Seamlessly joins the folder body */
    color: #a5b4fc;
    font-weight: 700;
    box-shadow: inset 0 2.5px 0 0 #a5b4fc, 0 -2px 6px rgba(0, 0, 0, 0.25);
    margin-bottom: -1px;
    z-index: 3;
  }

  /* FILE EXPLORER FOLDER BODY */
  .widget-folder-body {
    background: #182030;
    border: 1px solid #2d384e;
    border-radius: 0 0 12px 12px;
    padding: 9px 10px 8px;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
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
    white-space: nowrap;
    flex-shrink: 0;
  }
  .widget-badge-cefr {
    background: #1c2233;
    border: 1px solid #2f3647;
    border-radius: 999px;
    padding: 2.5px 8px;
    font-size: 10.5px;
    font-weight: 700;
    color: #a5b4fc;
    letter-spacing: 0.08em;
    margin-left: 6px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .widget-btn-next {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 8px;
    padding: 3px 8px;
    font-size: 10.5px;
    font-weight: 700;
    color: #9ca3af;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Word row */
  .widget-word-line {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
  }
  .widget-word {
    font-size: 17.5px;
    font-weight: 700;
    color: #f3f4f6;
    letter-spacing: -0.2px;
  }
  .widget-phonetic {
    font-size: 11.5px;
    color: #a5b4fc;
    font-family: -apple-system, monospace;
    opacity: 0.95;
  }

  /* Utility controls (Dual Audio + Active Recall) */
  .widget-utility-row {
    display: flex;
    gap: 5px;
    align-items: center;
    margin-top: 4px;
  }
  .widget-util-btn {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 8px;
    padding: 3px 7px;
    font-size: 10.5px;
    font-weight: 700;
    color: #a5b4fc;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    white-space: nowrap;
  }
  .widget-util-btn.secondary {
    color: #9ca3af;
  }

  /* Section labels */
  .widget-section-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #64748b;
    text-transform: uppercase;
    margin-top: 4px;
    display: block;
  }
  .widget-meaning {
    font-size: 11.5px;
    line-height: 1.35;
    color: #f3f4f6;
    margin-top: 1px;
  }
  .widget-example {
    font-size: 11px;
    line-height: 1.3;
    color: #9ca3af;
    font-style: italic;
    margin-top: 1px;
  }
  .widget-tags-box {
    background: #141a26;
    border: 1px solid #232c3d;
    border-radius: 8px;
    padding: 4px 7px;
    margin-top: 5px;
    font-size: 10.5px;
    color: #a5b4fc;
    line-height: 1.35;
  }

  /* TAB 2: Quiz Option Styles */
  .widget-quiz-option {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 8px;
    padding: 5px 8px;
    font-size: 11px;
    color: #f3f4f6;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .widget-quiz-option.correct {
    background: #1e283d;
    border-color: rgba(165, 180, 252, 0.45);
    color: #a5b4fc;
    font-weight: 700;
  }
  .widget-quiz-option.muted {
    color: #64748b;
  }
  .widget-quiz-feedback {
    background: #141a26;
    border: 1px solid #232c3d;
    border-radius: 8px;
    padding: 4px 8px;
    margin-top: 4px;
    font-size: 10.5px;
    color: #a5b4fc;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* TAB 3: Quests Styling */
  .widget-quest-banner {
    background: #1c2233;
    border: 1px solid #2f3647;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    color: #a5b4fc;
    text-align: center;
  }
  .widget-goal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 6px 0 4px;
  }
  .widget-progress-track {
    width: 100%;
    height: 5px;
    background: #1e2230;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 6px;
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
    border-radius: 8px;
    padding: 5px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .widget-quest-text {
    font-size: 11px;
    color: #f3f4f6;
  }
  .widget-quest-text.done {
    color: #a5b4fc;
    font-weight: 700;
  }
  .widget-quest-status {
    font-size: 10.5px;
    color: #64748b;
  }
  .widget-quest-status.action {
    color: #a5b4fc;
    font-weight: 700;
  }

  /* TAB 4: 4 Pillars Tiles */
  .widget-tiles-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    margin-top: 4px;
  }
  .widget-pillar-tile {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 8px;
    padding: 6px 8px;
    cursor: pointer;
  }
  .widget-tile-title {
    font-size: 11.5px;
    font-weight: 700;
    color: #f3f4f6;
  }
  .widget-tile-desc {
    font-size: 10.5px;
    color: #64748b;
    margin-top: 1px;
  }
  .widget-suite-btn {
    background: #22283a;
    border: 1.5px solid #a5b4fc;
    border-radius: 8px;
    padding: 6px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #a5b4fc;
    text-align: center;
    margin-top: 6px;
    cursor: pointer;
  }

  /* Bottom Actions Bar */
  .widget-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
    padding-top: 5px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
  .widget-kicker {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #64748b;
  }
  .widget-actions {
    display: flex;
    gap: 5px;
  }
  .widget-btn {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 8px;
    padding: 3px 9px;
    font-size: 10.5px;
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
    padding: 12px 4px 8px;
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
    gap: 12px;
  }
  .panel-header {
    background: #0f1218;
    border: 1px solid #1f2430;
    border-radius: 14px;
    padding: 12px 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .panel-header-title {
    font-size: 14.5px;
    letter-spacing: 0.06em;
    color: #a5b4fc;
    font-weight: 700;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .panel-header-desc {
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.45;
    margin-top: 3px;
  }

  /* 4 Tabs Quad Grid */
  .tabs-quad-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .tab-card-wrapper {
    background: #12141a;
    border: 1px solid #262a36;
    border-radius: 14px;
    padding: 10px 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .tab-header-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tab-title {
    font-size: 11.5px;
    font-weight: 700;
    color: #f1f5f9;
    white-space: nowrap;
  }
  .tab-badge {
    background: #1c2233;
    border: 1px solid #2a354d;
    border-radius: 6px;
    padding: 1.5px 6px;
    font-size: 10px;
    font-weight: 600;
    color: #a5b4fc;
    font-family: monospace;
    white-space: nowrap;
  }

  /* Responsive Small & Medium Matrix row */
  .responsive-row {
    display: grid;
    grid-template-columns: 290px 1fr;
    gap: 10px;
  }
  .mini-card-wrapper {
    background: #0f1218;
    border: 1px solid #1f2430;
    border-radius: 14px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
</style>
</head>
<body>

<div class="showcase-container">
  <!-- Mobile Phone Mock with Live 4-Tab File Explorer Widget -->
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
    <div class="singularity-widget">
      <!-- File Explorer Folder Tabs Header (Strictly Equal 25% Grid) -->
      <div class="widget-folder-tab-bar">
        <button class="widget-folder-tab active">📖 Word</button>
        <button class="widget-folder-tab">🧠 Quiz</button>
        <button class="widget-folder-tab">🎯 Quests</button>
        <button class="widget-folder-tab">⚡ Pillars</button>
      </div>

      <!-- File Explorer Folder Body Container -->
      <div class="widget-folder-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
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
          Collocations: ephemeral nature, ephemeral pleasure &bull; Synonyms: transient, fleeting
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

  <!-- Right Side: Full 4-Tab File Explorer Showcase + Responsive Matrix -->
  <div class="details-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="panel-header-title">
        <span>⚡ File Explorer 4-Tab Android Widget & Responsive Matrix</span>
      </div>
      <p class="panel-header-desc">
        Integrated File Explorer tab navigation with mathematically equal 25% tab distribution, native <code style="color: #a5b4fc;">ViewFlipper</code> transitions, offline dual TTS audio (<code style="color: #a5b4fc;">🔊 Word</code> & <code style="color: #a5b4fc;">🎧 Sentence</code>), active recall mask toggle (<code style="color: #a5b4fc;">👁 Hide / Reveal</code>), interactive multiple-choice Vocab Flash Quiz, live quest checklist, and direct 4 Pillars launchers.
      </p>
    </div>

    <!-- 4 Expanded Tabs Side-by-Side Quad Grid -->
    <div class="tabs-quad-grid">
      <!-- 1. TAB 1: Word Card -->
      <div class="tab-card-wrapper">
        <div class="tab-header-label">
          <span class="tab-title">📖 Tab 1: Word Card</span>
          <span class="tab-badge">Dual Audio & Recall</span>
        </div>
        
        <!-- Folder Tabs Header -->
        <div class="widget-folder-tab-bar">
          <button class="widget-folder-tab active">📖 Word</button>
          <button class="widget-folder-tab">🧠 Quiz</button>
          <button class="widget-folder-tab">🎯 Quests</button>
          <button class="widget-folder-tab">⚡ Pillars</button>
        </div>

        <div class="widget-folder-body">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <div style="display: flex; align-items: center;">
              <span class="widget-streak-badge">🔥 12d</span>
              <span class="widget-badge-cefr">C2 ACAD</span>
            </div>
            <button class="widget-btn-next">↻</button>
          </div>

          <div class="widget-word-line">
            <span class="widget-word" style="font-size: 15px;">Ephemeral</span>
            <span class="widget-phonetic">/ɪˈfem.ər.əl/</span>
          </div>

          <div class="widget-utility-row" style="margin-top: 3px;">
            <button class="widget-util-btn" style="padding: 2px 5px;">🔊 Word</button>
            <button class="widget-util-btn" style="padding: 2px 5px;">🎧 Sent</button>
            <button class="widget-util-btn secondary" style="padding: 2px 5px;">👁 Hide</button>
          </div>

          <span class="widget-section-label" style="margin-top: 3px;">Definition</span>
          <div class="widget-meaning" style="font-size: 11px;">Lasting for only a short period; fleeting.</div>

          <span class="widget-section-label" style="margin-top: 2px;">Contextual Example</span>
          <div class="widget-example" style="font-size: 10.5px;">“Fame in the digital era is intensely ephemeral.”</div>

          <div class="widget-tags-box" style="font-size: 10px; padding: 3px 5px; margin-top: 3px;">
            Collocations: ephemeral nature &bull; Synonyms: fleeting
          </div>
        </div>

        <div class="widget-footer" style="margin-top: 4px; padding-top: 3px;">
          <span class="widget-kicker">SINGULARITY</span>
          <div class="widget-actions">
            <button class="widget-btn" style="padding: 2px 6px;">Study</button>
            <button class="widget-btn ielts" style="padding: 2px 6px;">IELTS</button>
          </div>
        </div>
      </div>

      <!-- 2. TAB 2: Vocab Flash Quiz -->
      <div class="tab-card-wrapper">
        <div class="tab-header-label">
          <span class="tab-title">🧠 Tab 2: Vocab Quiz</span>
          <span class="tab-badge">Offline MCQ Quiz</span>
        </div>
        
        <!-- Folder Tabs Header -->
        <div class="widget-folder-tab-bar">
          <button class="widget-folder-tab">📖 Word</button>
          <button class="widget-folder-tab active">🧠 Quiz</button>
          <button class="widget-folder-tab">🎯 Quests</button>
          <button class="widget-folder-tab">⚡ Pillars</button>
        </div>

        <div class="widget-folder-body">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <div style="display: flex; align-items: center;">
              <span class="widget-streak-badge">🧠 1 Correct (+10 XP)</span>
              <span class="widget-badge-cefr">C2 QUIZ</span>
            </div>
            <button class="widget-btn-next">Next ↻</button>
          </div>

          <span class="widget-section-label" style="margin-top: 2px;">TEST ACTIVE RECALL</span>
          <div class="widget-word-line" style="margin-top: 1px;">
            <span class="widget-word" style="font-size: 15px;">Ephemeral</span>
            <span class="widget-phonetic">/ɪˈfem.ər.əl/</span>
          </div>

          <!-- Quiz Options -->
          <div style="margin-top: 4px;">
            <div class="widget-quiz-option correct">
              <span>✔ A. Fleeting or transient</span>
            </div>
            <div class="widget-quiz-option muted">
              <span>B. Present everywhere</span>
            </div>
            <div class="widget-quiz-option muted">
              <span>C. Make less severe</span>
            </div>
          </div>

          <!-- Instant Feedback Banner -->
          <div class="widget-quiz-feedback">
            🎉 Correct! (+10 XP) &bull; Ephemeral
          </div>
        </div>

        <div class="widget-footer" style="margin-top: 4px; padding-top: 3px;">
          <span class="widget-kicker">SINGULARITY</span>
          <div class="widget-actions">
            <button class="widget-btn" style="padding: 2px 6px;">Quiz</button>
            <button class="widget-btn ielts" style="padding: 2px 6px;">IELTS</button>
          </div>
        </div>
      </div>

      <!-- 3. TAB 3: Quests & Streak -->
      <div class="tab-card-wrapper">
        <div class="tab-header-label">
          <span class="tab-title">🎯 Tab 3: Quests</span>
          <span class="tab-badge">Streak & Checklist</span>
        </div>
        
        <!-- Folder Tabs Header -->
        <div class="widget-folder-tab-bar">
          <button class="widget-folder-tab">📖 Word</button>
          <button class="widget-folder-tab">🧠 Quiz</button>
          <button class="widget-folder-tab active">🎯 Quests</button>
          <button class="widget-folder-tab">⚡ Pillars</button>
        </div>

        <div class="widget-folder-body">
          <!-- Banner -->
          <div class="widget-quest-banner">🔥 12-Day Streak &bull; Lv.4 Explorer</div>

          <!-- Goal -->
          <div class="widget-goal-header">
            <span class="widget-section-label" style="margin-top: 0;">DAILY GOAL</span>
            <span style="font-size: 10px; font-weight: 700; color: #a5b4fc;">2/3 Done (67%)</span>
          </div>
          <div class="widget-progress-track">
            <div class="widget-progress-fill"></div>
          </div>

          <!-- 3 Live Quests -->
          <div class="widget-quest-item">
            <span class="widget-quest-text done">✔ 15 SRS Cards</span>
            <span class="widget-quest-status">+50 XP</span>
          </div>
          <div class="widget-quest-item">
            <span class="widget-quest-text">○ Rhetorical Copywork</span>
            <span class="widget-quest-status action">Start →</span>
          </div>
          <div class="widget-quest-item">
            <span class="widget-quest-text">○ Speaking Simulation</span>
            <span class="widget-quest-status action">Start →</span>
          </div>
        </div>

        <div class="widget-footer" style="margin-top: 4px; padding-top: 3px;">
          <span class="widget-kicker">SINGULARITY</span>
          <div class="widget-actions">
            <button class="widget-btn" style="padding: 2px 6px;">Quests</button>
            <button class="widget-btn ielts" style="padding: 2px 6px;">IELTS</button>
          </div>
        </div>
      </div>

      <!-- 4. TAB 4: 4 Pillars Studios -->
      <div class="tab-card-wrapper">
        <div class="tab-header-label">
          <span class="tab-title">⚡ Tab 4: 4 Pillars</span>
          <span class="tab-badge">Studio Launchers</span>
        </div>
        
        <!-- Folder Tabs Header -->
        <div class="widget-folder-tab-bar">
          <button class="widget-folder-tab">📖 Word</button>
          <button class="widget-folder-tab">🧠 Quiz</button>
          <button class="widget-folder-tab">🎯 Quests</button>
          <button class="widget-folder-tab active">⚡ Pillars</button>
        </div>

        <div class="widget-folder-body">
          <span class="widget-section-label" style="margin-top: 2px;">CORE ACADEMIC STUDIOS</span>
          <div class="widget-tiles-grid">
            <div class="widget-pillar-tile">
              <div class="widget-tile-title">📖 Reading</div>
              <div class="widget-tile-desc">Speed & Synth</div>
            </div>
            <div class="widget-pillar-tile">
              <div class="widget-tile-title">✍️ Writing</div>
              <div class="widget-tile-desc">Task 1 & 2</div>
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

        <div class="widget-footer" style="margin-top: 4px; padding-top: 3px;">
          <span class="widget-kicker">SINGULARITY</span>
          <div class="widget-actions">
            <button class="widget-btn" style="padding: 2px 6px;">Studios</button>
            <button class="widget-btn ielts" style="padding: 2px 6px;">IELTS</button>
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
        <div class="singularity-widget" style="padding: 9px; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="widget-streak-badge">🔥 12d</span>
            <button class="widget-btn-next" style="padding: 2px 7px;">↻</button>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
            <span class="widget-word" style="font-size: 14.5px;">Ephemeral</span>
            <button class="widget-util-btn" style="padding: 2px 5px;">🔊</button>
          </div>
          <div class="widget-phonetic" style="font-size: 10.5px;">/ɪˈfem.ər.əl/ • adj</div>
          <div style="font-size: 10.5px; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
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
        <div class="singularity-widget" style="padding: 9px; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center;">
              <span class="widget-streak-badge">🔥 12-Day Streak</span>
              <span style="font-size: 10.5px; color: #9ca3af; margin-left: 8px;">Lv.4 • 2/3 Quests</span>
            </div>
            <button class="widget-btn-next">Next ↻</button>
          </div>

          <div style="display: flex; align-items: center; gap: 7px; margin-top: 2px;">
            <span class="widget-word" style="font-size: 15.5px;">Ubiquitous</span>
            <button class="widget-util-btn" style="padding: 2px 5px;">🔊</button>
            <span class="widget-phonetic" style="font-size: 11px;">/juːˈbɪk.wɪ.təs/ • adj</span>
          </div>
          <div class="widget-meaning" style="font-size: 11px;">Present, appearing, or found everywhere simultaneously.</div>
          <div class="widget-example" style="font-size: 10.5px;">“Mobile devices have become ubiquitous in daily life.”</div>

          <div class="widget-footer" style="margin-top: 3px; padding-top: 3px;">
            <span class="widget-kicker">ENGLISH SINGULARITY</span>
            <div class="widget-actions">
              <button class="widget-btn" style="padding: 2px 7px;">Study</button>
              <button class="widget-btn ielts" style="padding: 2px 7px;">IELTS</button>
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
  console.log('[Puppeteer] Launching headless browser for widget showcase capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1720, height: 960, deviceScaleFactor: 2 });
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Ensure directories exist
  const outDir = path.dirname(OUT_FILE_LOCAL);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const flowsDir = path.dirname(OUT_FILE_FLOWS);
  if (!fs.existsSync(flowsDir)) fs.mkdirSync(flowsDir, { recursive: true });

  if (!fs.existsSync(THIS_CONV_ARTIFACT_DIR)) fs.mkdirSync(THIS_CONV_ARTIFACT_DIR, { recursive: true });

  // Save screenshot locally
  await page.screenshot({ path: OUT_FILE_LOCAL, type: 'png' });
  console.log('[Puppeteer] Saved screenshot to:', OUT_FILE_LOCAL);

  // Copy to Mobile/flows/07-android-widgets/
  fs.copyFileSync(OUT_FILE_LOCAL, OUT_FILE_FLOWS);
  console.log('[Puppeteer] Copied to Mobile flows:', OUT_FILE_FLOWS);

  // Copy to Conversation Artifact
  fs.copyFileSync(OUT_FILE_LOCAL, OUT_FILE_THIS_CONV);
  console.log('[Puppeteer] Copied to Conversation Artifact:', OUT_FILE_THIS_CONV);

  await browser.close();
  console.log('[Puppeteer] Done successfully!');
}

main().catch(err => {
  console.error('[Puppeteer Error]', err);
  process.exit(1);
});
