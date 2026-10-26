import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0'}
url = 'https://prd-swp-le.s3.amazonaws.com/lrg/c1g001-reporting-verbs/mobile/data.js'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    raw = resp.read().decode('utf-8', errors='ignore')

print('Raw length:', len(raw))
print('Prefix:', raw[:150])

# Search for questions / exercises
# Find all text attributes in json or xml
matches = re.findall(r'"(?:text|title|prompt|value|altText)"\s*:\s*"([^"]+)"', raw)
print(f"Total text matches: {len(matches)}")
seen = set()
for m in matches:
    clean = re.sub(r'<[^>]+>', ' ', m).strip()
    clean = re.sub(r'\s+', ' ', clean)
    if len(clean) > 3 and not clean.startswith('%') and not clean.startswith('acc_') and not clean.startswith('Icon_') and clean not in seen:
        seen.add(clean)
        print(' -', clean)
