// web/scripts/verify-diagnostic-view.cjs
// Verification suite for Interactive Diagnostic View & Error Taxonomy Dashboard (ENG-115)

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

console.log('--- Verifying Interactive Diagnostic View & Error Taxonomy Dashboard [ENG-115] ---');

// Test 1: Verify main.ts registration of #diagnostic
const mainTsPath = path.join(__dirname, '..', 'src', 'ielts', 'main.ts');
const mainTs = fs.readFileSync(mainTsPath, 'utf8');
assert(mainTs.includes("id: 'diagnostic'"), "main.ts must register id: 'diagnostic'");
assert(mainTs.includes("label: 'Diagnostic'"), "main.ts must register label: 'Diagnostic'");
assert(mainTs.includes('diagnosticView'), 'main.ts must import and use diagnosticView');
console.log("[PASS] main.ts registers #diagnostic navigation route.");

// Test 2: Verify ielts.css styling classes
const cssPath = path.join(__dirname, '..', 'src', 'ielts', 'ielts.css');
const css = fs.readFileSync(cssPath, 'utf8');
const requiredClasses = [
  '.ie-diagnostic-view',
  '.ie-diag-card',
  '.ie-diag-opt',
  '.ie-diag-explanation',
  '.ie-impact-alert',
  '.ie-results-hero',
  '.ie-taxonomy-grid',
  '.ie-taxonomy-card',
  '.ie-checklist-items',
  '.ie-roadmap-grid'
];

requiredClasses.forEach(cls => {
  assert(css.includes(cls), `ielts.css must contain class ${cls}`);
});
console.log('[PASS] ielts.css contains all required diagnostic layout & card styles.');

// Test 3: Load and Transpile diagnostic.ts and verify logic
const SRC = path.join(__dirname, '..', 'src');
const courseJson = JSON.parse(fs.readFileSync(path.join(SRC, 'assets', 'data', 'ielts-course.json'), 'utf8'));

// Mock Storage and DOM for Headless Testing
const storageMock = {};
global.localStorage = {
  getItem: k => (k in storageMock ? storageMock[k] : null),
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: k => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};

// Transpile diagnostic-engine
const diagEngineTs = fs.readFileSync(path.join(SRC, 'ielts', 'diagnostic-engine.ts'), 'utf8');
const diagEngineCode = ts.transpileModule(diagEngineTs, {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText;
const diagEngineMod = { exports: {} };
new Function('module', 'exports', 'require', diagEngineCode)(diagEngineMod, diagEngineMod.exports, require);

// Transpile diagnostic view
const diagViewTs = fs.readFileSync(path.join(SRC, 'ielts', 'views', 'diagnostic.ts'), 'utf8');
const diagViewCode = ts.transpileModule(diagViewTs, {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText;

// Minimal DOM Mock
class MockElement {
  constructor(tag = 'div', className = '') {
    this.tagName = tag.toUpperCase();
    this.className = className;
    this._innerHTML = '';
    this.children = [];
    this.parentElement = null;
    this.attributes = {};
    this.eventListeners = {};
    this.style = {};
    this.id = '';
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(val) {
    this._innerHTML = val;
    // Simple child parser for buttons and cards
    this.children = [];
  }

  append(...items) {
    items.forEach(it => {
      if (it instanceof MockElement) {
        it.parentElement = this;
        this.children.push(it);
      }
    });
  }

  remove() {
    if (this.parentElement) {
      const idx = this.parentElement.children.indexOf(this);
      if (idx >= 0) this.parentElement.children.splice(idx, 1);
    }
  }

  addEventListener(ev, cb) {
    if (!this.eventListeners[ev]) this.eventListeners[ev] = [];
    this.eventListeners[ev].push(cb);
  }

  dispatchEvent(ev, data = {}) {
    if (this.eventListeners[ev]) {
      this.eventListeners[ev].forEach(cb => cb({ currentTarget: this, ...data }));
    }
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const search = (node) => {
      // Very basic tag, class, or id matcher
      if (selector.startsWith('.') && node.className.includes(selector.slice(1))) results.push(node);
      else if (selector.startsWith('#') && node.id === selector.slice(1)) results.push(node);
      node.children.forEach(search);
    };
    search(this);
    return results;
  }
}

global.document = {
  createElement: (tag) => new MockElement(tag)
};
global.window = {
  scrollTo: () => {}
};

const diagViewMod = { exports: {} };
new Function('module', 'exports', 'require', diagViewCode)(diagViewMod, diagViewMod.exports, (dep) => {
  if (dep.includes('ielts-course.json')) return { default: courseJson, diagnostics: courseJson.diagnostics };
  if (dep.includes('diagnostic-engine')) return diagEngineMod.exports;
  if (dep.includes('ui')) {
    return {
      h: (tag, cls = '', html = '') => {
        const el = new MockElement(tag, cls);
        el.innerHTML = html;
        return el;
      },
      esc: s => String(s).replace(/[&<>"]/g, '')
    };
  }
  if (dep.includes('icons')) return { icon: () => '<svg></svg>' };
  if (dep.includes('core/feedback')) return { feedback: { emit: () => {} } };
  return require(dep);
});

assert(typeof diagViewMod.exports.diagnosticView === 'function', 'diagnosticView must be a function');
console.log('[PASS] diagnosticView successfully transpiled and exports clean function.');

// Test 4: Run diagnosticView mount and cleanup cycle
const root = new MockElement('div');
const cleanup = diagViewMod.exports.diagnosticView(root);
assert.strictEqual(typeof cleanup, 'function', 'diagnosticView must return a cleanup function');
assert(root.children.length > 0, 'root must have child elements mounted');
cleanup();
console.log('[PASS] diagnosticView mount and unmount cycle executes cleanly.');

console.log('--- ALL ENG-115 DIAGNOSTIC VIEW CHECKS PASSED ---');
