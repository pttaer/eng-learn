const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function test() {
  const url = 'https://prd-swp-le.s3.amazonaws.com/lrg/c1g001-reporting-verbs/mobile/data.js';
  const packed = await fetchUrl(url);
  const unpackCode = packed.replace(/^\s*eval\s*\(/, 'return (');
  const unpacked = new Function(unpackCode)();
  
  const match = unpacked.match(/CreateData\("(.+)"\);?$/s);
  if (match) {
    const xml = match[1];
    fs.writeFileSync('scratch_sl2.xml', xml);
    console.log('Saved scratch_sl2.xml, length:', xml.length);
    // Find unique tags
    const tags = new Set([...xml.matchAll(/<([a-zA-Z0-9_]+)/g)].map(m => m[1]));
    console.log('Tags in XML:', Array.from(tags).slice(0, 30));
  }
}

test();
