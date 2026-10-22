import sys
import requests
from bs4 import BeautifulSoup
sys.stdout.reconfigure(encoding='utf-8')

url = 'https://ieltsonlinetests.com/vi/ielts-mock-test-2025-january-listening-practice-test-1/solution'
r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(r.text, 'lxml')

print("--- TRANSCRIPT & EXPLANATION PROBE ---")
for sel in ['.tapescript', '.transcript', '.full-transcript', '.listening-script', '.audio-script', '.exp-review-box', '.tab-section-question']:
    found = soup.select(sel)
    print(f"Selector '{sel}': {len(found)}")

# Check for locate-explain or explanation lines
expls = soup.select('.explanation')
print(f"Total .explanation blocks: {len(expls)}")
for i, exp in enumerate(expls[:3]):
    # Let's print the explanation table or content
    print(f"\n--- Exp {i+1} ---")
    print(exp.text.strip().replace('\n', ' ')[:200])

# Check how sections are divided
parts = soup.select('.list-answer__part-item, .sl-caption, h3, h4')
for p in parts[:10]:
    t = p.text.strip()
    if 'Part' in t or 'Section' in t or 'Question' in t:
        print("Part/Section heading:", t)
