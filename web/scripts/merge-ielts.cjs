// Concatenates src/ielts/data/parts/<kind>-*.json (arrays) into the final data files the app imports.
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'src', 'ielts', 'data');
const PARTS = path.join(DATA, 'parts');
const read = prefix => fs.existsSync(PARTS)
  ? fs.readdirSync(PARTS).filter(f => f.startsWith(prefix + '-') && f.endsWith('.json')).sort()
      .flatMap(f => JSON.parse(fs.readFileSync(path.join(PARTS, f), 'utf8')))
  : [];
const write = (name, data) => fs.writeFileSync(path.join(DATA, name), JSON.stringify(data, null, 1), 'utf8');

for (const k of ['reading', 'listening', 'writing1', 'writing2']) write(`${k}.json`, read(k));
write('speaking.json', { part1: read('speaking-part1'), part2: read('speaking-part2') });
console.log('[IELTS] merged data files');
