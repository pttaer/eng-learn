# Mode: Syntactic Repair & Parallelism Precision (C1/C2)

## Correction of Faulty Parallelism in Series
- **ID**: gram-prec-1
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 1
- **Prompt**: The audit revealed that the branch was inflating invoices, concealed debts, and to bribe local officials.
- **Transformation**: The audit revealed that the branch was inflating invoices, concealing debts, and bribing local officials.
- **Grammatical Cue**: Harmonize all coordinate verbal complements into parallel gerund-participle (-ing) forms.
- **Vietnamese**: Sửa lỗi cấu trúc song hành trong chuỗi liệt kê: Tất cả động từ phải ở cùng một dạng V-ing.
- **Formula**: `Verb + X(-ing), Y(-ing), and Z(-ing)`
- **Analysis**: When coordinating a series of items connected by conjunctions ('and', 'or'), all grammatical members must occupy identical syntactic categories and morphological forms.
- **Exemplar**: Effective executives excel at distilling complex data, communicating clear visions, and empowering autonomous teams.

## Correction of Correlative Parallelism ('Not only... but also')
- **ID**: gram-prec-2
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 1
- **Prompt**: The policy change not only alienated key enterprise customers, but also it generated meager recurring revenues.
- **Transformation**: The policy change not only alienated key enterprise customers, but also generated meager recurring revenues.
- **Grammatical Cue**: Ensure constituents following 'not only' and 'but also' share identical grammatical categories (Verb Phrase).
- **Vietnamese**: Sửa lỗi song hành với liên từ tương quan 'Not only... but also': Hai vế sau liên từ phải đồng nhất cấu trúc.
- **Formula**: `Subject + not only + Verb Phrase 1 + but also + Verb Phrase 2`
- **Analysis**: In correlative structures ('not only X but also Y'), the constituent following 'not only' (past verb 'alienated') must syntactically mirror the constituent following 'but also' (past verb 'generated', without superfluous subject pronoun 'it').
- **Exemplar**: The novel antitrust decree seeks not only to penalize past anti-competitive collusion, but also to forestall future market concentration.

## Fixing Unintentional Tense Shifts in Narrative Discourse
- **ID**: gram-prec-3
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 1
- **Prompt**: The lead engineer detected anomalous telemetry spikes, and immediately he isolates the compromised gateway.
- **Transformation**: The lead engineer detected anomalous telemetry spikes and immediately isolated the compromised gateway.
- **Grammatical Cue**: Eliminate arbitrary shift from past tense 'detected' to present tense 'isolates'.
- **Vietnamese**: Sửa lỗi chuyển thì tùy tiện: Duy trì nhất quán thì quá khứ đơn (detected... isolated).
- **Formula**: `Subject + Past Verb 1 + and + Past Verb 2`
- **Analysis**: Writers must maintain tense consistency across coordinated clauses unless a legitimate temporal or modal shift occurs. Shifting from past ('detected') to present ('isolates') creates jarring cognitive dissonance for the reader.
- **Exemplar**: The forensic investigator examined the encrypted drive, recovered the deleted private key, and compiled the final report.

## Eliminating Passive Wordiness via Direct Transitive Verbs
- **ID**: gram-prec-4
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 1
- **Prompt**: An analysis of the quarterly logistics telemetry was conducted by the operations optimization squad.
- **Transformation**: The operations optimization squad analyzed the quarterly logistics telemetry.
- **Grammatical Cue**: Convert clunky passive nominalization ('An analysis was conducted by...') into vigorous active transitive verb.
- **Vietnamese**: Chuyển câu bị động rườm rà thành câu chủ động sắc bén: Biến danh từ hóa 'analysis' thành động từ 'analyzed'.
- **Formula**: `Agent Subject + Active Transitive Verb + Direct Object`
- **Analysis**: Smothered verbs (nominalizations like 'conduct an analysis') and passive agent bypasses drain prose of vitality. Replacing them with direct active voice clarifies agency and trims syllable bloat.
- **Exemplar**: The appellate court vacated the lower tribunal's patent injunction.

## Coordinated Adverbial Parallelism
- **ID**: gram-prec-5
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 1
- **Prompt**: The spokesperson addressed the accusations calmly, thoroughly, and in a professional manner.
- **Transformation**: The spokesperson addressed the accusations calmly, thoroughly, and professionally.
- **Grammatical Cue**: Harmonize prepositional phrase 'in a professional manner' into clean parallel '-ly' adverb.
- **Vietnamese**: Song hành hóa trạng từ: Thay thế cụm giới từ dài dòng bằng trạng từ đuôi '-ly' đồng bộ.
- **Formula**: `Verb + Adverb 1(-ly), Adverb 2(-ly), and Adverb 3(-ly)`
- **Analysis**: Mixing lexical adverbs with prepositional phrases in an adverbial list disrupts rhetorical cadence. Converting the final element into an '-ly' adverb restores crisp prosodic symmetry.
- **Exemplar**: The negotiation team argued their counter-proposals persuasively, tenaciously, and diplomatically.

## Dangling Modifier with Introductory Participial Phrase
- **ID**: gram-prec-6
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 2
- **Prompt**: Approaching the international border crossing, the travelers' passports were inspected by biometric cameras.
- **Transformation**: Approaching the international border crossing, the travelers had their passports inspected by biometric cameras.
- **Grammatical Cue**: Ensure grammatical subject immediately following introductory participle is the agent performing the action.
- **Vietnamese**: Sửa lỗi phân từ lơ lửng (Dangling Modifier): Hộ chiếu không thể tự 'tiến đến biên giới', chủ ngữ phải là du khách.
- **Formula**: `Participial Phrase (Agent action), Agent Subject + Verb`
- **Analysis**: A dangling participle occurs when the implied subject of an introductory verbal phrase differs from the grammatical subject of the following independent clause. Passports cannot physically approach a border; the human travelers must serve as matrix subject.
- **Exemplar**: Synthesizing fifteen longitudinal demographic studies, the researchers demonstrated a sharp correlation between urbanization and declining birth rates.

## Misplaced Modifier with Adverbial Quantifier ('Only')
- **ID**: gram-prec-7
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 2
- **Prompt**: The compliance officer only flagged three fraudulent wire transfers during the audit.
- **Transformation**: The compliance officer flagged only three fraudulent wire transfers during the audit.
- **Grammatical Cue**: Place focus adverb 'only' directly adjacent to the numerical noun phrase it restricts.
- **Vietnamese**: Sửa lỗi đặt sai vị trí từ hạn định 'Only': Đặt 'only' ngay trước đối tượng cần bổ nghĩa (only three).
- **Formula**: `Subject + Verb + only + Quantifier / Object Noun Phrase`
- **Analysis**: Positioning 'only' before the verb 'flagged' technically asserts that flagging was the sole action the officer performed (e.g., she didn't approve or delete them). Moving it before 'three' correctly restricts the numerical count.
- **Exemplar**: The appellate court granted certiorari to only one constitutional claim among the dozen raised.

## Faulty Comparison / Illogical Parallelism ('More than that of')
- **ID**: gram-prec-8
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 2
- **Prompt**: The computational throughput of our distributed cluster is substantially higher than our primary competitor.
- **Transformation**: The computational throughput of our distributed cluster is substantially higher than that of our primary competitor.
- **Grammatical Cue**: Use pro-form 'that of' to prevent comparing an abstract metric ('throughput') directly against a company.
- **Vietnamese**: Sửa lỗi so sánh khập khiễng (Illogical Comparison): Thêm 'that of' để so sánh công suất với công suất.
- **Formula**: `Metric of A + is higher than + that of B`
- **Analysis**: Comparing an inanimate metric ('throughput') to an entity ('competitor') represents an illogical comparative fallacy. The pro-form 'that of' (or 'those of' for plural nouns) must be inserted to preserve ontological parity.
- **Exemplar**: The fuel efficiency of modular molten-salt reactors far exceeds that of conventional light-water facilities.

## Split Infinitive Resolution in Formal Register
- **ID**: gram-prec-9
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 2
- **Prompt**: The statutory directive instructs administrators to strictly and without exception enforce the embargo.
- **Transformation**: The statutory directive instructs administrators to enforce the embargo strictly and without exception.
- **Grammatical Cue**: Relocate lengthy adverbial phrase outside the 'to + verb' infinitive nexus in formal legal prose.
- **Vietnamese**: Xử lý chẻ động từ nguyên mẫu (Split Infinitive): Chuyển cụm trạng từ dài ra sau tân ngữ trong văn phong pháp lý.
- **Formula**: `to + Base Verb + Object + Adverbial Modifier`
- **Analysis**: While mild split infinitives are permissible in modern English, wedging a sprawling parenthetical adverbial phrase ('strictly and without exception') between 'to' and 'enforce' fractures cognitive momentum in high-register formal documentation.
- **Exemplar**: The regulatory body resolved to prosecute rogue currency speculators vigorously and transparently.

## Restrictive vs. Non-Restrictive Precision ('Which' vs 'That')
- **ID**: gram-prec-10
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 2
- **Prompt**: All proprietary trade secrets, which were acquired during the joint venture, must be returned.
- **Transformation**: All proprietary trade secrets that were acquired during the joint venture must be returned.
- **Grammatical Cue**: Use restrictive pronoun 'that' without commas to define an essential subset of trade secrets.
- **Vietnamese**: Phân biệt mệnh đề quan hệ xác định (that) và không xác định (, which,): Chọn 'that' để xác định nhóm cụ thể.
- **Formula**: `Noun Phrase + that + Restrictive Clause (no commas) + Predicate`
- **Analysis**: Surrounding the clause with commas and using 'which' implies that all trade secrets in existence were acquired during the venture. Omitting commas and using 'that' restricts the obligation exclusively to the subset acquired during the venture.
- **Exemplar**: Assets that are subject to sovereign freeze orders cannot be collateralized in repo markets.

## Dangling Gerund Phrase after Prepositional Opener
- **ID**: gram-prec-11
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 3
- **Prompt**: After dissecting the malware payload, the zero-day vulnerability was successfully patched by our security team.
- **Transformation**: After dissecting the malware payload, our security team successfully patched the zero-day vulnerability.
- **Grammatical Cue**: Make the human actor ('our security team') the matrix subject following prepositional gerund phrase.
- **Vietnamese**: Sửa lỗi danh động từ lơ lửng: Lỗ hổng bảo mật không thể 'mổ xẻ mã độc', đội ngũ an ninh phải làm chủ ngữ.
- **Formula**: `After + -ing Phrase, Human Agent Subject + Active Verb + Object`
- **Analysis**: A passive main clause following a temporal prepositional gerund phrase falsely attributes the gerund's action to the grammatical subject ('the zero-day vulnerability'). Restoring the agent ('our security team') cures the semantic absurdity.
- **Exemplar**: Upon completing the forensic autopsy of the insolvent exchange, the court-appointed liquidator filed for Chapter 11 protections.

## Squinting Modifier Disambiguation
- **ID**: gram-prec-12
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 3
- **Prompt**: Board members who review compensation packages frequently express severe dissatisfaction.
- **Transformation**: Board members who frequently review compensation packages express severe dissatisfaction.
- **Grammatical Cue**: Disambiguate adverb 'frequently' so it clearly modifies either the relative clause or the main verb.
- **Vietnamese**: Khắc phục bổ ngữ mập mờ (Squinting Modifier): Di chuyển 'frequently' để làm rõ xem họ xem xét thường xuyên hay phàn nàn thường xuyên.
- **Formula**: `Subject + who + Adverb + Verb... + Main Predicate`
- **Analysis**: A squinting modifier is sandwiched ambiguously between two syntactic verbs, making it impossible to determine whether 'frequently' modifies the preceding verb 'review' or the succeeding verb 'express'. Moving it inside the relative clause resolves the ambiguity.
- **Exemplar**: Executives who consistently communicate clear architectural boundaries inspire enduring organizational trust.

## Deliberate Rhetorical Ellipsis in Comparative Contrast
- **ID**: gram-prec-13
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 3
- **Prompt**: The senior partner authored eight landmark antitrust briefs, while the junior associate authored only two landmark antitrust briefs.
- **Transformation**: The senior partner authored eight landmark antitrust briefs; the junior associate, only two.
- **Grammatical Cue**: Ellipt identical verb and noun phrase using comma of gapping and semicolon coordination.
- **Vietnamese**: Tỉnh lược tu từ (Rhetorical Ellipsis / Gapping): Dùng dấu phẩy thay thế động từ bị lặp lại trong vế đối xứng.
- **Formula**: `Clause 1; Subject 2, + Contrasting Constituent`
- **Analysis**: Gapping ellipsis removes redundant repetitive verbs ('authored') and direct objects ('landmark antitrust briefs'), using a gapping comma to signal structural omission and creating an incisive rhetorical antithesis.
- **Exemplar**: The treasury secretary advocated bold fiscal expansion; the central bank governor, immediate austerity.

## Subjunctive-Indicative Mood Collision Correction
- **ID**: gram-prec-14
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 3
- **Prompt**: The charter requires that every delegate is registered and that each votes according to their constituency.
- **Transformation**: The charter requires that every delegate be registered and that each vote according to their constituency.
- **Grammatical Cue**: Harmonize coordinated mandative subjunctive clauses into invariant bare forms 'be' and 'vote'.
- **Vietnamese**: Sửa lỗi xung đột thức giả định và chỉ định: Cả hai mệnh đề phụ thuộc 'requires that' đều phải ở thức giả định.
- **Formula**: `requires that + Subject 1 + Base Verb... and that + Subject 2 + Base Verb`
- **Analysis**: When coordinating multiple dependent content clauses under a single governing mandative verb ('requires that'), writers frequently lapse into the indicative mood in the second clause. Both clauses must maintain strict subjunctive morphology.
- **Exemplar**: The treaty mandates that verification inspectors be granted unimpeded access and that host governments abstain from interference.

## Asymmetrical Nominalization vs. Verbal Coordination
- **ID**: gram-prec-15
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 3
- **Prompt**: The transformation plan entails the restructuring of internal debt and to divest non-core semiconductor assets.
- **Transformation**: The transformation plan entails restructuring internal debt and divesting non-core semiconductor assets.
- **Grammatical Cue**: Eliminate clash between prepositional noun phrase 'the restructuring of' and infinitive 'to divest'.
- **Vietnamese**: Đồng bộ hóa danh từ hóa và động từ: Chuyển toàn bộ thành cụm danh động từ (restructuring... divesting...).
- **Formula**: `Subject + entails + Gerund Phrase 1 and Gerund Phrase 2`
- **Analysis**: Pairing a Latinate nominalization with an infinitive phrase produces clumsy, asymmetric syntax. Harmonizing both coordinate objects into direct gerund phrases creates aerodynamic structural balance.
- **Exemplar**: The turnaround strategy necessitates renegotiating credit terms and consolidating redundant manufacturing facilities.

## Subject-Verb Agreement with 'The number of' vs 'A number of'
- **ID**: gram-prec-16
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 1
- **Prompt**: The number of complaints lodged against the contractor have tripled, and a number of residents is now considering legal action.
- **Transformation**: The number of complaints lodged against the contractor has tripled, and a number of residents are now considering legal action.
- **Grammatical Cue**: 'The number' is a singular head noun; in 'a number of', the plural noun after 'of' is the head and governs the verb.
- **Vietnamese**: Hòa hợp chủ ngữ và động từ: 'The number of + danh từ số nhiều' (con số) đi với động từ số ít; 'A number of + danh từ số nhiều' (một số, nhiều) đi với động từ số nhiều.
- **Formula**: `The number of + Plural Noun + Singular Verb | A number of + Plural Noun + Plural Verb`
- **Analysis**: In 'the number of complaints', the head is 'number' (a single quantity), so the verb is singular despite the plural noun and the intervening modifier 'lodged against the contractor'. 'A number of' has become a fixed quantifier meaning 'several', so the following plural noun is the notional head and takes a plural verb. Similar head-identification problems arise with 'the majority of' and 'none of', where usage varies: 'none of the reports is' is the traditional formal choice, but 'none of the reports are' is also standard.
- **Exemplar**: The number of applicants has fallen sharply, yet a number of universities are still expanding their intake.

## Ambiguous Pronoun Reference Resolution
- **ID**: gram-prec-17
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 2
- **Prompt**: When the chief executive met the auditor, she insisted that her figures were accurate.
- **Transformation**: The chief executive insisted to the auditor that her own figures were accurate.
- **Grammatical Cue**: Two singular female antecedents precede 'she' and 'her'; restructure so that the intended referent is the only salient candidate.
- **Vietnamese**: Sửa lỗi đại từ quy chiếu mơ hồ: khi có hai danh từ cùng giống, cùng số đứng trước, cần lặp lại danh từ hoặc tái cấu trúc câu để đại từ chỉ có một tiền ngữ duy nhất.
- **Formula**: `Repeat the antecedent noun | Recast so the antecedent is the clause subject | Bind the possessive with 'own' or use a reflexive`
- **Analysis**: A pronoun is ambiguous whenever more than one preceding noun phrase matches it in person, number and gender; readers then default to the subject or to the most recent noun, and either guess may be wrong. Repair strategies include repeating the noun, recasting the sentence so that the intended antecedent is the subject of the same clause, or adding 'own' to tie the possessive to that subject. Singular 'they' can create the same ambiguity when both antecedents are unspecified for gender.
- **Exemplar**: When the minister briefed the ambassador, the ambassador asked for the proposal in writing.

## Faulty Predication ('The reason is because')
- **ID**: gram-prec-18
- **Mode**: SYNTACTIC_REPAIR
- **Level**: 3
- **Prompt**: The reason the pilot project stalled is because the regional offices were never consulted.
- **Transformation**: The reason the pilot project stalled is that the regional offices were never consulted.
- **Grammatical Cue**: After 'The reason... is', use a 'that' clause; 'because' duplicates the causal meaning already carried by 'reason'.
- **Vietnamese**: Sửa lỗi vị ngữ không tương hợp: sau 'The reason... is' dùng mệnh đề 'that', không dùng 'because' vì bản thân 'reason' đã mang nghĩa nguyên nhân.
- **Formula**: `The reason (why/that) + Clause + is + that + Clause | Subject + Verb + because + Clause`
- **Analysis**: The copula 'is' equates its subject with its complement, so the complement should be a noun-like element: a 'that' clause qualifies, whereas a 'because' clause is an adverbial of cause, producing both a predication mismatch and a redundancy. 'The reason is because' is common in speech and even appears in respected writers, but it is widely censured in edited formal prose. The cleaner alternatives are 'The reason is that...' or simply 'The project stalled because...'.
- **Exemplar**: The reason the merger failed was that the two firms could never agree on who would make the final decisions.

