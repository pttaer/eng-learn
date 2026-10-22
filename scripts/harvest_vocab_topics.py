import requests
import re
import json
import time
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

all_topics = []
seen_slugs = set()

print("Harvesting topic URLs from page 0 to 18...")
for page in range(0, 19):
    url = f"https://ieltsonlinetests.com/ielts-vocabulary?page={page}" if page > 0 else "https://ieltsonlinetests.com/ielts-vocabulary"
    try:
        res = requests.get(url, headers=headers, timeout=15)
        if res.status_code != 200:
            print(f"Page {page} returned status {res.status_code}")
            continue
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # In Drupal, find articles or topic links
        page_topics = 0
        for a in soup.find_all('a', href=True):
            href = a['href']
            m = re.match(r'^/ielts-vocabulary/([a-zA-Z0-9\-]+)$', href)
            if m:
                slug = m.group(1)
                if slug not in ['delete', 'edit', 'translations', 'ielts-vocabulary-101-iot'] and slug not in seen_slugs:
                    title = a.text.strip()
                    if not title or len(title) < 3:
                        title = slug.replace('-', ' ').title()
                    seen_slugs.add(slug)
                    all_topics.append({
                        'slug': slug,
                        'title': title,
                        'url': f"https://ieltsonlinetests.com{href}",
                        'page': page
                    })
                    page_topics += 1
        print(f"Page {page:2d}: found {page_topics:2d} new topics. Total so far: {len(all_topics)}")
        time.sleep(0.3)
    except Exception as e:
        print(f"Error on page {page}: {e}")

print(f"\nTotal unique topics collected: {len(all_topics)}")
with open('data/ielts_vocab_topics.json', 'w', encoding='utf-8') as f:
    json.dump(all_topics, f, indent=2, ensure_ascii=False)
print("Saved to data/ielts_vocab_topics.json")
