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

    def find_all_text(obj, path=''):
        results = []
        if isinstance(obj, dict):
            for k, v in obj.items():
                if isinstance(v, str):
                    clean = re.sub(r'<[^>]+>', ' ', v).strip()
                    clean = re.sub(r'\s+', ' ', clean)
                    if any(term in clean for term in ['recently', 'Yes', 'No', 'CHECK', 'Ellipsis', 'sentences']):
                        results.append((f"{path}.{k}", clean))
                results.extend(find_all_text(v, f"{path}.{k}"))
        elif isinstance(obj, list):
            for idx, item in enumerate(obj):
                results.extend(find_all_text(item, f"{path}[{idx}]"))
        return results

    found = find_all_text(sdata)
    for p, t in found:
        print(f"{p} => {t}")
