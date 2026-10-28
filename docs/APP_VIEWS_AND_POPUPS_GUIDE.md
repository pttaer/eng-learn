# Hướng Dẫn Toàn Diện Về Các View & Popup Trong Ứng Dụng
# Complete Architecture Guide: Views, Modals & Navigation

> **Tài liệu tham chiếu:** Hệ thống gồm 2 ứng dụng web độc lập và đồng bộ dữ liệu:
> 1. **English Singularity Core Suite** ([`web/index.html`](file:///e:/Eng/web/index.html)) – Nền tảng học thuật CEFR A1–C2 toàn diện.
> 2. **Academic IELTS Suite** ([`web/ielts.html`](file:///e:/Eng/web/ielts.html)) – Bộ công cụ luyện thi chuyên sâu 4 kỹ năng IELTS Academic chuẩn Cambridge 9.0.
> 
> **Bộ sưu tập ảnh chụp màn hình đầy đủ:** Toàn bộ 47 views và popups đã được chụp bằng engine Puppeteer tự động và lưu trữ tại thư mục [`screenshots/`](file:///e:/Eng/screenshots/).

---

## 1. English Singularity Core Suite (`index.html`) — 17 Views / Routes

Được điều hướng thông qua bộ định tuyến [`Router`](file:///e:/Eng/web/src/core/router.ts) (`web/src/core/router.ts`) và gắn vào container `#workspace-mount` tại [`web/src/main.ts`](file:///e:/Eng/web/src/main.ts).

| # | Tên View | URL Hash | Tệp nguồn phụ trách | Cách kích hoạt (UI / Phím tắt) | Ảnh Screenshot |
|---|---|---|---|---|---|
| 1 | **Constellation Skill Tree** | `#tree` | [`web/src/modules/skill-tree-view.ts`](file:///e:/Eng/web/src/modules/skill-tree-view.ts) | • Click logo hoặc nút `CONSTELLATION TREE` trên Header HUD.<br>• Phím tắt `Escape` khi đang ở màn hình khác. | [📸 view-01-tree.png](file:///e:/Eng/screenshots/view-01-tree.png) |
| 2 | **3D Urchin Singularity Canvas** | `#singularity` | [`web/src/core/perspective-canvas.ts`](file:///e:/Eng/web/src/core/perspective-canvas.ts) | • Click nút la bàn `Singularity` ở góc dưới màn hình (`CornerCompass`).<br>• Tự động chuyển về sau khi hoàn thành một chu kỳ học. | [📸 view-02-singularity.png](file:///e:/Eng/screenshots/view-02-singularity.png) |
| 3 | **Intensive Reading & Mining** | `#read` | [`web/src/modules/reading-dossier.ts`](file:///e:/Eng/web/src/modules/reading-dossier.ts) | • Click nhánh `Reading` trên Skill Tree (`#tree`).<br>• Click icon Sách trên CornerCompass. | [📸 view-03-reading.png](file:///e:/Eng/screenshots/view-03-reading.png) |
| 4 | **Benjamin Franklin Copywork** | `#write` | [`web/src/modules/writing-dossier.ts`](file:///e:/Eng/web/src/modules/writing-dossier.ts) | • Click nhánh `Writing` trên Skill Tree.<br>• Click icon Bút viết trên CornerCompass. | [📸 view-04-writing.png](file:///e:/Eng/screenshots/view-04-writing.png) |
| 5 | **Active Transcription Studio** | `#listen` | [`web/src/modules/listening-dossier.ts`](file:///e:/Eng/web/src/modules/listening-dossier.ts) | • Click nhánh `Listening` trên Skill Tree.<br>• Click icon Tai nghe trên CornerCompass. | [📸 view-05-listening.png](file:///e:/Eng/screenshots/view-05-listening.png) |
| 6 | **4-3-2 Fluency & Roleplay Studio** | `#speak` | [`web/src/modules/speaking-dossier.ts`](file:///e:/Eng/web/src/modules/speaking-dossier.ts) | • Click nhánh `Speaking` trên Skill Tree.<br>• Click icon Micro trên CornerCompass. | [📸 view-06-speaking.png](file:///e:/Eng/screenshots/view-06-speaking.png) |
| 7 | **Roguelike Vocabulary Vault** | `#vocab` | [`web/src/modules/vocabulary-dossier.ts`](file:///e:/Eng/web/src/modules/vocabulary-dossier.ts) | • Click nhánh `Vocabulary` trên Skill Tree.<br>• Click icon Thẻ bài trên CornerCompass. | [📸 view-07-vocabulary.png](file:///e:/Eng/screenshots/view-07-vocabulary.png) |
| 8 | **1,000 Collocations Vault** | `#colloc` | [`web/src/modules/collocations-dossier.ts`](file:///e:/Eng/web/src/modules/collocations-dossier.ts) | • Click nhánh `Collocations` trên Skill Tree.<br>• Phím tắt **`Ctrl + K`** (hoặc `Cmd + K`) mở nhanh ô tìm kiếm Collocations. | [📸 view-08-collocations.png](file:///e:/Eng/screenshots/view-08-collocations.png) |
| 9 | **C1/C2 Syntactic Matrix** | `#grammar` | [`web/src/modules/grammar-dossier.ts`](file:///e:/Eng/web/src/modules/grammar-dossier.ts) | • Click nhánh `Grammar` trên Skill Tree.<br>• Click icon Ngữ pháp trên CornerCompass. | [📸 view-09-grammar.png](file:///e:/Eng/screenshots/view-09-grammar.png) |
| 10 | **12 Tenses Master Vault & Drill** | `#tenses` | [`web/src/modules/tenses-dossier.ts`](file:///e:/Eng/web/src/modules/tenses-dossier.ts) | • Click nút `12 Tenses Vault` trong Grammar Dossier.<br>• Click mục Tenses trong Mobile Action Sheet. | [📸 view-10-tenses.png](file:///e:/Eng/screenshots/view-10-tenses.png) |
| 11 | **30-Day Mission Log & Habits** | `#habits` | [`web/src/modules/mission-log.ts`](file:///e:/Eng/web/src/modules/mission-log.ts) | • Click nhánh `Daily Habits` trên Skill Tree.<br>• Click icon Ngọn lửa/Lịch trên CornerCompass. | [📸 view-11-habits.png](file:///e:/Eng/screenshots/view-11-habits.png) |
| 12 | **60-Second Speed Blitz Sprint** | `#blitz` | [`web/src/modules/blitz-dossier.ts`](file:///e:/Eng/web/src/modules/blitz-dossier.ts) | • Click nút `⚡ BLITZ` viền vàng trên Header HUD. | [📸 view-12-blitz.png](file:///e:/Eng/screenshots/view-12-blitz.png) |
| 13 | **CEFR Split-Screen Mediation** | `#mediate` | [`web/src/modules/mediation-dossier.ts`](file:///e:/Eng/web/src/modules/mediation-dossier.ts) | • Click nút `⚖ MEDIATION` trên Header HUD.<br>• Phím tắt nhanh **`M`** (khi không trong input). | [📸 view-13-mediation.png](file:///e:/Eng/screenshots/view-13-mediation.png) |
| 14 | **CEFR Analytics & SERL 2.0** | `#analytics` | [`web/src/modules/analytics-dossier.ts`](file:///e:/Eng/web/src/modules/analytics-dossier.ts) | • Click nút `ANALYTICS` trên Header HUD.<br>• Mở Mobile Drawer -> chọn Analytics. | [📸 view-14-analytics.png](file:///e:/Eng/screenshots/view-14-analytics.png) |
| 15 | **CD-IELTS 40-Q Exam Cockpit** | `#cockpit` | [`web/src/modules/exam-cockpit-dossier.ts`](file:///e:/Eng/web/src/modules/exam-cockpit-dossier.ts) | • Click nút `IELTS COCKPIT` trên Header HUD.<br>• Phím tắt nhanh **`C`** (khi không trong input). | [📸 view-15-cockpit.png](file:///e:/Eng/screenshots/view-15-cockpit.png) |
| 16 | **Sound Lab & Email Practice Drills** | `#drills` | [`web/src/modules/drills-dossier.ts`](file:///e:/Eng/web/src/modules/drills-dossier.ts) | • Mở CornerCompass -> click `Practice Drills`.<br>• Mở Mobile Drawer -> chọn `Practice Drills`. | [📸 view-16-drills.png](file:///e:/Eng/screenshots/view-16-drills.png) |
| 17 | **Full Settings & Backup Dossier** | `#settings` | [`web/src/modules/settings-dossier.ts`](file:///e:/Eng/web/src/modules/settings-dossier.ts) | • Nhập `#settings` trên URL.<br>• Click mở từ menu cài đặt nâng cao. | [📸 view-17-settings.png](file:///e:/Eng/screenshots/view-17-settings.png) |

---

## 2. Academic IELTS Suite (`ielts.html`) — 14 Views / Routes

Được quản lý thông qua [`web/src/ielts/main.ts`](file:///e:/Eng/web/src/ielts/main.ts) với hệ thống **Executive Navbar** và **Studio Subnav Banners**.

| # | Tên View | URL Hash | Tệp nguồn phụ trách | Vị trí kích hoạt trên UI | Ảnh Screenshot |
|---|---|---|---|---|---|
| 1 | **IELTS Overview (Road to 7.0)** | `#home` | [`web/src/ielts/main.ts`](file:///e:/Eng/web/src/ielts/main.ts) | Click tab `Overview` trên Navbar chính. | [📸 view-18-ielts-home.png](file:///e:/Eng/screenshots/view-18-ielts-home.png) |
| 2 | **Full 4-Skill Diagnostic Assessment** | `#diagnostic` | [`web/src/ielts/views/diagnostic.ts`](file:///e:/Eng/web/src/ielts/views/diagnostic.ts) | Click tab `Diagnostic` trên Navbar. | [📸 view-19-ielts-diagnostic.png](file:///e:/Eng/screenshots/view-19-ielts-diagnostic.png) |
| 3 | **Timed Academic Reading Passages** | `#reading` | [`web/src/ielts/views/reading.ts`](file:///e:/Eng/web/src/ielts/views/reading.ts) | Tab `Reading` -> chọn subnav `Timed Passages`. | [📸 view-20-ielts-reading.png](file:///e:/Eng/screenshots/view-20-ielts-reading.png) |
| 4 | **14 Attack Drills Reading Lab** | `#reading-drills` | [`web/src/ielts/views/reading-drills.ts`](file:///e:/Eng/web/src/ielts/views/reading-drills.ts) | Tab `Reading` -> chọn subnav `14 Attack Drills Lab`. | [📸 view-21-ielts-reading-drills.png](file:///e:/Eng/screenshots/view-21-ielts-reading-drills.png) |
| 5 | **Listening Studio (Sections 1–4)** | `#listening` | [`web/src/ielts/views/listening.ts`](file:///e:/Eng/web/src/ielts/views/listening.ts) | Tab `Listening` -> chọn subnav `Sections 1–4 Audio`. | [📸 view-22-ielts-listening.png](file:///e:/Eng/screenshots/view-22-ielts-listening.png) |
| 6 | **Listening Traps & Audio Lab** | `#listening-traps` | [`web/src/ielts/views/listening-traps.ts`](file:///e:/Eng/web/src/ielts/views/listening-traps.ts) | Tab `Listening` -> chọn subnav `Traps & Audio Lab`. | [📸 view-23-ielts-listening-traps.png](file:///e:/Eng/screenshots/view-23-ielts-listening-traps.png) |
| 7 | **Writing Studio (Task 1 & Task 2)** | `#writing` | [`web/src/ielts/views/writing.ts`](file:///e:/Eng/web/src/ielts/views/writing.ts) | Tab `Writing` -> chọn subnav `Prompts & Rubrics`. | [📸 view-24-ielts-writing.png](file:///e:/Eng/screenshots/view-24-ielts-writing.png) |
| 8 | **Writing Blueprints & Architect** | `#writing-studio` | [`web/src/ielts/views/writing-studio.ts`](file:///e:/Eng/web/src/ielts/views/writing-studio.ts) | Tab `Writing` -> chọn subnav `Blueprints & Architect`. | [📸 view-25-ielts-writing-studio.png](file:///e:/Eng/screenshots/view-25-ielts-writing-studio.png) |
| 9 | **Speaking Studio (Part 1–3 Prompts)** | `#speaking` | [`web/src/ielts/views/speaking.ts`](file:///e:/Eng/web/src/ielts/views/speaking.ts) | Tab `Speaking` -> chọn subnav `Prompts & Notepad`. | [📸 view-26-ielts-speaking.png](file:///e:/Eng/screenshots/view-26-ielts-speaking.png) |
| 10 | **Speaking Examiner Simulator** | `#speaking-simulator` | [`web/src/ielts/views/speaking-simulator.ts`](file:///e:/Eng/web/src/ielts/views/speaking-simulator.ts) | Tab `Speaking` -> chọn subnav `Examiner Simulator`. | [📸 view-27-ielts-speaking-simulator.png](file:///e:/Eng/screenshots/view-27-ielts-speaking-simulator.png) |
| 11 | **Academic Vocabulary & AWL** | `#vocab` | [`web/src/ielts/views/vocab.ts`](file:///e:/Eng/web/src/ielts/views/vocab.ts) | Click tab `Vocabulary` trên Navbar. | [📸 view-28-ielts-vocab.png](file:///e:/Eng/screenshots/view-28-ielts-vocab.png) |
| 12 | **Study Path & Summit Milestones** | `#path` | [`web/src/ielts/views/path.ts`](file:///e:/Eng/web/src/ielts/views/path.ts) | Click link `Study path` trong trang Overview. | [📸 view-29-ielts-path.png](file:///e:/Eng/screenshots/view-29-ielts-path.png) |
| 13 | **Comprehensive Strategy Guides** | `#strategy` | [`web/src/ielts/views/strategy.ts`](file:///e:/Eng/web/src/ielts/views/strategy.ts) | Click tab `Strategy` trên Navbar. | [📸 view-30-ielts-strategy.png](file:///e:/Eng/screenshots/view-30-ielts-strategy.png) |
| 14 | **Full Mock Exam Cockpit** | `#mock` | [`web/src/ielts/views/mock.ts`](file:///e:/Eng/web/src/ielts/views/mock.ts) | Click tab `Mock tests` trên Navbar (chạy buồng thi chuẩn 40 câu). | [📸 view-31-ielts-mock.png](file:///e:/Eng/screenshots/view-31-ielts-mock.png) |

---

## 3. Toàn Bộ Popups, Modals, Drawers & Overlays (16 Loại)

Mỗi popup/modal dưới đây đều đã được chụp ảnh màn hình nghiệm thu chi tiết:

### 1. Placement Quiz Modal
* **Mô tả:** Bài kiểm tra trắc nghiệm phân loại trình độ CEFR đầu vào (A1 – C2).
* **Tệp nguồn:** [`web/src/modules/placement-quiz.ts`](file:///e:/Eng/web/src/modules/placement-quiz.ts)
* **Ảnh chụp:** [📸 popup-01-placement-quiz.png](file:///e:/Eng/screenshots/popup-01-placement-quiz.png)
* **Cách kích hoạt:**
  - Tự động bật khi truy cập lần đầu nếu chưa hoàn thành test.
  - Nhập URL hash: `#placement` hoặc `#quiz`.
  - Click vào nút Level (`.btn-level`) trên Header HUD -> chọn **"Retake Placement Quiz"**.
  - **DevTools:** `PlacementQuiz.open()`

### 2. Multi-Skill CEFR Quiz & Celestial Radar Modal
* **Mô tả:** Modal làm bài kiểm tra Radar đa kỹ năng và phân tích lỗ hổng kiến thức.
* **Tệp nguồn:** [`web/src/modules/multi-skill-quiz-modal.ts`](file:///e:/Eng/web/src/modules/multi-skill-quiz-modal.ts)
* **Ảnh chụp:** [📸 popup-03-celestial-radar-modal.png](file:///e:/Eng/screenshots/popup-03-celestial-radar-modal.png)
* **Cách kích hoạt:**
  - Click nút **`RADAR`** (`.btn-skill-radar`) trên Header HUD.
  - Trong Constellation Tree (`#tree`), click vào 1 Skill Node -> bấm nút **"Launch Targeted Drill"**.
  - **DevTools:** `MultiSkillQuizModal.open('radar')`

### 3. Skill Node Detail & Prerequisite Gating Modal (`#skill-node-modal`)
* **Mô tả:** Bảng thông tin chi tiết của node kỹ năng trên cây chòm sao Constellation (CEFR, Level, tỷ lệ Mastery %, điều kiện tiên quyết).
* **Tệp nguồn:** [`web/src/modules/skill-tree-view.ts`](file:///e:/Eng/web/src/modules/skill-tree-view.ts)
* **Ảnh chụp:** [📸 popup-02-skill-node-detail.png](file:///e:/Eng/screenshots/popup-02-skill-node-detail.png)
* **Cách kích hoạt:**
  - Vào `#tree` -> click chuột vào bất kỳ node hình tròn/chòm sao nào.

### 4. RPG Progression & Level-Up Modal (`ProgressionModal`)
* **Mô tả:** Bảng thành tích RPG hiển thị Level, XP hiện tại, thanh kinh nghiệm, Rank và các huy hiệu mở khóa.
* **Tệp nguồn:** [`web/src/modules/progression-modal.ts`](file:///e:/Eng/web/src/modules/progression-modal.ts)
* **Ảnh chụp:** [📸 popup-04-rpg-progression.png](file:///e:/Eng/screenshots/popup-04-rpg-progression.png)
* **Cách kích hoạt:**
  - Click trực tiếp vào pill hiển thị **`⚡ LVL ... XP`** trên Header HUD.
  - Mở Mobile Drawer -> click **"Progression & XP"**.
  - Trong Settings Dossier (`#settings`) -> click **"View Progression Details"**.
  - **DevTools:** `ProgressionModal.open()`

### 5. Universal Sliding Lexicon Drawer (`LexiconDrawer`)
* **Mô tả:** Ngăn kéo từ điển tra cứu chuyên sâu O(1) với phát âm IPA, nghĩa tiếng Việt, cấu trúc câu và Collocations liên quan.
* **Tệp nguồn:** [`web/src/modules/lexicon-drawer.ts`](file:///e:/Eng/web/src/modules/lexicon-drawer.ts)
* **Ảnh chụp:** [📸 popup-05-lexicon-drawer.png](file:///e:/Eng/screenshots/popup-05-lexicon-drawer.png)
* **Cách kích hoạt:**
  - **Cách 1 (Nhanh nhất):** Double-click (nhấp đúp chuột) vào bất kỳ từ tiếng Anh nào trong bài đọc/bài học.
  - **Cách 2:** Bôi đen (select) đoạn văn bản -> click pill nổi `LOOKUP IN LEXICON` (hoặc ấn `Enter`).
  - **Cách 3:** Click vào các từ được highlight sẵn trong bài đọc (lớp `.reading-vocab-target` hoặc `.lexicon-clickable`).
  - **DevTools:** `LexiconDrawer.open('mitigate')`

### 6. Smart Mistake Vault & Blitz Modal (`MistakeVault`)
* **Mô tả:** Két sắt lưu trữ các câu trả lời sai (Mistakes) để ôn tập lại theo cơ chế Spaced Repetition.
* **Tệp nguồn:** [`web/src/core/mistake-vault.ts`](file:///e:/Eng/web/src/core/mistake-vault.ts)
* **Ảnh chụp:** [📸 popup-06-mistake-vault.png](file:///e:/Eng/screenshots/popup-06-mistake-vault.png)
* **Cách kích hoạt:**
  - Trên Mobile Action Sheet của Header HUD -> click nút **"Mistake Vault"**.
  - Trong IELTS App (`ielts.html`) -> click biểu tượng **Mistake Vault** trên header.
  - **DevTools:** `MistakeVault.open()`

### 7. Commute Hands-Free Audio Player (`CommuteAudioPlayer`)
* **Mô tả:** Trình phát âm thanh rảnh tay khi di chuyển, tự động lặp lại các câu luyện phát âm và nghe thụ động.
* **Tệp nguồn:** [`web/src/core/commute-audio-player.ts`](file:///e:/Eng/web/src/core/commute-audio-player.ts)
* **Ảnh chụp:** [📸 popup-07-commute-player.png](file:///e:/Eng/screenshots/popup-07-commute-player.png)
* **Cách kích hoạt:**
  - Click nút **"Commute Audio"** trong Mobile Menu hoặc trên thanh điều hướng IELTS.
  - **DevTools:** `CommuteAudioPlayer.open()`

### 8. Spotlight Onboarding Tour Overlay (`SpotlightTour`)
* **Mô tả:** Tour tương tác 60 giây làm mờ màn hình và chiếu luồng sáng spotlight hướng dẫn từng phân vùng chức năng.
* **Tệp nguồn:** [`web/src/core/spotlight-tour.ts`](file:///e:/Eng/web/src/core/spotlight-tour.ts)
* **Ảnh chụp:** [📸 popup-08-spotlight-tour.png](file:///e:/Eng/screenshots/popup-08-spotlight-tour.png)
* **Cách kích hoạt:**
  - Xuất hiện qua thông báo `ORIENTATION ADVISORY` sau khi hoàn thành placement test.
  - Click nút La bàn "Start Guided Tour" trong menu cài đặt của Header HUD.
  - **DevTools:** `SpotlightTour.start(true)`

### 9. CEFR Level Picker Modal (`openLevelPicker`)
* **Mô tả:** Popup cho phép chọn nhanh trình độ mục tiêu CEFR (A1, A2, B1, B2, C1, C2).
* **Tệp nguồn:** [`web/src/modules/header-hud.ts`](file:///e:/Eng/web/src/modules/header-hud.ts)
* **Ảnh chụp:** [📸 popup-09-level-picker.png](file:///e:/Eng/screenshots/popup-09-level-picker.png)
* **Cách kích hoạt:**
  - Click trực tiếp vào ô cấp độ (ví dụ `B2`, `C1`) nằm cạnh logo trên Header HUD.

### 10. Mobile Menu Action Sheet Drawer (`openMobileDrawer`)
* **Mô tả:** Ngăn kéo điều hướng toàn diện khi truy cập trên thiết bị di động ($\le 768px$).
* **Tệp nguồn:** [`web/src/modules/header-hud.ts`](file:///e:/Eng/web/src/modules/header-hud.ts)
* **Ảnh chụp:** [📸 popup-16-mobile-menu-drawer.png](file:///e:/Eng/screenshots/popup-16-mobile-menu-drawer.png)
* **Cách kích hoạt:**
  - Thu nhỏ cửa sổ $\le 768px$ -> click nút 3 gạch (`.btn-mobile-menu-drawer`) ở góc phải Header HUD.

### 11. Quick HUD Settings Modal (`openSettingsModal`)
* **Mô tả:** Popup tùy chọn nhanh âm lượng SFX, nhạc nền Ambient Lo-Fi/Zen, đổi ngôn ngữ Anh/Việt, giảm chuyển động (Reduce Motion) và Profile Backup/Import.
* **Tệp nguồn:** [`web/src/modules/header-hud.ts`](file:///e:/Eng/web/src/modules/header-hud.ts)
* **Ảnh chụp:** [📸 popup-10-quick-hud-settings.png](file:///e:/Eng/screenshots/popup-10-quick-hud-settings.png)
* **Cách kích hoạt:**
  - Click nút bánh răng Cài đặt trên Header HUD.

### 12. Exam Submit Confirmation Modal (`confirmExamSubmission`)
* **Mô tả:** Hộp thoại kiểm tra số câu đã làm, số câu bỏ sót và số câu gắn cờ (Flag) trước khi chính thức khóa bài thi.
* **Tệp nguồn:** [`web/src/modules/exam-cockpit-dossier.ts`](file:///e:/Eng/web/src/modules/exam-cockpit-dossier.ts)
* **Ảnh chụp:** [📸 popup-11-exam-submission-confirm.png](file:///e:/Eng/screenshots/popup-11-exam-submission-confirm.png)
* **Cách kích hoạt:**
  - Trong buồng thi CD-IELTS (`#cockpit` hoặc `#mock`) -> click nút **"Finish & Submit Exam"**.

### 13. Official Cambridge 9.0 Band Conversion Score Report Modal
* **Mô tả:** Bảng điểm chuẩn Cambridge 9.0 với đồng hồ đo Band Score, phân tích chi tiết từng Passage 1/2/3 và tỷ lệ đúng từng dạng bài.
* **Tệp nguồn:** [`web/src/modules/exam-cockpit-dossier.ts`](file:///e:/Eng/web/src/modules/exam-cockpit-dossier.ts)
* **Ảnh chụp:** [📸 popup-12-cambridge-band-report.png](file:///e:/Eng/screenshots/popup-12-cambridge-band-report.png)
* **Cách kích hoạt:**
  - Tự động bật lên ngay khi xác nhận nộp bài thi hoặc khi đồng hồ 60 phút đếm về 0.
  - **DevTools:**
    ```javascript
    __singularityApp.examCockpit.openBandConversionModal({
      rawScore: 33, bandScore: 7.5, cefr: 'C1', descriptor: 'Good User', pct: 83
    });
    ```

### 14. Routine Completion Receipt Modal (`showCompletionReceipt`)
* **Mô tả:** Bảng biên nhận nghiệm thu khi hoàn thành bài tập (Mission Directive Complete) kèm hiệu ứng âm thanh Absorb, cập nhật Streak và số thẻ đã review.
* **Tệp nguồn:** [`web/src/main.ts`](file:///e:/Eng/web/src/main.ts)
* **Ảnh chụp:** [📸 popup-13-completion-receipt.png](file:///e:/Eng/screenshots/popup-13-completion-receipt.png)
* **Cách kích hoạt:**
  - Hoàn thành bất kỳ phiên luyện tập nào (1 ngày trong Mission Log, bài Franklin Copywork, hoặc 1 chuỗi đọc Intensive 4-pass).

### 15. IELTS Strategy Tip Modal (`.ie-tip-modal-overlay`)
* **Mô tả:** Modal đọc chiến thuật chi tiết từng dạng câu hỏi IELTS (kèm công thức, bẫy thường gặp, danh sách từ đồng nghĩa và audio tóm tắt).
* **Tệp nguồn:** [`web/src/ielts/views/strategy.ts`](file:///e:/Eng/web/src/ielts/views/strategy.ts)
* **Ảnh chụp:** [📸 popup-14-ielts-strategy-tip.png](file:///e:/Eng/screenshots/popup-14-ielts-strategy-tip.png)
* **Cách kích hoạt:**
  - Vào IELTS Suite (`ielts.html`) -> chọn tab `#strategy` -> click vào bất kỳ thẻ dạng bài nào.

### 16. Zen Focus Mode Fullscreen Overlay (`ZenMode`)
* **Mô tả:** Chế độ tập trung cao độ toàn màn hình, ẩn toàn bộ các thanh HUD và công cụ xung quanh để tập trung đọc hiểu / chép chính tả.
* **Tệp nguồn:** [`web/src/core/zen-mode.ts`](file:///e:/Eng/web/src/core/zen-mode.ts)
* **Ảnh chụp:** [📸 popup-15-zen-focus-overlay.png](file:///e:/Eng/screenshots/popup-15-zen-focus-overlay.png)
* **Cách kích hoạt:**
  - Bấm phím **`Z`** khi đang ở bài đọc hoặc click icon con mắt Zen trên Header HUD.
