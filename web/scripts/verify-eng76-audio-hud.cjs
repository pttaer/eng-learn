/**
 * Automated Verification Script for ENG-76:
 * Header HUD Music Controller & Settings Dual-Volume Sliders.
 * Asserts:
 * 1. ambientMusicEngine exports and methods (cycleMode, setMusicVolume, getMusicVolume, AMBIENT_MODE_LABELS).
 * 2. HeaderHUD actions markup includes .btn-ambient-music.
 * 3. Settings modal markup includes #sfx-volume-slider, #music-volume-slider, #music-mode-select.
 * 4. CSS rules for .btn-ambient-music and .settings-audio-section are defined.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('[VERIFY-ENG76] Starting verification...');

// 1. Check ambient-music-engine.ts
const ambientEnginePath = path.join(__dirname, '../src/core/ambient-music-engine.ts');
assert(fs.existsSync(ambientEnginePath), 'ambient-music-engine.ts must exist');
const ambientEngineSource = fs.readFileSync(ambientEnginePath, 'utf8');

assert(ambientEngineSource.includes('export type AmbientMusicMode'), 'Must export AmbientMusicMode');
assert(ambientEngineSource.includes('export const AMBIENT_MODES'), 'Must export AMBIENT_MODES');
assert(ambientEngineSource.includes('export const AMBIENT_MODE_LABELS'), 'Must export AMBIENT_MODE_LABELS');
assert(ambientEngineSource.includes('setMusicVolume'), 'Must have setMusicVolume method');
assert(ambientEngineSource.includes('getMusicVolume'), 'Must have getMusicVolume method');
assert(ambientEngineSource.includes('cycleMode'), 'Must have cycleMode method');
assert(ambientEngineSource.includes('export const ambientMusicEngine'), 'Must export ambientMusicEngine singleton');

console.log('✓ ambient-music-engine.ts API verified.');

// 2. Check header-hud.ts
const headerHudPath = path.join(__dirname, '../src/modules/header-hud.ts');
assert(fs.existsSync(headerHudPath), 'header-hud.ts must exist');
const headerHudSource = fs.readFileSync(headerHudPath, 'utf8');

assert(headerHudSource.includes('btn-ambient-music'), 'HeaderHUD must render .btn-ambient-music button');
assert(headerHudSource.includes('sfx-volume-slider'), 'Settings modal must contain #sfx-volume-slider');
assert(headerHudSource.includes('music-volume-slider'), 'Settings modal must contain #music-volume-slider');
assert(headerHudSource.includes('music-mode-select'), 'Settings modal must contain #music-mode-select');
assert(headerHudSource.includes('ambientMusicEngine.cycleMode'), 'HeaderHUD must wire cycleMode on click');
assert(headerHudSource.includes('AudioSynthesizer.setMasterVolume'), 'Settings modal must wire SFX volume slider');
assert(headerHudSource.includes('ambientMusicEngine.setMusicVolume'), 'Settings modal must wire Music volume slider');

console.log('✓ header-hud.ts integration verified.');

// 3. Check hud-base.css
const hudCssPath = path.join(__dirname, '../src/assets/styles/hud-base.css');
assert(fs.existsSync(hudCssPath), 'hud-base.css must exist');
const hudCssSource = fs.readFileSync(hudCssPath, 'utf8');

assert(hudCssSource.includes('.btn-ambient-music'), 'hud-base.css must style .btn-ambient-music');
assert(hudCssSource.includes('.settings-audio-section'), 'hud-base.css must style .settings-audio-section');

console.log('✓ hud-base.css styles verified.');

console.log('✅ [VERIFY-ENG76] ALL CHECKS PASSED.');
