import urllib.request
from bs4 import BeautifulSoup
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

url = 'https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g060-ellipsis'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')
activity_section = soup.find('div', class_='cele-activity') or soup.find('article', class_='cele-activity')
if activity_section:
    print('Activity text:\n', activity_section.get_text(separator='\n', strip=True))
