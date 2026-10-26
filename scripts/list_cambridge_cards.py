import re
from bs4 import BeautifulSoup
import urllib.request

with open('scratch_cambridge.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

# Check total count
count_el = soup.find(class_=re.compile(r'count|result-count|total', re.I))
if count_el:
    print('Count element:', count_el.get_text(strip=True))

# Search for any text like "activities", "results", etc.
for el in soup.find_all(text=re.compile(r'\d+\s+(activities|results)', re.I)):
    print('Matching text:', el.strip())

# Check pagination or next page
pagination = soup.find(class_=re.compile(r'pagination|pager', re.I))
if pagination:
    print('Pagination found:', pagination.get_text(separator=' ', strip=True))

# Check all 36 cards on this page
cards = soup.find_all('article', class_=re.compile(r'cele-activity-card'))
print(f'Total cards on page: {len(cards)}')

for i, c in enumerate(cards, 1):
    cat = c.find(class_=re.compile(r'category'))
    title = c.find(class_=re.compile(r'title'))
    desc = c.find(class_=re.compile(r'desc|body|summary|text')) or c.find('p')
    link = c.find('a', href=True)
    level = c.find(class_=re.compile(r'level|badge'))
    time_badge = c.find(class_=re.compile(r'time'))
    print(f"{i}. [{cat.get_text(strip=True) if cat else ''}] {title.get_text(strip=True) if title else ''} -> {link['href'] if link else ''}")
    print(f"   Desc: {desc.get_text(strip=True) if desc else ''}")
