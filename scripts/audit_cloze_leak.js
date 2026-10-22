const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'web', 'content', 'reading');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

console.log('Auditing reading sentence mining items for giveaways and missing targets...\n');

let issues = 0;

for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const lines = content.split('\n');
  let currentTarget = '';
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    const tm = l.match(/\*\*Target\*\*:\s*`?([a-zA-Z\s'-]+)`?/i);
    if (tm) currentTarget = tm[1].trim();
    const cm = l.match(/\*\*Context\*\*:\s*(.*)/i);
    if (cm && currentTarget) {
      const ctx = cm[1].trim();
      const escaped = currentTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp('\\b' + escaped + '\\b', 'gi');
      const matches = ctx.match(re) || [];
      if (matches.length > 1) {
        console.log(`[GIVEAWAY] ${f}: Target "${currentTarget}" appears ${matches.length} times in Context: "${ctx}"`);
        issues++;
      } else if (matches.length === 0) {
        console.log(`[MISSING] ${f}: Target "${currentTarget}" NOT found in Context: "${ctx}"`);
        issues++;
      }
      currentTarget = '';
    }
  }
}

console.log(`\nAudit complete: ${issues} issues found in reading sentence mining.`);
