# The Master Anki Spaced Repetition (SRS) System
### Hướng Dẫn Vận Hành Hệ Thống Ghi Nhớ Ngắt Quãng & Bộ Thẻ Collocations Thực Chiến Chuẩn Quốc Tế

---

## 1. Nền Tảng Khoa Học & Thiết Lập Thuật Toán Tối Ưu (Optimal SRS Parameters)

Hệ thống ghi nhớ ngắt quãng (**Spaced Repetition System - SRS**) vận hành dựa trên định luật đường cong quên lãng của Hermann Ebbinghaus và hiệu ứng kiểm tra (**Testing Effect**). Thay vì nhồi nhét thụ động (*passive cramming*), SRS buộc não bộ phải truy xuất thông tin chủ động (*active recall*) đúng vào thời điểm chuẩn bị rơi vào vùng quên lãng.

```
Mức độ nhớ (%)
100 % ───────────┐         ┌─────────┐             ┌───────────┐
                 │╲       ╱│╲       ╱│╲           ╱│╲         ╱│
                 │ ╲     ╱ │ ╲     ╱ │ ╲         ╱ │ ╲       ╱ │
                 │  ╲   ╱  │  ╲   ╱  │  ╲       ╱  │  ╲     ╱  │
  40 % ──────────┼───╲─╱───┼───╲─╱───┼───╲─────╱───┼───╲───╱───┼── (Ngưỡng quên lãng)
                 │    V    │    V    │    V        │    V      │
                 └─────────┴─────────┴─────────────┴───────────┴──
                 Lần 1     Lần 2     Lần 3         Lần 4       Lần 5
                 (+1 ngày) (+3 ngày) (+7 ngày)     (+16 ngày)  (+35 ngày)
```

---

### 1.1. So Sánh Thuật Toán: SM-2 vs. FSRS (Modern Anki)

* **Legacy SM-2 (SuperMemo-2):** Thuật toán mặc định hơn 30 năm qua. Điểm yếu cố hữu là hiện tượng **"Ease Hell"**: khi người học bấm nút *Hard* hoặc *Again*, hệ số *Ease Factor* bị sụt giảm vĩnh viễn, dẫn đến việc thẻ xuất hiện quá dày đặc làm người học kiệt sức (*review fatigue*).
* **FSRS (Free Spaced Repetition Scheduler - Anki v23.10+):** Thuật toán hiện đại dựa trên mô hình học máy 3 biến số (**D - Difficulty, S - Stability, R - Retrievability**). FSRS giảm 20% - 30% số lượt ôn tập hàng ngày nhưng vẫn đảm bảo đúng tỷ lệ nhớ mong muốn.

---

### 1.2. Bảng Tham Số Tối Ưu Hóa Chuẩn (Deck Options Preset)

Để đảm bảo hiệu suất học tiếng Anh đỉnh cao mà không bị quá tải, thiết lập bảng điều khiển Anki (**Deck Options**) theo các thông số khoa học sau:

#### A. Cấu Hình Chuẩn cho FSRS (Khuyên Dùng cho Anki Mới Nhất)
| Tham Số (Parameter) | Giá Trị Đề Xuất | Giải Thích Bản Chất & Cơ Chế |
| :--- | :--- | :--- |
| **Enable FSRS** | `ON` | Kích hoạt thuật toán máy học hiện đại |
| **Desired Retention** | `0.88` - `0.90` (88% - 90%) | **Điểm vàng (Sweet Spot)**: Cân bằng tối ưu giữa tỷ lệ ghi nhớ và khối lượng thẻ ôn tập hàng ngày. Đặt > 92% sẽ làm tăng gấp đôi số lượng thẻ cần ôn. |
| **Learning Steps** | `10m` hoặc `15m` | Với FSRS, chỉ cần 1 bước học ngắn trong ngày đầu tiên; các khoảng cách sau do FSRS tự tính toán dựa trên độ khó. |
| **Relearning Steps** | `10m` | Bước học lại khi lỡ quên thẻ (*lapse*). |
| **Maximum Interval** | `36500` (100 năm) | Cho phép thuật toán mở rộng khoảng cách tự nhiên không giới hạn trần giả tạo. |
| **New Cards / Day** | `15` - `20` thẻ/ngày | Giữ tổng khối lượng ôn tập ổn định ở mức 100 - 150 thẻ/ngày (tương đương 15-20 phút học). |
| **Maximum Reviews / Day** | `9999` | Không bao giờ giới hạn số thẻ ôn tập; giới hạn sẽ tạo ra nợ đọng thẻ (*backlog*). |

#### B. Cấu Hình Chuẩn cho SM-2 (Dành cho phiên bản Anki cũ hơn)
| Tham Số (Parameter) | Giá Trị Đề Xuất | Giải Thích Bản Chất & Cơ Chế |
| :--- | :--- | :--- |
| **Learning Steps** | `15m 1d` | Giúp khắc phục việc vừa học xong đã quên trong 24 giờ đầu. |
| **Graduating Interval** | `3` ngày | Khoảng cách sau khi hoàn thành các bước học thử thách ban đầu. |
| **Easy Interval** | `5` ngày | Thưởng cho thẻ quá quen thuộc khi bấm *Easy*. |
| **Starting Ease** | `250%` | Hệ số giãn cách ban đầu. |
| **Interval Modifier** | `100%` | Giữ nguyên tỷ lệ chuẩn. |
| **New Interval (Lapse)** | `20%` | Khi quên, thẻ không bị đưa về ngày 1 hoàn toàn mà giữ lại 20% khoảng cách trước đó để tránh "Ease Hell". |
| **Leech Threshold** | `4` lapses | Sau 4 lần quên, đánh dấu thẻ là *Leech*. |
| **Leech Action** | `Tag Only` | **Tối quan trọng**: Chỉ gắn thẻ `leech`, không tự động ẩn thẻ (*Suspend*). Người học cần sửa lại câu ví dụ thay vì bỏ rơi thẻ. |

---

## 2. Kiến Trúc Thẻ Mẫu Chuẩn (Card Type Templates)

Anki chỉ phát huy sức mạnh khi thẻ được thiết kế chuẩn: **Ngắn gọn - Có ngữ cảnh - Một thông tin duy nhất (Minimum Information Principle)**.

---

### Template 1: Cloze Deletion for Collocations (Thẻ Điền Khuyết Cụm Từ Cố Định)
* **Mục đích:** Khắc sâu phản xạ ghép từ tự nhiên (Verb + Noun, Adj + Noun, Idiom).
* **Quy tắc:** Che phần từ phụ thuộc, giữ nguyên từ kích hoạt ngữ cảnh.

#### Front Template (Mặt Trước):
```html
<div class="card-container">
  <div class="deck-tag">{Deck}</div>
  <div class="cloze-sentence">{cloze:Text}</div>
  <div class="hint-text">Gợi ý cú pháp: <i>{Hint}</i></div>
</div>
```

#### Back Template (Mặt Sau):
```html
<div class="card-container">
  <div class="deck-tag">{Deck}</div>
  <div class="cloze-sentence">{cloze:Text}</div>
  
  <hr class="separator">
  
  <div class="meaning-box">
    <div class="vn-meaning">🎯 <b>Ý nghĩa:</b> {VietnameseMeaning}</div>
    {#CollocationNotes}
    <div class="colloc-notes">📌 <b>Phân tích:</b> {CollocationNotes}</div>
    {/CollocationNotes}
  </div>
</div>
```

#### Styling (CSS Giao Diện Hiện Đại & Hỗ Trợ Dark Mode):
```css
.card-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 650px;
  margin: 0 auto;
  padding: 24px;
  background-color: #ffffff;
  color: #1f2937;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.nightMode .card-container {
  background-color: #1e1e2e;
  color: #cdd6f4;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
}
.deck-tag {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 12px;
}
.cloze-sentence {
  font-size: 1.25rem;
  line-height: 1.6;
  font-weight: 500;
}
.cloze {
  font-weight: 700;
  color: #2563eb;
  background-color: #dbeafe;
  padding: 2px 6px;
  border-radius: 4px;
}
.nightMode .cloze {
  color: #89b4fa;
  background-color: #313244;
}
.separator {
  border: 0;
  height: 1px;
  background-color: #e5e7eb;
  margin: 20px 0;
}
.nightMode .separator {
  background-color: #45475a;
}
.meaning-box {
  text-align: left;
  background: #f8fafc;
  padding: 14px 18px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}
.nightMode .meaning-box {
  background: #181825;
  border-left-color: #89b4fa;
}
.vn-meaning {
  font-size: 1.05rem;
  color: #0f172a;
  margin-bottom: 6px;
}
.nightMode .vn-meaning {
  color: #cdd6f4;
}
.colloc-notes {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.5;
}
.nightMode .colloc-notes {
  color: #a6adc8;
}
```

---

### Template 2: Contextual Sentence Mining (i+1 Rule - Đọc & Mở Rộng Từ Vựng)
* **Mục đích:** Thu nạp từ vựng học thuật đỉnh cao qua câu văn thực tế theo đúng **quy tắc i+1** (cả câu chỉ có duy nhất 1 từ/cụm từ mới).
* **Trường dữ liệu (Fields):** `Sentence`, `TargetWord`, `IPA`, `POS`, `Definition`, `VietnameseMeaning`, `Collocations`, `Source`.

#### Front Template:
```html
<div class="card-container">
  <div class="badge">i+1 Reading Sentence Mining</div>
  <div class="source-tag">{Source}</div>
  <div class="mining-sentence">{Sentence}</div>
  <div class="instruction">Hãy xác định nghĩa & sắc thái của từ in đậm trong ngữ cảnh trên.</div>
</div>
```

#### Back Template:
```html
<div class="card-container">
  <div class="source-tag">{Source}</div>
  <div class="mining-sentence">{Sentence}</div>
  
  <hr class="separator">
  
  <div class="lexical-breakdown">
    <div class="headword-row">
      <span class="target-word">{TargetWord}</span>
      <span class="pos">({POS})</span>
      <span class="ipa">{IPA}</span>
    </div>
    
    <div class="definition-en">📖 <b>English:</b> {Definition}</div>
    <div class="definition-vn">🎯 <b>Tiếng Việt:</b> {VietnameseMeaning}</div>
    
    <div class="colloc-section">
      <b>Các cụm cố định thường gặp:</b>
      <div class="colloc-chips">{Collocations}</div>
    </div>
  </div>
</div>
```

---

### Template 3: Audio Transcription & Connected Speech (Nghe Chép Chính Tả & Biến Âm)
* **Mục đích:** Rèn luyện nhận diện âm thanh thực tế, giải mã hiện tượng nuốt âm (*elision*), nối âm (*catenation*), đồng hóa âm (*assimilation*) và âm lướt Schwa (/ə/).
* **Trường dữ liệu (Fields):** `AudioClip`, `SpokenTranscript`, `IPA_ConnectedSpeech`, `PhoneticPhenomenon`, `VietnameseTranslation`.

#### Front Template:
```html
<div class="card-container">
  <div class="badge audio-badge">🎧 Listening Transcription Drill</div>
  <div class="audio-control">{AudioClip}</div>
  <div class="prompt">Hãy nghe và ghi lại chính xác câu nói ra giấy/nhẩm trong đầu.</div>
</div>
```

#### Back Template:
```html
<div class="card-container">
  <div class="audio-control">{AudioClip}</div>
  <div class="revealed-transcript">{SpokenTranscript}</div>
  <div class="ipa-phonetic">🗣️ [{IPA_ConnectedSpeech}]</div>
  
  <hr class="separator">
  
  <div class="phonetic-analysis">
    <div class="phenomenon-tag">⚡ <b>Hiện tượng biến âm:</b> {PhoneticPhenomenon}</div>
    <div class="meaning-sub">Ý nghĩa: {VietnameseTranslation}</div>
  </div>
</div>
```

---

## 3. Quy Trình Vận Hành 20 Phút Hàng Ngày (The 20-Minute Daily Protocol)

Để thuật toán SRS phát huy 100% hiệu năng mà không gây kiệt sức, hãy tuân thủ nguyên tắc kỷ luật sắt:

1. **Nguyên Tắc Zero-Backlog:** Ôn hết toàn bộ số thẻ đến hạn (*Due reviews*) trước khi học thẻ mới. Không bao giờ tích nợ thẻ qua ngày hôm sau.
2. **Khẩu Quyết 10 Giây:** Mỗi thẻ chỉ được nhìn và phản xạ trong tối đa **5 – 10 giây**. Nếu sau 10 giây không nhớ ra, hãy lập tức bấm **Again (1)**. Tuyệt đối không ngồi cắn bút suy nghĩ 1-2 phút; việc đó phá vỡ bản chất truy xuất tự động của não bộ.
3. **Quy Tắc Đánh Giá Thẻ (Rating Discipline):**
   * **Again (1):** Quên hoàn toàn, hoặc đọc sai trọng âm/ngữ nghĩa cốt lõi.
   * **Hard (2):** Nhớ được nhưng rất chật vật và tốn hơn 10 giây. *(Khuyến cáo: Hạn chế bấm Hard để tránh làm giảm Ease Factor trong SM-2)*.
   * **Good (3):** Nhớ chính xác sau 3-5 giây suy nghĩ tự nhiên. *(Đây là nút mặc định 80% thời gian)*.
   * **Easy (4):** Thẻ quá dễ, phản xạ tức thì dưới 1 giây.
4. **Phát Âm Thành Tiếng (Vocalize Aloud):** Tuyệt đối không học thẻ trong im lặng. Hãy đọc to toàn bộ câu chứa cụm từ lên thành tiếng để kích hoạt đồng thời cung phản xạ vận động cơ miệng (*muscle memory*) và thính giác.

---

## 4. 50 Ready-to-Import Starter Cards (Bộ 50 Thẻ Thực Chiến Tuyển Chọn)

Dưới đây là bộ **50 thẻ Collocations cốt lõi** được trích xuất và thiết kế trực tiếp từ cẩm nang [`E:\Eng\collocations.md`](file:///E:/Eng/collocations.md), phủ đều các chủ đề: Đàm phán, Hợp đồng, Tài chính, Vận hành, Pháp lý và Tư duy học thuật.

### Bảng Xem Trước Nội Dung Thẻ (Visual Preview Table)

| No. | Cụm Từ Mục Tiêu | Câu Ngữ Cảnh (Cloze Deletion) | Bản Dịch & Ghi Chú Ngữ Nghĩa | Phân Loại Thẻ |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `make concessions` | Neither party was willing to {{c1::make concessions}} during the contentious contract negotiations. | nhượng bộ trong đàm phán | `Business::Negotiation` |
| 2 | `reach a consensus` | After five hours of intense debate, the committee finally {{c1::reached a consensus}} on the new policy. | đạt được sự đồng thuận chung | `Workplace::Operations` |
| 3 | `break the deadlock` | A compromise proposal from the neutral mediator managed to {{c1::break the deadlock}}. | phá vỡ thế bế tắc đàm phán | `Business::Negotiation` |
| 4 | `conduct due diligence` | Before acquiring the rival tech startup, the board decided to {{c1::conduct due diligence}} on their IP portfolio. | tiến hành thẩm định pháp lý và tài chính chuyên sâu | `Finance::Corporate` |
| 5 | `gain a competitive edge` | Investing heavily in proprietary artificial intelligence gave the firm a {{c1::competitive edge}} over rivals. | tạo lập lợi thế cạnh tranh vượt trội | `Business::Strategy` |
| 6 | `gain market share` | Aggressive pricing and superior product design allowed the brand to {{c1::gain market share}} rapidly. | gia tăng thị phần | `Commerce::Marketing` |
| 7 | `corner the market` | By buying up all local distribution rights, the conglomerate attempted to {{c1::corner the market}}. | lũng đoạn / thống lĩnh toàn bộ thị trường | `Commerce::Trade` |
| 8 | `breach a contract` | Failing to deliver the machinery on the agreed date was deemed an explicit {{c1::breach of contract}}. | vi phạm các điều khoản hợp đồng | `Law::Contract` |
| 9 | `legally binding` | Once both executive signatures are affixed, the memorandum becomes {{c1::legally binding}}. | có tính ràng buộc về mặt pháp lý | `Law::Contract` |
| 10 | `null and void` | Because the initial permit was forged, the operating license was declared {{c1::null and void}} by the court. | vô hiệu / không có giá trị pháp lý | `Law::Regulatory` |
| 11 | `terms and conditions` | Users are strongly advised to read the {{c1::terms and conditions}} before installing the enterprise software. | các điều khoản và điều kiện | `Law::Compliance` |
| 12 | `non-disclosure agreement` | Before discussing proprietary trade secrets, external consultants must sign a {{c1::non-disclosure agreement}}. | thỏa thuận bảo mật thông tin (NDA) | `Law::Corporate` |
| 13 | `raise capital` | The founders embarked on an international roadshow to {{c1::raise capital}} for expansion. | huy động vốn đầu tư kinh doanh | `Finance::Investment` |
| 14 | `venture capital` | Securing backing from a tier-one {{c1::venture capital}} fund accelerated the startup's hiring plan. | nguồn vốn đầu tư mạo hiểm | `Finance::Investment` |
| 15 | `initial public offering` | The fintech unicorn filed paperwork for its highly anticipated {{c1::initial public offering}} on the NYSE. | chào bán cổ phiếu lần đầu ra công chúng (IPO) | `Finance::Equities` |
| 16 | `balance sheet` | An examination of the firm's {{c1::balance sheet}} revealed substantial liquid assets and minimal short-term debt. | bảng cân đối kế toán | `Finance::Accounting` |
| 17 | `cash burn rate` | With a monthly {{c1::cash burn rate}} of $200,000, the company had eight months of runway left. | tốc độ tiêu hao ngân quỹ tiền mặt hàng tháng | `Finance::Startup` |
| 18 | `break-even point` | Based on current cost projections, the factory is expected to reach its {{c1::break-even point}} by Q3. | điểm hòa vốn | `Finance::Accounting` |
| 19 | `write off bad debts` | The commercial bank was forced to {{c1::write off bad debts}} amounting to fifty million dollars. | xóa sổ các khoản nợ xấu khó đòi | `Finance::Banking` |
| 20 | `default on a loan` | Skyrocketing interest rates caused several commercial property developers to {{c1::default on their loans}}. | vỡ nợ / không thể trả nợ vay | `Finance::Banking` |
| 21 | `hostile takeover` | The board adopted a poison-pill strategy to defend the company against a {{c1::hostile takeover}}. | thương vụ thâu tóm thù địch | `Business::Corporate` |
| 22 | `merger and acquisition` | Wall Street investment banks experienced a banner year in {{c1::mergers and acquisitions}} activity. | hoạt động sáp nhập và mua lại doanh nghiệp (M&A) | `Business::Corporate` |
| 23 | `core competency` | Outsourcing non-essential payroll tasks allows management to focus squarely on their {{c1::core competency}}. | năng lực cốt lõi của doanh nghiệp | `Business::Strategy` |
| 24 | `streamline operations` | The newly appointed CEO introduced automated workflows to {{c1::streamline operations}} across all divisions. | tinh giản hóa và tối ưu hóa vận hành | `Workplace::Operations` |
| 25 | `bottleneck in production` | A shortage of specialized microchips caused a severe {{c1::bottleneck in production}}. | nút thắt cổ chai trong quy trình sản xuất | `Workplace::Logistics` |
| 26 | `economies of scale` | Expanding the manufacturing plant enabled the company to achieve substantial {{c1::economies of scale}}. | tính kinh tế theo quy mô (sản lượng tăng chi phí giảm) | `Commerce::Economics` |
| 27 | `standard operating procedure` | Handling hazardous laboratory chemicals requires strict adherence to the documented {{c1::standard operating procedure}}. | quy trình thao tác chuẩn (SOP) | `Workplace::Compliance` |
| 28 | `meet a tight deadline` | The engineering team pulled consecutive late shifts to {{c1::meet a tight deadline}}. | hoàn thành xuất sắc nhiệm vụ kịp thời hạn gấp rút | `Workplace::Project` |
| 29 | `miss a deadline` | If we {{c1::miss the deadline}} for submitting the tender proposal, our bid will be disqualified immediately. | bị trễ / không hoàn thành kịp thời hạn chót | `Workplace::Project` |
| 30 | `key performance indicator` | Customer satisfaction score served as the primary {{c1::key performance indicator}} for the support department. | chỉ số đánh giá hiệu quả công việc then chốt (KPI) | `Workplace::HR` |
| 31 | `performance appraisal` | Annual bonuses are calculated directly based on the results of the employee's {{c1::performance appraisal}}. | đánh giá kết quả hiệu suất công tác định kỳ | `Workplace::HR` |
| 32 | `lay off workers` | Downturns in retail demand forced the regional distributor to {{c1::lay off workers}} across two factories. | cắt giảm / sa thải hàng loạt nhân viên do khó khăn | `Workplace::HR` |
| 33 | `workplace burnout` | Unchecked overtime and impossible targets are the leading causes of acute {{c1::workplace burnout}}. | hội chứng kiệt sức vì áp lực công việc kéo dài | `Workplace::Wellbeing` |
| 34 | `file a lawsuit` | The copyright holder retained a prestigious litigation firm to {{c1::file a lawsuit}} against the infringer. | chính thức nộp đơn khởi kiện ra tòa | `Law::Litigation` |
| 35 | `settle out of court` | To prevent a lengthy public trial and mounting legal fees, both parties agreed to {{c1::settle out of court}}. | hòa giải thỏa thuận ngoài tòa án | `Law::Litigation` |
| 36 | `burden of proof` | In common-law criminal jurisprudence, the {{c1::burden of proof}} rests entirely upon the prosecution. | nghĩa vụ đưa ra chứng cứ chứng minh | `Law::Jurisprudence` |
| 37 | `beyond a reasonable doubt` | The jury must be convinced of the defendant's guilt {{c1::beyond a reasonable doubt}} before convicting. | vượt qua mọi nghi ngờ hợp lý (tiêu chuẩn chứng minh) | `Law::Jurisprudence` |
| 38 | `patent infringement` | The smartphone manufacturer was accused of willful {{c1::patent infringement}} over wireless antenna designs. | hành vi xâm phạm bằng độc quyền sáng chế | `Law::IP` |
| 39 | `trade secret` | The formula for the iconic beverage remains one of the world's most closely guarded {{c1::trade secrets}}. | thông tin bí mật kinh doanh được bảo hộ | `Law::IP` |
| 40 | `cut through red tape` | A newly established fast-track investment portal helped entrepreneurs {{c1::cut through red tape}}. | loại bỏ rào cản thủ tục hành chính quan liêu | `Government::Regulatory` |
| 41 | `draw a conclusion` | It would be premature to {{c1::draw a conclusion}} before all randomized trial data has been compiled. | rút ra kết luận khoa học | `Academic::Research` |
| 42 | `corroborate findings` | Subsequent independent experiments conducted in Tokyo served to {{c1::corroborate the findings}}. | chứng thực / củng cố các kết quả nghiên cứu | `Academic::Research` |
| 43 | `formulate a hypothesis` | Scientists must observe empirical anomalies before they can {{c1::formulate a testable hypothesis}}. | đưa ra giả thuyết khoa học có thể kiểm chứng | `Academic::Research` |
| 44 | `stark contrast` | The opulent lifestyle of the tech executives stood in {{c1::stark contrast}} to the poverty of the neighborhood. | sự tương phản gay gắt / đối lập rõ rệt | `Writing::Stylistics` |
| 45 | `trenchant criticism` | The government's fiscal stimulus package drew {{c1::trenchant criticism}} from leading economists. | sự chỉ trích sắc bén / sâu cay | `Writing::Stylistics` |
| 46 | `unmitigated disaster` | Without proper risk containment protocols, the product launch turned into an {{c1::unmitigated disaster}}. | thảm họa hoàn toàn / thất bại ê chề | `Writing::Stylistics` |
| 47 | `shed light on` | Recent archaeological excavations have helped {{c1::shed light on}} ancient trading networks. | làm sáng tỏ / soi rọi vấn đề | `Academic::Communication` |
| 48 | `take for granted` | We often {{c1::take for granted}} clean tap water and stable electricity until an outage strikes. | coi điều gì là hiển nhiên mà quên trân trọng | `General::Idiom` |
| 49 | `pay dividends` | Consistent daily pronunciation shadowing will {{c1::pay dividends}} when you deliver formal presentations. | đem lại kết quả mỹ mãn / sinh lời về lâu dài | `General::Idiom` |
| 50 | `find common ground` | Despite polarized ideological positions, the negotiators managed to {{c1::find common ground}} on environmental safety. | tìm thấy tiếng nói chung / điểm tương đồng | `General::Communication` |

---

## 5. Dữ Liệu TSV Sẵn Sàng Nhập Vào Anki (Raw Copy-Paste TSV Block)

### Hướng Dẫn Nhập Dữ Liệu Vào Anki (Quick Import Guide):
1. Mở phần mềm **Anki** trên máy tính.
2. Chọn **File -> Import...** (hoặc phím tắt `Ctrl + I`).
3. Tạo một file văn bản mới tên `collocations_anki_50.txt`, sao chép toàn bộ khối dữ liệu bên dưới và lưu với mã hóa **UTF-8**.
4. Trong cửa sổ Import của Anki:
   * **Type**: Chọn kiểu thẻ `Cloze` (hoặc kiểu thẻ bạn đã tạo theo Template 1).
   * **Deck**: Chọn Deck bạn muốn nạp (ví dụ: `English::Mastery::Collocations`).
   * **Field separator**: Tab.
   * **Allow HTML in fields**: Đánh dấu tích chọn `True`.
   * Khớp nối: Cột 1 -> `Text` (chứa Cloze), Cột 2 -> `VietnameseMeaning`, Cột 3 -> `CollocationNotes`, Cột 4 -> `Tags`.
5. Bấm **Import**. 50 thẻ chất lượng cao sẽ ngay lập tức sẵn sàng để bạn ôn tập!

```tsv
#separator:tab
#html:true
#tags column:4
Neither party was willing to {{c1::make concessions}} during the contentious contract negotiations.	nhượng bộ trong đàm phán	<b>Collocation:</b> make concessions<br><b>Ý nghĩa:</b> nhượng bộ trong đàm phán	Business::Negotiation
After five hours of intense debate, the committee finally {{c1::reached a consensus}} on the new policy.	đạt được sự đồng thuận chung	<b>Collocation:</b> reach a consensus<br><b>Ý nghĩa:</b> đạt được sự đồng thuận chung	Workplace::Operations
A compromise proposal from the neutral mediator managed to {{c1::break the deadlock}}.	phá vỡ thế bế tắc đàm phán	<b>Collocation:</b> break the deadlock<br><b>Ý nghĩa:</b> phá vỡ thế bế tắc đàm phán	Business::Negotiation
Before acquiring the rival tech startup, the board decided to {{c1::conduct due diligence}} on their IP portfolio.	tiến hành thẩm định pháp lý và tài chính chuyên sâu	<b>Collocation:</b> conduct due diligence<br><b>Ý nghĩa:</b> tiến hành thẩm định pháp lý và tài chính chuyên sâu	Finance::Corporate
Investing heavily in proprietary artificial intelligence gave the firm a {{c1::competitive edge}} over rivals.	tạo lập lợi thế cạnh tranh vượt trội	<b>Collocation:</b> gain a competitive edge<br><b>Ý nghĩa:</b> tạo lập lợi thế cạnh tranh vượt trội	Business::Strategy
Aggressive pricing and superior product design allowed the brand to {{c1::gain market share}} rapidly.	gia tăng thị phần	<b>Collocation:</b> gain market share<br><b>Ý nghĩa:</b> gia tăng thị phần	Commerce::Marketing
By buying up all local distribution rights, the conglomerate attempted to {{c1::corner the market}}.	lũng đoạn / thống lĩnh toàn bộ thị trường	<b>Collocation:</b> corner the market<br><b>Ý nghĩa:</b> lũng đoạn / thống lĩnh toàn bộ thị trường	Commerce::Trade
Failing to deliver the machinery on the agreed date was deemed an explicit {{c1::breach of contract}}.	vi phạm các điều khoản hợp đồng	<b>Collocation:</b> breach a contract<br><b>Ý nghĩa:</b> vi phạm các điều khoản hợp đồng	Law::Contract
Once both executive signatures are affixed, the memorandum becomes {{c1::legally binding}}.	có tính ràng buộc về mặt pháp lý	<b>Collocation:</b> legally binding<br><b>Ý nghĩa:</b> có tính ràng buộc về mặt pháp lý	Law::Contract
Because the initial permit was forged, the operating license was declared {{c1::null and void}} by the court.	vô hiệu / không có giá trị pháp lý	<b>Collocation:</b> null and void<br><b>Ý nghĩa:</b> vô hiệu / không có giá trị pháp lý	Law::Regulatory
Users are strongly advised to read the {{c1::terms and conditions}} before installing the enterprise software.	các điều khoản và điều kiện	<b>Collocation:</b> terms and conditions<br><b>Ý nghĩa:</b> các điều khoản và điều kiện	Law::Compliance
Before discussing proprietary trade secrets, external consultants must sign a {{c1::non-disclosure agreement}}.	thỏa thuận bảo mật thông tin (NDA)	<b>Collocation:</b> non-disclosure agreement<br><b>Ý nghĩa:</b> thỏa thuận bảo mật thông tin (NDA)	Law::Corporate
The founders embarked on an international roadshow to {{c1::raise capital}} for expansion.	huy động vốn đầu tư kinh doanh	<b>Collocation:</b> raise capital<br><b>Ý nghĩa:</b> huy động vốn đầu tư kinh doanh	Finance::Investment
Securing backing from a tier-one {{c1::venture capital}} fund accelerated the startup's hiring plan.	nguồn vốn đầu tư mạo hiểm	<b>Collocation:</b> venture capital<br><b>Ý nghĩa:</b> nguồn vốn đầu tư mạo hiểm	Finance::Investment
The fintech unicorn filed paperwork for its highly anticipated {{c1::initial public offering}} on the NYSE.	chào bán cổ phiếu lần đầu ra công chúng (IPO)	<b>Collocation:</b> initial public offering<br><b>Ý nghĩa:</b> chào bán cổ phiếu lần đầu ra công chúng (IPO)	Finance::Equities
An examination of the firm's {{c1::balance sheet}} revealed substantial liquid assets and minimal short-term debt.	bảng cân đối kế toán	<b>Collocation:</b> balance sheet<br><b>Ý nghĩa:</b> bảng cân đối kế toán	Finance::Accounting
With a monthly {{c1::cash burn rate}} of $200,000, the company had eight months of runway left.	tốc độ tiêu hao ngân quỹ tiền mặt hàng tháng	<b>Collocation:</b> cash burn rate<br><b>Ý nghĩa:</b> tốc độ tiêu hao ngân quỹ tiền mặt hàng tháng	Finance::Startup
Based on current cost projections, the factory is expected to reach its {{c1::break-even point}} by Q3.	điểm hòa vốn	<b>Collocation:</b> break-even point<br><b>Ý nghĩa:</b> điểm hòa vốn	Finance::Accounting
The commercial bank was forced to {{c1::write off bad debts}} amounting to fifty million dollars.	xóa sổ các khoản nợ xấu khó đòi	<b>Collocation:</b> write off bad debts<br><b>Ý nghĩa:</b> xóa sổ các khoản nợ xấu khó đòi	Finance::Banking
Skyrocketing interest rates caused several commercial property developers to {{c1::default on their loans}}.	vỡ nợ / không thể trả nợ vay	<b>Collocation:</b> default on a loan<br><b>Ý nghĩa:</b> vỡ nợ / không thể trả nợ vay	Finance::Banking
The board adopted a poison-pill strategy to defend the company against a {{c1::hostile takeover}}.	thương vụ thâu tóm thù địch	<b>Collocation:</b> hostile takeover<br><b>Ý nghĩa:</b> thương vụ thâu tóm thù địch	Business::Corporate
Wall Street investment banks experienced a banner year in {{c1::mergers and acquisitions}} activity.	hoạt động sáp nhập và mua lại doanh nghiệp (M&A)	<b>Collocation:</b> merger and acquisition<br><b>Ý nghĩa:</b> hoạt động sáp nhập và mua lại doanh nghiệp (M&A)	Business::Corporate
Outsourcing non-essential payroll tasks allows management to focus squarely on their {{c1::core competency}}.	năng lực cốt lõi của doanh nghiệp	<b>Collocation:</b> core competency<br><b>Ý nghĩa:</b> năng lực cốt lõi của doanh nghiệp	Business::Strategy
The newly appointed CEO introduced automated workflows to {{c1::streamline operations}} across all divisions.	tinh giản hóa và tối ưu hóa vận hành	<b>Collocation:</b> streamline operations<br><b>Ý nghĩa:</b> tinh giản hóa và tối ưu hóa vận hành	Workplace::Operations
A shortage of specialized microchips caused a severe {{c1::bottleneck in production}}.	nút thắt cổ chai trong quy trình sản xuất	<b>Collocation:</b> bottleneck in production<br><b>Ý nghĩa:</b> nút thắt cổ chai trong quy trình sản xuất	Workplace::Logistics
Expanding the manufacturing plant enabled the company to achieve substantial {{c1::economies of scale}}.	tính kinh tế theo quy mô (sản lượng tăng chi phí giảm)	<b>Collocation:</b> economies of scale<br><b>Ý nghĩa:</b> tính kinh tế theo quy mô (sản lượng tăng chi phí giảm)	Commerce::Economics
Handling hazardous laboratory chemicals requires strict adherence to the documented {{c1::standard operating procedure}}.	quy trình thao tác chuẩn (SOP)	<b>Collocation:</b> standard operating procedure<br><b>Ý nghĩa:</b> quy trình thao tác chuẩn (SOP)	Workplace::Compliance
The engineering team pulled consecutive late shifts to {{c1::meet a tight deadline}}.	hoàn thành xuất sắc nhiệm vụ kịp thời hạn gấp rút	<b>Collocation:</b> meet a tight deadline<br><b>Ý nghĩa:</b> hoàn thành xuất sắc nhiệm vụ kịp thời hạn gấp rút	Workplace::Project
If we {{c1::miss the deadline}} for submitting the tender proposal, our bid will be disqualified immediately.	bị trễ / không hoàn thành kịp thời hạn chót	<b>Collocation:</b> miss a deadline<br><b>Ý nghĩa:</b> bị trễ / không hoàn thành kịp thời hạn chót	Workplace::Project
Customer satisfaction score served as the primary {{c1::key performance indicator}} for the support department.	chỉ số đánh giá hiệu quả công việc then chốt (KPI)	<b>Collocation:</b> key performance indicator<br><b>Ý nghĩa:</b> chỉ số đánh giá hiệu quả công việc then chốt (KPI)	Workplace::HR
Annual bonuses are calculated directly based on the results of the employee's {{c1::performance appraisal}}.	đánh giá kết quả hiệu suất công tác định kỳ	<b>Collocation:</b> performance appraisal<br><b>Ý nghĩa:</b> đánh giá kết quả hiệu suất công tác định kỳ	Workplace::HR
Downturns in retail demand forced the regional distributor to {{c1::lay off workers}} across two factories.	cắt giảm / sa thải hàng loạt nhân viên do khó khăn	<b>Collocation:</b> lay off workers<br><b>Ý nghĩa:</b> cắt giảm / sa thải hàng loạt nhân viên do khó khăn	Workplace::HR
Unchecked overtime and impossible targets are the leading causes of acute {{c1::workplace burnout}}.	hội chứng kiệt sức vì áp lực công việc kéo dài	<b>Collocation:</b> workplace burnout<br><b>Ý nghĩa:</b> hội chứng kiệt sức vì áp lực công việc kéo dài	Workplace::Wellbeing
The copyright holder retained a prestigious litigation firm to {{c1::file a lawsuit}} against the infringer.	chính thức nộp đơn khởi kiện ra tòa	<b>Collocation:</b> file a lawsuit<br><b>Ý nghĩa:</b> chính thức nộp đơn khởi kiện ra tòa	Law::Litigation
To prevent a lengthy public trial and mounting legal fees, both parties agreed to {{c1::settle out of court}}.	hòa giải thỏa thuận ngoài tòa án	<b>Collocation:</b> settle out of court<br><b>Ý nghĩa:</b> hòa giải thỏa thuận ngoài tòa án	Law::Litigation
In common-law criminal jurisprudence, the {{c1::burden of proof}} rests entirely upon the prosecution.	nghĩa vụ đưa ra chứng cứ chứng minh	<b>Collocation:</b> burden of proof<br><b>Ý nghĩa:</b> nghĩa vụ đưa ra chứng cứ chứng minh	Law::Jurisprudence
The jury must be convinced of the defendant's guilt {{c1::beyond a reasonable doubt}} before convicting.	vượt qua mọi nghi ngờ hợp lý (tiêu chuẩn chứng minh)	<b>Collocation:</b> beyond a reasonable doubt<br><b>Ý nghĩa:</b> vượt qua mọi nghi ngờ hợp lý (tiêu chuẩn chứng minh)	Law::Jurisprudence
The smartphone manufacturer was accused of willful {{c1::patent infringement}} over wireless antenna designs.	hành vi xâm phạm bằng độc quyền sáng chế	<b>Collocation:</b> patent infringement<br><b>Ý nghĩa:</b> hành vi xâm phạm bằng độc quyền sáng chế	Law::IP
The formula for the iconic beverage remains one of the world's most closely guarded {{c1::trade secrets}}.	thông tin bí mật kinh doanh được bảo hộ	<b>Collocation:</b> trade secret<br><b>Ý nghĩa:</b> thông tin bí mật kinh doanh được bảo hộ	Law::IP
A newly established fast-track investment portal helped entrepreneurs {{c1::cut through red tape}}.	loại bỏ rào cản thủ tục hành chính quan liêu	<b>Collocation:</b> cut through red tape<br><b>Ý nghĩa:</b> loại bỏ rào cản thủ tục hành chính quan liêu	Government::Regulatory
It would be premature to {{c1::draw a conclusion}} before all randomized trial data has been compiled.	rút ra kết luận khoa học	<b>Collocation:</b> draw a conclusion<br><b>Ý nghĩa:</b> rút ra kết luận khoa học	Academic::Research
Subsequent independent experiments conducted in Tokyo served to {{c1::corroborate the findings}}.	chứng thực / củng cố các kết quả nghiên cứu	<b>Collocation:</b> corroborate findings<br><b>Ý nghĩa:</b> chứng thực / củng cố các kết quả nghiên cứu	Academic::Research
Scientists must observe empirical anomalies before they can {{c1::formulate a testable hypothesis}}.	đưa ra giả thuyết khoa học có thể kiểm chứng	<b>Collocation:</b> formulate a hypothesis<br><b>Ý nghĩa:</b> đưa ra giả thuyết khoa học có thể kiểm chứng	Academic::Research
The opulent lifestyle of the tech executives stood in {{c1::stark contrast}} to the poverty of the neighborhood.	sự tương phản gay gắt / đối lập rõ rệt	<b>Collocation:</b> stark contrast<br><b>Ý nghĩa:</b> sự tương phản gay gắt / đối lập rõ rệt	Writing::Stylistics
The government's fiscal stimulus package drew {{c1::trenchant criticism}} from leading economists.	sự chỉ trích sắc bén / sâu cay	<b>Collocation:</b> trenchant criticism<br><b>Ý nghĩa:</b> sự chỉ trích sắc bén / sâu cay	Writing::Stylistics
Without proper risk containment protocols, the product launch turned into an {{c1::unmitigated disaster}}.	thảm họa hoàn toàn / thất bại ê chề	<b>Collocation:</b> unmitigated disaster<br><b>Ý nghĩa:</b> thảm họa hoàn toàn / thất bại ê chề	Writing::Stylistics
Recent archaeological excavations have helped {{c1::shed light on}} ancient trading networks.	làm sáng tỏ / soi rọi vấn đề	<b>Collocation:</b> shed light on<br><b>Ý nghĩa:</b> làm sáng tỏ / soi rọi vấn đề	Academic::Communication
We often {{c1::take for granted}} clean tap water and stable electricity until an outage strikes.	coi điều gì là hiển nhiên mà quên trân trọng	<b>Collocation:</b> take for granted<br><b>Ý nghĩa:</b> coi điều gì là hiển nhiên mà quên trân trọng	General::Idiom
Consistent daily pronunciation shadowing will {{c1::pay dividends}} when you deliver formal presentations.	đem lại kết quả mỹ mãn / sinh lời về lâu dài	<b>Collocation:</b> pay dividends<br><b>Ý nghĩa:</b> đem lại kết quả mỹ mãn / sinh lời về lâu dài	General::Idiom
Despite polarized ideological positions, the negotiators managed to {{c1::find common ground}} on environmental safety.	tìm thấy tiếng nói chung / điểm tương đồng	<b>Collocation:</b> find common ground<br><b>Ý nghĩa:</b> tìm thấy tiếng nói chung / điểm tương đồng	General::Communication
```

---
*Tài liệu thuộc hệ thống English Mastery Pillars Roadmap — Phối hợp thực hiện bởi Agent Dwight (`dwight-mul1u508`).*
