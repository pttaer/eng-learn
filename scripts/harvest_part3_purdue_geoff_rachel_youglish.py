import os
import sys
import json
import urllib.request
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
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  [WARN] Failed fetch {url}: {e}")
        return None

# =====================================================================
# 7. PURDUE OWL (Online Writing Lab)
# =====================================================================
def harvest_purdue_owl():
    print("\n--- Harvesting 07: Purdue OWL (Online Writing Lab) ---")
    out_dir = os.path.join(ROOT_OUTPUT, '07_purdue_owl')
    os.makedirs(out_dir, exist_ok=True)

    purdue_database = {
        "title": "Purdue Online Writing Lab (OWL) Academic Writing Guide",
        "institution": "Purdue University",
        "url": "https://owl.purdue.edu",
        "evaluation": "⭐⭐⭐⭐⭐ (5/5) — The Bible of Academic Writing & Rhetoric",
        "thesis_statement_mastery": {
            "definition": "A thesis statement tells the reader how you will interpret the significance of the subject matter under discussion. It is a road map for the paper.",
            "core_characteristics": [
                "It makes an argumentative claim, not a factual statement.",
                "It takes a stand rather than simply announcing a topic.",
                "It is narrow and specific enough to be defended within the word limit.",
                "It passes the 'So What?' and 'How and Why?' tests."
            ],
            "formula_frameworks": [
                {
                    "type": "Tension / Counter-argument Thesis Formula",
                    "formula": "Although [Opposing viewpoint / Concession], [Your argument / Thesis claim] because [Reason 1] and [Reason 2].",
                    "example": "Although proponents argue that automated surveillance deters urban crime, pervasive algorithmic tracking disproportionately infringes upon civil liberties without demonstrably improving long-term public safety."
                },
                {
                    "type": "Causal / Policy Thesis Formula",
                    "formula": "Because of [Root cause X], [Actor Y] must implement [Policy Z] in order to [Outcome W].",
                    "example": "Because rapid urban sprawl accelerates agricultural land degradation, municipal governments must enforce dense zoning regulations in order to preserve ecological biodiversity."
                }
            ]
        },
        "paragraph_architecture": {
            "meal_plan": {
                "M": "Main Idea (Topic sentence asserting a clear mini-claim)",
                "E": "Evidence (Data, research findings, citations, statistics, facts)",
                "A": "Analysis (Explaining *how* the evidence proves the main idea; unpack significance)",
                "L": "Link (Connecting back to the overarching thesis or bridging to the next paragraph)"
            },
            "transitions_and_signposting": {
                "addition": ["furthermore", "moreover", "in addition to", "notably"],
                "contrast": ["conversely", "nevertheless", "notwithstanding", "on the contrary"],
                "causation": ["consequently", "thereby", "as a direct consequence of", "engenders"],
                "concession": ["admittedly", "while it is acknowledged that", "granted that"],
                "exemplification": ["to illustrate", "a salient case in point is", "exemplified by"]
            }
        },
        "academic_style_and_concision": {
            "eliminating_wordiness": [
                {"inflated": "due to the fact that", "concise": "because / since"},
                {"inflated": "at the present point in time", "concise": "currently / now"},
                {"inflated": "in the event that", "concise": "if"},
                {"inflated": "conduct an investigation of", "concise": "investigate"},
                {"inflated": "has the capability to", "concise": "can"}
            ],
            "passive_voice_calibration": {
                "principle": "Prefer active voice for agency and argumentative momentum. Reserve passive voice specifically when the agent is unknown, irrelevant, or when emphasizing the object or experimental procedure.",
                "good_passive": "The participants were randomly assigned to two treatment groups. (Methodological objectivity)",
                "weak_passive": "Mistakes were made by researchers during the process. (Evasive hedging)"
            }
        }
    }

    with open(os.path.join(out_dir, 'purdue_owl_academic_writing.json'), 'w', encoding='utf-8') as f:
        json.dump(purdue_database, f, ensure_ascii=False, indent=2)

    with open(os.path.join(out_dir, 'README.md'), 'w', encoding='utf-8') as f:
        f.write("# Purdue OWL (Online Writing Lab) Academic Writing Bible\n\n")
        f.write("> **Institution:** Purdue University (`owl.purdue.edu`)\n")
        f.write("> **Evaluation:** ⭐⭐⭐⭐⭐ (5/5) — World Benchmark for Academic Writing & Argumentation\n\n")
        f.write("## 1. Crafting Bulletproof Thesis Statements\n")
        f.write("A weak thesis merely states a fact or announces a topic (*This essay will discuss renewable energy*). A strong academic thesis takes a contestable stand with clear tension:\n\n")
        for formula in purdue_database["thesis_statement_mastery"]["formula_frameworks"]:
            f.write(f"### {formula['type']}\n")
            f.write(f"- **Formula:** `{formula['formula']}`\n")
            f.write(f"- **Model:** *\"{formula['example']}\"*\n\n")
        f.write("## 2. Paragraph Architecture: The M.E.A.L. Plan\n")
        f.write("Every high-scoring body paragraph must strictly satisfy all four M.E.A.L. components:\n")
        meal = purdue_database["paragraph_architecture"]["meal_plan"]
        for k, v in meal.items():
            f.write(f"- **[{k}]**: {v}\n")
        f.write("\n## 3. Eliminating Wordiness (Style Guide)\n\n")
        f.write("| Inflated Phrase | Academic Concise Replacement |\n| :--- | :--- |\n")
        for row in purdue_database["academic_style_and_concision"]["eliminating_wordiness"]:
            f.write(f"| {row['inflated']} | **{row['concise']}** |\n")
    print(f"  Purdue OWL guides saved to {out_dir}")

# =====================================================================
# 8. DR. GEOFF LINDSEY (English Speech Services)
# =====================================================================
def harvest_dr_geoff_lindsey():
    print("\n--- Harvesting 08: Dr. Geoff Lindsey (English Speech Services) ---")
    out_dir = os.path.join(ROOT_OUTPUT, '08_dr_geoff_lindsey_phonetics')
    os.makedirs(out_dir, exist_ok=True)

    # Let's fetch sample article from englishspeechservices.com
    ess_url = 'https://englishspeechservices.com/blog/'
    print(f"  Fetching articles from {ess_url}...")
    html = safe_fetch(ess_url)
    blog_articles = []
    if html:
        soup = BeautifulSoup(html, 'html.parser')
        for art in soup.select('article')[:6]:
            h2 = art.find(['h2', 'h1'])
            title = h2.get_text().strip() if h2 else "Phonetics Article"
            p = art.find('p')
            desc = p.get_text().strip() if p else ""
            blog_articles.append({"title": title, "summary": desc})

    lindsey_phonetics = {
        "title": "Dr. Geoff Lindsey: Modern RP (Received Pronunciation) & Acoustic Phonetics",
        "author": "Dr. Geoff Lindsey (PhD, Linguistics, University College London)",
        "source": "englishspeechservices.com / YouTube Dr. Geoff Lindsey",
        "evaluation": "⭐⭐⭐⭐⭐ (5/5) — Pinnacle of Modern British Phonetics",
        "modern_rp_vowel_shifts": [
            {
                "vowel": "GOAT vowel (Trad IPA: /əʊ/ -> Modern: /əw/ or /ʌw/)",
                "description": "The traditional BBC diphthong started back; in modern British speech, it begins with an unrounded central or open-mid vowel before gliding towards [w]."
            },
            {
                "vowel": "TRAP vowel (Trad IPA: /æ/ -> Modern: /a/)",
                "description": "Modern British speakers pronounce TRAP as a fully open front vowel [a], not the tense, raised [æ] of 1950s BBC or General American."
            },
            {
                "vowel": "FOOT vs STRUT split",
                "description": "Crucial distinction for non-native speakers: /ʊ/ in 'put', 'book' is rounded and near-back; /ʌ/ in 'cut', 'strut' is open-mid central [ɐ]."
            },
            {
                "vowel": "FLEECE vowel (Trad IPA: /iː/ -> Modern: /ɪj/)",
                "description": "The FLEECE vowel is not a static monophthong; it is phonetically a closing diphthong starting near [ɪ] and ending in high glide [j]."
            }
        ],
        "connected_speech_phenomena": {
            "glottal_replacement": {
                "symbol": "/ʔ/",
                "rule": "In modern British speech, /t/ is frequently replaced with a glottal stop [ʔ] when followed by another consonant (e.g. *network* [neʔwɜːk], *football* [fʊʔbɔːl]), or word-finally before a consonant (*get back* [geʔ bæk])."
            },
            "linking_and_intrusive_r": {
                "rule": "In non-rhotic British pronunciation, an /r/ sound is inserted between two words when the first word ends in a non-high vowel (/ə/, /ɔː/, /ɑː/) and the next word starts with a vowel, even if no 'r' is written (e.g. *law and order* -> 'law-r-and order', *idea of* -> 'idea-r-of')."
            },
            "yod_coalescence": {
                "rule": "/t/ + /j/ merges into /tʃ/ ('tune' -> /tʃuːn/); /d/ + /j/ merges into /dʒ/ ('during' -> /dʒʊərɪŋ/)."
            }
        },
        "intonation_and_nucleus": {
            "rule": "Every intonation phrase in English has exactly ONE nucleus (tonic syllable) where the main pitch movement occurs. Placing the nucleus on the wrong syllable distorts information structure (given vs new information)."
        },
        "harvested_articles": blog_articles
    }

    with open(os.path.join(out_dir, 'geoff_lindsey_modern_phonetics.json'), 'w', encoding='utf-8') as f:
        json.dump(lindsey_phonetics, f, ensure_ascii=False, indent=2)

    with open(os.path.join(out_dir, 'README.md'), 'w', encoding='utf-8') as f:
        f.write("# Dr. Geoff Lindsey: Modern British RP Phonetics Guide\n\n")
        f.write("> **Expert:** Dr. Geoff Lindsey (UCL Linguistics, Director of English Speech Services)\n")
        f.write("> **Evaluation:** ⭐⭐⭐⭐⭐ (5/5) — World Authority on Contemporary British Pronunciation\n\n")
        f.write("## 1. Why Traditional IPA Charts Lie to English Learners\n")
        f.write("Most textbooks still teach the 1960s Gimson notation designed for upper-class Queen's English. Modern British English (SSBE / Modern RP) has undergone dramatic phonetic shifts:\n\n")
        for shift in lindsey_phonetics["modern_rp_vowel_shifts"]:
            f.write(f"### {shift['vowel']}\n")
            f.write(f"{shift['description']}\n\n")
        f.write("## 2. Connected Speech Mechanics\n\n")
        f.write("### Glottal Replacement (/ʔ/)\n")
        f.write(f"{lindsey_phonetics['connected_speech_phenomena']['glottal_replacement']['rule']}\n\n")
        f.write("### Linking & Intrusive /r/\n")
        f.write(f"{lindsey_phonetics['connected_speech_phenomena']['linking_and_intrusive_r']['rule']}\n\n")
        f.write("### The Intonation Nucleus (Tonic Syllable)\n")
        f.write(f"{lindsey_phonetics['intonation_and_nucleus']['rule']}\n\n")
    print(f"  Dr. Geoff Lindsey guides saved to {out_dir}")

# =====================================================================
# 9. RACHEL'S ENGLISH
# =====================================================================
def harvest_rachels_english():
    print("\n--- Harvesting 09: Rachel's English ---")
    out_dir = os.path.join(ROOT_OUTPUT, '09_rachels_english')
    os.makedirs(out_dir, exist_ok=True)

    rachel_guide = {
        "title": "Rachel's English: General American Pronunciation & Connected Speech",
        "author": "Rachel Smith",
        "url": "https://rachelsenglish.com",
        "evaluation": "⭐⭐⭐⭐⭐ (5/5) — Gold Standard for General American Pronunciation",
        "the_4_american_t_sounds": [
            {
                "type": "1. True T [t]",
                "environment": "At the start of a word or stressed syllable (e.g. *time, return*), or in a consonant cluster like /st/, /tr/ (*stay, train*).",
                "mechanic": "Clear air burst / puff of air released from the alveolar ridge."
            },
            {
                "type": "2. Flap T [ɾ]",
                "environment": "When T falls between two vowel sounds and the second syllable is unstressed (e.g. *water, city, better, butter, get it*).",
                "mechanic": "The tongue tip quickly strikes the alveolar ridge once without building up air pressure. Sounds identical to a quick Spanish single 'r'."
            },
            {
                "type": "3. Stop T / Glottal Stop [t̚]",
                "environment": "At the end of a word when followed by a consonant sound, or before /n/ (e.g. *fitness, button, written, that book, wait for*).",
                "mechanic": "Air is stopped completely in the vocal tract or at the vocal cords, but NOT released."
            },
            {
                "type": "4. Silent T [ø]",
                "environment": "Commonly dropped after 'N' in casual conversational American speech (e.g. *internet* -> 'innernet', *twenty* -> 'twenny', *center* -> 'cenner')."
            }
        ],
        "american_rhythm_and_reductions": {
            "principle": "English is a stress-timed language. Native speakers do not pronounce every word with equal duration. Content words (nouns, main verbs, adjectives) are stressed long and high; function words (prepositions, pronouns, auxiliary verbs) are compressed and reduced to the schwa /ə/.",
            "common_reductions": [
                {"full": "to", "reduced": "/tə/", "example": "I want to go -> I wanna go"},
                {"full": "for", "reduced": "/fər/", "example": "This is for you -> /fər juː/"},
                {"full": "and", "reduced": "/ən/ or /n/", "example": "Black and white -> /blæk ən waɪt/"},
                {"full": "can", "reduced": "/kən/", "example": "I can do it -> /aɪ kən duː ɪt/ (Unstressed)"},
                {"full": "have", "reduced": "/əv/", "example": "Could have -> could've /kʊdəv/"}
            ]
        },
        "mouth_mechanics": {
            "jaw_drop": "American vowels (/æ/, /ɑː/, /ɔː/) require significant downward jaw drop. Non-native speakers, especially Vietnamese speakers, tend to keep the mouth too closed.",
            "vocal_placement": "American English resonates in the chest and throat, giving it a rich, resonant acoustic quality, compared to British head/nasal placement."
        }
    }

    with open(os.path.join(out_dir, 'rachels_english_american_phonetics.json'), 'w', encoding='utf-8') as f:
        json.dump(rachel_guide, f, ensure_ascii=False, indent=2)

    with open(os.path.join(out_dir, 'README.md'), 'w', encoding='utf-8') as f:
        f.write("# Rachel's English: American Pronunciation & Connected Speech\n\n")
        f.write("> **Author:** Rachel Smith (`rachelsenglish.com`)\n")
        f.write("> **Evaluation:** ⭐⭐⭐⭐⭐ (5/5) — Master Reference for General American Accent\n\n")
        f.write("## 1. The 4 American 'T' Rules\n")
        f.write("Mastering the 4 pronunciations of the letter 'T' is the single highest-leverage skill for natural American speech:\n\n")
        for t in rachel_guide["the_4_american_t_sounds"]:
            f.write(f"### {t['type']}\n")
            f.write(f"- **Environment:** {t['environment']}\n")
            if 'mechanic' in t:
                f.write(f"- **Mechanics:** {t['mechanic']}\n\n")
            else:
                f.write("\n")
        f.write("## 2. American Rhythm & Reductions\n")
        f.write(f"{rachel_guide['american_rhythm_and_reductions']['principle']}\n\n")
        f.write("| Full Form | Reduced Form | Context Example |\n| :--- | :---: | :--- |\n")
        for r in rachel_guide["american_rhythm_and_reductions"]["common_reductions"]:
            f.write(f"| `{r['full']}` | `{r['reduced']}` | *{r['example']}* |\n")
    print(f"  Rachel's English guides saved to {out_dir}")

# =====================================================================
# 10. YOUGLISH
# =====================================================================
def harvest_youglish():
    print("\n--- Harvesting 10: YouGlish ---")
    out_dir = os.path.join(ROOT_OUTPUT, '10_youglish')
    os.makedirs(out_dir, exist_ok=True)

    youglish_guide = {
        "title": "YouGlish: Video Speech Mining & Shadowing Engine",
        "url": "https://youglish.com",
        "evaluation": "⭐⭐⭐⭐⭐ (5/5) — #1 Tool for In-Context Spoken Pronunciation",
        "power_query_operators": [
            {"operator": ":us, :uk, :aus", "description": "Filter results exclusively by accent region", "example": "schedule :uk vs schedule :us"},
            {"operator": ":m, :f", "description": "Filter by male or female speaker", "example": "entrepreneurship :f"},
            {"operator": "\"phrase in quotes\"", "description": "Search exact multi-word chunks and collocations", "example": "\"in terms of\" :us"},
            {"operator": "#topic", "description": "Filter by context/genre hashtag (e.g. #business, #science, #medical)", "example": "hypothesis #science"}
        ],
        "four_stage_shadowing_protocol": [
            {
                "stage": "Stage 1: Comprehension & Audio Calibration (Speed 0.75x)",
                "action": "Listen to the YouGlish clip without speaking. Read the subtitles to ensure 100% semantic comprehension and note where the speaker pauses and breathes."
            },
            {
                "stage": "Stage 2: Delayed Shadowing with Subtitles (Speed 1.0x)",
                "action": "Play the clip at normal speed. Speak out loud approximately 1–2 words behind the speaker, mimicking the exact pitch contour and word reductions."
            },
            {
                "stage": "Stage 3: Simultaneous Shadowing without Subtitles",
                "action": "Close your eyes or look away from the text. Speak at the exact same millisecond as the native speaker, locking into rhythm and chest resonance."
            },
            {
                "stage": "Stage 4: Recording & Acoustic Comparison",
                "action": "Record your own voice speaking the sentence. Play your recording alongside the YouGlish native clip to pinpoint dropped consonant clusters or pitch errors."
            }
        ],
        "curated_high_impact_queries": [
            {"target": "Academic Signposts", "queries": ["\"on the contrary\" :uk", "\"a case in point\" :us", "\"in sharp contrast to\" :uk"]},
            {"target": "Tricky Minimal Pairs for Vietnamese Learners", "queries": ["sheep vs ship :us", "fool vs full :uk", "leave vs live :us"]},
            {"target": "Ending Consonants /t/ /d/ /s/ /z/", "queries": ["\"texts and emails\" :us", "\"fixed costs\" :uk", "\"products and services\" :us"]},
            {"target": "High-Band IELTS Speaking Idioms", "queries": ["\"cost an arm and a leg\"", "\"at the drop of a hat\"", "\"once in a blue moon\""]}
        ]
    }

    with open(os.path.join(out_dir, 'youglish_speech_mining_guide.json'), 'w', encoding='utf-8') as f:
        json.dump(youglish_guide, f, ensure_ascii=False, indent=2)

    with open(os.path.join(out_dir, 'README.md'), 'w', encoding='utf-8') as f:
        f.write("# YouGlish: In-Context Speech Mining & Shadowing Masterclass\n\n")
        f.write("> **Platform:** YouGlish (`youglish.com`)\n")
        f.write("> **Evaluation:** ⭐⭐⭐⭐⭐ (5/5) — Supreme Real-World Spoken English Tool\n\n")
        f.write("## 1. Power Query Syntax Cheat Sheet\n\n")
        f.write("| Operator | Description | Practical Example |\n| :--- | :--- | :--- |\n")
        for op in youglish_guide["power_query_operators"]:
            f.write(f"| `{op['operator']}` | {op['description']} | `{op['example']}` |\n")
        f.write("\n## 2. The 4-Stage Shadowing Protocol\n")
        for st in youglish_guide["four_stage_shadowing_protocol"]:
            f.write(f"### {st['stage']}\n")
            f.write(f"{st['action']}\n\n")
        f.write("## 3. Curated High-Impact Query Packs\n\n")
        for pack in youglish_guide["curated_high_impact_queries"]:
            f.write(f"### {pack['target']}\n")
            for q in pack["queries"]:
                f.write(f"- `{q}`\n")
            f.write("\n")
    print(f"  YouGlish guides saved to {out_dir}")

if __name__ == '__main__':
    harvest_purdue_owl()
    harvest_dr_geoff_lindsey()
    harvest_rachels_english()
    harvest_youglish()
