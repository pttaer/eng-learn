// web/scripts/migrate-grammar.cjs
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const webDir = path.resolve(__dirname, '..');
const contentGrammarDir = path.join(webDir, 'content', 'grammar');
const grammarJsonPath = path.join(webDir, 'src', 'assets', 'data', 'grammar.json');

if (!fs.existsSync(contentGrammarDir)) {
  fs.mkdirSync(contentGrammarDir, { recursive: true });
}

const origGrammar = JSON.parse(fs.readFileSync(grammarJsonPath, 'utf8'));
console.log(`Loaded ${origGrammar.length} grammar rules from grammar.json`);

const files = [
  {
    fileName: '01-inversion.md',
    mode: 'INVERSION_EMPHASIS',
    modeOutput: 'INVERSION_EMPHASIS',
    header: '# Mode: Inversion & Emphasis (C1/C2)\n\n'
  },
  {
    fileName: '02-subjunctive.md',
    mode: 'SUBJUNCTIVE_UNREAL',
    modeOutput: 'SUBJUNCTIVE_UNREAL',
    header: '# Mode: Subjunctive & Unreal Conditionals (C1/C2)\n\n'
  },
  {
    fileName: '03-condensation.md',
    mode: 'CLAUSAL_CONDENSATION',
    modeOutput: 'CLAUSAL_CONDENSATION',
    header: '# Mode: Clausal Condensation & Participial Architecture (C1/C2)\n\n'
  },
  {
    fileName: '04-syntactic-repair.md',
    mode: 'SYNTACTIC_PRECISION',
    modeOutput: 'SYNTACTIC_REPAIR',
    header: '# Mode: Syntactic Repair & Parallelism Precision (C1/C2)\n\n'
  }
];

files.forEach(f => {
  const items = origGrammar.filter(x => x.mode === f.mode);
  let content = f.header;

  items.forEach(item => {
    content += `## ${item.title}\n`;
    content += `- **ID**: ${item.id}\n`;
    content += `- **Mode**: ${f.modeOutput}\n`;
    content += `- **Level**: ${item.level}\n`;
    content += `- **Prompt**: ${item.promptSentence}\n`;
    content += `- **Transformation**: ${item.targetTransformation}\n`;
    content += `- **Grammatical Cue**: ${item.grammaticalCue}\n`;
    content += `- **Vietnamese**: ${item.vietnamese}\n`;
    content += `- **Formula**: \`${item.formula}\`\n`;
    content += `- **Analysis**: ${item.analysis}\n`;
    content += `- **Exemplar**: ${item.exemplarContext}\n\n`;
  });

  const outPath = path.join(contentGrammarDir, f.fileName);
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`Delivered ${f.fileName} with ${items.length} items (${f.modeOutput})`);
});
