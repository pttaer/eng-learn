import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import re
import json

url = 'https://prd-swp-le.s3-eu-west-1.amazonaws.com/lrg/c1g060-ellipsis/html5/data/js/6WSHWkYo9j5.js'
with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})) as resp:
    raw = resp.read().decode('utf-8', errors='ignore')

m = re.search(r"globalProvideData\([^,]+,\s*'(.+)'\)", raw, re.DOTALL)
if m:
    sdata = json.loads(m.group(1).encode().decode('unicode_escape'))
    for obj in sdata.get('slideLayers', [{}])[0].get('objects', []):
        alt = obj.get('data', {}).get('vectorData', {}).get('altText')
        if alt:
            clean = re.sub(r'<[^>]+>', ' ', alt).strip()
            print(f"[{obj.get('id')}] {clean}")
