import os
import sys
import json
import urllib.request
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT_OUTPUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'research English contents', '5_star_resources'))
os.makedirs(ROOT_OUTPUT, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
}

def safe_fetch(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read()
    except Exception as e:
        print(f"  [WARN] Failed fetch {url}: {e}")
        return None

# =====================================================================
# 11. LUKE'S ENGLISH PODCAST (LEP)
# =====================================================================
def harvest_lukes_english_podcast():
    print("\n--- Harvesting 11: Luke's English Podcast (LEP) ---")
    out_dir = os.path.join(ROOT_OUTPUT, '11_lukes_english_podcast')
    os.makedirs(out_dir, exist_ok=True)

    lep_url = 'https://teacherluke.co.uk/feed/'
    raw_xml = safe_fetch(lep_url)
    episodes = []
    if raw_xml:
        try:
            root = ET.fromstring(raw_xml)
            for item in root.findall('.//item')[:15]:
                title = item.find('title').text if item.find('title') is not None else ""
                link = item.find('link').text if item.find('link') is not None else ""
                desc = item.find('description').text if item.find('description') is not None else ""
                # Clean html from description
                desc_clean = BeautifulSoup(desc or '', 'html.parser').get_text().strip()
                episodes.append({
                    "title": title,
                    "link": link,
                    "summary": desc_clean[:300]
                })
        except Exception as e:
            print(f"  [WARN] Parsing LEP RSS: {e}")

    lep_database = {
        "title": "Luke's English Podcast (LEP) - Extensive Listening Master Resource",
        "creator": "Luke Thompson (CELTA/DELTA Teacher & Stand-up Comedian)",
        "source": "teacherluke.co.uk",
        "evaluation": "⭐⭐⭐⭐⭐ (5/5) — World's Best English Learning Podcast",
        "pedagogical_approach": {
            "methodology": "Extensive Listening (Comprehensible Input + Natural Discourse)",
            "why_it_works": [
                "Full-length authentic episodes (1–2 hours) train stamina for IELTS Listening Section 3 & 4.",
                "Unscripted natural conversation teaches discourse markers, self-correction, and humor nuances.",
                "Language breakdowns: Luke regularly pauses to deconstruct idioms, phrasal verbs, and cultural references.",
                "High emotional engagement drastically accelerates lexical acquisition compared to dry coursebooks."
            ]
        },
        "curated_study_path": [
            {"focus": "British Culture & History", "episodes": ["The History of the English Language", "British Comedy Demystified", "London Walking Tours"]},
            {"focus": "Grammar & Phonology Deep Dives", "episodes": ["Pronunciation with Dr. Geoff Lindsey", "Phrasal Verbs in Context", "Tenses & Aspect Nuances"]},
            {"focus": "IELTS Exam Preparation", "episodes": ["How to get 8.5 in IELTS Speaking", "Examiner Mindset & Band Descriptors", "Vocabulary for Task 2 Essays"]}
        ],
        "latest_harvested_episodes": episodes
    }

    with open(os.path.join(out_dir, 'lukes_english_podcast_curriculum.json'), 'w', encoding='utf-8') as f:
        json.dump(lep_database, f, ensure_ascii=False, indent=2)

    with open(os.path.join(out_dir, 'README.md'), 'w', encoding='utf-8') as f:
        f.write("# Luke's English Podcast (LEP) - Extensive Listening Guide\n\n")
        f.write("> **Host:** Luke Thompson (CELTA & DELTA qualified teacher / Stand-up Comedian)\n")
        f.write("> **Source:** `teacherluke.co.uk`\n")
        f.write("> **Evaluation:** ⭐⭐⭐⭐⭐ (5/5) — #1 Podcast for Advanced Natural English & Stamina\n\n")
        f.write("## 1. Why LEP Outperforms Traditional Textbooks\n")
        for point in lep_database["pedagogical_approach"]["why_it_works"]:
            f.write(f"- {point}\n")
        f.write("\n## 2. Core Curated Study Tracks\n\n")
        for track in lep_database["curated_study_path"]:
            f.write(f"### {track['focus']}\n")
            for ep in track["episodes"]:
                f.write(f"- {ep}\n")
            f.write("\n")
        f.write("## 3. Harvested Feed Episodes\n\n")
        for ep in episodes[:10]:
            f.write(f"### {ep['title']}\n")
            f.write(f"- Link: {ep['link']}\n")
            f.write(f"- Overview: {ep['summary']}...\n\n")
    print(f"  Luke's English Podcast guides saved to {out_dir}")

# =====================================================================
# 12. NPR (Planet Money, Fresh Air, Hidden Brain)
# =====================================================================
def harvest_npr_podcasts():
    print("\n--- Harvesting 12: NPR Podcasts (Planet Money, Fresh Air) ---")
    out_dir = os.path.join(ROOT_OUTPUT, '12_npr_podcasts')
    os.makedirs(out_dir, exist_ok=True)

    npr_feeds = [
        ("Planet Money", "https://feeds.npr.org/510289/podcast.xml", "Economics, Markets & Human Behavior"),
        ("Fresh Air", "https://feeds.npr.org/381444908/podcast.xml", "Arts, Culture, Author Interviews & Journalism")
    ]

    all_harvested = {}
    for show_name, feed_url, desc in npr_feeds:
        print(f"  Fetching NPR RSS: {show_name}...")
        raw_xml = safe_fetch(feed_url)
        items = []
        if raw_xml:
            try:
                root = ET.fromstring(raw_xml)
                for item in root.findall('.//item')[:8]:
                    t = item.find('title').text if item.find('title') is not None else ""
                    l = item.find('link').text if item.find('link') is not None else ""
                    d = item.find('description').text if item.find('description') is not None else ""
                    clean_d = BeautifulSoup(d or '', 'html.parser').get_text().strip()
                    items.append({"title": t, "link": l, "description": clean_d[:350]})
            except Exception as e:
                print(f"  [WARN] Parsing NPR {show_name}: {e}")
        all_harvested[show_name] = {"category": desc, "feed": feed_url, "episodes": items}

    npr_database = {
        "title": "NPR Journalistic Spoken English & Audio Repository",
        "network": "National Public Radio (NPR)",
        "source": "npr.org",
        "evaluation": "⭐⭐⭐⭐⭐ (5/5) — Gold Standard for Educated Spoken American English",
        "intellectual_spoken_features": {
            "pacing": "Deliberate narrative pacing (140-160 words per minute) with clear rhythmic chunking.",
            "discourse_markers": [
                {"marker": "As it turns out...", "function": "Revealing unexpected reality or scientific finding"},
                {"marker": "What struck me was...", "function": "Highlighting key insight or anomaly"},
                {"marker": "Here's the thing...", "function": "Directing listener attention to the crux of the problem"},
                {"marker": "At the end of the day...", "function": "Synthesizing ultimate conclusion or bottom line"}
            ]
        },
        "shows": all_harvested
    }

    with open(os.path.join(out_dir, 'npr_journalism_repository.json'), 'w', encoding='utf-8') as f:
        json.dump(npr_database, f, ensure_ascii=False, indent=2)

    with open(os.path.join(out_dir, 'README.md'), 'w', encoding='utf-8') as f:
        f.write("# NPR (Planet Money, Fresh Air) - Advanced American Spoken English\n\n")
        f.write("> **Network:** National Public Radio (`npr.org`)\n")
        f.write("> **Evaluation:** ⭐⭐⭐⭐⭐ (5/5) — Pinnacle of American Audio Journalism & Intellectual Dialogue\n\n")
        f.write("## 1. Why NPR Trains Band 8.0+ Listening & Speaking\n")
        f.write("NPR shows feature educated native speech across economics, behavioral psychology, and cultural critique. Non-native speakers learn how native intellectuals frame arguments, qualify assertions, and tell stories.\n\n")
        f.write("## 2. High-Frequency Spoken Discourse Signposts\n\n")
        f.write("| Discourse Marker | Rhetorical Function |\n| :--- | :--- |\n")
        for dm in npr_database["intellectual_spoken_features"]["discourse_markers"]:
            f.write(f"| *\"{dm['marker']}\"* | {dm['function']} |\n")
        f.write("\n## 3. Harvested Podcast Episodes\n\n")
        for show, data in all_harvested.items():
            f.write(f"### {show} ({data['category']})\n\n")
            for ep in data["episodes"]:
                f.write(f"- **{ep['title']}**\n  - Link: {ep['link']}\n  - {ep['description']}...\n\n")
    print(f"  NPR resources saved to {out_dir}")

# =====================================================================
# 13. AEON ESSAYS & PSYCHE
# =====================================================================
def harvest_aeon_essays():
    print("\n--- Harvesting 13: Aeon Essays & Psyche ---")
    out_dir = os.path.join(ROOT_OUTPUT, '13_aeon_essays_psyche')
    os.makedirs(out_dir, exist_ok=True)

    aeon_url = 'https://aeon.co/feed.rss'
    print(f"  Fetching Aeon RSS from {aeon_url}...")
    raw_xml = safe_fetch(aeon_url)
    essays = []
    if raw_xml:
        try:
            root = ET.fromstring(raw_xml)
            for item in root.findall('.//item')[:15]:
                t = item.find('title').text if item.find('title') is not None else ""
                l = item.find('link').text if item.find('link') is not None else ""
                d = item.find('description').text if item.find('description') is not None else ""
                clean_d = BeautifulSoup(d or '', 'html.parser').get_text().strip()
                essays.append({"title": t, "link": l, "synopsis": clean_d})
        except Exception as e:
            print(f"  [WARN] Parsing Aeon RSS: {e}")

    aeon_database = {
        "title": "Aeon Essays & Psyche - Master Literary & Philosophical Texts",
        "platform": "Aeon Media Group (`aeon.co` / `psyche.co`)",
        "evaluation": "⭐⭐⭐⭐⭐ (5/5) — Exemplary Source for IELTS Reading Passage 3 & Writing Task 2",
        "academic_dimensions": {
            "sentence_complexity": "Averages 28-35 words per sentence with balanced coordination and subordination.",
            "intellectual_depth": "Essays written by distinguished academics, evolutionary biologists, and philosophers exploring big existential and scientific inquiries.",
            "rhetorical_features": [
                "Counterpoint argumentation (Setting up a prevailing dogma then destabilizing it)",
                "Nuanced modal qualification (*it may tentatively be suggested that*)",
                "Metaphorical precision (*the cognitive scaffolding of human empathy*)"
            ]
        },
        "harvested_recent_essays": essays
    }

    with open(os.path.join(out_dir, 'aeon_essays_repository.json'), 'w', encoding='utf-8') as f:
        json.dump(aeon_database, f, ensure_ascii=False, indent=2)

    with open(os.path.join(out_dir, 'README.md'), 'w', encoding='utf-8') as f:
        f.write("# Aeon Essays & Psyche - High-Band Reading & Essay Archetypes\n\n")
        f.write("> **Publisher:** Aeon Media Group (`aeon.co` / `psyche.co`)\n")
        f.write("> **Evaluation:** ⭐⭐⭐⭐⭐ (5/5) — Model Prose for IELTS Reading Passage 3 & Band 9 Task 2\n\n")
        f.write("## 1. Why Aeon is the Ultimate Reading Corpus\n")
        f.write("IELTS Reading Passage 3 and GRE Verbal passages are drawn from the exact same scholarly essays as Aeon. Reading one Aeon essay per week builds the mental stamina required for 900-word philosophical passages.\n\n")
        f.write("## 2. Advanced Rhetorical Moves in Aeon Essays\n")
        for feat in aeon_database["academic_dimensions"]["rhetorical_features"]:
            f.write(f"- {feat}\n")
        f.write("\n## 3. Harvested Essays from Aeon\n\n")
        for es in essays:
            f.write(f"### {es['title']}\n")
            f.write(f"- Link: {es['link']}\n")
            f.write(f"- Synopsis: {es['synopsis']}\n\n")
    print(f"  Aeon Essays resources saved to {out_dir}")

# =====================================================================
# 14. TOASTMASTERS INTERNATIONAL
# =====================================================================
def harvest_toastmasters():
    print("\n--- Harvesting 14: Toastmasters International ---")
    out_dir = os.path.join(ROOT_OUTPUT, '14_toastmasters_international')
    os.makedirs(out_dir, exist_ok=True)

    toastmasters_db = {
        "title": "Toastmasters International Impromptu Speaking & Fluency Architecture",
        "organization": "Toastmasters International",
        "url": "https://toastmasters.org",
        "evaluation": "⭐⭐⭐⭐⭐ (5/5) — Benchmark for Public Speaking & Impromptu Fluency",
        "table_topics_frameworks": [
            {
                "framework": "The P.R.E.P. Method",
                "best_for": "Opinion questions, policy evaluations, direct IELTS Speaking Part 3 prompts",
                "steps": [
                    {"step": "Point", "description": "State your core stance clearly and decisively in 1 sentence."},
                    {"step": "Reason", "description": "Explain *why* you hold this stance using logical justification."},
                    {"step": "Example", "description": "Illustrate with a vivid personal anecdote, historical precedent, or statistic."},
                    {"step": "Point", "description": "Restate your main point with elevated vocabulary to seal the argument."}
                ]
            },
            {
                "framework": "The O.R.E.O. Method",
                "best_for": "Value judgements and moral / philosophical questions",
                "steps": [
                    {"step": "Opinion", "description": "Express your fundamental value judgement."},
                    {"step": "Reason", "description": "Provide the ethical or pragmatic basis."},
                    {"step": "Explanation / Evidence", "description": "Demonstrate the real-world consequences if this value is ignored."},
                    {"step": "Opinion", "description": "Reaffirm your verdict."}
                ]
            },
            {
                "framework": "The Past - Present - Future Timeline",
                "best_for": "Questions about technology, social trends, work habits, urban living",
                "steps": [
                    {"step": "Past", "description": "A generation ago, how did society handle this issue?"},
                    {"step": "Present", "description": "What is the status quo today? What friction exists?"},
                    {"step": "Future", "description": "What will likely unfold over the next 20 years?"}
                ]
            }
        ],
        "meeting_evaluations_and_defense_against_fillers": {
            "ah_counter_role": "Identifies and tallies crutch words: 'um', 'ah', 'er', 'you know', 'like', 'actually', 'sort of'.",
            "the_power_of_the_pause": "Replace vocalized hesitations ('uhhh...') with intentional 1.5-second silence. Silence projects gravitas and gives the brain time to formulate the next grammatical clause.",
            "grammarian_protocol": "Tracks fossilized errors, subject-verb agreement slips, and introduces a 'Word of the Day' to expand active lexical range."
        },
        "curated_table_topics_ielts_bank": [
            {"topic": "Artificial Intelligence & Ethics", "prompt": "If artificial intelligence can outperform human doctors, should algorithms have the legal authority to diagnose patients without human oversight?"},
            {"topic": "Urban Living & Solitude", "prompt": "Despite living in densely populated modern cities, why are more individuals experiencing chronic isolation than previous generations?"},
            {"topic": "Higher Education vs Vocational Training", "prompt": "Does the traditional 4-year university degree still provide adequate return on investment in today's rapidly evolving global economy?"},
            {"topic": "Environmental Stewardship", "prompt": "Should individual consumer choices or governmental industrial mandates bear the primary responsibility for reversing climate change?"},
            {"topic": "Preservation of Cultural Heritage", "prompt": "In an increasingly homogenised global culture, is it essential for nation-states to spend tax revenue preserving obsolete dialects and traditions?"}
        ]
    }

    with open(os.path.join(out_dir, 'toastmasters_speaking_playbook.json'), 'w', encoding='utf-8') as f:
        json.dump(toastmasters_db, f, ensure_ascii=False, indent=2)

    with open(os.path.join(out_dir, 'README.md'), 'w', encoding='utf-8') as f:
        f.write("# Toastmasters International: Public Speaking & Table Topics Mastery\n\n")
        f.write("> **Source:** Toastmasters International (`toastmasters.org`)\n")
        f.write("> **Evaluation:** ⭐⭐⭐⭐⭐ (5/5) — World Standard for Spontaneous Fluency & Rhetorical Poise\n\n")
        f.write("## 1. Impromptu Speaking Frameworks (Table Topics)\n\n")
        for fw in toastmasters_db["table_topics_frameworks"]:
            f.write(f"### {fw['framework']}\n")
            f.write(f"*Best for:* {fw['best_for']}\n\n")
            for st in fw["steps"]:
                f.write(f"- **{st['step']}:** {st['description']}\n")
            f.write("\n")
        f.write("## 2. Eradicating Crutch Words: The Ah-Counter Protocol\n")
        f.write(f"{toastmasters_db['meeting_evaluations_and_defense_against_fillers']['the_power_of_the_pause']}\n\n")
        f.write("## 3. High-Leverage Impromptu Questions (Mapped to IELTS Speaking Part 3)\n\n")
        for q in toastmasters_db["curated_table_topics_ielts_bank"]:
            f.write(f"### {q['topic']}\n")
            f.write(f"> *\"{q['prompt']}\"*\n\n")
    print(f"  Toastmasters resources saved to {out_dir}")

# =====================================================================
# 15. ANKI & SPACED REPETITION (SRS)
# =====================================================================
def harvest_anki_srs():
    print("\n--- Harvesting 15: Anki & Spaced Repetition (SRS) ---")
    out_dir = os.path.join(ROOT_OUTPUT, '15_anki_srs_ecosystem')
    os.makedirs(out_dir, exist_ok=True)

    anki_database = {
        "title": "Anki & Spaced Repetition System (SRS) Optimization Guide",
        "service": "AnkiWeb & Open Source SRS Community",
        "url": "https://apps.ankiweb.net",
        "evaluation": "⭐⭐⭐⭐⭐ (5/5) — Most Scientifically Validated Method for Long-Term Memory",
        "algorithms": {
            "sm2_vs_fsrs": {
                "sm2": "Standard SuperMemo-2 algorithm from 1987. Uses a fixed Ease Factor that can lead to 'Ease Hell' when cards are graded 'Hard'.",
                "fsrs": "Free Spaced Repetition Scheduler (2023+). Uses DSR model (Difficulty, Stability, Retrievability) based on modern cognitive psychology. Reduces total review burden by 20–30% while maintaining target retention (e.g. 90%)."
            }
        },
        "the_20_rules_of_formulating_knowledge_summary": [
            "Rule 1: Do not learn if you do not understand (Comprehension precedes memorization).",
            "Rule 2: Learn before you memorize (Build the mental model first).",
            "Rule 3: Build upon the basics (Establish foundational vocabulary before niche idioms).",
            "Rule 4: Stick to the Minimum Information Principle (Each flashcard must test exactly ONE atomic fact).",
            "Rule 5: Cloze deletion is easy and effective (Sentence context prevents ambiguous recall).",
            "Rule 6: Use imagery and emotional cues.",
            "Rule 7: Avoid sets and enumerations (Break lists of 5 items into 5 distinct cards)."
        ],
        "exportable_card_decks": {
            "awl_core_cloze_deck_tsv": [
                {"front": "The scientists conducted a rigorous {{c1::analysis}} of the experimental data.", "note": "analysis (noun) - detailed examination"},
                {"front": "There is compelling {{c1::evidence}} to indicate that global temperatures are rising.", "note": "evidence (noun) - facts/signs indicating truth"},
                {"front": "Governments must {{c1::establish}} clear regulatory benchmarks for autonomous vehicles.", "note": "establish (verb) - set up or prove firmly"},
                {"front": "Industrial emissions {{c1::contribute}} substantially to atmospheric degradation.", "note": "contribute (verb) - be a factor in"},
                {"front": "The study was designed to test the initial {{c1::hypothesis}} under controlled conditions.", "note": "hypothesis (noun) - proposed explanation"}
            ],
            "minimal_pairs_phonetics_tsv": [
                {"front": "Minimal pair: /iː/ vs /ɪ/ -> Did you say *leave* or *live*?", "back": "leave = /liːv/ (Tense, closing diphthong) | live = /lɪv/ (Lax, short near-front)"},
                {"front": "Minimal pair: /æ/ vs /e/ -> Did you say *bad* or *bed*?", "back": "bad = /bæd/ (Open front, jaw drops) | bed = /bed/ (Mid front, narrower jaw)"},
                {"front": "Minimal pair: /θ/ vs /t/ -> Did you say *three* or *tree*?", "back": "three = /θriː/ (Tongue between teeth, friction) | tree = /triː/ (Tongue on alveolar ridge, plosive)"}
            ]
        }
    }

    # Save JSON database
    with open(os.path.join(out_dir, 'anki_srs_master_guide.json'), 'w', encoding='utf-8') as f:
        json.dump(anki_database, f, ensure_ascii=False, indent=2)

    # Export ready-to-import TSV flashcards
    tsv_path = os.path.join(out_dir, 'anki_import_ready_awl_cloze.tsv')
    with open(tsv_path, 'w', encoding='utf-8') as f:
        f.write("#separator:tab\n#html:true\n#tags column:3\n")
        for card in anki_database["exportable_card_decks"]["awl_core_cloze_deck_tsv"]:
            f.write(f"{card['front']}\t{card['note']}\tAWL_Sublist_1\n")
    print(f"  Exported ready-to-import Anki TSV file: {tsv_path}")

    with open(os.path.join(out_dir, 'README.md'), 'w', encoding='utf-8') as f:
        f.write("# Anki & Spaced Repetition (SRS) Mastery Guide\n\n")
        f.write("> **System:** Anki (`apps.ankiweb.net`)\n")
        f.write("> **Evaluation:** ⭐⭐⭐⭐⭐ (5/5) — Scientifically Proven System for Lifelong Lexical Retention\n\n")
        f.write("## 1. FSRS vs Legacy SM-2 Algorithm\n")
        f.write(f"- **SM-2:** {anki_database['algorithms']['sm2_vs_fsrs']['sm2']}\n")
        f.write(f"- **FSRS:** {anki_database['algorithms']['sm2_vs_fsrs']['fsrs']}\n\n")
        f.write("## 2. The Golden Rules of Knowledge Formulation (Wozniak)\n")
        for r in anki_database["the_20_rules_of_formulating_knowledge_summary"]:
            f.write(f"- {r}\n")
        f.write("\n## 3. Ready-to-Import Flashcards (TSV)\n")
        f.write("The file `anki_import_ready_awl_cloze.tsv` in this directory is formatted for 1-click import directly into Anki desktop or mobile.\n")
    print(f"  Anki SRS guides and decks saved to {out_dir}")

# =====================================================================
# 16. BUSINESS & ECONOMIC ENGLISH (The Economist & HBR)
# =====================================================================
def harvest_business_economic_english():
    print("\n--- Harvesting 16: Business & Economic English (The Economist & HBR) ---")
    out_dir = os.path.join(ROOT_OUTPUT, '16_business_economic_english')
    os.makedirs(out_dir, exist_ok=True)

    econ_database = {
        "title": "Business & Economic English: The Economist Style & Harvard Business Review Analytical Framework",
        "sources": ["economist.com", "hbr.org"],
        "evaluation": "⭐⭐⭐⭐⭐ (5/5) — Gold Standard for Corporate & Macroeconomic English",
        "economist_style_commandments": [
            {"commandment": "1. Never use a metaphor, simile, or other figure of speech which you are used to seeing in print.", "rationale": "Clichés dull the mind and conceal lack of original thought."},
            {"commandment": "2. Never use a long word where a short one will do.", "rationale": "Clarity is power. Prefer 'use' over 'utilize', 'end' over 'terminate'."},
            {"commandment": "3. If it is possible to cut a word out, always cut it out.", "rationale": "Economic prose must be muscular and lean."},
            {"commandment": "4. Never use the passive where you can use the active.", "rationale": "Active verbs identify accountability and establish causality."},
            {"commandment": "5. Never use a foreign phrase, scientific word, or jargon if you can think of an everyday English equivalent.", "rationale": "Jargon alienates intelligent generalist decision-makers."}
        ],
        "macroeconomic_lexicon_for_ielts_and_executives": [
            {"term": "fiscal austerity", "collocation": "enact / impose fiscal austerity", "definition": "Government policies to reduce budget deficits through spending cuts or tax hikes."},
            {"term": "supply chain bottlenecks", "collocation": "alleviate supply chain bottlenecks", "definition": "Congestion points that impede the smooth flow of goods from manufacture to retail."},
            {"term": "inflationary pressures", "collocation": "curb / exacerbate inflationary pressures", "definition": "Factors causing rising price levels across a national economy."},
            {"term": "market penetration", "collocation": "achieve rapid market penetration", "definition": "The degree to which a product or service is adopted by target consumers."},
            {"term": "regulatory headwinds", "collocation": "encounter severe regulatory headwinds", "definition": "Legal and governmental compliance constraints that hinder corporate expansion."},
            {"term": "disruptive innovation", "collocation": "pioneer disruptive innovation", "definition": "Innovations that fundamentally alter how an entire industry operates."}
        ],
        "hbr_case_study_analytical_template": {
            "section_1_executive_summary": "Concise 3-sentence synthesis stating the core strategic dilemma, the root cause, and the recommended intervention.",
            "section_2_strategic_diagnosis": "Evaluating competitive positioning, macroeconomic constraints, and internal operational bottlenecks.",
            "section_3_alternative_options": "Contrasting two mutually exclusive courses of action with explicit risk-benefit trade-offs.",
            "section_4_implementation_roadmap": "Milestone scheduling, resource allocation, and key performance indicators (KPIs)."
        }
    }

    with open(os.path.join(out_dir, 'business_economic_english_guide.json'), 'w', encoding='utf-8') as f:
        json.dump(econ_database, f, ensure_ascii=False, indent=2)

    with open(os.path.join(out_dir, 'README.md'), 'w', encoding='utf-8') as f:
        f.write("# Business & Economic English (The Economist & Harvard Business Review)\n\n")
        f.write("> **Sources:** `economist.com` / `hbr.org`\n")
        f.write("> **Evaluation:** ⭐⭐⭐⭐⭐ (5/5) — Benchmark for Executive Prose & Analytical Writing\n\n")
        f.write("## 1. The Economist Style Commandments (George Orwell's Rules Adapted)\n\n")
        for c in econ_database["economist_style_commandments"]:
            f.write(f"### {c['commandment']}\n")
            f.write(f"*{c['rationale']}*\n\n")
        f.write("## 2. High-Yield Macroeconomic & Strategic Terminology\n\n")
        f.write("| Term | Typical Collocation | Context Definition |\n| :--- | :--- | :--- |\n")
        for row in econ_database["macroeconomic_lexicon_for_ielts_and_executives"]:
            f.write(f"| **{row['term']}** | *{row['collocation']}* | {row['definition']} |\n")
        f.write("\n## 3. Harvard Business Review Case Study Analytical Blueprint\n\n")
        for sec, desc in econ_database["hbr_case_study_analytical_template"].items():
            f.write(f"- **{sec.replace('_', ' ').title()}:** {desc}\n")
    print(f"  Business & Economic English guides saved to {out_dir}")

if __name__ == '__main__':
    harvest_lukes_english_podcast()
    harvest_npr_podcasts()
    harvest_aeon_essays()
    harvest_toastmasters()
    harvest_anki_srs()
    harvest_business_economic_english()
