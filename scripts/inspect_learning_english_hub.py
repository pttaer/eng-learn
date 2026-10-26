import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
from bs4 import BeautifulSoup

headers = {'User-Agent': 'Mozilla/5.0'}
url = 'https://www.cambridgeenglish.org/learning-english/'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')
print('Title:', soup.title.get_text(strip=True) if soup.title else '')

# Check major sections and links on the main learning-english landing page
links = soup.find_all('a', href=True)
le_links = set()
for a in links:
    href = a['href']
    if 'learning-english' in href:
        le_links.add((href, a.get_text(strip=True)))

print(f'\nTotal Learning English links found: {len(le_links)}')
for href, txt in sorted(le_links):
    print(f"  {href} -> {txt}")
