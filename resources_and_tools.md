# Curated Resource Index & Tools Configuration Guide
### Thiết Lập Công Cụ & Thang Đo Tài Liệu Bản Xứ Toàn Diện (Listening & Reading)

---

Tài liệu này đóng vai trò là **kim chỉ nam về công cụ kỹ thuật và hệ thống học liệu thực chứng** cho toàn bộ hệ thống phát triển năng lực tiếng Anh chuyên sâu tại `E:\Eng`. Để hiện thực hóa các phương pháp trong [listening.md](file:///E:/Eng/listening.md), [reading.md](file:///E:/Eng/reading.md), [speaking.md](file:///E:/Eng/speaking.md), [writing.md](file:///E:/Eng/writing.md) và [daily_practice_plan.md](file:///E:/Eng/daily_practice_plan.md), người học cần một môi trường kỹ thuật số chuẩn xác và một lộ trình tiếp cận tài liệu bản xứ được phân tầng khoa học.

```
                          HỆ THỐNG CÔNG CỤ & TÀI LIỆU TOÀN DIỆN
                          
   [Audio & Speech Tooling]         [Textual & Mining Tooling]       [Authentic Media Ladders]
   ├── Praat (Phonetic / Formant)   ├── Obsidian (SRS Vault)         ├── Audio Tier 1 -> Tier 5
   ├── Audacity (3-Pass Looping)    ├── Readwise (Highlight Sync)    │   (Pedagogical -> Chaos)
   └── Podcast Aggregators          ├── Calibre (EPUB / News Feeds)  └── Reading Stage 1 -> Stage 4
       (AntennaPod / Pocket Casts)  └── LanguageTool (Grammar/Style)     (Graded -> Classical C2)
```

---

## 1. Tooling Setup & Engineering Configurations

### 1.1. Praat: Phonetic Analysis & Spectrogram Auditing
[Praat](https://www.fon.hum.uva.nl/praat/) là phần mềm phân tích ngữ âm học chuẩn học thuật của Đại học Amsterdam, dùng để hiển thị trực quan dạng sóng âm (waveform), phổ âm thanh (spectrogram), đường bao cao độ (pitch contour - F0) và các dải cộng hưởng nguyên âm (formants - F1, F2).

#### Thiết Lập Cấu Hình Tối Ưu Cho Người Học Ngoại Ngữ
1. **Pitch Range (Dải tần số cơ bản F0):**
   - Vào menu `Pitch` $\to$ `Pitch settings...`.
   - **Giọng nam:** Đặt `Pitch range` từ `75 Hz` đến `300 Hz` (ngăn ngừa việc nhận diện nhầm âm bậc trên).
   - **Giọng nữ:** Đặt `Pitch range` từ `100 Hz` đến `500 Hz`.
   - Đơn vị đo cao độ: Chọn `semitones re 100 Hz` hoặc `Hertz` để thấy rõ biên độ dao động ngữ điệu (Pitch Glide).
2. **Formant Settings (Phân Tích Nguyên Âm):**
   - Vào menu `Formants` $\to$ `Formant settings...`.
   - `Maximum formant`: Đặt `5000 Hz` cho nam và `5500 Hz` cho nữ.
   - `Number of formants`: Mặc định `5.0`.
   - Kích hoạt hiển thị chấm đỏ Formant trên phổ âm để so sánh:
     - **F1 (Tần số Formant 1):** Tỷ lệ nghịch với độ cao của lưỡi (nguyên âm mở như /æ/ có F1 cao; nguyên âm đóng như /iː/ có F1 thấp).
     - **F2 (Tần số Formant 2):** Tỷ lệ thuận với vị trí lưỡi về phía trước (nguyên âm hàng trước như /iː/ có F2 rất cao ~2200Hz; nguyên âm hàng sau như /uː/ có F2 thấp ~800Hz).
3. **Workflow So Sánh Đối Chiếu Shadowing (Visual Auditing):**
   - Ghi âm câu mẫu của người bản xứ (kênh trên) và câu bạn tự đọc (kênh dưới) vào một tệp âm thanh stereo hoặc mở 2 cửa sổ Sound cạnh nhau.
   - Bấm `View & Edit`.
   - Quan sát đường biểu diễn cao độ màu xanh lam (Pitch Contour): Người học thường có đường Pitch bằng phẳng, đơn điệu, trong khi người bản xứ có độ dốc gãy rõ nét tại vị trí trọng âm câu (Nuclear Stress). Điều chỉnh ngữ điệu cho đến khi đồ thị sóng của bạn có dạng tương đồng.

---

### 1.2. Audacity: Precision Audio Manipulation & Transcription
[Audacity](https://www.audacityteam.org/) là công cụ xử lý âm thanh mã nguồn mở hoàn toàn miễn phí, lý tưởng để thực hiện **The 3-Pass Transcription Protocol** và **Alexander Arguelles Shadowing**.

#### Cấu Hình Phím Tắt & Thiết Lập Tối Ưu
* **Chơi lặp đoạn âm thanh (Loop Playback):** Phím tắt `Shift + Space` (hoặc chọn vùng rồi bấm `L`). Cho phép lặp liên tục phân đoạn 3–5 giây trong Pass 2 Micro Dictation.
* **Thay đổi tốc độ không làm méo cao độ (Change Tempo):**
  - Vào `Effect` $\to$ `Pitch and Tempo` $\to$ `Change Tempo...`.
  - Giảm tốc độ xuống `-15%` đến `-25%` đối với các đoạn nói nhanh ở Tier 4 và Tier 5. Khác với phím đổi tốc độ thông thường, tính năng này giữ nguyên âm sắc giọng nói (Pitch), không tạo ra tiếng trầm bè dạng robot.
* **Cắt khoảng lặng tự động (Truncate Silence):**
  - Chọn toàn bộ track $\to$ `Effect` $\to$ `Special` $\to$ `Truncate Silence...`.
  - Đặt ngưỡng `-40 dB`, thời lượng tối thiểu `0.5 giây`, nén về `0.2 giây`. Giúp tiết kiệm thời gian nghe khi luyện nghe bài giảng hoặc podcast dài.
* **Tạo nhãn phụ đề (Label Track):**
  - Phím `Ctrl + B` để gắn nhãn thời gian ngay tại vị trí trỏ chuột. Dùng để ghi chú phiên âm IPA hoặc từ nối (connected speech) trực tiếp dưới dạng sóng.

---

### 1.3. LanguageTool: Self-Hosted & Local Grammar Engineering
[LanguageTool](https://languagetool.org/) là công cụ kiểm tra ngữ pháp, dấu câu và văn phong mã nguồn mở cao cấp. Khác với Grammarly vốn gửi toàn bộ văn bản lên máy chủ đám mây thương mại, LanguageTool có thể chạy hoàn toàn cục bộ (offline) qua Docker hoặc Java server.

#### Triển Khai Máy Chủ Cục Bộ (Local HTTP Server)
Chạy LanguageTool Server qua Docker để tích hợp trực tiếp vào Obsidian, LibreOffice, hoặc trình duyệt mà không lộ dữ liệu riêng tư:
```bash
# Kéo và chạy container LanguageTool cục bộ trên cổng 8081
docker run -d --name languagetool -p 8081:8081 erikvl87/languagetool
```

#### Thiết Lập Quy Tắc Kiểm Soát Văn Phong Nâng Cao
Trong tệp cấu hình quy tắc bổ sung (`rules/grammar.xml` hoặc phần cài đặt extension):
1. **Kích hoạt phát hiện Thể bị động quá mức (Excessive Passive Voice):** Nhắc nhở người viết chuyển đổi sang thể chủ động để tăng cường năng lượng động từ (Verbal Energy).
2. **Cảnh báo Danh từ hóa rườm rà (Nominalization Alert):** Đánh dấu các cấu trúc như `make an examination of` $\to$ gợi ý `examine`; `bring about a reduction in` $\to$ gợi ý `reduce`.
3. **Quy chuẩn Dấu câu Ox-ford (Oxford Comma):** Bắt buộc sử dụng dấu phẩy nối tiếp trước liên từ `and` trong chuỗi danh sách để loại bỏ nhập nhằng ngữ nghĩa.
4. **Kiểm tra Cụm từ thừa thãi (Clichés & Wordiness):** Đánh dấu các cụm như `due to the fact that` $\to$ `because`; `in order to` $\to$ `to`; `at this point in time` $\to$ `now`.

---

### 1.4. Obsidian: Spaced Repetition & Syntactic Vault Architecture
[Obsidian](https://obsidian.md/) là cơ sở dữ liệu tri thức dạng đồ thị liên kết cục bộ (Markdown). Đây là trung tâm quản lý các ghi chú **Sentence Mining**, **Collocation Banks** và nhật ký đọc chuyên sâu.

#### Cấu Trúc Thư Mục Vault Chuẩn Hóa
```
English_Mastery_Vault/
├── 00_Inbox/                 <-- Nơi chứa ghi chú thô, bài đọc cào từ web
├── 01_Daily_Notes/           <-- Nhật ký luyện tập hàng ngày (45m Read / 30m Listen)
├── 02_Collocation_Banks/     <-- Danh mục cụm từ cố định theo chủ đề (Parts 1–4)
├── 03_Sentence_Mining/       <-- Các câu mẫu khai thác theo nguyên lý i+1
├── 04_Syntax_Templates/      <-- Các cấu trúc câu định kỳ, song hành, đảo ngữ
├── 05_Précis_Summaries/      <-- Bản tóm lược 3 gạch đầu dòng sau khi đọc
└── 99_Attachments/           <-- Ảnh chụp phổ âm Praat, đoạn ghi âm mp3
```

#### Các Plugin Bắt Buộc Cài Đặt (Community Plugins)
1. **Obsidian Spaced Repetition (by Stephen Mwangi):**
   - Biến trực tiếp các dòng Markdown thành thẻ Flashcard ngay trong ghi chú:
     ```markdown
     The venture failed due to poor metrics. (Periodic rewrite)
     ?
     Having ignored critical user metrics, the founders presided over inevitable failure.
     ```
2. **AnkiConnect / Flashcards Integration:**
   - Đồng bộ tự động các ghi chú mang tag `#anki` vào bộ thẻ Anki cá nhân.
3. **Omnisearch:**
   - Tìm kiếm toàn văn văn bản có hỗ trợ nhận diện mờ (fuzzy search), giúp tra cứu nhanh các ngữ cảnh từng gặp của một Collocation cụ thể.
4. **Tagging Hierarchy Chuẩn Hóa:**
   - `#lexicon/collocation/verb-noun`
   - `#syntax/periodic`
   - `#prosody/nuclear-stress`
   - `#tier/tier-4`

---

### 1.5. Readwise & Reader: Highlight Syncing & Retention
[Readwise](https://readwise.io/) và ứng dụng đọc [Reader](https://readwise.io/read) là cầu nối giữa việc đọc thụ động và hệ thống ghi nhớ chủ động.

* **Đồng bộ tự động (Automated Sync):** Tự động trích xuất toàn bộ câu tô đậm (highlights) từ Kindle Paperwhite, Apple Books, Google Play Books, Twitter, và các bài báo trên web.
* **Tích hợp Obsidian:** Cài đặt plugin Readwise Official trong Obsidian. Mỗi cuốn sách hoặc bài viết được tự động tạo một trang Markdown chứa toàn bộ ghi chú và trích dẫn, kèm metadata (Tác giả, Ngày đọc, Đường dẫn gốc).
* **The Daily Review (Thuật toán SRS):** Mỗi sáng hiển thị ngẫu nhiên 5 câu trích dẫn đắt giá từ các tác phẩm kinh điển đã đọc, ngăn ngừa triệt để hiện tượng quên lãng tự nhiên (Ebbinghaus Forgetting Curve).
* **Ghostreader (Tích hợp AI):** Thiết lập prompt yêu cầu hiển thị cấu trúc ngữ pháp: *"Break down the syntactic structure and identify the dependent clauses of this highlighted sentence."*

---

### 1.6. Calibre: Digital Library & Automated Periodical Scraping
[Calibre](https://calibre-ebook.com/) là phần mềm quản lý thư viện số cá nhân mạnh mẽ nhất thế giới.

#### Thiết Lập Thu Thập Báo Chí Tự Động (Fetch News Recipes)
Calibre tích hợp sẵn hàng trăm "Recipes" bằng Python để cào bài báo mới nhất mỗi sáng từ các nguồn học thuật và đóng gói thành file EPUB/MOBI gửi thẳng vào máy Kindle qua email:
1. Vào `Fetch news` $\to$ Lên lịch tải tự động:
   - **The Economist** (Yêu cầu đăng nhập tài khoản hoặc dùng bản tổng hợp công khai).
   - **The Atlantic / The New Yorker**.
   - **Aeon Magazine** (Các bài tiểu luận triết học dài, miễn phí và chất lượng xuất sắc).
   - **Project Syndicate** (Bình luận kinh tế, chính sách toàn cầu).
2. **Tùy Chỉnh Typography Cho Trải Nghiệm Đọc Chuyên Nghiệp:**
   - Trong Calibre E-book Viewer $\to$ `Preferences` $\to$ `Styles`:
     ```css
     body {
         font-family: "Charter", "Georgia", "Baskerville", serif;
         line-height: 1.6;
         text-align: justify;
         hyphens: auto;
     }
     ```

---

### 1.7. Podcast Aggregators: AntennaPod & Pocket Casts
Trình phát podcast thông thường (như Spotify mặc định) thiếu các tính năng xử lý tín hiệu quan trọng cho việc học ngôn ngữ. Khuyên dùng **AntennaPod** (Mã nguồn mở, Android) hoặc **Pocket Casts** (iOS/Android/Web).

* **Variable Speed Playback with Pitch Correction:** Cho phép tăng/giảm tốc độ từ `0.8x` đến `1.4x` với bước nhảy `0.05x` mà không biến dạng tần số giọng nói.
* **Trim Silence (Cắt Khoảng Lặng Thông Minh):** Tự động bỏ qua các đoạn ngập ngừng quá dài của người nói.
* **Volume Boost (Tăng Cường Âm Thoại):** Nâng cao dải trung âm (voice frequencies) và nén bớt dải bass ầm ào khi nghe ngoài đường phố.
* **In-App Transcript Support:** Hỗ trợ đọc tệp phụ đề định dạng `.vtt` hoặc đồng bộ văn bản trực tiếp trong lúc nghe để thực hiện Pass 3 Discrepancy Auditing.

---

## 2. The Authentic Spoken Media Ladder (Listening Tiers 1–5)

Dưới đây là danh mục phương tiện truyền thông âm thanh thực tế được phân cấp theo **5 Tầng Độ Khó Âm Học** quy định tại [listening.md](file:///E:/Eng/listening.md).

```
   [Tier 5] Multi-Speaker Chaos & Vernacular (Succession, British Panel Shows, Stand-up)
      ▲
   [Tier 4] Unscripted Intellectual Discourse (Huberman Lab, EconTalk, The Daily)
      ▲
   [Tier 3] Narrative Non-Fiction & Audiobooks (Radiolab, Hardcore History, In Our Time)
      ▲
   [Tier 2] Scripted Educational Media (Planet Money, Freakonomics, Kurzgesagt)
      ▲
   [Tier 1] High-Clarity Pedagogical Audio (Spotlight English, VOA, 6 Minute English)
```

---

### 2.1. Tier 1: High-Clarity Pedagogical & Graded Audio
*Đặc trưng âm học:* Tốc độ chậm rãi (100–120 từ/phút), phát âm tròn vành rõ chữ, không có tạp âm môi trường, không có hiện tượng nói chồng chéo. Phù hợp cho việc củng cố nhận diện âm vị ban đầu và xây dựng sự tự tin.

| Nguồn / Kênh | Định Dạng / Nền Tảng | Giọng (Accent) | Điểm Nhấn Ngữ Âm & Giá Trị Tiếp Nhận |
| :--- | :--- | :--- | :--- |
| **Spotlight English** | Podcast / Web / YouTube | Neutral American / British | Sử dụng từ vựng giới hạn (~1500 từ), phát âm với tốc độ chậm, nguyên âm kéo dài tối đa giúp nhận biết rõ đường ranh giới giữa các từ. |
| **VOA Learning English** | Podcast / Broadcast | General American | Cung cấp các bản tin quốc tế được biên tập chuyên biệt. Cấu trúc câu chuẩn mực, nguyên âm rõ ràng, hỗ trợ transcript song song chuẩn xác. |
| **BBC 6 Minute English** | Podcast / App | Standard Southern British (RP) | Hội thoại 2 người dẫn chuyện có kịch bản. Điểm nhấn là sự xuất hiện tự nhiên của các liên từ Anh-Anh và giải thích từ vựng định kỳ. |
| **Espresso English Podcast** | Podcast / Audio ngắn | General American | Các tập ngắn 5-10 phút đi sâu vào sửa lỗi phát âm, phân biệt các cặp từ dễ nhầm lẫn. |
| **LibriVox Graded Audiobooks** | Miễn phí (Public Domain) | Đa dạng (Anh/Mỹ) | Bản ghi âm các tác phẩm kinh điển thiếu nhi (*The Secret Garden*, *The Wind in the Willows*) đọc bởi các tình nguyện viên phát âm chuẩn. |

---

### 2.2. Tier 2: Scripted Educational Media & Intermediate Narratives
*Đặc trưng âm học:* Tốc độ tự nhiên của đài truyền hình chuẩn (130–160 từ/phút), chất lượng phòng thu cao, bắt đầu xuất hiện các hiện tượng nối âm (catenation) và nhược hóa âm (weak forms) mức độ vừa phải.

| Nguồn / Kênh | Định Dạng / Nền Tảng | Giọng (Accent) | Điểm Nhấn Ngữ Âm & Giá Trị Tiếp Nhận |
| :--- | :--- | :--- | :--- |
| **NPR Planet Money & The Indicator** | Podcast (10–25 phút) | General American | Lối dẫn chuyện linh hoạt, dí dỏm về các hiện tượng kinh tế. Tốc độ nói chuẩn mực, giàu ngữ điệu biểu cảm và nhịp điệu báo chí hiện đại. |
| **Freakonomics Radio** | Podcast (45–60 phút) | General American | Stephen Dubner phỏng vấn các nhà khoa học hành vi. Lời dẫn chuyển mạch mượt mà, từ vựng học thuật ứng dụng phong phú. |
| **Kurzgesagt – In a Nutshell** | YouTube / Kèm Subtitles | Steve Taylor (RP British) | Lời tường thuật khoa học thiên văn - sinh học đỉnh cao. Giọng đọc người Anh cực kỳ cuốn hút, cách nhấn trọng âm câu (Sentence Stress) mẫu mực. |
| **CrashCourse** | YouTube | Hank Green & Khách mời (US) | Tốc độ nói tương đối nhanh nhưng cấu trúc kịch bản mạch lạc. Rất tốt để rèn luyện khả năng bắt từ khóa khoa học lịch sử và triết học. |
| **TED Talks Daily & TED Radio Hour** | Podcast / Video | Toàn cầu (Global Englishes) | Tập hợp các bài diễn thuyết truyền cảm hứng. Người nói được huấn luyện phát âm và sử dụng khoảng dừng (strategic pauses) bậc thầy. |
| **Stuff You Should Know (SYSK)** | Podcast | Southern & Midwest American | Hội thoại giữa hai người bạn thân (Josh & Chuck). Bắt đầu làm quen với nhịp điệu trò chuyện tự nhiên, sự ngập ngừng và tiếng cười đùa. |

---

### 2.3. Tier 3: Scripted Formal Broadcasts, Narrative Non-Fiction & Audiobooks
*Đặc trưng âm học:* Kể chuyện dài tập liên tục (150–180 từ/phút), mật độ từ vựng dày đặc, thiết kế âm thanh đa tầng (sound design), biến đổi ngữ điệu theo nhân vật và cảm xúc.

| Nguồn / Kênh | Định Dạng / Nền Tảng | Giọng (Accent) | Điểm Nhấn Ngữ Âm & Giá Trị Tiếp Nhận |
| :--- | :--- | :--- | :--- |
| **Radiolab (WNYC Studios)** | Podcast tài liệu âm thanh | Diverse American | Thiết kế âm thanh phức tạp, lồng ghép nhiều giọng nói cắt nhỏ đan xen. Đòi hỏi não bộ phải phân tách giọng nói khỏi nhạc nền và hiệu ứng âm thanh. |
| **This American Life** | Podcast dài kỳ | Ira Glass & Phóng viên | Chuẩn mực của thể loại phóng sự phát thanh Mỹ. Chứa đựng nhiều khoảng dừng suy ngẫm, tiếng thở dài, biến điệu cảm xúc chân thực. |
| **Dan Carlin's Hardcore History** | Podcast dài tập (3–5 tiếng) | Deep American Monologue | Độc thoại lịch sử hùng tráng. Rèn luyện sức bền tiếp nhận âm học (acoustic stamina) và khả năng xử lý các cấu trúc câu phức cổ kính. |
| **BBC In Our Time** | Radio 4 / Podcast | Melvyn Bragg (UK) & Giáo sư | Thảo luận học thuật đỉnh cao về lịch sử, triết học, khoa học. Mật độ từ vựng cực cao, người nói là các học giả hàng đầu nước Anh. |
| **The Rest is History** | Podcast | Tom Holland & Dominic Sandbrook | Lối trò chuyện lịch sử hóm hỉnh đặc trưng của tầng lớp trí thức Anh. Tốc độ nói nhanh, sử dụng nhiều thành ngữ và lối chơi chữ tinh tế. |
| **Sách Nói Cao Cấp (Stephen Fry)** | Audiobook (Audible) | Received Pronunciation (RP) | Stephen Fry đọc *Mythos*, *Heroes*, hoặc *Harry Potter*. Đỉnh cao về nghệ thuật điều biến cao độ (pitch modulation) và ngữ điệu kể chuyện. |

---

### 2.4. Tier 4: Natural Unscripted Conversations, Debates & Deep Dives
*Đặc trưng âm học:* Hội thoại tự phát hoàn toàn, không có kịch bản. Tồn tại nhiều câu nói bỏ dở (false starts), từ đệm (*you know*, *like*, *I mean*), nuốt âm tốc độ cao, cười đùa và ngắt lời tự nhiên.

| Nguồn / Kênh | Định Dạng / Nền Tảng | Giọng (Accent) | Điểm Nhấn Ngữ Âm & Giá Trị Tiếp Nhận |
| :--- | :--- | :--- | :--- |
| **Huberman Lab Podcast** | Podcast dài tập (2–3 tiếng) | West Coast American | Giáo sư Andrew Huberman thảo luận cơ chế thần kinh học. Ngôn ngữ hội thoại chuyên sâu, nhiều thuật ngữ sinh học xen kẽ lời giải thích đời thường. |
| **EconTalk (Russ Roberts)** | Podcast phỏng vấn chuyên sâu | General American | Phỏng vấn một đối một về kinh tế và triết lý sống. Người phỏng vấn và khách mời trao đổi phản biện tự nhiên, có đào sâu lập luận. |
| **Sam Harris: Making Sense** | Podcast độc thoại & đối thoại | General American | Giọng nói cực kỳ điềm tĩnh nhưng cấu trúc câu phức tạp và tính chính xác về mặt logic rất cao. Thử thách về khả năng theo dõi mạch tư duy trừu tượng. |
| **The Daily (The New York Times)** | Bản tin phân tích 20 phút | Michael Barbaro & Nhà báo | Phỏng vấn hiện trường kết hợp bình luận chính trị. Gồm nhiều âm thanh thực tế từ hiện trường và các nhân vật đa dạng ngữ điệu. |
| **Lex Fridman Podcast** | Podcast dài tập (2–4 tiếng) | Russian-American Cadence | Đối thoại công nghệ và triết học trí tuệ nhân tạo. Tốc độ nói chậm rãi nhưng các khách mời nói rất nhanh với đủ loại chất giọng quốc tế. |
| **Conversations with Tyler** | Podcast | Tyler Cowen (US) | Phong cách hỏi dồn dập, tốc độ cao, không có phần dạo đầu. Đòi hỏi người nghe phải có khả năng xử lý thông tin tức thì. |

---

### 2.5. Tier 5: Multi-Speaker Chaos, Regional Vernacular & Fast-Paced Cinema
*Đặc trưng âm học:* Bùng nổ âm thanh với tốc độ 200+ từ/phút, nhiều người nói tranh cãi cùng lúc, tiếng ồn ngoại cảnh lớn, tiếng lóng địa phương, phương ngữ nặng (Scottish, Irish, Cockney, Deep South, African American Vernacular English).

| Nguồn / Tác Phẩm | Thể Loại / Phim Ảnh | Chất Giọng & Phương Ngữ | Thách Thức Âm Học Tột Cùng |
| :--- | :--- | :--- | :--- |
| **Succession (HBO Series)** | Phim truyền hình chính kịch | American Corporate / British | Lời thoại sắc bén, châm chọc, dồn dập với vô số câu chửi thề, tiếng lóng tài chính và các đoạn nói đè lên nhau (overlapping dialogue). |
| **The Social Network (Movie)** | Phim điện ảnh (Aaron Sorkin) | Rapid East Coast American | Kịch bản đặc trưng của Aaron Sorkin với tốc độ nhả chữ cực đại, các câu đốp chát liên tục đòi hỏi phản xạ âm thanh tức thì. |
| **British Panel Shows (QI, WILTY)** | Gameshow truyền hình BBC | Đa dạng phương ngữ Vương quốc Anh | Người chơi là các diễn viên hài đối đáp ứng biến tự do. Chứa đựng các yếu tố văn hóa bản địa ngầm định và tốc độ cười nói hỗn loạn. |
| **Stand-Up Comedy Specials** | Hài độc thoại (Netflix/YT) | Dave Chappelle, James Acaster, Bill Burr | Biến thiên âm lượng đột ngột (từ thì thầm sang gào thét), sử dụng tiếng lóng đường phố, nhại giọng và thay đổi nhịp độ liên tục. |
| **Peaky Blinders (BBC Series)** | Phim truyền hình lịch sử | Birmingham (Brummie), Gypsy, Cockney | Thử thách lớn nhất đối với người học khi tiếp xúc với thổ âm công nhân Anh thế kỷ 20, nhiều âm cổ và nuốt phụ âm cuối nặng nề. |
| **The Munk Debates / Intelligence Squared** | Tranh biện trực tiếp trên sân khấu | Tranh biện viên quốc tế thượng tầng | Các cuộc tranh luận gay gắt với tiếng vỗ tay, la ó của khán giả, người tranh biện giành mic và nói lấn át đối phương. |

---

## 3. The Literature & Periodical Ladder (Reading Stages 1–4)

Dưới đây là thang bậc tài liệu đọc được thiết kế song hành với lộ trình phát triển năng lực đọc hiểu tại [reading.md](file:///E:/Eng/reading.md).

```
   [Stage 4] Classical Literature, Stylistic Mastery & Academic Rigor (C2)
      ▲
   [Stage 3] High-Order Non-Fiction, Elite Periodicals & Modern Literature (C1)
      ▲
   [Stage 2] Intermediate General Interest & Accessible Non-Fiction (B1-B2)
      ▲
   [Stage 1] Graded Readers & Foundational Literacy (A1-B1)
```

---

### 3.1. Stage 1: Graded & Foundational Literacy (A1–B1)
*Mục tiêu:* Xây dựng khả năng đọc trôi chảy mà không phải dừng lại dịch thầm từng từ trong đầu. Luyện phản xạ mắt nhận diện các khối từ cơ bản và nắm chắc trật tự từ (S-V-O).

* **Graded Readers (Sách phân cấp từ vựng):**
  - *Oxford Bookworms Library* (Stages 1, 2, 3 - từ 400 đến 1000 từ vựng cốt lõi).
  - *Penguin Active Reading* (Levels 1–3).
  - *Cambridge English Readers* (Level 1–2).
* **Nguồn Báo Chí Đơn Giản Hóa:**
  - *Simple English Wikipedia* (Bách khoa toàn thư viết bằng ngữ pháp đơn giản).
  - *News in Levels* (Tin tức chia thành 3 cấp độ từ vựng).
* **Văn Học & Tiểu Thuyết Tiếp Cận Đầu Tiên:**
  - *The Old Man and the Sea* (Ernest Hemingway) — Văn phong của Hemingway dựa trên các câu đơn ngắn gọn, cấu trúc ngữ pháp song hành trực diện (paratactic style), rất ít từ vựng hoa mỹ nhưng sức nặng biểu đạt sâu sắc.
  - *The Little Prince* (Antoine de Saint-Exupéry, bản dịch tiếng Anh).
  - *Charlotte's Web* (E.B. White) — Ngôn ngữ tiếng Anh thiếu nhi kinh điển, mẫu mực về sự trong sáng của câu từ.

---

### 3.2. Stage 2: Intermediate General Interest & Accessible Non-Fiction (B1–B2)
*Mục tiêu:* Vượt qua vùng an toàn của sách đọc phân cấp. Bắt đầu đọc các tác phẩm phi hư cấu (non-fiction) bán chạy và báo chí đại chúng với sự hỗ trợ tối thiểu của từ điển (áp dụng quy tắc 98% từ vựng quen thuộc).

* **Tác Phẩm Phi Hư Cấu Phổ Biến (Popular Non-Fiction):**
  - *Atomic Habits* (James Clear) — Cấu trúc câu rõ ràng, tư duy logic, giàu các mẫu câu hành động và thành ngữ đời sống hiện đại.
  - *Sapiens: A Brief History of Humankind* (Yuval Noah Harari) — Cách diễn giải các khái niệm lịch sử và nhân chủng học bằng ngôn từ giản dị, hấp dẫn.
  - *A Short History of Nearly Everything* (Bill Bryson) — Bậc thầy về lối viết dí dỏm, phong phú về tính từ mô tả thế giới tự nhiên.
  - *Outliers* hoặc *The Tipping Point* (Malcolm Gladwell) — Mẫu mực về nghệ thuật dẫn dắt câu chuyện (storytelling) kết hợp phân tích số liệu xã hội học.
* **Báo Chí & Tin Tức Dòng Chính:**
  - *BBC News* & *Reuters* — Báo chí đưa tin khách quan, sử dụng cấu trúc kim tự tháp ngược (Inverted Pyramid) chuẩn mực.
  - *The Christian Science Monitor* — Phóng sự quốc tế có chiều sâu, văn phong thanh nhã.
  - *National Geographic* — Bài viết giàu hình ảnh, từ vựng sinh thái và địa lý phong phú.
* **Tiểu Thuyết Văn Học Dễ Tiếp Cận:**
  - *Animal Farm* (George Orwell) — Cốt truyện ngụ ngôn chính trị kinh điển, cấu trúc câu rõ ràng, từ vựng vừa tầm.
  - *Fahrenheit 451* (Ray Bradbury) — Văn phong giàu hình ảnh ẩn dụ nhưng nhịp độ nhanh.
  - *The Giver* (Lois Lowry) — Tiểu thuyết phản địa đàng với ngôn từ được gọt giũa trong sáng.

---

### 3.3. Stage 3: High-Order Non-Fiction, Elite Periodicals & Modern Literature (C1)
*Mục tiêu:* Tiếp cận văn phong học thuật, báo chí phân tích chuyên sâu và tiểu thuyết văn học hiện đại. Rèn luyện khả năng hiểu ý tại ngôn ngoại (reading between the lines), nhận diện sự mỉa mai (irony) và cấu trúc câu định kỳ (periodic sentences).

* **Tạp Chí & Tuần Báo Trí Tuệ Tinh Hoa:**
  - *The Economist* — Ngôn ngữ báo chí Anh chuẩn mực tối cao. Lối hành văn súc tích, chơi chữ tinh tế, sử dụng danh từ hóa chọn lọc và các phân tích kinh tế vĩ mô sắc sảo.
  - *The Atlantic* — Các bài tiểu luận văn hóa chính trị dài (long-form journalism) với cấu trúc lập luận nhiều tầng lớp.
  - *The New Yorker* — Đỉnh cao của thể loại văn xuôi tự sự và phê bình nghệ thuật. Chứa đựng nhiều cấu trúc câu lồng ghép phức hợp và dấu câu tinh tế.
  - *Foreign Affairs* — Tiêu chuẩn vàng của văn phong học thuật quan hệ quốc tế và địa chính trị.
  - *Aeon Essays* (aeon.co) — Các bài luận triết học, khoa học xã hội đương đại dài 3000–5000 từ, hoàn toàn miễn phí.
* **Bậc Thầy Tiểu Luận Đương Đại:**
  - Joan Didion (*Slouching Towards Bethlehem*, *The Year of Magical Thinking*) — Bậc thầy về nhịp điệu câu văn (cadence) và sự quan sát sắc lạnh.
  - Christopher Hitchens (*Arguably*, *Letters to a Young Contrarian*) — Văn phong bút chiến rực lửa, từ vựng vô cùng phong phú và khả năng vận dụng điển tích điển cố điêu luyện.
  - James Baldwin (*Notes of a Native Son*) — Lối hành văn giàu cảm xúc, sử dụng phép đối ngẫu và nhịp điệu kinh thánh đầy sức mạnh.
* **Tiểu Thuyết Văn Học Hiện Đại:**
  - *The Remains of the Day* (Kazuo Ishiguro) — Mẫu mực về sự kiềm chế cảm xúc trong ngôn từ của một quản gia người Anh; văn phong trang trọng, chuẩn mực thời hậu chiến.
  - *Atonement* (Ian McEwan) — Cấu trúc câu uốn lượn tinh xảo, phân tích tâm lý nội tâm nhân vật sâu sắc.
  - *The Road* (Cormac McCarthy) — Văn phong tối giản khắc nghiệt, giàu tính biểu tượng và chất thơ trần trụi.

---

### 3.4. Stage 4: Classical Literature, Stylistic Mastery & Academic Rigor (C2)
*Mục tiêu:* Đạt đến độ nhạy cảm ngôn ngữ tuyệt đối của một học giả bản xứ. Nắm vững sự phát triển lịch sử của văn phong tiếng Anh, giải mã các cấu trúc ngữ pháp đảo ngữ cổ điển, cấu trúc câu bậc thang và các luận văn triết học đỉnh cao.

* **Các Nhà Văn Phong Kinh Điển:**
  - George Orwell (*Collected Essays*, đặc biệt là bài luận bất hủ *"Politics and the English Language"* — cuốn cẩm nang gối đầu giường về sự trong sáng của văn phong).
  - Bertrand Russell (*A History of Western Philosophy*, *In Praise of Idleness*) — Được trao giải Nobel Văn học vì tư duy triết học sáng rõ và văn phong tiếng Anh mẫu mực, trong sáng như pha lê.
  - Ralph Waldo Emerson (*Self-Reliance and Other Essays*) — Văn phong hùng hồn của chủ nghĩa siêu nghiệm Mỹ, giàu tính triết lý cách ngôn.
  - Jane Austen (*Pride and Prejudice*, *Emma*) — Đỉnh cao của sự châm biếm lịch thiệp (irony) và cấu trúc câu phức tầng thời kỳ Regency.
* **Tác Phẩm Văn Học & Đỉnh Cao Nghệ Thuật Ngôn Từ:**
  - Vladimir Nabokov (*Lolita*, *Speak, Memory*) — Dù tiếng Anh là ngôn ngữ thứ hai, Nabokov được coi là một trong những nhà tạo mẫu ngôn từ tiếng Anh vĩ đại nhất thế kỷ 20. Độ chính xác từ vựng và tính gợi cảm thị giác đạt mức thiên tài.
  - Herman Melville (*Moby-Dick*) — Hùng ca ngôn ngữ kết hợp giữa phong cách Shakespeare và Kinh thánh King James.
  - Virginia Woolf (*To the Lighthouse*, *Mrs. Dalloway*) — Dòng ý thức (stream of consciousness), câu văn chảy tràn với nhịp điệu tâm lý phức tạp.
* **Tạp Chí Khoa Học & Văn Bản Pháp Lý Học Thuật:**
  - *Nature Commentary* & *Science Perspective* — Phân tích học thuật ở tuyến đầu của tri thức nhân loại.
  - *Harvard Law Review* / *Yale Law Journal* — Độ chặt chẽ tuyệt đối về mặt logic và ngữ pháp pháp lý.
  - Các tiểu luận triết học phân tích hiện đại (Thomas Nagel: *"What Is It Like to Be a Bat?"*; J.L. Austin: *"How to Do Things with Words"*).

---

## 4. Integrated Daily Tool-to-Media Execution Matrix

Bảng dưới đây tích hợp quy trình phối hợp công cụ kỹ thuật và tài liệu thực tế vào **thời gian biểu hàng ngày** để đảm bảo tính khả thi và bền vững:

| Thời Gian | Nội Dung Luyện Tập | Thang Bậc Học Liệu | Công Cụ Kỹ Thuật Sử Dụng | Mục Tiêu & Sản Phẩm Đầu Ra |
| :--- | :--- | :--- | :--- | :--- |
| **07:00 – 07:30** *(30 phút)* | **Passive Immersion (Nghe thụ động lúc đi lại)** | Tier 3 hoặc Tier 4 (Planet Money, Huberman Lab, The Rest is History) | **AntennaPod / Pocket Casts** *(Đặt tốc độ 1.1x–1.2x, kích hoạt Volume Boost)* | Đánh thức vùng thính giác não bộ, làm quen với nhịp điệu và ngữ điệu tự nhiên. |
| **12:15 – 12:45** *(30 phút)* | **Extensive Reading (Đọc thả lỏng buổi trưa)** | Stage 2 hoặc Stage 3 (Atomic Habits, The Economist, Aeon Essays) | **Kindle Paperwhite / Calibre / Reader by Readwise** | Đọc liền mạch 10–15 trang, bôi đen các cấu trúc hay (Zero dictionary lookups). |
| **19:00 – 19:30** *(30 phút)* | **Active Audio Decoding (3-Pass Transcription)** | Tier 4 (Đoạn 45 giây từ The Daily hoặc EconTalk) | **Audacity** *(Loop 5s, Shift+Space)* & **Praat** *(Kiểm tra Pitch / Formant khi nói nhại)* | Bản chép chính tả từng từ, bảng đối chiếu sai lệch ngữ âm (Discrepancy Audit). |
| **19:30 – 20:00** *(30 phút)* | **Intensive Reading & Syntactic Mining** | Stage 3 hoặc Stage 4 (1 bài xã luận The Economist hoặc Orwell Essay) | **Obsidian** & **Readwise** *(Khai thác 3-5 câu mẫu theo công thức i+1)* | 5 thẻ SRS mới vào Obsidian Vault mang tag `#syntax` và `#collocation`. |
| **20:00 – 20:20** *(20 phút)* | **Writing Précis & Style Verification** | Viết tóm tắt 3 câu cho bài đọc buổi trưa | **LanguageTool (Local Docker)** | Đoạn văn MEAL chuẩn mực, loại bỏ câu bị động thừa và danh từ hóa rườm rà. |

---

## 5. Summary & Action Steps

1. **Khởi tạo bộ công cụ ngay hôm nay:**
   - Cài đặt Audacity và thiết lập phím tắt `Loop` (`Shift + Space`).
   - Thiết lập Obsidian Vault theo cấu trúc thư mục tại Mục 1.4.
   - Cài đặt AntennaPod hoặc Pocket Casts trên điện thoại di động và đăng ký theo dõi 3 kênh podcast ở Tier 2 và Tier 3.
2. **Tuân thủ nguyên tắc không đốt cháy giai đoạn:**
   - Chỉ nâng tầng nghe từ Tier 2 lên Tier 3, hoặc từ Tier 3 lên Tier 4 khi đạt độ hiểu $\ge 95\%$ ở tốc độ thực.
   - Đối với tài liệu đọc, luôn duy trì tỷ lệ 80% Extensive Reading (đọc lướt trôi chảy) và 20% Intensive Reading (phân tích ngữ pháp vi mô).
3. **Liên kết với các hướng dẫn khác:**
   - Xem chi tiết kỹ thuật phân tích nối âm tại [listening.md](file:///E:/Eng/listening.md).
   - Xem phương pháp Sentence Mining tại [reading.md](file:///E:/Eng/reading.md).
   - Xem quy trình 5 bước Shadowing tại [speaking.md](file:///E:/Eng/speaking.md).
   - Xem cấu trúc đoạn văn MEAL/PEEL tại [writing.md](file:///E:/Eng/writing.md).
   - Xem lịch phân bổ bài tập chi tiết tại [daily_practice_plan.md](file:///E:/Eng/daily_practice_plan.md).
