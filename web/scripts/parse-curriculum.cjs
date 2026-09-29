const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const webDir = path.resolve(__dirname, '..');
const dataDir = path.join(webDir, 'src', 'assets', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('[PARSER] Initiating curriculum extraction...');

// ----------------------------------------------------
// 1. Parse collocations.md (1,000 items)
// ----------------------------------------------------
const collocPath = path.join(rootDir, 'collocations.md');
const collocContent = fs.readFileSync(collocPath, 'utf-8');
const collocLines = collocContent.split('\n');

const collocations = [];
let currentCategory = 'EVERYDAY';

for (const line of collocLines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('## 1.')) {
    currentCategory = 'EVERYDAY';
  } else if (trimmed.startsWith('## 2.')) {
    currentCategory = 'BUSINESS';
  } else if (trimmed.startsWith('## 3.')) {
    currentCategory = 'ACADEMIC';
  } else if (trimmed.startsWith('## 4.')) {
    currentCategory = 'IDIOMS';
  }

  // Match table row: | No. | Collocation | Vietnamese Meaning |
  if (trimmed.startsWith('|') && !trimmed.includes('---') && !trimmed.includes('Collocation')) {
    const parts = trimmed.split('|').map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length >= 3) {
      const num = parseInt(parts[0], 10);
      if (!isNaN(num)) {
        collocations.push({
          id: `colloc-${num}`,
          index: num,
          phrase: parts[1],
          vietnamese: parts[2],
          category: currentCategory
        });
      }
    }
  }
}

console.log(`[PARSER] Extracted ${collocations.length} collocations.`);
if (collocations.length !== 1000) {
  console.warn(`[WARNING] Expected 1000 collocations, found ${collocations.length}!`);
}

fs.writeFileSync(
  path.join(dataDir, 'collocations.json'),
  JSON.stringify(collocations, null, 2),
  'utf-8'
);

// ----------------------------------------------------
// 2. Parse practice_drills.md (Speaking & Writing)
// ----------------------------------------------------
const drillsPath = path.join(rootDir, 'practice_drills.md');
const drillsContent = fs.readFileSync(drillsPath, 'utf-8');

const speakingDrills = [];
const writingDrills = [];

// Split into Speaking and Writing sections
const parts = drillsContent.split('# Part 2:');
const speakingSection = parts[0] || '';
const restParts = (parts[1] || '').split('# Part 3:');
const writingSection = restParts[0] || '';
const rubricSection = restParts[1] || '';

// Parse Speaking Drills
const speakingBlocks = speakingSection.split(/### Drill \d+:/).slice(1);
speakingBlocks.forEach((block, idx) => {
  const lines = block.trim().split('\n');
  const title = (lines[0] || '').trim();
  let prompt = '';
  let mode = '';
  let anchor = '';
  let collocations = '';
  let phonetic = '';

  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith('- **Prompt**:')) {
      prompt = l.replace('- **Prompt**:', '').replace(/^[\s*"]+|[\s*"]+$/g, '').trim();
    } else if (l.startsWith('- **Recommended Mode**:')) {
      mode = l.replace('- **Recommended Mode**:', '').replace(/[`*]/g, '').trim();
    } else if (l.startsWith('- **15-Second Mental Anchor**:')) {
      anchor = l.replace('- **15-Second Mental Anchor**:', '').trim();
    } else if (l.startsWith('- **Target High-Yield Collocations**:')) {
      collocations = l.replace('- **Target High-Yield Collocations**:', '').replace(/[`*]/g, '').trim();
    } else if (l.startsWith('- **Prosodic & Phonetic Objective**:')) {
      phonetic = l.replace('- **Prosodic & Phonetic Objective**:', '').trim();
    }
  }

  speakingDrills.push({
    id: `speaking-${idx + 1}`,
    index: idx + 1,
    title,
    prompt,
    mode: mode || '4-3-2 Fluency Drill',
    anchor,
    collocations,
    phonetic
  });
});

// Parse Writing Drills
const writingBlocks = writingSection.split(/### Prompt \d+:/).slice(1);
writingBlocks.forEach((block, idx) => {
  const lines = block.trim().split('\n');
  const title = (lines[0] || '').trim();
  let question = '';
  let mode = '';
  let register = '';
  let m = '';
  let e = '';
  let a = '';
  let l = '';
  let stylistic = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- **Analytical Question**:')) {
      question = trimmed.replace('- **Analytical Question**:', '').replace(/^[\s*"]+|[\s*"]+$/g, '').trim();
    } else if (trimmed.startsWith('- **Recommended Mode**:')) {
      mode = trimmed.replace('- **Recommended Mode**:', '').replace(/[`*]/g, '').trim();
    } else if (trimmed.startsWith('- **Target Register**:')) {
      register = trimmed.replace('- **Target Register**:', '').replace(/[`*]/g, '').trim();
    } else if (trimmed.startsWith('- **M (Main Idea / Topic Claim)**:')) {
      m = trimmed.replace('- **M (Main Idea / Topic Claim)**:', '').trim();
    } else if (trimmed.startsWith('- **E (Concrete Evidence / Data)**:')) {
      e = trimmed.replace('- **E (Concrete Evidence / Data)**:', '').trim();
    } else if (trimmed.startsWith('- **A (Analytical Mechanism / How & Why)**:')) {
      a = trimmed.replace('- **A (Analytical Mechanism / How & Why)**:', '').trim();
    } else if (trimmed.startsWith('- **L (Link / Strategic Implication)**:')) {
      l = trimmed.replace('- **L (Link / Strategic Implication)**:', '').trim();
    } else if (trimmed.startsWith('- **Stylistic Devices & Syntactic Focus**:')) {
      stylistic = trimmed.replace('- **Stylistic Devices & Syntactic Focus**:', '').trim();
    }
  }

  // Master sentence for copywork is M (Main Idea) or the full prompt
  const masterSentence = m || question;

  writingDrills.push({
    id: `writing-${idx + 1}`,
    index: idx + 1,
    title,
    question,
    mode,
    register,
    masterSentence,
    meal: {
      m,
      e,
      a,
      l
    },
    stylistic
  });
});

const drillsData = {
  speaking: speakingDrills,
  writing: writingDrills,
  rubricSummary: rubricSection.slice(0, 1500)
};

fs.writeFileSync(
  path.join(dataDir, 'drills.json'),
  JSON.stringify(drillsData, null, 2),
  'utf-8'
);
console.log(`[PARSER] Extracted ${speakingDrills.length} speaking drills and ${writingDrills.length} writing drills.`);

// ----------------------------------------------------
// 3. Parse listening.md
// ----------------------------------------------------
const listeningPath = path.join(rootDir, 'listening.md');
const listeningContent = fs.readFileSync(listeningPath, 'utf-8');

const listeningData = {
  title: 'Active Listening & Phonetic Decoding',
  rules: [
    {
      id: 'catenation',
      title: 'Catenation (Consonant-to-Vowel Linking)',
      example: 'Hold on an hour -> [həʊl.dɒ.nə.naʊ.ər]',
      description: 'When a word ends in a consonant and the next begins with a vowel sound, the consonant moves across the boundary.'
    },
    {
      id: 'elision',
      title: 'Elision (Sound Deletion)',
      example: 'Next door -> [neks dɔːr], Diamond ring -> [ˈdaɪ.mən rɪŋ]',
      description: 'In fast speech, weak vowels and alveolar stops (/t/ and /d/) disappear between consonants.'
    },
    {
      id: 'assimilation',
      title: 'Assimilation (Sound Transformation)',
      example: 'white paper -> whipe paper, don\'t you -> [dəʊntʃuː]',
      description: 'Alveolar consonants (/t/, /d/, /n/) adopt the place of articulation of the following consonant.'
    },
    {
      id: 'schwa',
      title: 'Weak Forms & The Schwa (/ə/)',
      example: 'for -> /fər/, was -> /wəz/, at -> /ət/',
      description: 'Stress-timed rhythm collapses grammatical function words to weak unstressed schwa syllables.'
    }
  ],
  accents: [
    { name: 'General American (GA)', markers: 'Rhotic /r/, flap [ɾ] for t/d, broad æ in bath.' },
    { name: 'Received Pronunciation (RP)', markers: 'Non-rhotic, long open ɑː, glottal stop [ʔ].' },
    { name: 'Australian & Commonwealth', markers: 'High-rising terminal, /eɪ/ -> /aɪ/, vocalic l.' },
    { name: 'Global & Non-Native', markers: 'Syllable-timed cadence, dental fricative variations.' }
  ],
  protocol: [
    { pass: 1, name: 'Gist Capture', focus: 'Macro meaning, 1.0x playback, no pauses. Write 3 bullet summary.' },
    { pass: 2, name: 'Micro-Verbatim Transcription', focus: 'Loop 5-8 second chunks, 0.8x-1.0x. Type verbatim text.' },
    { pass: 3, name: 'Phonetic Gap Analysis', focus: 'Compare against transcript, mark red highlights for elision/linking.' }
  ],
  samplePassages: [
    {
      id: 'listen-1',
      title: 'Algorithmic Optimization & Cognitive Load',
      audioText: 'In an era dominated by algorithmic feed optimization, the human cognitive bandwidth has become the ultimate scarce commodity.',
      ipa: '/ɪn ən ˈɪərə ˈdɒmɪneɪtɪd baɪ ˌælɡəˈrɪðmɪk fiːd ˌɒptɪmaɪˈzeɪʃən ðə ˈhjuːmən ˈkɒɡnɪtɪv ˈbændwɪdθ hæz bɪˈkʌm ði ˈʌltɪmət skeəs kəˈmɒdəti/',
      traps: 'Note elision in "feed optimization" and catenation in "In an era" [ɪ-nə-nɪərə].'
    },
    {
      id: 'listen-2',
      title: 'Organizational Agility in Distributed Teams',
      audioText: 'Organizations that prioritize synchronous consensus often suffer from severe decision paralysis and diminished velocity.',
      ipa: '/ˌɔːɡənaɪˈzeɪʃənz ðæt praɪˈɒrɪtaɪz ˈsɪŋkrənəs kənˈsɛnsəs ˈɒf(ə)n ˈsʌfər frəm sɪˈvɪər dɪˈsɪʒən pəˈræləsɪs ənd dɪˈmɪnɪʃt vɪˈlɒsɪti/',
      traps: 'Weak form "frəm" and assimilation in "often suffer".'
    },
    {
      id: 'listen-3',
      title: 'The Paradox of Creative Constraints',
      audioText: 'Without arbitrary limitations to direct their focus, most creators fall prey to the paralysis of infinite choice.',
      ipa: '/wɪˈðaʊt ˈɑːbɪtrəri ˌlɪmɪˈteɪʃənz tuː daɪˈrɛkt ðeə ˈfəʊkəs məʊst kriˈeɪtəz fɔːl preɪ tuː ðə pəˈræləsɪs ɒv ˈɪnfɪnɪt tʃɔɪs/',
      traps: 'Elision of final /t/ in "most creators" -> [məʊs kriˈeɪtəz].'
    }
  ]
};

fs.writeFileSync(
  path.join(dataDir, 'listening.json'),
  JSON.stringify(listeningData, null, 2),
  'utf-8'
);
console.log('[PARSER] Generated listening.json.');

// ----------------------------------------------------
// 4. Parse daily_practice_plan.md
// ----------------------------------------------------
const habitsPath = path.join(rootDir, 'daily_practice_plan.md');
const habitsContent = fs.readFileSync(habitsPath, 'utf-8');

const days = [];
const dayRegex = /### TUẦN (\d+):[^\n]*\n([\s\S]*?)(?=### TUẦN|\Z)/g;
let weekMatch;

// Simple line by line extractor for Day 1..30
const dayBlocks = habitsContent.split(/- \[ \] \*\*Day (\d+):/);
// dayBlocks[0] is header, then pairs of [dayNum, content]
for (let i = 1; i < dayBlocks.length; i += 2) {
  const dayNum = parseInt(dayBlocks[i], 10);
  const block = dayBlocks[i + 1] || '';
  const firstLineEnd = block.indexOf('\n');
  const title = (firstLineEnd !== -1 ? block.substring(0, firstLineEnd) : block).replace(/\*\*/g, '').trim();

  const taskLines = block.split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('- [ ]') && l.includes('**'))
    .map(l => l.replace('- [ ]', '').trim());

  let week = 1;
  let phase = 'Foundation & Reflex Calibration';
  if (dayNum > 7 && dayNum <= 14) {
    week = 2;
    phase = 'Structural Complexity & Syntactic Precision';
  } else if (dayNum > 14 && dayNum <= 21) {
    week = 3;
    phase = 'Acoustic Mastery & Impromptu Jamming';
  } else if (dayNum > 21) {
    week = 4;
    phase = 'Native Velocity & Cognitive Synthesis';
  }

  days.push({
    day: dayNum,
    week,
    phase,
    title,
    tasks: taskLines
  });
}

fs.writeFileSync(
  path.join(dataDir, 'habits.json'),
  JSON.stringify({ days }, null, 2),
  'utf-8'
);
console.log(`[PARSER] Generated habits.json with ${days.length} days.`);

// ----------------------------------------------------
// 5 & 6. Generate vocabulary.json & reading.json
// ----------------------------------------------------
require('./generate-vocab-reading.cjs');

console.log('[PARSER] All curriculum files successfully compiled.');

