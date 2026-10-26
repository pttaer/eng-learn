import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import re
import json
import time
from bs4 import BeautifulSoup

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# 1. Fetch activities list from Cambridge English
list_url = 'https://www.cambridgeenglish.org/learning-english/activities-for-learners/?level=proficient&rows=36'
print(f"Fetching activities list from: {list_url}")
req = urllib.request.Request(list_url, headers=headers)
with urllib.request.urlopen(req, timeout=20) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')
cards = soup.find_all('article', class_=re.compile(r'cele-activity-card'))
print(f"Found {len(cards)} activity cards")

activities = []
for c in cards:
    cat_el = c.find(class_=re.compile(r'category'))
    title_el = c.find(class_=re.compile(r'title'))
    desc_el = c.find(class_=re.compile(r'desc|body|summary|text')) or c.find('p')
    link_el = c.find('a', href=True)
    time_el = c.find(class_=re.compile(r'time'))
    level_el = c.find(class_=re.compile(r'level|badge'))
    
    slug = link_el['href'].split('/')[-1] if link_el else ''
    href = link_el['href'] if link_el else ''
    if not href.startswith('http'):
        href = f"https://www.cambridgeenglish.org{href}"
        
    activities.append({
        'slug': slug,
        'title': title_el.get_text(strip=True) if title_el else slug,
        'category': cat_el.get_text(strip=True) if cat_el else 'Proficient',
        'level': level_el.get_text(strip=True) if level_el else 'C1-C2',
        'time': time_el.get_text(separator=' ', strip=True) if time_el else '0-5 minutes',
        'summary': desc_el.get_text(strip=True) if desc_el else '',
        'url': href
    })

print(f"Parsed {len(activities)} activities from page.")

# Save preliminary list
with open('data/cambridge_proficient_list.json', 'w', encoding='utf-8') as f:
    json.dump(activities, f, indent=2, ensure_ascii=False)
print("Saved data/cambridge_proficient_list.json")
