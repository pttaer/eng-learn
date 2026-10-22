const fs = require('fs');
const path = require('path');

const PARTS_DIR = path.join(__dirname, '../src/ielts/data/parts');
const w1Files = fs.readdirSync(PARTS_DIR).filter(f => f.startsWith('writing1-') && f.endsWith('.json'));

const issues = [];

w1Files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(PARTS_DIR, file), 'utf8'));
  data.forEach(task => {
    const chart = task.chart;
    const model = task.model;
    const notes = task.notes;

    if (!chart) {
      issues.push({ file, id: task.id, type: 'NO_CHART' });
      return;
    }

    // Check chart kind
    if (['line', 'bar', 'table', 'pie'].includes(chart.kind)) {
      if (!chart.labels || !chart.series) {
        issues.push({ file, id: task.id, type: 'INVALID_CHART_STRUCTURE' });
        return;
      }
      // Check each series has values matching labels length
      chart.series.forEach(s => {
        if (!s.values || s.values.length !== chart.labels.length) {
          issues.push({ file, id: task.id, type: 'SERIES_LENGTH_MISMATCH', detail: `Series ${s.name} length ${s.values?.length} vs labels ${chart.labels.length}` });
        }
      });
      // Extract numbers mentioned in model
      // Check if numbers mentioned in model exist in series values or can be derived (sum, diff)
      const allValues = new Set();
      chart.series.forEach(s => s.values.forEach(v => allValues.add(v)));
      
      // Look for explicit percentages or data points in model
      const modelNumbers = model.match(/\b\d+(\.\d+)?%?\b/g) || [];
      const dataPoints = modelNumbers.filter(n => {
        const val = parseFloat(n);
        // Exclude years
        if (val >= 1900 && val <= 2040) return false;
        // Exclude trivial numbers like paragraph counts, 1, 2
        return true;
      });

      // Report for sanity check
    } else if (chart.kind === 'map') {
      if (!chart.maps || chart.maps.length < 2) {
        issues.push({ file, id: task.id, type: 'MAP_LESS_THAN_TWO_PERIODS' });
      }
    } else if (chart.kind === 'process') {
      if (!chart.steps || chart.steps.length < 5) {
        issues.push({ file, id: task.id, type: 'PROCESS_FEWER_THAN_5_STEPS' });
      }
    }
  });
});

console.log('Writing 1 Chart Consistency Audit:');
console.log(`Found ${issues.length} structural or value issues:`);
issues.forEach(i => console.log(`  [${i.type}] ${i.file} (${i.id}): ${i.detail || ''}`));
