import sys
import os
import json
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "ielts_tips"))
ARTICLES_DIR = os.path.join(OUTPUT_DIR, "articles")
os.makedirs(ARTICLES_DIR, exist_ok=True)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# All 122 listing pages across all tips sections
sections = [
    ('/ielts-tips', 68),
    ('/listening-tips', 3),
    ('/reading-tips', 5),
    ('/speaking-tips', 4),
    ('/writing-tips', 9),
    ('/ielts-grammar', 16),
    ('/recent-actual-tests', 5),
    ('/announcements', 3),
    ('/iot-news', 0)
]

def fetch_catalog_items(sec, p):
    url = f"https://ieltsonlinetests.com{sec}?page={p}"
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    items = []
    try:
        html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html, 'html.parser')
        view_content = soup.find('div', class_='view-content')
        if not view_content:
            return items
        
        for news_item in view_content.find_all('div', class_='news-item'):
            title_a = news_item.find('h3')
            if not title_a:
                continue
            a_tag = title_a.find('a')
            title = a_tag.get_text(strip=True) if a_tag else title_a.get_text(strip=True)
            href = a_tag['href'] if a_tag and a_tag.has_attr('href') else ''
            if not href:
                continue
                
            img_tag = news_item.find('div', class_='img-tip-wrap')
            img_src = ''
            if img_tag and img_tag.find('img'):
                img_src = img_tag.find('img').get('src', '')
                
            rating_span = news_item.find('span', class_='rating-point')
            rating = rating_span.get_text(strip=True) if rating_span else ''
            
            votes_em = news_item.find('div', class_='star-rating')
            votes = ''
            if votes_em and votes_em.find('em'):
                votes = votes_em.find('em').get_text(strip=True).replace('(', '').replace(')', '').strip()
                
            tag_span = news_item.find('span', class_='mi-tag')
            category = ''
            category_href = ''
            if tag_span and tag_span.find('a'):
                category = tag_span.find('a').get_text(strip=True)
                category_href = tag_span.find('a').get('href', '')
                
            views = ''
            date = ''
            test_des = news_item.find('div', class_='test-des')
            if test_des:
                p_views = test_des.find('p', class_='hidden-xs')
                if p_views:
                    views = p_views.get_text(strip=True)
                p_date = test_des.find_all('p')
                for p in p_date:
                    if p.find('span', class_='icon-calendar'):
                        date = p.get_text(strip=True)
            
            slug = href.strip('/').split('/')[-1]
            full_url = 'https://ieltsonlinetests.com' + href if href.startswith('/') else href

            items.append({
                'id': slug,
                'slug': slug,
                'title': title,
                'url': full_url,
                'path': href,
                'category': category or sec.strip('/').replace('-', ' ').title(),
                'section_source': sec,
                'rating': float(rating) if rating.replace('.', '', 1).isdigit() else None,
                'votes': votes,
                'views': int(views.replace(',', '')) if views.replace(',', '').isdigit() else 0,
                'date': date,
                'thumbnail': img_src,
                'page': p
            })
    except Exception as e:
        print(f"Error {sec} p={p}: {e}")
    return items

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
                'section_source': item.get('section_source', ''),
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
    tasks = []
    for sec, max_p in sections:
        for p in range(max_p + 1):
            tasks.append((sec, p))

    print(f"Traversing ALL {len(tasks)} pages across all {len(sections)} sections...")
    all_discovered = {}
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(fetch_catalog_items, sec, p) for sec, p in tasks]
        for f in as_completed(futures):
            for item in f.result():
                slug = item['slug']
                if slug not in all_discovered:
                    all_discovered[slug] = item

    catalog_list = list(all_discovered.values())
    print(f"Total Unique Catalog Items Discovered: {len(catalog_list)}")
    
    # Save complete catalog
    catalog_file = os.path.join(OUTPUT_DIR, "tips_catalog.json")
    with open(catalog_file, 'w', encoding='utf-8') as f:
        json.dump(catalog_list, f, ensure_ascii=False, indent=2, default=str)

    # Fetch missing articles
    print("\nFetching any missing full articles...")
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
                
            if done % 100 == 0 or done == len(catalog_list):
                print(f"[{done}/{len(catalog_list)}] (Cached: {cached_count}, New: {new_count}, Failed: {fail_count})")

    master_articles.sort(key=lambda x: x.get('views', 0), reverse=True)
    
    master_file = os.path.join(OUTPUT_DIR, "ielts_tips_master.json")
    with open(master_file, 'w', encoding='utf-8') as f:
        json.dump(master_articles, f, ensure_ascii=False, indent=2, default=str)

    # Compute comprehensive stats
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
        'total_listing_pages_crawled': len(tasks),
        'total_views': total_views,
        'total_words': total_words,
        'by_skill': by_skill,
        'by_category': by_category,
        'duration_seconds': round(time.time() - t_start, 2)
    }
    
    stats_file = os.path.join(OUTPUT_DIR, "tips_stats.json")
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2, default=str)

    print("\n" + "=" * 60)
    print("ALL SECTIONS & ALL PAGES COMPLETELY HARVESTED")
    print("=" * 60)
    print(f"Total Pages Traversed: {len(tasks)}")
    print(f"Total Unique Articles: {len(master_articles)}")
    print(f"Total Words Extracted: {total_words:,}")
    print(f"Total Views Recorded: {total_views:,}")
    print("\nBreakdown by Skill:")
    for sk, cnt in sorted(by_skill.items(), key=lambda x: -x[1]):
        print(f"  - {sk}: {cnt}")

if __name__ == '__main__':
    main()
