import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0'}
url = 'https://prd-swp-le.s3-eu-west-1.amazonaws.com/lrg/c1g060-ellipsis/html5/data/js/data.js'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    raw = resp.read().decode('utf-8', errors='ignore')

m = re.search(r"globalProvideData\([^,]+,\s*'(.+)'\)", raw, re.DOTALL)
if m:
    json_str = m.group(1).encode().decode('unicode_escape')
    data = json.loads(json_str)
    print('Quizzes:', json.dumps(data.get('quizzes'), indent=2))
    print('SlideBank:', json.dumps(data.get('slideBank'), indent=2))
    print('Scoring:', json.dumps(data.get('scoring'), indent=2))
    print('Variables count:', len(data.get('variables', [])))
    for v in data.get('variables', []):
        if not v.get('name', '').startswith('_'):
            print('  Var:', v)
