const fs = require('fs');
const data = JSON.parse(fs.readFileSync('e:/Eng/screenshots/overflow_audit_360.json', 'utf8'));

const componentMap = new Map();

for (const [route, r] of Object.entries(data)) {
  for (const iss of (r.issues || [])) {
    const key = `${iss.type} | <${iss.tag} class="${iss.className}">`;
    if (!componentMap.has(key)) {
      componentMap.set(key, { count: 0, routes: new Set(), samples: [] });
    }
    const item = componentMap.get(key);
    item.count++;
    item.routes.add(route);
    if (item.samples.length < 3) {
      item.samples.push({
        route,
        text: iss.text,
        scrollW: iss.scrollWidth,
        clientW: iss.clientWidth,
        diff: (iss.scrollWidth && iss.clientWidth) ? iss.scrollWidth - iss.clientWidth : undefined,
        right: iss.right,
        width: iss.width
      });
    }
  }
}

console.log('=== UNIQUE OVERFLOW COMPONENTS ACROSS ALL 30 ROUTES ===');
for (const [key, val] of componentMap.entries()) {
  console.log(`\n[${val.count}x in ${val.routes.size} routes] ${key}`);
  val.samples.forEach(s => {
    console.log(`  -> ${s.route}: diff=${s.diff} right=${s.right} w=${s.width} text:"${s.text}"`);
  });
}

