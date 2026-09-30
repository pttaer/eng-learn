// web/scripts/migrate-collocations-habits.cjs
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const webDir = path.resolve(__dirname, '..');
const contentCollocDir = path.join(webDir, 'content', 'collocations');
const contentHabitsDir = path.join(webDir, 'content', 'habits');
const collocJsonPath = path.join(webDir, 'src', 'assets', 'data', 'collocations.json');
const habitsJsonPath = path.join(webDir, 'src', 'assets', 'data', 'habits.json');
const dailyPlanMdPath = path.join(repoRoot, 'daily_practice_plan.md');

// Ensure target directories exist
fs.mkdirSync(contentCollocDir, { recursive: true });
fs.mkdirSync(contentHabitsDir, { recursive: true });

// 1. Migrate Collocations
const collocations = JSON.parse(fs.readFileSync(collocJsonPath, 'utf8'));
console.log(`Loaded ${collocations.length} collocations from JSON.`);

const sections = [
  {
    fileName: '01-everyday.md',
    title: '# Section 1: Everyday & Core Action Collocations (Items 1–250)',
    subtitle: '### Các cụm từ diễn đạt hành động cốt lõi và giao tiếp đời sống hàng ngày',
    start: 1,
    end: 250
  },
  {
    fileName: '02-business-law.md',
    title: '# Section 2: Business, Commerce, Law & Workplace Operations (Items 251–500)',
    subtitle: '### Các cụm từ chuyên sâu về thương mại, tài chính, đàm phán và pháp lý doanh nghiệp',
    start: 251,
    end: 500
  },
  {
    fileName: '03-academic-science.md',
    title: '# Section 3: Academic, Technical & Scientific Research (Items 501–750)',
    subtitle: '### Các cụm từ học thuật, nghiên cứu khoa học, công nghệ và tư duy phản biện',
    start: 501,
    end: 750
  },
  {
    fileName: '04-emotions-idioms.md',
    title: '# Section 4: Rhetorical, Emotions, Society & Idiomatic Expressions (Items 751–1000)',
    subtitle: '### Các cụm từ thành ngữ, diễn đạt cảm xúc, hiện tượng xã hội và tu từ nâng cao',
    start: 751,
    end: 1000
  }
];

sections.forEach(sec => {
  const items = collocations.filter(c => c.index >= sec.start && c.index <= sec.end);
  items.sort((a, b) => a.index - b.index);

  let md = `${sec.title}\n${sec.subtitle}\n\n`;
  md += `| Index | Phrase | Vietnamese Meaning | Category |\n`;
  md += `| :---: | :--- | :--- | :--- |\n`;

  items.forEach(item => {
    md += `| ${item.index} | ${item.phrase} | ${item.vietnamese} | ${item.category} |\n`;
  });

  const outPath = path.join(contentCollocDir, sec.fileName);
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`[WROTE] ${sec.fileName}: ${items.length} items (${sec.start}–${sec.end})`);
});

// 2. Migrate Habits
const habitsJsonRaw = fs.readFileSync(habitsJsonPath, 'utf8').trim();
let dailyPlanMdContent = '';
if (fs.existsSync(dailyPlanMdPath)) {
  dailyPlanMdContent = fs.readFileSync(dailyPlanMdPath, 'utf8').trim();
}

let habitsMd = `${dailyPlanMdContent}\n\n---\n\n## 5. Machine-Readable Habits Dataset\n\n\`\`\`json\n${habitsJsonRaw}\n\`\`\`\n`;
const habitsOutPath = path.join(contentHabitsDir, 'daily-plan.md');
fs.writeFileSync(habitsOutPath, habitsMd, 'utf8');
console.log(`[WROTE] daily-plan.md with full markdown protocol and embedded JSON dataset.`);
