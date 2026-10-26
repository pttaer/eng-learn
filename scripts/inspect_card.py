import re
from bs4 import BeautifulSoup

with open('scratch_cambridge.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

cards = []
# Find all links that go to /learning-english/activities-for-learners/c...
for a in soup.find_all('a', href=True):
    href = a['href']
    if '/learning-english/activities-for-learners/c' in href:
        # Check parent or surrounding card
        card = a.find_parent('article') or a.find_parent('li') or a.find_parent('div', class_=re.compile(r'card|activity|item|result', re.I))
        if card:
            cards.append((href, card))
        else:
            cards.append((href, a))

print(f'Found {len(cards)} matching elements')

# Print sample card text
if cards:
    href, el = cards[0]
    print('Sample card href:', href)
    print('Sample card text:\n', el.get_text(separator=' | ', strip=True))
    print('\nSample card HTML:\n', str(el)[:500])
