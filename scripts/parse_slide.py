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
    print('Slide keys:', list(slide_data.keys()))
    # Extract text from shapes / objects
    if 'objects' in slide_data:
        for obj in slide_data['objects']:
            otext = obj.get('text') or obj.get('altText')
            if otext:
                clean = re.sub(r'<[^>]+>', '', otext).strip()
                if clean:
                    print(f"[{obj.get('type', 'obj')}] {clean}")
            # check layers or sub-objects
    # Check variables or interactions
