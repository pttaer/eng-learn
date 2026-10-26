import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import re
import json
import time
from bs4 import BeautifulSoup

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch_url(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return None

def unpack_dean_edwards(packed):
    m = re.search(r"}\s*\(\s*'(.*?)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'(.*?)'\.split\('\|'\)", packed, re.DOTALL)
    if not m:
        m = re.search(r'}\s*\(\s*"(.*?)"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*"(.*?)"\.split\("\|"\)', packed, re.DOTALL)
    if not m:
        return None
    payload, radix_str, count_str, syms_str = m.groups()
    radix = int(radix_str)
    count = int(count_str)
    syms = syms_str.split('|')
    
    digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    def base_encode(num, b):
        if num == 0: return '0'
        res = []
        while num > 0:
            res.append(digits[num % b])
            num //= b
        return ''.join(reversed(res))
    
    lookup = {}
    for i in range(count):
        k = base_encode(i, radix)
        lookup[k] = syms[i] if i < len(syms) and syms[i] else k
        
    def repl(match):
        token = match.group(0)
        return lookup.get(token, token)
        
    return re.sub(r'\b[0-9a-zA-Z]+\b', repl, payload)

with open('data/cambridge_proficient_list.json', 'r', encoding='utf-8') as f:
    activities_list = json.load(f)

print(f"Loaded {len(activities_list)} activities to crawl.")

detailed_activities = []

for idx, act in enumerate(activities_list, 1):
    slug = act['slug']
    url = act['url']
    print(f"\n[{idx}/36] Crawling {slug}: {act['title']}")
    
    html = fetch_url(url)
    if not html:
        print(f"  Warning: failed to fetch page HTML for {slug}")
        detailed_activities.append(act)
        continue
        
    soup = BeautifulSoup(html, 'html.parser')
    
    # Extract metadata items
    meta_info = {}
    for item in soup.find_all(class_=re.compile(r'cele-activity__meta__item')):
        t = item.find(class_=re.compile(r'title'))
        b = item.find(class_=re.compile(r'body')) or item.find('ul')
        if t and b:
            meta_info[t.get_text(strip=True)] = b.get_text(separator=' ', strip=True)
            
    desc_el = soup.find(class_=re.compile(r'cele-activity__body|cele-activity-promo__summary')) or soup.find('p', class_='lead')
    body_desc = desc_el.get_text(strip=True) if desc_el else act['summary']
    
    # Find S3 Storyline URL
    ph = soup.find(attrs={'data-activity-lg': True})
    story_url = ph['data-activity-lg'] if ph else ''
    
    item_data = {
        'slug': slug,
        'title': act['title'],
        'url': url,
        'category': act['category'],
        'cefr_level': meta_info.get('CEFRLevel', act['level']),
        'time': meta_info.get('Time', act['time']),
        'skills': meta_info.get('Skills', 'General English'),
        'description': body_desc,
        'story_url': story_url,
        'engine': 'unknown',
        'questions': [],
        'instructions': '',
        'passages': [],
        'raw_texts': []
    }
    
    if not story_url:
        detailed_activities.append(item_data)
        continue
        
    base_s3 = story_url.rsplit('/', 1)[0]
    # Check alternate host if prd-swp-le.s3.amazonaws.com vs prd-swp-le.s3-eu-west-1.amazonaws.com
    hosts_to_try = [base_s3]
    if 's3.amazonaws.com' in base_s3:
        hosts_to_try.append(base_s3.replace('s3.amazonaws.com', 's3-eu-west-1.amazonaws.com'))
    elif 's3-eu-west-1.amazonaws.com' in base_s3:
        hosts_to_try.append(base_s3.replace('s3-eu-west-1.amazonaws.com', 's3.amazonaws.com'))
        
    # Check if Storyline 360 (html5/data/js/data.js)
    sl360_found = False
    for b_url in hosts_to_try:
        data_js = fetch_url(f"{b_url}/html5/data/js/data.js")
        if data_js:
            item_data['engine'] = 'Storyline 360'
            sl360_found = True
            
            # Parse SL360 data
            m = re.search(r"globalProvideData\([^,]+,\s*'(.+)'\)", data_js, re.DOTALL)
            if m:
                try:
                    pjson = json.loads(m.group(1).encode().decode('unicode_escape'))
                    
                    # Extract variables (answer keys)
                    vars_map = {}
                    for v in pjson.get('variables', []):
                        name = v.get('name', '')
                        val = v.get('value', '')
                        if val: vars_map[name] = val
                    
                    # Find slides
                    slides_to_fetch = []
                    for sc in pjson.get('scenes', []):
                        for sl in sc.get('slides', []):
                            sl_id = sl.get('id', '')
                            sl_title = sl.get('title', '')
                            if sl_id and not sl_id.endswith('Slide') and not sl_id.startswith('Print') and not sl_id.startswith('Scroll'):
                                slides_to_fetch.append((sl_id, sl_title))
                                
                    all_slide_texts = []
                    for sl_id, sl_title in slides_to_fetch:
                        sraw = fetch_url(f"{b_url}/html5/data/js/{sl_id}.js")
                        if sraw:
                            sm = re.search(r"globalProvideData\([^,]+,\s*'(.+)'\)", sraw, re.DOTALL)
                            if sm:
                                try:
                                    sdata = json.loads(sm.group(1).encode().decode('unicode_escape'))
                                    slide_texts = []
                                    for layer in sdata.get('slideLayers', []):
                                        for obj in layer.get('objects', []):
                                            alt = obj.get('data', {}).get('vectorData', {}).get('altText') or obj.get('text')
                                            if alt:
                                                c = re.sub(r'<[^>]+>', ' ', alt).strip()
                                                c = re.sub(r'\s+', ' ', c)
                                                if len(c) > 1 and not c.startswith('%') and not c.startswith('acc_') and not c.startswith('uuid_'):
                                                    if c not in slide_texts and not c.startswith('Icon_') and c not in ['Group', 'Group 1', 'Group 2', 'Rectangle 1', 'Rectangle 2', 'Line 1']:
                                                        slide_texts.append(c)
                                    if slide_texts:
                                        all_slide_texts.append({'slide_id': sl_id, 'title': sl_title, 'texts': slide_texts})
                                except Exception as err:
                                    pass
                    item_data['raw_texts'] = all_slide_texts
                    item_data['answer_vars'] = vars_map
                except Exception as e:
                    print(f"  Error parsing SL360 json: {e}")
            break
            
    if not sl360_found:
        # Check Storyline 2 (mobile/data.js)
        for b_url in hosts_to_try:
            m_data = fetch_url(f"{b_url}/mobile/data.js")
            if m_data:
                item_data['engine'] = 'Storyline 2'
                unpacked = unpack_dean_edwards(m_data)
                if unpacked:
                    match = re.search(r'CreateData\("(.+)"\);?$', unpacked, re.DOTALL)
                    if match:
                        xml_str = match.group(1).replace('\\"', '"').replace("\\'", "'")
                        xsoup = BeautifulSoup(xml_str, 'html.parser')
                        
                        # Extract interactions
                        questions = []
                        for inter in xsoup.find_all('interaction'):
                            q_text = inter.get('lmstext', '')
                            q_type = inter.get('type', '')
                            choices = {c.get('id'): c.get('lmstext', '') for c in inter.find_all('choice')}
                            correct = []
                            for ans in inter.find_all('answer'):
                                if ans.get('status') == 'correct':
                                    eq = ans.find('equals')
                                    if eq:
                                        cid = eq.get('choiceid', '').replace('choices.', '')
                                        correct.append(choices.get(cid, cid))
                            questions.append({
                                'prompt': q_text,
                                'type': q_type,
                                'choices': list(choices.values()),
                                'answers': correct
                            })
                        item_data['questions'] = questions
                        
                        # Extract slide texts and instructions
                        sl_texts = []
                        for sl in xsoup.find_all('slide'):
                            texts_in_slide = []
                            for tag in sl.find_all(True):
                                for attr in ['text', 'alt_text', 'title', 'val', 'data']:
                                    v = tag.get(attr)
                                    if v and len(v) > 2 and not v.startswith('_'):
                                        c = re.sub(r'<[^>]+>', ' ', v).strip()
                                        c = re.sub(r'\s+', ' ', c)
                                        if len(c) > 2 and c not in texts_in_slide and not c.startswith('Icon_') and not c.startswith('acc_'):
                                            texts_in_slide.append(c)
                            if texts_in_slide:
                                sl_texts.append({'slide_id': sl.get('id'), 'title': sl.get('title'), 'texts': texts_in_slide[:10]})
                        item_data['raw_texts'] = sl_texts
                break
                
    print(f"  Done: Engine={item_data['engine']}, Questions={len(item_data['questions'])}, SlideTexts={len(item_data['raw_texts'])}")
    detailed_activities.append(item_data)
    time.sleep(0.5)

# Save master json
with open('data/cambridge_proficient_activities_complete.json', 'w', encoding='utf-8') as f:
    json.dump(detailed_activities, f, indent=2, ensure_ascii=False)

print("\nSuccessfully crawled and saved all 36 activities to data/cambridge_proficient_activities_complete.json!")
