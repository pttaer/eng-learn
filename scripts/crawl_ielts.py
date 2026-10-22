"""
IELTS Online Tests Crawler for Eng learning app.
Crawls tests from 2024 to 2026 across Reading, Listening, Writing, and Speaking.
Saves structured JSON and Markdown files ready for app integration.
"""

import os
import sys
import re
import time
import json
import random
import requests
from bs4 import BeautifulSoup

# Ensure utf-8 output on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'https://ieltsonlinetests.com'
TARGET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'scraped-ielts'))
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'vi,en;q=0.9',
}

def safe_request(url, max_retries=3):
    """Fetch URL with retries and rate limiting."""
    for attempt in range(max_retries):
        try:
            time.sleep(random.uniform(0.4, 0.7))
            r = requests.get(url, headers=HEADERS, timeout=25)
            if r.status_code == 200:
                return r
            elif r.status_code == 429:
                print(f"[WARN] Rate limited (429). Sleeping 10s before retry {attempt+1}...")
                time.sleep(10)
            else:
                print(f"[WARN] Status {r.status_code} for {url}")
        except Exception as e:
            print(f"[ERROR] Attempt {attempt+1} failed for {url}: {e}")
            time.sleep(2)
    return None

def discover_target_collections():
    """Discover all 2024, 2025, 2026 collections from IELTS Exam Library."""
    url = f"{BASE_URL}/vi/ielts-exam-library?tab=academic"
    print(f"Fetching collection catalog from: {url}")
    res = safe_request(url)
    if not res:
        print("[FATAL] Could not load library page.")
        return []

    soup = BeautifulSoup(res.text, 'lxml')
    target_packs = []

    for item in soup.select('.mocktest-item'):
        title_el = item.select_one('.mocktest-item__title')
        title = title_el.text.strip() if title_el else ''
        
        # Filter for 2024, 2025, 2026
        years = ['2024', '2025', '2026']
        if not any(y in title for y in years):
            continue

        for pack in item.select('.mocktest-item__pack'):
            href = pack.get('href', '')
            if href.startswith('/'):
                href = BASE_URL + href
            name_el = pack.select_one('.mocktest-item__pack-title')
            name = name_el.text.strip() if name_el else ''
            
            # Derive slug
            slug = href.rstrip('/').split('/')[-1]
            target_packs.append({
                'year_group': title,
                'name': name,
                'slug': slug,
                'url': href
            })

    print(f"Discovered {len(target_packs)} monthly collections for 2024-2026.")
    return target_packs

def extract_practice_tests(collection_url):
    """Extract individual practice test solution URLs from a collection page."""
    res = safe_request(collection_url)
    if not res:
        return []

    soup = BeautifulSoup(res.text, 'lxml')
    tests = []

    for card in soup.select('.practice-list__card'):
        title_el = card.select_one('.practice-list__title')
        card_title = title_el.text.strip() if title_el else 'Practice Test 1'
        
        # Test number e.g. 1, 2
        t_num = re.search(r'\d+', card_title)
        test_num = int(t_num.group()) if t_num else 1

        skills = {}
        for item in card.select('.practice-item'):
            stitle_el = item.select_one('.practice-item__title')
            stitle = stitle_el.text.strip().lower() if stitle_el else ''
            sol = item.select_one('.practice-item__feature-item.-solution')
            sol_link = sol.get('href', '') if sol else ''
            if sol_link:
                if sol_link.startswith('/'):
                    sol_link = BASE_URL + sol_link
                skills[stitle] = sol_link

        tests.append({
            'test_number': test_num,
            'title': card_title,
            'skills': skills
        })

    return tests

def parse_reading_page(html, test_id):
    """Parse IELTS Reading solution page."""
    soup = BeautifulSoup(html, 'lxml')
    
    # 1. Answer keys
    answers = {}
    for item in soup.select('.list-answer-item'):
        num_el = item.select_one('.number')
        ans_el = item.select_one('.sys-answer')
        if num_el and ans_el:
            num_text = num_el.text.strip()
            ans_text = ans_el.text.strip().replace('\xa0', ' ')
            nums = re.findall(r'\d+', num_text)
            if len(nums) == 1:
                answers[int(nums[0])] = ans_text
            elif len(nums) > 1:
                for n in range(int(nums[0]), int(nums[1]) + 1):
                    answers[n] = ans_text

    # 2. Explanations
    explanations = {}
    for exp in soup.select('.explanation'):
        parent_li = exp.find_parent('li')
        if parent_li:
            num_el = parent_li.select_one('.number, b, span')
            if num_el:
                m = re.search(r'\d+', num_el.text)
                if m:
                    q_num = int(m.group())
                    tbl = exp.select_one('table')
                    exp_text = tbl.text.strip() if tbl else exp.text.strip()
                    exp_text = re.sub(r'\s+', ' ', exp_text.replace('\xa0', ' '))
                    explanations[q_num] = exp_text

    # 3. Passages
    passages = []
    passage_divs = soup.select('.passage-content')
    for p_idx, p_div in enumerate(passage_divs):
        prev = p_div.find_previous_sibling(['h2', 'h3', 'h4', 'div'])
        title = prev.text.strip() if prev else f"Reading Passage {p_idx+1}"
        
        paragraphs = []
        for p_tag in p_div.find_all(['p', 'h3', 'h4']):
            txt = p_tag.text.strip().replace('\xa0', ' ')
            if not txt:
                continue
            label_m = re.match(r'^([A-H])\.\s*(.*)', txt)
            if label_m:
                label = label_m.group(1)
                body = label_m.group(2).strip()
            else:
                label = ""
                body = txt
            paragraphs.append({'label': label, 'text': body})
            
        passages.append({
            'section': p_idx + 1,
            'title': title,
            'paragraphs': paragraphs
        })

    # 4. Questions
    questions = []
    for q_num in sorted(answers.keys()):
        ans = answers.get(q_num, '')
        why = explanations.get(q_num, '')
        
        ans_upper = str(ans).strip().upper()
        if ans_upper in ['TRUE', 'FALSE', 'NOT GIVEN']:
            q_type = 'tfng'
        elif ans_upper in ['YES', 'NO', 'NOT GIVEN']:
            q_type = 'ynng'
        elif len(ans_upper) == 1 and ans_upper in 'ABCDEFGH':
            q_type = 'multiple_choice'
        else:
            q_type = 'gap_fill'

        # Extract prompt text
        prompt = ""
        el = soup.find(attrs={'data-num': str(q_num)})
        if el:
            p_container = el.find_parent('p') or el.find_parent('div')
            if p_container:
                soup_c = BeautifulSoup(str(p_container), 'lxml')
                for inp in soup_c.find_all(['input', 'select']):
                    n = inp.get('data-num')
                    inp.replace_with(f'[{n}]' if n else '[____]')
                for num_span in soup_c.select('.number'):
                    num_span.decompose()
                for exp_block in soup_c.select('.explanation, .sl-control, .sl-item'):
                    exp_block.decompose()
                prompt = re.sub(r'\s+', ' ', soup_c.text).strip()

        questions.append({
            'id': f"{test_id}-q{q_num:02d}",
            'number': q_num,
            'type': q_type,
            'prompt': prompt,
            'answer': ans,
            'why': why
        })

    # Propagate why for range questions if empty
    last_why = ""
    for q in questions:
        if q['why']:
            last_why = q['why']
        elif last_why and 'A,B,C' in str(q['answer']):
            q['why'] = last_why

    return {
        'skill': 'reading',
        'test_id': test_id,
        'passages': passages,
        'questions': questions
    }

def parse_listening_page(html, test_id):
    """Parse IELTS Listening solution page."""
    soup = BeautifulSoup(html, 'lxml')

    # Audio stream link (YouTube or MP3)
    audio_url = ""
    audio_tag = soup.find('audio')
    if audio_tag:
        audio_url = audio_tag.get('src') or ''
        if not audio_url:
            src_tag = audio_tag.find('source')
            if src_tag:
                audio_url = src_tag.get('src', '').strip()

    # Answer keys
    answers = {}
    for item in soup.select('.list-answer-item'):
        num_el = item.select_one('.number')
        ans_el = item.select_one('.sys-answer')
        if num_el and ans_el:
            num_text = num_el.text.strip()
            ans_text = ans_el.text.strip().replace('\xa0', ' ')
            nums = re.findall(r'\d+', num_text)
            if len(nums) == 1:
                answers[int(nums[0])] = ans_text
            elif len(nums) > 1:
                for n in range(int(nums[0]), int(nums[1]) + 1):
                    answers[n] = ans_text

    # Explanations
    explanations = {}
    for exp in soup.select('.explanation'):
        parent_li = exp.find_parent('li')
        if parent_li:
            num_el = parent_li.select_one('.number, b, span')
            if num_el:
                m = re.search(r'\d+', num_el.text)
                if m:
                    q_num = int(m.group())
                    tbl = exp.select_one('table')
                    exp_text = tbl.text.strip() if tbl else exp.text.strip()
                    exp_text = re.sub(r'\s+', ' ', exp_text.replace('\xa0', ' '))
                    explanations[q_num] = exp_text

    # Questions
    questions = []
    for q_num in sorted(answers.keys()):
        ans = answers.get(q_num, '')
        why = explanations.get(q_num, '')
        
        ans_upper = str(ans).strip().upper()
        if len(ans_upper) == 1 and ans_upper in 'ABCDEFGH':
            q_type = 'multiple_choice'
        else:
            q_type = 'gap_fill'

        prompt = ""
        el = soup.find(attrs={'data-num': str(q_num)})
        if el:
            p_container = el.find_parent('p') or el.find_parent('div')
            if p_container:
                soup_c = BeautifulSoup(str(p_container), 'lxml')
                for inp in soup_c.find_all(['input', 'select']):
                    n = inp.get('data-num')
                    inp.replace_with(f'[{n}]' if n else '[____]')
                for num_span in soup_c.select('.number'):
                    num_span.decompose()
                for exp_block in soup_c.select('.explanation, .sl-control, .sl-item'):
                    exp_block.decompose()
                prompt = re.sub(r'\s+', ' ', soup_c.text).strip()

        # Determine section (Part 1: 1-10, Part 2: 11-20, Part 3: 21-30, Part 4: 31-40)
        section = (q_num - 1) // 10 + 1

        questions.append({
            'id': f"{test_id}-q{q_num:02d}",
            'section': section,
            'number': q_num,
            'type': q_type,
            'prompt': prompt,
            'answer': ans,
            'why': why
        })

    return {
        'skill': 'listening',
        'test_id': test_id,
        'audio_url': audio_url,
        'questions': questions
    }

def parse_writing_page(html, test_id):
    """Parse IELTS Writing solution page."""
    soup = BeautifulSoup(html, 'lxml')
    content = soup.select_one('.tasks-content')
    if not content:
        return {'skill': 'writing', 'test_id': test_id, 'tasks': []}

    tasks = []
    # Find Task 1 and Task 2 blocks
    text = content.text
    t1_match = re.search(r'Writing Task 1\s*(.*?)(?=Writing Task 2|$)', text, re.DOTALL)
    t2_match = re.search(r'Writing Task 2\s*(.*?)$', text, re.DOTALL)

    img = content.find('img')
    img_url = img.get('src') or img.get('data-src') if img else ''
    if img_url and img_url.startswith('/'):
        img_url = BASE_URL + img_url

    if t1_match:
        p1 = re.sub(r'\s+', ' ', t1_match.group(1)).replace('+ Xem toàn bộ', '').strip()
        tasks.append({
            'task': 1,
            'title': 'Writing Task 1',
            'prompt': p1,
            'image_url': img_url
        })
    if t2_match:
        p2 = re.sub(r'\s+', ' ', t2_match.group(1)).replace('+ Xem toàn bộ', '').strip()
        tasks.append({
            'task': 2,
            'title': 'Writing Task 2',
            'prompt': p2,
            'image_url': ''
        })

    return {
        'skill': 'writing',
        'test_id': test_id,
        'tasks': tasks
    }

def clean_speaking_text(t):
    t = re.sub(r'Chiều dài:\s*\d{2}:\d{2}', '', t)
    t = re.sub(r'\d{2}:\d{2}', '', t)
    t = re.sub(r'--:--', '', t)
    t = t.replace('Take this test', '').strip()
    return re.sub(r'\s+', ' ', t).strip()

def parse_speaking_page(html, test_id):
    """Parse IELTS Speaking solution page."""
    soup = BeautifulSoup(html, 'lxml')
    content = soup.select_one('.tasks-content, .region-content')
    text = content.text if content else ''

    parts = []
    p1 = re.search(r'PART 1\s*(.*?)(?=PART 2|$)', text, re.DOTALL | re.IGNORECASE)
    p2 = re.search(r'PART 2\s*(.*?)(?=PART 3|$)', text, re.DOTALL | re.IGNORECASE)
    p3 = re.search(r'PART 3\s*(.*?)$', text, re.DOTALL | re.IGNORECASE)

    if p1:
        parts.append({'part': 1, 'content': clean_speaking_text(p1.group(1))})
    if p2:
        parts.append({'part': 2, 'content': clean_speaking_text(p2.group(1))})
    if p3:
        parts.append({'part': 3, 'content': clean_speaking_text(p3.group(1))})

    return {
        'skill': 'speaking',
        'test_id': test_id,
        'parts': parts
    }

def convert_to_markdown(data):
    """Convert parsed test data to clean markdown."""
    skill = data.get('skill', '')
    tid = data.get('test_id', 'Test')
    md = [f"# IELTS {skill.capitalize()} Test: {tid}\n"]

    if skill == 'reading':
        for p in data.get('passages', []):
            md.append(f"## Reading Passage {p.get('section', '')}: {p.get('title', '')}\n")
            for para in p.get('paragraphs', []):
                lbl = f"**[{para['label']}]** " if para.get('label') else ""
                md.append(f"{lbl}{para['text']}\n")
            md.append("---\n")
        
        md.append("## Questions & Answer Keys\n")
        for q in data.get('questions', []):
            md.append(f"### Question {q['number']} ({q['type']})")
            md.append(f"**Prompt:** {q['prompt']}\n")
            md.append(f"**Answer:** `{q['answer']}`\n")
            if q.get('why'):
                md.append(f"**Explanation:** {q['why']}\n")
            md.append("")

    elif skill == 'listening':
        if data.get('audio_url'):
            md.append(f"**Audio Stream Link:** [{data['audio_url']}]({data['audio_url']})\n")
        md.append("## Questions & Answer Keys\n")
        for q in data.get('questions', []):
            md.append(f"### Question {q['number']} (Section {q.get('section', 1)})")
            md.append(f"**Prompt:** {q['prompt']}\n")
            md.append(f"**Answer:** `{q['answer']}`\n")
            if q.get('why'):
                md.append(f"**Explanation:** {q['why']}\n")
            md.append("")

    elif skill == 'writing':
        for t in data.get('tasks', []):
            md.append(f"## {t.get('title')}\n")
            md.append(f"{t.get('prompt')}\n")
            if t.get('image_url'):
                md.append(f"![Diagram]({t.get('image_url')})\n")
            md.append("---\n")

    elif skill == 'speaking':
        for p in data.get('parts', []):
            md.append(f"## Part {p.get('part')}\n")
            md.append(f"{p.get('content')}\n")
            md.append("---\n")

    return "\n".join(md)

def run_crawler(limit_packs=None):
    """Main crawler loop."""
    os.makedirs(TARGET_DIR, exist_ok=True)
    packs = discover_target_collections()
    if limit_packs:
        packs = packs[:limit_packs]

    catalog_path = os.path.join(TARGET_DIR, 'catalog.json')
    catalog_summary = []

    print(f"\n[START] Starting extraction for {len(packs)} collections into: {TARGET_DIR}")

    total_downloaded = 0
    total_skipped = 0

    for p_idx, pack in enumerate(packs, 1):
        slug = pack['slug']
        print(f"\n=======================================================")
        print(f"[{p_idx}/{len(packs)}] Processing: {pack['year_group']} - {pack['name']} ({slug})")
        print(f"=======================================================")

        tests = extract_practice_tests(pack['url'])
        if not tests:
            print(f"[WARN] No practice tests found in {pack['url']}")
            continue

        for test in tests:
            t_num = test['test_number']
            test_folder = os.path.join(TARGET_DIR, slug, f"practice-test-{t_num}")
            os.makedirs(test_folder, exist_ok=True)

            print(f"  -> Practice Test {t_num} ({len(test['skills'])} skills)")

            for skill, sol_url in test['skills'].items():
                json_path = os.path.join(test_folder, f"{skill}.json")
                md_path = os.path.join(test_folder, f"{skill}.md")

                # Skip if already downloaded
                if os.path.exists(json_path) and os.path.getsize(json_path) > 100:
                    print(f"     [{skill.upper()}] Already exists, skipping.")
                    total_skipped += 1
                    continue

                print(f"     [{skill.upper()}] Fetching: {sol_url}")
                res = safe_request(sol_url)
                if not res:
                    print(f"     [FAILED] Could not load {sol_url}")
                    continue

                test_id = f"{slug}-t{t_num}-{skill}"

                if skill == 'reading':
                    parsed = parse_reading_page(res.text, test_id)
                elif skill == 'listening':
                    parsed = parse_listening_page(res.text, test_id)
                elif skill == 'writing':
                    parsed = parse_writing_page(res.text, test_id)
                elif skill == 'speaking':
                    parsed = parse_speaking_page(res.text, test_id)
                else:
                    parsed = {'skill': skill, 'test_id': test_id}

                # Save JSON
                with open(json_path, 'w', encoding='utf-8') as f:
                    json.dump(parsed, f, ensure_ascii=False, indent=2)

                # Save Markdown
                md_text = convert_to_markdown(parsed)
                with open(md_path, 'w', encoding='utf-8') as f:
                    f.write(md_text)

                total_downloaded += 1

        catalog_summary.append({
            'year_group': pack['year_group'],
            'name': pack['name'],
            'slug': slug,
            'url': pack['url'],
            'practice_tests': len(tests)
        })

        # Save progress to catalog.json
        with open(catalog_path, 'w', encoding='utf-8') as f:
            json.dump(catalog_summary, f, ensure_ascii=False, indent=2)

    print("\n[COMPLETE] Scraping finished!")
    print(f"Total files downloaded: {total_downloaded}")
    print(f"Total files skipped (already existed): {total_skipped}")
    print(f"Data saved to: {TARGET_DIR}")

if __name__ == '__main__':
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else None
    run_crawler(limit_packs=limit)
