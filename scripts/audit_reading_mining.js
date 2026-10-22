const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'web', 'src', 'assets', 'data', 'reading.json'), 'utf8'));
const articles = data.articles || [];

console.log(`Auditing sentence mining across ${articles.length} reading articles in reading.json...\n`);

let multiHits = 0;
let zeroHits = 0;

articles.forEach(art => {
  const mined = art.fourPassProtocol?.pass3SentenceMining || [];
  mined.forEach(m => {
    const target = (m.targetWord || '').trim();
    const ctx = (m.contextSentence || '').trim();
    if (!target || !ctx) return;

    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('\\b' + escaped + '\\b', 'gi');
    const matches = ctx.match(re) || [];

    if (matches.length > 1) {
      console.log(`[MULTIPLE OCCURRENCES / GIVEAWAY] ${art.id} (${art.cefrLevel}) "${art.title}"`);
      console.log(`  Target: "${target}" (${matches.length} times)`);
      console.log(`  Context: "${ctx}"\n`);
      multiHits++;
    } else if (matches.length === 0) {
      console.log(`[ZERO OCCURRENCES / MISSING] ${art.id} (${art.cefrLevel}) "${art.title}"`);
      console.log(`  Target: "${target}"`);
      console.log(`  Context: "${ctx}"\n`);
      zeroHits++;
    }
  });
});

console.log(`Audit Summary:`);
console.log(`- Multiple occurrences (giveaway leaks in cloze): ${multiHits}`);
console.log(`- Zero occurrences (target missing from context): ${zeroHits}`);
