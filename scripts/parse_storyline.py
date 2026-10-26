import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0'}
url = 'https://prd-swp-le.s3-eu-west-1.amazonaws.com/lrg/c1g060-ellipsis/html5/data/js/data.js'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    raw = resp.read().decode('utf-8', errors='ignore')

# Match window.globalProvideData('data', '...')
m = re.search(r"window\.globalProvideData\('data',\s*'(.+)'\);", raw, re.DOTALL)
if not m:
    m = re.search(r"globalProvideData\([^,]+,\s*'(.+)'\)", raw, re.DOTALL)

if m:
    json_str = m.group(1).encode().decode('unicode_escape')
    # Or string replacement if escaped
    try:
        data = json.loads(json_str)
        print('JSON loaded successfully!')
        print('Top level keys:', list(data.keys()))
        if 'scenes' in data:
            print('Number of scenes:', len(data['scenes']))
            for sc in data['scenes']:
                print(f"Scene: {sc.get('title')}, slides: {len(sc.get('slides', []))}")
                for sl in sc.get('slides', []):
                    print(f"  Slide: {sl.get('id')} - {sl.get('title')}")
                    # check slide content or links
    except Exception as e:
        print('Parse error:', e)
        # Try raw json loads
        try:
            # Maybe it's json directly after unescaping quotes
            pass
        except:
            pass
