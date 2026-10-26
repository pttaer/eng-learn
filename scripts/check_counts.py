import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import re
from bs4 import BeautifulSoup

headers = {'User-Agent': 'Mozilla/5.0'}

for level in ['basic', 'independent', 'proficient']:
    url = f'https://www.cambridgeenglish.org/learning-english/activities-for-learners/?level={level}&rows=1'
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            count_el = soup.find(class_=re.compile(r'count|result-count|total', re.I))
            count = count_el.get_text(strip=True) if count_el else 'Unknown'
            print(f"Level: {level:12} -> Total Activities: {count}")
    except Exception as e:
        print(f"Level: {level} -> Error: {e}")

# Check all activities without filter
url_all = 'https://www.cambridgeenglish.org/learning-english/activities-for-learners/?rows=1'
try:
    req = urllib.request.Request(url_all, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html, 'html.parser')
        count_el = soup.find(class_=re.compile(r'count|result-count|total', re.I))
        count = count_el.get_text(strip=True) if count_el else 'Unknown'
        print(f"All activities total -> {count}")
except Exception as e:
    print(f"All activities -> Error: {e}")
