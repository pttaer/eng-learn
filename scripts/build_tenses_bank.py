#!/usr/bin/env python3
"""
build_tenses_bank.py
Builds the canonical 12 Tenses Master Guide & Question Bank for English Singularity.
Combines existing grammar items from grammar.json with authentic, calibrated MCQs for all 12 tenses.
"""

import json
import os

TENSES_METADATA = [
    {
        "id": "present-simple",
        "family": "PRESENT",
        "name": "Present Simple",
        "vietnameseName": "Hiện Tại Đơn",
        "formula": {
            "affirmative": "S + V(s/es)",
            "negative": "S + do/does not + V-inf",
            "interrogative": "Do/Does + S + V-inf?"
        },
        "signals": ["always", "usually", "often", "sometimes", "rarely", "never", "every day", "on Mondays", "once a week"],
        "coreUsage": "Diễn tả thói quen lặp đi lặp lại, sự thật hiển nhiên, chân lý khoa học, hoặc lịch trình cố định của tàu xe.",
        "commonPitfall": "Quên thêm s/es ở ngôi thứ ba số ít (he, she, it) hoặc dùng nhầm động từ to be kèm động từ thường (*He is work*).",
        "example": "Water boils at 100 degrees Celsius."
    },
    {
        "id": "present-continuous",
        "family": "PRESENT",
        "name": "Present Continuous",
        "vietnameseName": "Hiện Tại Tiếp Diễn",
        "formula": {
            "affirmative": "S + am/is/are + V-ing",
            "negative": "S + am/is/are not + V-ing",
            "interrogative": "Am/Is/Are + S + V-ing?"
        },
        "signals": ["now", "right now", "at the moment", "currently", "Look!", "Listen!", "at present"],
        "coreUsage": "Hành động đang diễn ra ngay lúc nói, tình trạng tạm thời, hoặc phàn nàn thói xấu lặp lại gây khó chịu (với always).",
        "commonPitfall": "Dùng thì này với các động từ chỉ tri giác / trạng thái (stative verbs: like, know, understand, believe, want).",
        "example": "She is preparing the quarterly financial report at the moment."
    },
    {
        "id": "present-perfect",
        "family": "PRESENT",
        "name": "Present Perfect",
        "vietnameseName": "Hiện Tại Hoàn Thành",
        "formula": {
            "affirmative": "S + have/has + V3/ed",
            "negative": "S + have/has not + V3/ed",
            "interrogative": "Have/Has + S + V3/ed?"
        },
        "signals": ["already", "yet", "just", "ever", "never", "since", "for", "recently", "so far", "up to now"],
        "coreUsage": "Hành động xảy ra trong quá khứ không rõ thời điểm nhưng kết quả còn thấy ở hiện tại; trải nghiệm cuộc đời; bắt đầu ở quá khứ kéo dài đến nay.",
        "commonPitfall": "Dùng mốc thời gian quá khứ xác định (yesterday, in 2020) với thì hoàn thành (phải dùng Past Simple thay thế).",
        "example": "Our research team has published three empirical studies this year."
    },
    {
        "id": "present-perfect-continuous",
        "family": "PRESENT",
        "name": "Present Perfect Continuous",
        "vietnameseName": "Hiện Tại Hoàn Thành Tiếp Diễn",
        "formula": {
            "affirmative": "S + have/has + been + V-ing",
            "negative": "S + have/has not + been + V-ing",
            "interrogative": "Have/Has + S + been + V-ing?"
        },
        "signals": ["all day", "all morning", "for 5 hours", "how long", "since 7 AM"],
        "coreUsage": "Nhấn mạnh tính liên tục không đứt đoạn của hành động bắt đầu trong quá khứ và vẫn đang tiếp diễn ở hiện tại.",
        "commonPitfall": "Nhầm lẫn với Present Perfect: Present Perfect nhấn mạnh 'kết quả / số lượng', còn Present Perfect Continuous nhấn mạnh 'quá trình / thời gian'.",
        "example": "He has been debugging that distributed server algorithm for five hours straight."
    },
    {
        "id": "past-simple",
        "family": "PAST",
        "name": "Past Simple",
        "vietnameseName": "Quá Khứ Đơn",
        "formula": {
            "affirmative": "S + V2/ed",
            "negative": "S + did not + V-inf",
            "interrogative": "Did + S + V-inf?"
        },
        "signals": ["yesterday", "ago", "last night", "last week", "in 1995", "when I was young"],
        "coreUsage": "Hành động đã bắt đầu và kết thúc hoàn toàn tại một thời điểm xác định trong quá khứ.",
        "commonPitfall": "Quên đưa động từ về nguyên thể khi đã mượn trợ động từ *did not* hoặc trong câu hỏi *Did you...?*",
        "example": "The committee approved the revised environmental directive yesterday."
    },
    {
        "id": "past-continuous",
        "family": "PAST",
        "name": "Past Continuous",
        "vietnameseName": "Quá Khứ Tiếp Diễn",
        "formula": {
            "affirmative": "S + was/were + V-ing",
            "negative": "S + was/were not + V-ing",
            "interrogative": "Was/Were + S + V-ing?"
        },
        "signals": ["at 8 PM yesterday", "at that moment", "while", "when", "as"],
        "coreUsage": "Hành động đang diễn ra tại một thời điểm cụ thể trong quá khứ, hoặc đang diễn ra thì hành động khác chen ngang.",
        "commonPitfall": "Nhầm lẫn giữa *when* và *while*: *While* thường đi với hành động kéo dài (Past Continuous), *When* đi với hành động cắt ngang (Past Simple).",
        "example": "While the lead engineer was explaining the architecture, the power went out."
    },
    {
        "id": "past-perfect",
        "family": "PAST",
        "name": "Past Perfect",
        "vietnameseName": "Quá Khứ Hoàn Thành",
        "formula": {
            "affirmative": "S + had + V3/ed",
            "negative": "S + had not + V3/ed",
            "interrogative": "Had + S + V3/ed?"
        },
        "signals": ["by the time", "before", "after", "by 2018", "as soon as", "until then"],
        "coreUsage": "Hành động xảy ra và hoàn tất trước một hành động khác trong quá khứ (hành động trước dùng Past Perfect, hành động sau dùng Past Simple).",
        "commonPitfall": "Lạm dụng Past Perfect khi hai hành động diễn ra nối tiếp nhau đơn thuần (chỉ dùng Past Simple theo thứ tự thời gian).",
        "example": "By the time the paramedics arrived, the patient had already regained consciousness."
    },
    {
        "id": "past-perfect-continuous",
        "family": "PAST",
        "name": "Past Perfect Continuous",
        "vietnameseName": "Quá Khứ Hoàn Thành Tiếp Diễn",
        "formula": {
            "affirmative": "S + had + been + V-ing",
            "negative": "S + had not + been + V-ing",
            "interrogative": "Had + S + been + V-ing?"
        },
        "signals": ["for two hours before", "until that day", "how long had you been"],
        "coreUsage": "Nhấn mạnh quá trình liên tục của một hành động xảy ra trước và kéo dài đến một thời điểm khác trong quá khứ.",
        "commonPitfall": "Nhầm lẫn với Past Continuous: Past Perfect Continuous nêu rõ khoảng thời gian kéo dài (for/since) trước mốc quá khứ.",
        "example": "They had been negotiating the treaty for six months before reaching a breakthrough."
    },
    {
        "id": "future-simple",
        "family": "FUTURE",
        "name": "Future Simple",
        "vietnameseName": "Tương Lai Đơn",
        "formula": {
            "affirmative": "S + will + V-inf",
            "negative": "S + will not (won't) + V-inf",
            "interrogative": "Will + S + V-inf?"
        },
        "signals": ["tomorrow", "next week", "soon", "in the future", "I think", "probably", "perhaps"],
        "coreUsage": "Quyết định bột phát nảy ra ngay lúc nói, lời hứa hẹn, đề nghị giúp đỡ, hoặc dự đoán chủ quan không có căn cứ.",
        "commonPitfall": "Dùng *will* cho những kế hoạch đã có lịch trình, bàn bạc sẵn từ trước (phải dùng *be going to* hoặc Present Continuous).",
        "example": "I will send you the finalized spreadsheet as soon as I finish the review."
    },
    {
        "id": "future-continuous",
        "family": "FUTURE",
        "name": "Future Continuous",
        "vietnameseName": "Tương Lai Tiếp Diễn",
        "formula": {
            "affirmative": "S + will + be + V-ing",
            "negative": "S + will not + be + V-ing",
            "interrogative": "Will + S + be + V-ing?"
        },
        "signals": ["at this time tomorrow", "at 9 AM next Monday", "this time next week"],
        "coreUsage": "Hành động sẽ đang diễn ra tại một thời điểm hoặc khoảng thời gian xác định cụ thể trong tương lai.",
        "commonPitfall": "Quên động từ nguyên thể 'be' sau *will*, viết sai thành *will V-ing*.",
        "example": "At this time tomorrow, the delegation will be flying over the Atlantic."
    },
    {
        "id": "future-perfect",
        "family": "FUTURE",
        "name": "Future Perfect",
        "vietnameseName": "Tương Lai Hoàn Thành",
        "formula": {
            "affirmative": "S + will + have + V3/ed",
            "negative": "S + will not + have + V3/ed",
            "interrogative": "Will + S + have + V3/ed?"
        },
        "signals": ["by tomorrow", "by the end of this month", "by 2030", "by the time + Present Simple"],
        "coreUsage": "Hành động sẽ được hoàn tất trước một mốc thời gian hoặc trước một hành động khác trong tương lai.",
        "commonPitfall": "Dùng thì tương lai sau liên từ thời gian *by the time* (phải dùng Present Simple: *by the time you arrive*, không dùng *by the time you will arrive*).",
        "example": "By the end of this decade, artificial intelligence will have transformed medical diagnostics."
    },
    {
        "id": "future-perfect-continuous",
        "family": "FUTURE",
        "name": "Future Perfect Continuous",
        "vietnameseName": "Tương Lai Hoàn Thành Tiếp Diễn",
        "formula": {
            "affirmative": "S + will + have + been + V-ing",
            "negative": "S + will not + have + been + V-ing",
            "interrogative": "Will + S + have + been + V-ing?"
        },
        "signals": ["by next year... for 10 years", "by the time... for", "by November"],
        "coreUsage": "Nhấn mạnh khoảng thời gian kéo dài liên tục của một hành động tính đến một mốc thời gian trong tương lai.",
        "commonPitfall": "Đây là thì ít gặp nhất trong giao tiếp nhưng xuất hiện trong các bài thi học thuật để kiểm tra độ chính xác thời gian.",
        "example": "By next month, Dr. Nguyen will have been teaching at Oxford University for 25 years."
    }
]

# Curated, authentic question bank covering all 12 tenses with realistic signal keywords
QUESTIONS = [
    # 1. Present Simple
    {
        "id": "q-pres-sim-1",
        "tenseId": "present-simple",
        "tenseName": "Present Simple",
        "family": "PRESENT",
        "prompt": "Dr. Sarah always _____ her clinic at precisely 7:30 every morning.",
        "blankTarget": "opens",
        "options": ["opens", "is opening", "has opened", "opened"],
        "answer": 0,
        "signal": "always, every morning",
        "explanation": "'always' and 'every morning' denote a habitual routine, demanding Present Simple with third-person singular suffix '-s'.",
        "vietnameseExplanation": "Trạng từ 'always' và 'every morning' chỉ thói quen lặp đi lặp lại hằng ngày, chủ ngữ ngôi thứ ba số ít (Dr. Sarah) đi với động từ thêm 's' (opens)."
    },
    {
        "id": "q-pres-sim-2",
        "tenseId": "present-simple",
        "tenseName": "Present Simple",
        "family": "PRESENT",
        "prompt": "The flight to Tokyo _____ at 10:15 tomorrow morning according to the airport schedule.",
        "blankTarget": "departs",
        "options": ["will depart", "departs", "is departing", "has departed"],
        "answer": 1,
        "signal": "at 10:15 tomorrow, according to the airport schedule",
        "explanation": "Fixed official timetables and public schedules (planes, trains) use Present Simple even when referring to future events.",
        "vietnameseExplanation": "Lịch trình tàu xe, máy bay cố định (timetables) sử dụng thì Hiện Tại Đơn để diễn đạt sự việc trong tương lai."
    },
    {
        "id": "q-pres-sim-3",
        "tenseId": "present-simple",
        "tenseName": "Present Simple",
        "family": "PRESENT",
        "prompt": "Water _____ at zero degrees Celsius under standard atmospheric pressure.",
        "blankTarget": "freezes",
        "options": ["freezes", "is freezing", "will freeze", "has frozen"],
        "answer": 0,
        "signal": "universal scientific fact",
        "explanation": "Universal scientific truths and physical laws are expressed using Present Simple.",
        "vietnameseExplanation": "Quy luật vật lý và chân lý khoa học hiển nhiên luôn chia ở thì Hiện Tại Đơn."
    },
    {
        "id": "q-pres-sim-4",
        "tenseId": "present-simple",
        "tenseName": "Present Simple",
        "family": "PRESENT",
        "prompt": "Our department head _____ not approve overtime requests unless submitted 48 hours in advance.",
        "blankTarget": "does",
        "options": ["is", "does", "do", "has"],
        "answer": 1,
        "signal": "habitual policy rule",
        "explanation": "Negative present simple with third-person singular subject requires the auxiliary 'does not'.",
        "vietnameseExplanation": "Câu phủ định Hiện Tại Đơn với chủ ngữ số ít (department head) cần mượn trợ động từ 'does not'."
    },
    {
        "id": "q-pres-sim-5",
        "tenseId": "present-simple",
        "tenseName": "Present Simple",
        "family": "PRESENT",
        "prompt": "How often _____ your manager conduct performance evaluation reviews?",
        "blankTarget": "does",
        "options": ["does", "is", "has", "did"],
        "answer": 0,
        "signal": "How often",
        "explanation": "'How often' queries frequency of occurrence, requiring auxiliary 'does' for singular subject 'manager'.",
        "vietnameseExplanation": "'How often' hỏi về tần suất định kỳ, câu hỏi Hiện Tại Đơn chủ ngữ số ít cần trợ động từ 'does'."
    },

    # 2. Present Continuous
    {
        "id": "q-pres-con-1",
        "tenseId": "present-continuous",
        "tenseName": "Present Continuous",
        "family": "PRESENT",
        "prompt": "Please keep your voice down; the delegates _____ the bilateral trade agreement in the boardroom right now.",
        "blankTarget": "are discussing",
        "options": ["discuss", "are discussing", "have discussed", "discussed"],
        "answer": 1,
        "signal": "right now, Please keep your voice down",
        "explanation": "'right now' and the imperative cue indicate an action in progress at the exact moment of utterance.",
        "vietnameseExplanation": "'right now' và lời nhắc giữ trật tự cho thấy cuộc họp đang diễn ra ngay lúc nói $\\rightarrow$ Hiện Tại Tiếp Diễn."
    },
    {
        "id": "q-pres-con-2",
        "tenseId": "present-continuous",
        "tenseName": "Present Continuous",
        "family": "PRESENT",
        "prompt": "Global temperatures _____ at an unprecedented rate due to carbon emissions.",
        "blankTarget": "are rising",
        "options": ["rise", "are rising", "have risen", "rose"],
        "answer": 1,
        "signal": "at an unprecedented rate (ongoing changing trend)",
        "explanation": "Gradual trends and evolving global changes in progress require Present Continuous.",
        "vietnameseExplanation": "Các xu hướng biến đổi đang tiếp diễn của thời đại (changing situations) sử dụng Hiện Tại Tiếp Diễn."
    },
    {
        "id": "q-pres-con-3",
        "tenseId": "present-continuous",
        "tenseName": "Present Continuous",
        "family": "PRESENT",
        "prompt": "Look! The technicians _____ the backup power generators outside.",
        "blankTarget": "are testing",
        "options": ["test", "are testing", "tested", "have tested"],
        "answer": 1,
        "signal": "Look!",
        "explanation": "Exclamatory sensory cues like 'Look!' or 'Listen!' alert to an action occurring in the present sensory field.",
        "vietnameseExplanation": "Câu cảm thán 'Look!' báo hiệu hành động đang diễn ra trước mắt $\\rightarrow$ Hiện Tại Tiếp Diễn."
    },
    {
        "id": "q-pres-con-4",
        "tenseId": "present-continuous",
        "tenseName": "Present Continuous",
        "family": "PRESENT",
        "prompt": "He is _____ complaining about his workload, which really demoralizes the team.",
        "blankTarget": "constantly",
        "options": ["seldom", "constantly", "never", "once"],
        "answer": 1,
        "signal": "is complaining (expressing annoyance)",
        "explanation": "Present continuous coupled with 'constantly' or 'always' emphasizes an annoying, repetitive habit.",
        "vietnameseExplanation": "Hiện Tại Tiếp Diễn kết hợp với 'constantly/always' diễn tả lời phàn nàn về một thói quen xấu gây khó chịu."
    },

    # 3. Present Perfect
    {
        "id": "q-pres-prf-1",
        "tenseId": "present-perfect",
        "tenseName": "Present Perfect",
        "family": "PRESENT",
        "prompt": "The engineering department _____ three comprehensive audits since January.",
        "blankTarget": "has completed",
        "options": ["completed", "has completed", "is completing", "completes"],
        "answer": 1,
        "signal": "since January",
        "explanation": "'since January' anchors a duration starting in the past and linking directly to the present, requiring Present Perfect.",
        "vietnameseExplanation": "Cụm 'since January' (từ tháng 1 đến nay) là dấu hiệu kinh điển của thì Hiện Tại Hoàn Thành."
    },
    {
        "id": "q-pres-prf-2",
        "tenseId": "present-perfect",
        "tenseName": "Present Perfect",
        "family": "PRESENT",
        "prompt": "Have you received the updated terms of service _____?",
        "blankTarget": "yet",
        "options": ["already", "yet", "since", "just"],
        "answer": 1,
        "signal": "question at the end of sentence",
        "explanation": "'yet' is utilized in questions and negative statements to query whether an expected action has occurred.",
        "vietnameseExplanation": "'yet' đứng ở cuối câu hỏi và câu phủ định để hỏi xem sự việc mong đợi đã xảy ra hay chưa."
    },
    {
        "id": "q-pres-prf-3",
        "tenseId": "present-perfect",
        "tenseName": "Present Perfect",
        "family": "PRESENT",
        "prompt": "Our primary server has _____ restarted, so full functionality should be restored within minutes.",
        "blankTarget": "just",
        "options": ["yet", "ago", "just", "ever"],
        "answer": 2,
        "signal": "has just restarted (immediate past with present relevance)",
        "explanation": "'just' fits between the auxiliary 'has' and past participle to signal an action concluded moments prior.",
        "vietnameseExplanation": "'just' đứng giữa have/has và V3 để chỉ một hành động vừa mới xảy ra tức thì."
    },
    {
        "id": "q-pres-prf-4",
        "tenseId": "present-perfect",
        "tenseName": "Present Perfect",
        "family": "PRESENT",
        "prompt": "This is the most intricate algorithm I have _____ encountered in my career.",
        "blankTarget": "ever",
        "options": ["never", "ever", "yet", "already"],
        "answer": 1,
        "signal": "This is the most + superlative",
        "explanation": "Superlative structures ('This is the most...') customarily take a Present Perfect clause with 'ever'.",
        "vietnameseExplanation": "Cấu trúc so sánh nhất ('This is the most...') đi kèm mệnh đề Hiện Tại Hoàn Thành với 'ever' (từng trải nghiệm)."
    },

    # 4. Present Perfect Continuous
    {
        "id": "q-pres-pfc-1",
        "tenseId": "present-perfect-continuous",
        "tenseName": "Present Perfect Continuous",
        "family": "PRESENT",
        "prompt": "The legal analysts _____ the contract for four hours, and they still haven't finished the clauses.",
        "blankTarget": "have been scrutinizing",
        "options": ["scrutinized", "have scrutinized", "have been scrutinizing", "are scrutinizing"],
        "answer": 2,
        "signal": "for four hours, and they still haven't finished",
        "explanation": "The continuation clause 'and they still haven't finished' proves ongoing duration, making Present Perfect Continuous essential.",
        "vietnameseExplanation": "Vế sau 'and they still haven't finished' chứng minh hành động đọc hợp đồng đã kéo dài 4 tiếng và vẫn chưa xong."
    },
    {
        "id": "q-pres-pfc-2",
        "tenseId": "present-perfect-continuous",
        "tenseName": "Present Perfect Continuous",
        "family": "PRESENT",
        "prompt": "Why are your clothes soaking wet? — I _____ the company garden in the rain.",
        "blankTarget": "have been tending",
        "options": ["tended", "had tended", "have been tending", "tend"],
        "answer": 2,
        "signal": "Why are your clothes soaking wet? (present visible evidence)",
        "explanation": "A present visible consequence ('clothes soaking wet') resulting from a prolonged recent activity requires Present Perfect Continuous.",
        "vietnameseExplanation": "Hậu quả nhãn tiền ở hiện tại (quần áo ướt sũng) do một hành động kéo dài liên tục vừa mới xảy ra $\\rightarrow$ Hiện Tại Hoàn Thành Tiếp Diễn."
    },
    {
        "id": "q-pres-pfc-3",
        "tenseId": "present-perfect-continuous",
        "tenseName": "Present Perfect Continuous",
        "family": "PRESENT",
        "prompt": "How long _____ you been studying computational linguistics?",
        "blankTarget": "have",
        "options": ["did", "have", "were", "had"],
        "answer": 1,
        "signal": "How long... been studying",
        "explanation": "'How long have you been V-ing' is the canonical question formula to ask about duration of an ongoing study or profession.",
        "vietnameseExplanation": "Cấu trúc hỏi thời lượng việc đang làm: 'How long have you been + V-ing?'."
    },

    # 5. Past Simple
    {
        "id": "q-past-sim-1",
        "tenseId": "past-simple",
        "tenseName": "Past Simple",
        "family": "PAST",
        "prompt": "The founder _____ the technology venture in 2012 before selling it five years later.",
        "blankTarget": "established",
        "options": ["has established", "establishes", "established", "had established"],
        "answer": 2,
        "signal": "in 2012",
        "explanation": "Specific past calendar years ('in 2012') restrict the predicate exclusively to Past Simple.",
        "vietnameseExplanation": "Mốc thời gian xác định trong quá khứ 'in 2012' bắt buộc chia ở thì Quá Khứ Đơn (established)."
    },
    {
        "id": "q-past-sim-2",
        "tenseId": "past-simple",
        "tenseName": "Past Simple",
        "family": "PAST",
        "prompt": "Why _____ the lead architect reject the preliminary blueprints during yesterday's briefing?",
        "blankTarget": "did",
        "options": ["did", "does", "had", "was"],
        "answer": 0,
        "signal": "yesterday's briefing",
        "explanation": "Questions in the past simple require the past auxiliary 'did' regardless of the subject's person.",
        "vietnameseExplanation": "Câu hỏi thời quá khứ có trạng từ 'yesterday' cần mượn trợ động từ 'did'."
    },
    {
        "id": "q-past-sim-3",
        "tenseId": "past-simple",
        "tenseName": "Past Simple",
        "family": "PAST",
        "prompt": "Although they arrived late, they _____ not miss the keynote presentation.",
        "blankTarget": "did",
        "options": ["do", "did", "were", "had"],
        "answer": 1,
        "signal": "arrived late (past narrative)",
        "explanation": "The coordinating past clause 'Although they arrived' maintains syntactic tense congruence with 'did not miss'.",
        "vietnameseExplanation": "Sự đồng nhất về thì trong câu quá khứ: vế đầu dùng 'arrived', vế sau phủ định dùng 'did not miss'."
    },

    # 6. Past Continuous
    {
        "id": "q-past-con-1",
        "tenseId": "past-continuous",
        "tenseName": "Past Continuous",
        "family": "PAST",
        "prompt": "At exactly 8:30 PM last night, the security team _____ the perimeter cameras.",
        "blankTarget": "was recalibrating",
        "options": ["recalibrated", "was recalibrating", "has recalibrated", "is recalibrating"],
        "answer": 1,
        "signal": "At exactly 8:30 PM last night",
        "explanation": "A precise clock timestamp in the past ('At exactly 8:30 PM last night') requires Past Continuous.",
        "vietnameseExplanation": "Một thời điểm chính xác cụ thể trong quá khứ (8:30 tối qua) bắt buộc chia thì Quá Khứ Tiếp Diễn."
    },
    {
        "id": "q-past-con-2",
        "tenseId": "past-continuous",
        "tenseName": "Past Continuous",
        "family": "PAST",
        "prompt": "While the lead economist _____ the statistical model, an unexpected anomaly emerged.",
        "blankTarget": "was testing",
        "options": ["tests", "was testing", "tested", "has tested"],
        "answer": 1,
        "signal": "While, anomaly emerged (past simple interrupt)",
        "explanation": "'While' introduces a background duration (Past Continuous) interrupted by a sudden discrete event ('emerged').",
        "vietnameseExplanation": "Hành động đang diễn ra (kiểm thử mô hình) thì hành động khác xen vào (xuất hiện sự cố) $\\rightarrow$ vế While chia Quá Khứ Tiếp Diễn."
    },
    {
        "id": "q-past-con-3",
        "tenseId": "past-continuous",
        "tenseName": "Past Continuous",
        "family": "PAST",
        "prompt": "The children were studying in the library while their parents _____ the academic counselor.",
        "blankTarget": "were consulting",
        "options": ["consulted", "were consulting", "had consulted", "are consulting"],
        "answer": 1,
        "signal": "were studying... while... (two parallel past ongoing actions)",
        "explanation": "Two simultaneous ongoing actions happening in parallel in the past both take Past Continuous.",
        "vietnameseExplanation": "Hai hành động xảy ra song song đồng thời trong quá khứ nối bằng 'while' đều chia Quá Khứ Tiếp Diễn."
    },

    # 7. Past Perfect
    {
        "id": "q-past-prf-1",
        "tenseId": "past-perfect",
        "tenseName": "Past Perfect",
        "family": "PAST",
        "prompt": "By the time the fire department arrived at the scene, the security staff _____ the entire floor.",
        "blankTarget": "had evacuated",
        "options": ["evacuated", "had evacuated", "was evacuating", "has evacuated"],
        "answer": 1,
        "signal": "By the time + Past Simple",
        "explanation": "'By the time + Past Simple' dictates that the primary event occurred prior to that past point, necessitating Past Perfect.",
        "vietnameseExplanation": "'By the time' đi với Quá Khứ Đơn thì mệnh đề chính diễn tả hành động xảy ra trước đó phải chia Quá Khứ Hoàn Thành."
    },
    {
        "id": "q-past-prf-2",
        "tenseId": "past-perfect",
        "tenseName": "Past Perfect",
        "family": "PAST",
        "prompt": "She discovered that someone _____ unauthorized modifications to the database before the audit started.",
        "blankTarget": "had made",
        "options": ["made", "had made", "was making", "has made"],
        "answer": 1,
        "signal": "before the audit started",
        "explanation": "An action occurring earlier than a past point of discovery ('discovered... before the audit started') requires Past Perfect.",
        "vietnameseExplanation": "Hành động sửa đổi database xảy ra trước khi phát hiện và trước khi kiểm toán bắt đầu $\\rightarrow$ Quá Khứ Hoàn Thành."
    },
    {
        "id": "q-past-prf-3",
        "tenseId": "past-perfect",
        "tenseName": "Past Perfect",
        "family": "PAST",
        "prompt": "Hardly _____ the conference begun when a technical malfunction disrupted the broadcast.",
        "blankTarget": "had",
        "options": ["did", "was", "had", "has"],
        "answer": 2,
        "signal": "Hardly... when (inversion)",
        "explanation": "Inversion formula 'Hardly + had + S + V3... when + Past Simple' indicates an immediate sequence in the past.",
        "vietnameseExplanation": "Cấu trúc đảo ngữ chỉ hành động vừa mới xảy ra thì hành động khác ập tới: 'Hardly had + S + V3 when + Past Simple'."
    },

    # 8. Past Perfect Continuous
    {
        "id": "q-past-pfc-1",
        "tenseId": "past-perfect-continuous",
        "tenseName": "Past Perfect Continuous",
        "family": "PAST",
        "prompt": "The team _____ on the cryptographic protocol for eighteen months before they finally secured the patent.",
        "blankTarget": "had been working",
        "options": ["worked", "was working", "had been working", "has been working"],
        "answer": 2,
        "signal": "for eighteen months before they finally secured",
        "explanation": "Emphasizes the duration of an ongoing effort that preceded a definitive past milestone ('before they secured').",
        "vietnameseExplanation": "Nhấn mạnh quá trình nghiên cứu liên tục suốt 18 tháng trước thời điểm nhận được bằng sáng chế trong quá khứ."
    },
    {
        "id": "q-past-pfc-2",
        "tenseId": "past-perfect-continuous",
        "tenseName": "Past Perfect Continuous",
        "family": "PAST",
        "prompt": "Her voice was raspy because she _____ for three consecutive hours at the symposium.",
        "blankTarget": "had been lecturing",
        "options": ["lectured", "was lecturing", "had been lecturing", "has lectured"],
        "answer": 2,
        "signal": "Her voice was raspy (past consequence) because she... for three hours",
        "explanation": "A past tangible state ('voice was raspy') caused by an ongoing prior activity requires Past Perfect Continuous.",
        "vietnameseExplanation": "Hậu quả trong quá khứ (giọng bị khàn) do đã diễn thuyết liên tục suốt 3 tiếng trước đó $\\rightarrow$ Quá Khứ Hoàn Thành Tiếp Diễn."
    },

    # 9. Future Simple
    {
        "id": "q-fut-sim-1",
        "tenseId": "future-simple",
        "tenseName": "Future Simple",
        "family": "FUTURE",
        "prompt": "I completely forgot to send the receipt! Don't worry, I _____ it to you right away.",
        "blankTarget": "will email",
        "options": ["email", "will email", "am emailing", "have emailed"],
        "answer": 1,
        "signal": "Don't worry, I... right away (spontaneous decision)",
        "explanation": "Spontaneous decisions made at the instant of speech are expressed with 'will + V-inf'.",
        "vietnameseExplanation": "Quyết định bột phát nảy ra ngay tại thời điểm nói ('Quên gửi, để tôi gửi ngay') dùng Tương Lai Đơn với 'will'."
    },
    {
        "id": "q-fut-sim-2",
        "tenseId": "future-simple",
        "tenseName": "Future Simple",
        "family": "FUTURE",
        "prompt": "Political analysts predict that consumer confidence _____ within the coming quarter.",
        "blankTarget": "will rebound",
        "options": ["rebounds", "will rebound", "is rebounding", "rebounded"],
        "answer": 1,
        "signal": "predict that... within the coming quarter",
        "explanation": "Subjective speculative predictions about future conditions typically employ Future Simple with 'will'.",
        "vietnameseExplanation": "Dự đoán chủ quan về tình hình tương lai sau các động từ như 'predict', 'think', 'believe' đi với 'will'."
    },
    {
        "id": "q-fut-sim-3",
        "tenseId": "future-simple",
        "tenseName": "Future Simple",
        "family": "FUTURE",
        "prompt": "I promise I _____ never disclose the proprietary source code to any third party.",
        "blankTarget": "will",
        "options": ["will", "am", "do", "have"],
        "answer": 0,
        "signal": "I promise",
        "explanation": "Promises and binding commitments consistently use 'will + base verb'.",
        "vietnameseExplanation": "Lời hứa trang trọng ('I promise') luôn đi kèm với trợ động từ 'will'."
    },

    # 10. Future Continuous
    {
        "id": "q-fut-con-1",
        "tenseId": "future-continuous",
        "tenseName": "Future Continuous",
        "family": "FUTURE",
        "prompt": "This time next week, we _____ through the Scandinavian fjords on our holiday.",
        "blankTarget": "will be cruising",
        "options": ["will cruise", "will be cruising", "cruise", "will have cruised"],
        "answer": 1,
        "signal": "This time next week",
        "explanation": "'This time next week' specifies a continuous scene in progress at a future moment, requiring Future Continuous.",
        "vietnameseExplanation": "'This time next week' (giờ này tuần sau) chỉ một hành động sẽ đang diễn ra tại thời điểm đó trong tương lai."
    },
    {
        "id": "q-fut-con-2",
        "tenseId": "future-continuous",
        "tenseName": "Future Continuous",
        "family": "FUTURE",
        "prompt": "Please don't call the director at 10 AM tomorrow; she _____ a board meeting at that time.",
        "blankTarget": "will be chairing",
        "options": ["chairs", "will be chairing", "chaired", "will chair"],
        "answer": 1,
        "signal": "at 10 AM tomorrow, at that time",
        "explanation": "Specifying a specific future clock time when an action will be underway demands Future Continuous.",
        "vietnameseExplanation": "Tại một mốc giờ cụ thể trong tương lai (10h sáng mai) hành động sẽ đang diễn ra $\\rightarrow$ Tương Lai Tiếp Diễn."
    },

    # 11. Future Perfect
    {
        "id": "q-fut-prf-1",
        "tenseId": "future-perfect",
        "tenseName": "Future Perfect",
        "family": "FUTURE",
        "prompt": "By the end of the fiscal year, our infrastructure team _____ the migration to the cloud.",
        "blankTarget": "will have completed",
        "options": ["will complete", "will have completed", "completes", "will be completing"],
        "answer": 1,
        "signal": "By the end of the fiscal year",
        "explanation": "'By + future time marker' denotes completion prior to that boundary, mandating Future Perfect.",
        "vietnameseExplanation": "'By the end of...' chỉ mốc thời hạn mà trước đó hành động sẽ hoàn thành xong xuôi $\\rightarrow$ Tương Lai Hoàn Thành."
    },
    {
        "id": "q-fut-prf-2",
        "tenseId": "future-perfect",
        "tenseName": "Future Perfect",
        "family": "FUTURE",
        "prompt": "By the time the foreign dignitaries arrive at the summit, the treaty _____ signed.",
        "blankTarget": "will have been",
        "options": ["will be", "will have been", "is", "was"],
        "answer": 1,
        "signal": "By the time + Present Simple (passive future perfect)",
        "explanation": "Future perfect passive: 'By the time + present simple... will have been + V3'.",
        "vietnameseExplanation": "Thể bị động của Tương Lai Hoàn Thành kết hợp với mệnh đề 'By the time + Hiện Tại Đơn': will have been + V3."
    },
    {
        "id": "q-fut-prf-3",
        "tenseId": "future-perfect",
        "tenseName": "Future Perfect",
        "family": "FUTURE",
        "prompt": "By December 2028, the spacecraft _____ over 500 million kilometers through deep space.",
        "blankTarget": "will have traveled",
        "options": ["will travel", "will have traveled", "travels", "is traveling"],
        "answer": 1,
        "signal": "By December 2028",
        "explanation": "'By' followed by a future calendar year indicates an action completed before that date.",
        "vietnameseExplanation": "'By December 2028' báo hiệu quãng đường sẽ được hoàn thành trước thời điểm đó $\\rightarrow$ Tương Lai Hoàn Thành."
    },

    # Additional Present Perfect Continuous Questions
    {
        "id": "q-pres-pfc-4",
        "tenseId": "present-perfect-continuous",
        "tenseName": "Present Perfect Continuous",
        "family": "PRESENT",
        "prompt": "The laboratory scientists _____ the chemical compound all morning, but haven't isolated the catalyst yet.",
        "blankTarget": "have been testing",
        "options": ["tested", "have tested", "have been testing", "are testing"],
        "answer": 2,
        "signal": "all morning, haven't isolated yet",
        "explanation": "'all morning' emphasizes the uninterrupted ongoing process linking straight to the present moment.",
        "vietnameseExplanation": "'all morning' (suốt cả buổi sáng) kết hợp với việc chưa xong nhấn mạnh quá trình liên tục $\\rightarrow$ Hiện Tại Hoàn Thành Tiếp Diễn."
    },
    {
        "id": "q-pres-pfc-5",
        "tenseId": "present-perfect-continuous",
        "tenseName": "Present Perfect Continuous",
        "family": "PRESENT",
        "prompt": "It _____ heavily since early dawn, flooding several low-lying streets in the city center.",
        "blankTarget": "has been raining",
        "options": ["rains", "has rained", "has been raining", "rained"],
        "answer": 2,
        "signal": "since early dawn, flooding streets (present ongoing consequence)",
        "explanation": "Continuous weather event originating in the past with active ongoing effects in the present requires Present Perfect Continuous.",
        "vietnameseExplanation": "Mưa liên tục từ sáng sớm đến nay (since early dawn) gây ngập lụt hiện tại $\\rightarrow$ Hiện Tại Hoàn Thành Tiếp Diễn."
    },
    {
        "id": "q-pres-pfc-6",
        "tenseId": "present-perfect-continuous",
        "tenseName": "Present Perfect Continuous",
        "family": "PRESENT",
        "prompt": "Her eyes are bloodshot because she _____ at the computer screen without breaks for six hours.",
        "blankTarget": "has been staring",
        "options": ["stared", "had stared", "has been staring", "is staring"],
        "answer": 2,
        "signal": "eyes are bloodshot (present consequence) for six hours",
        "explanation": "An immediate physiological state in the present resulting from sustained recent activity demands Present Perfect Continuous.",
        "vietnameseExplanation": "Dấu hiệu mắt đỏ ở hiện tại là kết quả của hành động nhìn màn hình liên tục suốt 6 tiếng vừa qua."
    },
    {
        "id": "q-pres-pfc-7",
        "tenseId": "present-perfect-continuous",
        "tenseName": "Present Perfect Continuous",
        "family": "PRESENT",
        "prompt": "The United Nations _____ to broker a peaceful resolution for several months.",
        "blankTarget": "has been attempting",
        "options": ["attempts", "has attempted", "has been attempting", "was attempting"],
        "answer": 2,
        "signal": "for several months (ongoing sustained effort)",
        "explanation": "Sustained diplomatic efforts persisting without resolution over months require Present Perfect Continuous.",
        "vietnameseExplanation": "Nhấn mạnh nỗ lực đàm phán liên tục không ngừng nghỉ suốt nhiều tháng qua."
    },

    # Additional Past Perfect Questions
    {
        "id": "q-past-prf-4",
        "tenseId": "past-perfect",
        "tenseName": "Past Perfect",
        "family": "PAST",
        "prompt": "Before she accepted the prestigious fellowship, she _____ with several senior advisors.",
        "blankTarget": "had consulted",
        "options": ["consulted", "had consulted", "has consulted", "was consulting"],
        "answer": 1,
        "signal": "Before she accepted (action prior to past milestone)",
        "explanation": "Consulting advisors took place before accepting the fellowship, establishing clear anteriority in the past.",
        "vietnameseExplanation": "Hành động tham vấn cố vấn xảy ra trước khi chấp nhận học bổng trong quá khứ $\\rightarrow$ Quá Khứ Hoàn Thành."
    },
    {
        "id": "q-past-prf-5",
        "tenseId": "past-perfect",
        "tenseName": "Past Perfect",
        "family": "PAST",
        "prompt": "By midnight, almost all festival attendees _____ the fairgrounds.",
        "blankTarget": "had vacated",
        "options": ["vacated", "had vacated", "were vacating", "have vacated"],
        "answer": 1,
        "signal": "By midnight (past temporal boundary)",
        "explanation": "'By + past time' requires the event to have culminated prior to that boundary.",
        "vietnameseExplanation": "'By midnight' (trước nửa đêm) yêu cầu hành động rời khỏi phải hoàn tất trước mốc đó $\\rightarrow$ Quá Khứ Hoàn Thành."
    },
    {
        "id": "q-past-prf-6",
        "tenseId": "past-perfect",
        "tenseName": "Past Perfect",
        "family": "PAST",
        "prompt": "The museum curator realized that an ancient relic _____ stolen days earlier.",
        "blankTarget": "had been",
        "options": ["was", "had been", "has been", "is"],
        "answer": 1,
        "signal": "realized... stolen days earlier (passive anteriority)",
        "explanation": "The theft occurred days prior to the realization, requiring passive past perfect 'had been stolen'.",
        "vietnameseExplanation": "Cổ vật bị đánh cắp trước thời điểm phát hiện vài ngày $\\rightarrow$ Bị động Quá Khứ Hoàn Thành (had been stolen)."
    },
    {
        "id": "q-past-prf-7",
        "tenseId": "past-perfect",
        "tenseName": "Past Perfect",
        "family": "PAST",
        "prompt": "No sooner _____ the plane touched down than torrential rain battered the runway.",
        "blankTarget": "had",
        "options": ["did", "was", "had", "has"],
        "answer": 2,
        "signal": "No sooner had... than (negative inversion)",
        "explanation": "'No sooner had + subject + V3 than...' is the canonical correlative inversion structure for immediate past sequences.",
        "vietnameseExplanation": "Cấu trúc đảo ngữ 'No sooner had + S + V3 than + Past Simple' (Vừa mới... thì đã...)."
    },

    # Additional Past Perfect Continuous Questions
    {
        "id": "q-past-pfc-3",
        "tenseId": "past-perfect-continuous",
        "tenseName": "Past Perfect Continuous",
        "family": "PAST",
        "prompt": "The marathon runners _____ for over three hours when the sudden thunderstorm forced the race to halt.",
        "blankTarget": "had been running",
        "options": ["ran", "were running", "had been running", "have been running"],
        "answer": 2,
        "signal": "for over three hours when the sudden thunderstorm forced (duration prior to interruption)",
        "explanation": "Emphasizes the sustained continuous duration leading up to a sudden past interruptive event.",
        "vietnameseExplanation": "Nhấn mạnh các vận động viên đã chạy liên tục suốt hơn 3 tiếng trước khi cơn dông ập đến buộc dừng lại."
    },
    {
        "id": "q-past-pfc-4",
        "tenseId": "past-perfect-continuous",
        "tenseName": "Past Perfect Continuous",
        "family": "PAST",
        "prompt": "He was utterly exhausted because he _____ the technical manual all through the night.",
        "blankTarget": "had been translating",
        "options": ["translated", "was translating", "had been translating", "has translated"],
        "answer": 2,
        "signal": "was utterly exhausted (past result), all through the night",
        "explanation": "Past visible fatigue caused by an intensive continuous activity all night requires Past Perfect Continuous.",
        "vietnameseExplanation": "Tình trạng kiệt sức trong quá khứ là kết quả của việc dịch tài liệu liên tục suốt đêm."
    },
    {
        "id": "q-past-pfc-5",
        "tenseId": "past-perfect-continuous",
        "tenseName": "Past Perfect Continuous",
        "family": "PAST",
        "prompt": "Prior to their sudden resignation, the CFO _____ for an independent audit for months.",
        "blankTarget": "had been advocating",
        "options": ["advocated", "was advocating", "had been advocating", "has advocated"],
        "answer": 2,
        "signal": "Prior to resignation... for months",
        "explanation": "Long sustained continuous action leading up to a past resignation.",
        "vietnameseExplanation": "Hành động liên tục kiến nghị kiểm toán suốt nhiều tháng trước khi từ chức."
    },
    {
        "id": "q-past-pfc-6",
        "tenseId": "past-perfect-continuous",
        "tenseName": "Past Perfect Continuous",
        "family": "PAST",
        "prompt": "The industrial engine finally overheated because the coolant _____ slowly for weeks.",
        "blankTarget": "had been leaking",
        "options": ["leaked", "was leaking", "had been leaking", "has been leaking"],
        "answer": 2,
        "signal": "finally overheated (past event)... for weeks",
        "explanation": "Cumulative continuous leakage prior to the breakdown justifies Past Perfect Continuous.",
        "vietnameseExplanation": "Hiện tượng rò rỉ diễn ra âm ỉ suốt nhiều tuần trước khi máy bị quá nhiệt."
    },
    {
        "id": "q-past-pfc-7",
        "tenseId": "past-perfect-continuous",
        "tenseName": "Past Perfect Continuous",
        "family": "PAST",
        "prompt": "How long _____ they been residing in the capital before the revolution broke out?",
        "blankTarget": "had",
        "options": ["did", "were", "had", "have"],
        "answer": 2,
        "signal": "How long had they been... before the revolution",
        "explanation": "Past duration question: 'How long had + subject + been + V-ing before + past simple'.",
        "vietnameseExplanation": "Câu hỏi thời lượng quá khứ: 'How long had they been residing... before...?'."
    },

    # Additional Future Continuous Questions
    {
        "id": "q-fut-con-3",
        "tenseId": "future-continuous",
        "tenseName": "Future Continuous",
        "family": "FUTURE",
        "prompt": "Don't visit the lab tomorrow afternoon; the team _____ an intricate biometric calibration then.",
        "blankTarget": "will be conducting",
        "options": ["conducts", "will conduct", "will be conducting", "has conducted"],
        "answer": 2,
        "signal": "tomorrow afternoon... then",
        "explanation": "Action will be in continuous progress at that specific future interval.",
        "vietnameseExplanation": "Hành động sẽ đang diễn ra tại thời điểm cụ thể vào chiều mai $\\rightarrow$ Tương Lai Tiếp Diễn."
    },
    {
        "id": "q-fut-con-4",
        "tenseId": "future-continuous",
        "tenseName": "Future Continuous",
        "family": "FUTURE",
        "prompt": "At 8:00 AM on Monday, thousands of commuters _____ into the city center on the new transit line.",
        "blankTarget": "will be streaming",
        "options": ["stream", "will stream", "will be streaming", "will have streamed"],
        "answer": 2,
        "signal": "At 8:00 AM on Monday (precise future timestamp)",
        "explanation": "Precise future clock marker specifies an action in active progress.",
        "vietnameseExplanation": "Đúng 8h sáng thứ Hai (thời điểm cụ thể tương lai) dòng người sẽ đang đổ về trung tâm."
    },
    {
        "id": "q-fut-con-5",
        "tenseId": "future-continuous",
        "tenseName": "Future Continuous",
        "family": "FUTURE",
        "prompt": "Will you _____ using the centrifuge later today, or may I reserve it for my sample?",
        "blankTarget": "be",
        "options": ["are", "be", "have", "been"],
        "answer": 1,
        "signal": "Will you be using (polite inquiry about future routine)",
        "explanation": "Future continuous polite inquiry formula: 'Will you be + V-ing'.",
        "vietnameseExplanation": "Cấu trúc hỏi lịch sự về kế hoạch của người khác: 'Will you be using...?'."
    },
    {
        "id": "q-fut-con-6",
        "tenseId": "future-continuous",
        "tenseName": "Future Continuous",
        "family": "FUTURE",
        "prompt": "During the solar eclipse, millions of people _____ skyward with protective eyewear.",
        "blankTarget": "will be gazing",
        "options": ["gaze", "will gaze", "will be gazing", "gazed"],
        "answer": 2,
        "signal": "During the solar eclipse (future temporal event)",
        "explanation": "A continuous activity unfolding across a specific future event window requires Future Continuous.",
        "vietnameseExplanation": "Trong suốt thời gian nhật thực xảy ra, hàng triệu người sẽ đang ngước nhìn lên bầu trời."
    },
    {
        "id": "q-fut-con-7",
        "tenseId": "future-continuous",
        "tenseName": "Future Continuous",
        "family": "FUTURE",
        "prompt": "At this exact time tomorrow, the space capsule _____ with the orbital space station.",
        "blankTarget": "will be docking",
        "options": ["docks", "will dock", "will be docking", "will have docked"],
        "answer": 2,
        "signal": "At this exact time tomorrow",
        "explanation": "'At this exact time tomorrow' denotes ongoing progress at that milestone.",
        "vietnameseExplanation": "Vào đúng giờ này ngày mai, tàu vũ trụ sẽ đang ghép nối với trạm không gian."
    },

    # Additional Future Perfect Questions
    {
        "id": "q-fut-prf-4",
        "tenseId": "future-perfect",
        "tenseName": "Future Perfect",
        "family": "FUTURE",
        "prompt": "By next Friday, the contractors _____ the foundational reinforcement for the new hospital wing.",
        "blankTarget": "will have completed",
        "options": ["will complete", "will have completed", "are completing", "complete"],
        "answer": 1,
        "signal": "By next Friday (completion before future marker)",
        "explanation": "Action completed before next Friday requires Future Perfect.",
        "vietnameseExplanation": "Trước thứ Sáu tới (By next Friday) công việc sẽ được hoàn tất xong xuôi $\\rightarrow$ Tương Lai Hoàn Thành."
    },
    {
        "id": "q-fut-prf-5",
        "tenseId": "future-perfect",
        "tenseName": "Future Perfect",
        "family": "FUTURE",
        "prompt": "Will the municipal government _____ all carbon emission reduction targets by the end of 2030?",
        "blankTarget": "have met",
        "options": ["meet", "have met", "be meeting", "had met"],
        "answer": 1,
        "signal": "by the end of 2030",
        "explanation": "Question querying completion prior to 2030: 'Will + subject + have + V3'.",
        "vietnameseExplanation": "Câu hỏi hoàn thành mục tiêu trước năm 2030: 'Will the government have met...?'."
    },
    {
        "id": "q-fut-prf-6",
        "tenseId": "future-perfect",
        "tenseName": "Future Perfect",
        "family": "FUTURE",
        "prompt": "By the time the keynote speaker finishes her remarks, the catering crew _____ all dessert platters.",
        "blankTarget": "will have arranged",
        "options": ["arranges", "will arrange", "will have arranged", "arranged"],
        "answer": 2,
        "signal": "By the time + Present Simple",
        "explanation": "Action in the main clause will be concluded prior to the speaker finishing.",
        "vietnameseExplanation": "Trước khi diễn giả phát biểu xong thì nhân viên phục vụ sẽ đã chuẩn bị xong các đĩa tráng miệng."
    },
    {
        "id": "q-fut-prf-7",
        "tenseId": "future-perfect",
        "tenseName": "Future Perfect",
        "family": "FUTURE",
        "prompt": "In another ten years, advancements in renewable technology _____ conventional energy grids across Europe.",
        "blankTarget": "will have transformed",
        "options": ["transform", "will transform", "will have transformed", "transformed"],
        "answer": 2,
        "signal": "In another ten years (looking back from a future point of completion)",
        "explanation": "Emphasizes the completed transformation achieved at the 10-year future mark.",
        "vietnameseExplanation": "Sau 10 năm nữa, sự chuyển dịch năng lượng sẽ đã hoàn tất thay đổi các mạng lưới điện."
    },

    # Additional Future Perfect Continuous Questions
    {
        "id": "q-fut-pfc-3",
        "tenseId": "future-perfect-continuous",
        "tenseName": "Future Perfect Continuous",
        "family": "FUTURE",
        "prompt": "By the time he retires next summer, Arthur _____ as Chief Justice for twenty-five years.",
        "blankTarget": "will have been serving",
        "options": ["will serve", "will be serving", "will have been serving", "will have served"],
        "answer": 2,
        "signal": "By the time he retires... for twenty-five years",
        "explanation": "Emphasizes the duration of tenure continuous up to the retirement juncture.",
        "vietnameseExplanation": "Nhấn mạnh thâm niên phục vụ liên tục suốt 25 năm tính đến thời điểm ông ấy nghỉ hưu vào mùa hè tới."
    },
    {
        "id": "q-fut-pfc-4",
        "tenseId": "future-perfect-continuous",
        "tenseName": "Future Perfect Continuous",
        "family": "FUTURE",
        "prompt": "In November, our ecological research institute _____ marine biodiversity for half a century.",
        "blankTarget": "will have been monitoring",
        "options": ["monitors", "will monitor", "will have been monitoring", "has monitored"],
        "answer": 2,
        "signal": "In November... for half a century",
        "explanation": "Highlights the landmark duration continuously maintained up to November.",
        "vietnameseExplanation": "Đến tháng 11, viện nghiên cứu sẽ đã liên tục theo dõi đa dạng sinh học suốt nửa thế kỷ (50 năm)."
    },
    {
        "id": "q-fut-pfc-5",
        "tenseId": "future-perfect-continuous",
        "tenseName": "Future Perfect Continuous",
        "family": "FUTURE",
        "prompt": "By midnight, the volunteer rescue crew _____ non-stop for eighteen grueling hours.",
        "blankTarget": "will have been searching",
        "options": ["will search", "will be searching", "will have been searching", "have searched"],
        "answer": 2,
        "signal": "By midnight... non-stop for eighteen hours",
        "explanation": "Continuous effort accumulated up to the midnight milestone.",
        "vietnameseExplanation": "Tính đến nửa đêm, đội cứu hộ sẽ đã liên tục tìm kiếm không ngừng nghỉ suốt 18 tiếng đồng hồ."
    },
    {
        "id": "q-fut-pfc-6",
        "tenseId": "future-perfect-continuous",
        "tenseName": "Future Perfect Continuous",
        "family": "FUTURE",
        "prompt": "When she finishes her doctoral dissertation defense, she _____ on that single hypothesis for six years.",
        "blankTarget": "will have been focusing",
        "options": ["focuses", "will focus", "will have been focusing", "focused"],
        "answer": 2,
        "signal": "When she finishes... for six years",
        "explanation": "Continuous academic research duration up to the defense milestone.",
        "vietnameseExplanation": "Khi bảo vệ xong luận án tiến sĩ, cô ấy sẽ đã tập trung nghiên cứu giả thuyết đó liên tục suốt 6 năm."
    },
    {
        "id": "q-fut-pfc-7",
        "tenseId": "future-perfect-continuous",
        "tenseName": "Future Perfect Continuous",
        "family": "FUTURE",
        "prompt": "By next month, how long _____ you have been managing this international supply chain?",
        "blankTarget": "will",
        "options": ["will", "do", "have", "would"],
        "answer": 0,
        "signal": "By next month, how long will you have been managing",
        "explanation": "Question formula for future duration: 'How long will + subject + have been + V-ing by...'.",
        "vietnameseExplanation": "Cấu trúc hỏi thời lượng tương lai hoàn thành tiếp diễn: 'How long will you have been managing by next month?'."
    }
]

CURATED_GRAMMAR_DISTRACTORS = {
    'gram-a1-1': [
        "I not am a student.",
        "I don't am a student.",
        "I am no a student."
    ],
    'gram-a1-2': [
        "Does she is a teacher?",
        "She is a teacher?",
        "Is she teacher?"
    ],
    'gram-a1-3': [
        "He has not a car.",
        "He does not has a car.",
        "He do not have a car."
    ],
    'gram-a1-4': [
        "Have you a sister?",
        "Do you has a sister?",
        "Does you have a sister?"
    ],
    'gram-a1-5': [
        "Are there a cat in the garden?",
        "Does there is a cat in the garden?",
        "Is there cat in the garden?"
    ],
    'gram-a1-6': [
        "There is no apples in the bag.",
        "There are not apples in the bag.",
        "There not are apples in the bag."
    ],
    'gram-a1-7': [
        "I can not to swim.",
        "I don't can swim.",
        "I cannot swimming."
    ],
    'gram-a1-8': [
        "Does she can cook?",
        "Can she to cook?",
        "Can she cooks?"
    ],
    'gram-a1-9': [
        "She work in a shop.",
        "She is work in a shop.",
        "She working in a shop."
    ],
    'gram-a1-10': [
        "They does not like fish.",
        "They not like fish.",
        "They do not likes fish."
    ],
    'gram-a1-11': [
        "He does not likes tea.",
        "He do not like tea.",
        "He is not like tea."
    ],
    'gram-a1-12': [
        "Does you live here?",
        "Are you live here?",
        "Do you lives here?"
    ],
    'gram-a1-13': [
        "Does she plays tennis?",
        "Do she play tennis?",
        "Is she play tennis?"
    ],
    'gram-a1-14': [
        "When you eat lunch?",
        "When does you eat lunch?",
        "When are you eat lunch?"
    ],
    'gram-a1-15': [
        "I eat always breakfast.",
        "Always I eat breakfast.",
        "I am always eat breakfast."
    ],
    'gram-a1-16': [
        "He never is late.",
        "He does never late.",
        "Never he is late."
    ],
    'gram-a2-1': [
        "I was walk to school yesterday.",
        "I walking to school yesterday.",
        "I did walked to school yesterday."
    ],
    'gram-a2-2': [
        "We studyed English and we planed a trip.",
        "We studied English and we planed a trip.",
        "We studyed English and we planned a trip."
    ],
    'gram-a2-3': [
        "I goed to the market and buyed some fruit.",
        "I went to the market and buyed some fruit.",
        "I was go to the market and bought some fruit."
    ],
    'gram-a2-4': [
        "She did not visited her aunt on Sunday.",
        "She was not visit her aunt on Sunday.",
        "She not visited her aunt on Sunday."
    ],
    'gram-a2-5': [
        "Did you watched a film last night?",
        "Were you watch a film last night?",
        "Do you watched a film last night?"
    ],
    'gram-a2-6': [
        "What did he bought yesterday?",
        "What he bought yesterday?",
        "What was he buy yesterday?"
    ],
    'gram-a2-7': [
        "I were watching TV at eight o'clock last night.",
        "I was watch TV at eight o'clock last night.",
        "I watched TV at eight o'clock last night."
    ],
    'gram-a2-8': [
        "I cooked dinner when the phone was ringing.",
        "I was cooking dinner while the phone was ringing.",
        "I was cook dinner when the phone rang."
    ],
    'gram-a2-9': [
        "I going to visit my grandmother on Saturday.",
        "I am going visit my grandmother on Saturday.",
        "I will going to visit my grandmother on Saturday."
    ],
    'gram-a2-10': [
        "She does not going to buy a new bag.",
        "She is going not to buy a new bag.",
        "She not is going to buy a new bag."
    ],
    'gram-a2-11': [
        "Do you going to cook tonight?",
        "Are you going to cooking tonight?",
        "Will you going to cook tonight?"
    ],
    'gram-a2-12': [
        "I will to open the window.",
        "I will opening the window.",
        "I am open the window."
    ],
    'gram-a2-13': [
        "He will not to come to the meeting.",
        "He does not will come to the meeting.",
        "He will not comes to the meeting."
    ],
    'gram-a2-14': [
        "Does it will rain tomorrow?",
        "Will it to rain tomorrow?",
        "Will it rains tomorrow?"
    ],
    'gram-a2-15': [
        "I meeting my friend at six tonight.",
        "I will meeting my friend at six tonight.",
        "I am meet my friend at six tonight."
    ],
    'gram-a2-16': [
        "He cooks dinner with his friends tomorrow.",
        "He is cook dinner with his friends tomorrow.",
        "He has cooked dinner with his friends tomorrow."
    ],
    'gram-b1-1': [
        "I has lost my keys, so I can't open the door.",
        "I have lose my keys, so I can't open the door.",
        "I am lost my keys, so I can't open the door."
    ],
    'gram-b1-2': [
        "I has lived here for five years.",
        "I have lived here since five years.",
        "I am living here for five years."
    ],
    'gram-b1-3': [
        "She has worked at the bank for 2019.",
        "She have worked at the bank since 2019.",
        "She is working at the bank since 2019."
    ],
    'gram-b1-4': [
        "He have just arrived.",
        "He just has arrived.",
        "He is just arrived."
    ],
    'gram-b1-5': [
        "I don't need to cook because my brother have already cooked dinner.",
        "I don't need to cook because my brother already has cooked dinner.",
        "I don't need to cook because my brother has cooked already dinner."
    ],
    'gram-b1-6': [
        "Have you finish the report yet?",
        "Did you finish the report yet?",
        "Have you yet finished the report?"
    ],
    'gram-b1-7': [
        "I has never eaten sushi before.",
        "I have ever eaten sushi before.",
        "I haven't never eaten sushi before."
    ],
    'gram-b1-8': [
        "I has been waiting for the bus since six.",
        "I have waited for the bus since six.",
        "I am waiting for the bus since six."
    ]
}

def load_grammar_items(root_dir):
    grammar_file = os.path.join(root_dir, 'web', 'src', 'assets', 'data', 'grammar.json')
    if not os.path.exists(grammar_file):
        return []
    with open(grammar_file, 'r', encoding='utf-8') as f:
        grammar_data = json.load(f)

    tense_modes = {
        'A1_PRESENT_SIMPLE': ('present-simple', 'Present Simple', 'PRESENT'),
        'A1_BE_AND_HAVE': ('present-simple', 'Present Simple', 'PRESENT'),
        'A2_PAST_TENSES': ('past-simple', 'Past Simple', 'PAST'),
        'A2_FUTURE_AND_CONTINUOUS': ('future-simple', 'Future Simple', 'FUTURE'),
        'B1_PRESENT_PERFECT': ('present-perfect', 'Present Perfect', 'PRESENT'),
    }

    results = []
    for g in grammar_data:
        mode = g.get('mode', '')
        if mode in tense_modes:
            t_id, t_name, fam = tense_modes[mode]
            title = g.get('title', '')
            if 'Perfect Continuous' in title:
                t_id, t_name, fam = 'present-perfect-continuous', 'Present Perfect Continuous', 'PRESENT'
            elif 'Continuous' in title:
                if 'Past' in title:
                    t_id, t_name, fam = 'past-continuous', 'Past Continuous', 'PAST'
                elif 'Present' in title:
                    t_id, t_name, fam = 'present-continuous', 'Present Continuous', 'PRESENT'
                elif 'Future' in title:
                    t_id, t_name, fam = 'future-continuous', 'Future Continuous', 'FUTURE'

            correct = g.get('targetTransformation', '').strip()
            prompt_sent = g.get('promptSentence', '').strip()
            cue = g.get('grammaticalCue', '').strip()
            gid = g.get('id', '')
            distractors = list(CURATED_GRAMMAR_DISTRACTORS.get(gid, []))
            if len(distractors) < 3:
                # Fallback to realistic grammatical distractors
                words = correct.split()
                d1 = correct.replace(' not ', ' no ').replace('does not', 'do not').replace('have', 'has')
                d2 = correct.replace('ed', 'ing').replace('was', 'were')
                d3 = correct.replace('will', 'is').replace('has', 'have').replace('are', 'is')
                distractors = [d for d in [d1, d2, d3] if d != correct]
                while len(distractors) < 3:
                    distractors.append(f"Not {correct}")

            ans_pos = len(results) % 4
            opts = distractors[:3]
            opts.insert(ans_pos, correct)

            results.append({
                "id": f"q-gram-{g.get('id', '')}",
                "tenseId": t_id,
                "tenseName": t_name,
                "family": fam,
                "prompt": f"{prompt_sent} -> [Transform]: {title}",
                "blankTarget": correct,
                "options": opts,
                "answer": ans_pos,
                "signal": cue or g.get('formula', ''),
                "explanation": g.get('analysis', '') or f"Formula: {g.get('formula', '')}",
                "vietnameseExplanation": g.get('vietnamese', ''),
                "source": "grammar.json"
            })
    return results

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_path = os.path.join(root_dir, 'web', 'src', 'assets', 'data', 'tenses-bank.json')
    
    grammar_items = load_grammar_items(root_dir)
    all_questions = QUESTIONS + grammar_items

    data = {
        "metadata": {
            "version": "1.0.0",
            "title": "12 Tenses Master Guide & Interactive Question Bank",
            "totalTenses": len(TENSES_METADATA),
            "totalQuestions": len(all_questions),
            "curatedQuestions": len(QUESTIONS),
            "importedGrammarQuestions": len(grammar_items),
            "families": ["PRESENT", "PAST", "FUTURE"]
        },
        "tenses": TENSES_METADATA,
        "questions": all_questions
    }
    
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully generated {target_path}")
    print(f"Total Tenses: {len(TENSES_METADATA)}")
    print(f"Curated Questions: {len(QUESTIONS)}")
    print(f"Imported from grammar.json: {len(grammar_items)}")
    print(f"Total Combined Questions: {len(all_questions)}")

if __name__ == '__main__':
    main()

