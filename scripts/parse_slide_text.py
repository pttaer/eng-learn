import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0'}
url = 'https://prd-swp-le.s3-eu-west-1.amazonaws.com/lrg/c1g060-ellipsis/html5/data/js/5cJGPVHN65X.js'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    raw = resp.read().decode('utf-8', errors='ignore')

m = re.search(r"globalProvideData\([^,]+,\s*'(.+)'\)", raw, re.DOTALL)
if m:
    json_str = m.group(1).encode().decode('unicode_escape')
    slide_data = json.loads(json_str)
    
    def extract_texts(data):
        texts = []
        if isinstance(data, dict):
            for k, v in data.items():
                if k in ['text', 'altText', 'rawText', 'plainText', 'description', 'title', 'caption'] and isinstance(v, str):
                    clean = re.sub(r'<[^>]+>', ' ', v).strip()
                    if clean and len(clean) > 1 and not clean.startswith('acc_') and not clean.startswith('uuid_'):
                        texts.append(clean)
                else:
                    texts.extend(extract_texts(v))
        elif isinstance(data, list):
            for item in data:
                texts.extend(extract_texts(item))
        return texts

    extracted = extract_texts(slide_data)
    print(f'Found {len(extracted)} text snippets:')
    for t in extracted:
        print('  *', t)
