import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import re

def clean_text(t):
    if not t: return ''
    replacements = {
        '\xe2\x80\x99': "'",
        '\xe2\x80\x98': "'",
        '\xe2\x80\x9c': '"',
        '\xe2\x80\x9d': '"',
        '\xe2\x80\x93': '–',
        '\xe2\x80\x94': '—',
        '\xe2\x80\xa6': '…',
        '\xc2\xa0': ' ',
        'â€™': "'", 'â€˜': "'", 'â€œ': '"', 'â€\x9d': '"',
        'â€“': '–', 'â€”': '—', 'â€¦': '…', 'Â': '', 'â€': ''
    }
    for k, v in replacements.items():
        t = t.replace(k, v)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def is_noise_text(t):
    noise_prefixes = ['page = %', 'percent complete', 'page100', 'Icon-', 'Icon_', 'Rectangle', 'Oval', 'Line ', 'Group']
    noise_exact = ['CONTINUE', 'CHECK ANSWERS', 'CHECK ANSWER', 'Start', 'OK', 'TRY AGAIN', 'SHOW ANSWERS', 'Please choose an answer', 'Before you can continue, you need to answer the question', 'Choose an option', 'Results Message', 'Warning']
    if any(t.startswith(p) for p in noise_prefixes):
        return True
    if t in noise_exact:
        return True
    return False

def build_markdown():
    with open('data/cambridge_proficient_activities_complete.json', 'r', encoding='utf-8') as f:
        activities = json.load(f)

    print(f"Loaded {len(activities)} activities for clean markdown generation.")

    lines = []
    lines.append("# Cambridge English Learning Activities (Proficient C1–C2) & Ecosystem Map")
    lines.append("")
    lines.append("> **Source:** [Cambridge English Activities for Learners (Proficient)](https://www.cambridgeenglish.org/learning-english/activities-for-learners/?level=proficient&rows=36) & [Cambridge Learning English Portal](https://www.cambridgeenglish.org/learning-english)")
    lines.append("> **Target Level:** CEFR C1–C2 (Proficient / IELTS Academic 7.5–9.0)")
    lines.append("> **App Workspace:** `e:\\Eng` (`pttaer/eng-learn`)")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 1. Executive Summary & App Integration Blueprint")
    lines.append("")
    lines.append("This document compiles the **complete collection of 36 Proficient (C1–C2) online learning activities** published by Cambridge English, along with the overarching taxonomy of the 175-activity Cambridge learning portal. Each activity was reverse-engineered from its live e-learning engine (Articulate Storyline 360 & Storyline 2) to extract question banks, interactive choices, answer keys, and pedagogical objectives.")
    lines.append("")
    lines.append("### Key Pedagogical Hallmarks of Cambridge C1–C2 Activities")
    lines.append("1. **Micro-Learning Rhythms (0–5 min & 5–10 min):** Designed for high-frequency, low-friction daily practice without learner fatigue.")
    lines.append("2. **Discursive & Authentic Register:** Focuses on nuance, implied speaker attitude, ellipsis/substitution in natural discourse, precise collocations, and formal vs. informal stylistic constraints.")
    lines.append("3. **Exam Alignment:** Serves as direct preparation for Cambridge C1 Advanced (CAE), C2 Proficiency (CPE), and IELTS Academic Bands 7.5–9.0.")
    lines.append("")
    lines.append("### Mobile & Web App Feature Mapping")
    lines.append("")
    lines.append("| Activity Type | Cambridge Skill | Proposed App Component | Interaction Model |")
    lines.append("| :--- | :--- | :--- | :--- |")
    lines.append("| **Ellipsis & Substitution** | Grammar | `EllipsisSpotterView` | Tap to highlight missing grammatical elements |")
    lines.append("| **Reporting Verb Syntax** | Grammar | `VerbComplementMatcher` | Multi-choice pattern matching (verb + that / to / gerund) |")
    lines.append("| **Implied Meaning & Tone** | Listening | `AttitudeProbePlayer` | Audio snippet + contextual deduction chips |")
    lines.append("| **Word & Sentence Stress** | Pronunciation | `StressRhythmTapper` | Visual beat indicator (e.g. `oOo`, `Ooo`, `oOoo`) |")
    lines.append("| **Discursive Referencing** | Reading | `DiscourseMarkerCloze` | Academic text gap-fill focusing on anaphora/cataphora |")
    lines.append("| **Collocation & Precision** | Vocabulary | `NuanceSelectorCard` | Distinguishing near-synonyms in high-stakes contexts |")
    lines.append("| **Polite Complaints & Register** | Writing | `RegisterScaleSlider` | Classify phrases across formal/informal/inappropriate |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 2. Activity Breakdown by Skill (Summary Matrix)")
    lines.append("")
    lines.append("| # | Title | Skill | CEFR | Time | Cambridge Slug |")
    lines.append("| :-: | :--- | :--- | :-: | :-: | :--- |")

    for i, act in enumerate(activities, 1):
        lines.append(f"| {i} | [{clean_text(act['title'])}](#{act['slug']}) | {clean_text(act.get('skills', 'General'))} | {act.get('cefr_level', 'C1-C2')} | {clean_text(act.get('time', '0-5 min'))} | `{act['slug']}` |")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 3. Comprehensive Activity Catalog & Question Banks")
    lines.append("")

    for i, act in enumerate(activities, 1):
        slug = act['slug']
        title = clean_text(act['title'])
        level = act.get('cefr_level', 'C1-C2')
        time_str = clean_text(act.get('time', '0-5 min'))
        skill = clean_text(act.get('skills', 'General English'))
        desc = clean_text(act.get('description', ''))
        url = act.get('url', '')
        engine = act.get('engine', 'Storyline')

        lines.append(f"### <a id=\"{slug}\"></a>{i}. {title}")
        lines.append("")
        lines.append(f"- **Slug:** `{slug}`")
        lines.append(f"- **CEFR Level:** {level}")
        lines.append(f"- **Estimated Time:** {time_str}")
        lines.append(f"- **Skill Focus:** {skill}")
        lines.append(f"- **Canonical URL:** [{url}]({url})")
        lines.append(f"- **Engine:** {engine}")
        lines.append("")
        lines.append(f"**Learning Objective:**  \n{desc}")
        lines.append("")

        questions = act.get('questions', [])
        raw_texts = act.get('raw_texts', [])

        if questions:
            lines.append("#### Extracted Question Bank & Answer Key")
            lines.append("")
            for q_idx, q in enumerate(questions, 1):
                p = clean_text(q.get('prompt', ''))
                q_type = q.get('type', 'multiplechoice')
                choices = [clean_text(c) for c in q.get('choices', [])]
                ans = [clean_text(a) for a in q.get('answers', [])]
                lines.append(f"**Item {q_idx}:** `{p}` ({q_type})")
                if choices:
                    lines.append("- **Choices:**")
                    for c in choices:
                        is_ans = "**(Correct)**" if c in ans else ""
                        lines.append(f"  - [ ] {c} {is_ans}")
                lines.append("")
        elif raw_texts:
            lines.append("#### Extracted Learning Content & Task Items")
            lines.append("")
            for st in raw_texts:
                s_title = clean_text(st.get('title') or st.get('slide_id', ''))
                texts = [clean_text(t) for t in st.get('texts', [])]
                filtered = [t for t in texts if not is_noise_text(t)]
                if filtered:
                    lines.append(f"**Section / Slide ({s_title}):**")
                    for t in filtered:
                        lines.append(f"- {t}")
                    lines.append("")

        comp_name = re.sub(r'[^a-zA-Z0-9]', '', title) + "Exercise"
        lines.append("**App Implementation Strategy:**")
        lines.append(f"- **Component Pattern:** `{comp_name}`")
        lines.append(f"- **UX Recommendation:** Implement as a rapid-fire {time_str} interactive card with immediate formative feedback and explanation of nuance.")
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.append("## 4. The Complete Cambridge Learning English Ecosystem")
    lines.append("")
    lines.append("Beyond the 36 Proficient activities, Cambridge English provides an extensive tiered curriculum comprising **175 activities** across three levels:")
    lines.append("")
    lines.append("### Activity Distribution Across CEFR Levels")
    lines.append("- **Basic (A1–A2):** 43 activities — Foundational sentence structure, daily routine vocabulary, simple present/past tenses, basic listening dialogues.")
    lines.append("- **Independent (B1–B2):** 96 activities — Intermediate conversational agility, modal verbs, conditionals, work & travel vocabulary, longer listening extracts.")
    lines.append("- **Proficient (C1–C2):** 36 activities — Advanced discursive markers, rhetorical ellipsis, idiomatic subtleties, subtle attitudes, formal register, complex phonology.")
    lines.append("")
    lines.append("### Companion Cambridge Platforms for App Integration")
    lines.append("1. **Virtually Anywhere Audio Drama Series (B1–B2):** An episodic 7-episode audio series following university students Geeta and Paul, ideal for our podcast audio player with synchronized transcripts.")
    lines.append("2. **Write & Improve:** Cambridge's automated AI writing feedback tool. Can be integrated into our writing module to evaluate CEFR levels on essays and letters.")
    lines.append("3. **Official Exam Preparation Materials:** Free sample test papers for C1 Advanced (CAE), C2 Proficiency (CPE), B2 First (FCE), and IELTS Academic.")
    lines.append("")
    lines.append("### Recommendations for our App (`pttaer/eng-learn`)")
    lines.append("1. **Adopt Cambridge's Time-Boxed Activity Structure:** Keep daily exercises under 5–10 minutes to maximize completion rates.")
    lines.append("2. **Implement CEFR Micro-Badging:** Tag every question bank item with exact CEFR competency codes (e.g. `C1.Grammar.Ellipsis`).")
    lines.append("3. **Local Evaluation:** In accordance with repository rules, compute all scoring locally without relying on external LLM runtime latency.")

    out_text = '\n'.join(lines)
    with open('docs/CAMBRIDGE_PROFICIENT_ACTIVITIES.md', 'w', encoding='utf-8') as f:
        f.write(out_text)
    print("Successfully regenerated pristine docs/CAMBRIDGE_PROFICIENT_ACTIVITIES.md!")

if __name__ == '__main__':
    build_markdown()
