// web/scripts/compile-content.cjs
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const DATA_DIR = path.join(__dirname, '..', 'src', 'assets', 'data');

if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper: Parse YAML frontmatter
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  match[1].split(/\r?\n/).forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      else if (!isNaN(Number(val)) && val !== '') val = Number(val);
      meta[key] = val;
    }
  });
  return { meta, body: match[2] };
}

// 1. Collocations Compiler
function compileCollocations() {
  const dir = path.join(CONTENT_DIR, 'collocations');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  if (files.length === 0) return;
  const allItems = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\r\n/g, '\n');
    const lines = content.split(/\r?\n/);
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('|') || trimmed.includes('Index') || trimmed.includes(':---')) return;
      // Positional cells: an empty Example must not shift CEFR into its slot
      const parts = trimmed.replace(/^\|/, '').replace(/\|$/, '').split('|').map(p => p.trim());
      if (parts.length >= 4 && parts[1]) {
        const index = parseInt(parts[0], 10);
        allItems.push({
          id: `colloc-${index}`,
          index: index,
          phrase: parts[1],
          vietnamese: parts[2],
          category: parts[3],
          example: parts[4] || '',
          cefrLevel: parts[5] || ''
        });
      }
    });
  });

  if (allItems.length > 0) {
    allItems.sort((a, b) => a.index - b.index);
    fs.writeFileSync(path.join(DATA_DIR, 'collocations.json'), JSON.stringify(allItems, null, 2), 'utf8');
    console.log(`[COMPILE] collocations.json: ${allItems.length} items`);
  }
}

// 2. Grammar Compiler
function compileGrammar() {
  const dir = path.join(CONTENT_DIR, 'grammar');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  if (files.length === 0) return;
  const allRules = [];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\r\n/g, '\n');
    const sections = content.split(/^##\s+/m).slice(1);
    
    sections.forEach(sec => {
      const lines = sec.split(/\r?\n/);
      const title = lines[0].trim();
      const item = { title };
      
      lines.slice(1).forEach(l => {
        const m = l.match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
        if (m) {
          const key = m[1].trim();
          let val = m[2].trim();
          if (val.startsWith('`') && val.endsWith('`')) val = val.slice(1, -1);
          if (key === 'ID') item.id = val;
          else if (key === 'Mode') item.mode = (val === 'SYNTACTIC_REPAIR') ? 'SYNTACTIC_PRECISION' : val;
          else if (key === 'Level') item.level = parseInt(val, 10);
          else if (key === 'CEFR') item.cefrLevel = val;
          else if (key === 'Prompt') item.promptSentence = val;
          else if (key === 'Transformation') item.targetTransformation = val;
          else if (key === 'Grammatical Cue') item.grammaticalCue = val;
          else if (key === 'Vietnamese') item.vietnamese = val;
          else if (key === 'Formula') item.formula = val;
          else if (key === 'Analysis') item.analysis = val;
          else if (key === 'Exemplar') item.exemplarContext = val;
          else if (key === 'Vector') item.vector = val;
          else if (key === 'Trap') item.trap = val;
        }
      });
      if (item.id && item.promptSentence) allRules.push(item);
    });
  });

  if (allRules.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, 'grammar.json'), JSON.stringify(allRules, null, 2), 'utf8');
    console.log(`[COMPILE] grammar.json: ${allRules.length} rules`);
  }
}

// 3. Vocabulary Compiler
function compileVocabulary() {
  const dir = path.join(CONTENT_DIR, 'vocabulary');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'awl-corpus.md' && f !== 'rhetoric-figures.md').sort();
  if (files.length === 0) return;
  const allItems = [];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\r\n/g, '\n');
    const sections = content.split(/^##\s+/m).slice(1);

    sections.forEach(sec => {
      const lines = sec.split(/\r?\n/);
      const wordOrChunk = lines[0].trim();
      const item = { wordOrChunk, breakdown: {} };

      lines.slice(1).forEach(l => {
        const m = l.match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
        if (m) {
          const key = m[1].trim();
          let val = m[2].trim();
          if (key === 'ID') item.id = val;
          else if (key === 'Mode') item.mode = val;
          else if (key === 'Level') item.level = parseInt(val, 10);
          else if (key === 'CEFR') item.cefrLevel = val;
          else if (key === 'IPA') item.ipa = val;
          else if (key === 'Definition') item.definition = val;
          else if (key === 'Vietnamese') item.vietnamese = val;
          else if (key === 'Context') item.contextSentence = val;
          else if (key === 'Prefix') item.breakdown.prefix = val;
          else if (key === 'Root') item.breakdown.root = val;
          else if (key === 'Suffix') item.breakdown.suffix = val;
          else if (key === 'Derivatives') item.breakdown.derivationalFamily = val.split(',').map(s => s.trim());
          else if (key === 'Morphology') item.breakdown.morphologyAnalysis = val;
          else if (key === 'CEFR Rank') item.breakdown.cefrRank = val;
          else if (key === 'Collocates') item.breakdown.collocates = val;
          else if (key === 'Synonyms') item.breakdown.synonyms = val.split(',').map(s => s.trim());
          else if (key === 'Register') item.breakdown.register = val;
          else if (key === 'Verb') item.breakdown.verb = val;
          else if (key === 'Particle') item.breakdown.particle = val;
          else if (key === 'Semantic Archetype') item.breakdown.semanticArchetype = val;
          else if (key === 'Particle Logic') item.breakdown.particleLogic = val;
          else if (key === 'Remind Candidate') item.isRemindCandidate = (val.toLowerCase() === 'true');
        }
      });
      if (item.id && item.wordOrChunk) allItems.push(item);
    });
  });

  if (allItems.length > 0) {
    const modeOrder = { ROOT_FORGE: 1, CEFR_ASCENT: 2, PARTICLE_LAB: 3 };
    allItems.sort((a, b) => (modeOrder[a.mode] || 99) - (modeOrder[b.mode] || 99) || a.id.localeCompare(b.id, undefined, { numeric: true }));
    fs.writeFileSync(path.join(DATA_DIR, 'vocabulary.json'), JSON.stringify(allItems, null, 2), 'utf8');
    console.log(`[COMPILE] vocabulary.json: ${allItems.length} items`);
  }
}

// 3b. Lexicon Dictionary Compiler (AWL 500 Corpus & O(1) Index)
function compileLexicon() {
  const awlFile = path.join(CONTENT_DIR, 'vocabulary', 'awl-corpus.md');
  const lexiconDict = {};

  // 1. Ingest AWL 500 Corpus
  if (fs.existsSync(awlFile)) {
    const content = fs.readFileSync(awlFile, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('|') || trimmed.includes('Index') || trimmed.includes(':---')) return;
      const parts = trimmed.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 8) {
        const index = parseInt(parts[0], 10);
        const word = parts[1].trim();
        const pos = parts[2].trim();
        const ipa = parts[3].trim();
        const root = parts[4].trim();
        const definition = parts[5].trim();
        const vietnamese = parts[6].trim();
        const collocations = parts[7].split(',').map(s => s.trim()).filter(Boolean);
        const level = index <= 150 ? 1 : (index <= 350 ? 2 : 3);
        const key = word.toLowerCase();

        lexiconDict[key] = {
          id: `awl-${index}`,
          word: word,
          ipa: ipa,
          pos: pos,
          partOfSpeech: pos,
          root: root,
          definition: definition,
          vietnamese: vietnamese,
          collocations: collocations,
          level: level,
          contextSentence: collocations.length > 0 ? `Exemplar collocation: ${collocations[0]}.` : ''
        };
      }
    });
  }

  // 2. Ingest / Merge Vocabulary Items from vocabulary.json
  const vocabJsonPath = path.join(DATA_DIR, 'vocabulary.json');
  if (fs.existsSync(vocabJsonPath)) {
    try {
      const vocabItems = JSON.parse(fs.readFileSync(vocabJsonPath, 'utf8'));
      if (Array.isArray(vocabItems)) {
        vocabItems.forEach(item => {
          if (!item || !item.wordOrChunk) return;
          const key = item.wordOrChunk.toLowerCase().trim();
          const collocs = item.breakdown?.collocates
            ? (Array.isArray(item.breakdown.collocates) ? item.breakdown.collocates : String(item.breakdown.collocates).split(',').map(s => s.trim()))
            : (item.breakdown?.derivationalFamily || []);

          if (!lexiconDict[key]) {
            lexiconDict[key] = {
              id: item.id,
              word: item.wordOrChunk,
              ipa: item.ipa || '',
              pos: item.mode === 'PARTICLE_LAB' ? 'phrasal verb' : (item.breakdown?.suffix?.includes('adjective') ? 'adj' : (item.breakdown?.suffix?.includes('noun') ? 'noun' : 'word')),
              partOfSpeech: item.mode === 'PARTICLE_LAB' ? 'phrasal verb' : 'word',
              root: item.breakdown?.root || item.breakdown?.morphologyAnalysis || '',
              definition: item.definition || '',
              vietnamese: item.vietnamese || '',
              collocations: collocs,
              level: item.level || 2,
              contextSentence: item.contextSentence || ''
            };
          } else {
            if (!lexiconDict[key].contextSentence && item.contextSentence) {
              lexiconDict[key].contextSentence = item.contextSentence;
            }
          }
        });
      }
    } catch (e) {
      console.warn('[COMPILE WARN] Failed to merge vocabulary into lexicon-dictionary:', e.message);
    }
  }

  // 3. Ingest Rhetorical Figures into Lexicon Dictionary
  const rhetoricFile = path.join(CONTENT_DIR, 'vocabulary', 'rhetoric-figures.md');
  if (fs.existsSync(rhetoricFile)) {
    const content = fs.readFileSync(rhetoricFile, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('|') || trimmed.includes('Index') || trimmed.includes(':---')) return;
      const parts = trimmed.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 8) {
        const index = parseInt(parts[0], 10);
        const figure = parts[1].trim();
        const category = parts[2].trim();
        const etymology = parts[3].trim();
        const syntacticFormula = parts[4].trim();
        const classicalExemplar = parts[5].trim();
        const vietnamese = parts[6].trim();
        const key = figure.toLowerCase();

        if (!lexiconDict[key]) {
          lexiconDict[key] = {
            id: `rhetoric-${index}`,
            word: figure,
            ipa: '',
            pos: 'rhetorical device',
            partOfSpeech: 'rhetorical device',
            root: etymology,
            definition: `${category}: ${syntacticFormula}`,
            vietnamese: vietnamese,
            collocations: [figure, category],
            level: 3,
            contextSentence: classicalExemplar
          };
        }
      }
    });
  }

  const keys = Object.keys(lexiconDict);
  if (keys.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, 'lexicon-dictionary.json'), JSON.stringify(lexiconDict, null, 2), 'utf8');
    console.log(`[COMPILE] lexicon-dictionary.json: ${keys.length} entries indexed.`);
  }
}

// 3c. Master Rhetorical Figures Compiler (100 Entries)
function compileRhetoric() {
  const rhetoricFile = path.join(CONTENT_DIR, 'vocabulary', 'rhetoric-figures.md');
  if (!fs.existsSync(rhetoricFile)) return;
  const content = fs.readFileSync(rhetoricFile, 'utf8');
  const lines = content.split(/\r?\n/);
  const allRhetoric = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || trimmed.includes('Index') || trimmed.includes(':---')) return;
    const parts = trimmed.split('|').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 8) {
      const index = parseInt(parts[0], 10);
      const figure = parts[1].trim();
      const category = parts[2].trim();
      const etymology = parts[3].trim();
      const syntacticFormula = parts[4].trim();
      const classicalExemplar = parts[5].trim();
      const vietnamese = parts[6].trim();
      const executiveApplication = parts[7].trim();

      allRhetoric.push({
        id: `rhetoric-${index}`,
        index: index,
        figure: figure,
        category: category,
        etymology: etymology,
        syntacticFormula: syntacticFormula,
        classicalExemplar: classicalExemplar,
        vietnamese: vietnamese,
        executiveApplication: executiveApplication
      });
    }
  });

  if (allRhetoric.length > 0) {
    allRhetoric.sort((a, b) => a.index - b.index);
    fs.writeFileSync(path.join(DATA_DIR, 'rhetoric.json'), JSON.stringify(allRhetoric, null, 2), 'utf8');
    console.log(`[COMPILE] rhetoric.json: ${allRhetoric.length} rhetorical figures`);
  }
}

// 4. Drills Compiler (Speaking & Writing)
function compileDrills() {
  const dir = path.join(CONTENT_DIR, 'drills');
  if (!fs.existsSync(dir)) return;
  const drills = { speaking: [], writing: [], rubricSummary: {} };

  // speaking*.md / writing*.md: one file per level (e.g. speaking-prompts-a1.md)
  const drillFiles = prefix => fs.readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith('.md')).sort();

  for (const speakName of drillFiles('speaking')) {
    const speakFile = path.join(dir, speakName);
    const content = fs.readFileSync(speakFile, 'utf8').replace(/\r\n/g, '\n');
    content.split(/^##\s+/m).slice(1).forEach(sec => {
      const lines = sec.split(/\r?\n/);
      const title = lines[0].trim();
      const item = { title };
      lines.slice(1).forEach(l => {
        const m = l.match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
        if (m) {
          const key = m[1].trim();
          const val = m[2].trim();
          if (key === 'ID') item.id = val;
          else if (key === 'Index') item.index = parseInt(val, 10);
          else if (key === 'Mode') item.mode = val;
          else if (key === 'CEFR') item.cefrLevel = val;
          else if (key === 'Prompt') item.prompt = val;
          else if (key === 'Anchor') item.anchor = val;
          else if (key === 'Collocations') item.collocations = val;
          else if (key === 'Phonetic') item.phonetic = val;
        }
      });
      if (item.id && item.prompt) drills.speaking.push(item);
    });
  }

  for (const writeName of drillFiles('writing')) {
    const writeFile = path.join(dir, writeName);
    const content = fs.readFileSync(writeFile, 'utf8').replace(/\r\n/g, '\n');
    content.split(/^##\s+/m).slice(1).forEach(sec => {
      const lines = sec.split(/\r?\n/);
      const title = lines[0].trim();
      const item = { title, meal: {} };
      lines.slice(1).forEach(l => {
        const m = l.match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
        if (m) {
          const key = m[1].trim();
          const val = m[2].trim();
          if (key === 'ID') item.id = val;
          else if (key === 'Index') item.index = parseInt(val, 10);
          else if (key === 'Mode') item.mode = val;
          else if (key === 'CEFR') item.cefrLevel = val;
          else if (key === 'Question') item.question = val;
          else if (key === 'Register') item.register = val;
          else if (key === 'Master Sentence') item.masterSentence = val;
          else if (key === 'M') item.meal.m = val;
          else if (key === 'E') item.meal.e = val;
          else if (key === 'A') item.meal.a = val;
          else if (key === 'L') item.meal.l = val;
          else if (key === 'Stylistic') item.stylistic = val;
        }
      });
      if (item.id && item.question) drills.writing.push(item);
    });
  }

  // Parse Action-Oriented Communicative Scenarios (CEFR A1-C2)
  const scenarios = [];
  const scenarioFile = path.join(dir, 'communicative-scenarios.md');
  if (fs.existsSync(scenarioFile)) {
    const content = fs.readFileSync(scenarioFile, 'utf8').replace(/\r\n/g, '\n');
    content.split(/^##\s+/m).slice(1).forEach(sec => {
      const lines = sec.split(/\r?\n/);
      const title = lines[0].trim();
      const item = { title };
      lines.slice(1).forEach(l => {
        const m = l.match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
        if (m) {
          const key = m[1].trim();
          let val = m[2].trim();
          if (val.startsWith('`') && val.endsWith('`')) val = val.slice(1, -1);
          if (key === 'ID') item.id = val;
          else if (key === 'Index') item.index = parseInt(val, 10);
          else if (key === 'CEFR') item.cefrLevel = val;
          else if (key === 'Mode') item.mode = val;
          else if (key === 'Domain') item.domain = val;
          else if (key === 'Can-Do') item.canDo = val;
          else if (key === 'Interlocutor') item.interlocutor = val;
          else if (key === 'Context') item.context = val;
          else if (key === 'Friction') item.friction = val;
          else if (key === 'Outcome') item.outcome = val;
          else if (key === 'Time Condition') item.timeCondition = val;
          else if (key === 'Scaffold') item.scaffold = val;
          else if (key === 'Vietnamese') item.vietnamese = val;
        }
      });
      if (item.id && item.canDo) scenarios.push(item);
    });
  }
  if (scenarios.length > 0) {
    drills.scenarios = scenarios;
    drills.communicativeScenarios = scenarios;
  }

  // Preserve existing rubricSummary if present
  const existingPath = path.join(DATA_DIR, 'drills.json');
  if (fs.existsSync(existingPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
      drills.rubricSummary = prev.rubricSummary || {};
    } catch (e) {}
  }

  if (drills.speaking.length > 0 || drills.writing.length > 0 || (drills.scenarios && drills.scenarios.length > 0)) {
    fs.writeFileSync(path.join(DATA_DIR, 'drills.json'), JSON.stringify(drills, null, 2), 'utf8');
    console.log(`[COMPILE] drills.json: ${drills.speaking.length} speaking, ${drills.writing.length} writing, ${drills.scenarios ? drills.scenarios.length : 0} scenarios`);
  }
}

// 5. Reading Compiler
function compileReading() {
  const dir = path.join(CONTENT_DIR, 'reading');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  if (files.length === 0) return;
  const readingData = {
    title: "Intensive Reading & Contextual Sentence Mining Dossier",
    pedagogy: "4-Pass Intensive Deconstruction & i+1 Spaced Repetition Mining",
    articles: []
  };

  files.forEach(file => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\r\n/g, '\n');
    const { meta, body } = parseFrontmatter(raw);
    
    // Extract passage
    const passageMatch = body.match(/#\s+Passage\r?\n([\s\S]*?)(?=\r?\n##\s+|$)/);
    const content = passageMatch ? passageMatch[1].trim() : '';

    const article = {
      ...meta,
      content,
      fourPassProtocol: {
        pass1ColdRead: { thesisGist: '', markedLexicalTargets: [], comprehensionChecks: [] },
        pass2SyntaxDissection: [],
        pass3SentenceMining: []
      }
    };

    // Extract Cold Read
    const coldMatch = body.match(/##\s+Cold Read\r?\n([\s\S]*?)(?=\r?\n##\s+Syntax|$)/);
    if (coldMatch) {
      const cBody = coldMatch[1];
      const thesisM = cBody.match(/-\s+\*\*Thesis\*\*:\s*(.*)/);
      if (thesisM) article.fourPassProtocol.pass1ColdRead.thesisGist = thesisM[1].trim();
      const targetsM = cBody.match(/-\s+\*\*Targets\*\*:\s*(.*)/);
      if (targetsM) {
        article.fourPassProtocol.pass1ColdRead.markedLexicalTargets = targetsM[1].split(',').map(s => s.trim());
      }
      const qMatches = [...cBody.matchAll(/-\s+Q:\s*(.*?)\r?\n\s+A:\s*(.*?)(?=\r?\n-\s+Q:|$)/gs)];
      qMatches.forEach(qm => {
        article.fourPassProtocol.pass1ColdRead.comprehensionChecks.push({
          question: qm[1].trim(),
          answer: qm[2].trim()
        });
      });
    }

    // Extract Syntax Dissection
    const syntaxMatch = body.match(/##\s+Syntax Dissection\r?\n([\s\S]*?)(?=\r?\n##\s+Sentence Mining|$)/);
    if (syntaxMatch) {
      const sBody = syntaxMatch[1];
      const sentences = sBody.split(/###\s+Sentence\s+\d+/).slice(1);
      sentences.forEach((sText, idx) => {
        const sObj = {
          sentenceIndex: idx + 1,
          sentence: '',
          coreSVO: { subject: '', verb: '', objectOrComplement: '' },
          subordinateClauses: [],
          syntacticAnalysis: ''
        };
        const sm = sText.match(/-\s+\*\*Sentence\*\*:\s*(.*)/);
        if (sm) sObj.sentence = sm[1].trim();
        const subjM = sText.match(/-\s+\*\*Subject\*\*:\s*(.*)/);
        if (subjM) sObj.coreSVO.subject = subjM[1].trim();
        const verbM = sText.match(/-\s+\*\*Verb\*\*:\s*(.*)/);
        if (verbM) sObj.coreSVO.verb = verbM[1].trim();
        const objM = sText.match(/-\s+\*\*Object\*\*:\s*(.*)/);
        if (objM) sObj.coreSVO.objectOrComplement = objM[1].trim();
        const anaM = sText.match(/-\s+\*\*Analysis\*\*:\s*(.*)/);
        if (anaM) sObj.syntacticAnalysis = anaM[1].trim();

        // Subordinate clauses
        const clauseMatches = [...sText.matchAll(/-\s+\[(.*?)\]:\s*(.*?)\s+\|\s*(.*)/g)];
        clauseMatches.forEach(cm => {
          sObj.subordinateClauses.push({
            type: cm[1].trim(),
            clause: cm[2].trim(),
            function: cm[3].trim()
          });
        });
        if (sObj.sentence) article.fourPassProtocol.pass2SyntaxDissection.push(sObj);
      });
    }

    // Extract Sentence Mining
    const mineMatch = body.match(/##\s+Sentence Mining\r?\n([\s\S]*?)(?=\r?\n##\s+Synthesis|$)/);
    if (mineMatch) {
      const mBody = mineMatch[1];
      const cards = mBody.split(/###\s+/).slice(1);
      cards.forEach((cText, idx) => {
        const lines = cText.split(/\r?\n/);
        const targetWord = lines[0].trim();
        const cObj = {
          id: `mine-${article.id || 'art'}-${idx + 1}`,
          targetWord,
          partOfSpeech: '',
          ipa: '',
          definition: '',
          vietnamese: '',
          contextSentence: '',
          collocations: [],
          etymology: ''
        };
        lines.slice(1).forEach(l => {
          const m = l.match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
          if (m) {
            const key = m[1].trim();
            const val = m[2].trim();
            if (key === 'Part of Speech') cObj.partOfSpeech = val;
            else if (key === 'IPA') cObj.ipa = val;
            else if (key === 'Definition') cObj.definition = val;
            else if (key === 'Vietnamese') cObj.vietnamese = val;
            else if (key === 'Context') cObj.contextSentence = val;
            else if (key === 'Collocations') cObj.collocations = val.split(',').map(s => s.trim());
            else if (key === 'Etymology') cObj.etymology = val;
          }
        });
        if (cObj.targetWord && cObj.definition) article.fourPassProtocol.pass3SentenceMining.push(cObj);
      });
    }

    // Extract Synthesis (Pass 4)
    const synthMatch = body.match(/##\s+Synthesis\r?\n([\s\S]*)$/);
    if (synthMatch) {
      const sText = synthMatch[1];
      const synth = { modelPrécis: '', incorporatedVocabulary: [], syntacticReconstruction: '' };
      const pM = sText.match(/-\s+\*\*(?:Model Précis|Model Precis)\*\*:\s*(.*)/);
      if (pM) synth.modelPrécis = pM[1].trim();
      const vM = sText.match(/-\s+\*\*Incorporated Vocabulary\*\*:\s*(.*)/);
      if (vM) synth.incorporatedVocabulary = vM[1].split(',').map(s => s.trim());
      const rM = sText.match(/-\s+\*\*Syntactic Reconstruction\*\*:\s*(.*)/);
      if (rM) synth.syntacticReconstruction = rM[1].trim();
      article.fourPassProtocol.pass4Synthesis = synth;
    }

    readingData.articles.push(article);
  });

  if (readingData.articles.length > 0) {
    readingData.articles.sort((a, b) => a.id.localeCompare(b.id));
    fs.writeFileSync(path.join(DATA_DIR, 'reading.json'), JSON.stringify(readingData, null, 2), 'utf8');
    console.log(`[COMPILE] reading.json: ${readingData.articles.length} articles`);
  }
}

// 6. Listening & Habits Compilers
function compileListening() {
  const filePath = path.join(CONTENT_DIR, 'listening', 'phonetics-passages.md');
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const jsonMatch = raw.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  if (jsonMatch) {
    const data = JSON.parse(jsonMatch[1]);
    // Extra levels live in passages-*.md, each with a ```json block holding a samplePassages array
    const dir = path.join(CONTENT_DIR, 'listening');
    for (const f of fs.readdirSync(dir).filter(f => /^passages-.*\.md$/.test(f)).sort()) {
      const extra = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n').match(/```json\n([\s\S]*?)\n```/);
      if (extra) data.samplePassages.push(...JSON.parse(extra[1]).samplePassages);
    }
    fs.writeFileSync(path.join(DATA_DIR, 'listening.json'), JSON.stringify(data, null, 2), 'utf8');
    console.log(`[COMPILE] listening.json compiled.`);
  }
}

function compileHabits() {
  const filePath = path.join(CONTENT_DIR, 'habits', 'daily-plan.md');
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const jsonMatch = raw.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  if (jsonMatch) {
    const data = JSON.parse(jsonMatch[1]);
    fs.writeFileSync(path.join(DATA_DIR, 'habits.json'), JSON.stringify(data, null, 2), 'utf8');
    console.log(`[COMPILE] habits.json compiled.`);
  }
}

function compileDiagnostic() {
  const filePath = path.join(CONTENT_DIR, 'diagnostic', 'diagnostic-questions.md');
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const jsonMatch = raw.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  if (jsonMatch) {
    const data = JSON.parse(jsonMatch[1]);
    fs.writeFileSync(path.join(DATA_DIR, 'diagnostic-questions.json'), JSON.stringify(data, null, 2), 'utf8');
    console.log(`[COMPILE] diagnostic-questions.json: ${data.length} items`);
  }
}

// 8. CD-IELTS Mock Simulator & L2 Pragmatic Roleplays Compiler
function compileIelts() {
  const dir = path.join(CONTENT_DIR, 'ielts');
  if (!fs.existsSync(dir)) return;

  const ieltsData = {
    title: "Computer-Delivered IELTS Academic & General Training Mock Suite",
    standards: "IELTS 9-Band Descriptors (TR/TA, CC, LR, GRA) & CEFR 2020 Companion Volume",
    reading: null,
    listening: null,
    writing: null,
    speaking: null,
    pragmaticRoleplays: []
  };

  // 1. Reading (Full 40 Questions across 3 Passages)
  const readingFile = path.join(dir, 'academic-reading.md');
  if (fs.existsSync(readingFile)) {
    const raw = fs.readFileSync(readingFile, 'utf8').replace(/\r\n/g, '\n');
    const { meta, body } = parseFrontmatter(raw);

    const passageBlocks = body.split(/^# Reading Passage\s+/m).slice(1);
    const passages = [];
    const allReadingQuestions = [];

    passageBlocks.forEach((block, idx) => {
      const pNum = idx + 1;
      const firstLine = block.split('\n')[0].trim();
      const pTitle = firstLine.replace(/^\d+:\s*/, '').trim();

      const paragraphs = {};
      const paraMatches = block.matchAll(/### Paragraph ([A-H])\r?\n([\s\S]*?)(?=(### Paragraph|\r?\n---|\r?\n## Questions|$))/g);
      for (const m of paraMatches) {
        paragraphs[m[1]] = m[2].trim();
      }

      const questions = [];

      // Heading Matching (e.g. Q1-6)
      const headingMatches = block.matchAll(/- \*\*Question (\d+)\*\*:\s*Paragraph ([A-G]) -> `([a-z]+)`/g);
      for (const m of headingMatches) {
        questions.push({
          number: parseInt(m[1], 10),
          passage: pNum,
          type: 'HEADING_MATCHING',
          target: `Paragraph ${m[2]}`,
          key: m[3]
        });
      }

      // Matching Information (e.g. Q14-19)
      const matchInfoMatches = block.matchAll(/- \*\*Question (\d+)\*\*:\s*Paragraph ([A-G]) -> `([A-G])`\s*\(([^)]+)\)/g);
      for (const m of matchInfoMatches) {
        questions.push({
          number: parseInt(m[1], 10),
          passage: pNum,
          type: 'MATCHING_INFORMATION',
          key: m[3].trim(),
          info: m[4].trim()
        });
      }

      // True / False / Not Given & Yes / No / Not Given (e.g. Q7-10, Q27-31)
      const tfngMatches = block.matchAll(/- \*\*Question (\d+)\*\*:\s*([^\n\r]+)\r?\n\s*\*Key\*:\s*`([A-Z\s]+)`/g);
      for (const m of tfngMatches) {
        const statement = m[2].trim();
        const key = m[3].trim();
        const isYnng = /^(YES|NO|NOT GIVEN)$/.test(key) && (key === 'YES' || key === 'NO');
        questions.push({
          number: parseInt(m[1], 10),
          passage: pNum,
          type: isYnng ? 'YES_NO_NOT_GIVEN' : 'TRUE_FALSE_NOT_GIVEN',
          statement,
          key
        });
      }

      // Multiple Choice (e.g. Q20-22, Q37-40)
      const mcMatches = block.matchAll(/- \*\*Question (\d+)\*\*:\s*([^\n\r]+)(?:\r?\n\s+-[^\n\r]+)+\r?\n\s*\*Key\*:\s*`([A-D])`/g);
      for (const m of mcMatches) {
        questions.push({
          number: parseInt(m[1], 10),
          passage: pNum,
          type: 'MULTIPLE_CHOICE',
          question: m[2].trim(),
          key: m[3].trim()
        });
      }

      // Summary Completion (e.g. Q11-13)
      const summaryMatches = block.matchAll(/- \*\*Question (\d+)\*\*:\s*`([^`]+)`/g);
      for (const m of summaryMatches) {
        questions.push({
          number: parseInt(m[1], 10),
          passage: pNum,
          type: 'SUMMARY_COMPLETION',
          key: m[2].trim()
        });
      }

      // Sentence Completion (e.g. Q23-26, Q32-36)
      const sentenceMatches = block.matchAll(/- \*\*Question (\d+)\*\*:[^\n\r]*\r?\n\s*\*Key\*:\s*`([^`]+)`/g);
      for (const m of sentenceMatches) {
        questions.push({
          number: parseInt(m[1], 10),
          passage: pNum,
          type: 'SENTENCE_COMPLETION',
          key: m[2].trim()
        });
      }

      // Sort and deduplicate questions for this passage
      const uniqueQMap = new Map();
      questions.forEach(q => {
        if (!uniqueQMap.has(q.number)) {
          uniqueQMap.set(q.number, q);
        }
      });
      const sortedQ = Array.from(uniqueQMap.values()).sort((a, b) => a.number - b.number);

      passages.push({
        passageNumber: pNum,
        title: pTitle,
        paragraphs,
        questions: sortedQ
      });

      sortedQ.forEach(q => allReadingQuestions.push(q));
    });

    allReadingQuestions.sort((a, b) => a.number - b.number);

    const p1 = passages[0] || { title: "Passage 1", paragraphs: {}, questions: [] };

    ieltsData.reading = {
      meta,
      passageTitle: p1.title,
      paragraphs: p1.paragraphs,
      questions: p1.questions, // Exactly 13 questions for Passage 1 (preserving verify-cd-ielts)
      passages,
      allQuestions: allReadingQuestions,
      fullMockQuestions: allReadingQuestions,
      totalQuestions: allReadingQuestions.length
    };
  }

  // 2. Listening (Full 40 Questions across 4 Sections)
  const listeningFile = path.join(dir, 'listening-sections.md');
  if (fs.existsSync(listeningFile)) {
    const raw = fs.readFileSync(listeningFile, 'utf8').replace(/\r\n/g, '\n');
    const { meta, body } = parseFrontmatter(raw);

    const sectionBlocks = body.split(/^# Section\s+/m).slice(1);
    const sections = [];
    const allListeningQuestions = [];

    sectionBlocks.forEach((block, idx) => {
      const sNum = idx + 1;
      const firstLine = block.split('\n')[0].trim();
      const sTitle = firstLine.replace(/^\d+:\s*/, '').trim();

      const transcriptMatch = block.match(/### Audio Transcript\r?\n([\s\S]*?)(?=(---|\r?\n## Questions|$))/);
      const transcript = transcriptMatch ? transcriptMatch[1].trim() : '';

      const questions = [];

      // Q1-10 Form completion: - **Subscriber Name**: ... [Q1: 42 Bramblewood]
      const formMatches = block.matchAll(/- \*\*([^*]+)\*\*:\s*([^\n\r]*?)\[Q(\d+):\s*([^\]]+)\]/g);
      for (const m of formMatches) {
        questions.push({
          number: parseInt(m[3], 10),
          section: sNum,
          type: 'FORM_COMPLETION',
          prompt: m[1].trim(),
          prefix: m[2].trim(),
          key: m[4].trim()
        });
      }

      // Q11-15 & Q21-25 Multiple Choice
      const mcMatches = block.matchAll(/- \*\*Question (\d+)\*\*:\s*([^\n\r]+)[\s\S]*?\*Key\*:\s*`([A-C])`/g);
      for (const m of mcMatches) {
        questions.push({
          number: parseInt(m[1], 10),
          section: sNum,
          type: 'MULTIPLE_CHOICE',
          question: m[2].trim(),
          key: m[3].trim()
        });
      }

      // Q16-20 Map / Facility Matching
      const mapMatches = block.matchAll(/- \*\*Question (\d+)\*\*:\s*([^:]+):\s*`([A-E])`\s*\(([^)]+)\)/g);
      for (const m of mapMatches) {
        questions.push({
          number: parseInt(m[1], 10),
          section: sNum,
          type: 'MAP_MATCHING',
          locationPrompt: m[2].trim(),
          key: m[3].trim(),
          facility: m[4].trim()
        });
      }

      // Q26-30 Matching Protocols
      const protocolMatches = block.matchAll(/- \*\*Question (\d+)\*\*:\s*([^:]+)->\s*`([A-G])`/g);
      for (const m of protocolMatches) {
        questions.push({
          number: parseInt(m[1], 10),
          section: sNum,
          type: 'MATCHING',
          prompt: m[2].trim(),
          key: m[3].trim()
        });
      }

      // Q31-40 Note completion: - Traditional theory ... [Q31: thermosiphon]
      const noteMatches = block.matchAll(/- ([^\n\r]*?)\[Q(\d+):\s*([^\]]+)\]/g);
      for (const m of noteMatches) {
        if (!m[1].startsWith('**')) {
          questions.push({
            number: parseInt(m[2], 10),
            section: sNum,
            type: 'NOTE_COMPLETION',
            context: m[1].trim(),
            key: m[3].trim()
          });
        }
      }

      const uniqueQMap = new Map();
      questions.forEach(q => {
        if (!uniqueQMap.has(q.number)) {
          uniqueQMap.set(q.number, q);
        }
      });
      const sortedQ = Array.from(uniqueQMap.values()).sort((a, b) => a.number - b.number);

      sections.push({
        sectionNumber: sNum,
        title: sTitle,
        transcript,
        questions: sortedQ
      });

      sortedQ.forEach(q => allListeningQuestions.push(q));
    });

    allListeningQuestions.sort((a, b) => a.number - b.number);

    ieltsData.listening = {
      meta,
      sections,
      section1: sections[0] || { title: "Section 1", transcript: "", questions: [] },
      section2: sections[1] || { title: "Section 2", transcript: "", questions: [] },
      section3: sections[2] || { title: "Section 3", transcript: "", questions: [] },
      section4: sections[3] || { title: "Section 4", transcript: "", questions: [] },
      allQuestions: allListeningQuestions,
      fullMockQuestions: allListeningQuestions,
      totalQuestions: allListeningQuestions.length
    };
  }

  // 3. Writing (Tasks 1 & 2)
  const writingFile = path.join(dir, 'writing-tasks.md');
  if (fs.existsSync(writingFile)) {
    const raw = fs.readFileSync(writingFile, 'utf8').replace(/\r\n/g, '\n');
    const { meta, body } = parseFrontmatter(raw);

    const taskParts = body.split(/## Task 2:/);
    const task1Body = taskParts[0] || '';
    const task2Body = taskParts[1] || '';

    const svgMatch = task1Body.match(/```xml\r?\n([\s\S]*?)\r?\n```/);
    const task1ModelMatch = task1Body.match(/### Band 8\.5 Model Response[^\n]*\r?\n([\s\S]*?)(?=\r?\n---|\$)/);
    const band6Match = task2Body.match(/### Band 6\.0 Model Response[^\n]*\r?\n([\s\S]*?)(?=\r?\n#### Analytical)/);
    const band8Match = task2Body.match(/### Band 8\.5 Model Response[^\n]*\r?\n([\s\S]*?)$/);

    ieltsData.writing = {
      meta,
      task1: {
        title: "Renewable Electricity Generation (2010-2025)",
        chartSvg: svgMatch ? svgMatch[1].trim() : '',
        modelAnswer: task1ModelMatch ? task1ModelMatch[1].trim() : '',
        wordCount: 184
      },
      task2: {
        title: "Higher Education Funding Models (Tuition vs Free Access)",
        prompt: "Some people argue that tertiary education should be fully funded by the state for all citizens, while others contend that university students should pay tuition fees because higher education primarily benefits the individual. Discuss both views and give your own opinion.",
        band6Model: band6Match ? band6Match[1].trim() : '',
        band8Model: band8Match ? band8Match[1].trim() : '',
        critique: "Band 6 exhibits mechanical linkers and superficial arguments; Band 8 exhibits income-contingent graduate contribution synthesis, nuanced hedging, and complex subordination."
      }
    };
  }

  // 4. Speaking (Parts 1-3)
  const speakingFile = path.join(dir, 'speaking-cue-cards.md');
  if (fs.existsSync(speakingFile)) {
    const raw = fs.readFileSync(speakingFile, 'utf8').replace(/\r\n/g, '\n');
    const { meta, body } = parseFrontmatter(raw);
    const part2ModelMatch = body.match(/### Band 8\.5 Model Monologue[^\n]*\r?\n([\s\S]*?)(?=\r?\n---|\$)/);

    ieltsData.speaking = {
      meta,
      part1Topics: ["Academic Work & Daily Habits", "Urban Transportation & Public Spaces"],
      part2: {
        topic: "Describe a public initiative or community project that significantly improved your local area.",
        prepTimeSeconds: 60,
        modelMonologue: part2ModelMatch ? part2ModelMatch[1].trim() : ''
      },
      part3Theme: "Urban Regeneration, Civic Responsibility & Future Cities"
    };
  }

  // 5. Pragmatic Roleplays
  const roleplayFile = path.join(dir, 'pragmatic-roleplays.md');
  if (fs.existsSync(roleplayFile)) {
    const raw = fs.readFileSync(roleplayFile, 'utf8').replace(/\r\n/g, '\n');
    const sections = raw.split(/^##\s+/m).slice(1);
    sections.forEach(sec => {
      const lines = sec.split(/\r?\n/);
      const title = lines[0].trim();
      const item = { title, sieves: {} };

      lines.slice(1).forEach(l => {
        const m = l.match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
        if (m) {
          const key = m[1].trim();
          const val = m[2].trim();
          if (key === 'ID') item.id = val;
          else if (key === 'CEFR') item.cefrLevel = val;
          else if (key === 'Domain') item.domain = val;
          else if (key === 'Pragmatic Focus') item.pragmaticFocus = val;
          else if (key === 'Interlocutor') item.interlocutor = val;
          else if (key === 'Context') item.context = val;
          else if (key === 'Friction') item.friction = val;
          else if (key === 'Vietnamese Summary') item.vietnamese = val;
        }
      });

      const exchangeMatch = sec.match(/\*Interlocutor Challenge\*:\s*"([^"]+)"[\s\S]*?\*Candidate Model Response\*:\s*"([^"]+)"/);
      if (exchangeMatch) {
        item.exemplarExchange = {
          challenge: exchangeMatch[1].trim(),
          modelResponse: exchangeMatch[2].trim()
        };
      }

      const thesisSieve = sec.match(/\*Thesis Avoidance Sieve\*:\s*([^\n\r]+)/);
      const connectorSieve = sec.match(/\*Mechanical Connector Sieve\*:\s*([^\n\r]+)/);
      const clichéSieve = sec.match(/\*Thesaurus Clich[eé] Sieve\*:\s*([^\n\r]+)/);
      const codaSieve = sec.match(/\*Phonetic Coda Release\*:\s*([^\n\r]+)/);

      if (thesisSieve) item.sieves.thesisAvoidance = thesisSieve[1].trim();
      if (connectorSieve) item.sieves.mechanicalConnectors = connectorSieve[1].trim();
      if (clichéSieve) item.sieves.thesaurusClichés = clichéSieve[1].trim();
      if (codaSieve) item.sieves.phoneticCoda = codaSieve[1].trim();

      if (item.id) ieltsData.pragmaticRoleplays.push(item);
    });
  }

  const IELTS_DATA_DIR = path.join(__dirname, '..', 'src', 'ielts', 'data');
  if (!fs.existsSync(IELTS_DATA_DIR)) {
    fs.mkdirSync(IELTS_DATA_DIR, { recursive: true });
  }

  const mockData = {
    title: "Computer-Delivered IELTS Academic 40-Question Mock Test Suite",
    standards: ieltsData.standards,
    reading: {
      passages: ieltsData.reading ? ieltsData.reading.passages : [],
      questions: ieltsData.reading ? ieltsData.reading.allQuestions : [],
      totalQuestions: ieltsData.reading ? ieltsData.reading.allQuestions.length : 0
    },
    listening: {
      sections: ieltsData.listening ? ieltsData.listening.sections : [],
      questions: ieltsData.listening ? ieltsData.listening.allQuestions : [],
      totalQuestions: ieltsData.listening ? ieltsData.listening.allQuestions.length : 0
    }
  };

  fs.writeFileSync(path.join(DATA_DIR, 'ielts.json'), JSON.stringify(ieltsData, null, 2), 'utf8');
  fs.writeFileSync(path.join(IELTS_DATA_DIR, 'ielts-mock.json'), JSON.stringify(mockData, null, 2), 'utf8');
  fs.writeFileSync(path.join(DATA_DIR, 'ielts-mock.json'), JSON.stringify(mockData, null, 2), 'utf8');

  console.log(`[COMPILE] ielts.json & ielts-mock.json: Reading (${ieltsData.reading?.allQuestions?.length || 0} Qs in ${ieltsData.reading?.passages?.length || 0} Passages), Listening (${ieltsData.listening?.allQuestions?.length || 0} Qs in ${ieltsData.listening?.sections?.length || 0} Sections), Writing Tasks, Speaking Parts, and ${ieltsData.pragmaticRoleplays.length} Pragmatic Roleplays.`);
}

function compileIeltsCourse() {
  const IELTS_DATA_DIR = path.join(__dirname, "..", "src", "ielts", "data");
  const courseDir = path.join(CONTENT_DIR, 'ielts', 'course');
  if (!fs.existsSync(courseDir)) {
    console.warn('[WARN] IELTS course content directory missing:', courseDir);
    return;
  }

  if (!fs.existsSync(IELTS_DATA_DIR)) {
    fs.mkdirSync(IELTS_DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const start = Date.now();

  // Read the 7 markdown course files
  const readMd = (filename) => {
    const fullPath = path.join(courseDir, filename);
    return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n') : '';
  };

  const md01 = readMd('01-diagnostics-foundations.md');
  const md02 = readMd('02-listening-tactics.md');
  const md03 = readMd('03-reading-14-types.md');
  const md04 = readMd('04-cbt-navigation.md');
  const md05 = readMd('05-writing-task1-formulas.md');
  const md06 = readMd('06-writing-task2-architectures.md');
  const md07 = readMd('07-speaking-mastery.md');

  // 1. Parse Diagnostics (01-diagnostics-foundations.md)
  const diagnostics = [];
  const qBlocks = md01.split(/#### Question \d+/).slice(1);
  qBlocks.forEach((b, i) => {
    const idM = b.match(/- \*\*ID\*\*:\s*`([^`]+)`/);
    const catM = b.match(/- \*\*Category\*\*:\s*`([^`]+)`/);
    const subM = b.match(/- \*\*SubType\*\*:\s*`([^`]+)`/);
    const promptM = b.match(/- \*\*Prompt\*\*:\s*"([^"]+)"/);
    const correctM = b.match(/- \*\*Correct\*\*:\s*(\d+)/);
    const expM = b.match(/- \*\*Explanation\*\*:\s*([^\n\r]+)/);
    const impactM = b.match(/- \*\*Impact on Band\*\*:\s*([^\n\r]+)/);
    const optLines = b.match(/- [A-D]\)\s*([^\n\r]+)/g) || [];
    const options = optLines.map(o => o.replace(/^- [A-D]\)\s*/, '').trim());

    diagnostics.push({
      id: idM ? idM[1] : `diag-${String(i + 1).padStart(2, '0')}`,
      category: catM ? catM[1] : 'grammar',
      subType: subM ? subM[1] : 'tenses',
      prompt: promptM ? promptM[1] : '',
      options,
      correctIndex: correctM ? parseInt(correctM[1], 10) : 0,
      explanation: expM ? expM[1].trim() : '',
      impactOnBand: impactM ? impactM[1].trim() : ''
    });
  });

  // 2. Parse Reading 14 Question Types & Synonyms (03-reading-14-types.md)
  const questionTypes = [];
  const qtBlocks = md03.split(/### (\d+)\.\s+([^\n\r]+)/).slice(1);
  for (let i = 0; i < qtBlocks.length; i += 3) {
    const num = qtBlocks[i];
    const name = qtBlocks[i + 1].trim();
    const body = qtBlocks[i + 2] || '';

    const objM = body.match(/- \*\*Objective\*\*:\s*([^\n\r]+)/);
    const algoM = body.match(/- \*\*Algorithm\*\*:([\s\S]*?)(?=- \*\*Traps\*\*|\n\n---|\n## |$)/);
    const trapsM = body.match(/- \*\*Traps\*\*:([\s\S]*?)(?=\n\n---|\n## |$)/);

    const algorithm = algoM ? algoM[1].split(/\n/).map(l => l.replace(/^\s*\d+\.\s*/, '').trim()).filter(Boolean) : [];
    const traps = trapsM ? trapsM[1].split(/\n/).map(l => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean) : [];

    questionTypes.push({
      id: `reading-type-${num}`,
      name,
      number: parseInt(num, 10),
      skill: 'Reading',
      sectionRef: 'Sec 15: The 14 Question Types',
      objective: objM ? objM[1].trim() : '',
      algorithm,
      traps
    });
  }

  // Parse Master Exam Synonym Mapping Matrix
  const synSec = md03.split('### Master Exam Synonym Mapping Matrix')[1]?.split('## ')[0] || '';
  const tableLines = synSec.split(/\n/).filter(l => l.trim().startsWith('|') && !l.includes('Question Stem Word') && !l.includes(':---'));
  const masterSynonyms = tableLines.map(l => {
    const parts = l.split('|').map(p => p.trim().replace(/\*/g, '')).filter(Boolean);
    return {
      promptWord: parts[0] || '',
      passageWord: parts[1] || '',
      context: parts[2] || ''
    };
  }).filter(p => p.promptWord && p.passageWord && !p.promptWord.includes('---'));

  // 3. Parse Listening Traps (02-listening-tactics.md)
  const listeningTraps = {
    qualifiers: {
      description: "Audio employs probabilistic nuances while distractors assert absolute qualifiers.",
      words: ['always', 'never', 'only', 'all', 'solely', 'entirely', 'impossible'],
      rule: "Eliminate options containing absolute claims unless the audio explicitly states an uncompromising absolute."
    },
    negativeReversals: {
      description: "Speaker utters information matching an option, then negates it via adversative conjunction.",
      connectors: ['however', 'but', 'on the contrary', 'instead', 'in fact', 'although', 'despite'],
      rule: "Withhold judgment on early matched keywords until the clause boundary passes."
    },
    selfCorrections: {
      description: "Speaker utters a plausible answer, hesitates, and corrects themselves in natural speech.",
      phrases: ['no, wait, actually', 'sorry, I meant', 'rather, what we decided was', 'let me check', 'actually'],
      rule: "The information stated after the self-correction marker is always the intended answer."
    }
  };

  // 4. Parse Writing Formulas (05-writing-task1-formulas.md & 06-writing-task2-architectures.md)
  const writingFormulas = {
    task1OverviewRule: {
      rule: "The Keino Campbell 2-Sentence Overview Formula",
      components: [
        "Sentence 1: Describe the overall dominant trend, trajectory, or overarching pattern without numerical values.",
        "Sentence 2: Identify the most prominent contrast, outlier, or extreme divergence without numerical values."
      ],
      examples: [
        "Overall, while renewable energy sources witnessed substantial growth over the projected timeline, reliance on fossil fuels exhibited a corresponding contraction. Notably, solar power emerged as the primary contributor by the terminus of the period, whereas coal experienced the most precipitous downturn."
      ]
    },
    task1Types: [
      {
        type: "Line Graph",
        groupingRule: "Group lines by trajectory: Body 1 for growth/surges, Body 2 for declines/stagnation.",
        lexicalToolkit: {
          surges: ["surged dramatically", "rocketed", "escalated precipitously"],
          declines: ["plunged", "plummeted", "contracted significantly", "touched a trough"],
          plateaus: ["levelled off at", "stabilized at", "maintained a steady plateau"]
        }
      },
      {
        type: "Bar Chart",
        groupingRule: "If dynamic: group by trajectory over time. If static: group by magnitude (highest tier vs lowest tier).",
        lexicalToolkit: {
          comparatives: ["stood at nearly double that of", "dwarfed the figures for", "outstripped"]
        }
      },
      {
        type: "Pie Chart",
        groupingRule: "Group dominant slices across charts in Body 1, and minor or declining segments in Body 2.",
        lexicalToolkit: {
          proportions: ["accounted for", "constituted", "comprised", "represented a dominant share of", "made up a negligible fraction"]
        }
      },
      {
        type: "Table",
        groupingRule: "Select 4-6 prominent peaks, troughs, and significant percentage changes: Body 1 for peaks/gains, Body 2 for lowest/outliers.",
        lexicalToolkit: {
          rankings: ["occupied the foremost position", "at the opposite end of the spectrum", "registered marginal variation"]
        }
      },
      {
        type: "Process Diagram",
        groupingRule: "Follow chronological stages: Body 1 covers initial extraction to transformation, Body 2 covers refinement to distribution.",
        lexicalToolkit: {
          connectors: ["initially", "subsequently", "the ensuing phase involves", "culminates in"]
        }
      },
      {
        type: "Map / Layout",
        groupingRule: "Group by spatial zones or before/after transformation: Body 1 for north/east developments, Body 2 for south/west alterations.",
        lexicalToolkit: {
          transformations: ["was demolished to make way for", "underwent extensive redevelopment", "was repurposed into"]
        }
      }
    ],
    task2ParagraphFormula: {
      sentences: [
        { number: 1, name: "Topic Sentence", purpose: "State the single controlling idea clearly and assertively.", linkers: ["first and foremost", "the primary justification for", "one compelling factor is"] },
        { number: 2, name: "Explanation Sentence", purpose: "Explain why and how the topic sentence is true using causal logic.", linkers: ["this is because", "owing to the reality that", "the mechanism underlying this is"] },
        { number: 3, name: "Evidence Sentence", purpose: "Provide a concrete empirical case, study, or exemplar.", linkers: ["for instance", "to illustrate", "a prominent case in point is", "specifically"] },
        { number: 4, name: "Impact / Concluding Sentence", purpose: "Synthesize the causal chain and demonstrate the broader consequence linked to the thesis.", linkers: ["consequently", "thus", "as a direct corollary", "it therefore follows that"] }
      ],
      example: {
        topic: "The implementation of congestion pricing in metropolitan centers provides a direct economic incentive for commuters to transition to public mass transit.",
        explanation: "This is attributable to the fact that when private vehicle operation incurs escalating marginal costs, rational commuters proactively substitute automobile travel with rapid bus or subterranean rail alternatives.",
        evidence: "A salient illustration of this phenomenon is London's central congestion zone, which yielded an immediate 15% reduction in private traffic flow alongside a corresponding 30% surge in transit ridership within its inaugural year of enactment.",
        impact: "Consequently, targeted fiscal disincentives not only alleviate urban gridlock but also generate indispensable municipal revenue for municipal infrastructure modernizations."
      }
    },
    task2Architectures: [
      { name: "Opinion (Agree or Disagree)", structure: ["Introduction (Paraphrase + Clear Stance)", "Body 1 (Primary Supporting Argument)", "Body 2 (Secondary Supporting Argument or Rebuttal)", "Conclusion (Restated Stance + Synthesis)"], whenToUse: "Prompt asks 'To what extent do you agree or disagree?' or 'What is your opinion?'" },
      { name: "Discussion (Discuss Both Views and Give Opinion)", structure: ["Introduction (Paraphrase + Stance)", "Body 1 (View A Examination & Limitations)", "Body 2 (View B Examination & Endorsement)", "Conclusion (Balanced Synthesis + Final Stance)"], whenToUse: "Prompt asks 'Discuss both views and give your opinion.'" },
      { name: "Advantages vs. Disadvantages (Weighing Stance)", structure: ["Introduction (Paraphrase + Weighing Thesis)", "Body 1 (Lesser Impact Side)", "Body 2 (Dominant Impact Side - The Decisive Weight)", "Conclusion (Definitive Statement on Which Side Outweighs)"], whenToUse: "Prompt asks 'Do the advantages outweigh the disadvantages?'" },
      { name: "Problem-Solution / Cause-Solution", structure: ["Introduction (Paraphrase + Dual Focus)", "Body 1 (Underlying Root Causes/Problems)", "Body 2 (Targeted Pragmatic Solutions)", "Conclusion (Summary of Root Causes & Remedial Outlook)"], whenToUse: "Prompt asks 'What are the causes and what solutions can be offered?'" },
      { name: "Two-Part / Double Direct Question", structure: ["Introduction (Paraphrase + Address Both Prompts)", "Body 1 (Comprehensive Analysis of Question 1)", "Body 2 (Comprehensive Analysis of Question 2)", "Conclusion (Unified Synthesis Addressing Both Questions)"], whenToUse: "Prompt contains two distinct related questions." }
    ]
  };

  // 5. Parse Speaking Models (07-speaking-mastery.md)
  const speakingModels = [
    {
      part: 1,
      topic: "Hometown & Local Infrastructure",
      prompt: "What is your hometown like?",
      band65: {
        transcript: "My hometown is quite big. It has many shops, supermarkets, and tall apartments. The traffic is usually very crowded during rush hours, so I don't like driving there.",
        commentary: {
          FC: "Speech is continuous but relies heavily on simple coordinate linkers (and, so).",
          LR: "Adequate vocabulary (shops, supermarkets, tall apartments) but lacks nuanced collocations.",
          GRA: "Accurate simple sentences; basic subordinate clause with 'so' and 'because'.",
          PR: "Generally clear pronunciation, but limited intonation variance."
        }
      },
      band75: {
        transcript: "My hometown is a vibrant, coastal metropolis undergoing rapid urban modernization. While it boasts exceptional public transit infrastructure, escalating population density has exacerbated rush-hour congestion.",
        commentary: {
          FC: "Speaks fluently with flexible discourse markers and minimal hesitation.",
          LR: "Uses less common and idiomatic vocabulary (vibrant, coastal metropolis, exacerbated).",
          GRA: "Employs complex structures including concessive clauses (while it boasts...).",
          PR: "Displays a wide range of pronunciation features with natural rhythm and stress."
        }
      },
      band85: {
        transcript: "I hail from a bustling maritime commercial hub that has undergone substantial architectural rejuvenation over the past decade. Although the proliferation of green corridors has mitigated urban heat islands, the city's thoroughfares remain chronically congested during peak commuting hours.",
        commentary: {
          FC: "Speaks effortlessly with natural colloquial flow, rhythm, and native-level cohesion.",
          LR: "Extensive, highly sophisticated academic lexical control (architectural rejuvenation, mitigated urban heat islands, chronically congested).",
          GRA: "Effortless syntactic versatility with varied complex structures and zero systematic errors.",
          PR: "Full flexibility and precision in stress, intonation, and phonological chunking."
        }
      }
    },
    {
      part: 2,
      topic: "A Pivotal Life Decision",
      prompt: "Describe an important decision you made that changed your life.",
      band65: {
        transcript: "Well, I want to talk about when I decided to change my university major two years ago. At first I studied accounting, but I really disliked it. It was boring. So I decided to switch to computer science. It was very difficult because my parents did not agree with me. They said accounting is more stable. I felt very nervous and worried about my future. But I worked very hard and studied programming every night. Now, I have graduated and I got a good job in an IT company with high salary. So I think it was a good decision because I am happy now.",
        commentary: {
          FC: "Smooth delivery, but relies on simple linkers (so, but, because).",
          LR: "Repetitive, basic vocabulary (disliked, boring, good job, high salary, happy).",
          GRA: "High accuracy in simple sentences, but limited clausal subordinations and lack of conditionals.",
          PR: "Clear, but flat sentence intonation and lack of emotional emphasis."
        }
      },
      band75: {
        transcript: "I'd like to share an experience regarding a pivotal crossroads I faced during my undergraduate studies, specifically the decision to switch majors from finance to software engineering. Initially, I followed familial expectations, but I soon realized finance lacked creative problem-solving. Confronting parental reservations proved daunting, yet by methodically presenting employment analytics, I convinced them to support my pivot. Looking back, that transition not only ignited my professional passion but also instilled a profound sense of self-efficacy.",
        commentary: {
          FC: "Maintains coherent narrative flow across 2 full minutes with natural discourse markers.",
          LR: "Resourceful lexical repertoire (pivotal crossroads, familial expectations, daunting, pivot, self-efficacy).",
          GRA: "Consistent use of complex sentences, participial phrases, and concessive constructions.",
          PR: "Natural rhythmic chunking, emphatic stress on key turning points, clear intonation."
        }
      },
      band85: {
        transcript: "I would like to reflect on a watershed moment during my sophomore year: the deliberate decision to abandon a conventional trajectory in actuarial science in order to pursue computational linguistics. Having recognized that rote financial modelling failed to engage my intellectual curiosities, I felt compelled to pivot, despite palpable skepticism from mentors who cautioned against such an abrupt departure. What cemented my resolve was the realization that cognitive growth demands intellectual risk. Ultimately, this realignment not only catalyzed my academic fulfillment but also positioned me at the vanguard of natural language processing.",
        commentary: {
          FC: "Effortless monologue with sophisticated clausal integration and native-like expressive cadence.",
          LR: "Exceptional lexical precision (watershed moment, actuarial science, palpable skepticism, cemented my resolve, vanguard).",
          GRA: "Masterful command of parenthetical clauses, fronted participial modifiers, and passive modals.",
          PR: "Subtle phonological nuance, perfect thought group segmentation, and expressive tonic stress."
        }
      }
    },
    {
      part: 3,
      topic: "Societal Decision-Making & Technology",
      prompt: "How does technology influence the choices individuals make in modern society?",
      band65: {
        transcript: "I think technology has a big impact on people's decisions today. For example, people use smart phones to choose restaurants or book hotels based on online reviews. Also, algorithms show people news that they like. However, sometimes people make bad decisions because of fake information on social media.",
        commentary: {
          FC: "Addresses the topic directly, but arguments are briefly developed.",
          LR: "Everyday vocabulary (big impact, smart phones, online reviews, fake information).",
          GRA: "Accurate basic grammar, but lacks advanced clausal embedding and speculative modals.",
          PR: "Clear pronunciation with minor phonological hesitation."
        }
      },
      band75: {
        transcript: "Technology indisputably exerts a pervasive influence on individual autonomy and consumer behavior. Algorithmic recommendation systems frequently curate information streams, effectively nudging consumers toward predetermined choices. Furthermore, while crowd-sourced rating platforms democratize decision-making, they also engender cognitive echo chambers where confirmation bias overrides critical discernment.",
        commentary: {
          FC: "Develops abstract arguments smoothly with sophisticated logical transitions.",
          LR: "Broad academic repertoire (pervasive influence, individual autonomy, curate, democratize, echo chambers, confirmation bias).",
          GRA: "Flexible clausal structures including concessive contrast and adverbial subordination.",
          PR: "Controlled intonation contours that effectively emphasize contrasting arguments."
        }
      },
      band85: {
        transcript: "From an anthropological and sociological vantage point, technological ubiquity has fundamentally transformed human volition. Predictive algorithms no longer merely assist decision-making; they proactively sculpt preferences by filtering the choice architectures presented to end users. Consequently, while individuals perceive their selections as manifestations of free will, they are frequently navigating subtle algorithmic nudges that serve commercial optimization at the expense of serendipitous exploration.",
        commentary: {
          FC: "Effortlessly articulates complex philosophical concepts with nuanced cohesion and zero cognitive strain.",
          LR: "Rare, domain-appropriate academic phrasing (anthropological vantage point, human volition, choice architectures, serendipitous exploration).",
          GRA: "Flawless syntactical variety with parenthetical clauses, fronted prepositional phrases, and balanced antitheses.",
          PR: "Impeccable prosody with pitch variation and phrasing that enhances rhetorical persuasiveness."
        }
      }
    }
  ];

  // 6. Build Master Strategy Cards (35+ cards across all skills)
  const strategyCards = [
    // CBT Navigation
    {
      id: "cbt-shortcuts-ergonomics",
      skill: "CBT Navigation",
      title: "Split-Screen Resizing & Interface Ergonomics",
      sectionRef: "Sec 23: CBT Interface Navigation & Exam Logistics",
      tips: [
        "Drag the central split-screen resizer immediately when a passage opens to establish a 55/45 reading-to-questions ratio.",
        "Adjust interface font size via the Settings tab (Standard, Large, Extra Large) and verify color scheme contrast (Standard, Black on Yellow, Yellow on Black).",
        "Keep hands on keyboard home row for fast input; avoid unnecessary mouse-clicking during sentence completion."
      ],
      traps: [
        "Do not leave split ratio at 50/50 for wide tables or map diagrams where question prompts become truncated."
      ],
      formula: "Split-Screen: 55% passage / 45% question pane; Hotkey focus navigation"
    },
    {
      id: "cbt-highlighting-notes",
      skill: "CBT Navigation",
      title: "Right-Click Highlighting & On-Screen Annotation",
      sectionRef: "Sec 23: CBT Interface Navigation & Exam Logistics",
      tips: [
        "Highlight key nouns, dates, and proper names in the passage using right-click -> Highlight.",
        "Use right-click -> Note on paragraph headers to record your 2-3 word topic summary for Matching Headings.",
        "Review highlighted anchors when checking back during remaining test time."
      ],
      traps: [
        "Over-highlighting: highlighting more than 20% of a paragraph creates cognitive clutter and slows down scanning."
      ]
    },
    {
      id: "cbt-scratchpad-discipline",
      skill: "CBT Navigation",
      title: "Physical Scratchpad Discipline & Word Count Clocks",
      sectionRef: "Sec 23: CBT Interface Navigation & Exam Logistics",
      tips: [
        "Utilize the official physical pencil and paper scratchpad provided at your desk to outline Task 2 arguments in 3-5 minutes.",
        "Monitor the real-time on-screen word counter for Writing Tasks: stop drafting when Task 1 reaches 170-190 words and Task 2 reaches 270-300 words.",
        "Leave 5 full minutes at the end of Writing to run the Pre-Flight Editing Checklist."
      ],
      traps: [
        "Typing directly without scratchpad outlining leads to fragmented, wandering paragraph logic."
      ]
    },
    {
      id: "cbt-one-skill-retake",
      skill: "CBT Navigation",
      title: "One Skill Retake (OSR) Strategic Blueprint",
      sectionRef: "Sec 23: CBT Interface Navigation & Exam Logistics",
      tips: [
        "One Skill Retake is available exclusively to computer-delivered candidates within 60 days of the primary test sitting.",
        "Verify receiving university or immigration department policy regarding acceptance of OSR Test Report Forms.",
        "Prepare intensively for the single targeted skill without diluting practice across the other three skills."
      ],
      traps: [
        "Retaking without targeted error remediation: retakes without structural adjustments statistically yield identical band scores."
      ]
    },

    // Listening
    {
      id: "listening-sec1-social",
      skill: "Listening",
      title: "Section 1 Social Dialogue & Form Completion",
      sectionRef: "Sec 5: Listening Section 1 (Part 1) Strategy",
      tips: [
        "Read question prompts during the 30-second prep window and pre-determine the expected lexical category (surname, street address, postal code, currency amount, arrival date).",
        "Listen closely for double-letter pronunciations (e.g. 'double L') and alphanumeric phonetic codes.",
        "Write answers immediately as they are uttered; do not wait until the recording ends."
      ],
      traps: [
        "Early state distractor: speakers frequently state an initial contact number or date and immediately revise it ('No, wait, my mobile is...')."
      ]
    },
    {
      id: "listening-sec2-maps",
      skill: "Listening",
      title: "Section 2 Map & Plan Labelling Navigation",
      sectionRef: "Sec 6: Listening Section 2 (Part 2) Strategy",
      tips: [
        "Orient yourself immediately by locating the starting reference point ('You are here' or 'Main Entrance') before the audio starts.",
        "Track spatial compass markers (north, south-east) and clockwise/counter-clockwise movement vectors.",
        "Keep your cursor or pencil point moving along the paths as the speaker guides the tour."
      ],
      traps: [
        "Failing to track perspective changes when the speaker enters a courtyard or turns left/right."
      ]
    },
    {
      id: "listening-sec3-academic-dialogue",
      skill: "Listening",
      title: "Section 3 Multi-Speaker Academic Discussion",
      sectionRef: "Sec 7: Listening Section 3 (Part 3) Strategy",
      tips: [
        "Identify the speakers (e.g. tutor vs student, male vs female) during the initial conversational introduction.",
        "Focus on agreement and disagreement markers ('I wouldn't go that far', 'You have a point, but...').",
        "Track whose opinion the question prompt specifically targets (e.g. 'What does Jack think about...')."
      ],
      traps: [
        "Attributing a view expressed by one student to the other student or the professor."
      ]
    },
    {
      id: "listening-sec4-lecture",
      skill: "Listening",
      title: "Section 4 Academic Lecture & Macro Signposting",
      sectionRef: "Sec 8: Listening Section 4 (Part 4) Strategy",
      tips: [
        "Note that Section 4 runs continuously for 10 questions without an intermediate pause; use the full initial preparation time to skim all 10 items.",
        "Listen for macro-signpost connectors: 'Moving on to...', 'Turning our attention to...', 'The fundamental cause is...'.",
        "Strictly obey the word count ceiling (e.g. 'NO MORE THAN ONE WORD AND/OR A NUMBER')."
      ],
      traps: [
        "Adding extraneous articles or prepositions that violate the stated word count limit."
      ]
    },
    {
      id: "listening-mcq-distractors",
      skill: "Listening",
      title: "Multiple Choice 3 Distractor Classes & Elimination",
      sectionRef: "Sec 9: Multiple Choice Question Strategy Focus",
      tips: [
        "Pre-underline the operative keywords in the question stem, not the choices, to anchor your attention.",
        "Expect all three multiple-choice options to be mentioned in the audio; your job is to identify the qualifying condition.",
        "Eliminate options that contradict qualifiers heard in the passage."
      ],
      traps: [
        "The Qualifier Trap: option uses 'always/all/never' while speaker expressed probabilistic nuance ('typically/often').",
        "The Negative Reversal Trap: option is stated affirmatively, then immediately negated with 'however' or 'on the contrary'."
      ]
    },
    {
      id: "listening-exact-words",
      skill: "Listening",
      title: "Fill the Blank Exact-Word Rule & Zero-Suffix Discipline",
      sectionRef: "Sec 10: Fill the Blank & Sentence Completion Strategy Focus",
      tips: [
        "Write down the EXACT word uttered in the recording without altering its grammatical form or adding suffixes (-s, -ed, -ing).",
        "Check that the completed sentence is grammatically harmonious with the surrounding printed text.",
        "Transfer numerals as digits (e.g. '15') rather than words ('fifteen') to save time and eliminate spelling errors."
      ],
      traps: [
        "Inflecting nouns or verbs: if the speaker says 'analysis', writing 'analyses' or 'analyzing' results in zero credit."
      ]
    },
    {
      id: "listening-self-corrections",
      skill: "Listening",
      title: "Oral Self-Correction Detection",
      sectionRef: "Sec 9: Multiple Choice Question Strategy Focus",
      tips: [
        "Listen for conversational retraction markers: 'No, wait', 'Actually', 'Sorry, I meant', 'Rather'.",
        "The value stated immediately AFTER the self-correction marker is virtually always the correct answer.",
        "Keep your pen poised until the speaker moves to the subsequent thematic point."
      ],
      traps: [
        "Writing down the first figure heard and shifting focus prematurely before the speaker finishes their thought."
      ]
    },

    // Reading (14 Question Types + Strategy)
    {
      id: "reading-18-18-24-timing",
      skill: "Reading",
      title: "The 18-18-24 Minute Cognitive Timing Matrix",
      sectionRef: "Sec 13: Academic Reading Basics & Architecture",
      tips: [
        "Allocate 18 minutes to Passage 1, 18 minutes to Passage 2, and 24 minutes to Passage 3.",
        "Passage 1 features straightforward factual prose; completing it in 16-18 minutes banks vital cognitive reserves for Passage 3's dense abstract discourse.",
        "On computer-based exams, enter answers directly without waiting for a non-existent transfer period."
      ],
      traps: [
        "Spending 25+ minutes on Passage 1: leaves insufficient time to decipher complex Passage 3 question sets."
      ]
    },
    {
      id: "reading-scanning-mechanics",
      skill: "Reading",
      title: "Scanning Mechanics & Anchor Keyword Targeting",
      sectionRef: "Sec 14: Scanning for Matching Vocabulary & Synonym Engine",
      tips: [
        "Select hard, unchangeable anchor keywords: capitalized names, specific years, numerical percentages, scientific terminology.",
        "Scan diagonally or backwards across text blocks to prevent your brain from slipping into slow reading comprehension mode.",
        "Once the anchor is located, shift to intensive micro-reading of the two surrounding sentences."
      ],
      traps: [
        "Scanning for common academic verbs or abstract nouns that appear dozens of times across the text."
      ]
    },
    {
      id: "reading-tfng",
      skill: "Reading",
      title: "True / False / Not Given (Factual Verification)",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "TRUE: The text conveys the identical factual meaning using synonym language.",
        "FALSE: The text directly contradicts the statement with opposite factual evidence.",
        "NOT GIVEN: The text mentions the subject, but neither confirms nor refutes the specific claim.",
        "Questions strictly follow passage chronological order."
      ],
      traps: [
        "The Extrapolation Trap: assuming a statement is TRUE based on real-world common knowledge when the passage remains silent."
      ]
    },
    {
      id: "reading-ynng",
      skill: "Reading",
      title: "Yes / No / Not Given (Author Opinion & Claims)",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Focus on authorial attitude markers ('In my view', 'Regrettably', 'Arguably') rather than raw empirical facts.",
        "YES: Statement matches the author's personal stance or argument.",
        "NO: Statement contradicts the author's personal stance or argument.",
        "NOT GIVEN: Impossible to determine the author's opinion on this specific point."
      ],
      traps: [
        "Conflating an outside expert cited by the author with the author's personal stance."
      ]
    },
    {
      id: "reading-short-answer",
      skill: "Reading",
      title: "Short Answer Questions & Strict Word Limits",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Answers follow passage order; take words directly from the text without alteration.",
        "Read the question word carefully (What, Where, Which, Who) to predict the syntactic role of the required answer.",
        "Verify that your extracted word fits the word limit (e.g. 'NO MORE THAN TWO WORDS')."
      ],
      traps: [
        "Including non-essential adjectives or articles that push your answer over the word limit."
      ]
    },
    {
      id: "reading-sentence-completion",
      skill: "Reading",
      title: "Sentence Completion & Collocational Fit",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Analyze the grammar of the blank line: determine whether it requires a singular countable noun, plural noun, adjective, or verb form.",
        "Locate the sentence in the text using anchor keywords before and after the blank.",
        "Ensure the completed sentence matches standard English grammatical syntax."
      ],
      traps: [
        "Extracting a word that is semantically accurate but grammatically incompatible with the printed carrier sentence."
      ]
    },
    {
      id: "reading-summary-nobox",
      skill: "Reading",
      title: "Summary Completion (Passage-Based Extracts)",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Summaries condense 1-3 paragraphs; identify which paragraphs are summarized before reading individual blanks.",
        "Words must come directly from the passage without spelling changes.",
        "Check prepositions preceding the blank to predict the required complement."
      ],
      traps: [
        "Copying adjacent text that violates the word count restriction."
      ]
    },
    {
      id: "reading-summary-box",
      skill: "Reading",
      title: "Summary Completion (Word Bank & Synonyms)",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Find the original passage word first, then match it to its closest academic synonym in the provided word bank.",
        "Eliminate word bank options that do not match the required part of speech.",
        "Cross off used letters to narrow remaining choices."
      ],
      traps: [
        "Writing the actual passage word on your answer sheet instead of the corresponding letter code (A-H) from the box."
      ]
    },
    {
      id: "reading-table-completion",
      skill: "Reading",
      title: "Table Completion & Coordinate Grid Navigation",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Use column and row headers as primary coordinate filters to locate the exact passage section.",
        "Analyze pattern symmetry in existing filled table cells to determine the format of your target answer.",
        "Answers within the same row generally appear in close proximity within the passage."
      ],
      traps: [
        "Reading linearly across paragraphs instead of navigating directly to the intersection of the column and row categories."
      ]
    },
    {
      id: "reading-flowchart",
      skill: "Reading",
      title: "Flow Chart Completion & Sequential Progression",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Track directional arrows to determine chronological sequence (Step 1 -> Step 2 -> Step 3).",
        "Scan for sequential discourse markers in the passage ('Initially', 'Subsequently', 'Upon completion of this stage').",
        "Predict whether each stage requires an action, instrument, or material."
      ],
      traps: [
        "Reversing cause-and-effect stages in cyclical diagrams."
      ]
    },
    {
      id: "reading-diagram-label",
      skill: "Reading",
      title: "Diagram Labelling & Spatial Prepositions",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Locate the specific technical descriptive paragraph in the passage detailing the mechanism or apparatus.",
        "Match spatial labels (base, apex, exterior casing, valve) against passage descriptions.",
        "Pay special attention to geometric terms and relative position adjectives."
      ],
      traps: [
        "Confusing internal component names with external structural containers."
      ]
    },
    {
      id: "reading-mcq-single",
      skill: "Reading",
      title: "Multiple Choice Standard (Single Answer)",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Underline keywords in the question stem and locate the specific sentence in the text before reading options A-D.",
        "Formulate your own provisional answer mentally, then match it against the 4 choices.",
        "Systematically eliminate the 3 distractors based on qualifier shifts or contradiction."
      ],
      traps: [
        "Word-match trap: options that copy exact words from the passage are frequently false lures; the correct choice almost always uses synonyms."
      ]
    },
    {
      id: "reading-mcq-multi",
      skill: "Reading",
      title: "Choose 2 to 5 From a List (Multi-Select)",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Treat each option as an independent True/False verification task against the passage.",
        "Note that correct answers can appear in any order on your answer sheet (e.g. Questions 14 & 15 can be B & D or D & B).",
        "Confirm whether the prompt asks for advantages, causes, or historical facts."
      ],
      traps: [
        "Selecting an option that is mentioned in the passage but does not answer the specific research question in the stem."
      ]
    },
    {
      id: "reading-matching-headings",
      skill: "Reading",
      title: "Matching Headings (Topic Sentence Sieve)",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Always execute Matching Headings FIRST before answering detailed question sets for that passage.",
        "Read the first 1-2 sentences and the final sentence of the paragraph; the overarching controlling idea resides there.",
        "Headings summarize the entire paragraph; a detail mentioned in just one clause is an examiner distractor.",
        "Cross off used roman numerals (i, ii, iii) to reduce visual clutter."
      ],
      traps: [
        "The Detail Trap: selecting a heading because it contains an eye-catching keyword that only appeared in an illustrative example."
      ]
    },
    {
      id: "reading-matching-info",
      skill: "Reading",
      title: "Matching Information (Which Paragraph Contains...)",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Questions do NOT follow text order; execute this question set LAST after other questions have familiarized you with the paragraphs.",
        "Look for functional category words in the stems: 'a reference to', 'an explanation of', 'a comparison between', 'the reasons for'.",
        "Check if NB appears: 'NB You may use any letter more than once'."
      ],
      traps: [
        "Executing Matching Information first: results in frantic, unstructured full-passage rereading."
      ]
    },
    {
      id: "reading-matching-features",
      skill: "Reading",
      title: "Matching Features, Names & Opinions",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Scan the passage and highlight all instances of the categorized names/researchers first.",
        "Notice that a single researcher may appear in multiple paragraphs across the text.",
        "Read what the researcher stated or concluded, paying close attention to verbs of reporting ('demonstrated', 'hypothesized', 'argued')."
      ],
      traps: [
        "Matching an opinion to the first mention of a researcher when their definitive conclusion appears two paragraphs later."
      ]
    },
    {
      id: "reading-matching-sentence-endings",
      skill: "Reading",
      title: "Matching Sentence Endings & Syntactic Fit",
      sectionRef: "Sec 15: The 14 Question Types",
      tips: [
        "Question stems follow chronological passage order; endings in the box do not.",
        "Grammatical screening: eliminate endings that produce ungrammatical sentences when connected to the stem.",
        "Verify semantic synonymy between the connected sentence and the passage statement."
      ],
      traps: [
        "Picking an ending that forms a grammatically correct sentence but distorts the empirical meaning of the passage."
      ]
    },

    // Writing Task 1
    {
      id: "wt1-2-sentence-overview",
      skill: "Writing Task 1",
      title: "The Keino Campbell 2-Sentence Overview Formula",
      sectionRef: "Sec 24: IELTS Writing Academic Task 1 Strategy & Tactics",
      tips: [
        "Place the Overview immediately after the paraphrased introduction as Paragraph 2.",
        "Sentence 1: State the overall dominant trajectory or trend across the timeline or data set without numerical data.",
        "Sentence 2: Identify the most prominent contrast, outlier, or extreme divergence without numerical data.",
        "An overview lacking numbers is mandatory for Band 7.0+ Task Achievement."
      ],
      traps: [
        "Including specific data figures or percentages in the overview: this demotes the overview into a routine body paragraph."
      ],
      formula: "Sentence 1 (Main Trend) + Sentence 2 (Key Contrast/Outlier) [0 numerical values]"
    },
    {
      id: "wt1-line-graphs",
      skill: "Writing Task 1",
      title: "Line Graphs: Trajectory Grouping & Velocity Verbs",
      sectionRef: "Sec 24: IELTS Writing Academic Task 1 Strategy & Tactics",
      tips: [
        "Group lines by trajectory: assign rising trends to Body 1 and declining/erratic trends to Body 2.",
        "Vary velocity and magnitude verbs: surged, rocketed, escalated vs plummeted, contracted, touched a trough.",
        "Report key points: inception value, peak, trough, plateau, and terminal value."
      ],
      traps: [
        "Mechanical year-by-year recounting: 'In 2010 it was X, in 2011 it was Y, in 2012 it was Z' caps Task Achievement at Band 5.0."
      ]
    },
    {
      id: "wt1-bar-charts",
      skill: "Writing Task 1",
      title: "Bar Charts: Magnitude & Dynamic Comparisons",
      sectionRef: "Sec 24: IELTS Writing Academic Task 1 Strategy & Tactics",
      tips: [
        "For static bar charts (single year), group by magnitude (highest tier in Body 1, lowest in Body 2).",
        "For dynamic bar charts, group by trajectory over time.",
        "Use flexible comparative structures: 'stood at nearly double that of', 'dwarfed the figures for', 'outstripped'."
      ],
      traps: [
        "Listing every individual bar: Task 1 requires selecting and reporting main features, not transcribing the visual."
      ]
    },
    {
      id: "wt1-pie-charts",
      skill: "Writing Task 1",
      title: "Pie Charts: Proportional Distributions & Slices",
      sectionRef: "Sec 24: IELTS Writing Academic Task 1 Strategy & Tactics",
      tips: [
        "Use proportional lexicon: 'constituted', 'accounted for', 'represented a dominant share of', 'made up a negligible fraction'.",
        "When comparing multiple pie charts, focus on proportional shifts between categories over time.",
        "Group dominant slices in Body 1 and minor segments in Body 2."
      ],
      traps: [
        "Describing slices as numbers rather than proportions of a whole."
      ]
    },
    {
      id: "wt1-tables",
      skill: "Writing Task 1",
      title: "Tables: Matrix Filtering & Extrema Selection",
      sectionRef: "Sec 24: IELTS Writing Academic Task 1 Strategy & Tactics",
      tips: [
        "Identify the row and column dimensions; locate the highest, lowest, and most divergent data cells.",
        "Limit detailed reporting to 4-6 significant figures across two logically grouped body paragraphs.",
        "Use ranking expressions: 'occupied the foremost position', 'at the opposite end of the spectrum'."
      ],
      traps: [
        "Attempting to describe every cell in the table; this leads to an unreadable catalogue of figures."
      ]
    },
    {
      id: "wt1-processes",
      skill: "Writing Task 1",
      title: "Process Diagrams: Passive Voice & Sequential Linkers",
      sectionRef: "Sec 24: IELTS Writing Academic Task 1 Strategy & Tactics",
      tips: [
        "Use passive voice consistently for man-made processes ('the tea leaves are harvested, dried, and packaged').",
        "Count the total number of stages and state it clearly in the overview.",
        "Use sequential discourse markers: 'initially', 'subsequently', 'the ensuing phase involves', 'culminates in'."
      ],
      traps: [
        "Using active personal pronouns ('you take the mixture') or active voice for automated factory operations."
      ]
    },
    {
      id: "wt1-maps",
      skill: "Writing Task 1",
      title: "Maps: Spatial Transformations & Compass Prepositions",
      sectionRef: "Sec 24: IELTS Writing Academic Task 1 Strategy & Tactics",
      tips: [
        "Use cardinal compass coordinates: 'to the north-east of the town', 'in the south-western quadrant'.",
        "Employ transformation verbs: 'was demolished to make way for', 'underwent extensive redevelopment', 'was repurposed into'.",
        "The overview must state the overarching nature of the transformation (e.g. from rural to residential/industrial)."
      ],
      traps: [
        "Using ambiguous spatial prepositions like 'on the top' or 'at the bottom' instead of cardinal compass directions."
      ]
    },

    // Writing Task 2
    {
      id: "wt2-strict-4-sentence-formula",
      skill: "Writing Task 2",
      title: "The Strict 4-Sentence Paragraph Formula",
      sectionRef: "Sec 29: The 5 Essay Architectures & Writing Tactics",
      tips: [
        "Sentence 1 (Topic Sentence): State the single controlling idea clearly and assertively.",
        "Sentence 2 (Explanation): Explain WHY and HOW the topic sentence is true using causal logic.",
        "Sentence 3 (Evidence): Provide a concrete empirical case, study, or real-world exemplar.",
        "Sentence 4 (Impact/Concluding): Synthesize the causal chain and link back to your overall thesis.",
        "Exactly 4 sentences ensures optimal paragraph depth (~80-100 words per body paragraph)."
      ],
      traps: [
        "Serial listing: writing three superficial ideas in one paragraph without explanation or evidence."
      ],
      formula: "S1: Topic Claim -> S2: Causal Explanation -> S3: Concrete Evidence -> S4: Concluding Synthesis"
    },
    {
      id: "wt2-arch-opinion",
      skill: "Writing Task 2",
      title: "Architecture 1: Opinion (Agree or Disagree)",
      sectionRef: "Sec 29: The 5 Essay Architectures & Writing Tactics",
      tips: [
        "State a definitive, unambiguous stance in the introduction and maintain it throughout all paragraphs.",
        "Body 1: Primary supporting argument developed with the 4-sentence formula.",
        "Body 2: Secondary supporting argument developed with the 4-sentence formula.",
        "Conclusion: Restate your stance and synthesize the two core justifications."
      ],
      traps: [
        "Fence-sitting: stating 'I partly agree and partly disagree' without clearly establishing which side dominates."
      ]
    },
    {
      id: "wt2-arch-discussion",
      skill: "Writing Task 2",
      title: "Architecture 2: Discussion (Discuss Both Views & Opinion)",
      sectionRef: "Sec 29: The 5 Essay Architectures & Writing Tactics",
      tips: [
        "You MUST discuss both perspectives equally before endorsing your preferred position.",
        "Body 1: Objective examination of View A and its underlying merits/limitations.",
        "Body 2: Detailed examination of View B, highlighting why it is superior or more pragmatic.",
        "State your personal position in both the introduction and the conclusion."
      ],
      traps: [
        "Discussing only the side you personally support; failure to discuss both views caps Task Response at Band 5.0."
      ]
    },
    {
      id: "wt2-arch-advantages",
      skill: "Writing Task 2",
      title: "Architecture 3: Advantages vs. Disadvantages (Weighing Stance)",
      sectionRef: "Sec 29: The 5 Essay Architectures & Writing Tactics",
      tips: [
        "When the prompt asks 'Do advantages outweigh disadvantages?', you must make a clear qualitative or quantitative judgment.",
        "Body 1: Acknowledge the lesser impact side.",
        "Body 2: Argue the dominant impact side, demonstrating why it exerts decisive weight.",
        "Use weighing linkers: 'While X presents undeniable drawbacks, these are heavily eclipsed by Y'."
      ],
      traps: [
        "Simply listing pros and cons without declaring which side decisively outweighs the other."
      ]
    },
    {
      id: "wt2-arch-problem-solution",
      skill: "Writing Task 2",
      title: "Architecture 4: Problem-Solution / Cause-Solution",
      sectionRef: "Sec 29: The 5 Essay Architectures & Writing Tactics",
      tips: [
        "Body 1: Analyze 1-2 primary root causes using deep causal explanations.",
        "Body 2: Propose targeted, pragmatic solutions that directly counteract the specific root causes established in Body 1.",
        "Ensure clear symmetry between each identified cause and its corresponding remedy."
      ],
      traps: [
        "Proposing generic solutions (e.g. 'governments should raise awareness') that fail to tackle the specific causes identified in Body 1."
      ]
    },
    {
      id: "wt2-arch-twopart",
      skill: "Writing Task 2",
      title: "Architecture 5: Two-Part / Double Direct Questions",
      sectionRef: "Sec 29: The 5 Essay Architectures & Writing Tactics",
      tips: [
        "Address Question 1 thoroughly in Body 1.",
        "Address Question 2 thoroughly in Body 2.",
        "The introduction must briefly preview answers to both questions, and the conclusion must synthesize both."
      ],
      traps: [
        "Devoting 80% of the essay to Question 1 and answering Question 2 in a superficial 2-sentence paragraph."
      ]
    },

    // Speaking
    {
      id: "speaking-part1-formula",
      skill: "Speaking",
      title: "Part 1: The 2-to-3 Sentence Direct Answer Formula",
      sectionRef: "Sec 31: Speaking Part 1 — The Interview",
      tips: [
        "Answer the examiner's question directly in Sentence 1 without repeating the prompt words verbatim.",
        "Add 1-2 expansion sentences providing a rationale, personal example, or mild contrast.",
        "Keep total response length to 15-25 seconds per question; do not deliver an extended lecture in Part 1."
      ],
      traps: [
        "Giving bare one-word answers ('Yes', 'No', 'Football') or reciting memorized canned speeches."
      ],
      formula: "Sentence 1: Direct Answer -> Sentence 2: Expansion/Reason -> Sentence 3: Concrete Detail"
    },
    {
      id: "speaking-part2-1min-prep",
      skill: "Speaking",
      title: "Part 2: The 1-Minute Prep 4-Keyword Notepad Formula",
      sectionRef: "Sec 33: Part 2 The 1-Minute Prep Formula",
      tips: [
        "During the 60-second preparation window, write exactly 4 keyword bullet points on your paper corresponding to the 4 prompt prompts.",
        "Do not write full sentences; keywords act as mental cognitive anchors so your eyes stay focused on the examiner.",
        "Structure your 2-minute talk as a narrative arc: Context -> Turning Point -> Key Detail -> Reflection/Outcome.",
        "Speak continuously until the examiner stops you at the 2-minute mark."
      ],
      traps: [
        "Writing full grammatical sentences on the notepad: you will run out of prep time and only note one bullet point."
      ],
      formula: "Bullet 1: Who/Where (Setting) -> Bullet 2: What happened -> Bullet 3: The complication -> Bullet 4: Why it matters"
    },
    {
      id: "speaking-part3-abstract",
      skill: "Speaking",
      title: "Part 3: 3-Step Abstract Discourse Formula",
      sectionRef: "Sec 34 & 35: Part 3 Abstract Discussion Tactics",
      tips: [
        "Shift immediately from personal narrative ('I', 'my family') to societal, economic, and philosophical analysis ('individuals', 'society at large').",
        "Step 1: Direct perspective/thesis statement.",
        "Step 2: Societal mechanism or causal rationale.",
        "Step 3: Concrete real-world exemplar or speculative alternative.",
        "Use speculative hedging: 'It is widely acknowledged that', 'One plausible consequence might be'."
      ],
      traps: [
        "Answering Part 3 with personal anecdotes about your friends or family; Part 3 tests abstract academic reasoning."
      ]
    },
    {
      id: "speaking-fillers",
      skill: "Speaking",
      title: "Tactical Hesitation Fillers & Acoustic Chunking",
      sectionRef: "Sec 30: Speaking Exam Overview",
      tips: [
        "Replace vocal disfluencies ('uh', 'um', 'er') with natural lexical hesitation phrases.",
        "Use introductory pivot markers: 'Well, that is an intriguing inquiry...', 'From what I have observed in recent years...'.",
        "Chunk your speech into logical 3-5 word thought groups with natural pauses at clause boundaries."
      ],
      traps: [
        "Silent pauses longer than 3 seconds: examiners penalize extended silence as a fluency breakdown."
      ]
    },
    {
      id: "speaking-rubric-calibration",
      skill: "Speaking",
      title: "The 4 Assessment Descriptors (FC, LR, GRA, PR)",
      sectionRef: "Sec 30: Speaking Exam Overview",
      tips: [
        "Fluency & Coherence (25%): Speak at length without abnormal pauses; use discourse linkers naturally.",
        "Lexical Resource (25%): Use idiomatic expressions and academic collocations; paraphrase when stuck.",
        "Grammatical Range & Accuracy (25%): Employ conditionals, relative clauses, and passive structures with high precision.",
        "Pronunciation (25%): Utilize sentence stress, rhythm, and clear intonation contours to convey meaning."
      ],
      traps: [
        "Fixating purely on vocabulary while letting grammatical accuracy or sentence rhythm collapse."
      ]
    }
  ];

  // Write files
  const strategyFile = path.join(IELTS_DATA_DIR, 'strategy.json');
  fs.writeFileSync(strategyFile, JSON.stringify(strategyCards, null, 2), 'utf8');

  const courseJsonFile = path.join(DATA_DIR, 'ielts-course.json');
  const courseData = {
    title: "IELTS Band 7+ Complete Prep Course Master Data",
    standards: "IELTS 9-Band Descriptors & Cambridge Calibrated Assessment",
    compiledAt: new Date().toISOString(),
    stats: {
      strategyCards: strategyCards.length,
      diagnosticQuestions: diagnostics.length,
      questionTypes: questionTypes.length,
      synonymPairs: masterSynonyms.length,
      speakingModels: speakingModels.length
    },
    diagnostics,
    questionTypes,
    synonymPairs: masterSynonyms,
    listeningTraps,
    writingFormulas,
    speakingModels
  };

  fs.writeFileSync(courseJsonFile, JSON.stringify(courseData, null, 2), 'utf8');
  const elapsed = Date.now() - start;

  console.log(`[COMPILE] ielts-course: ${strategyCards.length} strategy cards -> src/ielts/data/strategy.json, master course data -> src/assets/data/ielts-course.json in ${elapsed}ms.`);

  return {
    strategyCardsCount: strategyCards.length,
    diagnosticsCount: diagnostics.length,
    questionTypesCount: questionTypes.length,
    elapsed
  };
}

function compileAll() {
  const start = Date.now();
  console.log('[COMPILE] Compiling Markdown content into JSON...');
  compileCollocations();
  compileGrammar();
  compileVocabulary();
  compileRhetoric();
  compileLexicon();
  compileDrills();
  compileReading();
  compileListening();
  compileHabits();
  compileDiagnostic();
  compileIelts();
  compileIeltsCourse();
  console.log(`[COMPILE] Finished in ${Date.now() - start}ms.`);
}

if (require.main === module) {
  compileAll();
}

if (process.argv.includes('--watch')) {
  console.log('[WATCH] Watching web/content for changes...');
  fs.watch(CONTENT_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      console.log(`[WATCH] Change detected: ${filename}`);
      try { compileAll(); } catch (err) { console.error('[WATCH ERROR]', err.message); }
    }
  });
}

module.exports = {
  compileAll,
  compileDiagnostic,
  compileCollocations,
  compileGrammar,
  compileVocabulary,
  compileRhetoric,
  compileLexicon,
  compileDrills,
  compileReading,
  compileListening,
  compileHabits,
  compileIelts,
  compileIeltsCourse
};
