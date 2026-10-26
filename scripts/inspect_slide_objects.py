import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0'}
url = 'https://prd-swp-le.s3-eu-west-1.amazonaws.com/lrg/c1g060-ellipsis/html5/data/js/5iYWI9Ye9rT.js'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    raw = resp.read().decode('utf-8', errors='ignore')

m = re.search(r"globalProvideData\([^,]+,\s*'(.+)'\)", raw, re.DOTALL)
if m:
    json_str = m.group(1).encode().decode('unicode_escape')
    sdata = json.loads(json_str)
    # Print slide title and all objects with text
    for layer in sdata.get('slideLayers', []):
        print(f"Layer: {layer.get('title')}")
        for obj in layer.get('objects', []):
            txt = obj.get('text') or obj.get('altText') or ''
            clean = re.sub(r'<[^>]+>', ' ', txt).strip()
            clean = re.sub(r'\s+', ' ', clean)
            if clean and not clean.startswith('acc_') and not clean.startswith('uuid_') and not clean.startswith('%'):
                print(f"  [{obj.get('type')}] {clean}")
