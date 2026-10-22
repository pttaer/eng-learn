import sys
import os
import json
import time
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://ieltsonlinetests.com"
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "ielts_tips"))
ARTICLES_DIR = os.path.join(OUTPUT_DIR, "articles")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ARTICLES_DIR, exist_ok=True)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

def normalize_skill(category):
    cat_lower = (category or '').lower()
    if 'writing' in cat_lower or 'essay' in cat_lower:
        return 'Writing'
    if 'speaking' in cat_lower:
        return 'Speaking'
    if 'listening' in cat_lower:
        return 'Listening'
    if 'reading' in cat_lower:
        return 'Reading'
    if 'grammar' in cat_lower:
        return 'Grammar'
    if 'vocabulary' in cat_lower or 'vocab' in cat_lower:
        return 'Vocabulary'
    return 'General & Strategies'

def fetch_single_article(item):
    slug = item['slug']
    slug_file = os.path.join(ARTICLES_DIR, f"{slug}.json")
    
    # Check if already downloaded and valid
    if os.path.exists(slug_file):
        try:
            with open(slug_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if data.get('content_length', 0) > 100:
                    return slug, data, True
        except Exception:
            pass

    url = item['url']
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
            html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            
            article = soup.find('article', class_='tip-article') or soup.find('article') or soup.find('div', class_='field--name-body')
            if not article:
                return slug, None, False
                
            # Clean unwanted UI widgets
            for noise in article.find_all('div', class_=['ta-meta', 'test-vote', 'social-share', 'box-tag', 'rate-widget-fivestar']):
                noise.decompose()
                
            headings = []
            for h in article.find_all(['h1', 'h2', 'h3', 'h4']):
                ht = h.get_text(strip=True)
                if ht and ht != item['title'] and ht not in headings:
                    headings.append(ht)
                    
            paragraphs = []
            for p in article.find_all(['p', 'li']):
                pt = p.get_text(strip=True)
                if pt and len(pt) > 15:
                    paragraphs.append(pt)
                    
            clean_text = article.get_text(separator='\n\n', strip=True)
            summary = " ".join(paragraphs[:2]) if paragraphs else ""
            if len(summary) > 300:
                summary = summary[:297] + "..."

            detail = {
                'id': slug,
                'slug': slug,
                'title': item['title'],
                'url': url,
                'category': item.get('category', 'General'),
                'skill': normalize_skill(item.get('category')),
                'rating': item.get('rating'),
                'votes': item.get('votes', ''),
                'views': item.get('views', 0),
                'date': item.get('date', ''),
                'thumbnail': item.get('thumbnail', ''),
                'summary': summary,
                'headings': headings[:15],
                'paragraphs_count': len(paragraphs),
                'content_length': len(clean_text),
                'content_text': clean_text
            }
            
            with open(slug_file, 'w', encoding='utf-8') as f:
                json.dump(detail, f, ensure_ascii=False, indent=2)
                
            return slug, detail, False
        except Exception as e:
            if attempt < 2:
                time.sleep(1.0 * (attempt + 1))
            else:
                print(f"[!] Failed to fetch {url}: {e}", file=sys.stderr)
                return slug, None, False

def main():
    t_start = time.time()
    catalog_file = os.path.join(OUTPUT_DIR, "tips_catalog.json")
    if not os.path.exists(catalog_file):
        print("Catalog not found! Please check data/ielts_tips/tips_catalog.json")
        return
        
    with open(catalog_file, 'r', encoding='utf-8') as f:
        catalog_list = json.load(f)
        
    print(f"Loaded {len(catalog_list)} items from catalog.")
    
    # Process with 6 workers
    master_articles = []
    cached_count = 0
    new_count = 0
    fail_count = 0
    
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = [executor.submit(fetch_single_article, it) for it in catalog_list]
        done = 0
        for f in as_completed(futures):
            done += 1
            slug, detail, is_cached = f.result()
            if is_cached:
                cached_count += 1
                master_articles.append(detail)
            elif detail:
                new_count += 1
                master_articles.append(detail)
            else:
                fail_count += 1
                
            if done % 50 == 0 or done == len(catalog_list):
                print(f"[{done}/{len(catalog_list)}] (Cached: {cached_count}, New: {new_count}, Failed: {fail_count})")

    # Sort articles by views descending
    master_articles.sort(key=lambda x: x.get('views', 0), reverse=True)
    
    # Save master file
    master_file = os.path.join(OUTPUT_DIR, "ielts_tips_master.json")
    with open(master_file, 'w', encoding='utf-8') as f:
        json.dump(master_articles, f, ensure_ascii=False, indent=2)
        
    # Aggregate stats
    by_skill = {}
    by_category = {}
    total_views = 0
    total_words = 0
    
    for a in master_articles:
        s = a.get('skill', 'General')
        c = a.get('category', 'General')
        by_skill[s] = by_skill.get(s, 0) + 1
        by_category[c] = by_category.get(c, 0) + 1
        total_views += a.get('views', 0)
        total_words += len(a.get('content_text', '').split())
        
    stats = {
        'total_tips_collected': len(master_articles),
        'total_views': total_views,
        'total_words': total_words,
        'by_skill': by_skill,
        'by_category': by_category,
        'harvest_duration_seconds': round(time.time() - t_start, 2)
    }
    
    stats_file = os.path.join(OUTPUT_DIR, "tips_stats.json")
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("FINISHED ALL TIPS SCRAPING")
    print("=" * 60)
    print(f"Total Tips Collected: {len(master_articles)}/{len(catalog_list)}")
    print(f"Total Words Extracted: {total_words:,}")
    print(f"Total Views: {total_views:,}")
    print(f"Duration: {time.time()-t_start:.1f}s")
    print("\nBy Skill:")
    for sk, cnt in sorted(by_skill.items(), key=lambda x: -x[1]):
        print(f"  {sk}: {cnt}")
    print("\nBy Category:")
    for cat, cnt in sorted(by_category.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {cnt}")

if __name__ == '__main__':
    main()
