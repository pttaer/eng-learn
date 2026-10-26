import urllib.request
from bs4 import BeautifulSoup
import json
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

url = 'https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g060-ellipsis'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')
print('Title:', soup.title.get_text(strip=True) if soup.title else '')

# Look for quiz / questions / task content
main = soup.find('main') or soup.find(id='anchor-main') or soup.body
print('Main found:', bool(main))

# Check for interactive iframe or data embed or json
iframes = soup.find_all('iframe')
print('Iframes:', [f.get('src') for f in iframes])

scripts = soup.find_all('script')
for s in scripts:
    src = s.get('src', '')
    txt = s.string or ''
    if 'activity' in src.lower() or 'quiz' in src.lower() or 'test' in src.lower() or 'data' in src.lower():
        print('Script src:', src)
    if 'questions' in txt.lower() or 'activity' in txt.lower() and len(txt) > 200:
        print('Script content snippet:', txt[:300])

# Check text in main
text_nodes = [p.get_text(strip=True) for p in soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'li']) if len(p.get_text(strip=True)) > 20]
print('\nSample text nodes (first 10):')
for t in text_nodes[:10]:
    print('-', t)
