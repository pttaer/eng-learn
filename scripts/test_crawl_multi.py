import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import re
import json
from bs4 import BeautifulSoup

headers = {'User-Agent': 'Mozilla/5.0'}

test_slugs = ['c1g001-reporting-verbs', 'c1l062-bank-accounts', 'c1r001-forensic-linguistics', 'c1p054-word-stress']

def get_activity_details(slug):
    url = f'https://www.cambridgeenglish.org/learning-english/activities-for-learners/{slug}'
    print(f"\n====================================\nFetching: {slug}")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Failed to fetch page: {e}")
        return None

    soup = BeautifulSoup(html, 'html.parser')
    
    title_el = soup.find(class_=re.compile(r'cele-activity__title'))
    title = title_el.get_text(strip=True) if title_el else slug
    
    meta_list = soup.find_all(class_=re.compile(r'cele-activity__meta__item'))
    meta_info = {}
    for item in meta_list:
        t = item.find(class_=re.compile(r'title'))
        b = item.find(class_=re.compile(r'body')) or item.find('ul')
        if t and b:
            meta_info[t.get_text(strip=True)] = b.get_text(separator=' ', strip=True)
            
    desc_el = soup.find(class_=re.compile(r'cele-activity__body|cele-activity-promo__summary')) or soup.find('p', class_='lead')
    desc = desc_el.get_text(strip=True) if desc_el else ''
    
    # Check placeholder for storyline url
    ph = soup.find(attrs={'data-activity-lg': True})
    story_url = ph['data-activity-lg'] if ph else ''
    
    print(f"Title: {title}")
    print(f"Meta: {meta_info}")
    print(f"Story URL: {story_url}")
    
    # Now let's probe Storyline
    if story_url:
        base_s3 = story_url.rsplit('/', 1)[0]
        data_js_url = f"{base_s3}/html5/data/js/data.js"
        try:
            req2 = urllib.request.Request(data_js_url, headers=headers)
            with urllib.request.urlopen(req2, timeout=15) as resp2:
                raw = resp2.read().decode('utf-8', errors='ignore')
            m = re.search(r"globalProvideData\([^,]+,\s*'(.+)'\)", raw, re.DOTALL)
            if m:
                json_str = m.group(1).encode().decode('unicode_escape')
                proj = json.loads(json_str)
                # Find scenes and slides
                slides_to_fetch = []
                for sc in proj.get('scenes', []):
                    for sl in sc.get('slides', []):
                        sl_id = sl.get('id')
                        sl_title = sl.get('title', '')
                        if sl_id and not sl_id.endswith('Slide'):
                            slides_to_fetch.append((sl_id, sl_title))
                print(f"Found {len(slides_to_fetch)} slides in story")
                
                # Fetch slides
                for sl_id, sl_t in slides_to_fetch[:4]:
                    sl_url = f"{base_s3}/html5/data/js/{sl_id}.js"
                    req3 = urllib.request.Request(sl_url, headers=headers)
                    with urllib.request.urlopen(req3, timeout=10) as resp3:
                        sraw = resp3.read().decode('utf-8', errors='ignore')
                    sm = re.search(r"globalProvideData\([^,]+,\s*'(.+)'\)", sraw, re.DOTALL)
                    if sm:
                        sdata = json.loads(sm.group(1).encode().decode('unicode_escape'))
                        # Extract clean text snippets
                        texts = []
                        def rec_t(o):
                            if isinstance(o, dict):
                                for k, v in o.items():
                                    if k in ['text', 'altText'] and isinstance(v, str):
                                        c = re.sub(r'<[^>]+>', ' ', v).strip()
                                        c = re.sub(r'\s+', ' ', c)
                                        if len(c) > 1 and not c.startswith('%') and not c.startswith('acc_') and not c.startswith('Icon_'):
                                            texts.append(c)
                                    else:
                                        rec_t(v)
                            elif isinstance(o, list):
                                for x in o: rec_t(x)
                        rec_t(sdata)
                        # Filter duplicates
                        seen = set()
                        filtered = [x for x in texts if not (x in seen or seen.add(x))]
                        print(f"  Slide {sl_id} ({sl_t}): {len(filtered)} texts")
                        for f in filtered[:8]:
                            print(f"    - {f}")
        except Exception as e:
            print(f"Storyline probe failed: {e}")

for slug in test_slugs:
    get_activity_details(slug)
