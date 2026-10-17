# Mode: Vietnamese L1 Contrastive Repair (24 Rules)

## Final Consonant Release with Plosive Codas
- **ID**: gram-l1-01
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: FINAL_CONSONANTS
- **Trap**: Monosyllabic (C)(w)V(C) coda dropping: /faɪv/ and /faɪt/ collapse into /faɪ/.
- **Level**: 1
- **CEFR**: A1
- **Prompt**: I have fi book on my table.
- **Transformation**: I have five books on my table.
- **Grammatical Cue**: Release the final voiced labiodental fricative /v/ and pluralize the noun.
- **Vietnamese**: Lỗi nuốt âm đuôi phụ âm: Người Việt có xu hướng bỏ âm /v/ trong 'five' và âm đuôi /s/ trong danh từ số nhiều. Hãy nối âm: five‿apples, five‿books.
- **Formula**: `Subject + have + Number (with audible coda) + Plural Noun (-s/-es)`
- **Analysis**: Vietnamese syllable phonotactics prohibit post-vocalic fricatives in codas, causing learners to truncate /faɪv/ to /faɪ/. English requires audible realization of the final consonant to avoid semantic collapse with 'fine', 'fight', or 'fly'.
- **Exemplar**: She bought five apples at the supermarket yesterday.

## Third-Person Singular Verb Catenation
- **ID**: gram-l1-02
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: FINAL_CONSONANTS
- **Trap**: Zero-inflection transfer: Verb stays invariant regardless of third-person subject.
- **Level**: 1
- **CEFR**: A2
- **Prompt**: My brother live in an apartment near the university.
- **Transformation**: My brother lives in an apartment near the university.
- **Grammatical Cue**: Add inflectional -s (/z/) to third-person singular present verbs and link to following vowels.
- **Vietnamese**: Quên chia đuôi -s/es ngôi thứ ba số ít do tiếng Việt không biến đổi hình thái động từ theo ngôi. Đọc nối âm /z/ sang 'in': live-zin.
- **Formula**: `Third-Person Singular Subject + Verb-s/es + Prepositional Phrase`
- **Analysis**: In Vietnamese, verbs never inflect for person or number (anh ấy sống, tôi sống). Learners must actively bridge the phonological ending /z/ to following vowels to automate grammatical agreement in real-time speech.
- **Exemplar**: The manager lives in a quiet neighborhood outside the city center.

## Regular Past Simple -ed Tri-Phonemic Realization
- **ID**: gram-l1-03
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: FINAL_CONSONANTS
- **Trap**: Past ending deletion: Omitting regular past -ed because time adverbial already indicates past.
- **Level**: 2
- **CEFR**: B1
- **Prompt**: Yesterday the engineering team watch the presentation.
- **Transformation**: Yesterday the engineering team watched the presentation.
- **Grammatical Cue**: Add -ed (/t/ after voiceless /tʃ/) to mark past tense on the finite verb.
- **Vietnamese**: Bỏ đuôi -ed trong quá khứ đơn vì nghĩ rằng từ 'yesterday' đã đủ biểu thị quá khứ. Đuôi -ed sau âm vô thanh /tʃ/ phát âm là /t/: watch-t.
- **Formula**: `Past Time Expression + Subject + Verb-ed (/t/, /d/, /ɪd/) + Object`
- **Analysis**: Vietnamese marks tense through optional free lexical items (hôm qua, đã), leaving the verb unmarked. English syntax strictly demands morphological past tense inflection on the finite verb regardless of temporal adjuncts.
- **Exemplar**: Last night the research team watched the documentary on renewable energy.

## Final Consonant Cluster Retention with Stop-Fricative Sequences
- **ID**: gram-l1-04
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: FINAL_CONSONANTS
- **Trap**: Cluster simplification: Deleting the stop in -skt or -sks codas (asked -> as).
- **Level**: 2
- **CEFR**: B2
- **Prompt**: The journalist as the minister several direct questions.
- **Transformation**: The journalist asked the minister several direct questions.
- **Grammatical Cue**: Articulate the complete /skt/ triple coda cluster without epenthetic vowel insertion.
- **Vietnamese**: Đơn giản hóa cụm phụ âm đuôi: Cụm /skt/ trong 'asked' hay /sks/ trong 'desks' thường bị nuốt chỉ còn /æs/. Hãy luyện giữ nguyên /s/ rồi bật /k/ và /t/.
- **Formula**: `Subject + Verb[Complex Cluster Coda] + Indirect Object + Direct Object`
- **Analysis**: Complex English consonant clusters (/skt/, /ksts/, /mpts/) have no equivalent in Vietnamese phonology. Learners tend to elide internal stops or insert an intrusive schwa. Articulating the full coda maintains lexical precision.
- **Exemplar**: The auditor asked the financial officer for detailed balance sheet records.

## Voicing Contrast /s/ vs /z/ in Inflected Morphemic Codas
- **ID**: gram-l1-05
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: FINAL_CONSONANTS
- **Trap**: Devoicing of final /z/ to /s/, causing morphological and lexical confusion between 'raises' and 'races'.
- **Level**: 3
- **CEFR**: C1
- **Prompt**: The central bank races interest rates to curb inflation.
- **Transformation**: The central bank raises interest rates to curb inflation.
- **Grammatical Cue**: Use the voiced alveolar fricative /z/ with vocal fold vibration for the verb 'raise'.
- **Vietnamese**: Mất độ rung thanh quản (devoicing): Nhầm lẫn giữa /s/ và /z/ làm biến đổi nghĩa từ vựng (races - chạy đua vs raises - tăng lên). Cần rung dây thanh khi phát âm /z/.
- **Formula**: `Subject + Verb[Voiced Suffix /z/ or /ɪz/] + Object`
- **Analysis**: Vietnamese possesses initial /z/ in northern dialects but never coda /z/. In final positions, voiced fricatives are universally devoiced or dropped by L1 speakers. Maintaining vocal fold vibration prevents semantic distortion in critical executive contexts.
- **Exemplar**: The executive committee raises concerns regarding supply chain vulnerabilities.

## Polysyllabic Coda Clustered Plural Preservation
- **ID**: gram-l1-06
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: FINAL_CONSONANTS
- **Trap**: Triple coda elision under cognitive speech rate pressure in formal academic lexis.
- **Level**: 3
- **CEFR**: C2
- **Prompt**: The research fails to address key aspect of the statistical model.
- **Transformation**: The research fails to address key aspects of the statistical model.
- **Grammatical Cue**: Preserve the /s/ plural morpheme following the /kt/ cluster (/spts/).
- **Vietnamese**: Nuốt âm đuôi trong các danh từ trừu tượng đa âm tiết: 'Aspects' /'æspekts/ thường bị đọc thành /'æspek/ do áp lực phát âm cụm /kts/. Phải giữ trọn vẹn phụ âm đuôi.
- **Formula**: `Subject + Verb + Adjective + Plural Abstract Noun[-kts/-pts] + of + Noun Phrase`
- **Analysis**: Highly sophisticated C2 academic nouns such as 'aspects', 'contexts', and 'statistics' contain dense coda consonant chains that disintegrate under fast discourse. Rigorous muscular anchoring prevents loss of plural concord.
- **Exemplar**: The empirical study synthesizes multiple aspects of macroeconomic volatility.

## Adjective Predication Missing Copula
- **ID**: gram-l1-07
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: ZERO_COPULA
- **Trap**: Adjectives functioning as statutory predicates without 'be': Cô ấy rất đẹp -> She very beautiful.
- **Level**: 1
- **CEFR**: A1
- **Prompt**: My sister very tired after school.
- **Transformation**: My sister is very tired after school.
- **Grammatical Cue**: Insert the copular verb 'is' before the predicate adjective.
- **Vietnamese**: Bỏ sót động từ 'to be' trước tính từ: Trong tiếng Việt, tính từ bản thân nó là vị ngữ (Cô ấy [rất mệt]), nên người học thường nói 'My sister very tired'. Tiếng Anh bắt buộc phải có liên động từ 'be'.
- **Formula**: `Subject + am/is/are + (Adverb) + Predicate Adjective`
- **Analysis**: In Austroasiatic syntax, adjectives are stative verbs capable of heading a predicate without verbal support. In Indo-European English, adjectives require a copular head ('be') to receive tense and agreement features.
- **Exemplar**: Our new classroom is very clean and bright.

## Negative Adjectival Predication Copula Omission
- **ID**: gram-l1-08
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: ZERO_COPULA
- **Trap**: Negating predicate adjectives with 'not' directly: Phòng không sạch -> Room not clean.
- **Level**: 1
- **CEFR**: A2
- **Prompt**: This hotel room not comfortable for our family.
- **Transformation**: This hotel room is not comfortable for our family.
- **Grammatical Cue**: Place 'is not' (or 'isn't') between the subject noun phrase and the adjective.
- **Vietnamese**: Phủ định tính từ trực tiếp bằng 'not' mà thiếu 'is': Tiếng Việt chỉ cần 'không + tính từ' (không thoải mái), dẫn đến lỗi 'room not comfortable'. Phải dùng 'is not'.
- **Formula**: `Subject + am/is/are + not + Predicate Adjective`
- **Analysis**: Direct transfer of Vietnamese negation particle 'không' placed directly before stative predicates produces ungrammatical bare negative strings ('Subject not Adjective'). English demands the auxiliary/copular negator anchor.
- **Exemplar**: This public transport option is not convenient during rush hour.

## Hyper-Correction Overuse of 'Be' with Lexical Action Verbs
- **ID**: gram-l1-09
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: ZERO_COPULA
- **Trap**: Overgeneralizing copula insertion to lexical verbs: 'I am agree', 'She is work'.
- **Level**: 2
- **CEFR**: B1
- **Prompt**: I am agree with your assessment of the market situation.
- **Transformation**: I agree with your assessment of the market situation.
- **Grammatical Cue**: Remove the intrusive copula 'am'; 'agree' is a finite lexical verb.
- **Vietnamese**: Lạm dụng 'to be' với động từ thường (Hyper-correction): Do bị sửa lỗi thiếu 'be' quá nhiều, người học sinh ra phản xạ đặt 'am/is/are' trước mọi động từ, tạo thành 'I am agree' hay 'I am work'. 'Agree' là động từ thường.
- **Formula**: `Subject + Finite Lexical Verb (No Copula) + Prepositional Complement`
- **Analysis**: Hyper-correction phenomenon where learners, having internalized that English clauses require 'be', misclassify stative lexical verbs ('agree', 'doubt', 'understand') as adjectives, producing ungrammatical copula-verb doublets.
- **Exemplar**: We completely agree with the proposed revisions to the contractual agreement.

## Misplacement of Adverb 'Very' Directly Modifying Full Verbs
- **ID**: gram-l1-10
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: ZERO_COPULA
- **Trap**: Transfer of Vietnamese 'rất' modifying verbs: Tôi rất thích -> I very like.
- **Level**: 2
- **CEFR**: B2
- **Prompt**: The senior board members very like this expansion strategy.
- **Transformation**: The senior board members really like this expansion strategy.
- **Grammatical Cue**: Replace 'very' with 'really' before the verb, or place 'very much' at the end.
- **Vietnamese**: Dùng 'very' bổ nghĩa trực tiếp cho động từ: Tiếng Việt có cấu trúc 'rất + động từ' (rất thích, rất muốn). Trong tiếng Anh, 'very' chỉ bổ nghĩa cho tính từ/trạng từ; với động từ phải dùng 'really' hoặc 'very much' ở cuối câu.
- **Formula**: `Subject + really + Verb + Object OR Subject + Verb + Object + very much`
- **Analysis**: The Vietnamese intensifier 'rất' freely modifies adjectives, stative verbs, and mental-state predicates. In English, degree adverb 'very' is restricted to adjectival and adverbial heads; lexical verbs require 'really' or post-verbal 'very much'.
- **Exemplar**: The client really appreciates our prompt response to technical inquiries.

## Copula Deletion in Subordinate Concessive Structures
- **ID**: gram-l1-11
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: ZERO_COPULA
- **Trap**: Omitting copula in subordinate adverbial clauses following concessive conjunctions.
- **Level**: 3
- **CEFR**: C1
- **Prompt**: Although the regulatory guidelines strict, the firm complied fully.
- **Transformation**: Although the regulatory guidelines were strict, the firm complied fully.
- **Grammatical Cue**: Insert the past copular verb 'were' in agreement with plural subject 'guidelines'.
- **Vietnamese**: Bỏ quên liên động từ trong mệnh đề phụ chỉ sự nhượng bộ: Do tập trung vào cấu trúc liên từ 'Although', người học thường dịch nguyên vẹn từ tiếng Việt 'Mặc dù quy định [nghiêm ngặt]' mà quên chia 'were'.
- **Formula**: `Although + Subordinate Subject + was/were + Adjective, Main Clause`
- **Analysis**: High cognitive load during subordinate clause construction causes L1 regression where Austroasiatic stative predication resurfaces, dropping tense-bearing copulas in dependent finite clauses.
- **Exemplar**: Although the fiscal constraints were severe, the department delivered on all objectives.

## Stative Adjective vs Stative Passive Verb Confusion
- **ID**: gram-l1-12
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: ZERO_COPULA
- **Trap**: Conflating -ing participial adjectives with passive experiential states (Tôi bị chán -> I am boring).
- **Level**: 3
- **CEFR**: C2
- **Prompt**: The delegates were boring with the repetitive keynote address.
- **Transformation**: The delegates were bored by the repetitive keynote address.
- **Grammatical Cue**: Use the -ed participial adjective 'bored' to express the internal emotional state of the subject.
- **Vietnamese**: Nhầm lẫn tính từ đuôi -ing và -ed: Trong tiếng Việt từ 'chán' vừa chỉ cảm giác của bản thân, vừa chỉ tính chất của sự việc. Trong tiếng Anh, người trải qua cảm giác dùng đuôi -ed, tác nhân gây ra cảm giác dùng -ing.
- **Formula**: `Subject (Experiencer) + was/were + Bored + by/with + Agent`
- **Analysis**: Vietnamese neutralizes the semantic voice distinction between causer and experiencer in stative descriptors ('buồn', 'chán', 'mệt'). English obligates active participle (-ing) for stimulus properties and passive participle (-ed) for experiential mental states.
- **Exemplar**: International observers were deeply bored by the redundant diplomatic speeches.

## Adverbial Presence Causing Finite Past Tense Deletion
- **ID**: gram-l1-13
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: TENSE_ASPECT
- **Trap**: Relying on external temporal adverb to establish past time while leaving verb uninflected.
- **Level**: 1
- **CEFR**: A1
- **Prompt**: Yesterday afternoon my family visit the national museum.
- **Transformation**: Yesterday afternoon my family visited the national museum.
- **Grammatical Cue**: Inflect the finite verb with past tense -ed even when temporal adverb 'yesterday' is present.
- **Vietnamese**: Quên chia thì quá khứ khi đã có trạng từ chỉ thời gian: Tiếng Việt dùng trạng từ 'hôm qua' để biểu thị quá khứ, động từ giữ nguyên. Tiếng Anh đòi hỏi bắt buộc cả hai: Trạng từ thời gian + Động từ chia quá khứ.
- **Formula**: `Past Adverbial + Subject + Past Tense Verb (-ed / Irregular) + Object`
- **Analysis**: Vietnamese temporal reference operates on discourse-level aspectual pragmatics; once a temporal anchor is established, verbal morphemes remain invariant. English is a strict grammaticalized tense language requiring dual anchoring.
- **Exemplar**: Yesterday morning the maintenance crew inspected the backup generators.

## Aspectual Particle 'Rồi' Conflation with Monolithic 'Already'
- **ID**: gram-l1-14
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: TENSE_ASPECT
- **Trap**: Translating 'rồi' as clause-final 'already' with present simple verb: Tôi ăn cơm rồi -> I eat dinner already.
- **Level**: 1
- **CEFR**: A2
- **Prompt**: I submit the scholarship application already.
- **Transformation**: I have already submitted the scholarship application.
- **Grammatical Cue**: Use the Present Perfect auxiliary 'have' + past participle with pre-verbal 'already'.
- **Vietnamese**: Lạm dụng 'already' ở cuối câu để dịch từ 'rồi': Cấu trúc 'V + already' là sao chép từ 'V + rồi'. Trong tiếng Anh chuẩn, hành động vừa hoàn thành có kết quả ở hiện tại phải dùng thì Hiện tại hoàn thành (have/has + V3).
- **Formula**: `Subject + have/has + already + Past Participle + Object`
- **Analysis**: Vietnamese 'rồi' is a multifunctional completive aspect particle indicating status transition. Translating 'rồi' as clause-final lexical 'already' violates English aspectual syntax, which pairs completion with auxiliary 'have/has' + participle.
- **Exemplar**: She has already submitted the revised draft to the editorial board.

## Durative Past Continuing to Present (Present Perfect vs Simple Present)
- **ID**: gram-l1-15
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: TENSE_ASPECT
- **Trap**: Using Present Simple + 'already' to express duration extending from past to now: Sống ở đây 5 năm rồi.
- **Level**: 2
- **CEFR**: B1
- **Prompt**: Our team works on this software development project already six months.
- **Transformation**: Our team has worked on this software development project for six months.
- **Grammatical Cue**: Use Present Perfect (has worked) with preposition 'for' to express ongoing duration.
- **Vietnamese**: Dùng thì hiện tại đơn kèm 'already' để diễn đạt hành động kéo dài từ quá khứ đến nay: 'Làm việc 6 tháng rồi'. Tiếng Anh bắt buộc dùng Hiện tại hoàn thành với 'for + khoảng thời gian'.
- **Formula**: `Subject + have/has + Past Participle + for + Duration (No 'already')`
- **Analysis**: Vietnamese uses bare verbs accompanied by durative complements plus completive particle 'rồi' (làm việc 6 tháng rồi). English reserves present tense exclusively for habitual or concurrent states; duration originating in past requires perfect aspect.
- **Exemplar**: The consulting firm has operated in Southeast Asia for more than a decade.

## Sequence of Tenses in Indirect Reported Speech Backshifting
- **ID**: gram-l1-16
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: TENSE_ASPECT
- **Trap**: Failing to backshift verb in reported speech because original statement was present tense.
- **Level**: 2
- **CEFR**: B2
- **Prompt**: The finance director confirmed that the quarterly revenue is satisfactory.
- **Transformation**: The finance director confirmed that the quarterly revenue was satisfactory.
- **Grammatical Cue**: Backshift the subordinate verb 'is' to past 'was' to agree with reporting verb 'confirmed'.
- **Vietnamese**: Quên lùi thì trong câu gián tiếp: Tiếng Việt không có quy tắc lùi thì (Giám đốc xác nhận rằng doanh thu [ổn]). Tiếng Anh đòi hỏi mệnh đề sau động từ tường thuật quá khứ phải lùi về quá khứ tương ứng.
- **Formula**: `Subject + Past Reporting Verb + that + Subordinate Subject + Backshifted Past Verb`
- **Analysis**: Vietnamese lacks tense concordance; subordinate clauses maintain the temporal orientation of the reported utterance. English syntax imposes sequence-of-tense rules demanding morphological harmony with the matrix past verb.
- **Exemplar**: The technical lead reported that the production server was operating normally.

## Hypothetical Conditional Clause Tense Flattening
- **ID**: gram-l1-17
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: TENSE_ASPECT
- **Trap**: Flattening conditional tenses into present/future forms due to lack of conditional morphology in L1.
- **Level**: 3
- **CEFR**: C1
- **Prompt**: If the security team detected the breach earlier, they will stop the data leak.
- **Transformation**: If the security team had detected the breach earlier, they would have stopped the data leak.
- **Grammatical Cue**: Use Past Perfect in the if-clause and 'would have' + past participle in the main clause for unfulfilled past hypothetical.
- **Vietnamese**: Không chia thì giả định trong câu điều kiện loại 3: Tiếng Việt chỉ dùng từ 'Nếu... thì...' mà không biến đổi động từ. Khi nói về điều trái với quá khứ, tiếng Anh bắt buộc dùng 'had + V3' và 'would have + V3'.
- **Formula**: `If + Subject + had + Past Participle, Subject + would have + Past Participle`
- **Analysis**: Vietnamese conditional sentences rely on particles ('nếu', 'giá như') without temporal counterfactual morphology. English Type 3 counterfactuals demand systematic past-of-past marking to encode unreality.
- **Exemplar**: If the risk committee had acted on the warnings, they would have mitigated the exposure.

## Anteriority Alignment in Participial Discourse Constructions
- **ID**: gram-l1-18
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: TENSE_ASPECT
- **Trap**: Using bare present participle for completed prior actions, obscuring chronological sequence.
- **Level**: 3
- **CEFR**: C2
- **Prompt**: Completing the audit report, the compliance team submitted their recommendations.
- **Transformation**: Having completed the audit report, the compliance team submitted their recommendations.
- **Grammatical Cue**: Use the Perfect Participle 'Having completed' to clearly indicate that the action preceded the main clause.
- **Vietnamese**: Dùng phân từ hiện tại (V-ing) thay vì phân từ hoàn thành (Having + V3) để chỉ hành động hoàn tất trước: Khi một hành động kết thúc hoàn toàn trước hành động chính, phải dùng 'Having + V3' để đảm bảo tính chuẩn xác C2.
- **Formula**: `Having + Past Participle + Object, Subject + Simple Past Verb + Object`
- **Analysis**: In formal C2 registers, simple participial clauses (-ing) denote concurrent or continuous circumstance. When representing anterior completed causation, perfect participles are obligatory to preserve syntactic rigor.
- **Exemplar**: Having finalized the merger negotiations, the chairpersons released a joint communique.

## Bare Singular Countable Nouns (Determiner Omission)
- **ID**: gram-l1-19
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: CLASSIFIERS_COUNT
- **Trap**: Bare singular count nouns: Tôi có xe -> I have car; Cô ấy là giáo viên -> She is teacher.
- **Level**: 1
- **CEFR**: A1
- **Prompt**: My older brother wants to buy new computer next week.
- **Transformation**: My older brother wants to buy a new computer next week.
- **Grammatical Cue**: Insert indefinite article 'a' before singular countable noun phrase 'new computer'.
- **Vietnamese**: Để danh từ đếm được số ít đứng trơ trọi không có từ hạn định (Bare Nouns): Tiếng Việt danh từ đứng độc lập không cần mạo từ (mua máy tính mới). Trong tiếng Anh, danh từ đếm được số ít BẮT BUỘC phải có mạo từ (a/an/the) hoặc từ hạn định.
- **Formula**: `Subject + Verb + Indefinite Article (a/an) + (Adjective) + Singular Count Noun`
- **Analysis**: Vietnamese nouns denote generic concepts by default; individuation requires an overt numeral plus classifier. In English, singular countable nouns cannot appear as bare arguments; they must be grammatically determined.
- **Exemplar**: The junior developer requested a new monitor for the workstation.

## Uncountable Noun Pluralization with 'Homework' and 'Information'
- **ID**: gram-l1-20
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: CLASSIFIERS_COUNT
- **Trap**: Treating mass nouns as count nouns by adding plural -s: many homeworks, useful informations.
- **Level**: 1
- **CEFR**: A2
- **Prompt**: The instructor assigned us several difficult homeworks over the weekend.
- **Transformation**: The instructor assigned us a lot of difficult homework over the weekend.
- **Grammatical Cue**: Treat 'homework' as an uncountable mass noun; replace 'several difficult homeworks' with 'a lot of difficult homework'.
- **Vietnamese**: Thêm đuôi số nhiều -s vào danh từ không đếm được: Tiếng Việt đếm 'bài tập' (nhiều bài tập về nhà), 'thông tin' (nhiều thông tin) thông qua từ chỉ số lượng. Tiếng Anh coi 'homework', 'information' là danh từ trừu tượng không đếm được, tuyệt đối không thêm -s.
- **Formula**: `Subject + Verb + Quantifier (a lot of / much) + Uncountable Noun (No -s)`
- **Analysis**: Cross-linguistic semantic mismatch: Vietnamese treats instructional tasks as discrete countable units via classifiers ('bài'). English categorizes 'homework' and 'information' as continuous non-count mass substances.
- **Exemplar**: The students completed all their assigned homework before attending the workshop.

## Uncountable 'Advice' Partitive Carrier Construction
- **ID**: gram-l1-21
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: CLASSIFIERS_COUNT
- **Trap**: Using indefinite article or plural with 'advice': an advice, many advices.
- **Level**: 2
- **CEFR**: B1
- **Prompt**: The senior mentor gave me a valuable advice regarding career progression.
- **Transformation**: The senior mentor gave me a valuable piece of advice regarding career progression.
- **Grammatical Cue**: Insert the partitive classifier noun 'piece of' before uncountable noun 'advice'.
- **Vietnamese**: Dùng 'an advice' hoặc 'advices': 'Lời khuyên' trong tiếng Việt đếm được (một lời khuyên). Trong tiếng Anh, 'advice' là không đếm được; muốn đếm một lời khuyên phải dùng danh từ phân đoạn: 'a piece of advice'.
- **Formula**: `Subject + Verb + a valuable piece of + Uncountable Noun (advice)`
- **Analysis**: Vietnamese speakers intuitively transfer classifier grammar by assuming 'advice' accepts direct cardinal counting. English requires an explicit partitive counter noun ('a piece of', 'words of') to individuate the mass concept.
- **Exemplar**: The career counselor offered several useful pieces of advice on interview preparation.

## Mass Technical Nouns in Industrial & Technological Contexts
- **ID**: gram-l1-22
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: CLASSIFIERS_COUNT
- **Trap**: Affixing plural -s to technical mass nouns: equipments, machineries, softwares.
- **Level**: 2
- **CEFR**: B2
- **Prompt**: The new laboratory installed several cutting-edge equipments yesterday.
- **Transformation**: The new laboratory installed several pieces of cutting-edge equipment yesterday.
- **Grammatical Cue**: Treat 'equipment' as non-count; use partitive 'pieces of equipment'.
- **Vietnamese**: Thêm -s vào danh từ kỹ thuật không đếm được như 'equipment', 'software'. Tiếng Việt coi 'thiết bị', 'phần mềm' là danh từ đếm được; tiếng Anh bắt buộc dùng cụm phân đoạn 'pieces of equipment' hoặc 'software applications'.
- **Formula**: `Subject + Verb + Quantifier + pieces of + Uncountable Technical Noun`
- **Analysis**: Vietnamese technical terminology translates concepts like 'thiết bị' (equipment) as countable physical items. In standard English, 'equipment', 'software', and 'machinery' are aggregate mass nouns that forbid inflectional -s.
- **Exemplar**: The manufacturing facility upgraded its high-precision diagnostic equipment.

## Generic Zero-Article vs Definite Article in Abstract Nouns
- **ID**: gram-l1-23
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: CLASSIFIERS_COUNT
- **Trap**: Over-inserting 'the' before abstract nouns used in a generic sense: The society, The life.
- **Level**: 3
- **CEFR**: C1
- **Prompt**: The society must establish robust institutions to preserve the democracy.
- **Transformation**: Society must establish robust institutions to preserve democracy.
- **Grammatical Cue**: Remove the over-inserted definite article 'the' before generic abstract nouns 'society' and 'democracy'.
- **Vietnamese**: Lạm dụng 'the' trước danh từ trừu tượng nói chung: Người học thường nghĩ 'the' làm cho câu văn học thuật hơn, dẫn đến 'The society', 'The life'. Khi nói về xã hội hay dân chủ nói chung, tiếng Anh dùng danh từ trần (Zero Article).
- **Formula**: `Zero Article + Abstract Noun (Generic) + Verb + Zero Article + Abstract Noun`
- **Analysis**: In Vietnamese, demonstratives ('ấy', 'này') specify referents, but abstract generalizations require no markers. Learners overcompensate in formal English by adding 'the' to generic concepts. English uses the zero article for general abstract notions.
- **Exemplar**: Democratic society depends on transparent institutions to safeguard human rights.

## Mass Abstract Nouns in Forensic Academic Epistemology
- **ID**: gram-l1-24
- **Mode**: L1_CONTRASTIVE_REPAIR
- **Vector**: CLASSIFIERS_COUNT
- **Trap**: Pluralizing mass epistemological lexis: researches, evidences, knowledges.
- **Level**: 3
- **CEFR**: C2
- **Prompt**: These empirical researches provide compelling evidences supporting the hypothesis.
- **Transformation**: This empirical research provides compelling evidence supporting the hypothesis.
- **Grammatical Cue**: Change demonstrative and verbs to singular concord with mass nouns 'research' and 'evidence'.
- **Vietnamese**: Thêm -s vào các danh từ học thuật trừu tượng cao cấp ('researches', 'evidences'). Trong tiếng Anh học thuật C2, 'research' và 'evidence' là danh từ không đếm được; phải dùng số ít 'This research provides compelling evidence'.
- **Formula**: `Singular Demonstrative + Adjective + research + Singular Verb + Adjective + evidence`
- **Analysis**: At the C1/C2 threshold, persistent fossilization manifests in pluralizing high-register epistemological substantives ('research', 'evidence', 'feedback'). Rigorous academic peer-reviewed English strictly enforces singular mass agreement.
- **Exemplar**: Recent epidemiological research provides incontrovertible evidence of environmental causation.
