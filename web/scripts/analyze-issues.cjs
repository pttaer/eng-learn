const fs = require('fs');
const data = JSON.parse(fs.readFileSync('e:/Eng/screenshots/overflow_audit_360.json', 'utf8'));

console.log('Total routes audited:', Object.keys(data).length);
for (const [route, r] of Object.entries(data)) {
  const bleeds = (r.issues || []).filter(i => i.type === 'viewport-bleed');
  const inners = (r.issues || []).filter(i => i.type === 'uncontained-inner-overflow');
  if (r.docW > 360 || bleeds.length > 0 || inners.length > 0) {
    console.log(`\n========================================`);
    console.log(`ROUTE: ${route} | docW: ${r.docW} (win: ${r.winWidth}) | bleeds: ${bleeds.length} | inners: ${inners.length}`);
    if (bleeds.length > 0) {
      console.log('--- Bleeds (exceeding 360px viewport):');
      bleeds.forEach(b => {
        console.log(`  <${b.tag} class="${b.className}" id="${b.id}"> right:${b.right} width:${b.width} text:"${b.text}"`);
      });
    }
    if (inners.length > 0) {
      console.log('--- Uncontained Inner Overflows (clipped text/content):');
      inners.forEach(i => {
        console.log(`  <${i.tag} class="${i.className}" id="${i.id}"> scrollW:${i.scrollWidth} > clientW:${i.clientWidth} diff:${i.scrollWidth - i.clientWidth} text:"${i.text}"`);
      });
    }
  }
}

