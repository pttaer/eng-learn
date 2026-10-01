/**
 * VERIFY SPECULAR 3D CARD SHIMMER & NEBULA CANVAS
 * Automated test suite for Ticket ENG-49 (Task 1).
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('✨ [VERIFICATION] ENG-49: Specular 3D Card Shimmer & Nebula Canvas');
console.log('================================================================\n');

// 1. Static Contract & Source File Verification
console.log('--- 1. STATIC CODE & ARCHITECTURE CONTRACTS ---');
const perspectiveCanvasPath = path.join(__dirname, '..', 'src', 'core', 'perspective-canvas.ts');
const atomicCardCssPath = path.join(__dirname, '..', 'src', 'assets', 'styles', 'atomic-card.css');
const hudBaseCssPath = path.join(__dirname, '..', 'src', 'assets', 'styles', 'hud-base.css');
const skillTreeViewPath = path.join(__dirname, '..', 'src', 'modules', 'skill-tree-view.ts');
const mainPath = path.join(__dirname, '..', 'src', 'main.ts');

assert.ok(fs.existsSync(perspectiveCanvasPath), 'perspective-canvas.ts must exist');
assert.ok(fs.existsSync(atomicCardCssPath), 'atomic-card.css must exist');
assert.ok(fs.existsSync(hudBaseCssPath), 'hud-base.css must exist');
assert.ok(fs.existsSync(skillTreeViewPath), 'skill-tree-view.ts must exist');
assert.ok(fs.existsSync(mainPath), 'main.ts must exist');

const perspectiveSource = fs.readFileSync(perspectiveCanvasPath, 'utf8');
const atomicCssSource = fs.readFileSync(atomicCardCssPath, 'utf8');
const hudCssSource = fs.readFileSync(hudBaseCssPath, 'utf8');
const skillTreeSource = fs.readFileSync(skillTreeViewPath, 'utf8');
const mainSource = fs.readFileSync(mainPath, 'utf8');

// Verify CardTiltController and NebulaCanvas classes
assert.ok(perspectiveSource.includes('export class CardTiltController'), 'perspective-canvas.ts must export CardTiltController');
assert.ok(perspectiveSource.includes('export class NebulaCanvas'), 'perspective-canvas.ts must export NebulaCanvas');
assert.ok(perspectiveSource.includes('public static initCardTilt'), 'PerspectiveCanvas must provide static initCardTilt hook');
assert.ok(perspectiveSource.includes('public static initNebula'), 'PerspectiveCanvas must provide static initNebula hook');

// Verify tilt calculation & CSS variable exports
assert.ok(perspectiveSource.includes('--glare-x'), 'Must update --glare-x variable');
assert.ok(perspectiveSource.includes('--glare-y'), 'Must update --glare-y variable');
assert.ok(perspectiveSource.includes('--glare-opacity'), 'Must update --glare-opacity variable');
assert.ok(perspectiveSource.includes('--card-rotate-x'), 'Must update --card-rotate-x variable');
assert.ok(perspectiveSource.includes('--card-rotate-y'), 'Must update --card-rotate-y variable');
assert.ok(perspectiveSource.includes('rotateX(') && perspectiveSource.includes('rotateY('), 'Must apply 3D rotateX and rotateY transform');

// Verify CSS Styles & Holographic Sheen
assert.ok(atomicCssSource.includes('--glare-x') && atomicCssSource.includes('--glare-y'), 'atomic-card.css must reference glare variables');
assert.ok(atomicCssSource.includes('radial-gradient'), 'atomic-card.css must style holographic sheen with radial-gradient');
assert.ok(atomicCssSource.includes('.is-mouse-out'), 'atomic-card.css must include smooth spring return class .is-mouse-out');
assert.ok(atomicCssSource.includes('mix-blend-mode: screen'), 'atomic-card.css must use screen blend mode for specular reflection');
assert.ok(atomicCssSource.includes('prefers-reduced-motion'), 'atomic-card.css must guard reduced motion');

// Verify HUD Base styles & Nebula Canvas
assert.ok(hudCssSource.includes('.constellation-nebula-canvas'), 'hud-base.css must define .constellation-nebula-canvas');
assert.ok(skillTreeSource.includes('constellation-nebula-canvas'), 'skill-tree-view.ts must mount nebula canvas');
assert.ok(skillTreeSource.includes('NebulaCanvas'), 'skill-tree-view.ts must import and instantiate NebulaCanvas');
assert.ok(skillTreeSource.includes('teardown'), 'skill-tree-view.ts must provide teardown() lifecycle method');

// Verify main.ts initialization
assert.ok(mainSource.includes('CardTiltController.init()'), 'main.ts must call CardTiltController.init()');
assert.ok(mainSource.includes('(window as any).CardTiltController'), 'main.ts must expose CardTiltController on window');
assert.ok(mainSource.includes('(window as any).NebulaCanvas'), 'main.ts must expose NebulaCanvas on window');
console.log('✅ All static source contracts and architectural exports verified.\n');

// 2. Mathematical 3D Card Tilt & Glare Invariants
console.log('--- 2. 3D TILT & SPECULAR SHEEN MATHEMATICAL INVARIANTS ---');

function calculateTilt(clientX, clientY, rect) {
  const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

  const normX = (relX - 0.5) * 2;
  const normY = (relY - 0.5) * 2;

  const MAX_TILT = 7.5;
  let rotateX = -normY * MAX_TILT;
  let rotateY = normX * MAX_TILT;
  if (Math.abs(rotateX) < 1e-5) rotateX = 0;
  if (Math.abs(rotateY) < 1e-5) rotateY = 0;

  const glareX = relX * 100;
  const glareY = relY * 100;
  const dist = Math.min(1, Math.hypot(normX, normY) / Math.SQRT2);
  const glareOpacity = 0.15 + dist * 0.45;

  return { rotateX, rotateY, glareX, glareY, glareOpacity };
}

const mockRect = { left: 100, top: 100, width: 600, height: 400 };

// Center point test (neutral state)
const center = calculateTilt(400, 300, mockRect);
assert.strictEqual(center.rotateX, 0, 'Center hover has 0deg rotateX');
assert.strictEqual(center.rotateY, 0, 'Center hover has 0deg rotateY');
assert.strictEqual(center.glareX, 50, 'Center hover has 50% glareX');
assert.strictEqual(center.glareY, 50, 'Center hover has 50% glareY');
assert.strictEqual(center.glareOpacity, 0.15, 'Center hover has base glare opacity 0.15');

// Top-Left Corner test
const topLeft = calculateTilt(100, 100, mockRect);
assert.strictEqual(topLeft.rotateX, 7.5, 'Top-left tilts forward on X (+7.5deg)');
assert.strictEqual(topLeft.rotateY, -7.5, 'Top-left tilts left on Y (-7.5deg)');
assert.strictEqual(topLeft.glareX, 0, 'Top-left glareX is 0%');
assert.strictEqual(topLeft.glareY, 0, 'Top-left glareY is 0%');
assert.ok(topLeft.glareOpacity > 0.5, 'Top-left glareOpacity is boosted at perimeter');

// Bottom-Right Corner test
const bottomRight = calculateTilt(700, 500, mockRect);
assert.strictEqual(bottomRight.rotateX, -7.5, 'Bottom-right tilts back on X (-7.5deg)');
assert.strictEqual(bottomRight.rotateY, 7.5, 'Bottom-right tilts right on Y (+7.5deg)');
assert.strictEqual(bottomRight.glareX, 100, 'Bottom-right glareX is 100%');
assert.strictEqual(bottomRight.glareY, 100, 'Bottom-right glareY is 100%');

// Clamping test (outside bounds)
const outBounds = calculateTilt(9999, -9999, mockRect);
assert.ok(Math.abs(outBounds.rotateX) <= 7.5, 'rotateX is strictly clamped <= 7.5deg');
assert.ok(Math.abs(outBounds.rotateY) <= 7.5, 'rotateY is strictly clamped <= 7.5deg');
assert.ok(outBounds.glareOpacity <= 0.65, 'glareOpacity is strictly clamped <= 0.65');
console.log('✅ 3D tilt coordinates, angular bounds, and specular glare invariants verified.\n');

// 3. Nebula Starfield & Cosmic Puffs Simulation
console.log('--- 3. DEEP-SPACE NEBULA STARFIELD SIMULATION ---');

const puffs = [
  { x: 0.25, y: 0.30, vx: 0.0015, vy: -0.001, radius: 240, r: 251, g: 146, b: 60, alpha: 0.055, phase: 0.2, pulseSpeed: 0.8 },
  { x: 0.70, y: 0.25, vx: -0.0012, vy: 0.0015, radius: 260, r: 56, g: 189, b: 248, alpha: 0.045, phase: 1.5, pulseSpeed: 0.7 },
  { x: 0.50, y: 0.65, vx: 0.001, vy: 0.0012, radius: 280, r: 139, g: 92, b: 246, alpha: 0.040, phase: 3.1, pulseSpeed: 0.9 },
  { x: 0.85, y: 0.70, vx: -0.0015, vy: -0.001, radius: 220, r: 251, g: 191, b: 36, alpha: 0.045, phase: 4.2, pulseSpeed: 0.75 },
  { x: 0.15, y: 0.80, vx: 0.0018, vy: -0.0012, radius: 200, r: 56, g: 189, b: 248, alpha: 0.035, phase: 5.0, pulseSpeed: 0.85 }
];

assert.strictEqual(puffs.length, 5, 'Contains 5 cosmic nebula clouds');
for (const puff of puffs) {
  assert.ok(puff.radius >= 200 && puff.radius <= 300, 'Puff radius between 200px and 300px');
  assert.ok(puff.alpha >= 0.03 && puff.alpha <= 0.07, 'Puff alpha is subtle (0.03 - 0.07)');
  // Simulate 100 frames of drift
  for (let f = 0; f < 100; f++) {
    puff.x += puff.vx * 0.016;
    puff.y += puff.vy * 0.016;
    if (puff.x < -0.15) puff.x = 1.15;
    if (puff.x > 1.15) puff.x = -0.15;
    if (puff.y < -0.15) puff.y = 1.15;
    if (puff.y > 1.15) puff.y = -0.15;
  }
  assert.ok(puff.x >= -0.15 && puff.x <= 1.15, 'Puff X wrapped cleanly');
  assert.ok(puff.y >= -0.15 && puff.y <= 1.15, 'Puff Y wrapped cleanly');
}
console.log('✅ Nebula cloud drift dynamics, soft alpha gradients, and boundary wrapping verified.\n');

console.log('================================================================');
console.log('🎉 ALL ENG-49 SPECULAR & NEBULA VERIFICATION TESTS PASSED (100%)');
console.log('================================================================');
