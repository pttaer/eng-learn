const fs = require('fs');
const path = require('path');

const p = path.resolve(__dirname, '../web/content/diagnostic/diagnostic-questions.md');
const content = fs.readFileSync(p, 'utf8');
const match = content.match(/```json\r?\n([\s\S]*?)\r?\n```/);
const qs = JSON.parse(match[1]);

qs.forEach((q, i) => {
  console.log(`[${i+1}] ID: ${q.id} (${q.level} - ${q.skill})`);
  console.log('   Context:    ' + (q.context || ''));
  console.log('   Eng Exp:    ' + q.explanation);
  console.log('   Vietnamese: ' + q.vietnamese);
  console.log('');
});
