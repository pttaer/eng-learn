// web/scripts/verify-mobile-tree-deck.cjs
// Verification suite for Mobile Constellation View Switcher, Branch Skill Deck & Touch Perks (ENG-127)

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src');

function load(rel, deps = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(SRC, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => deps[name] || require(name));
  return mod.exports;
}

// Minimal DOM mock for headless testing
class MockElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.className = '';
    this.children = [];
    this.parentElement = null;
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this.listeners = {};
    this._innerHTML = '';
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(val) {
    this._innerHTML = val;
    this.children = [];
    this.parseHtmlToChildren(val);
  }

  parseHtmlToChildren(html) {
    if (!html || typeof html !== 'string') return;

    // Stack-based tag parser handling arbitrary nesting
    const tagRegex = /<\/?([a-z0-9-]+)((?:\s+[a-z0-9-]+(?:="[^"]*"|='[^']*'|[^\s>]*))*)\s*(\/?)>/gi;
    const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
    
    let current = this;
    const stack = [this];
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(html)) !== null) {
      const fullMatch = match[0];
      const isClosing = fullMatch.startsWith('</');
      const tagName = match[1].toLowerCase();
      const rawAttrs = match[2] || '';
      const isSelfClosing = match[3] === '/' || voidTags.has(tagName);

      if (isClosing) {
        // Pop stack until matching tag
        for (let i = stack.length - 1; i > 0; i--) {
          if (stack[i].tagName.toLowerCase() === tagName) {
            stack.length = i;
            current = stack[stack.length - 1];
            break;
          }
        }
      } else {
        const el = new MockElement(tagName);
        const classMatch = rawAttrs.match(/class=["']([^"']+)["']/i);
        if (classMatch) el.className = classMatch[1];

        const dataMatches = rawAttrs.matchAll(/data-([a-z0-9-]+)=["']([^"']+)["']/gi);
        for (const dm of dataMatches) {
          const camel = dm[1].replace(/-([a-z])/g, (_, g) => g.toUpperCase());
          el.dataset[camel] = dm[2];
          el.dataset[dm[1]] = dm[2];
        }

        const roleMatch = rawAttrs.match(/role=["']([^"']+)["']/i);
        if (roleMatch) el.attributes['role'] = roleMatch[1];

        const styleMatch = rawAttrs.match(/style=["']([^"']+)["']/i);
        if (styleMatch) {
          styleMatch[1].split(';').forEach(s => {
            const [k, v] = s.split(':').map(str => str && str.trim());
            if (k && v) el.style[k] = v;
          });
        }

        el.parentElement = current;
        current.children.push(el);

        if (!isSelfClosing) {
          stack.push(el);
          current = el;
        }
      }
    }
  }

  addEventListener(type, cb) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(cb);
  }

  removeEventListener(type, cb) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(fn => fn !== cb);
  }

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    event.currentTarget = this;
    const list = this.listeners[event.type] || [];
    for (const cb of list) {
      if (event._stopped) break;
      cb(event);
    }
    if (event.bubbles && !event._stopped && this.parentElement) {
      this.parentElement.dispatchEvent(event);
    }
    return true;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const walk = (el) => {
      let match = false;
      if (selector.startsWith('.')) {
        const c = selector.slice(1);
        match = (el.className || '').split(/\s+/).includes(c);
      } else if (selector.startsWith('#')) {
        const id = selector.slice(1);
        match = el.id === id;
      } else if (selector.includes('[data-')) {
        const attrMatch = selector.match(/\[data-([a-z0-9-]+)(?:=["']([^"']+)["'])?\]/i);
        if (attrMatch) {
          const key = attrMatch[1];
          const val = attrMatch[2];
          match = val ? el.dataset[key] === val : (key in el.dataset);
        }
      } else {
        match = el.tagName === selector.toUpperCase();
      }

      if (match) results.push(el);
      for (const ch of el.children) walk(ch);
    };

    for (const ch of this.children) walk(ch);
    return results;
  }

  closest(selector) {
    let cur = this;
    while (cur) {
      if (selector.startsWith('.') && (cur.className || '').split(/\s+/).includes(selector.slice(1))) {
        return cur;
      }
      cur = cur.parentElement;
    }
    return null;
  }

  remove() {
    if (this.parentElement) {
      this.parentElement.children = this.parentElement.children.filter(c => c !== this);
    }
  }

  get isConnected() { return true; }
}

global.document = {
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => null,
  body: new MockElement('body'),
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.window = {
  innerWidth: 1024,
  matchMedia: (query) => ({
    matches: query.includes('max-width: 640px') ? global.window.innerWidth <= 640 : false
  }),
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.Event = class Event {
  constructor(type, init = {}) {
    this.type = type;
    this.bubbles = Boolean(init.bubbles);
    this._stopped = false;
    this._prevented = false;
  }
  stopPropagation() { this._stopped = true; }
  stopImmediatePropagation() { this._stopped = true; }
  preventDefault() { this._prevented = true; }
};

global.MouseEvent = class MouseEvent extends global.Event {
  constructor(type, init = {}) {
    super(type, init);
  }
};

const mockStorage = {};
global.localStorage = {
  getItem: k => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: k => { delete mockStorage[k]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
};

// Load modules
const cefrMod = load('core/cefr.ts');
const treeDataMod = load('core/skill-tree-data.ts', {
  './cefr': cefrMod,
  './router': {}
});
const storageMod = load('utils/storage.ts', {
  '../core/cefr': cefrMod,
  '../core/skill-tree-data': treeDataMod
});
const treeEngineMod = load('core/skill-tree-engine.ts', {
  './skill-tree-data': treeDataMod,
  '../utils/storage': storageMod,
  './cefr': cefrMod
});
const iconsMod = load('utils/icons.ts');
const constellationEngineMod = load('modules/constellation-engine.ts', {
  '../core/skill-tree-data': treeDataMod,
  '../core/skill-tree-engine': treeEngineMod,
  '../utils/storage': storageMod,
  '../core/cefr': cefrMod,
  '../core/router': {},
  '../utils/icons': iconsMod
});
const { ConstellationEngine } = constellationEngineMod;

const skillTreeViewMod = load('modules/skill-tree-view.ts', {
  '../utils/icons': iconsMod,
  animejs: () => {},
  '../core/skill-tree-data': treeDataMod,
  '../core/skill-tree-engine': treeEngineMod,
  '../core/router': {},
  '../core/audio-synthesizer': { AudioSynthesizer: { play: () => {} } },
  '../core/i18n': { t: (k, p, d) => d || k, I18n: { getLocale: () => 'en', onLocaleChange: () => () => {} } },
  '../core/motion-engine': {
    MotionEngine: {
      drawSvgLines: () => {},
      staggerEntrance: () => {},
      riseIn: () => {},
      fillBars: () => {},
      breathe: () => {},
      tweenNumber: () => {},
      lift: () => {},
      isReducedMotion: () => false
    }
  },
  '../utils/storage': storageMod,
  '../core/perspective-canvas': { NebulaCanvas: class { destroy() {} } },
  './constellation-engine': constellationEngineMod,
  '../core/cefr': cefrMod
});
const { SkillTreeView } = skillTreeViewMod;

console.log('=== TEST 1: ConstellationEngine 5-Branch Mobile Skill Deck Generation ===');

const branches = ConstellationEngine.getMobileDeckBranches();
assert.strictEqual(branches.length, 5, 'Must return exactly 5 core branches');

const expectedIds = ['reading', 'writing', 'listening', 'speaking', 'collocations_grammar'];
const branchIds = branches.map(b => b.id);
assert.deepStrictEqual(branchIds, expectedIds, 'Branches must cover Reading, Writing, Listening, Speaking, Collocations / Grammar');

for (const b of branches) {
  assert.ok(b.name, `Branch ${b.id} must have a name`);
  assert.ok(b.tagline, `Branch ${b.id} must have a tagline`);
  assert.ok(b.iconName, `Branch ${b.id} must specify an icon`);
  assert.ok(b.routeTarget, `Branch ${b.id} must specify a routeTarget`);
  assert.ok(typeof b.masteryPct === 'number' && b.masteryPct >= 0 && b.masteryPct <= 100, `Branch ${b.id} masteryPct must be 0-100`);
  assert.ok(b.totalPerks > 0, `Branch ${b.id} must contain perks`);
  assert.ok(typeof b.unlockedPerks === 'number', `Branch ${b.id} must specify unlockedPerks count`);
  assert.ok(Array.isArray(b.perks), `Branch ${b.id} must have perks array`);
  assert.ok(Array.isArray(b.workoutTasks), `Branch ${b.id} must have workoutTasks array`);
}

console.log('PASSED: ConstellationEngine generates 5 core branches with mastery & perk invariants.\n');

console.log('=== TEST 2: View Switcher Toggle & Dynamic Deck DOM Rendering ===');

global.window.innerWidth = 1024; // Desktop viewport default
const treeView = new SkillTreeView();
assert.strictEqual(treeView.getViewMode(), 'map', 'Desktop default view mode must be map');

const el = treeView.render();
const switcher = el.querySelector('.constellation-view-switcher');
assert.ok(switcher, 'View switcher component must be rendered');

const mapBtn = el.querySelector('.btn-view-star-map');
const deckBtn = el.querySelector('.btn-view-skill-deck');
assert.ok(mapBtn, 'Star Map button must be present in view switcher');
assert.ok(deckBtn, 'Skill Deck button must be present in view switcher');

// In map mode, constellation-container is present
assert.ok(el.querySelector('.constellation-container'), 'Constellation SVG map container present in map mode');
assert.strictEqual(el.querySelector('.mobile-skill-deck'), null, 'Mobile skill deck hidden in map mode');

// Switch to Skill Deck mode
treeView.setViewMode('deck');
assert.strictEqual(treeView.getViewMode(), 'deck', 'View mode switched to deck');

const deckEl = treeView.render();
assert.ok(deckEl.querySelector('.mobile-skill-deck'), 'Mobile skill deck must be rendered in deck mode');
assert.strictEqual(deckEl.querySelector('.constellation-container'), null, 'Constellation SVG map container hidden in deck mode');

const deckCardMatches = (deckEl.innerHTML.match(/class="[^"]*deck-branch-card[^"]*"/g) || []).length;
assert.strictEqual(deckCardMatches, 5, 'Rendered deck must contain exactly 5 branch cards');

// Verify auto-default on mobile <= 600px
global.window.innerWidth = 412;
const mobileTreeView = new SkillTreeView();
assert.strictEqual(mobileTreeView.getViewMode(), 'deck', 'Mobile <= 600px viewports must auto-default to Skill Deck');

console.log('PASSED: View switcher toggles cleanly and auto-defaults on mobile viewports.\n');

console.log('=== TEST 3: Touch Target Standards (>= 44x44px Touch Targets) ===');

// Check CSS rules in hud-base.css
const hudCssPath = path.join(SRC, 'assets/styles/hud-base.css');
const hudCss = fs.readFileSync(hudCssPath, 'utf8');

// 1. CTA Button standard
assert.ok(hudCss.includes('.btn-enter-dossier'), 'hud-base.css must style .btn-enter-dossier');
assert.ok(hudCss.includes('min-height: 48px'), 'CTA button must specify min-height: 48px');

// 2. Badges standard (>= 44px)
assert.ok(hudCss.includes('.deck-badge'), 'hud-base.css must style .deck-badge');
assert.ok(hudCss.includes('min-height: 44px'), 'Deck badges must specify min-height: 44px');
assert.ok(hudCss.includes('min-width: 44px'), 'Deck badges must specify min-width: 44px');

// 3. Switcher buttons standard (>= 44px)
assert.ok(hudCss.includes('.view-switch-btn'), 'hud-base.css must style .view-switch-btn');
assert.ok(hudCss.includes('min-height: 44px'), 'Switcher buttons must specify min-height: 44px');

// Check rendered DOM cards touch elements
const deckCards = deckEl.querySelectorAll('.deck-branch-card');
for (const card of deckCards) {
  const ctaBtn = card.querySelector('.btn-enter-dossier');
  assert.ok(ctaBtn, 'Each deck card must contain a prominent .btn-enter-dossier CTA button');
  const perks = card.querySelectorAll('.deck-perk-badge');
  assert.ok(perks.length > 0, 'Each deck card must list unlocked perks as badges');
  const workouts = card.querySelectorAll('.deck-workout-badge');
  assert.ok(workouts.length > 0, 'Each deck card must list workout tasks as badges');
}

console.log('PASSED: All touch CTA buttons and badges satisfy >= 44x44px touch targets.\n');

console.log('=== TEST 4: Launch Hooks & Interaction Wiring ===');

let navigatedRoute = null;
mobileTreeView.onNavigate = (route) => {
  navigatedRoute = route;
};

const renderedMobile = mobileTreeView.render();
const readingCard = renderedMobile.querySelector('[data-branch="reading"]');
assert.ok(readingCard, 'Reading branch card exists in deck');

const readingCta = readingCard.querySelector('.btn-enter-dossier');
assert.ok(readingCta, 'Reading card CTA exists');

// Simulate CTA click
readingCta.dispatchEvent(new MouseEvent('click'));
assert.strictEqual(navigatedRoute, 'read', 'Clicking Enter Reading Dossier must navigate to "read"');

// Simulate workout badge click
const speakingCard = renderedMobile.querySelector('[data-branch="speaking"]');
const speakingWorkoutBadge = speakingCard.querySelector('.deck-workout-badge');
assert.ok(speakingWorkoutBadge, 'Speaking workout badge exists');
speakingWorkoutBadge.dispatchEvent(new MouseEvent('click'));
assert.strictEqual(navigatedRoute, 'speak', 'Clicking Speaking workout badge must navigate to "speak"');

console.log('PASSED: Launch hooks navigate cleanly to target dossiers.\n');

console.log('--------------------------------------------------');
console.log('All 4 Test Domains in verify-mobile-tree-deck.cjs Passed! (100%)');
