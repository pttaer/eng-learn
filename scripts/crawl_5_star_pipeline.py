"""
Crawl and harvest all 16 5-Star English learning resources from ENGLISH_LEARNING_SOURCES.md.
Output directory: e:/Eng/research English contents/5_star_resources
"""

import os
import sys
import re
import json
import time
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'research English contents', '5_star_resources'))
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

def safe_fetch(url, timeout=20):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  [WARN] Failed to fetch {url}: {e}")
        return None

print(f"Target Output Directory: {OUTPUT_DIR}")
