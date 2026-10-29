# BÁO CÁO PHÊ BÌNH THIẾT KẾ UI/UX TỐI HẬU: "CÚ ĐẤM THỰC TẾ" CHO TOÀN BỘ HỆ THỐNG
## Hồ sơ Thẩm định Thị giác & Công thái học Di động (Mobile & Vivo V2445A)

> **Người thực hiện:** Trưởng ban Thẩm định & Giám đốc Thiết kế UI/UX (Principal Design Critic & UX Ergonomist)  
> **Hệ quy chiếu thẩm định:** [`AGENTS.md`](file:///e:/Eng/AGENTS.md), [`docs/TYPOGRAPHY_SPACING_RULES.md`](file:///e:/Eng/docs/TYPOGRAPHY_SPACING_RULES.md), [`.agents/rules/canonical-spacing.md`](file:///e:/Eng/.agents/rules/canonical-spacing.md)  
> **Dữ liệu thực chứng:** Thiết bị vật lý thực tế ([`phone_screen.png`](file:///e:/Eng/phone_screen.png)) + Trọn bộ 25 màn hình chụp tự động Vivo V2445A (360×802px @ 3.0 DPR) ([`screenshots/vivo-360x802/`](file:///e:/Eng/screenshots/vivo-360x802/)) + Bộ lưu trữ [`Mobile/flows/`](file:///e:/Eng/Mobile/flows/).  
> **Ngày kết án:** 29/10/2026  
> **Tình trạng:** **BÁO ĐỘNG ĐỎ — KHÔNG ĐẠT TIÊU CHUẨN XUẤT XƯỞNG (SHIP BLOCKER)**

---

## Lời Tuyên Ngôn Của Giám Đốc Thiết Kế

Hãy dừng ngay việc tự huyễn hoặc bản thân bằng những bản spec bóng bẩy trên giấy. Khi đưa giao diện này lên một chiếc điện thoại thật hoặc một màn hình phổ thông có tỉ lệ dài hẹp như Vivo V2445A (360×802px), giao diện của các bạn không phải là một "kiệt tác Apple-calm" như các bạn tự xưng trong tài liệu. 

**Nó là một mớ hỗn độn chắp vá, chứa đầy những vết cắt xén chữ lố bịch, những khối nội dung bị dìm chết ngạt dưới thanh điều hướng đáy, những bảng màu lòe loẹt như hội chợ thập niên 90, và căn bệnh "sính chữ hàn lâm rởm" làm tê liệt nhận thức của người học.**

Dưới đây là bản cáo trạng không khoan nhượng về từng ung nhọt thiết kế đang bóp chết trải nghiệm người dùng trên chiếc app này.

---

## 1. BẢNG ĐIỂM TRỪNG PHẠT (PUNITIVE SCORECARD)

| Hạng mục Thẩm định | Điểm / 10 | Trạng thái | Tội danh chí tử |
| :--- | :---: | :---: | :--- |
| **1. Toàn vẹn Thông tin & Cắt xén (Truncation)** | **1.5** | 🔴 THẢM HỌA | Cắt cụt phụ đề sau 7 ký tự (`Hermeneu...`); bẻ đôi phân số thành 2 dòng (`0 /` \n `14`). |
| **2. Khoảng an toàn Đáy & Dock Clearance** | **2.0** | 🔴 TỆ HẠI | Phá vỡ Rule 3; văn bản bài đọc, cụm từ speaking, cài đặt bị bottom dock cắt ngang mặt. |
| **3. Ngôn ngữ & Nhất quán Văn phong** | **2.5** | 🔴 TÂM THẦN PHÂN LIỆT | Thân bài 100% tiếng Anh, nút bấm 100% tiếng Việt; trên mobile lại đòi bấm "Phím cách". |
| **4. Kỷ luật Viền & Khung hình học (Borders)** | **3.0** | 🔴 RÁC THỊ GIÁC | Vi phạm trắng trợn Rule 7: 4 tầng viền đồng tâm lồng nhau; viền đứt nét như file nháp. |
| **5. Bảng màu & Tinh thần Apple-Calm** | **3.5** | 🟠 LÒE LOẸT | Drawer biến thành hộp bút chì màu với 6 loại màu viền tương phản chát chúa. |
| **6. Công thái học Nút & Card-as-Button** | **3.5** | 🟠 HỖN LOẠN | Chỗ cần bấm thì giấu nhẹm affordance; chỗ danh sách thì nhồi nút khổng lồ làm phình trang. |
| **TỔNG KẾT ĐÁNH GIÁ** | **2.7 / 10** | 🚫 **ĐÌNH CHỈ** | **YÊU CẦU ĐẬP ĐI TỔ CHỨC LẠI TOÀN BỘ MOBILE ERGONOMICS** |

---

## 2. BẢN CÁO TRẠNG CHI TIẾT THEO TỪNG VẾT THƯƠNG THỊ GIÁC

### TỘI ÁC SỐ 1: Bệnh Cắt Cụt Chữ Vô Liêm Sỉ (The Truncation Catastrophe)
*Chứng cứ thực tế:* [`phone_screen.png`](file:///e:/Eng/phone_screen.png), [`vivo-15-ielts-reading-drills.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-15-ielts-reading-drills.png), [`vivo-08-grammar.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-08-grammar.png), [`vivo-10-habits.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-10-habits.png).

1. **Vết nhơ trên thiết bị thật ([`phone_screen.png`](file:///e:/Eng/phone_screen.png)):**
   - Nhìn vào cụm 4 thẻ kỹ năng cốt lõi (Reading, Writing, Listening, Speaking): Toàn bộ các dòng phụ đề bị cắt cụt một cách thảm hại sau đúng vài ký tự:
     - `Hermeneu...` (Cắt mất chữ Hermeneutic & Analytic Intake).
     - `Rhetorical ...` (Cắt cụt mất tiêu đề).
     - `Phonetics ...` (Cắt cụt).
     - `Acoustic &...` (Cắt cụt đến mức dấu `&` dính sát vào ba chấm).
     - Thẻ dưới: `Lexical Collocations & Syntactic Architect...`.
   - *Bản án:* Đây là sự lười biếng tột độ của thiết kế responsive! Nếu chiều rộng thẻ trên màn hình 360px chỉ đủ hiển thị 10 ký tự, tại sao lại cố nhét một mớ từ ngữ đao to búa lớn vào đó để rồi trình duyệt tự động vứt vào mặt người dùng một dấu ba chấm tàn nhẫn? Nó biến app thành một sản phẩm demo lỗi, một sản phẩm chưa qua kiểm thử!
2. **Bẻ đôi phân số thành 2 dòng ([`vivo-15-ielts-reading-drills.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-15-ielts-reading-drills.png)):**
   - Con số thống kê thành thạo hiển thị:
     ```
     0 /
     14
     ```
     Một phân số cơ bản `0 / 14` mà CSS flexbox/grid yếu kém đến mức để số `14` rớt xuống dòng thứ hai! Không một UI Designer tự trọng nào được phép để một chỉ số telemetry vỡ vụn như vậy.
3. **Từ mồ côi (Typographic Orphan) trên thẻ ngữ pháp ([`vivo-08-grammar.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-08-grammar.png)):**
   - Dòng chữ: `CHUỖI LUYỆN BIẾN ĐỔI CÚ PHÁP 0 LẦN BIẾN` ngắt dòng để rơi trơ trọi đúng một chữ `ĐỔI` ở dòng dưới! 
4. **Băng chuyền ngày bị nuốt chửng ([`vivo-10-habits.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-10-habits.png)):**
   - Hàng nút ngày hiển thị: `01`, `02`, `03`, `04`, `05`, `06`, `0...` — nút số `07` bị chém cụt còn nửa thân và một dấu chấm lửng!
5. **Nút quay lại bị cắn xé khắp nơi ([`vivo-12`](file:///e:/Eng/screenshots/vivo-360x802/vivo-12-ielts-home.png), [`vivo-18`](file:///e:/Eng/screenshots/vivo-360x802/vivo-18-ielts-writing.png)):**
   - Header luôn hiển thị `← Về English ...` thay vì một icon Back tinh tế hoặc nhãn ngắn gọn.

---

### TỘI ÁC SỐ 2: Vùi Chết Nội Dung Dưới Đáy Màn Hình (Dock Submersion & Clearance Disaster)
*Chứng cứ thực tế:* [`vivo-02-reading.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-02-reading.png), [`vivo-03-copywork.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-03-copywork.png), [`vivo-05-speaking.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-05-speaking.png), [`vivo-11-settings.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-11-settings.png).

Quy tắc bất di bất dịch của workspace ([`AGENTS.md`](file:///e:/Eng/AGENTS.md) Mục 1.3 và Rule 3):
> *"Mobile Safe Dock Clearance: Views under fixed bottom navigation keep `--safe-bottom-dock: 84px` + `env(safe-area-inset-bottom)` on ≤768px."*

Thực tế trên điện thoại Vivo V2445A:
1. **Bài đọc bị chém đầu ([`vivo-02-reading.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-02-reading.png)):**
   - Thẻ bài đọc "HOW REMOTE WORK IS RESHAPING COMPANY CULTURE" cuộn xuống đáy thì dòng chữ bị thanh bottom navigation dock màu đen đè bẹp dí, cắt ngang thân chữ! Người dùng không tài nào đọc được dòng cuối nếu không cố rướn ngón tay kéo giật màn hình lên.
2. **Thẻ speaking bị cưa đôi ([`vivo-05-speaking.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-05-speaking.png)):**
   - Khung thẻ `[ ] MUNICIPAL INFRASTRUCTURE` bị thanh bottom navigation dock cưa đứt đúng một nửa chiều cao!
3. **Cài đặt bị nuốt chửng ([`vivo-11-settings.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-11-settings.png)):**
   - Dòng mục tiêu `MỤC TIÊU IELTS BAND (TARGET BAND): Band 7.0` lọt thỏm ngay dưới mép thanh dock điều hướng.

*Kết luận:* Các bạn viết token `--safe-bottom-dock: 84px` để làm cảnh! Khi render màn hình thực tế, container cha thiếu `padding-bottom: var(--safe-bottom-dock)` hoặc để `overflow: hidden` khiến thanh dock cố định trở thành một chiếc máy chém nội dung!

---

### TỘI ÁC SỐ 3: Tâm Thần Phân Liệt Ngôn Ngữ & Desktop Copy-Paste Lười Biếng
*Chứng cứ thực tế:* [`vivo-25-placement-quiz.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-25-placement-quiz.png), [`vivo-04-listening.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-04-listening.png), [`vivo-11-settings.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-11-settings.png).

1. **Sự trơ trẽn của Modal Placement Quiz ([`vivo-25-placement-quiz.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-25-placement-quiz.png)):**
   - Hãy nhìn vào bức ảnh này và tự thấy xấu hổ:
     - Kicker: `FIND YOUR STARTING POINT` (100% tiếng Anh)
     - Đoạn văn: *"Takes about 2 minutes with gentle exploratory questions (from A1 to C2). The test stops dynamically as soon as questions exceed your pace so you never feel exhausted. You can adjust your level anytime."* (100% tiếng Anh)
     - NÚT HÀNH ĐỘNG CHÍNH: `Bắt đầu (khoảng 2 phút)` (TIẾNG VIỆT ĐỘT NGỘT!)
     - NÚT HÀNH ĐỘNG PHỤ: `Bỏ qua và bắt đầu ở A1` (TIẾNG VIỆT ĐỘT NGỘT!)
   - Rule 12 trong [`AGENTS.md`](file:///e:/Eng/AGENTS.md) đã ghi bằng mực đen giấy trắng: *"Maintain 100% language consistency across modal cards... never a lone Đóng in an English report"*. Đây là một ví dụ mẫu mực về sự cẩu thả, một nửa Tây một nửa Ta vô cùng thiếu chuyên nghiệp!
2. **Kêu gọi bấm "Phím cách" trên điện thoại cảm ứng ([`vivo-04-listening.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-04-listening.png)):**
   - Dưới khung chép chính tả, ứng dụng in dòng chữ:
     > *"Nghe ít nhất 2 lần trước khi nhấn Phím cách / Lật thẻ để xem phân tích ngữ âm."*
   - **HÃY TỈNH LẠI ĐI! ĐÂY LÀ ĐIỆN THOẠI CẢM ỨNG!** Người dùng đang cầm chiếc Vivo trên tay, lấy đâu ra "Phím cách" (Spacebar) để bấm?! Các bạn bê nguyên một chuỗi text viết cho bàn phím máy tính để bàn ném thẳng vào mặt người dùng di động mà không hề có bộ lọc nhận diện thiết bị!
3. **Nhãn lặp ngớ ngẩn (Redundancy Circus) ([`vivo-11-settings.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-11-settings.png)):**
   - Bộ chọn trình độ CEFR ghi: `A1 (A1)`, `A2 (A2)`, `B1 (B1)`, `B2 (B2)`, `C1 (C1)`, `C2 (C2)`.
   - Viết lặp lại một từ viết tắt trong ngoặc đơn để làm gì? Để người dùng biết chắc rằng A1 chính là A1 à? Một sự thừa thãi ngớ ngẩn làm phí phạm diện tích màn hình.

---

### TỘI ÁC SỐ 4: Vấn Nạn Viền Lồng Viền (Concentric Border Nightmare)
*Chứng cứ thực tế:* [`vivo-24-progression-modal.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-24-progression-modal.png), [`vivo-09-blitz.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-09-blitz.png), [`05-tenses-gauntlet-diagnostic-receipt.png`](file:///e:/Eng/Mobile/flows/08-assessments-diagnostics/05-tenses-gauntlet-diagnostic-receipt.png).

Quy tắc Rule 7 trong [`AGENTS.md`](file:///e:/Eng/AGENTS.md) nghiêm cấm rõ ràng:
> *"No double outlines / concentric borders (never place a bordered card or container directly inside another bordered card/surface; use surface tone shift or elevation instead of nested strokes)."*

Thế nhưng các bạn làm gì trong thực tế?
1. **Modal RPG Tiến trình ([`vivo-24-progression-modal.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-24-progression-modal.png)):**
   - Khung modal lớn bao ngoài có viền trắng mờ -> Bên trong thẻ Hero "TÂN BINH KHỞI ĐẦU" có viền -> Bên trong khung "LVL 1" có viền phát sáng -> Bên trong "CHUỖI 5 NGÀY" có viền -> Xuống phần nhiệm vụ: mỗi một nhiệm vụ lại là một chiếc hộp đóng viền -> Bên trong lại có một badge "+50 XP" đóng viền!
   - **TỔNG CỘNG 5 TẦNG VIỀN ĐỒNG TÂM LỒNG VÀO NHAU!** Giao diện trông như một chuỗi các thùng các-tông lồng nhau, nặng nề, bí bách và ngột ngạt.
2. **Speed Blitz ([`vivo-09-blitz.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-09-blitz.png)):**
   - Thẻ ngoài có viền -> Thẻ "Đồng hồ 60 Giây" có viền -> Thẻ "Hệ số Nhân Chuỗi" có viền. Thay vì dùng nền màu tối hơn hoặc nhạt hơn một chút (`surface tone shift`), các bạn cứ tiện tay phang `border: 1px solid` lên tất cả mọi thứ!

---

### TỘI ÁC SỐ 5: Hội Chợ Neon & Xúc Phạm Biểu Tượng Cấm (Circus of Neon Strokes & The Banned Stars)
*Chứng cứ thực tế:* [`vivo-23-mobile-drawer.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-23-mobile-drawer.png), [`vivo-08-grammar.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-08-grammar.png), [`vivo-05-speaking.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-05-speaking.png).

1. **Xâm phạm quy tắc biểu tượng ngôi sao kim cương (`✦`):**
   - Rule 7 & Rule 100 ghi rõ: *"No decorative diamond stars (`✦`) or black filled stars (`★`) on titles or kickers. Only clean text or 5-pointed white star (`☆`) when semantically necessary."*
   - Thế nhưng:
     - Trên Mobile Drawer ([`vivo-23`](file:///e:/Eng/screenshots/vivo-360x802/vivo-23-mobile-drawer.png)): Tiêu đề chình ình `✦ ĐIỀU KHIỂN DI ĐỘNG`.
     - Trên Grammar ([`vivo-08`](file:///e:/Eng/screenshots/vivo-360x802/vivo-08-grammar.png)): Nút tab đập thẳng vào mắt `✦ 12 Thì Động từ`.
2. **Hội chợ bút chì màu trên Mobile Drawer ([`vivo-23-mobile-drawer.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-23-mobile-drawer.png)):**
   - Mở chiếc drawer ra, người dùng bị hoa mắt bởi một bữa tiệc viền màu hỗn loạn:
     - Nút Quỹ thời gian: viền XANH LÁ MẠ.
     - Nút Ngôn ngữ: viền XANH TÍM NHẠT.
     - Nút Cấp độ: viền XÁM TRO.
     - Nút Phân tích & SERL: viền TÍM HUẾ.
     - Nút 12 Thì: viền XANH DƯƠNG.
     - Nút Kho lỗi sai: viền ĐỎ CAM SAN HÔ.
   - Đây là cái gì? Bảng màu của bộ phim hoạt hình thiếu nhi à? Tinh thần Apple-Calm tối giản, đẳng cấp của các bạn nằm ở đâu khi biến một menu điều khiển thành một bảng đèn led vũ trường rẻ tiền?
3. **Thảm họa viền nét đứt (Dashed Border Anomaly) ([`vivo-05-speaking.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-05-speaking.png)):**
   - Các pill chọn từ: `[ ] TRANSIT-ORIENTED DEVELOPMENT`, `[ ] CARBON FOOTPRINT` sử dụng viền nét đứt (`border: 1px dashed #666`). Nhìn không khác gì một bản mockup nháp bị bỏ dở từ năm 2008!

---

### TỘI ÁC SỐ 6: Thất Bại Toàn Tập Về Affordance & Công Thái Học Nút Bấm
*Chứng cứ thực tế:* [`vivo-12-ielts-home.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-12-ielts-home.png), [`vivo-14-ielts-reading.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-14-ielts-reading.png), [`vivo-18-ielts-writing.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-18-ielts-writing.png), [`vivo-19-ielts-writing-blueprints.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-19-ielts-writing-blueprints.png), [`10-ielts-speaking-simulator-01-top.png`](file:///e:/Eng/Mobile/flows/06-ielts-academic/10-ielts-speaking-simulator-01-top.png).

1. **Bơm phồng kích thước thẻ vô tội vạ ([`vivo-12-ielts-home.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-12-ielts-home.png)):**
   - Thay vì biến toàn bộ thẻ thành nút bấm tương tác (`Card-as-Button`) kèm mũi tên tinh tế 44×44px ở góc trên bên phải theo chuẩn mực Section 12, các bạn nhồi vào đáy mỗi thẻ một chiếc nút bấm to tướng: `Mở lộ trình học`, `Bắt đầu bài kiểm tra năng lực`.
   - Kết quả: Mỗi thẻ bị đội chiều cao lên gần gấp đôi, người dùng mở trang chủ IELTS chỉ thấy được đúng 1 thẻ rưỡi, phải miệt mài cuộn ngón tay để tìm nội dung!
2. **Ngược lại: Giấu tiệt khả năng tương tác (Zero Click Affordance) ([`vivo-14`](file:///e:/Eng/screenshots/vivo-360x802/vivo-14-ielts-reading.png), [`vivo-18`](file:///e:/Eng/screenshots/vivo-360x802/vivo-18-ielts-writing.png)):**
   - Ở các trang Reading và Writing, các thẻ bài tập như `The Evolution of the Printing Press`, `Energy Consumption in Four Countries` lại là những khối hộp đen trơn tuột, KHÔNG CÓ MŨI TÊN, KHÔNG CÓ ICON, KHÔNG CÓ BẤT KỲ DẤU HIỆU NÀO cho thấy chúng có thể bấm vào! Người dùng mới sẽ 100% tưởng đây là các thẻ ghi chú tĩnh (static text) chứ không hề biết đó là bài thi để bấm vào luyện!
3. **Tháp Tab 3 Tầng làm nghẹt thở ([`vivo-19-ielts-writing-blueprints.png`](file:///e:/Eng/screenshots/vivo-360x802/vivo-19-ielts-writing-blueprints.png)):**
   - Hãy nhìn chiều dọc của màn hình Writing Blueprints:
     - Tầng 1: Tabs `Biểu đồ Task 1 (6)`, `Bài luận Task 2 (5)`, `Mệnh đề Chiến thuật`.
     - Tầng 2: Hàng pills chọn dạng: `Line`, `Bar`, `Pie`, `Table`, `Process`.
     - Tầng 3: Nhãn `TASK 1 // LINE` đi kèm nút `Tải Bản vẽ Mẫu Band 8.5`.
   - 3 tầng điều khiển xếp chồng lên nhau ngốn hết hơn 50% diện tích màn hình trước khi người dùng kịp thấy một dòng nội dung của đề bài!
4. **Nút bấm méo mó, mất cân đối ([`10-ielts-speaking-simulator-01-top.png`](file:///e:/Eng/Mobile/flows/06-ielts-academic/10-ielts-speaking-simulator-01-top.png)):**
   - Nút "🔊 Nghe Giám khảo Đặt câu hỏi" màu tím chiếm trọn 100% chiều ngang (full-width), nhưng nút hành động nối tiếp ngay dưới "Câu hỏi Tiếp theo" lại bị co rúm lại còn một nửa chiều ngang nằm lệch hẳn về bên trái! Tại sao một stack 2 nút lại có độ rộng cọc cạch như vậy?

---

## 3. MỆNH LỆNH THI CÔNG KHẮC PHỤC (THE REMEDIATION MANDATE)

Để gột rửa toàn bộ những "vết nhơ thị giác" này và đưa ứng dụng về đúng đẳng cấp vàng đã cam kết, toàn bộ đội ngũ kỹ thuật phải thực thi ngay lập tức 6 chỉ thị sau:

### Chỉ thị 1: Trả Tự Do Cho Màn Hình Đáy (Dock Clearance Absolute Enforcement)
- Mọi view chính có sự hiện diện của fixed bottom nav (`.bottom-nav`, `#hud-overlay`) BẮT BUỘC phải bọc trong một container có:
  ```css
  padding-bottom: calc(var(--safe-bottom-dock, 84px) + env(safe-area-inset-bottom, 16px)) !important;
  box-sizing: border-box;
  ```
- Tuyệt đối không để nội dung cuối cùng của view chạm sát mép thanh điều hướng. Mọi danh sách phải có buffer cuộn tối thiểu 32px cách thanh dock.

### Chỉ thị 2: Tiêu Diệt Cắt Cụt Chữ (Eradicate Ugly Truncations)
- Trên cụm 4 card di động (`Skill Tree Constellation`):
  - XÓA NGAY những phụ đề dài dòng vô bổ như `Hermeneutic & Analytic Intake` hay `Lexical Collocations & Syntactic Architecture`.
  - Thay bằng nhãn ngắn gọn, súc tích chuẩn Apple:
    - Reading: `Đọc hiểu & Phân tích` (hoặc `Comprehension`)
    - Writing: `Cấu trúc & Luận điểm` (hoặc `Composition`)
    - Listening: `Ngữ âm & Chép chính tả` (hoặc `Transcription`)
    - Speaking: `Phản xạ & Lưu loát` (hoặc `Fluency Lab`)
  - Tuyệt đối cấm đặt `max-width` quá hẹp khiến text bị biến thành `Hermeneu...` trên màn hình 360px.
- Sửa ngay lỗi ngắt dòng phân số tại Reading Drills: đặt `white-space: nowrap !important; display: inline-flex;` cho toàn bộ các nhãn telemetry fraction (`0/14`).

### Chỉ thị 3: Dập Tắt Hội Chợ Bút Chì Màu (Purge Circus Strokes & Concentric Borders)
- Trên `Mobile Drawer`: Bỏ ngay toàn bộ 6 màu viền xanh, đỏ, tím, vàng lòe loẹt. Toàn bộ các nút danh mục trong drawer phải tuân thủ nghiêm ngặt chuẩn nền chuyển sắc nhẹ:
  ```css
  background: var(--bg-card);
  border: 1px solid var(--border-hairline);
  color: var(--ink-primary);
  ```
  Chỉ dùng icon để biểu đạt ngữ nghĩa, không dùng viền màu neon.
- Xóa bỏ triệt để viền nét đứt `border: dashed`. Mọi chip từ vựng phải dùng surface mềm: `background: var(--bg-surface-raised); border: 1px solid var(--border-hairline); border-radius: var(--radius-pill);`.
- Diệt trừ viền đồng tâm (Rule 7): Khi một card nằm trong một container đã có viền, card con PHẢI bỏ `border`, chỉ dùng chênh lệch sắc độ nền (`background: rgba(255,255,255, 0.03);`).

### Chỉ thị 4: Thanh Trừng Biểu Tượng Cấm (`✦`)
- Quét toàn bộ codebase (HTML, TypeScript, CSS) và xóa sạch ký tự `✦` ở tất cả các tiêu đề, drawer và nút bấm (`✦ ĐIỀU KHIỂN DI ĐỘNG` -> `ĐIỀU KHIỂN`, `✦ 12 Thì Động từ` -> `12 Thì Động từ`).

### Chỉ thị 5: Đồng Nhất 100% Ngôn Ngữ & Làm Sạch Chuỗi Văn Bản
- Sửa ngay lập tức Modal Placement Quiz:
  - Nếu người dùng đang chọn giao diện tiếng Việt (`vi`): Tiêu đề và nội dung PHẢI là tiếng Việt chuẩn mực.
  - Nếu đang ở giao diện tiếng Anh (`en`): Nút bấm PHẢI là `Start (approx. 2 mins)` và `Skip & Start at A1`. Tuyệt đối cấm việc thân bài tiếng Anh nhưng nút bấm tiếng Việt!
- Xóa bỏ chuỗi text hướng dẫn desktop trên mobile: Kiểm tra `isMobile` hoặc `hasTouch`. Nếu trên mobile, cấm tiệt từ `Phím cách`, chỉ hiển thị `Chạm để lật thẻ`.
- Sửa nhãn lặp ngớ ngẩn ở Settings: Đổi `A1 (A1)` thành `A1 - Căn bản`, `B2 (B2)` thành `B2 - Trung cấp`, hoặc chỉ để duy nhất nhãn cấp độ `A1`, `A2`, `B1`, `B2`, `C1`, `C2`.

### Chỉ thị 6: Chuẩn Hóa Card-as-Button & Cân Bằng Nút Bấm
- Áp dụng triệt để Section 12 trên toàn bộ các hub:
  - Thẻ danh sách bài học (IELTS Home, Reading, Writing): Bắt buộc có affordance mũi tên `→` kích thước tối thiểu 44×44px ở góc trên bên phải hoặc bên phải thẻ.
  - Loại bỏ các nút bấm full-width thừa thãi nằm bên trong card danh mục làm phình chiều cao thẻ.
  - Nút bấm theo cặp (như trong Speaking Simulator): Cả hai nút phải có cùng độ rộng hoặc được xếp vào một flex container cân đối (`display: flex; gap: 12px;` hoặc cả hai cùng `width: 100%`).

---

## LỜI KẾT

Một sản phẩm giáo dục đỉnh cao không chỉ nằm ở kho dữ liệu Cambridge hay thuật toán chia thì phức tạp. Nó nằm ở sự tôn trọng tối thượng đối với đôi mắt và ngón tay của người học. Đừng bắt học viên phải căng mắt dịch những đoạn chữ bị cắt cụt, đừng bắt họ mò mẫm dưới thanh navigation bị che lấp, và đừng tra tấn thị giác của họ bằng một giao diện màu sắc vô kỷ luật.

Bản báo cáo này là phát súng lệnh. Hãy sửa đổi ngay lập tức!

