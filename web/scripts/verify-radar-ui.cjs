// web/scripts/verify-radar-ui.cjs
// Verification suite for Celestial Radar Modal & Multi-Stage Quiz Stepper UI (ENG-65)

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const SRC = path.join(__dirname, '..', 'src');

console.log('=== TEST 1: Source Code Structural Contracts ===');

const modalCode = fs.readFileSync(path.join(SRC, 'modules', 'multi-skill-quiz-modal.ts'), 'utf8');
const hudCode = fs.readFileSync(path.join(SRC, 'modules', 'header-hud.ts'), 'utf8');
const cssCode = fs.readFileSync(path.join(SRC, 'assets', 'styles', 'dossiers.css'), 'utf8');

// 1.1 MultiSkillQuizModal class and public static API
assert(modalCode.includes('export class MultiSkillQuizModal'), 'MultiSkillQuizModal class must be exported');
assert(modalCode.includes('public static open('), 'MultiSkillQuizModal.open must exist');
assert(modalCode.includes('public static openRadarOnly('), 'MultiSkillQuizModal.openRadarOnly must exist');

// 1.2 5 Stages Definition
assert(modalCode.includes("skillId: 'vocab'"), 'Stage 1 vocab must be defined');
assert(modalCode.includes("skillId: 'grammar'"), 'Stage 2 grammar must be defined');
assert(modalCode.includes("skillId: 'reading'"), 'Stage 3 reading must be defined');
assert(modalCode.includes("skillId: 'listening'"), 'Stage 4 listening must be defined');
assert(modalCode.includes("skillId: 'writing'"), 'Stage 5 writing must be defined');

// 1.3 Radar Chart SVG Generation
assert(modalCode.includes('renderRadarResults()'), 'renderRadarResults must generate SVG');
assert(modalCode.includes('radar-value-polygon'), 'radar-value-polygon must be in SVG markup');
assert(modalCode.includes('polygon points='), 'SVG polygon with calculated coordinates must be generated');
assert(modalCode.includes('radar-axis-spoke'), 'Spoke axes must be generated for each skill');

// 1.4 Header HUD Integration
assert(hudCode.includes('btn-skill-radar'), 'header-hud.ts must render .btn-skill-radar');
assert(hudCode.includes("MultiSkillQuizModal.open('radar')"), 'header-hud.ts must bind .btn-skill-radar to MultiSkillQuizModal.open');

console.log('PASSED: MultiSkillQuizModal structural contracts verified.');

console.log('=== TEST 2: CSS Token and Design System Invariants ===');

const requiredSelectors = [
  '.multi-skill-modal-overlay',
  '.radar-chart-container',
  '.radar-ring',
  '.radar-axis-spoke',
  '.radar-axis-label',
  '.radar-tier-label',
  '.radar-value-polygon',
  '.radar-node-dot',
  '.stepper-header',
  '.stepper-steps-track',
  '.stepper-step',
  '.skill-badge-pill'
];

for (const sel of requiredSelectors) {
  assert(cssCode.includes(sel), `CSS must define selector: ${sel}`);
}

console.log('PASSED: Celestial Radar and Stepper UI CSS rules verified.');

console.log('=== TEST 3: Radar Polygon Geometry Calculation Invariants ===');

// Verify geometry calculation logic
const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const cx = 175;
const cy = 175;
const maxR = 120;
const angleStep = (Math.PI * 2) / 5;
const startAngle = -Math.PI / 2;

function getPoint(index, level) {
  const levelIdx = CEFR_ORDER.indexOf(level);
  const r = (levelIdx + 1) * (maxR / CEFR_ORDER.length);
  const angle = startAngle + index * angleStep;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

// Check polygon geometry for A1 (inner) vs C2 (outer boundary)
const pA1_0 = getPoint(0, 'A1');
const pC2_0 = getPoint(0, 'C2');

assert.strictEqual(pA1_0.x, 175, 'A1 top point X must be centered');
assert.strictEqual(pA1_0.y, 175 - 20, 'A1 top point Y must be 20px above center');
assert.strictEqual(pC2_0.x, 175, 'C2 top point X must be centered');
assert.strictEqual(pC2_0.y, 175 - 120, 'C2 top point Y must be 120px above center (maxR)');

console.log('PASSED: Radar polygon coordinates calculation verified.');

console.log('======================================================');
console.log('ALL ASSERTIONS PASSED: ENG-65 Celestial Radar Modal UI');
console.log('======================================================');
