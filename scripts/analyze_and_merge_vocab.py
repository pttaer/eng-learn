import json
import os
import re

# Load scraped raw data
with open('data/scraped_ielts_vocab_raw.json', 'r', encoding='utf-8') as f:
    scraped_topics = json.load(f)

# Flatten items
raw_items = []
for topic in scraped_topics:
    for item in topic.get('items', []):
        raw_items.append(item)

print(f"Total raw scraped items: {len(raw_items)}")

# Check unique terms
unique_dict = {}
for item in raw_items:
    word = item['word'].strip()
    key = word.lower()
    if key not in unique_dict:
        unique_dict[key] = {
            'word': word,
            'definition': item['definition'],
            'categories': [item['category']],
            'slugs': [item['slug']],
            'targetBand': item['targetBand']
        }
    else:
        if item['category'] not in unique_dict[key]['categories']:
            unique_dict[key]['categories'].append(item['category'])
        if not unique_dict[key]['definition'] and item['definition']:
            unique_dict[key]['definition'] = item['definition']

print(f"Unique words/terms extracted: {len(unique_dict)}")

# Load existing app IELTS vocab
with open('web/src/ielts/data/vocab.json', 'r', encoding='utf-8') as f:
    existing_ielts_vocab = json.load(f)

existing_ielts_words = {item['word'].lower(): item for item in existing_ielts_vocab}
print(f"Existing IELTS vocab in app: {len(existing_ielts_words)}")

# Load existing collocations
with open('web/src/assets/data/collocations.json', 'r', encoding='utf-8') as f:
    existing_collocations = json.load(f)

existing_colloc_phrases = {item['phrase'].lower(): item for item in existing_collocations}
print(f"Existing collocations in app: {len(existing_colloc_phrases)}")

# Analyze overlaps and new terms
overlap_with_ielts = 0
overlap_with_colloc = 0
new_terms = []

for key, val in unique_dict.items():
    in_ielts = key in existing_ielts_words
    in_colloc = key in existing_colloc_phrases
    if in_ielts:
        overlap_with_ielts += 1
    if in_colloc:
        overlap_with_colloc += 1
    if not in_ielts and not in_colloc:
        new_terms.append(val)

print(f"\n--- Overlap Analysis ---")
print(f"Matches existing IELTS vocab: {overlap_with_ielts}")
print(f"Matches existing Collocations: {overlap_with_colloc}")
print(f"New terms to potentially integrate: {len(new_terms)}")

# Sample new terms
print(f"\nSample 15 new terms:")
for t in new_terms[:15]:
    print(f" - {t['word']}: {t['definition'][:80]}... [Cat: {t['categories'][0]}]")
