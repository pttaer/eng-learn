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

  const speakFile = path.join(dir, 'speaking-prompts.md');
  if (fs.existsSync(speakFile)) {
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

  const writeFile = path.join(dir, 'writing-prompts.md');
  if (fs.existsSync(writeFile)) {
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

  // Preserve existing rubricSummary if present
  const existingPath = path.join(DATA_DIR, 'drills.json');
  if (fs.existsSync(existingPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
      drills.rubricSummary = prev.rubricSummary || {};
    } catch (e) {}
  }

  if (drills.speaking.length > 0 || drills.writing.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, 'drills.json'), JSON.stringify(drills, null, 2), 'utf8');
    console.log(`[COMPILE] drills.json: ${drills.speaking.length} speaking, ${drills.writing.length} writing`);
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
  console.log(`[COMPILE] Finished in ${Date.now() - start}ms.`);
}

compileAll();

if (process.argv.includes('--watch')) {
  console.log('[WATCH] Watching web/content for changes...');
  fs.watch(CONTENT_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      console.log(`[WATCH] Change detected: ${filename}`);
      try { compileAll(); } catch (err) { console.error('[WATCH ERROR]', err.message); }
    }
  });
}
