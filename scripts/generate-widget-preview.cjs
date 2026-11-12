// scripts/generate-widget-preview.cjs
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../web/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_FILE = path.resolve(__dirname, '../web/android/res/drawable/widget_preview.png');
const OUT_SCREENSHOT = path.resolve(__dirname, '../screenshots/widget-preview-rendered.png');
const THIS_CONV_ARTIFACT_DIR = process.env.CONV_ARTIFACT_DIR || 'C:\\Users\\thanh\\.gemini\\antigravity\\brain\\333eb3e9-aa7b-4f48-9b64-558b1935505a';
const OUT_CONV = path.join(THIS_CONV_ARTIFACT_DIR, 'widget_preview.png');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: transparent;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 800px;
    height: 480px;
    padding: 24px;
    overflow: hidden;
  }

  .widget-card {
    width: 100%;
    background-color: #12141a;
    border: 1px solid #262a36;
    border-radius: 20px;
    box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(165, 180, 252, 0.12);
    display: flex;
    flex-direction: column;
    padding: 18px 20px 16px;
    position: relative;
    overflow: hidden;
  }

  /* Subtle ambient celestial top highlight */
  .widget-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 15%;
    right: 15%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(165, 180, 252, 0.4), transparent);
  }

  /* Authentic File Explorer Folder Tabs (Strictly Equal 25% Grid) */
  .widget-folder-tab-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    width: 100%;
    margin-bottom: 0;
    position: relative;
    z-index: 2;
  }

  .widget-folder-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 10px 4px 8px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 10px 10px 0 0;
    border: none;
    background: #11151f;
    color: #64748b;
    box-sizing: border-box;
    width: 100%;
    white-space: nowrap;
  }

  .widget-folder-tab.active {
    background: #182030;
    border: none;
    color: #a5b4fc;
    font-weight: 700;
    box-shadow: inset 0 2.5px 0 0 #a5b4fc, 0 -2px 6px rgba(0, 0, 0, 0.25);
    margin-bottom: -1px;
    z-index: 3;
  }

  .widget-folder-body {
    background: #182030;
    border: none;
    border-radius: 0 0 14px 14px;
    padding: 14px 16px 14px;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }

  /* Top Subheader */
  .sub-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .pill-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .badge-streak {
    background: #1c2233;
    border: none;
    border-radius: 10px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 700;
    color: #a5b4fc;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .badge-cefr {
    background: #1c2233;
    border: none;
    border-radius: 10px;
    padding: 5px 12px;
    font-size: 11.5px;
    font-weight: 700;
    color: #a5b4fc;
    letter-spacing: 0.08em;
  }

  .btn-next {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 10px;
    padding: 8px 14px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #9ca3af;
  }

  /* Word Row */
  .word-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-top: 2px;
  }

  .word-title {
    font-size: 22px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.3px;
  }

  .word-phonetic {
    font-size: 13.5px;
    color: #a5b4fc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
    font-weight: 500;
  }

  /* Quick Actions (TTS + Recall) */
  .quick-actions {
    display: flex;
    gap: 7px;
    margin-top: 8px;
    align-items: center;
  }

  .action-pill {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 10px;
    padding: 8px 14px;
    min-height: 44px;
    font-size: 12px;
    font-weight: 700;
    color: #a5b4fc;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .action-pill.secondary {
    color: #9ca3af;
  }

  /* Definition & Example */
  .field-def {
    font-size: 13.5px;
    line-height: 1.45;
    color: #f3f4f6;
    margin-top: 10px;
  }

  .field-example {
    font-size: 12.5px;
    line-height: 1.4;
    color: #9ca3af;
    font-style: italic;
    margin-top: 8px;
  }

  /* Tag Box */
  .tag-box {
    background: #0d121c;
    border: none;
    border-radius: 10px;
    padding: 8px 12px;
    margin-top: 10px;
    font-size: 11.5px;
    color: #a5b4fc;
    line-height: 1.4;
  }

  /* Bottom Footer */
  .widget-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    padding-top: 9px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .brand-kicker {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #64748b;
  }

  .footer-btns {
    display: flex;
    gap: 8px;
  }

  .footer-btn {
    background: #252b3b;
    border: 1px solid #2f3647;
    border-radius: 10px;
    padding: 8px 18px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #f3f4f6;
  }

  .footer-btn.ielts {
    color: #a5b4fc;
    border-color: rgba(165, 180, 252, 0.35);
    background: #202739;
  }
</style>
</head>
<body>

<div class="widget-card">
  <!-- File Explorer Folder Tabs Header (Strictly Equal 25% Grid) -->
  <div class="widget-folder-tab-bar">
    <div class="widget-folder-tab active">📖 Word</div>
    <div class="widget-folder-tab">🧠 Quiz</div>
    <div class="widget-folder-tab">🎯 Quests</div>
    <div class="widget-folder-tab">⚡ Pillars</div>
  </div>

  <!-- File Explorer Folder Body -->
  <div class="widget-folder-body">
    <!-- Sub Header -->
    <div class="sub-header">
      <div class="pill-group">
        <div class="badge-streak">🔥 12-Day Streak</div>
        <div class="badge-cefr">C2 ACADEMIC</div>
      </div>
      <div class="btn-next">Next ↻</div>
    </div>

    <!-- Word + Phonetics -->
    <div class="word-row">
      <span class="word-title">Ephemeral</span>
      <span class="word-phonetic">/ɪˈfem.ər.əl/ • adj</span>
    </div>

    <!-- Quick Audio & Recall Actions -->
    <div class="quick-actions">
      <div class="action-pill">🔊 Word</div>
      <div class="action-pill">🎧 Sentence</div>
      <div class="action-pill secondary">👁 Hide</div>
    </div>

    <!-- Definition & Contextual Example (Clean & Calm without administrative labels) -->
    <div class="field-def">Lasting for only a short period of time; fleeting or transient.</div>
    <div class="field-example">“Fame in the digital era is intensely ephemeral, vanishing as swiftly as it emerges.”</div>

    <!-- Collocations & Synonyms -->
    <div class="tag-box">
      Collocations: ephemeral nature, ephemeral pleasure &nbsp;•&nbsp; Synonyms: transient, fleeting
    </div>
  </div>

  <!-- Bottom Brand & Launchers -->
  <div class="widget-footer">
    <div class="brand-kicker">C2 ACADEMIC • SRS</div>
    <div class="footer-btns">
      <div class="footer-btn">Study</div>
      <div class="footer-btn ielts">IELTS</div>
    </div>
  </div>
</div>

</body>
</html>
`;

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 480, deviceScaleFactor: 2 });
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.mkdirSync(path.dirname(OUT_SCREENSHOT), { recursive: true });
  if (!fs.existsSync(THIS_CONV_ARTIFACT_DIR)) fs.mkdirSync(THIS_CONV_ARTIFACT_DIR, { recursive: true });

  const card = await page.$('.widget-card');
  if (card) {
    await card.screenshot({
      path: OUT_FILE,
      omitBackground: true
    });
    await card.screenshot({
      path: OUT_SCREENSHOT,
      omitBackground: true
    });
  } else {
    await page.screenshot({
      path: OUT_FILE,
      omitBackground: true
    });
    await page.screenshot({
      path: OUT_SCREENSHOT,
      omitBackground: true
    });
  }
  fs.copyFileSync(OUT_SCREENSHOT, OUT_CONV);

  await browser.close();
  console.log('✅ Generated widget preview at:', OUT_FILE);
  console.log('✅ Copied widget preview to artifact:', OUT_CONV);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

