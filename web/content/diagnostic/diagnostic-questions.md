---
title: "CEFR Multi-Skill Diagnostic Assessment Question Bank"
description: "Curated 30-item diagnostic matrix testing Vocabulary, Collocations, Grammar, Reading, and Writing across A1 to C2 tiers."
totalQuestions: 30
levels: ["A1", "A2", "B1", "B2", "C1", "C2"]
skills: ["vocab", "collocation", "grammar", "reading", "writing"]
---

# CEFR Multi-Skill Diagnostic Assessment Question Bank
### Ngân Hàng Câu Hỏi Đánh Giá Đa Kỹ Năng Chuẩn CEFR (A1–C2)

Tài liệu này cung cấp ma trận 30 câu hỏi thẩm định chuẩn hóa nhằm xác định trình độ độc lập theo từng kỹ năng:
- **Stage 1**: Vocabulary & Collocations (Từ vựng & Cụm từ cố định)
- **Stage 2**: Grammar & Syntax (Ngữ pháp & Biến đổi cú pháp)
- **Stage 3**: Reading Comprehension (Đọc hiểu suy luận)
- **Stage 5**: Writing Precision & Rhetoric (Độ chính xác và phong cách viết học thuật)

---

## 1. Diagnostic Matrix Distribution (Phân Bổ Ma Trận 30 Câu)

| CEFR Tier | Stage 1: Vocab | Stage 1: Colloc | Stage 2: Grammar | Stage 3: Reading | Stage 5: Writing | Total |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **A1 Beginner** | 1 (`diag-a1-vocab`) | 1 (`diag-a1-colloc`) | 1 (`diag-a1-gram`) | 1 (`diag-a1-read`) | 1 (`diag-a1-write`) | **5** |
| **A2 Elementary** | 1 (`diag-a2-vocab`) | 1 (`diag-a2-colloc`) | 1 (`diag-a2-gram`) | 1 (`diag-a2-read`) | 1 (`diag-a2-write`) | **5** |
| **B1 Intermediate** | 1 (`diag-b1-vocab`) | 1 (`diag-b1-colloc`) | 1 (`diag-b1-gram`) | 1 (`diag-b1-read`) | 1 (`diag-b1-write`) | **5** |
| **B2 Upper-Inter** | 1 (`diag-b2-vocab`) | 1 (`diag-b2-colloc`) | 1 (`diag-b2-gram`) | 1 (`diag-b2-read`) | 1 (`diag-b2-write`) | **5** |
| **C1 Advanced** | 1 (`diag-c1-vocab`) | 1 (`diag-c1-colloc`) | 1 (`diag-c1-gram`) | 1 (`diag-c1-read`) | 1 (`diag-c1-write`) | **5** |
| **C2 Mastery** | 1 (`diag-c2-vocab`) | 1 (`diag-c2-colloc`) | 1 (`diag-c2-gram`) | 1 (`diag-c2-read`) | 1 (`diag-c2-write`) | **5** |
| **Total Items** | **6** | **6** | **6** | **6** | **6** | **30** |

---

## 2. Machine-Readable Diagnostic Dataset

```json
[
  {
    "id": "diag-a1-vocab",
    "level": "A1",
    "skill": "vocab",
    "stage": 1,
    "prompt": "Choose the word that best completes the sentence:",
    "context": "I need to buy some fresh ______ for a green salad: lettuce, cucumbers and onions.",
    "options": [
      "vegetables",
      "fruits",
      "grains",
      "meat"
    ],
    "answer": 0,
    "explanation": "Lettuce, cucumbers and onions are vegetables. Fruits, grains and meat are also food, but none of them is what the list describes.",
    "vietnamese": "Tôi cần mua một ít rau tươi để làm món salad rau: xà lách, dưa chuột và hành."
  },
  {
    "id": "diag-a1-colloc",
    "level": "A1",
    "skill": "collocation",
    "stage": 1,
    "prompt": "Choose the correct verb that pairs naturally with the noun:",
    "context": "Every evening after school, the children ______ their homework before dinner.",
    "options": [
      "make",
      "do",
      "create",
      "build"
    ],
    "answer": 1,
    "explanation": "The standard English collocation is 'do homework', never 'make homework'.",
    "vietnamese": "Mỗi buổi tối sau giờ học, bọn trẻ làm bài tập về nhà trước bữa tối."
  },
  {
    "id": "diag-a1-gram",
    "level": "A1",
    "skill": "grammar",
    "stage": 2,
    "prompt": "Choose the correct verb form:",
    "context": "My brother ______ in a software company in Hanoi.",
    "options": [
      "work",
      "working",
      "works",
      "is work"
    ],
    "answer": 2,
    "explanation": "The subject 'My brother' is third-person singular, requiring the base form with -s suffix: 'works'. The other options violate either tense or subject agreement rules.",
    "vietnamese": "Anh trai tôi làm việc tại một công ty phần mềm ở Hà Nội."
  },
  {
    "id": "diag-a1-read",
    "level": "A1",
    "skill": "reading",
    "stage": 3,
    "prompt": "Read the short note and answer the question:",
    "context": "Hi Anna, I am at the library now. The library closes at 5:00 PM, so let's meet at the café across the street at 5:15 PM. — Tom. Question: Where will Tom and Anna meet?",
    "options": [
      "At the library",
      "At school",
      "At home",
      "At the café"
    ],
    "answer": 3,
    "explanation": "The note explicitly states: 'let's meet at the café across the street at 5:15 PM.'",
    "vietnamese": "Chào Anna, mình đang ở thư viện. Thư viện đóng cửa lúc 5:00 chiều, nên hẹn gặp nhau ở quán cà phê đối diện lúc 5:15 chiều nhé. — Tom. Câu hỏi: Tom và Anna sẽ gặp nhau ở đâu?"
  },
  {
    "id": "diag-a1-write",
    "level": "A1",
    "skill": "writing",
    "stage": 5,
    "prompt": "Choose the sentence with natural and grammatically correct English word order:",
    "context": "Which sentence follows standard Subject + Verb + Object + Place + Time structure?",
    "options": [
      "She drinks tea in the garden every morning.",
      "Drinks she tea every morning in the garden.",
      "In the garden every morning tea she drinks.",
      "She every morning drinks in the garden tea."
    ],
    "answer": 0,
    "explanation": "Standard declarative word order requires Subject (She) + Verb (drinks) + Object (tea) + Place (in the garden) + Time (every morning).",
    "vietnamese": "Cô ấy uống trà trong vườn vào mỗi buổi sáng."
  },
  {
    "id": "diag-a2-vocab",
    "level": "A2",
    "skill": "vocab",
    "stage": 1,
    "prompt": "Choose the word that best fits the travel context:",
    "context": "We arrived late at the airport because our flight was ______ by two hours due to dense fog.",
    "options": [
      "cancelled",
      "delayed",
      "rerouted",
      "diverted"
    ],
    "answer": 1,
    "explanation": "Flights are 'delayed' when adverse conditions postpone scheduled departure times. 'Cancelled' means the flight doesn't fly at all; 'rerouted' and 'diverted' mean changing the destination or path, not merely postponing the time.",
    "vietnamese": "Chúng tôi đến sân bay muộn vì chuyến bay bị hoãn hai tiếng do sương mù dày đặc."
  },
  {
    "id": "diag-a2-colloc",
    "level": "A2",
    "skill": "collocation",
    "stage": 1,
    "prompt": "Choose the verb that collocates with 'a mistake':",
    "context": "Don't worry if you ______ a mistake while speaking; it is a natural part of practice.",
    "options": [
      "do",
      "perform",
      "make",
      "cause"
    ],
    "answer": 2,
    "explanation": "The established collocation is 'make a mistake'. English does not permit 'do a mistake'.",
    "vietnamese": "Đừng lo nếu bạn phạm sai lầm khi nói; đó là một phần tự nhiên của việc luyện tập."
  },
  {
    "id": "diag-a2-gram",
    "level": "A2",
    "skill": "grammar",
    "stage": 2,
    "prompt": "Choose the correct verb form:",
    "context": "Yesterday morning, she ______ her keys on the dining table before leaving.",
    "options": [
      "has left",
      "leaves",
      "is left",
      "left"
    ],
    "answer": 3,
    "explanation": "The context 'Yesterday morning' requires past simple tense. 'Left' is the correct past simple form of 'leave'. The other options use present or present perfect, which contradict the past time marker.",
    "vietnamese": "Sáng hôm qua, cô ấy để quên chìa khóa trên bàn ăn trước khi rời đi."
  },
  {
    "id": "diag-a2-read",
    "level": "A2",
    "skill": "reading",
    "stage": 3,
    "prompt": "Read the short passage and identify one benefit Sarah gains:",
    "context": "Walking to work takes twenty minutes longer than taking the bus, but Sarah prefers it. She feels more energetic during morning meetings and saves ten dollars every week. Question: What advantage does walking provide to Sarah?",
    "options": [
      "She spends less time commuting",
      "She feels more energetic during morning meetings",
      "The bus ticket price increased dramatically",
      "She has time to buy breakfast"
    ],
    "answer": 1,
    "explanation": "The passage explicitly states 'She feels more energetic during morning meetings'. While she also saves money, the energy boost is the primary benefit mentioned regarding how walking affects her.",
    "vietnamese": "Đi bộ đi làm mất thêm 20 phút so với đi xe buýt, nhưng Sarah thích hơn. Cô cảm thấy tràn đầy năng lượng hơn trong các cuộc họp buổi sáng và tiết kiệm được mười đô la mỗi tuần."
  },
  {
    "id": "diag-a2-write",
    "level": "A2",
    "skill": "writing",
    "stage": 5,
    "prompt": "Choose the sentence that correctly combines two contrasting ideas:",
    "context": "Idea 1: The weather was cold and rainy. Idea 2: We enjoyed our weekend camping trip.",
    "options": [
      "The weather was cold and rainy, so we enjoyed our weekend camping trip.",
      "Although the weather was cold and rainy, we enjoyed our weekend camping trip.",
      "Because the weather was cold and rainy, we enjoyed our weekend camping trip.",
      "Despite the weather was cold and rainy, we enjoyed our weekend camping trip."
    ],
    "answer": 1,
    "explanation": "'Although' links two contrasting facts in one sentence. 'So' and 'because' wrongly say the bad weather caused the enjoyment, and 'despite' must be followed by a noun phrase ('despite the cold, rainy weather'), not a full clause.",
    "vietnamese": "Mặc dù thời tiết lạnh và mưa, chúng tôi vẫn rất thích chuyến cắm trại cuối tuần."
  },
  {
    "id": "diag-b1-vocab",
    "level": "B1",
    "skill": "vocab",
    "stage": 1,
    "prompt": "Choose the phrasal verb that fits the context:",
    "context": "Due to heavy thunderstorms, the organizers had to ______ the outdoor music festival completely; it will not take place this year.",
    "options": [
      "give up",
      "put off",
      "call off",
      "look after"
    ],
    "answer": 2,
    "explanation": "'Call off' means cancel. 'Put off' means postpone, but the sentence says the festival will not take place this year at all. 'Give up' (stop trying) and 'look after' (take care of) do not fit an event.",
    "vietnamese": "Do giông bão lớn, ban tổ chức đã phải hủy bỏ lễ hội âm nhạc ngoài trời."
  },
  {
    "id": "diag-b1-colloc",
    "level": "B1",
    "skill": "collocation",
    "stage": 1,
    "prompt": "Choose the word that best fits the sentence:",
    "context": "Solar power has become a ______ option for developing regions seeking to reduce carbon emissions without compromising energy security.",
    "options": [
      "reluctant",
      "punctual",
      "viable",
      "willing"
    ],
    "answer": 2,
    "explanation": "'A viable option' means one that can really work. 'Reluctant', 'punctual' and 'willing' describe people, not options: a person can be willing, but an option cannot.",
    "vietnamese": "Năng lượng mặt trời đã trở thành một giải pháp khả thi cho các khu vực đang phát triển cầu giảm phát thải carbon."
  },
  {
    "id": "diag-b1-gram",
    "level": "B1",
    "skill": "grammar",
    "stage": 2,
    "prompt": "Choose the correct verb form:",
    "context": "If I ______ more free time on weekends, I would volunteer at the local animal shelter.",
    "options": [
      "had",
      "have",
      "will have",
      "would have"
    ],
    "answer": 0,
    "explanation": "The clause 'I would volunteer' indicates a hypothetical result, requiring past simple 'had' in the if-clause to express an unreal present condition. Present tense 'have', future 'will have', and past conditional 'would have' all fail the conditional structure.",
    "vietnamese": "Nếu tôi có nhiều thời gian rảnh rỗi hơn vào cuối tuần, tôi sẽ làm tình nguyện viên tại trạm cứu hộ động vật địa phương."
  },
  {
    "id": "diag-b1-read",
    "level": "B1",
    "skill": "reading",
    "stage": 3,
    "prompt": "Read the excerpt and determine the author's primary argument:",
    "context": "Many language learners obsess over achieving an indistinguishable native accent, often spending hundreds of hours on minute vowel nuances. Yet international communication prioritizes acoustic clarity and mutual intelligibility over regional mimicry. Question: What is the author's core thesis regarding accent training?",
    "options": [
      "Learners should spend more time perfecting individual vowels",
      "Clear communication is more important than mimicking a native accent",
      "Regional accents inevitably prevent mutual understanding",
      "Native-like pronunciation is required for professional success"
    ],
    "answer": 1,
    "explanation": "The text explicitly prioritizes 'acoustic clarity and mutual intelligibility over regional mimicry'.",
    "vietnamese": "Giao tiếp rõ ràng và thông hiểu lẫn nhau quan trọng hơn việc bắt chước giọng bản xứ."
  },
  {
    "id": "diag-b1-write",
    "level": "B1",
    "skill": "writing",
    "stage": 5,
    "prompt": "Choose the sentence that best eliminates wordiness and improves clarity:",
    "context": "Draft: Due to the fact that the company suffered severe financial losses, it made a decision to reduce employee staff numbers.",
    "options": [
      "Due to the fact that the company had severe losses, they made the decision for staff reduction.",
      "Because the company had suffered losses, they decided that staff reduction was necessary.",
      "Because the company suffered severe financial losses, it decided to downsize its staff.",
      "The company's financial losses caused them to make a reduction decision for their staff numbers."
    ],
    "answer": 2,
    "explanation": "Option 2 replaces wordy 'Due to the fact that' with 'Because' and eliminates the nominalization 'made a decision to reduce' in favor of the direct verb 'decided to downsize'. The other options retain unnecessary nominalizations or awkward phrasing.",
    "vietnamese": "Bởi vì công ty chịu tổn thất tài chính nặng nề, họ đã quyết định tinh giản nhân sự."
  },
  {
    "id": "diag-b2-vocab",
    "level": "B2",
    "skill": "vocab",
    "stage": 1,
    "prompt": "Choose the word that best fits the sentence:",
    "context": "Leading environmental scientists continue to ______ stricter regulations, arguing that they would protect rivers from industrial waste.",
    "options": [
      "suppress",
      "question",
      "observe",
      "advocate"
    ],
    "answer": 3,
    "explanation": "'Advocate' means publicly support. The scientists argue the rules would protect rivers, so they support them; 'suppress' and 'question' are the opposite, and 'observe' (follow or notice) does not match arguing for new rules.",
    "vietnamese": "Các nhà khoa học môi trường hàng đầu tiếp tục ủng hộ các quy định nghiêm ngặt hơn về xả thải nước thải công nghiệp."
  },
  {
    "id": "diag-b2-colloc",
    "level": "B2",
    "skill": "collocation",
    "stage": 1,
    "prompt": "Choose the verb that collocates with 'a contract' to mean violating its terms:",
    "context": "If the contractor fails to deliver the equipment by the agreed deadline, they will ______ the contract.",
    "options": [
      "breach",
      "fracture",
      "demolish",
      "wound"
    ],
    "answer": 0,
    "explanation": "'Breach a contract' is the standard legal collocation for violating contractual terms.",
    "vietnamese": "Nếu nhà thầu không giao thiết bị đúng thời hạn đã thỏa thuận, họ sẽ vi phạm hợp đồng."
  },
  {
    "id": "diag-b2-gram",
    "level": "B2",
    "skill": "grammar",
    "stage": 2,
    "prompt": "Choose the correct word order to complete the sentence:",
    "context": "Seldom ______ such fierce resistance from shareholders during annual meetings.",
    "options": [
      "the executive team encountered",
      "did the executive team encounter",
      "had the executive team encounter",
      "the executives encountering"
    ],
    "answer": 1,
    "explanation": "Fronted negative adverbial 'Seldom' triggers subject-auxiliary inversion: 'did' + subject + bare infinitive 'encounter'. Options 0, 2, and 3 either lack inversion or use incorrect verb forms.",
    "vietnamese": "Hiếm khi ban điều hành lại vấp phải sự kháng cự quyết liệt như vậy từ các cổ đông trong các cuộc họp hàng năm."
  },
  {
    "id": "diag-b2-read",
    "level": "B2",
    "skill": "reading",
    "stage": 3,
    "prompt": "Read the analysis and identify the hidden drawback described:",
    "context": "The rapid decentralization of corporate teams has accelerated asynchronous collaboration tools, enabling global talent acquisition. However, it has simultaneously eroded tacit knowledge transfer—the spontaneous exchanges by the watercooler that historically catalyzed unexpected innovations. Question: What hidden drawback of asynchronous work does the author highlight?",
    "options": [
      "An inability to recruit specialized international talent",
      "Higher administrative costs of enterprise software licenses",
      "The loss of spontaneous informal knowledge sharing",
      "Decreased velocity in routine digital communications"
    ],
    "answer": 2,
    "explanation": "The text specifically warns of the erosion of 'tacit knowledge transfer—the spontaneous exchanges... that catalyzed unexpected innovations'.",
    "vietnamese": "Sự mai một của quá trình trao đổi tri thức ngầm tự phát giữa các đồng nghiệp."
  },
  {
    "id": "diag-b2-write",
    "level": "B2",
    "skill": "writing",
    "stage": 5,
    "prompt": "Choose the sentence that maintains strict grammatical parallelism in a coordinate series:",
    "context": "Which sentence correctly aligns verbal elements in a parallel series?",
    "options": [
      "The new project manager excels at setting clear objectives, to delegate authority, and motivates her team.",
      "The new project manager excels at setting clear objectives, authority delegation, and team motivation.",
      "The new project manager excels at clear objectives, delegating authority, and to motivate her team.",
      "The new project manager excels at setting clear objectives, delegating authority, and motivating her team."
    ],
    "answer": 3,
    "explanation": "All three coordinate elements use parallel gerund-participle phrases: 'setting clear objectives', 'delegating authority', and 'motivating her team'.",
    "vietnamese": "Giám đốc dự án mới rất xuất sắc trong việc đặt mục tiêu rõ ràng, ủy quyền quyền hạn, và truyền động lực cho đội ngũ."
  },
  {
    "id": "diag-c1-vocab",
    "level": "C1",
    "skill": "vocab",
    "stage": 1,
    "prompt": "Choose the word that best fits the sentence:",
    "context": "A tranquil and distraction-free environment is highly ______ to deep cognitive focus and sustained productivity.",
    "options": [
      "conducive",
      "detrimental",
      "irrelevant",
      "contradictory"
    ],
    "answer": 0,
    "explanation": "'Conducive (to)' means promoting or making likely a desirable outcome. 'Detrimental' means harmful (opposite meaning); 'irrelevant' means not connected; 'contradictory' means conflicting.",
    "vietnamese": "Một môi trường yên tĩnh và không bị xao nhãng rất thuận lợi cho sự tập trung nhận thức sâu và năng suất bền bỉ."
  },
  {
    "id": "diag-c1-colloc",
    "level": "C1",
    "skill": "collocation",
    "stage": 1,
    "prompt": "Choose the verb completing the idiom meaning to illuminate or clarify an obscure matter:",
    "context": "Recent neuroimaging studies have ______ light on the physiological mechanisms underpinning memory consolidation.",
    "options": [
      "poured",
      "shed",
      "beamed",
      "flashed"
    ],
    "answer": 1,
    "explanation": "'Shed light on' is the fixed idiom for clarifying something obscure. 'Poured', 'beamed' and 'flashed' all describe light physically but do not form the idiom.",
    "vietnamese": "Các nghiên cứu hình ảnh thần kinh gần đây đã làm sáng tỏ các cơ chế sinh lý hỗ trợ quá trình củng cố trí nhớ."
  },
  {
    "id": "diag-c1-gram",
    "level": "C1",
    "skill": "grammar",
    "stage": 2,
    "prompt": "Choose the correct verb form:",
    "context": "The regulatory commission recommended that the pharmaceutical company ______ all clinical trial data immediately.",
    "options": [
      "discloses",
      "disclosed",
      "disclose",
      "should have disclosed"
    ],
    "answer": 2,
    "explanation": "After mandative verbs like 'recommend that', the subordinate clause requires the base infinitive form ('disclose') without inflection or auxiliary, regardless of subject person or tense.",
    "vietnamese": "Ủy ban quản lý khuyến nghị công ty dược phẩm phải công khai toàn bộ dữ liệu thử nghiệm lâm sàng ngay lập tức."
  },
  {
    "id": "diag-c1-read",
    "level": "C1",
    "skill": "reading",
    "stage": 3,
    "prompt": "Read the excerpt and identify the author's primary concern:",
    "context": "The contemporary obsession with algorithmic optimization reduces human agency to predictive behavioral trajectories. By preempting genuine cognitive friction through hyper-personalized feeds, platforms engineer an epistemic cocoon that masquerades as effortless choice while steadily atrophying deliberative autonomy. Question: What is the deeper social consequence the author identifies?",
    "options": [
      "Users experience frustration when algorithms fail to predict their preferences",
      "Platforms lose revenue due to inefficient content recommendations",
      "The illusion of choice erodes users' capacity for independent critical thinking",
      "Technical infrastructure requires increasingly complex neural networks"
    ],
    "answer": 2,
    "explanation": "The author explicitly warns that algorithms 'atrophy deliberative autonomy' by creating an 'epistemic cocoon' that mimics choice while undermining genuine independence. The other options address peripheral technical or business concerns, not the author's philosophical argument.",
    "vietnamese": "Nó làm suy giảm năng lực tự chủ cân nhắc và suy ngẫm độc lập của con người thông qua ảo tưởng về sự lựa chọn."
  },
  {
    "id": "diag-c1-write",
    "level": "C1",
    "skill": "writing",
    "stage": 5,
    "prompt": "Choose the revision demonstrating superior periodic cadence and rhetorical focus for academic prose:",
    "context": "Which revision best subordinates background context to deliver emphatic focus on the principal finding?",
    "options": [
      "Although initial telemetry indicated minor orbital decay, subsequent calculations confirmed that the satellite had reached stable equilibrium.",
      "The satellite reached stable equilibrium; initial telemetry indicated minor orbital decay, but calculations contradicted this.",
      "Initial telemetry indicated minor orbital decay; however, subsequent calculations were confirming stable equilibrium of the satellite.",
      "The background of competing data aside, subsequent calculations confirmed stable equilibrium."
    ],
    "answer": 0,
    "explanation": "Option 0 creates a clean periodic structure: the concessive clause (Although...) subordinates and dismisses background context (minor decay), then the main clause delivers emphatic focus on the principal finding (stable equilibrium). Options 1-3 either emphasize contradiction, use awkward passive, or leave the emphasis ambiguous.",
    "vietnamese": "Mặc dù dữ liệu đo đạc ban đầu cho thấy sự suy giảm quỹ đạo nhỏ, các tính toán sau đó đã xác nhận vệ tinh đã đạt trạng thái cân bằng ổn định."
  },
  {
    "id": "diag-c2-vocab",
    "level": "C2",
    "skill": "vocab",
    "stage": 1,
    "prompt": "Choose the word that best fits the sentence:",
    "context": "Despite months of multilateral diplomacy, the border dispute proved ______ to conventional mediation protocols.",
    "options": [
      "inconsequential",
      "intractable",
      "obsequious",
      "ephemeral"
    ],
    "answer": 1,
    "explanation": "'Intractable' means stubbornly resistant to management, resolution, or cure. 'Inconsequential' means trivial; 'obsequious' means slavishly obedient; 'ephemeral' means temporary. Only 'intractable' captures the idea of persistent difficulty.",
    "vietnamese": "Bất chấp nhiều tháng ngoại giao đa phương, cuộc tranh chấp biên giới tỏ ra hoàn toàn nan giải trước các quy trình hòa giải thông thường."
  },
  {
    "id": "diag-c2-colloc",
    "level": "C2",
    "skill": "collocation",
    "stage": 1,
    "prompt": "Choose the phrase that best fits the sentence:",
    "context": "The rapid expansion of extractive agriculture proceeded ______ the long-term ecological integrity of the river basin.",
    "options": [
      "in light of",
      "by means of",
      "at the expense of",
      "with a view to"
    ],
    "answer": 2,
    "explanation": "'At the expense of' is the high-register collocation meaning to cause damage or sacrifice to something else in pursuit of a goal. 'In light of' means considering; 'by means of' means through; 'with a view to' means in order to. None of these express sacrifice or detriment.",
    "vietnamese": "Sự mở rộng nhanh chóng của nông nghiệp khai thác diễn ra với cái giá phải trả là sự toàn vẹn sinh thái lâu dài của lưu vực sông."
  },
  {
    "id": "diag-c2-gram",
    "level": "C2",
    "skill": "grammar",
    "stage": 2,
    "prompt": "Choose the grammatically correct construction to complete the sentence:",
    "context": "The central bank unexpectedly raised the benchmark interest rate, ______ to their lowest valuations in a decade.",
    "options": [
      "with equity prices were plummeting",
      "equity prices having been plummeted",
      "having equity prices plummeted",
      "equity prices plummeting"
    ],
    "answer": 3,
    "explanation": "A nominative absolute (or absolute phrase) consists of a noun phrase ('equity prices') and a non-finite participle ('plummeting') expressing a circumstantial condition accompanying the main clause. Options 0-2 either use finite verbs, incorrect passive forms, or violate participial syntax.",
    "vietnamese": "Ngân hàng trung ương bất ngờ tăng lãi suất cơ bản, với giá cổ phiếu lao dốc xuống mức định giá thấp nhất trong một thập kỷ."
  },
  {
    "id": "diag-c2-read",
    "level": "C2",
    "skill": "reading",
    "stage": 3,
    "prompt": "Read the philosophical passage and identify the author's primary thesis:",
    "context": "Language does not merely register preexisting reality; it circumscribes the horizons of intelligible thought. When discourse is colonized by prefabricated ideological cant and decayed metaphors, the intellect forfeits its capacity for forensic appraisal. The regeneration of syntax is thus not an aesthetic indulgence, but the prerequisite for civic sanity. Question: What is the author's primary philosophical thesis?",
    "options": [
      "Linguistic precision is indispensable for preserving intellectual and civic freedom",
      "Aesthetic ornamentation in prose naturally degenerates over historical epochs",
      "Ideological uniformity is an inevitable consequence of mass political discourse",
      "Grammatical rules should be relaxed to accommodate evolving popular idioms"
    ],
    "answer": 0,
    "explanation": "The author argues that regenerating syntactic precision is a necessary prerequisite for genuine intellectual appraisal and civic sanity.",
    "vietnamese": "Sự chính xác và trong sáng của ngôn ngữ là điều kiện tiên quyết không thể thiếu để bảo tồn tự do trí tuệ và sự tỉnh táo của xã hội công dân."
  },
  {
    "id": "diag-c2-write",
    "level": "C2",
    "skill": "writing",
    "stage": 5,
    "prompt": "Choose the sentence that masterfully deploys classical chiasmus (ABBA word-order inversion) with antithetical resonance:",
    "context": "Which sentence exemplifies a classical chiasmus paired with balanced rhetorical antithesis?",
    "options": [
      "We build many grand houses, and then those buildings are altering how we live.",
      "We shape our architectural dwellings, and afterwards our dwellings shape our civic lives.",
      "Our buildings are designed by our hands, while our lives are affected by their design.",
      "Because we construct our buildings carefully, they subsequently influence our society deeply."
    ],
    "answer": 1,
    "explanation": "Option 1 deploys classical chiasmus: 'shape (A) dwellings (B)' reverses into 'dwellings (B) shape (A) civic lives', creating the ABBA inversion pattern with powerful antithetical symmetry. The other options lack this recursive word-order reversal.",
    "vietnamese": "Chúng ta nhào nặn nên những công trình kiến trúc của mình, và sau đó chính những công trình ấy nhào nặn nên đời sống công dân của chúng ta."
  }
]
```
