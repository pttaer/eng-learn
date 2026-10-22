import requests
import re
from bs4 import BeautifulSoup

headers = {'User-Agent': 'Mozilla/5.0'}
test_urls = [
    'https://ieltsonlinetests.com/ielts-vocabulary/sustainable-tourism',
    'https://ieltsonlinetests.com/ielts-vocabulary/travel-planning',
    'https://ieltsonlinetests.com/ielts-vocabulary/tourist-destinations'
]

for url in test_urls:
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')
    h1 = soup.find('h1')
    title = h1.text.strip() if h1 else 'No title'
    
    ols = soup.find_all('ol')
    items = []
    for ol in ols:
        for li in ol.find_all('li', recursive=False):
            strong = li.find('strong')
            if strong:
                word = strong.text.strip().rstrip(':')
                # get details from child ul or text
                details = {}
                for sub_li in li.find_all('li'):
                    sub_text = sub_li.text.strip()
                    if ':' in sub_text:
                        k, v = sub_text.split(':', 1)
                        details[k.strip().lower()] = v.strip()
                items.append({'word': word, 'details': details})
    slug = url.split('/')[-1]
    print(f"{title} ({slug}): {len(items)} items found.")
    if items:
        print("  Sample item 1:", items[0])
