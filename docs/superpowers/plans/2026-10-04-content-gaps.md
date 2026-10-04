# Content Gaps & Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the content and hygiene items left open in `docs/audits/STATUS.md`.

**Architecture:** Edit markdown sources only; `node scripts/compile-content.cjs` regenerates JSON. Each content task adds a failing assertion to `web/scripts/verify-content-pipeline.cjs` first.

**Tech Stack:** Node scripts, markdown, CSS tokens, git, electron-builder.

**Spec:** `docs/superpowers/specs/2026-10-04-content-gaps-design.md`

## Global Constraints
- Run commands from `D:\eng-learn\web` unless stated.
- Never hand-edit `src/assets/data/*.json`; compile from `content/`.
- `npm test` must pass (24/24) before every commit.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
- Do not push.

## Review Focus
- A replacement phrase that already exists elsewhere (case-insensitive) → the uniqueness assert catches it.
- Habit markdown edited with CRLF/LF mismatch → compile normalizes; re-run `npm test`.
- A JSON syntax error in the listening block breaks all of `listening.json` → compile + test must parse it.
- `git rm --cached` must not delete `.claude/skills` from disk.

---

### Task 1: Unique collocations

**Files:** Modify `web/content/collocations/0{1..4}-*.md`, `web/scripts/verify-content-pipeline.cjs`

- [ ] **Step 1: Failing test** — after line 18 of `verify-content-pipeline.cjs` add:
```js
const phrases = collocations.map(c => c.phrase.toLowerCase());
const dupes = phrases.filter((p, i) => phrases.indexOf(p) !== i);
assert.strictEqual(dupes.length, 0, `Duplicate collocations: ${dupes.join(', ')}`);
```
- [ ] **Step 2:** `node scripts/compile-content.cjs && node scripts/verify-content-pipeline.cjs` → FAIL "Duplicate collocations" (9).
- [ ] **Step 3: Replace later occurrences** (index and category kept):
```js
const fs=require('fs'),p=require('path');const dir='content/collocations';
const map={'go on strike':['stage a walkout','tổ chức cuộc bãi công'],'miss a deadline':['blow a deadline','lỡ hạn chót'],'circumstantial evidence':['hearsay evidence','bằng chứng nghe đồn'],'key performance indicator':['leading indicator','chỉ số dẫn dắt'],'patent infringement':['trademark dilution','làm suy giảm nhãn hiệu'],'glass ceiling':['sticky floor','"sàn dính" (rào cản ở bậc thấp)'],'carbon footprint':['water footprint','lượng nước tiêu thụ gián tiếp'],'renewable energy':['geothermal energy','năng lượng địa nhiệt'],'ecological balance':['trophic cascade','phản ứng dây chuyền trong hệ sinh thái']};
const seen={};
for(const f of fs.readdirSync(dir).sort()){
  const out=fs.readFileSync(p.join(dir,f),'utf8').split(/\r?\n/).map(l=>{
    const m=l.match(/^\| (\d+) \| (.+?) \| (.+?) \| (.+?) \|$/); if(!m) return l;
    const k=m[2].toLowerCase();
    if(seen[k]&&map[k]){const [e,v]=map[k]; return `| ${m[1]} | ${e} | ${v} | ${m[4]} |`}
    seen[k]=1; return l;});
  fs.writeFileSync(p.join(dir,f),out.join('\n'));}
```
- [ ] **Step 4:** `node scripts/compile-content.cjs && npm test` → PASS 24/24.
- [ ] **Step 5:** `git add -A web/content web/scripts web/src/assets/data && git commit -m "fix(content): replace 9 duplicate collocations"`

### Task 2: Habit days ≥3 tasks

**Files:** Modify `web/content/habits/daily-plan.md`, `web/scripts/verify-content-pipeline.cjs`

- [ ] **Step 1: Failing test** — append to `verify-content-pipeline.cjs`:
```js
const habits = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'habits.json'), 'utf8'));
habits.days.forEach(d => assert(d.tasks.length >= 3, `Day ${d.day} has ${d.tasks.length} tasks`));
```
- [ ] **Step 2:** run verify → FAIL "Day 6 has 2 tasks".
- [ ] **Step 3: Append a third task** to days 6,10,17,20,23,24,25,27,28,29,30:
```js
const fs=require('fs');const L=fs.readFileSync('content/habits/daily-plan.md','utf8').split(/\r?\n/);
const days=new Set([6,10,17,20,23,24,25,27,28,29,30]);const out=[];let cur=null;
for(let i=0;i<L.length;i++){
  const m=L[i].match(/^- \[ \] \*\*Day (\d+):/); if(m) cur=+m[1];
  out.push(L[i]);
  if(cur&&days.has(cur)&&/^  - \[ \]/.test(L[i])&&!/^  - \[ \]/.test(L[i+1]||'')){
    out.push('  - [ ] **10m:** Ôn nhanh các thẻ SRS đến hạn trong ứng dụng và ghi lại 1 điều học được hôm nay.'); cur=null;}}
fs.writeFileSync('content/habits/daily-plan.md',out.join('\n'));
```
- [ ] **Step 4:** `node scripts/compile-content.cjs && npm test` → PASS.
- [ ] **Step 5:** commit `feat(content): third task for 11 habit days`.

### Task 3: Listening 3 → 9 passages

**Files:** Modify `web/content/listening/phonetics-passages.md` (`samplePassages` in the JSON block), `web/scripts/verify-content-pipeline.cjs:51`

- [ ] **Step 1:** change line 51 to `>= 9` (and the message to "at least 9"). Run verify → FAIL.
- [ ] **Step 2:** add a comma after listen-3's `}` and append to `samplePassages`:
```json
{"id":"listen-4","title":"Compound Interest as Behavior","audioText":"What looks like patience is usually just a system that keeps working while you are not looking at it.","ipa":"/wɒt lʊks laɪk ˈpeɪʃəns ɪz ˈjuːʒuəli dʒʌst ə ˈsɪstəm ðət kiːps ˈwɜːkɪŋ waɪl juː ɑː nɒt ˈlʊkɪŋ æt ɪt/","traps":"Weak /ðət/ for \"that\"; linking in \"looking at it\" [lʊ-kɪ-ŋæ-tɪt]."},
{"id":"listen-5","title":"Why Meetings Multiply","audioText":"Every unresolved question quietly schedules another meeting, and nobody notices until the calendar is full.","ipa":"/ˈevri ˌʌnrɪˈzɒlvd ˈkwestʃən ˈkwaɪətli ˈʃedjuːlz əˈnʌðə ˈmiːtɪŋ ənd ˈnəʊbədi ˈnəʊtɪsɪz ʌnˈtɪl ðə ˈkælɪndə ɪz fʊl/","traps":"Elision of /d/ in \"unresolved question\"; schwa in \"another\"."},
{"id":"listen-6","title":"The Cost of Context Switching","audioText":"Each interruption costs far more than the seconds it takes, because the mind has to rebuild the whole picture.","ipa":"/iːtʃ ˌɪntəˈrʌpʃən kɒsts fɑː mɔː ðən ðə ˈsekəndz ɪt teɪks bɪˈkɒz ðə maɪnd hæz tə riːˈbɪld ðə həʊl ˈpɪktʃə/","traps":"Weak \"to\" /tə/ in \"has to rebuild\"; \"costs far\" drops the /t/ [kɒs fɑː]."},
{"id":"listen-7","title":"Trust and Transparency","audioText":"People forgive a mistake they can see, but they rarely forgive one that was hidden from them.","ipa":"/ˈpiːpl fəˈgɪv ə mɪˈsteɪk ðeɪ kæn siː bʌt ðeɪ ˈreəli fəˈgɪv wʌn ðət wəz ˈhɪdn frɒm ðem/","traps":"Elision of /k/ in \"mistake they\"; weak forms /wəz/, /frɒm/."},
{"id":"listen-8","title":"Learning by Teaching","audioText":"If you cannot explain an idea in plain words, you probably do not understand it as well as you think.","ipa":"/ɪf juː ˈkænɒt ɪkˈspleɪn ən aɪˈdɪə ɪn pleɪn wɜːdz juː ˈprɒbəbli duː nɒt ˌʌndəˈstænd ɪt əz wel əz juː θɪŋk/","traps":"Catenation in \"explain an idea\" [ɪk-spleɪ-nə-naɪ-dɪə]; \"do not\" often reduces to \"don't\"."},
{"id":"listen-9","title":"The Slow Skill of Listening","audioText":"Good listeners wait for the speaker to finish before they decide what they think about what was said.","ipa":"/gʊd ˈlɪsnəz weɪt fə ðə ˈspiːkə tə ˈfɪnɪʃ bɪˈfɔː ðeɪ dɪˈsaɪd wɒt ðeɪ θɪŋk əˈbaʊt wɒt wəz sed/","traps":"Weak /fə/ and /tə/; elision of /t/ in \"wait for\" and \"what they\"."}
```
- [ ] **Step 3:** `node scripts/compile-content.cjs && npm test` → PASS (compile parses the JSON block, so syntax errors fail here).
- [ ] **Step 4:** commit `feat(content): 6 more listening passages`.

### Task 4: Light-mode muted ink

**Files:** Modify `web/src/assets/styles/variables.css:109`

- [ ] **Step 1:** change `--ink-muted: #64748b;` → `--ink-muted: #475569;` (light theme block only; the dark value at line 19 stays).
- [ ] **Step 2:** `npm test` → PASS. **Step 3:** commit `fix(a11y): light-mode muted ink reaches AAA`.

### Task 5: Untrack vendored skills

**Files:** Modify `.gitignore` (repo root)

- [ ] **Step 1:** append `.claude/skills/` to `.gitignore`.
- [ ] **Step 2:** from `D:\eng-learn`: `git rm -r --cached .claude/skills`; confirm `ls .claude/skills` still lists files on disk.
- [ ] **Step 3:** commit `chore: stop tracking vendored .claude/skills`.

### Task 6: Rebuild installer

- [ ] **Step 1:** `npm run dist:win` (several minutes). **Step 2:** `npm run test:installer` → PASS. Output lives in gitignored `web/release/`; no commit.
