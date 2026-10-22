import sys
import requests
from bs4 import BeautifulSoup
sys.stdout.reconfigure(encoding='utf-8')

url = 'https://ieltsonlinetests.com/vi/ielts-mock-test-2025-january-reading-practice-test-1/solution'
r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(r.text, 'lxml')

print("--- EXPLANATIONS ---")
expls = soup.select('.explanation')
print(f"Total .explanation blocks: {len(expls)}")
for i, exp in enumerate(expls[:5]):
    parent_li = exp.find_parent('li')
    li_text = parent_li.text.strip().replace('\n', ' ') if parent_li else 'No parent li'
    print(f"Exp {i+1}: {li_text[:120]}...")

# Also check passage titles
print("\n--- PASSAGE TITLES ---")
for i, p in enumerate(soup.select('.passage-content')):
    # Look for title inside or right before passage-content
    prev_sibling = p.find_previous_sibling(['h2', 'h3', 'h4', 'div'])
    print(f"Passage {i+1} previous sibling: {prev_sibling.text.strip()[:60] if prev_sibling else 'None'}")
    first_p = p.find('p')
    print(f"Passage {i+1} first paragraph: {first_p.text.strip()[:100] if first_p else 'None'}")
