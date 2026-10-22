import sys
import requests
from bs4 import BeautifulSoup
sys.stdout.reconfigure(encoding='utf-8')

# Writing
w_url = 'https://ieltsonlinetests.com/vi/ielts-mock-test-2025-january-writing-practice-test-1/solution'
r = requests.get(w_url, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(r.text, 'lxml')
print("=== WRITING TEST ===")
for h in soup.find_all(['h2', 'h3', 'h4']):
    t = h.text.strip()
    if 'Task' in t or 'Writing' in t:
        print("Writing heading:", t)
for card in soup.select('.ielts-writing-task, .writing-task, .task-content, .panel-body, .exp-review-box'):
    print("Writing card:", card.get('class'), "text len:", len(card.text))

# Speaking
s_url = 'https://ieltsonlinetests.com/vi/ielts-mock-test-2025-january-speaking-practice-test-1/solution'
r = requests.get(s_url, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(r.text, 'lxml')
print("\n=== SPEAKING TEST ===")
for h in soup.find_all(['h2', 'h3', 'h4']):
    t = h.text.strip()
    if 'Part' in t or 'Speaking' in t:
        print("Speaking heading:", t)
