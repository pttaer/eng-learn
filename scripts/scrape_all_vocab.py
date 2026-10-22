import requests
import re
import json
import time
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

with open('data/ielts_vocab_topics.json', 'r', encoding='utf-8') as f:
    topics = json.load(f)

print(f"Loaded {len(topics)} topics to scrape.")

def extract_band(text):
    m = re.search(r'band\s*([0-9\.\-\–\s]+)', text, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return None

def parse_topic_page(topic):
    slug = topic['slug']
    url = topic['url']
    category_title = topic['title']
    
    try:
        res = requests.get(url, headers=headers, timeout=20)
        if res.status_code != 200:
            return {'slug': slug, 'error': f"Status {res.status_code}", 'items': []}
        
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Determine band info from page body text if present
        body_text = soup.text
        band_level = extract_band(body_text[:1500])
        
        items = []
        
        # 1. Look for <ol> with <li>
        for ol in soup.find_all('ol'):
            for li in ol.find_all('li', recursive=False):
                # Word is usually inside <strong> or <b>
                strong = li.find(['strong', 'b'])
                if strong:
                    word = strong.text.strip().rstrip(':').strip()
                    if len(word) > 1 and not word.startswith('http') and not word.startswith('Part '):
                        # Extract subdetails (definition, example, collocations)
                        details = {}
                        sub_lis = li.find_all('li')
                        if sub_lis:
                            for sub in sub_lis:
                                st = sub.text.strip()
                                if ':' in st:
                                    k, v = st.split(':', 1)
                                    details[k.strip().lower()] = v.strip()
                                else:
                                    # Could be just a sentence
                                    if 'definition' not in details:
                                        details['definition'] = st
                        else:
                            # Text might be directly after strong
                            full_li_text = li.text.strip()
                            after_word = full_li_text[len(strong.text):].strip().lstrip(':').strip()
                            if after_word:
                                details['definition'] = after_word
                        
                        items.append({
                            'word': word,
                            'definition': details.get('definition', ''),
                            'example': details.get('example', '') or details.get('context', ''),
                            'collocations': details.get('collocations', '') or details.get('collocation', ''),
                            'category': category_title,
                            'slug': slug,
                            'targetBand': band_level or '6.5-8.0'
                        })
        
        # 2. If no items from <ol>, check <ul> or headings
        if not items:
            for p in soup.find_all('p'):
                strong = p.find(['strong', 'b'])
                if strong:
                    word = strong.text.strip().rstrip(':').strip()
                    # Check next sibling or ul
                    next_el = p.find_next_sibling()
                    if next_el and next_el.name in ['ul', 'ol', 'p']:
                        def_text = next_el.text.strip()
                        if len(word) > 1 and len(word) < 60 and len(def_text) > 10:
                            items.append({
                                'word': word,
                                'definition': def_text,
                                'example': '',
                                'collocations': '',
                                'category': category_title,
                                'slug': slug,
                                'targetBand': band_level or '6.5-8.0'
                            })
        
        return {
            'slug': slug,
            'title': category_title,
            'targetBand': band_level,
            'url': url,
            'items': items,
            'count': len(items)
        }
    except Exception as e:
        return {'slug': slug, 'error': str(e), 'items': []}

results = []
total_items = 0

print("Starting multithreaded scraper with 8 workers...")
start_time = time.time()

with ThreadPoolExecutor(max_workers=8) as executor:
    futures = {executor.submit(parse_topic_page, topic): topic for topic in topics}
    done_count = 0
    for future in as_completed(futures):
        topic = futures[future]
        res = future.result()
        results.append(res)
        done_count += 1
        item_count = len(res.get('items', []))
        total_items += item_count
        if done_count % 10 == 0 or done_count == len(topics):
            elapsed = time.time() - start_time
            print(f"[{done_count}/{len(topics)}] Scraped {res['slug']}: {item_count} words (Total words: {total_items}) in {elapsed:.1f}s")

# Sort results by slug for deterministic output
results.sort(key=lambda x: x['slug'])

with open('data/scraped_ielts_vocab_raw.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

elapsed = time.time() - start_time
print(f"\n==========================================")
print(f"SCRAPING COMPLETE in {elapsed:.1f} seconds!")
print(f"Total topics processed: {len(results)}")
print(f"Total vocabulary items extracted: {total_items}")
print(f"Saved to: data/scraped_ielts_vocab_raw.json")
print(f"==========================================")
