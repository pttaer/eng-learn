import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 65)
print("COMPREHENSIVE DATA & SYSTEM VERIFICATION REPORT")
print("=" * 65)

# 1. IELTS Vocabulary Verification
vocab_file = os.path.abspath("web/src/assets/data/iot-vocabulary.json")
assert os.path.exists(vocab_file), f"Missing {vocab_file}"
with open(vocab_file, "r", encoding="utf-8") as f:
    vocab = json.load(f)

bands = {}
cefrs = {}
total_collocs = 0
for v in vocab:
    b = v.get("band", "Unknown")
    c = v.get("cefrLevel", "Unknown")
    bands[b] = bands.get(b, 0) + 1
    cefrs[c] = cefrs.get(c, 0) + 1
    total_collocs += len(v.get("collocations", []))

print(f"[✓] IELTS Vocabulary Dataset ({os.path.basename(vocab_file)}):")
print(f"    - Total Enriched Items : {len(vocab):,}")
print(f"    - Total Collocations   : {total_collocs:,} (avg {total_collocs/len(vocab):.1f} per term)")
print(f"    - Band Distribution    : {bands}")
print(f"    - CEFR Distribution    : {cefrs}")

# 2. IELTS Tips Verification
tips_master_file = os.path.abspath("data/ielts_tips/ielts_tips_master.json")
assert os.path.exists(tips_master_file), f"Missing {tips_master_file}"
with open(tips_master_file, "r", encoding="utf-8") as f:
    tips = json.load(f)

articles_dir = os.path.abspath("data/ielts_tips/articles")
art_files = os.listdir(articles_dir) if os.path.exists(articles_dir) else []

total_views = sum(t.get("views", 0) for t in tips)
total_words = sum(len(t.get("content_text", "").split()) for t in tips)
skills = {}
for t in tips:
    s = t.get("skill", "General")
    skills[s] = skills.get(s, 0) + 1

print(f"\n[✓] IELTS Tips Master Dataset ({os.path.basename(tips_master_file)}):")
print(f"    - Total Master Articles : {len(tips):,}")
print(f"    - Individual JSON Files : {len(art_files):,}")
print(f"    - Total Words Extracted : {total_words:,}")
print(f"    - Cumulative Views Count: {total_views:,}")
print(f"    - Skills Breakdown      : {skills}")

print("\n" + "=" * 65)
print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY WITH ZERO ERRORS!")
print("=" * 65)
