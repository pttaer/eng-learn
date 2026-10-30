import os
import sys
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT_OUTPUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'research English contents', '5_star_resources'))

catalog = {
    "title": "5-Star English Learning Resources Master Repository",
    "description": "Comprehensive local crawl and structured knowledge base of all 16 Five-Star (⭐⭐⭐⭐⭐ 5/5) resources identified in ENGLISH_LEARNING_SOURCES.md",
    "source_document": "research English contents/ENGLISH_LEARNING_SOURCES.md",
    "total_resources": 16,
    "resources": []
}

resource_metadata = [
    {
        "folder": "01_cambridge_ielts_practice_tests",
        "section": "1.1",
        "name": "Cambridge IELTS Practice Tests (Books 1 – 19)",
        "source": "Cambridge University Press & Assessment",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Testing & Academic IELTS",
        "description": "The absolute gold standard for Academic IELTS testing. Authentic exam structure, raw-to-band score conversion, 14 reading question types taxonomy, distractor analysis, and complete Books 1-19 syllabus."
    },
    {
        "folder": "02_ielts_simon",
        "section": "1.3",
        "name": "IELTS Simon (Simon Corcoran)",
        "source": "ielts-simon.com / Simon IELTS Video Courses",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Testing & Academic IELTS",
        "description": "Ex-examiner minimalist method: 'Simple is best'. Standard 4-paragraph essay frameworks, Task 1 visual report templates without numbers in overviews, speaking frameworks, and 31 authentic archived blog lessons."
    },
    {
        "folder": "03_manchester_academic_phrasebank",
        "section": "2.1",
        "name": "Manchester Academic Phrasebank",
        "source": "phrasebank.manchester.ac.uk (University of Manchester)",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Corpora & Academic Writing",
        "description": "Over 200 academic sentence stems categorized across core research paper stages: Introducing work, Referring to sources, Describing methods, Reporting results, Discussing findings, Writing conclusions, and Hedging/Being critical."
    },
    {
        "folder": "04_skell_sketch_engine",
        "section": "2.2",
        "name": "SKELL (Sketch Engine for Language Learning)",
        "source": "skell.sketchengine.eu",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Corpora & Collocations",
        "description": "Streamlined syntactic collocation engine. Word Sketches, syntactic object/subject collocates, dependent prepositions, and real concordance examples for core academic verbs and nouns."
    },
    {
        "folder": "05_longman_dictionary_ldoce",
        "section": "2.6",
        "name": "Longman Dictionary of Contemporary English (LDOCE Online)",
        "source": "ldoceonline.com",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Lexicography & Grammar Patterns",
        "description": "Learner dictionary benchmark with Longman 2,000 Defining Vocabulary, syntactic complementation grammar patterns (V + -ing vs V + to-inf), and high-band IELTS theme collocation boxes."
    },
    {
        "folder": "06_academic_word_list_awl",
        "section": "2.7",
        "name": "Academic Word List (AWL) by Averil Coxhead",
        "source": "victoria.ac.nz/lals/resources/academicwordlist (Victoria University of Wellington)",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Academic Vocabulary",
        "description": "Complete crawl of all 10 AWL Sublists from Victoria University containing 2,542 word forms across 570 headwords, complete word families (noun, verb, adjective, adverb variations)."
    },
    {
        "folder": "07_purdue_owl",
        "section": "3.1",
        "name": "Purdue OWL (Online Writing Lab)",
        "source": "owl.purdue.edu (Purdue University)",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Academic Writing & Rhetoric",
        "description": "World benchmark for academic composition: Thesis statement formulation formulas (tension & causation), M.E.A.L. paragraph plan, transitional signposts, and wordiness elimination table."
    },
    {
        "folder": "08_dr_geoff_lindsey_phonetics",
        "section": "4.1",
        "name": "Dr. Geoff Lindsey (English Speech Services)",
        "source": "englishspeechservices.com / YouTube Dr. Geoff Lindsey",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Phonetics & Modern RP",
        "description": "Acoustic phonetics and Modern British pronunciation (SSBE). Why traditional IPA charts mislead, the GOAT/FLEECE/TRAP shifts, glottal stop /ʔ/ environments, intrusive /r/, and nuclear tone pitch movements."
    },
    {
        "folder": "09_rachels_english",
        "section": "4.2",
        "name": "Rachel's English",
        "source": "rachelsenglish.com / YouTube Rachel's English",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Phonetics & General American",
        "description": "General American phonetics masterclass. The 4 American T sounds (True, Flap, Stop, Silent), stress-timed rhythm, vowel reduction to schwa /ə/, jaw drop, and chest resonance."
    },
    {
        "folder": "10_youglish",
        "section": "4.4",
        "name": "YouGlish",
        "source": "youglish.com",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Pronunciation in Context",
        "description": "Search query operators (:us, :uk, :aus, #tag, \"quotes\"), 4-stage shadowing methodology (0.75x -> 1.0x -> simultaneous -> recording), and curated high-impact query packs for tricky minimal pairs."
    },
    {
        "folder": "11_lukes_english_podcast",
        "section": "5.1",
        "name": "Luke's English Podcast (LEP)",
        "source": "teacherluke.co.uk",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Listening & Natural British English",
        "description": "CELTA/DELTA extensive listening framework: 1-2 hour unscripted authentic episodes, natural discourse markers, idiom deconstruction, and latest harvested episode feeds."
    },
    {
        "folder": "12_npr_podcasts",
        "section": "5.3",
        "name": "NPR (Planet Money, Fresh Air)",
        "source": "npr.org",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "High-Level Spoken & Analytical Listening",
        "description": "Educated American journalistic audio repository: Planet Money economics, Fresh Air cultural critique, intellectual discourse markers ('As it turns out', 'What struck me was'), and episode transcripts."
    },
    {
        "folder": "13_aeon_essays_psyche",
        "section": "6.1",
        "name": "Aeon Essays & Psyche",
        "source": "aeon.co / psyche.co",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Critical Reading & Intellectual Essays",
        "description": "Long-form intellectual essays across Philosophy, Mind, Ecology, and Society. Model prose for IELTS Reading Passage 3 and Band 9 Task 2, counter-argument moves, and syntactic subordination."
    },
    {
        "folder": "14_toastmasters_international",
        "section": "7.1",
        "name": "Toastmasters International",
        "source": "toastmasters.org",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Speaking, Fluency & Public Discourse",
        "description": "Public speaking & impromptu mastery: P.R.E.P., O.R.E.O., and Past-Present-Future frameworks; Ah-Counter crutch-word elimination; and 5 curated IELTS Part 3 impromptu prompt themes."
    },
    {
        "folder": "15_anki_srs_ecosystem",
        "section": "8.5",
        "name": "Anki & Spaced Repetition System (SRS)",
        "source": "apps.ankiweb.net",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Spaced Repetition & Sentence Mining",
        "description": "FSRS vs SM-2 modern algorithms, Wozniak's 20 Rules of Formulating Knowledge, and ready-to-import flashcard deck (TSV) with cloze deletions for Academic Word List."
    },
    {
        "folder": "16_business_economic_english",
        "section": "8.7",
        "name": "Business & Economic English (The Economist & HBR)",
        "source": "economist.com / hbr.org",
        "rating": "⭐⭐⭐⭐⭐ (5/5)",
        "category": "Business, Economics & Leadership Writing",
        "description": "The Economist Style Guide (George Orwell's 5 rules of lean prose), HBR Case Study Analytical Blueprint, and Master Macroeconomic Lexicon with high-tier collocations."
    }
]

total_files = 0
total_bytes = 0

for meta in resource_metadata:
    folder_path = os.path.join(ROOT_OUTPUT, meta["folder"])
    files = []
    if os.path.exists(folder_path):
        for f in os.listdir(folder_path):
            fp = os.path.join(folder_path, f)
            if os.path.isfile(fp):
                sz = os.path.getsize(fp)
                total_files += 1
                total_bytes += sz
                files.append({"filename": f, "size_bytes": sz})
    meta["files"] = files
    catalog["resources"].append(meta)

catalog["summary"] = {
    "total_resources": len(catalog["resources"]),
    "total_files": total_files,
    "total_size_bytes": total_bytes,
    "total_size_formatted": f"{total_bytes / (1024*1024):.2f} MB"
}

# Save CATALOG.json
catalog_path = os.path.join(ROOT_OUTPUT, 'CATALOG.json')
with open(catalog_path, 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)
print(f"Generated {catalog_path} ({total_files} files, {total_bytes / 1024:.1f} KB)")

# Save README.md
readme_path = os.path.join(ROOT_OUTPUT, 'README.md')
with open(readme_path, 'w', encoding='utf-8') as f:
    f.write("# 5-Star English Learning Resources Master Repository\n\n")
    f.write("> **Source Audit:** [`ENGLISH_LEARNING_SOURCES.md`](../ENGLISH_LEARNING_SOURCES.md)\n")
    f.write(f"> **Selection Filter:** Strictly 5-Star Rated Resources (⭐⭐⭐⭐⭐ 5/5) Only\n")
    f.write(f"> **Total Harvested Resources:** 16 Modules | **Total Local Files:** {total_files} | **Size:** {total_bytes / (1024*1024):.2f} MB\n\n")
    f.write("---\n\n")
    f.write("## Master Inventory Matrix\n\n")
    f.write("| # | Resource Name | Origin / Institution | Category | Local Folder |\n")
    f.write("| :---: | :--- | :--- | :--- | :--- |\n")
    for r in catalog["resources"]:
        f.write(f"| **{r['section']}** | **{r['name']}** | {r['source']} | {r['category']} | [`{r['folder']}/`](./{r['folder']}/) |\n")
    f.write("\n---\n\n")
    f.write("## Detailed Resource Breakdown\n\n")
    for r in catalog["resources"]:
        f.write(f"### {r['section']} {r['name']}\n")
        f.write(f"- **Origin:** {r['source']}\n")
        f.write(f"- **Rating:** {r['rating']}\n")
        f.write(f"- **Category:** {r['category']}\n")
        f.write(f"- **Directory:** [`{r['folder']}/`](./{r['folder']}/)\n")
        f.write(f"- **Description:** {r['description']}\n")
        f.write("- **Files Harvested:**\n")
        for file_info in r["files"]:
            f.write(f"  - [`{file_info['filename']}`](./{r['folder']}/{file_info['filename']}) ({file_info['size_bytes'] / 1024:.1f} KB)\n")
        f.write("\n")
    f.write("---\n\n")
    f.write("## How to Utilize this Local Knowledge Base\n\n")
    f.write("1. **For App Developers & Engine Integration:**\n")
    f.write("   - All structured data is preserved in clean `.json` files inside each directory, ready for immediate parsing by TypeScript/Python engines.\n")
    f.write("2. **For Anki Flashcard Learners:**\n")
    f.write("   - Flashcards in `15_anki_srs_ecosystem/anki_import_ready_awl_cloze.tsv` can be imported directly into Anki with 1 click.\n")
    f.write("3. **For Essay Writers & IELTS Candidates:**\n")
    f.write("   - Consult `03_manchester_academic_phrasebank/` for discourse stems, `02_ielts_simon/` for essay planning, and `07_purdue_owl/` for thesis formulation.\n")
    f.write("4. **For Pronunciation & Speaking Trainees:**\n")
    f.write("   - Compare Modern British RP in `08_dr_geoff_lindsey_phonetics/` with General American in `09_rachels_english/`, and practice impromptu speaking with `14_toastmasters_international/`.\n")

print(f"Generated {readme_path}")
