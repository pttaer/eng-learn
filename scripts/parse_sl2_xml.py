import sys
sys.stdout.reconfigure(encoding='utf-8')
from bs4 import BeautifulSoup
import re

with open('scratch_sl2.xml', 'r', encoding='utf-8', errors='ignore') as f:
    xml = f.read()

# Fix escaped quotes if any
xml = xml.replace('\\"', '"').replace("\\'", "'")
soup = BeautifulSoup(xml, 'html.parser')

print("Total slides:", len(soup.find_all('slide')))
for i, sl in enumerate(soup.find_all('slide')):
    print(f"\n--- Slide {i+1}: {sl.get('id')} - {sl.get('title', '')} ---")
    # Find all text attributes or tags
    texts = []
    for tag in sl.find_all(True):
        for attr in ['text', 'alt_text', 'title', 'val', 'data']:
            v = tag.get(attr)
            if v and len(v) > 2 and not v.startswith('_'):
                c = re.sub(r'<[^>]+>', ' ', v).strip()
                c = re.sub(r'\s+', ' ', c)
                if len(c) > 2 and c not in texts and not c.startswith('Icon_'):
                    texts.append(c)
        if tag.string:
            s = re.sub(r'<[^>]+>', ' ', tag.string).strip()
            if len(s) > 2 and s not in texts and not s.startswith('_'):
                texts.append(s)
    for t in texts[:10]:
        print(' *', t)
