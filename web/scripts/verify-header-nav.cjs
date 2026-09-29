const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 2] Verifying Human-Centered Header HUD & Navigation...');

const routerTs = fs.readFileSync(path.join(__dirname, '../src/core/router.ts'), 'utf-8');
const headerTs = fs.readFileSync(path.join(__dirname, '../src/modules/header-hud.ts'), 'utf-8');

// 1. Assert router supports 'tree' route and defaults to 'tree'
assert(routerTs.includes("'tree'"), "router.ts must include 'tree' in RouteId");
assert(routerTs.includes("matched = validRoutes.find(r => r === rawHash) || 'tree'") || routerTs.includes("|| 'tree'"), "router.ts must default to 'tree'");

// 2. Assert header has back button logic
assert(headerTs.includes('btn-back-tree') || headerTs.includes('backToTree'), "header-hud.ts must render back-to-tree button");
assert(headerTs.includes('ENGLISH MASTERY'), "header-hud.ts must feature 'ENGLISH MASTERY' brand title");
assert(!headerTs.includes('STARK // ENG SINGULARITY'), "header-hud.ts must not have sci-fi Stark branding");

// 3. Assert digital clock has been excised
assert(!headerTs.includes('telemetry-clock'), "header-hud.ts must not display digital telemetry clock");

console.log('✅ [TEST 2 PASSED] Header HUD & navigation verified.');
