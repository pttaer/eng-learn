const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'web', 'src', 'assets', 'data', 'diagnostic-questions.json');
const questions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`Auditing ${questions.length} diagnostic questions...\n`);

questions.forEach((q, i) => {
  console.log(`----------------------------------------------------------------`);
  console.log(`[Item ${i + 1}] ID: ${q.id} | Level: ${q.level} | Skill: ${q.skill} | Stage: ${q.stage}`);
  console.log(`Prompt: ${q.prompt}`);
  console.log(`Context: ${q.context}`);
  console.log(`Options:`);
  q.options.forEach((opt, optIdx) => {
    const mark = optIdx === q.answer ? ' [CORRECT]' : '';
    console.log(`   (${optIdx}) ${opt}${mark}`);
  });
  console.log(`Explanation: ${q.explanation}`);
  console.log(`Vietnamese: ${q.vietnamese}`);
});
