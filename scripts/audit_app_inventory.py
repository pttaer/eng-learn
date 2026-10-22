import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def load_json(rel_path):
    p = os.path.abspath(rel_path)
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

print("=" * 80)
print("APP CONTENT & QUESTION INVENTORY AUDIT")
print("=" * 80)

levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

# 1. Collocations
colloc_data = load_json('web/src/assets/data/collocations.json') or []
colloc_by_lvl = {lvl: 0 for lvl in levels}
for c in colloc_data:
    lvl = c.get('cefrLevel', '')
    if lvl in colloc_by_lvl:
        colloc_by_lvl[lvl] += 1

# 2. Grammar Rules
grammar_data = load_json('web/src/assets/data/grammar.json') or []
grammar_by_lvl = {lvl: 0 for lvl in levels}
for g in grammar_data:
    lvl = g.get('cefrLevel', '')
    if lvl in grammar_by_lvl:
        grammar_by_lvl[lvl] += 1

# 3. Base Vocabulary
base_vocab = load_json('web/src/assets/data/vocabulary.json') or []
base_vocab_by_lvl = {lvl: 0 for lvl in levels}
for v in base_vocab:
    lvl = v.get('cefrLevel', '')
    if lvl in base_vocab_by_lvl:
        base_vocab_by_lvl[lvl] += 1

# 4. IOT Topic Vocabulary (Enriched Academic Lexicon)
iot_vocab = load_json('web/src/assets/data/iot-vocabulary.json') or []
iot_vocab_by_lvl = {lvl: 0 for lvl in levels}
for iv in iot_vocab:
    lvl = iv.get('cefrLevel', '')
    if lvl in iot_vocab_by_lvl:
        iot_vocab_by_lvl[lvl] += 1

# 5. Reading Articles & Comprehension Questions
reading_data = load_json('web/src/assets/data/reading.json') or {}
reading_articles = reading_data.get('articles', [])
reading_articles_by_lvl = {lvl: 0 for lvl in levels}
reading_questions_by_lvl = {lvl: 0 for lvl in levels}
for a in reading_articles:
    lvl = a.get('cefrLevel', '')
    if lvl in reading_articles_by_lvl:
        reading_articles_by_lvl[lvl] += 1
    fpp = a.get('fourPassProtocol', {})
    if isinstance(fpp, dict):
        p1 = fpp.get('pass1ColdRead', {})
        checks = p1.get('comprehensionChecks', []) if isinstance(p1, dict) else []
        if lvl in reading_questions_by_lvl:
            reading_questions_by_lvl[lvl] += len(checks)

# 6. Speaking Drills
drills_data = load_json('web/src/assets/data/drills.json') or {}
spk_drills_by_lvl = {lvl: 0 for lvl in levels}
for s in drills_data.get('speaking', []):
    lvl = s.get('cefrLevel', '')
    if lvl in spk_drills_by_lvl:
        spk_drills_by_lvl[lvl] += 1

# 7. Writing Drills
wrt_drills_by_lvl = {lvl: 0 for lvl in levels}
for w in drills_data.get('writing', []):
    lvl = w.get('cefrLevel', '')
    if lvl in wrt_drills_by_lvl:
        wrt_drills_by_lvl[lvl] += 1

# 8. Communicative Scenarios
scenarios_by_lvl = {lvl: 0 for lvl in levels}
for sc in drills_data.get('scenarios', []):
    lvl = sc.get('cefrLevel', '')
    if lvl in scenarios_by_lvl:
        scenarios_by_lvl[lvl] += 1

# 9. Diagnostic Questions
diag_data = load_json('web/src/assets/data/diagnostic-questions.json') or []
diag_by_lvl = {lvl: 0 for lvl in levels}
for d in diag_data:
    lvl = d.get('level', '')
    if lvl in diag_by_lvl:
        diag_by_lvl[lvl] += 1

print("\n--- 1. CEFR LEVELS BREAKDOWN ---")
print(f"{'Level':<6} | {'Collocations':<12} | {'Grammar':<8} | {'Base Vocab':<10} | {'IOT Vocab':<10} | {'Readings':<9} | {'Reading Qs':<10} | {'Spk Drills':<10} | {'Wrt Drills':<10} | {'Scenarios':<9} | {'Diag Qs':<8} | {'Total Items':<11}")
print("-" * 145)

for lvl in levels:
    total_lvl = (colloc_by_lvl[lvl] + grammar_by_lvl[lvl] + base_vocab_by_lvl[lvl] +
                 iot_vocab_by_lvl[lvl] + reading_articles_by_lvl[lvl] + reading_questions_by_lvl[lvl] +
                 spk_drills_by_lvl[lvl] + wrt_drills_by_lvl[lvl] + scenarios_by_lvl[lvl] + diag_by_lvl[lvl])
    print(f"{lvl:<6} | {colloc_by_lvl[lvl]:<12} | {grammar_by_lvl[lvl]:<8} | {base_vocab_by_lvl[lvl]:<10} | {iot_vocab_by_lvl[lvl]:<10} | {reading_articles_by_lvl[lvl]:<9} | {reading_questions_by_lvl[lvl]:<10} | {spk_drills_by_lvl[lvl]:<10} | {wrt_drills_by_lvl[lvl]:<10} | {scenarios_by_lvl[lvl]:<9} | {diag_by_lvl[lvl]:<8} | {total_lvl:<11}")

print("-" * 145)
total_all_cefr = sum(
    colloc_by_lvl[l] + grammar_by_lvl[l] + base_vocab_by_lvl[l] + iot_vocab_by_lvl[l] +
    reading_articles_by_lvl[l] + reading_questions_by_lvl[l] + spk_drills_by_lvl[l] +
    wrt_drills_by_lvl[l] + scenarios_by_lvl[l] + diag_by_lvl[l] for l in levels
)
print(f"{'TOTAL':<6} | {sum(colloc_by_lvl.values()):<12} | {sum(grammar_by_lvl.values()):<8} | {sum(base_vocab_by_lvl.values()):<10} | {sum(iot_vocab_by_lvl.values()):<10} | {sum(reading_articles_by_lvl.values()):<9} | {sum(reading_questions_by_lvl.values()):<10} | {sum(spk_drills_by_lvl.values()):<10} | {sum(wrt_drills_by_lvl.values()):<10} | {sum(scenarios_by_lvl.values()):<9} | {sum(diag_by_lvl.values()):<8} | {total_all_cefr:<11}")


# --- IELTS SIDE ---
print("\n--- 2. IELTS SUITE BREAKDOWN ---")

# Reading
ielts_reading = load_json('web/src/ielts/data/reading.json') or []
ielts_rd_passages = len(ielts_reading)
ielts_rd_questions = sum(len(p.get('questions', [])) for p in ielts_reading)

# Listening
ielts_listening = load_json('web/src/ielts/data/listening.json') or []
ielts_ls_sections = len(ielts_listening)
ielts_ls_questions = sum(len(s.get('questions', [])) for s in ielts_listening)

# Speaking
ielts_speaking = load_json('web/src/ielts/data/speaking.json') or {}
ielts_spk_part1_topics = len(ielts_speaking.get('part1', []))
ielts_spk_part1_qs = sum(len(t.get('questions', [])) for t in ielts_speaking.get('part1', []))
ielts_spk_part2_cards = len(ielts_speaking.get('part2', []))

# Writing Task 1
ielts_wrt1 = load_json('web/src/ielts/data/writing1.json') or []
ielts_wrt1_prompts = len(ielts_wrt1)

# Writing Task 2
ielts_wrt2 = load_json('web/src/ielts/data/writing2.json') or []
ielts_wrt2_prompts = len(ielts_wrt2)

# Vocab Core
ielts_vocab_core = load_json('web/src/ielts/data/vocab.json') or []
ielts_vocab_core_count = len(ielts_vocab_core)

# Vocab IOT
ielts_vocab_iot = load_json('web/src/assets/data/iot-vocabulary.json') or []
ielts_vocab_iot_count = len(ielts_vocab_iot)

# Strategy Blueprints
ielts_strategy = load_json('web/src/ielts/data/strategy.json') or []
ielts_strategy_count = len(ielts_strategy)

# Tips Vault
ielts_tips = load_json('web/src/assets/data/ielts-tips.json') or []
ielts_tips_count = len(ielts_tips)

# Mock Tests
ielts_mock = load_json('web/src/ielts/data/ielts-mock.json') or {}

print(f"{'IELTS Module / Skill':<35} | {'Content Units / Passages':<26} | {'Target Questions / Prompts':<28} | {'Description & Rubrics':<35}")
print("-" * 130)
print(f"{'Reading (Academic Passages)':<35} | {ielts_rd_passages:<26} | {ielts_rd_questions:<28} | {'Timed tests, 14 question types'}")
print(f"{'Listening (Audio Sections 1-4)':<35} | {ielts_ls_sections:<26} | {ielts_ls_questions:<28} | {'Audio scripts, traps, official scoring'}")
print(f"{'Speaking Part 1 (Interview)':<35} | {ielts_spk_part1_topics} topics{'':<19} | {ielts_spk_part1_qs} interview questions{'':<8} | {'Band 7-9 model answers & audio'}")
print(f"{'Speaking Part 2 (Cue Cards)':<35} | {ielts_spk_part2_cards} cue card prompts{'':<10} | {ielts_spk_part2_cards} timed tasks{'':<17} | {'1-min prep notepad & comparative models'}")
print(f"{'Writing Task 1 (Academic Charts)':<35} | {ielts_wrt1_prompts} visual prompts{'':<11} | {ielts_wrt1_prompts} complete essays{'':<13} | {'Band 9 model essays, charts, rubrics'}")
print(f"{'Writing Task 2 (Discursive Essays)':<35} | {ielts_wrt2_prompts} essay prompts{'':<12} | {ielts_wrt2_prompts} complete essays{'':<13} | {'Band 9 models, 4-sentence paragraph engine'}")
print(f"{'Core Academic Vocabulary Deck':<35} | {ielts_vocab_core_count} headwords (20 topics){'':<2} | {ielts_vocab_core_count} SM-2 cards{'':<16} | {'Collocations, paraphrases, examples'}")
print(f"{'IOT Master Topic Lexicon':<35} | {ielts_vocab_iot_count} headwords (171 topics){'':<1} | {ielts_vocab_iot_count} SM-2 cards{'':<16} | {'10,015 collocations & Vietnamese meanings'}")
print(f"{'Tactical Exam Blueprints':<35} | {ielts_strategy_count} algorithm blueprints{'':<5} | {ielts_strategy_count} question frameworks{'':<8} | {'14 reading types, traps, synonym tables'}")
print(f"{'IELTS Knowledge Vault & Tips':<35} | {ielts_tips_count} full master articles{'':<6} | {ielts_tips_count} lesson guides{'':<15} | {'415k words across 7 core skills'}")
print("-" * 130)

total_ielts_units = (ielts_rd_passages + ielts_ls_sections + ielts_spk_part1_topics + ielts_spk_part2_cards +
                     ielts_wrt1_prompts + ielts_wrt2_prompts + ielts_vocab_core_count + ielts_vocab_iot_count +
                     ielts_strategy_count + ielts_tips_count)
total_ielts_questions = (ielts_rd_questions + ielts_ls_questions + ielts_spk_part1_qs + ielts_spk_part2_cards +
                         ielts_wrt1_prompts + ielts_wrt2_prompts + ielts_vocab_core_count + ielts_vocab_iot_count +
                         ielts_strategy_count + ielts_tips_count)

print(f"{'TOTAL IELTS SIDE':<35} | {total_ielts_units:<26} | {total_ielts_questions:<28} | {'Complete Academic IELTS Ecosystem'}")
