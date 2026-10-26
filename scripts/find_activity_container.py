import urllib.request
from bs4 import BeautifulSoup
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

url = 'https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g060-ellipsis'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')

# Let's find content containers
for sel in ['div.content-container', 'div#anchor-main', 'div.cele-activity', 'div[class*="activity"]', 'div[class*="exercise"]']:
    matches = soup.select(sel)
    if matches:
        print(f'Found selector {sel}: {len(matches)}')
        for m in matches[:2]:
            print(m.prettify()[:1000])

# Let's search for the activity questions, interactive components or embed
print('\n--- All classes in HTML containing activity ---')
classes = set()
for tag in soup.find_all(True):
    for c in tag.get('class', []):
        if 'activity' in c or 'cele' in c or 'quiz' in c:
            classes.add(c)
print(classes)
