/**
 * English Singularity - i18n Verification Suite
 * Verifies completeness, symmetry, and correctness of EN & VI localization dictionaries.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const i18nPath = path.join(__dirname, '..', 'src', 'core', 'i18n.ts');
assert(fs.existsSync(i18nPath), `i18n.ts must exist at ${i18nPath}`);

const content = fs.readFileSync(i18nPath, 'utf8');

// Helper to extract a dictionary object block from TS source
function extractDictionary(source, dictName) {
  const marker = `export const ${dictName}: TranslationDictionary = {`;
  const startIdx = source.indexOf(marker);
  assert(startIdx !== -1, `Could not find ${dictName} declaration`);

  const openBrace = source.indexOf('{', startIdx);
  let braceCount = 1;
  let endIdx = openBrace + 1;

  while (braceCount > 0 && endIdx < source.length) {
    if (source[endIdx] === '{') braceCount++;
    else if (source[endIdx] === '}') braceCount--;
    endIdx++;
  }

  const dictCode = source.slice(openBrace, endIdx);
  // Extract key-value pairs matching 'key': 'value' or 'key': "value"
  const regex = /'([^']+)'\s*:\s*(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"]*)"))/g;
  const dict = {};
  let match;
  while ((match = regex.exec(dictCode)) !== null) {
    dict[match[1]] = (match[2] !== undefined ? match[2] : match[3]).replace(/\\'/g, "'").replace(/\\"/g, '"');
  }
  return dict;
}

const en = extractDictionary(content, 'EN_DICTIONARY');
const vi = extractDictionary(content, 'VI_DICTIONARY');

const enKeys = Object.keys(en);
const viKeys = Object.keys(vi);

console.log(`[i18n-verify] Found ${enKeys.length} EN keys and ${viKeys.length} VI keys.`);

assert(enKeys.length > 50, `Expected at least 50 keys, got ${enKeys.length}`);

// 1. Strict Key Symmetry: Every EN key must exist in VI, and vice versa
const missingInVi = enKeys.filter(k => !(k in vi));
const missingInEn = viKeys.filter(k => !(k in en));

assert.strictEqual(
  missingInVi.length,
  0,
  `Keys missing in VI dictionary (${missingInVi.length}):\n  ${missingInVi.join('\n  ')}`
);

assert.strictEqual(
  missingInEn.length,
  0,
  `Keys missing in EN dictionary (${missingInEn.length}):\n  ${missingInEn.join('\n  ')}`
);

// 2. Value Integrity: No empty translations
for (const [key, val] of Object.entries(en)) {
  assert(val.trim().length > 0, `EN key "${key}" has empty translation`);
}
for (const [key, val] of Object.entries(vi)) {
  assert(val.trim().length > 0, `VI key "${key}" has empty translation`);
}

// 3. Parameter Interpolation Consistency: If key in EN contains {param}, VI must contain same {param}
const paramRegex = /\{([a-zA-Z0-9_]+)\}/g;
for (const key of enKeys) {
  const enParams = [...en[key].matchAll(paramRegex)].map(m => m[1]).sort();
  const viParams = [...vi[key].matchAll(paramRegex)].map(m => m[1]).sort();
  assert.deepStrictEqual(
    enParams,
    viParams,
    `Parameter mismatch for key "${key}": EN has [${enParams}], VI has [${viParams}]`
  );
}

// 4. Verify all Required Categories from Specification
const requiredKeys = [
  // Common / generic buttons
  'common.save', 'common.cancel', 'common.close', 'common.submit',
  'common.back', 'common.next', 'common.confirm', 'common.reset',
  'common.loading', 'common.error', 'common.retry', 'common.search',
  'common.filter', 'common.all', 'common.completed', 'common.pending',
  'common.view', 'common.edit', 'common.delete', 'common.copy',
  'common.copied', 'common.share', 'common.export', 'common.import',

  // Header HUD & Nav
  'nav.back_to_constellation', 'nav.change_level', 'nav.daily_streak',
  'nav.speed_blitz', 'nav.cefr_mediation', 'nav.analytics_serl',
  'nav.cd_ielts_cockpit', 'nav.rpg_progression', 'nav.zen_immersion_mode',
  'nav.theme_toggle', 'nav.interactive_tour', 'nav.ambient_music',
  'nav.audio_mute', 'nav.settings_data_management', 'nav.mobile_menu',

  // Settings Modal
  'settings.title', 'settings.appearance', 'settings.language',
  'settings.english', 'settings.vietnamese', 'settings.motion',
  'settings.reduced_motion', 'settings.sound_music', 'settings.ambient_music',
  'settings.haptics', 'settings.daily_reminder', 'settings.notifications',
  'settings.export_profile', 'settings.import_profile', 'settings.reset_tour',
  'settings.reset_placement', 'settings.close',

  // Dossier Names & Tabs
  'dossier.constellation_tree', 'dossier.reading_lab', 'dossier.writing_studio',
  'dossier.listening_chamber', 'dossier.speaking_partner', 'dossier.vocabulary_vault',
  'dossier.collocation_forge', 'dossier.grammar_codex', 'dossier.twelve_verb_tenses',
  'dossier.daily_mission_log', 'dossier.speed_blitz', 'dossier.cefr_mediation',
  'dossier.attack_drills', 'dossier.analytics_cockpit', 'dossier.ielts_exam',

  // Flashcards & Review
  'flashcard.flip', 'flashcard.again', 'flashcard.hard', 'flashcard.good',
  'flashcard.easy', 'flashcard.reveal_answer', 'flashcard.mastered',
  'flashcard.srs_deck', 'flashcard.review_due', 'flashcard.next_card',
  'flashcard.hint', 'flashcard.show_explanation',

  // IELTS specific
  'ielts.overview', 'ielts.diagnostic', 'ielts.reading', 'ielts.listening',
  'ielts.writing', 'ielts.speaking', 'ielts.vocabulary', 'ielts.strategy',
  'ielts.mock_tests', 'ielts.timed_passages', 'ielts.attack_drills_lab',
  'ielts.traps_audio_lab', 'ielts.blueprints_architect', 'ielts.examiner_simulator',
  'ielts.band_score', 'ielts.target_band_7', 'ielts.raw_score', 'ielts.submit_test',

  // Widget
  'widget.streak_format', 'widget.compact_streak', 'widget.study', 'widget.ielts',
  'widget.next', 'widget.definition', 'widget.contextual_example',
  'widget.cefr_tag', 'widget.word_card', 'widget.quests', 'widget.four_pillars',
  'widget.daily_focus'
];

for (const reqKey of requiredKeys) {
  assert(reqKey in en, `Required specification key "${reqKey}" missing from EN dictionary`);
  assert(reqKey in vi, `Required specification key "${reqKey}" missing from VI dictionary`);
}

// 5. Verify functional API patterns exist in i18n.ts
assert(content.includes('export type Locale = \'en\' | \'vi\';'), 'Locale type definition missing');
assert(content.includes('getLocale()'), 'getLocale method missing');
assert(content.includes('setLocale('), 'setLocale method missing');
assert(content.includes('toggleLocale()'), 'toggleLocale method missing');
assert(content.includes('onLocaleChange('), 'onLocaleChange method missing');
assert(content.includes('localizeDom('), 'localizeDom method missing');
assert(content.includes('localStorage.getItem(STORAGE_KEY)'), 'Storage read missing');
assert(content.includes('localStorage.setItem(STORAGE_KEY'), 'Storage write missing');
assert(content.includes('document.documentElement.lang ='), 'document.documentElement.lang sync missing');
assert(content.includes('CustomEvent(LOCALE_EVENT'), 'Window event dispatch missing');
assert(content.includes('data-i18n-title'), 'data-i18n-title selector handling missing');
assert(content.includes('data-i18n-placeholder'), 'data-i18n-placeholder selector handling missing');
assert(content.includes('data-i18n-aria-label'), 'data-i18n-aria-label selector handling missing');

console.log(`[i18n-verify] All ${requiredKeys.length} required spec keys and ${enKeys.length} total keys verified successfully.`);
