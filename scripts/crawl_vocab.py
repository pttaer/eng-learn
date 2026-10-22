import requests
from bs4 import BeautifulSoup
import re
import json
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

base_url = 'https://ieltsonlinetests.com/ielts-vocabulary'
res = requests.get(base_url, headers=headers, timeout=15)
print(f"Status: {res.status_code}")
soup = BeautifulSoup(res.text, 'html.parser')

# Check pager
pager = soup.find('ul', class_='pagination') or soup.find('nav', class_='pager')
if pager:
    print("Pager links:", [a.get('href') for a in pager.find_all('a')])
else:
    # Search all links with page=
    page_links = [a.get('href') for a in soup.find_all('a', href=re.compile(r'page=\d+'))]
    print("Page links found:", list(set(page_links)))

# Find topic cards / links on page 0
topic_links = []
for a in soup.find_all('a', href=True):
    href = a['href']
    # Check if href is a topic link: /ielts-vocabulary/<slug> where slug is not delete, edit, etc.
    m = re.match(r'^/ielts-vocabulary/([a-zA-Z0-9\-]+)$', href)
    if m:
        slug = m.group(1)
        if slug not in ['delete', 'edit', 'translations', 'ielts-vocabulary-101-iot']:
            topic_links.append((slug, f"https://ieltsonlinetests.com{href}"))

unique_topics = list(dict.fromkeys(topic_links))
print(f"Page 0 topics found ({len(unique_topics)}):", unique_topics[:5])
