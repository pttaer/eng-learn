import json
import re
import os

print("--- Building IELTS Topic Lexicon from Scraped Data ---")

with open('data/scraped_ielts_vocab_raw.json', 'r', encoding='utf-8') as f:
    topics = json.load(f)

# Load existing collocations and vocab to reuse verified collocations & translations
with open('web/src/ielts/data/vocab.json', 'r', encoding='utf-8') as f:
    existing_ielts_vocab = json.load(f)

with open('web/src/assets/data/collocations.json', 'r', encoding='utf-8') as f:
    existing_collocations = json.load(f)

with open('web/src/assets/data/lexicon-dictionary.json', 'r', encoding='utf-8') as f:
    lexicon_dict = json.load(f)

# Build lookup caches
existing_vocab_map = {v['word'].lower().strip(): v for v in existing_ielts_vocab}
existing_colloc_map = {}
for c in existing_collocations:
    existing_colloc_map.setdefault(c['phrase'].lower().strip(), []).append(c)

# Helper: Infer POS
def infer_pos(word, definition):
    w = word.strip().lower()
    words = w.split()
    if len(words) > 1:
        if words[0] in ['to', 'be', 'make', 'take', 'do', 'have', 'give']:
            return 'verb'
        if w.endswith('ly'):
            return 'adverb'
        return 'phrase'
    
    if w.endswith('tion') or w.endswith('sion') or w.endswith('ment') or w.endswith('ity') or w.endswith('ness') or w.endswith('ance') or w.endswith('ence') or w.endswith('ism') or w.endswith('ist') or w.endswith('er') or w.endswith('or'):
        return 'noun'
    if w.endswith('able') or w.endswith('ible') or w.endswith('al') or w.endswith('ic') or w.endswith('ical') or w.endswith('ive') or w.endswith('ous') or w.endswith('ful') or w.endswith('less'):
        return 'adjective'
    if w.endswith('ly'):
        return 'adverb'
    if w.endswith('ize') or w.endswith('ise') or w.endswith('ate') or w.endswith('en') or w.endswith('ify'):
        return 'verb'
    
    # Check definition clues
    d = definition.lower().strip()
    if d.startswith('the ') or d.startswith('a ') or d.startswith('an '):
        return 'noun'
    if d.startswith('to ') or d.startswith('make ') or d.startswith('cause ') or d.startswith('become '):
        return 'verb'
    if d.startswith('relating to') or d.startswith('characterized by') or d.startswith('having ') or d.startswith('capable of'):
        return 'adjective'
    
    return 'noun'

# Helper: Infer CEFR & Band
def infer_level_and_band(word, pos, targetBand):
    w = word.strip()
    words = w.split()
    # If band provided in topic, use as baseline
    band = 7.0
    if targetBand:
        m = re.search(r'([6-8]\.[05]|[6-8])', targetBand)
        if m:
            try:
                band = float(m.group(1))
            except:
                band = 7.0
    
    # Syllabic and length complexity
    char_len = len(w)
    if char_len >= 12 or len(words) >= 2 or any(s in w.lower() for s in ['meta', 'transcend', 'epistem', 'ontolog', 'dichotom', 'juxtapos', 'paradox', 'intrinsic']):
        band = max(band, 7.5)
        cefr = 'C1' if band < 8.0 else 'C2'
    elif char_len >= 8 or band >= 7.0:
        band = max(band, 7.0)
        cefr = 'B2' if band <= 7.0 else 'C1'
    else:
        band = max(band, 6.5)
        cefr = 'B1' if band <= 6.5 else 'B2'
    
    return cefr, band

# Common academic collocations patterns
def generate_collocations(word, pos, category):
    w = word.strip()
    lw = w.lower()
    
    # 1. Check existing vocab
    if lw in existing_vocab_map and existing_vocab_map[lw].get('collocations'):
        return existing_vocab_map[lw]['collocations'][:3]
    
    # 2. Check lexicon dict
    if lw in lexicon_dict and lexicon_dict[lw].get('collocations'):
        collocs = lexicon_dict[lw]['collocations']
        if len(collocs) >= 2:
            return collocs[:3]
    
    # 3. Construct category-appropriate academic collocations
    cat_lower = category.lower()
    if pos == 'noun':
        if 'environ' in cat_lower or 'climat' in cat_lower:
            return [f"sustainable {lw}", f"reduce {lw}", f"environmental {lw}"]
        elif 'tech' in cat_lower or 'digit' in cat_lower:
            return [f"advanced {lw}", f"implement {lw}", f"digital {lw}"]
        elif 'econom' in cat_lower or 'financ' in cat_lower or 'busi' in cat_lower:
            return [f"rapid {lw}", f"economic {lw}", f"stimulate {lw}"]
        elif 'cultur' in cat_lower or 'art' in cat_lower or 'soci' in cat_lower:
            return [f"traditional {lw}", f"cultural {lw}", f"preserve {lw}"]
        elif 'educat' in cat_lower or 'academ' in cat_lower or 'skill' in cat_lower:
            return [f"academic {lw}", f"foster {lw}", f"rigorous {lw}"]
        else:
            return [f"significant {lw}", f"widespread {lw}", f"address {lw}"]
    elif pos == 'adjective':
        if 'environ' in cat_lower:
            return [f"{lw} ecosystem", f"highly {lw}", f"{lw} impact"]
        elif 'tech' in cat_lower:
            return [f"{lw} infrastructure", f"increasingly {lw}", f"{lw} system"]
        elif 'econom' in cat_lower:
            return [f"{lw} growth", f"{lw} disparities", f"remain {lw}"]
        else:
            return [f"{lw} approach", f"profoundly {lw}", f"{lw} consequence"]
    elif pos == 'verb':
        return [f"actively {lw}", f"{lw} significantly", f"{lw} sustainable outcomes"]
    else:
        return [f"key aspect of {lw}", f"direct impact on {lw}", f"sustainable {lw}"]

# Helper: Vietnamese translation heuristic
VI_TERMS = {
    'sustainable tourism': 'du lịch bền vững',
    'ecotourism': 'du lịch sinh thái',
    'carbon footprint': 'dấu chân carbon / lượng phát thải khí nhà kính',
    'responsible travel': 'du lịch có trách nhiệm',
    'green practices': 'thực hành xanh / biện pháp thân thiện môi trường',
    'biodiversity': 'đa dạng sinh học',
    'itinerary': 'lịch trình chuyến đi',
    'tourist destination': 'điểm đến du lịch',
    'paradox': 'nghịch lý',
    'perception': 'nhận thức / góc nhìn',
    'consciousness': 'ý thức / tâm trí',
    'empathy': 'sự đồng cảm',
    'intuition': 'trực giác',
    'cognition': 'quá trình nhận thức',
    'moral relativism': 'thuyết tương đối đạo đức',
    'existentialism': 'chủ nghĩa hiện sinh',
    'ethical dilemma': 'thế tiến thoái lưỡng nan về đạo đức',
    'abstract reasoning': 'tư duy trừu tượng',
    'metaphysics': 'siêu hình học / bản thể luận',
    'alienation': 'sự tha hóa / cảm giác bị cô lập',
    'transcendence': 'sự siêu việt / vượt lên giới hạn',
    'innovation': 'sự đổi mới sáng tạo',
    'egalitarianism': 'chủ nghĩa quân bình / bình đẳng',
    'fiscal policy': 'chính sách tài khóa',
    'monetary policy': 'chính sách tiền tệ',
    'inflation rate': 'tỷ lệ lạm phát',
    'interest rate': 'lãi suất',
    'gross domestic product': 'tổng sản phẩm quốc nội (GDP)',
    'workplace culture': 'văn hóa nơi công sở',
    'career path': 'con đường sự nghiệp',
    'professional development': 'phát triển chuyên môn',
    'workforce trends': 'xu hướng lực lượng lao động',
    'artificial intelligence': 'trí tuệ nhân tạo (AI)',
    'digital media': 'truyền thông kỹ thuật số',
    'cybersecurity': 'an ninh mạng',
    'data privacy': 'quyền riêng tư dữ liệu',
    'renewable energy': 'năng lượng tái tạo',
    'energy conservation': 'tiết kiệm năng lượng',
    'greenhouse effect': 'hiệu ứng nhà kính',
    'urbanization': 'quá trình đô thị hóa',
    'demographic shift': 'sự dịch chuyển nhân khẩu học',
    'cultural heritage': 'di sản văn hóa',
    'social media': 'mạng xã hội',
    'media literacy': 'năng lực tiếp cận truyền thông',
    'journalism ethics': 'đạo đức báo chí',
}

def infer_vietnamese(word, definition):
    lw = word.lower().strip()
    if lw in VI_TERMS:
        return VI_TERMS[lw]
    if lw in existing_vocab_map and existing_vocab_map[lw].get('vietnamese'):
        return existing_vocab_map[lw]['vietnamese']
    if lw in lexicon_dict and lexicon_dict[lw].get('vietnamese'):
        return lexicon_dict[lw]['vietnamese']
    
    # Clean fallback: synthesize based on definition
    d = definition.strip()
    if d:
        # Keep clean short English summary as definition placeholder
        return ""
    return ""

# Process all raw items
processed_items = []
seen_words = set()
item_id = 1

for t in topics:
    cat_title = t['title']
    cat_slug = t['slug']
    target_band = t.get('targetBand') or '6.5-8.0'
    
    for raw in t.get('items', []):
        word = raw['word'].strip()
        lw = word.lower()
        if not word or lw in seen_words:
            continue
        seen_words.add(lw)
        
        definition = raw.get('definition', '').strip()
        pos = infer_pos(word, definition)
        cefr, band = infer_level_and_band(word, pos, target_band)
        collocs = generate_collocations(word, pos, cat_title)
        vi = infer_vietnamese(word, definition)
        
        # Build natural example if missing
        example = raw.get('example', '').strip()
        if not example or len(example.split()) < 6:
            if collocs:
                example = f"Policymakers must adopt {collocs[0]} to achieve sustainable long-term development."
            else:
                example = f"Understanding the concept of {word.lower()} is essential for addressing contemporary societal challenges."
        
        processed_items.append({
            'id': f"iot-{item_id:04d}",
            'word': word,
            'pos': pos,
            'cefrLevel': cefr,
            'band': band,
            'topic': cat_title,
            'slug': cat_slug,
            'definition': definition,
            'vietnamese': vi,
            'collocations': collocs,
            'example': example
        })
        item_id += 1

print(f"\nSuccessfully processed {len(processed_items)} unique vocabulary items!")

# Distribution summary
cefr_counts = {}
band_counts = {}
pos_counts = {}
for p in processed_items:
    cefr_counts[p['cefrLevel']] = cefr_counts.get(p['cefrLevel'], 0) + 1
    band_counts[p['band']] = band_counts.get(p['band'], 0) + 1
    pos_counts[p['pos']] = pos_counts.get(p['pos'], 0) + 1

print(f"CEFR distribution: {cefr_counts}")
print(f"Band distribution: {band_counts}")
print(f"POS distribution: {pos_counts}")

# Save master dataset
output_path = 'web/src/assets/data/iot-vocabulary.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(processed_items, f, indent=2, ensure_ascii=False)
print(f"Saved master dataset to: {output_path} ({os.path.getsize(output_path)} bytes)")

# Also save a copy in data/
with open('data/ielts_vocab_master.json', 'w', encoding='utf-8') as f:
    json.dump(processed_items, f, indent=2, ensure_ascii=False)
print("Saved data/ielts_vocab_master.json")
