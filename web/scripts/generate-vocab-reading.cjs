const fs = require('fs');
const path = require('path');

const dataDir = path.resolve('E:/Eng/web/src/assets/data');

// ============================================================================
// 1. GENERATE vocabulary.json (120 ITEMS ACROSS 3 ROGUELIKE MODES)
// ============================================================================

const rootForgeItems = [
  // --- CHRON (time) ---
  {
    id: 'vocab-rf-1',
    mode: 'ROOT_FORGE',
    level: 1,
    wordOrChunk: 'chronic',
    definition: 'Persisting for a long time or constantly recurring (typically of an illness or problem).',
    ipa: '/ˈkrɒn.ɪk/',
    vietnamese: 'mãn tính, kinh niên, kéo dài dai dẳng',
    contextSentence: 'The city faces a chronic shortage of affordable housing for municipal workers.',
    breakdown: {
      prefix: 'None (root-initial)',
      root: 'chron (Greek: time)',
      suffix: '-ic (adjective-forming: having the character of)',
      derivationalFamily: ['chronicle', 'synchronize', 'chronological', 'anachronism'],
      morphologyAnalysis: 'chron (time) + -ic (pertaining to) -> lasting over extended time'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-2',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'synchronize',
    definition: 'To cause to occur or operate at the same time or rate.',
    ipa: '/ˈsɪŋ.krə.naɪz/',
    vietnamese: 'đồng bộ hóa, xảy ra cùng một thời điểm',
    contextSentence: 'The distributed database nodes synchronize transaction logs every fifty milliseconds.',
    breakdown: {
      prefix: 'syn- (Greek: together, with)',
      root: 'chron (Greek: time)',
      suffix: '-ize (verb-forming: make into, cause to become)',
      derivationalFamily: ['asynchronous', 'synchrony', 'synchronization', 'synchronous'],
      morphologyAnalysis: 'syn- (together) + chron (time) + -ize (verb) -> bring together in time'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-rf-3',
    mode: 'ROOT_FORGE',
    level: 3,
    wordOrChunk: 'anachronism',
    definition: 'A thing belonging or appropriate to a period other than that in which it exists, especially a thing that is conspicuously old-fashioned.',
    ipa: '/əˈnæk.rə.nɪ.zəm/',
    vietnamese: 'sự lỗi thời, sự sai thời đại, vật lạc điệu giữa thời đại mới',
    contextSentence: 'In an era of cryptographic verification, paper receipts feel like a quaint anachronism.',
    breakdown: {
      prefix: 'ana- (Greek: against, backward)',
      root: 'chron (Greek: time)',
      suffix: '-ism (noun-forming: condition, belief, state)',
      derivationalFamily: ['anachronistic', 'anachronistically'],
      morphologyAnalysis: 'ana- (backward/against) + chron (time) + -ism (state) -> against the timeline'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-rf-4',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'chronicle',
    definition: 'A factual written account of important or historical events in the order of their occurrence.',
    ipa: '/ˈkrɒn.ɪ.kəl/',
    vietnamese: 'biên niên sử, ghi chép lịch sử theo trình tự thời gian',
    contextSentence: 'The memoir chronicles the rise and collapse of the dot-com bubble.',
    breakdown: {
      prefix: 'None (root-initial)',
      root: 'chron (Greek: time)',
      suffix: '-icle (diminutive/noun-forming: instrument, record)',
      derivationalFamily: ['chronicler', 'chronology', 'chronometry'],
      morphologyAnalysis: 'chron (time) + -icle (written record) -> account organized by time'
    },
    isRemindCandidate: false
  },

  // --- DICT (say / speak / proclaim) ---
  {
    id: 'vocab-rf-5',
    mode: 'ROOT_FORGE',
    level: 1,
    wordOrChunk: 'predict',
    definition: 'Say or estimate that a specified thing will happen in the future or will be a consequence of something.',
    ipa: '/prɪˈdɪkt/',
    vietnamese: 'dự đoán, tiên đoán trước',
    contextSentence: 'Economists struggle to predict inflection points during rapid technological transitions.',
    breakdown: {
      prefix: 'pre- (Latin: before)',
      root: 'dict (Latin dicere: to speak, proclaim)',
      suffix: 'None (zero suffix)',
      derivationalFamily: ['predictable', 'prediction', 'predictive', 'unpredictable'],
      morphologyAnalysis: 'pre- (before) + dict (speak) -> speak before it occurs'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-6',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'contradict',
    definition: 'Deny the truth of a statement by asserting the opposite, or be in conflict with.',
    ipa: '/ˌkɒn.trəˈdɪkt/',
    vietnamese: 'mâu thuẫn với, bác bỏ, phủ nhận',
    contextSentence: 'The latest experimental findings contradict the prevailing hypothesis on neuroplasticity.',
    breakdown: {
      prefix: 'contra- (Latin: against, opposite)',
      root: 'dict (Latin dicere: to speak)',
      suffix: 'None (zero suffix)',
      derivationalFamily: ['contradiction', 'contradictory', 'contradictorily'],
      morphologyAnalysis: 'contra- (against) + dict (speak) -> speak against a claim'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-7',
    mode: 'ROOT_FORGE',
    level: 3,
    wordOrChunk: 'indict',
    definition: 'Formally accuse or charge with a serious crime.',
    ipa: '/ɪnˈdaɪt/',
    vietnamese: 'truy tố, khởi tố hình sự, buộc tội chính thức',
    contextSentence: 'The grand jury voted to indict the executive on three counts of securities fraud.',
    breakdown: {
      prefix: 'in- (Latin: toward, against)',
      root: 'dict (Latin dicere: proclaim/speak legally)',
      suffix: 'None (zero suffix)',
      derivationalFamily: ['indictment', 'indictable'],
      morphologyAnalysis: 'in- (against) + dict (speak legally) -> proclaim formal charge against'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-rf-8',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'jurisdiction',
    definition: 'The official power to make legal decisions and judgments over an area or domain.',
    ipa: '/ˌdʒʊə.rɪsˈdɪk.ʃən/',
    vietnamese: 'thẩm quyền tài phán, phạm vi quyền hạn xét xử',
    contextSentence: 'Cross-border cybercrimes frequently fall outside the territorial jurisdiction of national police.',
    breakdown: {
      prefix: 'juris (Latin: law, right)',
      root: 'dict (Latin: speak/declare)',
      suffix: '-ion (noun-forming: act, state, condition)',
      derivationalFamily: ['jurisprudential', 'jurisprudence', 'juridical'],
      morphologyAnalysis: 'juris (law) + dict (pronounce) + -ion -> authority to speak the law'
    },
    isRemindCandidate: false
  },

  // --- MORPH (form / shape) ---
  {
    id: 'vocab-rf-9',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'amorphous',
    definition: 'Without a clearly defined shape or form; lacking organization or clear structure.',
    ipa: '/əˈmɔː.fəs/',
    vietnamese: 'vô định hình, không có cấu trúc rõ ràng',
    contextSentence: 'The startup operated as an amorphous collective before adopting a hierarchical management model.',
    breakdown: {
      prefix: 'a- (Greek: without, not)',
      root: 'morph (Greek: shape, form)',
      suffix: '-ous (adjective-forming: full of, possessing)',
      derivationalFamily: ['amorphousness', 'amorphously', 'morphology'],
      morphologyAnalysis: 'a- (without) + morph (shape) + -ous (adj) -> lacking defined shape'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-10',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'metamorphosis',
    definition: 'A change of the form or nature of a thing or person into a completely different one.',
    ipa: '/ˌmet.əˈmɔː.fə.sɪs/',
    vietnamese: 'sự biến thái, sự chuyển hóa/lột xác toàn diện',
    contextSentence: 'The manufacturing company underwent a painful metamorphosis into a pure software enterprise.',
    breakdown: {
      prefix: 'meta- (Greek: change, beyond)',
      root: 'morph (Greek: shape, form)',
      suffix: '-osis (noun-forming: process, state)',
      derivationalFamily: ['metamorphic', 'metamorphose'],
      morphologyAnalysis: 'meta- (change) + morph (form) + -osis (process) -> structural transmutation'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-rf-11',
    mode: 'ROOT_FORGE',
    level: 3,
    wordOrChunk: 'anthropomorphic',
    definition: 'Attributing human characteristics, emotions, or behaviors to non-human entities.',
    ipa: '/ˌæn.θrə.pəˈmɔː.fɪk/',
    vietnamese: 'gán đặc tính người, nhân hóa',
    contextSentence: 'Users frequently form emotional attachments to language models due to seductive anthropomorphic cues.',
    breakdown: {
      prefix: 'anthropos (Greek: human being)',
      root: 'morph (Greek: shape, form)',
      suffix: '-ic (adjective-forming: pertaining to)',
      derivationalFamily: ['anthropomorphism', 'anthropomorphize'],
      morphologyAnalysis: 'anthropos (human) + morph (shape) + -ic -> cast in human shape'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-12',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'morphology',
    definition: 'The branch of biology or linguistics that deals with the form of living organisms or words.',
    ipa: '/mɔːˈfɒl.ə.dʒi/',
    vietnamese: 'hình thái học (sinh học hoặc ngôn ngữ học)',
    contextSentence: 'Understanding inflectional morphology accelerates vocabulary acquisition across Romance languages.',
    breakdown: {
      prefix: 'None (root-initial)',
      root: 'morph (Greek: form, structure)',
      suffix: '-ology (noun-forming: study of)',
      derivationalFamily: ['morphological', 'morpheme', 'morphologist'],
      morphologyAnalysis: 'morph (form) + -ology (scientific study) -> science of structural forms'
    },
    isRemindCandidate: false
  },

  // --- PATH (feeling / disease / suffering) ---
  {
    id: 'vocab-rf-13',
    mode: 'ROOT_FORGE',
    level: 1,
    wordOrChunk: 'empathy',
    definition: 'The ability to understand and share the feelings of another.',
    ipa: '/ˈem.pə.θi/',
    vietnamese: 'sự thấu cảm, khả năng đặt mình vào vị trí người khác',
    contextSentence: 'High-performing negotiators exhibit cognitive empathy without sacrificing strategic firmness.',
    breakdown: {
      prefix: 'em- / en- (Greek: in, within)',
      root: 'path (Greek pathos: feeling, suffering)',
      suffix: '-y (noun-forming: condition)',
      derivationalFamily: ['empathetic', 'empathize', 'sympathy'],
      morphologyAnalysis: 'em- (into) + path (feeling) -> feeling into another experience'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-14',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'apathy',
    definition: 'Lack of interest, enthusiasm, or concern.',
    ipa: '/ˈæp.ə.θi/',
    vietnamese: 'sự thờ ơ, sự vô cảm, lãnh đạm',
    contextSentence: 'Widespread voter apathy poses an existential threat to democratic accountability.',
    breakdown: {
      prefix: 'a- (Greek: without, not)',
      root: 'path (Greek: feeling, emotion)',
      suffix: '-y (noun-forming)',
      derivationalFamily: ['apathetic', 'apathetically'],
      morphologyAnalysis: 'a- (without) + path (feeling) -> complete absence of emotional stake'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-15',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'antipathy',
    definition: 'A deep-seated feeling of aversion or hostility.',
    ipa: '/ænˈtɪp.ə.θi/',
    vietnamese: 'ác cảm sâu sắc, sự thù ghét/bất hảo',
    contextSentence: 'Historical antipathy between the two regulatory bodies stalled the antitrust investigation.',
    breakdown: {
      prefix: 'anti- (Greek: against, opposite)',
      root: 'path (Greek: feeling)',
      suffix: '-y (noun-forming)',
      derivationalFamily: ['antipathetic', 'sympathy'],
      morphologyAnalysis: 'anti- (against) + path (feeling) -> visceral feeling directed against someone'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-rf-16',
    mode: 'ROOT_FORGE',
    level: 3,
    wordOrChunk: 'pathology',
    definition: 'The scientific study of disease, or any deviation from a normal, healthy, or efficient condition.',
    ipa: '/pəˈθɒl.ə.dʒi/',
    vietnamese: 'bệnh lý học, sự rối loạn/sai lệch bệnh lý của một hệ thống',
    contextSentence: 'The report diagnosed the company’s organizational pathology: institutional inertia and zero psychological safety.',
    breakdown: {
      prefix: 'None (root-initial)',
      root: 'path (Greek: disease, suffering)',
      suffix: '-ology (study of)',
      derivationalFamily: ['pathological', 'pathogen', 'pathologist'],
      morphologyAnalysis: 'path (disease) + -ology (study) -> systematic study of structural defects'
    },
    isRemindCandidate: false
  },

  // --- DUC / DUCT (lead / draw / conduct) ---
  {
    id: 'vocab-rf-17',
    mode: 'ROOT_FORGE',
    level: 1,
    wordOrChunk: 'deduce',
    definition: 'Arrive at a fact or a conclusion by reasoning; draw as a logical consequence from premises.',
    ipa: '/dɪˈdjuːs/',
    vietnamese: 'suy luận, diễn dịch từ tiền đề',
    contextSentence: 'From forensic metadata alone, investigators deduced the physical origin of the breach.',
    breakdown: {
      prefix: 'de- (Latin: down from, away)',
      root: 'duc (Latin ducere: to lead, guide)',
      suffix: 'None (zero suffix)',
      derivationalFamily: ['deduction', 'deductive', 'deductively'],
      morphologyAnalysis: 'de- (down from) + duc (lead) -> lead downward from general principles'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-18',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'conducive',
    definition: 'Making a certain situation or outcome likely or possible.',
    ipa: '/kənˈdjuː.sɪv/',
    vietnamese: 'có lợi cho, dẫn đến, tạo điều kiện thuận lợi cho',
    contextSentence: 'Constant Slack notifications are rarely conducive to sustained deep analytical work.',
    breakdown: {
      prefix: 'con- (Latin: together, thoroughly)',
      root: 'duc (Latin ducere: to lead)',
      suffix: '-ive (adjective-forming: tending toward)',
      derivationalFamily: ['conduce', 'conduct', 'conduction'],
      morphologyAnalysis: 'con- (together) + duc (lead) + -ive -> leading together toward a result'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-19',
    mode: 'ROOT_FORGE',
    level: 3,
    wordOrChunk: 'induce',
    definition: 'Succeed in persuading or leading someone to do something; bring about or give rise to.',
    ipa: '/ɪnˈdjuːs/',
    vietnamese: 'khiến cho, xui khiến, quy nạp, gây ra',
    contextSentence: 'Low interest rates induced reckless leverage across speculative capital markets.',
    breakdown: {
      prefix: 'in- (Latin: into, upon)',
      root: 'duc (Latin ducere: to lead)',
      suffix: 'None (zero suffix)',
      derivationalFamily: ['induction', 'inductive', 'inducement'],
      morphologyAnalysis: 'in- (into) + duc (lead) -> lead into a state of action'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-rf-20',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'ductile',
    definition: 'Able to be drawn out into a thin wire; easily influenced or pliable.',
    ipa: '/ˈdʌk.taɪl/',
    vietnamese: 'dễ kéo sợi, có tính dẻo, dễ uốn nắn',
    contextSentence: 'Copper is prized in electrical engineering because it is exceptionally ductile and conductive.',
    breakdown: {
      prefix: 'None (root-initial)',
      root: 'duct (Latin ductus: led, pulled)',
      suffix: '-ile (adjective-forming: capable of being)',
      derivationalFamily: ['ductility', 'aqueduct', 'viaduct'],
      morphologyAnalysis: 'duct (pulled/drawn) + -ile (capable of) -> capable of being drawn out'
    },
    isRemindCandidate: false
  },

  // --- BENE / MAL (good / bad) ---
  {
    id: 'vocab-rf-21',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'benevolent',
    definition: 'Well-meaning and kindly; serving a charitable rather than a profit-making purpose.',
    ipa: '/bəˈnev.əl.ənt/',
    vietnamese: 'nhân từ, hảo tâm, thiện chí',
    contextSentence: 'The foundation operates as a benevolent trust funding open-source scientific infrastructure.',
    breakdown: {
      prefix: 'bene- (Latin: well, good)',
      root: 'vol (Latin velle: to wish, will)',
      suffix: '-ent (adjective-forming: being in a state)',
      derivationalFamily: ['benevolence', 'benefactor', 'benefit', 'beneficent'],
      morphologyAnalysis: 'bene- (well) + vol (wish) + -ent -> wishing good upon others'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-22',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'malevolent',
    definition: 'Having or showing a wish to do evil to others.',
    ipa: '/məˈlev.əl.ənt/',
    vietnamese: 'ác ý, hiểm độc, có tâm địa xấu xa',
    contextSentence: 'Autonomous weapons systems raise ethical perils should they fall into malevolent hands.',
    breakdown: {
      prefix: 'mal- / male- (Latin: bad, evil)',
      root: 'vol (Latin velle: to wish)',
      suffix: '-ent (adjective-forming)',
      derivationalFamily: ['malevolence', 'malice', 'malicious'],
      morphologyAnalysis: 'male- (evil) + vol (wish) + -ent -> wishing harm to occur'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-rf-23',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'benign',
    definition: 'Gentle, kindly, or not harmful in effect (in medicine: not malignant).',
    ipa: '/bɪˈnaɪn/',
    vietnamese: 'lành tính, dịu dàng, vô hại',
    contextSentence: 'The policy change was initially perceived as benign, but it masked severe regressive tax shifts.',
    breakdown: {
      prefix: 'bene- (Latin: well)',
      root: 'gen (Latin gignere: born, produced)',
      suffix: 'None (zero suffix)',
      derivationalFamily: ['benignity', 'benignly'],
      morphologyAnalysis: 'bene- (good) + gen (birth/nature) -> of good and harmless disposition'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-24',
    mode: 'ROOT_FORGE',
    level: 3,
    wordOrChunk: 'malfeasance',
    definition: 'Wrongdoing or misconduct, especially by a public official or corporate trustee.',
    ipa: '/mælˈfiː.zəns/',
    vietnamese: 'hành vi sai trái, sự lạm quyền làm trái pháp luật của viên chức',
    contextSentence: 'The independent auditor uncovered systemic fiscal malfeasance at the highest levels of the board.',
    breakdown: {
      prefix: 'mal- (Latin: bad, wrong)',
      root: 'faisance (Old French faire: doing, making)',
      suffix: '-ance (noun-forming: act or fact of doing)',
      derivationalFamily: ['misfeasance', 'nonfeasance', 'feasible'],
      morphologyAnalysis: 'mal- (evil/bad) + faisance (doing) -> active commission of unlawful act'
    },
    isRemindCandidate: true
  },

  // --- VOC / VOK (voice / call) ---
  {
    id: 'vocab-rf-25',
    mode: 'ROOT_FORGE',
    level: 1,
    wordOrChunk: 'advocate',
    definition: 'Publicly recommend or support a particular cause or policy.',
    ipa: '/ˈæd.və.keɪt/',
    vietnamese: 'công khai ủng hộ, tán thành, biện hộ cho',
    contextSentence: 'Civil liberties organizations advocate for end-to-end encryption in consumer messaging apps.',
    breakdown: {
      prefix: 'ad- (Latin: to, toward)',
      root: 'voc (Latin vocare: to call)',
      suffix: '-ate (verb-forming: act on)',
      derivationalFamily: ['advocacy', 'vocal', 'vocation'],
      morphologyAnalysis: 'ad- (to/toward) + voc (call) + -ate -> call out in support of'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-26',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'provoke',
    definition: 'Stimulate or give rise to a reaction or emotion, typically a strong or unwelcome one.',
    ipa: '/prəˈvəʊk/',
    vietnamese: 'khiêu khích, châm ngòi, gợi lên phản ứng dữ dội',
    contextSentence: 'The imposition of unilateral tariffs provoked sharp retaliatory measures from trade partners.',
    breakdown: {
      prefix: 'pro- (Latin: forth, forward)',
      root: 'vok / voc (Latin vocare: to call)',
      suffix: 'None (zero suffix)',
      derivationalFamily: ['provocative', 'provocation', 'provoker'],
      morphologyAnalysis: 'pro- (forth) + vok (call) -> call forth a turbulent reaction'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-27',
    mode: 'ROOT_FORGE',
    level: 3,
    wordOrChunk: 'equivocate',
    definition: 'Use ambiguous language so as to conceal the truth or avoid committing oneself.',
    ipa: '/ɪˈkwɪv.ə.keɪt/',
    vietnamese: 'nói nước đôi, lập lờ đánh lận con đen để né tránh cam kết',
    contextSentence: 'When pressed on campaign finance discrepancies, the candidate chose to equivocate.',
    breakdown: {
      prefix: 'aequi- / equi- (Latin: equal)',
      root: 'voc (Latin vox/vocare: voice/call)',
      suffix: '-ate (verb-forming)',
      derivationalFamily: ['equivocation', 'equivocal', 'unequivocal'],
      morphologyAnalysis: 'equi- (equal) + voc (voice) + -ate -> speak with equal voices to obscure meaning'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-rf-28',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'evocative',
    definition: 'Bringing strong images, memories, or feelings to mind.',
    ipa: '/ɪˈvɒk.ə.tɪv/',
    vietnamese: 'gợi cảm xúc, khơi gợi ký ức mạnh mẽ',
    contextSentence: 'The novelist uses evocative prose to reconstruct the industrial gloom of 19th-century Manchester.',
    breakdown: {
      prefix: 'e- / ex- (Latin: out of, forth)',
      root: 'voc (Latin vocare: to call)',
      suffix: '-ative (adjective-forming)',
      derivationalFamily: ['evoke', 'evocation', 'evocatively'],
      morphologyAnalysis: 'e- (out) + voc (call) + -ative -> calling forth memories into the present'
    },
    isRemindCandidate: false
  },

  // --- SPECT / SPIC (see / look / observe) ---
  {
    id: 'vocab-rf-29',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'introspective',
    definition: 'Characterized by examination of one’s own conscious thoughts and feelings.',
    ipa: '/ˌɪn.trəˈspek.tɪv/',
    vietnamese: 'nội tâm, có xu hướng tự vấn và suy ngẫm nội tâm',
    contextSentence: 'Great writers maintain an introspective disposition without falling into self-absorbed solipsism.',
    breakdown: {
      prefix: 'intro- (Latin: inward, within)',
      root: 'spect (Latin specere: to look, behold)',
      suffix: '-ive (adjective-forming)',
      derivationalFamily: ['introspection', 'introspect', 'retrospect'],
      morphologyAnalysis: 'intro- (inward) + spect (look) + -ive -> looking deeply inward'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-30',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'conspicuous',
    definition: 'Standing out so as to be clearly visible; attracting notice or attention.',
    ipa: '/kənˈspɪk.ju.əs/',
    vietnamese: 'nổi bật, đập ngay vào mắt, dễ nhận thấy',
    contextSentence: 'There was a conspicuous absence of senior engineers at the sudden restructuring townhall.',
    breakdown: {
      prefix: 'con- (Latin: intensive / completely)',
      root: 'spic (Latin specere: to look, see)',
      suffix: '-uous (adjective-forming: marked by)',
      derivationalFamily: ['conspicuously', 'perspicacious', 'inconspicuous'],
      morphologyAnalysis: 'con- (thoroughly) + spic (seen) + -uous -> completely open to sight'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-31',
    mode: 'ROOT_FORGE',
    level: 3,
    wordOrChunk: 'circumspect',
    definition: 'Wary and unwilling to take risks; prudent, careful to consider all circumstances and consequences.',
    ipa: '/ˈsɜː.kəm.spekt/',
    vietnamese: 'thận trọng, dè dặt, nhìn nhận thấu đáo mọi khía cạnh trước khi hành động',
    contextSentence: 'Diplomats must remain circumspect when addressing disputed maritime boundaries.',
    breakdown: {
      prefix: 'circum- (Latin: around, about)',
      root: 'spect (Latin specere: to look)',
      suffix: 'None (zero suffix)',
      derivationalFamily: ['circumspection', 'circumspectly'],
      morphologyAnalysis: 'circum- (around) + spect (look) -> looking carefully all around before moving'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-rf-32',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'prospectus',
    definition: 'A printed document that advertises or provides details of a commercial enterprise, school, or financial product to prospective buyers.',
    ipa: '/prəˈspek.təs/',
    vietnamese: 'bản cáo bạch, tài liệu giới thiệu chi tiết dự án đầu tư',
    contextSentence: 'Institutional investors scrutinized the IPO prospectus to identify governance vulnerabilities.',
    breakdown: {
      prefix: 'pro- (Latin: forward, ahead)',
      root: 'spect (Latin specere: to look, view)',
      suffix: '-us (noun ending)',
      derivationalFamily: ['prospective', 'prospect', 'prospector'],
      morphologyAnalysis: 'pro- (forward) + spect (look) -> document for viewing forward possibilities'
    },
    isRemindCandidate: false
  },

  // --- GEN (birth / origin / kind) ---
  {
    id: 'vocab-rf-33',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'homogeneous',
    definition: 'Of the same kind; alike, consisting of parts all of the same kind.',
    ipa: '/ˌhɒm.əˈdʒiː.ni.əs/',
    vietnamese: 'đồng nhất, thuần nhất, gồm các thành phần cùng một loại',
    contextSentence: 'A culturally homogeneous team frequently succumbs to blind spots and intellectual groupthink.',
    breakdown: {
      prefix: 'homo- (Greek: same)',
      root: 'gen (Greek genos: race, kind, birth)',
      suffix: '-ous (adjective-forming)',
      derivationalFamily: ['homogeneity', 'homogenize', 'heterogeneous'],
      morphologyAnalysis: 'homo- (same) + gen (kind) + -ous -> of the identical kind throughout'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-34',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'engender',
    definition: 'Cause or give rise to a feeling, situation, or condition.',
    ipa: '/ɪnˈdʒen.dər/',
    vietnamese: 'làm nảy sinh, gây ra, tạo ra (cảm xúc hoặc tình thế)',
    contextSentence: 'Opaque compensation matrices invariably engender resentment among top contributors.',
    breakdown: {
      prefix: 'en- (Latin: into, cause to be)',
      root: 'gen (Latin generare: produce, beget)',
      suffix: 'None (zero suffix)',
      derivationalFamily: ['generate', 'generation', 'progenitor'],
      morphologyAnalysis: 'en- (cause) + gen (birth) -> give birth to a condition'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-rf-35',
    mode: 'ROOT_FORGE',
    level: 3,
    wordOrChunk: 'indigenous',
    definition: 'Originating or occurring naturally in a particular place; native.',
    ipa: '/ɪnˈdɪdʒ.ɪ.nəs/',
    vietnamese: 'bản địa, sinh ra và phát triển tự nhiên tại một vùng',
    contextSentence: 'The ecosystem depends upon preserving indigenous flora against aggressive invasive shrubs.',
    breakdown: {
      prefix: 'indi- / indu- (Latin: within, inside)',
      root: 'gen (Latin gignere: to beget, born)',
      suffix: '-ous (adjective-forming)',
      derivationalFamily: ['indigeneity', 'indigenously'],
      morphologyAnalysis: 'indi- (within) + gen (born) + -ous -> born from within the native land'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-36',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'progeny',
    definition: 'A descendant or the descendants of a person, animal, or plant; offspring.',
    ipa: '/ˈprɒdʒ.ə.ni/',
    vietnamese: 'hậu duệ, con cháu, sản phẩm kế thừa',
    contextSentence: 'Modern generative transformers are the direct intellectual progeny of 1980s neural network theory.',
    breakdown: {
      prefix: 'pro- (Latin: forward, ahead)',
      root: 'gen (Latin gignere: produce, beget)',
      suffix: '-y (noun-forming)',
      derivationalFamily: ['progenitor', 'genesis', 'genetic'],
      morphologyAnalysis: 'pro- (forward) + gen (beget) -> that which is produced forward'
    },
    isRemindCandidate: false
  },

  // --- TRACT (pull / drag / draw) ---
  {
    id: 'vocab-rf-37',
    mode: 'ROOT_FORGE',
    level: 1,
    wordOrChunk: 'extract',
    definition: 'Remove or take out, especially by effort or force; obtain a substance or insight from a whole.',
    ipa: '/ɪkˈstrækt/',
    vietnamese: 'chiết xuất, rút ra, trích xuất dữ liệu/thông tin',
    contextSentence: 'Data pipelines extract unstructured logs and transform them into normalized relational tables.',
    breakdown: {
      prefix: 'ex- (Latin: out of, from)',
      root: 'tract (Latin trahere: to pull, drag)',
      suffix: 'None (zero suffix)',
      derivationalFamily: ['extraction', 'extractor', 'abstract'],
      morphologyAnalysis: 'ex- (out) + tract (pull) -> pull something out of a source'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-rf-38',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'protracted',
    definition: 'Lasting for a long time or longer than expected or usual.',
    ipa: '/prəˈtræk.tɪd/',
    vietnamese: 'kéo dài dai dẳng, bị giằng co lâu ngày',
    contextSentence: 'After a protracted patent dispute lasting four years, both corporations signed a cross-license pact.',
    breakdown: {
      prefix: 'pro- (Latin: forward, forth)',
      root: 'tract (Latin trahere: to pull, draw)',
      suffix: '-ed (participial adjective)',
      derivationalFamily: ['protract', 'protraction'],
      morphologyAnalysis: 'pro- (forward) + tract (pull) -> pulled forward over prolonged time'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-rf-39',
    mode: 'ROOT_FORGE',
    level: 3,
    wordOrChunk: 'intractable',
    definition: 'Hard to control, manage, or deal with; stubborn or unyielding.',
    ipa: '/ɪnˈtræk.tə.bəl/',
    vietnamese: 'khó giải quyết, nan giải, ngoan cố, bất trị',
    contextSentence: 'The algorithm resolves what was previously considered an intractable computational complexity problem.',
    breakdown: {
      prefix: 'in- (Latin: not, un-)',
      root: 'tract (Latin trahere: pull, handle)',
      suffix: '-able (adjective-forming: capable of being)',
      derivationalFamily: ['tractable', 'intractability'],
      morphologyAnalysis: 'in- (not) + tract (pulled/handled) + -able -> incapable of being easily handled or led'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-rf-40',
    mode: 'ROOT_FORGE',
    level: 2,
    wordOrChunk: 'detract',
    definition: 'Diminish the worth, value, or quality of an achievement, person, or object.',
    ipa: '/dɪˈtrækt/',
    vietnamese: 'làm giảm giá trị, làm lu mờ, chê bai',
    contextSentence: 'Minor typesetting flaws should not detract from the monumental scope of the author’s research.',
    breakdown: {
      prefix: 'de- (Latin: away from, down)',
      root: 'tract (Latin trahere: pull, drag)',
      suffix: 'None (zero suffix)',
      derivationalFamily: ['detractor', 'detraction', 'detractive'],
      morphologyAnalysis: 'de- (away) + tract (pull) -> pull value away from something'
    },
    isRemindCandidate: false
  }
];

// ============================================================================
// 2. GENERATE CEFR_ASCENT ITEMS (40 ITEMS: LEVEL 1 B1/B2, LEVEL 2 C1, LEVEL 3 C2)
// ============================================================================

const cefrAscentItems = [
  // --- LEVEL 1: B1 / B2 FOUNDATION & WORKHORSE (14 items) ---
  {
    id: 'vocab-cefr-1',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'mitigate',
    definition: 'Make less severe, serious, or painful.',
    ipa: '/ˈmɪt.ɪ.ɡeɪt/',
    vietnamese: 'giảm nhẹ, xoa dịu tác động xấu',
    contextSentence: 'Diversifying investments across uncorrelated asset classes helps mitigate catastrophic portfolio drawdowns.',
    breakdown: {
      cefrRank: 'B2 / AWL Sublist 2',
      collocates: 'mitigate risks, mitigate impact, mitigate climate change',
      synonyms: ['alleviate', 'attenuate', 'diminish'],
      register: 'Formal Business / Technical'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-2',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'anticipate',
    definition: 'Regard as probable; expect or predict, and take action in preparation.',
    ipa: '/ænˈtɪs.ɪ.peɪt/',
    vietnamese: 'dự tính trước, lường trước để chủ động ứng phó',
    contextSentence: 'Engineers must anticipate peak network loads before launching the nationwide mobile campaign.',
    breakdown: {
      cefrRank: 'B1-B2',
      collocates: 'anticipate needs, anticipate obstacles, anticipate demand',
      synonyms: ['foresee', 'expect', 'prepare for'],
      register: 'General Academic & Business'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-3',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'coherent',
    definition: 'Logical and consistent; forming a unified and readily understandable whole.',
    ipa: '/kəʊˈhɪə.rənt/',
    vietnamese: 'mạch lạc, chặt chẽ, nhất quán về mặt logic',
    contextSentence: 'The candidate failed to articulate a coherent strategic roadmap for fiscal stabilization.',
    breakdown: {
      cefrRank: 'B2',
      collocates: 'coherent narrative, coherent framework, coherent strategy',
      synonyms: ['lucid', 'articulate', 'consistent'],
      register: 'Academic Writing & Oratory'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-4',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'implement',
    definition: 'Put a decision, plan, or agreement into effect.',
    ipa: '/ˈɪm.plɪ.ment/',
    vietnamese: 'triển khai thực hiện, thi hành kế hoạch',
    contextSentence: 'The hospital plans to implement strict biosecurity protocols across all intensive care wards.',
    breakdown: {
      cefrRank: 'B2 / AWL',
      collocates: 'implement policy, implement changes, implement solutions',
      synonyms: ['execute', 'enact', 'apply'],
      register: 'Corporate & Administrative'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-5',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'constrain',
    definition: 'Severely restrict the scope, extent, or activity of something.',
    ipa: '/kənˈstreɪn/',
    vietnamese: 'ràng buộc, kìm hãm, ép buộc vào giới hạn',
    contextSentence: 'Severe budgetary deficits constrain the government’s capacity to subsidize clean energy research.',
    breakdown: {
      cefrRank: 'B2 / AWL',
      collocates: 'severely constrain, financial constraints, structural constraints',
      synonyms: ['restrict', 'limit', 'curb'],
      register: 'Economic Analysis'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-6',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'empirical',
    definition: 'Based on, concerned with, or verifiable by observation or experience rather than theory or pure logic.',
    ipa: '/ɪmˈpɪr.ɪ.kəl/',
    vietnamese: 'mang tính thực nghiệm, dựa trên dữ liệu quan sát',
    contextSentence: 'The scientist demanded robust empirical evidence before accepting claims of room-temperature superconductivity.',
    breakdown: {
      cefrRank: 'B2 / AWL',
      collocates: 'empirical data, empirical study, empirical validation',
      synonyms: ['observational', 'factual', 'verifiable'],
      register: 'Scientific & Academic'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-cefr-7',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'feasible',
    definition: 'Possible to do easily or conveniently; workable and practically viable.',
    ipa: '/ˈfiː.zə.bəl/',
    vietnamese: 'khả thi, có thể thực hiện được trong thực tế',
    contextSentence: 'Due to severe silicon supply bottlenecks, delivering the product within two months is no longer feasible.',
    breakdown: {
      cefrRank: 'B2',
      collocates: 'economically feasible, technically feasible, feasible alternative',
      synonyms: ['viable', 'attainable', 'practicable'],
      register: 'Project Management & Engineering'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-8',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'intrinsic',
    definition: 'Belonging naturally; essential, inherent to the core nature of a thing.',
    ipa: '/ɪnˈtrɪn.zɪk/',
    vietnamese: 'thuộc về bản chất, nội tại, cố hữu',
    contextSentence: 'Curiosity and mastery provide intrinsic motivation that far outlasts short-term monetary bonuses.',
    breakdown: {
      cefrRank: 'B2',
      collocates: 'intrinsic value, intrinsic motivation, intrinsic reward',
      synonyms: ['inherent', 'innate', 'fundamental'],
      register: 'Psychology & Economics'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-9',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'versatile',
    definition: 'Able to adapt or be adapted to many different functions or activities.',
    ipa: '/ˈvɜː.sə.taɪl/',
    vietnamese: 'đa năng, linh hoạt, thích ứng với nhiều mục đích',
    contextSentence: 'Python has established itself as an extraordinarily versatile programming language across data science and web development.',
    breakdown: {
      cefrRank: 'B2',
      collocates: 'versatile tool, versatile actor, versatile approach',
      synonyms: ['adaptable', 'flexible', 'multifunctional'],
      register: 'General Professional'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-10',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'sustain',
    definition: 'Strengthen or support physically or mentally; maintain over an extended period.',
    ipa: '/səˈsteɪn/',
    vietnamese: 'duy trì bền bỉ, chống đỡ, duy trì liên tục',
    contextSentence: 'Without adequate sleep and caloric intake, cognitive athletes cannot sustain peak analytical throughput.',
    breakdown: {
      cefrRank: 'B1-B2 / AWL',
      collocates: 'sustain growth, sustain injuries, sustain momentum',
      synonyms: ['maintain', 'uphold', 'preserve'],
      register: 'Business & Physiology'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-11',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'preliminary',
    definition: 'Denoting an action or event preceding or done in preparation for something fuller or more important.',
    ipa: '/prɪˈlɪm.ɪ.nər.i/',
    vietnamese: 'sơ bộ, bước đầu, mở đầu',
    contextSentence: 'Preliminary clinical trials indicate that the compound reduces arterial inflammation by thirty percent.',
    breakdown: {
      cefrRank: 'B2',
      collocates: 'preliminary findings, preliminary draft, preliminary assessment',
      synonyms: ['introductory', 'preparatory', 'initial'],
      register: 'Medical & Scientific Reports'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-12',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'evaluate',
    definition: 'Form an idea of the amount, number, or value of; assess critically.',
    ipa: '/ɪˈvæl.ju.eɪt/',
    vietnamese: 'đánh giá, định giá một cách có phương pháp',
    contextSentence: 'Venture capitalists evaluate founding teams based on their velocity of execution rather than static pitch decks.',
    breakdown: {
      cefrRank: 'B2 / AWL',
      collocates: 'evaluate effectiveness, evaluate outcomes, evaluate performance',
      synonyms: ['appraise', 'gauge', 'assess'],
      register: 'Academic & Corporate'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-13',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'allocate',
    definition: 'Distribute resources or duties for a particular purpose.',
    ipa: '/ˈæl.ə.keɪt/',
    vietnamese: 'phân bổ (nguồn lực, ngân sách, nhân sự)',
    contextSentence: 'The executive committee resolved to allocate twenty percent of net revenues toward quantum algorithm R&D.',
    breakdown: {
      cefrRank: 'B2 / AWL',
      collocates: 'allocate resources, allocate budget, allocate bandwidth',
      synonyms: ['apportion', 'earmark', 'assign'],
      register: 'Operations & Strategy'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-14',
    mode: 'CEFR_ASCENT',
    level: 1,
    wordOrChunk: 'subsequent',
    definition: 'Coming after something in time; following.',
    ipa: '/ˈsʌb.sɪ.kwənt/',
    vietnamese: 'xảy ra sau đó, tiếp theo sau',
    contextSentence: 'The initial software patch resolved the memory leak, but subsequent updates caused networking regression.',
    breakdown: {
      cefrRank: 'B2 / AWL',
      collocates: 'subsequent generations, subsequent events, subsequent chapters',
      synonyms: ['ensuing', 'consequent', 'succeeding'],
      register: 'Academic & Formal Prose'
    },
    isRemindCandidate: false
  },

  // --- LEVEL 2: C1 ADVANCED COMPETENCY (13 items) ---
  {
    id: 'vocab-cefr-15',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'substantiate',
    definition: 'Provide evidence to support or prove the truth of a claim or thesis.',
    ipa: '/səbˈstæn.ʃi.eɪt/',
    vietnamese: 'chứng minh, cung cấp chứng cứ xác thực cho luận điểm',
    contextSentence: 'The plaintiff failed to produce documentary logs to substantiate allegations of intellectual property theft.',
    breakdown: {
      cefrRank: 'C1',
      collocates: 'substantiate claims, substantiate allegations, substantiate a hypothesis',
      synonyms: ['corroborate', 'validate', 'verify'],
      register: 'Legal & Scholarly Debate'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-cefr-16',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'ubiquitous',
    definition: 'Present, appearing, or found everywhere simultaneously.',
    ipa: '/juːˈbɪk.wɪ.təs/',
    vietnamese: 'phổ biến khắp nơi, đâu đâu cũng thấy',
    contextSentence: 'Smartphones have become so ubiquitous that disconnected solitude is now considered an elite luxury.',
    breakdown: {
      cefrRank: 'C1',
      collocates: 'ubiquitous presence, ubiquitous technology, become ubiquitous',
      synonyms: ['omnipresent', 'pervasive', 'universal'],
      register: 'Sociology & Cultural Criticism'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-17',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'contentious',
    definition: 'Causing or likely to cause an argument; controversial; involving heated legal or political dispute.',
    ipa: '/kənˈten.ʃəs/',
    vietnamese: 'gây tranh cãi gay gắt, dễ châm ngòi bất đồng',
    contextSentence: 'Zoning reform remains the most contentious item on the municipal council’s legislative agenda.',
    breakdown: {
      cefrRank: 'C1',
      collocates: 'contentious issue, contentious debate, contentious decision',
      synonyms: ['disputed', 'polemical', 'discordant'],
      register: 'Political & Civic Discourse'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-18',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'scrutinize',
    definition: 'Examine or inspect closely and thoroughly with critical attention.',
    ipa: '/ˈskruː.tɪ.naɪz/',
    vietnamese: 'xem xét kỹ lưỡng, săm soi, kiểm tra gắt gao',
    contextSentence: 'Financial regulators began to scrutinize the shadow banking firm’s off-balance-sheet special purpose vehicles.',
    breakdown: {
      cefrRank: 'C1',
      collocates: 'closely scrutinize, carefully scrutinize, scrutinize records',
      synonyms: ['inspect', 'audit', 'dissect'],
      register: 'Regulatory & Investigative'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-19',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'delineate',
    definition: 'Describe, portray, or outline with precision; set forth boundaries clearly.',
    ipa: '/dɪˈlɪn.i.eɪt/',
    vietnamese: 'phác thảo chi tiết, vạch rõ ranh giới/đặc điểm cụ thể',
    contextSentence: 'The architectural contract must clearly delineate the respective liabilities of the general contractor and structural engineers.',
    breakdown: {
      cefrRank: 'C1',
      collocates: 'delineate responsibilities, delineate boundaries, clearly delineate',
      synonyms: ['demarcate', 'articulate', 'specify'],
      register: 'Contractual & Systems Architecture'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-cefr-20',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'propensity',
    definition: 'An inclination or natural tendency to behave in a particular way.',
    ipa: '/prəˈpen.sə.ti/',
    vietnamese: 'thiên hướng, xu hướng tự nhiên nghiêng về một hành vi',
    contextSentence: 'Overconfident traders demonstrate a dangerous propensity to double down on losing positions.',
    breakdown: {
      cefrRank: 'C1',
      collocates: 'propensity for risk, marginal propensity to consume, natural propensity',
      synonyms: ['predilection', 'proclivity', 'inclination'],
      register: 'Behavioral Economics & Psychology'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-21',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'paradigm',
    definition: 'A typical example or pattern of something; an overarching theoretical framework.',
    ipa: '/ˈpær.ə.daɪm/',
    vietnamese: 'hệ hình, khuôn mẫu tư duy, chuẩn mực mẫu mực',
    contextSentence: 'Deep learning represents an undeniable paradigm shift away from handcrafted symbolic rule systems.',
    breakdown: {
      cefrRank: 'C1 / AWL',
      collocates: 'paradigm shift, dominant paradigm, theoretical paradigm',
      synonyms: ['framework', 'archetype', 'benchmark model'],
      register: 'Epistemology & Science'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-22',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'discrepancy',
    definition: 'A lack of compatibility or similarity between two or more facts or datasets.',
    ipa: '/dɪˈskrep.ən.si/',
    vietnamese: 'sự sai khác, sự không khớp giữa hai số liệu hoặc lời khai',
    contextSentence: 'Auditors flagged a five-million-dollar discrepancy between invoice records and warehouse inventory counts.',
    breakdown: {
      cefrRank: 'C1',
      collocates: 'glaring discrepancy, significant discrepancy, reconcile a discrepancy',
      synonyms: ['inconsistency', 'divergence', 'variance'],
      register: 'Forensic Accounting & Data Audit'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-23',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'poignant',
    definition: 'Evoking a keen sense of sadness or regret; deeply touching and sharp in impact.',
    ipa: '/ˈpɔɪ.njənt/',
    vietnamese: 'chua xót, thấm thía, làm thắt lòng',
    contextSentence: 'The documentary delivers a poignant critique of how deindustrialization hollowed out rural communities.',
    breakdown: {
      cefrRank: 'C1',
      collocates: 'poignant reminder, poignant portrait, poignant irony',
      synonyms: ['affecting', 'piercing', 'evocative'],
      register: 'Literary & Film Critique'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-cefr-24',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'volatile',
    definition: 'Liable to change rapidly and unpredictably, especially for the worse.',
    ipa: '/ˈvɒl.ə.taɪl/',
    vietnamese: 'biến động dữ dội, không ổn định, dễ bốc hơi/bùng nổ',
    contextSentence: 'Emerging tech stocks experienced an extraordinarily volatile quarter amid geopolitical semiconductor restrictions.',
    breakdown: {
      cefrRank: 'C1',
      collocates: 'highly volatile, volatile markets, volatile temperament',
      synonyms: ['capricious', 'turbulent', 'erratic'],
      register: 'Capital Markets & Chemistry'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-25',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'unprecedented',
    definition: 'Never done or known before; completely without prior parallel.',
    ipa: '/ʌnˈpres.ɪ.den.tɪd/',
    vietnamese: 'chưa từng có tiền lệ, vô tiền khoáng hậu',
    contextSentence: 'The rapid pace of global urbanization has created an unprecedented strain on fresh water reservoirs.',
    breakdown: {
      cefrRank: 'C1',
      collocates: 'unprecedented scale, unprecedented crisis, at an unprecedented rate',
      synonyms: ['unparalleled', 'novel', 'unmatched'],
      register: 'Policy & History'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-26',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'disenfranchise',
    definition: 'Deprive someone of the right to vote, or of a right or privilege in society.',
    ipa: '/ˌdɪs.ɪnˈfræn.tʃaɪz/',
    vietnamese: 'tước quyền công dân/quyền bầu cử, đẩy ra rìa xã hội',
    contextSentence: 'Strict voter identification hurdles disproportionately disenfranchise low-income and transient citizens.',
    breakdown: {
      cefrRank: 'C1',
      collocates: 'disenfranchise voters, politically disenfranchised, economically disenfranchised',
      synonyms: ['marginalize', 'suppress', 'dispossess'],
      register: 'Constitutional Law & Political Science'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-27',
    mode: 'CEFR_ASCENT',
    level: 2,
    wordOrChunk: 'corroborate',
    definition: 'Confirm or give support to a statement, theory, or finding with supplemental evidence.',
    ipa: '/kəˈrɒb.ə.reɪt/',
    vietnamese: 'chứng thực, củng cố thêm bằng chứng xác đáng',
    contextSentence: 'Independent seismologists examined telemetry feeds to corroborate the government’s nuclear test claims.',
    breakdown: {
      cefrRank: 'C1',
      collocates: 'corroborate evidence, corroborate testimony, independent findings corroborate',
      synonyms: ['verify', 'validate', 'authenticate'],
      register: 'Scientific & Judicial'
    },
    isRemindCandidate: true
  },

  // --- LEVEL 3: C2 & GRE MASTERY (13 items) ---
  {
    id: 'vocab-cefr-28',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'obviate',
    definition: 'Remove a need or difficulty; prevent or make unnecessary through proactive design or foresight.',
    ipa: '/ˈɒb.vi.eɪt/',
    vietnamese: 'loại bỏ sự cần thiết của điều gì, ngăn ngừa trước',
    contextSentence: 'Adopting cryptographic zero-knowledge proofs obviates the hazardous practice of transmitting cleartext passwords.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'obviate the need for, obviate risk, effectively obviate',
      synonyms: ['preclude', 'render unnecessary', 'forestall'],
      register: 'Systems Engineering & Philosophy'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-cefr-29',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'trenchant',
    definition: 'Vigorous or incisive in expression or style; keenly perceptive, sharp, and cutting.',
    ipa: '/ˈtren.tʃənt/',
    vietnamese: 'sắc bén, đanh thép, sâu cay thấu đáo',
    contextSentence: 'The editorial offered a trenchant dissection of how subsidies entrench fossil fuel cartels.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'trenchant criticism, trenchant analysis, trenchant remarks',
      synonyms: ['incisive', 'penetrating', 'scathing'],
      register: 'Literary & Political Polemics'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-cefr-30',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'surreptitious',
    definition: 'Kept secret, especially because it would not be approved of; stealthy and covert.',
    ipa: '/ˌsʌr.əpˈtɪʃ.əs/',
    vietnamese: 'lén lút, vụng trộm, giấu giếm gian xảo',
    contextSentence: 'The spyware conducted surreptitious screen recordings and exfiltrated encryption keys to remote servers.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'surreptitious glance, surreptitious surveillance, surreptitious entry',
      synonyms: ['clandestine', 'covert', 'stealthy'],
      register: 'Intelligence & Investigative Journalism'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-31',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'pernicious',
    definition: 'Having a harmful effect, especially in a gradual, subtle, or treacherous way.',
    ipa: '/pəˈnɪʃ.əs/',
    vietnamese: 'nguy hại ngấm ngầm, độc hại ăn sâu dần theo thời gian',
    contextSentence: 'Cynicism is the most pernicious force in democratic institutions because it paralyzes civic participation before reforms begin.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'pernicious influence, pernicious myth, pernicious effect',
      synonyms: ['insidious', 'deleterious', 'malignant'],
      register: 'Moral Philosophy & Sociology'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-cefr-32',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'ephemeral',
    definition: 'Lasting for a very short time; transient, fleeting.',
    ipa: '/ɪˈfem.ər.əl/',
    vietnamese: 'phù du, chóng tàn, tồn tại trong chốc lát',
    contextSentence: 'Viral social media fame is notoriously ephemeral, fading as soon as algorithms reweight user attention.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'ephemeral nature, ephemeral pleasures, ephemeral trend',
      synonyms: ['evanescent', 'transitory', 'fleeting'],
      register: 'Literary Prose & Aesthetics'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-33',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'disparate',
    definition: 'Essentially different in kind; not allowing comparison; completely distinct.',
    ipa: '/ˈdɪs.pər.ət/',
    vietnamese: 'khác biệt hoàn toàn về bản chất, không cùng hệ quy chiếu',
    contextSentence: 'The synthesis paper unified disparate theories from condensed matter physics and algorithmic information theory.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'disparate elements, disparate backgrounds, unify disparate fields',
      synonyms: ['divergent', 'incompatible', 'heterogeneous'],
      register: 'Scholarly Synthesis'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-34',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'juxtapose',
    definition: 'Place or deal with close together for contrasting effect.',
    ipa: '/ˌdʒʌk.stəˈpəʊz/',
    vietnamese: 'đặt cạnh nhau để đối chiếu, làm bật lên sự tương phản',
    contextSentence: 'The photographer chose to juxtapose glittering luxury penthouses directly against sprawling riverside shantytowns.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'juxtapose two images, sharply juxtapose, side-by-side juxtaposition',
      synonyms: ['collocate', 'contrast', 'compare'],
      register: 'Artistic & Rhetorical Criticism'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-35',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'fastidious',
    definition: 'Very attentive to and concerned about accuracy and detail; very hard to please.',
    ipa: '/fæsˈtɪd.i.əs/',
    vietnamese: 'kỹ tính đến mức khắt khe, cầu toàn đến từng chi tiết',
    contextSentence: 'Her fastidious attention to typographical kerning and whitespace elevated the design system above its competitors.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'fastidious attention to detail, fastidious standards, fastidious researcher',
      synonyms: ['meticulous', 'scrupulous', 'exacting'],
      register: 'Professional Craftsmanship'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-cefr-36',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'esoteric',
    definition: 'Intended for or likely to be understood by only a small number of people with specialized knowledge or interest.',
    ipa: '/ˌes.əˈter.ɪk/',
    vietnamese: 'uyên thâm, mang tính chuyên biệt nội bộ, ít ai hiểu thấu',
    contextSentence: 'Category theory was once dismissed as esoteric mathematical fluff before finding foundational application in functional programming.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'esoteric knowledge, esoteric jargon, highly esoteric',
      synonyms: ['abstruse', 'arcane', 'recondite'],
      register: 'Academia & Epistemology'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-37',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'acquiesce',
    definition: 'Accept something reluctantly but without protest; submit passively.',
    ipa: '/ˌæk.wiˈes/',
    vietnamese: 'bằng lòng ngầm, miễn cưỡng chấp thuận không phản đối',
    contextSentence: 'Under intense board pressure, the founder chose to acquiesce to the hostile terms of the venture debt syndicate.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'acquiesce to demands, reluctantly acquiesce, acquiesce in the decision',
      synonyms: ['concede', 'yield', 'comply'],
      register: 'Diplomacy & Corporate Law'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-cefr-38',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'salient',
    definition: 'Most notable or important; prominently standing out from the background.',
    ipa: '/ˈseɪ.li.ənt/',
    vietnamese: 'nổi bật nhất, trọng yếu, đáng chú ý nhất',
    contextSentence: 'The executive summary distilled the four hundred-page environmental audit down to its three most salient vulnerabilities.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'salient features, salient points, most salient fact',
      synonyms: ['prominent', 'conspicuous', 'pivotal'],
      register: 'Executive Decision-Making'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-39',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'equanimity',
    definition: 'Mental calmness, composure, and evenness of temper, especially in a difficult situation.',
    ipa: '/ˌek.wəˈnɪm.ə.ti/',
    vietnamese: 'sự bình thản, tĩnh tâm thanh thản đối diện nghịch cảnh',
    contextSentence: 'The senior flight captain handled the dual engine failure with chilling equanimity, guiding the aircraft to safety.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'bear with equanimity, stoic equanimity, preserve one’s equanimity',
      synonyms: ['sangfroid', 'composure', 'serenity'],
      register: 'Stoic Ethics & High-Stakes Leadership'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-cefr-40',
    mode: 'CEFR_ASCENT',
    level: 3,
    wordOrChunk: 'inexorable',
    definition: 'Impossible to stop or prevent; unrelenting and impervious to plea or persuasion.',
    ipa: '/ɪnˈek.sər.ə.bəl/',
    vietnamese: 'không thể lay chuyển, không thể dừng lại, tất yếu',
    contextSentence: 'The inexorable demographic aging of the population presents structural insolvency perils for unfunded pensions.',
    breakdown: {
      cefrRank: 'C2 / GRE Mastery',
      collocates: 'inexorable march of time, inexorable logic, inexorable decline',
      synonyms: ['relentless', 'unstoppable', 'implacable'],
      register: 'Historiography & Philosophy'
    },
    isRemindCandidate: true
  }
];

// ============================================================================
// 3. GENERATE PARTICLE_LAB ITEMS (40 ITEMS: PARTICLES UP, OUT, DOWN, OFF, ON)
// ============================================================================

const particleLabItems = [
  // --- PARTICLE UP: Completion, Escalation, Emergence, Building (8 items) ---
  {
    id: 'vocab-pl-1',
    mode: 'PARTICLE_LAB',
    level: 1,
    wordOrChunk: 'scale up',
    definition: 'Increase the size, amount, or production capacity of something according to a fixed ratio or expanding demand.',
    ipa: '/skeɪl ʌp/',
    vietnamese: 'mở rộng quy mô, nâng công suất vận hành',
    contextSentence: 'The biotech venture secured forty million dollars to scale up bioreactor production for clinical distribution.',
    breakdown: {
      verb: 'scale (adjust size/grade)',
      particle: 'UP',
      semanticArchetype: 'Upward expansion & volumetric escalation',
      particleLogic: 'UP signifies movement from smaller baseline toward higher capacity or ceiling.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-2',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'wind up',
    definition: 'Bring an activity to an end, settle affairs; or find oneself in an unexpected situation or place.',
    ipa: '/waɪnd ʌp/',
    vietnamese: 'kết thúc, thanh lý giải thể (doanh nghiệp), rơi vào tình thế',
    contextSentence: 'If the firm fails to secure bridge financing, creditors will force the directors to wind up the business.',
    breakdown: {
      verb: 'wind (turn, coil tightly)',
      particle: 'UP',
      semanticArchetype: 'Completion & final closure',
      particleLogic: 'UP acts as a telic aspect marker: winding something completely until tension reaches final stop.'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-pl-3',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'bottle up',
    definition: 'Repress or conceal one’s feelings, emotions, or grievances over a prolonged period.',
    ipa: '/ˈbɒt.əl ʌp/',
    vietnamese: 'kìm nén cảm xúc, giữ kín nỗi uất ức trong lòng',
    contextSentence: 'Bottling up workplace grievances invariably leads to explosive burnout or sudden resignations.',
    breakdown: {
      verb: 'bottle (seal inside container)',
      particle: 'UP',
      semanticArchetype: 'Total containment & inward compression',
      particleLogic: 'UP indicates enclosing or sealing to the brim.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-4',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'summon up',
    definition: 'Manage to call forth, gather, or produce energy, courage, or a mental image from within oneself.',
    ipa: '/ˈsʌm.ən ʌp/',
    vietnamese: 'lấy hết can đảm, khơi dậy nguồn năng lượng/ký ức từ bên trong',
    contextSentence: 'She had to summon up all her moral fortitude to whistleblow against the fraudulent billing scheme.',
    breakdown: {
      verb: 'summon (authoritatively call)',
      particle: 'UP',
      semanticArchetype: 'Emergence to the surface',
      particleLogic: 'UP indicates bringing latent inner resources up into conscious manifestation.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-5',
    mode: 'PARTICLE_LAB',
    level: 3,
    wordOrChunk: 'chalk up',
    definition: 'Ascribe or attribute a success or failure to a particular cause or factor; register an achievement.',
    ipa: '/tʃɔːk ʌp/',
    vietnamese: 'ghi nhận chiến tích, quy nguyên nhân cho điều gì',
    contextSentence: 'Let’s chalk up the botched presentation to jet lag and inadequate rehearsals rather than incompetence.',
    breakdown: {
      verb: 'chalk (write on board)',
      particle: 'UP',
      semanticArchetype: 'Accumulation & scorekeeping ledger',
      particleLogic: 'UP refers to recording marks upward on a tavern credit or scoreboard ledger.'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-pl-6',
    mode: 'PARTICLE_LAB',
    level: 1,
    wordOrChunk: 'cheer up',
    definition: 'Become or cause someone to become less unhappy and more confident or animated.',
    ipa: '/tʃɪər ʌp/',
    vietnamese: 'phấn chấn lên, làm ai vui vẻ trở lại',
    contextSentence: 'Colleagues organized a surprise lunch to cheer up the lead developer after the delayed launch.',
    breakdown: {
      verb: 'cheer (express joy)',
      particle: 'UP',
      semanticArchetype: 'Elevation of emotional state',
      particleLogic: 'UP metaphorically associates positive affect with vertical ascent.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-7',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'whip up',
    definition: 'Deliberately excite or stimulate intense emotions or support, often recklessly; or prepare something quickly.',
    ipa: '/wɪp ʌp/',
    vietnamese: 'kích động (dư luận/cảm xúc), chuẩn bị vội vàng',
    contextSentence: 'Populist tabloids regularly whip up public hysteria over speculative immigration statistics.',
    breakdown: {
      verb: 'whip (strike violently, agitate)',
      particle: 'UP',
      semanticArchetype: 'Turbulent upward agitation',
      particleLogic: 'UP signifies whipping foam or emotional froth into high excitement.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-8',
    mode: 'PARTICLE_LAB',
    level: 1,
    wordOrChunk: 'burn up',
    definition: 'Be destroyed completely by heat or fire; or consume energy rapidly.',
    ipa: '/bɜːn ʌp/',
    vietnamese: 'thiêu rụi hoàn toàn, đốt sạch năng lượng',
    contextSentence: 'Spacecraft must enter the upper atmosphere at a precise angle, lest they burn up from thermal friction.',
    breakdown: {
      verb: 'burn (combust)',
      particle: 'UP',
      semanticArchetype: 'Total consumption / exhaustion',
      particleLogic: 'UP denotes completion (entire substance consumed until nothing remains).'
    },
    isRemindCandidate: false
  },

  // --- PARTICLE OUT: Disclosure, Elimination, Exhaustion, Resolution (8 items) ---
  {
    id: 'vocab-pl-9',
    mode: 'PARTICLE_LAB',
    level: 1,
    wordOrChunk: 'figure out',
    definition: 'Discover, solve, or understand something through thought, calculation, or investigation.',
    ipa: '/ˈfɪɡ.ər aʊt/',
    vietnamese: 'tìm ra lời giải, thấu suốt vấn đề qua suy nghĩ',
    contextSentence: 'It took the cryptanalysts six sleepless weeks to figure out the key exchange vulnerability.',
    breakdown: {
      verb: 'figure (calculate, reckon)',
      particle: 'OUT',
      semanticArchetype: 'Bringing clarity out of obscurity',
      particleLogic: 'OUT signifies extracting the solution from hidden darkness into the open.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-10',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'phase out',
    definition: 'Gradually stop using, providing, or producing something over a scheduled timetable.',
    ipa: '/feɪz aʊt/',
    vietnamese: 'loại bỏ từng bước theo lộ trình định sẵn',
    contextSentence: 'The automotive alliance committed to phase out internal combustion drivetrains by 2035.',
    breakdown: {
      verb: 'phase (stage over intervals)',
      particle: 'OUT',
      semanticArchetype: 'Removal beyond functional boundary',
      particleLogic: 'OUT marks ejection from the active inventory or ecosystem.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-11',
    mode: 'PARTICLE_LAB',
    level: 1,
    wordOrChunk: 'burn out',
    definition: 'Ruin one’s health or energy through severe, prolonged overwork; fail through overheating.',
    ipa: '/bɜːn aʊt/',
    vietnamese: 'kiệt sức, cháy sạch sinh lực vì làm việc quá độ',
    contextSentence: 'Junior doctors frequently burn out during grueling eighty-hour residency rotations.',
    breakdown: {
      verb: 'burn (consume fuel)',
      particle: 'OUT',
      semanticArchetype: 'Extinction of flame after fuel is exhausted',
      particleLogic: 'OUT denotes the flame dying when energy reserves are depleted to zero.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-12',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'single out',
    definition: 'Choose one person or thing from a group for special treatment, praise, or criticism.',
    ipa: '/ˈsɪŋ.ɡəl aʊt/',
    vietnamese: 'chọn riêng ra để biểu dương hoặc chỉ trích đích danh',
    contextSentence: 'It is unfair to single out one junior engineer for an outage caused by systemic pipeline bugs.',
    breakdown: {
      verb: 'single (isolate as individual)',
      particle: 'OUT',
      semanticArchetype: 'Extraction from the collective group',
      particleLogic: 'OUT emphasizes drawing the target outside the perimeter of the crowd.'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-pl-13',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'hammer out',
    definition: 'Negotiate or reach an agreement, resolution, or compromise through hard discussion and persistent effort.',
    ipa: '/ˈhæm.ər aʊt/',
    vietnamese: 'thương thảo đạt thỏa thuận sau nhiều tranh luận căng thẳng',
    contextSentence: 'Negotiators worked through the weekend to hammer out the bilateral free-trade treaty.',
    breakdown: {
      verb: 'hammer (strike metal repeatedly)',
      particle: 'OUT',
      semanticArchetype: 'Forging a shape from raw disagreement',
      particleLogic: 'OUT mimics a blacksmith hammering hot iron until a refined tool emerges.'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-pl-14',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'flesh out',
    definition: 'Add more details, substance, or evidence to an idea, skeleton plan, or argument.',
    ipa: '/fleʃ aʊt/',
    vietnamese: 'bổ sung chi tiết, bồi đắp da thịt cho một ý tưởng sơ khởi',
    contextSentence: 'The pitch deck establishes a compelling thesis, but the founders must flesh out their unit economics.',
    breakdown: {
      verb: 'flesh (put muscle/tissue on bone)',
      particle: 'OUT',
      semanticArchetype: 'Volumetric expansion of a skeleton outline',
      particleLogic: 'OUT indicates growing outward from minimal structure into full form.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-15',
    mode: 'PARTICLE_LAB',
    level: 1,
    wordOrChunk: 'rule out',
    definition: 'Exclude something from consideration or eliminate as a possibility.',
    ipa: '/ruːl aʊt/',
    vietnamese: 'loại trừ, bác bỏ khả năng',
    contextSentence: 'Detectives have ruled out arson after finding proof of an electrical conduit arc.',
    breakdown: {
      verb: 'rule (judge, decide)',
      particle: 'OUT',
      semanticArchetype: 'Drawing a boundary line of exclusion',
      particleLogic: 'OUT marks putting an option outside the realm of permitted consideration.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-16',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'iron out',
    definition: 'Resolve or settle minor problems, discrepancies, or difficulties.',
    ipa: '/ˈaɪən aʊt/',
    vietnamese: 'giải quyết các khúc mắc nhỏ, ủi phẳng bất đồng tồn đọng',
    contextSentence: 'The two legal teams met to iron out minor indemnification clauses before signing.',
    breakdown: {
      verb: 'iron (press smooth with heat)',
      particle: 'OUT',
      semanticArchetype: 'Flattening wrinkles to smoothness',
      particleLogic: 'OUT signifies driving wrinkles completely out of the fabric.'
    },
    isRemindCandidate: false
  },

  // --- PARTICLE DOWN: Suppression, Reduction, Settling, Specificity (8 items) ---
  {
    id: 'vocab-pl-17',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'crack down',
    definition: 'Take severe measures against individuals or behaviors that violate laws or rules.',
    ipa: '/kræk daʊn/',
    vietnamese: 'trấn áp, siết chặt kỷ cương, xử lý mạnh tay',
    contextSentence: 'The aviation authority decided to crack down on unauthorized drone operations near runways.',
    breakdown: {
      verb: 'crack (strike sharply)',
      particle: 'DOWN',
      semanticArchetype: 'Forceful downward suppression from authority',
      particleLogic: 'DOWN marks decisive vertical imposition of control.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-18',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'pare down',
    definition: 'Reduce something in size, amount, or scope by gradually cutting away superfluous elements.',
    ipa: '/peər daʊn/',
    vietnamese: 'cắt giảm tinh gọn, lược bỏ phần thừa',
    contextSentence: 'To survive the funding winter, leadership had to pare down operating expenses by thirty percent.',
    breakdown: {
      verb: 'pare (trim outer skin/edge)',
      particle: 'DOWN',
      semanticArchetype: 'Downward reduction to essential core',
      particleLogic: 'DOWN emphasizes shrinking the total mass toward ground level.'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-pl-19',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'boil down',
    definition: 'Reduce a complex situation, argument, or text to its most fundamental elements.',
    ipa: '/bɔɪl daʊn/',
    vietnamese: 'quy lại thành, rút cục chỉ còn là bản chất cốt lõi',
    contextSentence: 'The entire five-day symposium boils down to a single question: who controls AI governance?',
    breakdown: {
      verb: 'boil (heat liquid to evaporation)',
      particle: 'DOWN',
      semanticArchetype: 'Evaporating volume until potent essence remains',
      particleLogic: 'DOWN indicates liquid level dropping until only concentrated solute is left.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-20',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'nail down',
    definition: 'Finalize, confirm, or define terms precisely and conclusively.',
    ipa: '/neɪl daʊn/',
    vietnamese: 'chốt hạ dứt điểm, cố định chi tiết không cho thay đổi',
    contextSentence: 'We must nail down the delivery milestones before submitting the formal RFP response.',
    breakdown: {
      verb: 'nail (fasten firmly with hardware)',
      particle: 'DOWN',
      semanticArchetype: 'Fixing in place against displacement',
      particleLogic: 'DOWN denotes fastening something securely onto the floor or surface so it cannot shift.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-21',
    mode: 'PARTICLE_LAB',
    level: 1,
    wordOrChunk: 'cool down',
    definition: 'Become less hot; or become calmer after high excitement, tension, or rage.',
    ipa: '/kuːl daʊn/',
    vietnamese: 'hạ nhiệt, bình tĩnh trở lại sau cơn giận',
    contextSentence: 'The mediator called a recess to allow both agitated factions to cool down.',
    breakdown: {
      verb: 'cool (decrease temperature)',
      particle: 'DOWN',
      semanticArchetype: 'Downward descent from feverish hyperactivity',
      particleLogic: 'DOWN traces thermal deceleration toward resting baseline.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-22',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'narrow down',
    definition: 'Reduce the number of possibilities or choices by filtering out unsuitable ones.',
    ipa: '/ˈnær.əʊ daʊn/',
    vietnamese: 'thu hẹp danh sách lựa chọn/phạm vi',
    contextSentence: 'The search committee managed to narrow down two hundred applicants to three finalists.',
    breakdown: {
      verb: 'narrow (make smaller in width)',
      particle: 'DOWN',
      semanticArchetype: 'Funneling inward toward pinpoint accuracy',
      particleLogic: 'DOWN marks funneling volume from broad mouth downward to narrow tip.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-23',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'play down',
    definition: 'Make something seem less important, serious, or consequential than it really is.',
    ipa: '/pleɪ daʊn/',
    vietnamese: 'nói giảm nói tránh, tìm cách hạ thấp mức độ nghiêm trọng',
    contextSentence: 'Corporate spokespeople attempted to play down the severity of the user data leak.',
    breakdown: {
      verb: 'play (perform, portray)',
      particle: 'DOWN',
      semanticArchetype: 'Depreciating perceived gravity',
      particleLogic: 'DOWN positions the topic lower on the scale of public urgency.'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-pl-24',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'tone down',
    definition: 'Make a speech, piece of writing, or opinion less harsh, extreme, or offensive.',
    ipa: '/təʊn daʊn/',
    vietnamese: 'làm dịu giọng, tiết chế lời lẽ bớt gay gắt',
    contextSentence: 'The legal team advised the marketing head to tone down aggressive advertising claims about rivals.',
    breakdown: {
      verb: 'tone (adjust acoustic or emotional pitch)',
      particle: 'DOWN',
      semanticArchetype: 'Lowering affective volume',
      particleLogic: 'DOWN dampens abrasive amplitudes to moderate pitch.'
    },
    isRemindCandidate: false
  },

  // --- PARTICLE OFF: Departure, Cancellation, Deterrence, Completion (8 items) ---
  {
    id: 'vocab-pl-25',
    mode: 'PARTICLE_LAB',
    level: 1,
    wordOrChunk: 'call off',
    definition: 'Cancel an event, arrangement, or planned course of action.',
    ipa: '/kɔːl ɒf/',
    vietnamese: 'hủy bỏ sự kiện, đình chỉ kế hoạch',
    contextSentence: 'Torrential monsoons forced event organizers to call off the marathon.',
    breakdown: {
      verb: 'call (summon, announce)',
      particle: 'OFF',
      semanticArchetype: 'Severing commitment',
      particleLogic: 'OFF disconnects the event from the execution schedule.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-26',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'ward off',
    definition: 'Prevent someone or something from harming you or causing difficulty; avert.',
    ipa: '/wɔːd ɒf/',
    vietnamese: 'ngăn ngừa, phòng ngừa mối nguy hại, đẩy lui rủi ro',
    contextSentence: 'Regular cardiovascular exercise and balanced sleep help ward off metabolic degeneration.',
    breakdown: {
      verb: 'ward (guard, defend boundary)',
      particle: 'OFF',
      semanticArchetype: 'Repelling an approaching threat outward',
      particleLogic: 'OFF turns the encroaching danger away from personal space.'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-pl-27',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'shrug off',
    definition: 'Dismiss something as unimportant or treat an insult, injury, or setback with indifferent unconcern.',
    ipa: '/ʃrʌɡ ɒf/',
    vietnamese: 'phủi tay coi như không, gạt bỏ lo lắng/lời chỉ trích',
    contextSentence: 'Veteran executives learn to shrug off sensationalist blog criticisms and focus on fundamentals.',
    breakdown: {
      verb: 'shrug (raise shoulders in indifference)',
      particle: 'OFF',
      semanticArchetype: 'Shaking a burden off one’s shoulders',
      particleLogic: 'OFF signifies casting the weight away so it cannot cling.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-28',
    mode: 'PARTICLE_LAB',
    level: 1,
    wordOrChunk: 'pay off',
    definition: 'Yield good results, succeed; or settle a debt or balance completely.',
    ipa: '/peɪ ɒf/',
    vietnamese: 'đem lại thành quả xứng đáng, trả dứt điểm nợ nần',
    contextSentence: 'Ten years of disciplined deliberate practice finally paid off when she won the international concerto gold.',
    breakdown: {
      verb: 'pay (discharge obligation)',
      particle: 'OFF',
      semanticArchetype: 'Complete clearing of liability / dividend harvest',
      particleLogic: 'OFF denotes crossing out the ledger entry completely.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-29',
    mode: 'PARTICLE_LAB',
    level: 1,
    wordOrChunk: 'set off',
    definition: 'Begin a journey; or cause a series of events, an alarm, or an explosion to trigger.',
    ipa: '/set ɒf/',
    vietnamese: 'khởi hành, kích hoạt chuỗi phản ứng/chuông báo',
    contextSentence: 'A sudden spike in consumer defaults set off panic throughout regional banking desks.',
    breakdown: {
      verb: 'set (place, initiate)',
      particle: 'OFF',
      semanticArchetype: 'Launching into motion from rest',
      particleLogic: 'OFF marks departure from static equilibrium into dynamic action.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-30',
    mode: 'PARTICLE_LAB',
    level: 3,
    wordOrChunk: 'stave off',
    definition: 'Avert or delay something dangerous, difficult, or unwelcome temporarily.',
    ipa: '/steɪv ɒf/',
    vietnamese: 'tạm thời đẩy lui, ngăn chặn được mối nguy trong gang tấc',
    contextSentence: 'Emergency central bank liquidity injections staved off an immediate run on mutual funds.',
    breakdown: {
      verb: 'stave (break with a heavy staff/stick)',
      particle: 'OFF',
      semanticArchetype: 'Fighting off assailants with a barrier staff',
      particleLogic: 'OFF maintains defensive separation between predator and prey.'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-pl-31',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'write off',
    definition: 'Dismiss someone or something as a failure or loss; cancel a bad debt from accounting books.',
    ipa: '/raɪt ɒf/',
    vietnamese: 'xóa nợ xấu, xem như đã mất trắng hoặc hoàn toàn thất bại',
    contextSentence: 'Financial analysts cautioned that it was premature to write off the electric vehicle startup.',
    breakdown: {
      verb: 'write (inscribe in ledger)',
      particle: 'OFF',
      semanticArchetype: 'Deleting an asset from active capitalization',
      particleLogic: 'OFF signifies removing an item off the active ledger.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-32',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'peel off',
    definition: 'Separate from a main group or trajectory; or remove a layer smoothly.',
    ipa: '/piːl ɒf/',
    vietnamese: 'tách lẻ khỏi đội hình, bóc tách ra',
    contextSentence: 'During the high-speed flight demonstration, the wingman peeled off to initiate a solo climbing roll.',
    breakdown: {
      verb: 'peel (strip skin away)',
      particle: 'OFF',
      semanticArchetype: 'Graceful departure along divergent tangent',
      particleLogic: 'OFF denotes cleanly separating from the host body.'
    },
    isRemindCandidate: false
  },

  // --- PARTICLE ON: Continuation, Reliance, Burden, Progression (8 items) ---
  {
    id: 'vocab-pl-33',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'bank on',
    definition: 'Rely with confidence on someone or something happening; stake plans on an assumption.',
    ipa: '/bæŋk ɒn/',
    vietnamese: 'trông cậy vào, đặt cược niềm tin vào điều gì',
    contextSentence: 'The founders banked on rapid organic word-of-mouth rather than investing in paid acquisition.',
    breakdown: {
      verb: 'bank (deposit collateral/trust)',
      particle: 'ON',
      semanticArchetype: 'Resting weight upon a supportive substrate',
      particleLogic: 'ON denotes placing one’s entire security directly on top of an assumption.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-34',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'latch on',
    definition: 'Attach oneself firmly to something; comprehend an idea quickly; adopt an interest avidly.',
    ipa: '/lætʃ ɒn/',
    vietnamese: 'bám chặt lấy cơ hội, nhanh chóng nắm bắt ý tưởng',
    contextSentence: 'Venture funds quickly latched on to generative synthetic media, pouring billions into pre-revenue startups.',
    breakdown: {
      verb: 'latch (fasten mechanically)',
      particle: 'ON',
      semanticArchetype: 'Hooking onto a moving vehicle or idea',
      particleLogic: 'ON indicates surface coupling for sustained transit.'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-pl-35',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'spur on',
    definition: 'Encourage someone to continue or to make greater efforts; stimulate progress.',
    ipa: '/spɜːr ɒn/',
    vietnamese: 'thúc đẩy, khích lệ ai tiến lên phía trước',
    contextSentence: 'Fierce competition from open-source alternatives spurred on the proprietary labs to accelerate releases.',
    breakdown: {
      verb: 'spur (prick horse with rider’s heel spur)',
      particle: 'ON',
      semanticArchetype: 'Propelling forward momentum',
      particleLogic: 'ON marks persistent motion along the vector of travel.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-36',
    mode: 'PARTICLE_LAB',
    level: 1,
    wordOrChunk: 'bring on',
    definition: 'Cause something, typically unpleasant or challenging, to happen or develop; or introduce.',
    ipa: '/brɪŋ ɒn/',
    vietnamese: 'gây ra (bệnh tật, khủng hoảng), đem lại hậu quả xấu',
    contextSentence: 'Chronic sleep deprivation can bring on cognitive fog and severe cardiovascular stress.',
    breakdown: {
      verb: 'bring (carry, cause)',
      particle: 'ON',
      semanticArchetype: 'Delivering a state directly onto the subject',
      particleLogic: 'ON denotes landing impact onto the victim or surface.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-37',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'dwell on',
    definition: 'Think, speak, or write about something, especially an unhappy or stressful subject, at excessive length.',
    ipa: '/dwel ɒn/',
    vietnamese: 'day dứt mãi, chìm đắm suy nghĩ tiêu cực về quá khứ',
    contextSentence: 'Productive leaders dissect failed experiments dispassionately without dwelling on personal remorse.',
    breakdown: {
      verb: 'dwell (reside, linger in place)',
      particle: 'ON',
      semanticArchetype: 'Remaining static atop a painful point',
      particleLogic: 'ON marks lingering immobile upon a single focal spot.'
    },
    isRemindCandidate: true
  },
  {
    id: 'vocab-pl-38',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'frown on',
    definition: 'Disapprove of something morally, culturally, or professionally.',
    ipa: '/fraʊn ɒn/',
    vietnamese: 'không tán thành, cau mày bất bình trước hành vi nào đó',
    contextSentence: 'Peer-reviewed academic communities frown on undisclosed use of generative text in grant applications.',
    breakdown: {
      verb: 'frown (contract brows in displeasure)',
      particle: 'ON',
      semanticArchetype: 'Directing moral censure downward onto an act',
      particleLogic: 'ON directs the negative visual gaze down upon the offender.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-39',
    mode: 'PARTICLE_LAB',
    level: 2,
    wordOrChunk: 'embark on',
    definition: 'Start, begin, or initiate a course of action, project, or journey.',
    ipa: '/ɪmˈbɑːk ɒn/',
    vietnamese: 'bắt tay thực hiện, dấn thân vào một hành trình lớn',
    contextSentence: 'The engineering team is about to embark on a multi-year migration to microservices.',
    breakdown: {
      verb: 'embark (board a sea vessel)',
      particle: 'ON',
      semanticArchetype: 'Stepping aboard a voyage of departure',
      particleLogic: 'ON marks establishing presence upon the ship of venture.'
    },
    isRemindCandidate: false
  },
  {
    id: 'vocab-pl-40',
    mode: 'PARTICLE_LAB',
    level: 1,
    wordOrChunk: 'press on',
    definition: 'Continue moving forward or making progress, especially in a determined manner despite difficulties.',
    ipa: '/pres ɒn/',
    vietnamese: 'kiên cường tiến bước, tiếp tục bền bỉ vượt gian khó',
    contextSentence: 'Despite debilitating headwinds and freezing sleet, the expedition pressed on toward the mountain ridge.',
    breakdown: {
      verb: 'press (push with force)',
      particle: 'ON',
      semanticArchetype: 'Relentless forward momentum',
      particleLogic: 'ON signifies continuity along the trajectory despite resistance.'
    },
    isRemindCandidate: false
  }
];

const allVocab = [...rootForgeItems, ...cefrAscentItems, ...particleLabItems];

// Write vocabulary.json
fs.writeFileSync(
  path.join(dataDir, 'vocabulary.json'),
  JSON.stringify(allVocab, null, 2),
  'utf-8'
);
console.log(`[GENERATOR] Successfully created vocabulary.json with ${allVocab.length} items across 3 modes.`);


// ============================================================================
// 2. GENERATE reading.json (AUTHENTIC 4-PASS INTENSIVE ARTICLES FROM reading.md)
// ============================================================================

const readingData = {
  title: 'Intensive Reading & Contextual Sentence Mining Dossier',
  pedagogy: '4-Pass Intensive Deconstruction & i+1 Spaced Repetition Mining (Krashen Hypothesis & Syntactic Reverse Engineering)',
  articles: [
    {
      id: 'reading-art-1',
      title: 'The Epistemic Commons and the Economics of Synthetic Abundance',
      stage: 'Stage 3: Advanced Competency (CEFR C1)',
      cefrLevel: 'C1',
      genre: 'Philosophy of Technology & Epistemology',
      source: 'Adapted from long-form essays in The Atlantic & Aeon Essays',
      wordCount: 420,
      readingTime: '3.5 min @ 120 WPM (Intensive)',
      content: `In an era defined by the ubiquitous proliferation of generative synthetic media, the human epistemic commons faces an unprecedented structural crisis. For centuries, institutional trust rested upon an implicit perceptual heuristic: seeing was believing. When an evidentiary recording captured a physical event, judicial bodies and civic assemblies could legitimately anchor their deliberative judgment upon its factual veracity.

Today, however, algorithmic generation tools have rendered authentic audio-visual artifacts virtually indistinguishable from synthesized illusions. This disruption does not merely deceive the gullible; rather, its most pernicious consequence is what legal scholars term the "liar’s dividend." When any recording can be convincingly fabricated, culpable actors can effortlessly dismiss genuine documentation of wrongdoing as algorithmic forgery. Consequently, the social contract descends into pervasive cynicism, where skepticism ceases to be a healthy intellectual virtue and degenerates into an excuse for total disengagement.

To mitigate this epistemic decay, technologists advocate for cryptographic provenance standards anchored directly into hardware recording chips. Yet technological barriers alone cannot restore civic coherence. Unless educational systems institutionalize rigorous critical literacy—training citizens to scrutinize rhetorical intent, trace citation genealogies, and distinguish empirical verification from seductive resonance—society risks fracturing into insular echo chambers that obviate the very possibility of consensus reality.`,
      fourPassProtocol: {
        pass1ColdRead: {
          thesisGist: 'Generative AI degrades public trust not only by deceiving individuals but by enabling wrongdoers to dismiss real evidence (the liar’s dividend), requiring both cryptographic hardware verification and deep cognitive literacy to defend.',
          markedLexicalTargets: ['epistemic commons', 'ubiquitous proliferation', 'perceptual heuristic', 'factual veracity', 'pernicious consequence', 'liar’s dividend', 'culpable actors', 'cryptographic provenance', 'obviate consensus reality'],
          comprehensionChecks: [
            {
              question: 'Why is the "liar’s dividend" described as the most pernicious consequence of synthetic media?',
              answer: 'It allows guilty individuals to avoid accountability by claiming that authentic incriminating evidence is merely an AI fabrication.'
            },
            {
              question: 'What technological solution is proposed in paragraph 3?',
              answer: 'Cryptographic provenance standards embedded directly into camera and recording hardware.'
            },
            {
              question: 'According to the author, why is technology alone insufficient to preserve the epistemic commons?',
              answer: 'Without critical literacy to evaluate intent and evidence, society will still fracture into cynical echo chambers.'
            }
          ]
        },
        pass2SyntaxDissection: [
          {
            sentenceIndex: 1,
            sentence: 'When any recording can be convincingly fabricated, culpable actors can effortlessly dismiss genuine documentation of wrongdoing as algorithmic forgery.',
            coreSVO: {
              subject: 'culpable actors',
              verb: 'can dismiss',
              objectOrComplement: 'genuine documentation of wrongdoing as algorithmic forgery'
            },
            subordinateClauses: [
              {
                type: 'Adverbial Clause of Condition / Time',
                clause: 'When any recording can be convincingly fabricated',
                function: 'Establishes the structural technological precondition for bad-faith denial.'
              }
            ],
            syntacticAnalysis: 'Fronted subordinate temporal clause ("When...") sets the stage; main clause employs paired adverbs ("convincingly", "effortlessly") and nominal compounds ("algorithmic forgery") to emphasize the asymmetric ease of bad-faith defense.'
          },
          {
            sentenceIndex: 2,
            sentence: 'Unless educational systems institutionalize rigorous critical literacy—training citizens to scrutinize rhetorical intent, trace citation genealogies, and distinguish empirical verification from seductive resonance—society risks fracturing into insular echo chambers that obviate the very possibility of consensus reality.',
            coreSVO: {
              subject: 'society',
              verb: 'risks',
              objectOrComplement: 'fracturing into insular echo chambers'
            },
            subordinateClauses: [
              {
                type: 'Conditional Subordinate Clause',
                clause: 'Unless educational systems institutionalize rigorous critical literacy',
                function: 'Sets the non-negotiable educational intervention.'
              },
              {
                type: 'Parenthetical Participial Elaborations (Em-dash)',
                clause: 'training citizens to scrutinize..., trace..., and distinguish...',
                function: 'Triadic parallel verbal infinitive phrases delineating the exact cognitive actions.'
              },
              {
                type: 'Relative Restrictive Clause',
                clause: 'that obviate the very possibility of consensus reality',
                function: 'Qualifies the fatal civilizational consequence of the echo chambers.'
              }
            ],
            syntacticAnalysis: 'Periodic sentence structure with em-dash appositive expansion. The syntactic tension builds through the triadic verbs ("scrutinize", "trace", "distinguish") before resolving into the existential main clause risk.'
          }
        ],
        pass3SentenceMining: [
          {
            id: 'mine-art1-1',
            targetWord: 'epistemic',
            partOfSpeech: 'adjective',
            ipa: '/ˌep.ɪˈstiː.mɪk/',
            definition: 'Relating to knowledge or to the degree of its validation and grounds for truth.',
            vietnamese: 'thuộc về tri thức luận, liên quan đến tính xác thực của nhận thức',
            contextSentence: 'In an era defined by the ubiquitous proliferation of generative synthetic media, the human epistemic commons faces an unprecedented structural crisis.',
            collocations: ['epistemic commons', 'epistemic crisis', 'epistemic vigilance', 'epistemic framework'],
            etymology: 'Greek episteme (knowledge, understanding) from epistasthai (to know how).'
          },
          {
            id: 'mine-art1-2',
            targetWord: 'pernicious',
            partOfSpeech: 'adjective',
            ipa: '/pəˈnɪʃ.əs/',
            definition: 'Having a harmful effect, especially in a gradual, insidious, or subtle way.',
            vietnamese: 'nguy hại ngấm ngầm, độc hại ăn sâu dần theo thời gian',
            contextSentence: 'This disruption does not merely deceive the gullible; rather, its most pernicious consequence is what legal scholars term the "liar’s dividend."',
            collocations: ['pernicious consequence', 'pernicious influence', 'pernicious myth'],
            etymology: 'Latin perniciosus (destructive), from pernicies (ruin, destruction).'
          },
          {
            id: 'mine-art1-3',
            targetWord: 'veracity',
            partOfSpeech: 'noun',
            ipa: '/vəˈræs.ə.ti/',
            definition: 'Conformity to facts; accuracy, truthfulness, and habitual adherence to truth.',
            vietnamese: 'tính xác thực, chân thực, sự phù hợp với sự thật khách quan',
            contextSentence: 'Civic assemblies could legitimately anchor their deliberative judgment upon its factual veracity.',
            collocations: ['factual veracity', 'question the veracity of', 'verify the veracity'],
            etymology: 'Latin veracitas from verax (truthful), from verus (true).'
          },
          {
            id: 'mine-art1-4',
            targetWord: 'obviate',
            partOfSpeech: 'verb',
            ipa: '/ˈɒb.vi.eɪt/',
            definition: 'Remove a need or difficulty; anticipate and make unnecessary.',
            vietnamese: 'loại bỏ sự cần thiết của điều gì, thủ tiêu khả năng',
            contextSentence: 'Society risks fracturing into insular echo chambers that obviate the very possibility of consensus reality.',
            collocations: ['obviate the need for', 'obviate the possibility of', 'effectively obviate'],
            etymology: 'Latin obviare (act to meet or prevent), from ob (against) + via (way).'
          }
        ],
        pass4Synthesis: {
          modelPrécis: 'Generative media fundamentally erodes institutional trust by providing culpable actors with plausible deniability (the liar’s dividend). Countering this epistemic decay requires not merely cryptographic hardware provenance standards, but cultivating rigorous civic critical literacy to evaluate evidence, lest hyper-polarized echo chambers permanently obviate consensus reality.',
          incorporatedVocabulary: ['epistemic', 'liar’s dividend', 'provenance', 'obviate', 'veracity'],
          syntacticReconstruction: 'Although hardware-level cryptographic signatures can verify digital provenance, they cannot forestall democratic paralysis unless citizens cultivate the analytical acumen to scrutinize rhetorical manipulation.'
        }
      }
    },
    {
      id: 'reading-art-2',
      title: 'Cognitive Bandwidth, Subvocalization, and the Mechanics of Deep Reading',
      stage: 'Stage 4: Mastery & Polymathy (CEFR C2)',
      cefrLevel: 'C2',
      genre: 'Cognitive Neurobiology & Educational Psychology',
      source: 'Adapted from Nature Neuroscience Commentary & Cognitive Literary Theory',
      wordCount: 460,
      readingTime: '3.8 min @ 120 WPM (Intensive)',
      content: `The human brain did not evolve a dedicated neurological circuit for deciphering printed typography; instead, literacy is an extraordinary feat of neuronal recycling, repurposing visual object recognition pathways alongside ancient phonological and semantic networks. Consequently, the transition from laborious decoding to effortless sight recognition hinges entirely upon how cognitive bandwidth is allocated across working memory.

At foundational stages, readers are bottlenecked by subvocalization—the covert auditory articulation of every printed syllable in the mind's inner ear. While subvocalization provides essential phonological scaffolding for novice comprehenders grappling with complex syntax, its persistence at advanced stages imposes a severe velocity ceiling of roughly two hundred words per minute. True reading mastery requires suppressing this involuntary acoustic simulation on familiar syntactic terrain, thereby liberating cognitive resources for high-order inference, contextual synthesis, and rhetorical evaluation.

Moreover, deliberate reading differs profoundly from the distracted skimming conditioned by digital hyperlinks. In extensive reading, immersion in rich syntactic architectures cultivates deep cognitive patience, allowing the brain to internalize subtle register shifts and sentence structures organically through Krashen’s celebrated input hypothesis ($i+1$). Conversely, intensive reading acts as the surgeon’s scalpel: by subjecting difficult paragraphs to rigorous clause deconstruction and active sentence mining, the polymath converts fleeting encounters with unfamiliar lexical items into durable, retrievable engrams. Without this dual equilibrium between extensive immersion and intensive dissection, genuine polyglot fluency remains an elusive mirage.`,
      fourPassProtocol: {
        pass1ColdRead: {
          thesisGist: 'Reading is an acquired neuronal recycling process where overcoming the speed limit of subvocalization frees working memory for high-level analysis; true mastery demands a balanced regime of extensive immersion and intensive syntactic dissection.',
          markedLexicalTargets: ['neuronal recycling', 'cognitive bandwidth', 'subvocalization', 'phonological scaffolding', 'involuntary acoustic simulation', 'high-order inference', 'input hypothesis', 'retrievable engrams'],
          comprehensionChecks: [
            {
              question: 'Why does the text state that the human brain did not evolve a dedicated reading circuit?',
              answer: 'Because reading is an evolutionary recent invention that repurposes existing visual and phonological brain regions (neuronal recycling).'
            },
            {
              question: 'What is the role of subvocalization, and why does it become a hindrance at advanced stages?',
              answer: 'It helps novices decode words through inner speech, but caps reading speed at ~200 WPM, consuming cognitive bandwidth needed for higher inference.'
            },
            {
              question: 'What metaphor illustrates the complementary nature of extensive and intensive reading?',
              answer: 'Extensive reading provides deep cognitive immersion (rich terrain), while intensive reading functions as the surgeon’s scalpel (precise clause dissection).'
            }
          ]
        },
        pass2SyntaxDissection: [
          {
            sentenceIndex: 1,
            sentence: 'While subvocalization provides essential phonological scaffolding for novice comprehenders grappling with complex syntax, its persistence at advanced stages imposes a severe velocity ceiling of roughly two hundred words per minute.',
            coreSVO: {
              subject: 'its persistence at advanced stages',
              verb: 'imposes',
              objectOrComplement: 'a severe velocity ceiling of roughly two hundred words per minute'
            },
            subordinateClauses: [
              {
                type: 'Concessive Adverbial Clause',
                clause: 'While subvocalization provides essential phonological scaffolding for novice comprehenders',
                function: 'Acknowledges the pedagogical utility of subvocalization for beginners before contrasting its advanced drawback.'
              },
              {
                type: 'Participial Phrase Modifier',
                clause: 'grappling with complex syntax',
                function: 'Post-modifies "novice comprehenders", describing their cognitive struggle.'
              }
            ],
            syntacticAnalysis: 'Concessive introductory clause ("While...") balances the tension between developmental necessity and long-term limitation. Main clause utilizes nominal abstractions ("persistence", "velocity ceiling") to establish quantitative clarity.'
          },
          {
            sentenceIndex: 2,
            sentence: 'By subjecting difficult paragraphs to rigorous clause deconstruction and active sentence mining, the polymath converts fleeting encounters with unfamiliar lexical items into durable, retrievable engrams.',
            coreSVO: {
              subject: 'the polymath',
              verb: 'converts',
              objectOrComplement: 'fleeting encounters with unfamiliar lexical items into durable, retrievable engrams'
            },
            subordinateClauses: [
              {
                type: 'Instrumental Prepositional Participial Phrase',
                clause: 'By subjecting difficult paragraphs to rigorous clause deconstruction and active sentence mining',
                function: 'Specifies the deliberate procedural methodology.'
              }
            ],
            syntacticAnalysis: 'Fronted instrumental phrase leads directly into the transformative verb "converts X into Y", contrasting the ephemeral ("fleeting encounters") with the permanent ("durable, retrievable engrams").'
          }
        ],
        pass3SentenceMining: [
          {
            id: 'mine-art2-1',
            targetWord: 'subvocalization',
            partOfSpeech: 'noun',
            ipa: '/ˌsʌb.vəʊ.kəl.aɪˈzeɪ.ʃən/',
            definition: 'The internal, silent articulation of words while reading.',
            vietnamese: 'sự phát âm thầm trong đầu khi đọc chữ',
            contextSentence: 'At foundational stages, readers are bottlenecked by subvocalization—the covert auditory articulation of every printed syllable in the mind\'s inner ear.',
            collocations: ['suppress subvocalization', 'eliminate subvocalization', 'auditory subvocalization'],
            etymology: 'Prefix sub- (under) + vocalize (utter sound, Latin vocalis).'
          },
          {
            id: 'mine-art2-2',
            targetWord: 'scaffolding',
            partOfSpeech: 'noun',
            ipa: '/ˈskæf.əl.dɪŋ/',
            definition: 'Temporary support provided to learners to assist them in achieving higher levels of comprehension.',
            vietnamese: 'khung nâng đỡ sư phạm, giá đỡ hỗ trợ học tập tạm thời',
            contextSentence: 'Subvocalization provides essential phonological scaffolding for novice comprehenders grappling with complex syntax.',
            collocations: ['instructional scaffolding', 'cognitive scaffolding', 'phonological scaffolding'],
            etymology: 'Old French eschafaut (viewing platform, scaffold).'
          },
          {
            id: 'mine-art2-3',
            targetWord: 'engram',
            partOfSpeech: 'noun',
            ipa: '/ˈen.ɡræm/',
            definition: 'A hypothetical permanent trace left by an experience in the brain’s neural tissue; a memory trace.',
            vietnamese: 'dấu vết ký ức thần kinh, vết hằn ký ức sinh học trong não',
            contextSentence: 'The polymath converts fleeting encounters with unfamiliar lexical items into durable, retrievable engrams.',
            collocations: ['memory engram', 'neural engram', 'retrievable engrams'],
            etymology: 'Greek en (in) + gramma (letter, that which is written).'
          },
          {
            id: 'mine-art2-4',
            targetWord: 'subordinate',
            partOfSpeech: 'adjective / verb',
            ipa: '/səˈbɔː.dɪ.nət/',
            definition: 'Lower in rank, importance, or syntactic dependency.',
            vietnamese: 'phụ thuộc, thứ yếu (trong cú pháp: mệnh đề phụ)',
            contextSentence: 'Immersion in rich syntactic architectures allows the brain to parse complex subordinate clauses without conscious strain.',
            collocations: ['subordinate clause', 'subordinate conjunction', 'subordinate role'],
            etymology: 'Latin sub- (under) + ordinare (to order, rank).'
          }
        ],
        pass4Synthesis: {
          modelPrécis: 'Reading recruits repurposed neural pathways where early subvocalization establishes vital phonological scaffolding yet restricts reading velocity if unsuppressed. Achieving polymathic reading demands balancing extensive immersion for intuitive pattern absorption with intensive clause dissection to forge durable, retrievable memory engrams from challenging syntax.',
          incorporatedVocabulary: ['subvocalization', 'scaffolding', 'engram', 'neuronal recycling', 'velocity ceiling'],
          syntacticReconstruction: 'Rather than treating subvocalization as a permanent deficit, advanced readers leverage it selectively for dense poetic prose while suppressing it during analytical scanning.'
        }
      }
    },
    {
      id: 'reading-art-3',
      title: 'The Architecture of Solitude and Attention in Knowledge Work',
      stage: 'Stage 3: Advanced Competency (CEFR C1)',
      cefrLevel: 'C1',
      genre: 'Cultural Sociology & Deep Work Philosophy',
      source: 'Adapted from Cal Newport & Joan Didion essay anthologies',
      wordCount: 440,
      readingTime: '3.6 min @ 120 WPM (Intensive)',
      content: `In the contemporary knowledge economy, hyper-connectivity is frequently conflated with organizational velocity. Open-plan offices and asynchronous notification streams promise frictionless collaboration, yet their insidious side effect is the systematic fragmentation of human attention. When deep, uninterrupted solitude is eliminated from daily practice, cognitive throughput degrades from rigorous original synthesis into reactive, performative busywork.

Psychologists observe that switching focus between collaborative pings and analytical contemplation leaves an exhausting residue known as "attention residue." Even a brief five-second glance at an inbox notification traps working memory in a compromised state for over fifteen minutes. Under such fragmented conditions, knowledge workers lose the capacity for sustained syntactic immersion—the precise mental patience required to draft airtight legal briefs, deconstruct complex mathematical proofs, or read dense philosophical treatises without drifting into digital escapism.

Reclaiming cognitive autonomy requires institutionalizing deliberate boundaries. Elite practitioners do not merely resist distraction through sheer willpower; they architect low-entropy physical and digital sanctuaries. By scheduling multi-hour blocks of sacred monastic silence and treating attention as a finite, non-renewable capital asset, the modern intellectual safeguards the psychological conditions under which profound insight can quietly germinate.`,
      fourPassProtocol: {
        pass1ColdRead: {
          thesisGist: 'Constant workplace connectivity destroys the sustained solitude necessary for complex knowledge work via attention residue, requiring deliberate environmental architecture rather than mere willpower to defend deep cognitive focus.',
          markedLexicalTargets: ['conflated with', 'insidious side effect', 'cognitive throughput', 'attention residue', 'syntactic immersion', 'cognitive autonomy', 'low-entropy sanctuaries', 'germinate'],
          comprehensionChecks: [
            {
              question: 'What false equivalence does the knowledge economy make regarding connectivity?',
              answer: 'It mistakenly conflates hyper-connectivity with genuine organizational velocity.'
            },
            {
              question: 'How does "attention residue" impair analytical capability?',
              answer: 'Even a 5-second distraction leaves working memory partially tied up with the previous task for over 15 minutes.'
            },
            {
              question: 'What is the author\'s view on willpower versus environmental design?',
              answer: 'Willpower is insufficient; elite practitioners succeed by deliberately architecting low-entropy, distraction-free physical and digital sanctuaries.'
            }
          ]
        },
        pass2SyntaxDissection: [
          {
            sentenceIndex: 1,
            sentence: 'Open-plan offices and asynchronous notification streams promise frictionless collaboration, yet their insidious side effect is the systematic fragmentation of human attention.',
            coreSVO: {
              subject: 'Open-plan offices and asynchronous notification streams / their insidious side effect',
              verb: 'promise / is',
              objectOrComplement: 'frictionless collaboration / the systematic fragmentation of human attention'
            },
            subordinateClauses: [
              {
                type: 'Coordinated Adversative Compound Sentence',
                clause: 'yet their insidious side effect is...',
                function: 'Contrasts corporate marketing promises against the harsh neurological reality.'
              }
            ],
            syntacticAnalysis: 'Compound coordination linked by the adversative conjunction "yet". The syntactic juxtaposition pits the aspirational adjective "frictionless" directly against the damning nominal phrase "systematic fragmentation".'
          },
          {
            sentenceIndex: 2,
            sentence: 'By scheduling multi-hour blocks of sacred monastic silence and treating attention as a finite, non-renewable capital asset, the modern intellectual safeguards the psychological conditions under which profound insight can quietly germinate.',
            coreSVO: {
              subject: 'the modern intellectual',
              verb: 'safeguards',
              objectOrComplement: 'the psychological conditions'
            },
            subordinateClauses: [
              {
                type: 'Compound Gerund Prepositional Phrase',
                clause: 'By scheduling multi-hour blocks... and treating attention...',
                function: 'Specifies the twin operational habits of elite intellectual defense.'
              },
              {
                type: 'Relative Clause with Fronted Preposition',
                clause: 'under which profound insight can quietly germinate',
                function: 'Modifies "psychological conditions", expressing the fertile environment for creativity.'
              }
            ],
            syntacticAnalysis: 'Fronted compound participial phrases establish the dual disciplines of time-blocking and philosophical re-evaluation. The sentence concludes with organic metaphorical imagery ("quietly germinate").'
          }
        ],
        pass3SentenceMining: [
          {
            id: 'mine-art3-1',
            targetWord: 'conflate',
            partOfSpeech: 'verb',
            ipa: '/kənˈfleɪt/',
            definition: 'Combine two or more separate ideas, entities, or arguments into one, often erroneously.',
            vietnamese: 'đánh đồng, trộn lẫn hai khái niệm riêng biệt làm một',
            contextSentence: 'In the contemporary knowledge economy, hyper-connectivity is frequently conflated with organizational velocity.',
            collocations: ['conflate two concepts', 'erroneously conflated', 'conflate correlation with causation'],
            etymology: 'Latin conflat- (blown together), from con- (together) + flare (to blow).'
          },
          {
            id: 'mine-art3-2',
            targetWord: 'insidious',
            partOfSpeech: 'adjective',
            ipa: '/ɪnˈsɪd.i.əs/',
            definition: 'Proceeding in a gradual, subtle way, but with very harmful effects.',
            vietnamese: 'nguy hiểm ngấm ngầm, có tác hại âm thầm mà khôn lường',
            contextSentence: 'Open-plan offices promise frictionless collaboration, yet their insidious side effect is the systematic fragmentation of attention.',
            collocations: ['insidious threat', 'insidious nature', 'insidious disease'],
            etymology: 'Latin insidiosus, from insidiae (ambush, plot).'
          },
          {
            id: 'mine-art3-3',
            targetWord: 'residue',
            partOfSpeech: 'noun',
            ipa: '/ˈrez.ɪ.djuː/',
            definition: 'A small amount of something that remains after the main part has gone or been taken.',
            vietnamese: 'phần tàn dư, cặn bã còn vương lại',
            contextSentence: 'Switching focus between collaborative pings and contemplation leaves an exhausting residue known as "attention residue."',
            collocations: ['attention residue', 'toxic residue', 'chemical residue'],
            etymology: 'Old French residu, from Latin residuum (that which remains).'
          },
          {
            id: 'mine-art3-4',
            targetWord: 'germinate',
            partOfSpeech: 'verb',
            ipa: '/ˈdʒɜː.mɪ.neɪt/',
            definition: 'Begin to grow and put out shoots after a period of dormancy; or come into inception (of an idea).',
            vietnamese: 'nảy mầm, đâm chồi, bắt đầu hình thành và phát triển (ý tưởng)',
            contextSentence: 'The modern intellectual safeguards the psychological conditions under which profound insight can quietly germinate.',
            collocations: ['germinate an idea', 'seeds germinate', 'allowed to germinate'],
            etymology: 'Latin germinat- (sprouted), from germen (sprout, germ).'
          }
        ],
        pass4Synthesis: {
          modelPrécis: 'Modern organizations erroneously conflate constant communication with velocity, producing cognitive fragmentation and debilitating attention residue. Shielding analytical throughput demands establishing low-entropy monastic routines where attention is guarded as finite capital, providing the deep uninterrupted space required for breakthrough insights to germinate.',
          incorporatedVocabulary: ['conflate', 'attention residue', 'low-entropy', 'germinate', 'cognitive throughput'],
          syntacticReconstruction: 'Rather than succumbing to performative responsiveness, high-value contributors insulate their working memory through scheduled offline sanctuaries.'
        }
      }
    }
  ]
};

// Write reading.json
fs.writeFileSync(
  path.join(dataDir, 'reading.json'),
  JSON.stringify(readingData, null, 2),
  'utf-8'
);
console.log(`[GENERATOR] Successfully created reading.json with ${readingData.articles.length} authentic 4-pass intensive articles.`);
