const fs = require('fs');
const path = require('path');

const PARTS_DIR = path.join(__dirname, '../src/ielts/data/parts');

const files = fs.readdirSync(PARTS_DIR).filter(f => f.endsWith('.json'));

const issues = {
  reading: [],
  listening: [],
  writing1: [],
  writing2: [],
  speaking: [],
  vocab: []
};

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

// 1. Audit Reading Parts
const readingFiles = files.filter(f => f.startsWith('reading-') || f.startsWith('originals-reading-'));
readingFiles.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(PARTS_DIR, file), 'utf8'));
  data.forEach(passage => {
    const fullText = passage.paragraphs.map(p => p.text).join(' ');
    const normFullText = normalize(fullText);
    
    // Check passage length
    const words = fullText.trim().split(/\s+/).length;
    if (words < 700 || words > 1150) {
      issues.reading.push({ file, passageId: passage.id, type: 'PASSAGE_LENGTH', detail: `${words} words` });
    }

    // Check questions
    passage.questions.forEach((q, idx) => {
      // 1. Check TFNG / YNNG
      if (q.type === 'tfng') {
        if (!['TRUE', 'FALSE', 'NOT GIVEN'].includes(q.answer)) {
          issues.reading.push({ file, passageId: passage.id, qId: q.id, type: 'BAD_TFNG_KEY', detail: q.answer });
        }
      } else if (q.type === 'ynng') {
        if (!['YES', 'NO', 'NOT GIVEN'].includes(q.answer)) {
          issues.reading.push({ file, passageId: passage.id, qId: q.id, type: 'BAD_YNNG_KEY', detail: q.answer });
        }
      }

      // 2. Check MCQ / Heading / Match / Features
      if (['mcq', 'heading', 'match', 'features'].includes(q.type)) {
        if (!Array.isArray(q.options) || q.options.length < 3) {
          issues.reading.push({ file, passageId: passage.id, qId: q.id, type: 'MISSING_OPTIONS', detail: '' });
        } else {
          const keys = q.options.map(o => o.split(/[.)]/)[0].trim());
          if (!keys.includes(q.answer)) {
            issues.reading.push({ file, passageId: passage.id, qId: q.id, type: 'ANSWER_NOT_IN_OPTIONS', detail: `Answer: "${q.answer}", Options: [${keys.join(', ')}]` });
          }
        }
      }

      // 3. Check Fill-in-the-blank / Completion
      if (['complete', 'sentence', 'summary', 'table', 'short'].includes(q.type)) {
        const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
        answers.forEach(ans => {
          const normAns = normalize(ans);
          // Check if answer is in passage
          if (!normFullText.includes(normAns)) {
            issues.reading.push({ file, passageId: passage.id, qId: q.id, type: 'COMPLETION_NOT_IN_PASSAGE', detail: `Answer "${ans}" not found in passage text` });
          }
        });
      }

      // 4. Check why evidence quotes
      if (!q.why || q.why.trim().length < 15) {
        issues.reading.push({ file, passageId: passage.id, qId: q.id, type: 'WEAK_WHY', detail: q.why });
      } else {
        // Look for quotes inside quotes like "..." in why
        const quoteMatch = q.why.match(/"([^"]{10,})"/);
        if (quoteMatch) {
          const quoted = quoteMatch[1];
          const normQuoted = normalize(quoted);
          if (!normFullText.includes(normQuoted)) {
            // Check if it's paraphrased or has small typo
            issues.reading.push({ file, passageId: passage.id, qId: q.id, type: 'EVIDENCE_QUOTE_MISMATCH', detail: `Quoted: "${quoted.slice(0, 40)}..." not in passage` });
          }
        }
      }
    });
  });
});

// 2. Audit Listening Parts
const listeningFiles = files.filter(f => f.startsWith('listening-'));
listeningFiles.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(PARTS_DIR, file), 'utf8'));
  data.forEach(sec => {
    const fullTranscript = sec.script.map(l => l.text).join(' ');
    const normTranscript = normalize(fullTranscript);

    sec.questions.forEach(q => {
      if (['complete', 'sentence', 'summary', 'table', 'short'].includes(q.type)) {
        const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
        answers.forEach(ans => {
          const normAns = normalize(ans);
          // Numbers or special words might need fuzzy match, but check verbatim first
          if (!normTranscript.includes(normAns)) {
            issues.listening.push({ file, secId: sec.id, qId: q.id, type: 'COMPLETION_NOT_IN_TRANSCRIPT', detail: `Answer "${ans}" not found in script` });
          }
        });
      }

      if (['mcq', 'match'].includes(q.type)) {
        const keys = q.options ? q.options.map(o => o.split(/[.)]/)[0].trim()) : [];
        if (!keys.includes(q.answer)) {
          issues.listening.push({ file, secId: sec.id, qId: q.id, type: 'ANSWER_NOT_IN_OPTIONS', detail: `Answer "${q.answer}" not in [${keys.join(', ')}]` });
        }
      }

      // Check evidence quote in why
      if (q.why) {
        const quoteMatch = q.why.match(/"([^"]{10,})"/);
        if (quoteMatch) {
          const quoted = quoteMatch[1];
          const normQuoted = normalize(quoted);
          if (!normTranscript.includes(normQuoted)) {
            issues.listening.push({ file, secId: sec.id, qId: q.id, type: 'EVIDENCE_QUOTE_MISMATCH', detail: `Quoted: "${quoted.slice(0, 40)}..." not in script` });
          }
        }
      }
    });
  });
});

// 3. Audit Writing 1 Parts (Chart consistency & Model analysis)
const w1Files = files.filter(f => f.startsWith('writing1-'));
w1Files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(PARTS_DIR, file), 'utf8'));
  data.forEach(task => {
    const model = task.model || '';
    const wordCount = model.trim().split(/\s+/).length;
    if (wordCount < 140 || wordCount > 230) {
      issues.writing1.push({ file, taskId: task.id, type: 'WORD_COUNT', detail: `${wordCount} words` });
    }

    if (!/\b(overall|in general|in summary|to summari[sz]e)\b/i.test(model)) {
      issues.writing1.push({ file, taskId: task.id, type: 'MISSING_OVERVIEW', detail: '' });
    }

    // Check chart consistency for bar/line/pie
    if (task.chart && ['line', 'bar', 'pie'].includes(task.chart.kind)) {
      const series = task.chart.series || [];
      const labels = task.chart.labels || [];
      // Search model for numbers that appear in series
      const allNumbersInChart = new Set();
      series.forEach(s => s.values.forEach(v => allNumbersInChart.add(v.toString())));

      // Extract numbers in model (e.g. 25%, 40, etc.)
      const numbersInModel = (model.match(/\b\d+(\.\d+)?%?\b/g) || []).map(n => n.replace('%', ''));
      // Filter out years like 1990, 2020, 2005
      const nonYearNumbers = numbersInModel.filter(n => {
        const num = parseFloat(n);
        return !(num >= 1950 && num <= 2050);
      });

      // Check if model cites numbers wildly outside chart series values
      // (Just flag for review)
    }
  });
});

// 4. Audit Writing 2 Parts
const w2Files = files.filter(f => f.startsWith('writing2-'));
w2Files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(PARTS_DIR, file), 'utf8'));
  data.forEach(task => {
    const model = task.model || '';
    const wordCount = model.trim().split(/\s+/).length;
    if (wordCount < 250 || wordCount > 350) {
      issues.writing2.push({ file, taskId: task.id, type: 'WORD_COUNT', detail: `${wordCount} words` });
    }
    const paras = model.split(/\n\s*\n/).filter(p => p.trim());
    if (paras.length < 4 || paras.length > 5) {
      issues.writing2.push({ file, taskId: task.id, type: 'PARAGRAPH_COUNT', detail: `${paras.length} paragraphs` });
    }
  });
});

console.log('--- AUDIT RESULTS ---');
console.log(`Reading Issues: ${issues.reading.length}`);
issues.reading.forEach(i => console.log(`  [${i.type}] ${i.file} (${i.passageId}${i.qId ? '/' + i.qId : ''}): ${i.detail}`));

console.log(`Listening Issues: ${issues.listening.length}`);
issues.listening.forEach(i => console.log(`  [${i.type}] ${i.file} (${i.secId}${i.qId ? '/' + i.qId : ''}): ${i.detail}`));

console.log(`Writing 1 Issues: ${issues.writing1.length}`);
issues.writing1.forEach(i => console.log(`  [${i.type}] ${i.file} (${i.taskId}): ${i.detail}`));

console.log(`Writing 2 Issues: ${issues.writing2.length}`);
issues.writing2.forEach(i => console.log(`  [${i.type}] ${i.file} (${i.taskId}): ${i.detail}`));

fs.writeFileSync(path.join(__dirname, 'ielts-audit-report.json'), JSON.stringify(issues, null, 2), 'utf8');
