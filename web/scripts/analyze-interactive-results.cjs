// web/scripts/analyze-interactive-results.cjs
const fs = require('fs');
const reports = JSON.parse(fs.readFileSync('e:/Eng/screenshots/interactive_layout_inspection_360.json', 'utf8'));

console.log('Total interactive states tested:', reports.length);

const pageOverflowStates = reports.filter(r => r.pageOverflow);
console.log('States with pageOverflow (docW > 360):', pageOverflowStates.length);
if (pageOverflowStates.length > 0) {
  pageOverflowStates.forEach(s => console.log(`  - ${s.state}: docW=${s.docW}px, bodyW=${s.bodyW}px`));
}

const bleedMap = new Map();
const innerMap = new Map();
const crushedMap = new Map();
const telemetryMap = new Map();

for (const r of reports) {
  for (const b of (r.viewportBleeds || [])) {
    const k = `<${b.tag} class="${b.className}" id="${b.id}">`;
    if (!bleedMap.has(k)) bleedMap.set(k, { count: 0, states: [], sample: b });
    bleedMap.get(k).count++;
    bleedMap.get(k).states.push(r.state);
  }
  for (const inn of (r.innerOverflows || [])) {
    const k = `<${inn.tag} class="${inn.className}" id="${inn.id}">`;
    if (!innerMap.has(k)) innerMap.set(k, { count: 0, states: [], sample: inn });
    innerMap.get(k).count++;
    innerMap.get(k).states.push(r.state);
  }
  for (const c of (r.crushedButtons || [])) {
    const k = `<${c.tag} class="${c.className}"> (${c.width}x${c.height}px)`;
    if (!crushedMap.has(k)) crushedMap.set(k, { count: 0, states: [], sample: c });
    crushedMap.get(k).count++;
    crushedMap.get(k).states.push(r.state);
  }
  for (const t of (r.telemetryDefects || [])) {
    const k = `<${t.tag} class="${t.className}"> "${t.text}"`;
    if (!telemetryMap.has(k)) telemetryMap.set(k, { count: 0, states: [], sample: t });
    telemetryMap.get(k).count++;
    telemetryMap.get(k).states.push(r.state);
  }
}

console.log('\n==================================================');
console.log('1. VIEWPORT BLEEDS (rect.right > 360 outside scroll):', bleedMap.size);
for (const [k, v] of bleedMap.entries()) {
  console.log(` - ${k} (${v.count} states): right=${v.sample.right} w=${v.sample.width} text:"${v.sample.text}"`);
  console.log(`   In states: ${v.states.slice(0, 3).join(', ')}`);
}

console.log('\n==================================================');
console.log('2. CRUSHED BUTTONS (< 44px touch target):', crushedMap.size);
for (const [k, v] of crushedMap.entries()) {
  console.log(` - ${k} (${v.count} states): text:"${v.sample.text}"`);
  console.log(`   In states: ${v.states.slice(0, 3).join(', ')}`);
}

console.log('\n==================================================');
console.log('3. INNER OVERFLOWS (scrollW > clientW, uncontained):', innerMap.size);
const sortedInners = Array.from(innerMap.entries()).sort((a, b) => b[1].sample.diff - a[1].sample.diff);
for (const [k, v] of sortedInners) {
  if (v.sample.diff >= 5) {
    console.log(` - [DIFF ${v.sample.diff}px] ${k} (${v.count} states): scrollW=${v.sample.scrollWidth} > clientW=${v.sample.clientWidth} overflowX=${v.sample.overflowX} text:"${v.sample.text}"`);
    console.log(`   In states: ${v.states.slice(0, 3).join(', ')}`);
  }
}

console.log('\n==================================================');
console.log('4. TELEMETRY DEFECTS (undefined / NaN):', telemetryMap.size);
for (const [k, v] of telemetryMap.entries()) {
  console.log(` - ${k} (${v.count} states)`);
}
