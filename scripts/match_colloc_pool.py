import json

with open('data/scraped_ielts_vocab_raw.json', 'r', encoding='utf-8') as f:
    topics = json.load(f)

with open('web/src/ielts/data/vocab.json', 'r', encoding='utf-8') as f:
    ielts_vocab = json.load(f)

with open('web/src/assets/data/collocations.json', 'r', encoding='utf-8') as f:
    cefr_colloc = json.load(f)

# Build a lookup of words to collocations from our existing databases
colloc_pool = {}

for v in ielts_vocab:
    w = v['word'].lower()
    colloc_pool.setdefault(w, []).extend(v.get('collocations', []))
    for c in v.get('collocations', []):
        for part in c.lower().split():
            colloc_pool.setdefault(part, []).append(c)

for c in cefr_colloc:
    phrase = c['phrase']
    for part in phrase.lower().split():
        colloc_pool.setdefault(part, []).append(phrase)

# Check how many scraped terms find matches in colloc_pool
all_terms = set()
for t in topics:
    for item in t.get('items', []):
        all_terms.add(item['word'].lower())

matched = sum(1 for term in all_terms if term in colloc_pool or any(w in colloc_pool for w in term.split()))
print(f"Total unique terms: {len(all_terms)}")
print(f"Terms with existing matched collocations in pool: {matched} ({matched/len(all_terms)*100:.1f}%)")
