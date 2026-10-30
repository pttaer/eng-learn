import os
import sys
import re
import json
import time
import urllib.request
from bs4 import BeautifulSoup

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT_OUTPUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'research English contents', '5_star_resources'))
os.makedirs(ROOT_OUTPUT, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
}

def fetch_url(url, timeout=20):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  [ERROR] {url} -> {e}")
        return None

# ==========================================
# 1. ACADEMIC WORD LIST (AWL) - Averil Coxhead
# ==========================================
def harvest_awl():
    print("\n--- Harvesting 06: Academic Word List (AWL) ---")
    out_dir = os.path.join(ROOT_OUTPUT, '06_academic_word_list_awl')
    os.makedirs(out_dir, exist_ok=True)
    
    awl_data = {
        "title": "Academic Word List (AWL) - Complete 10 Sublists & Word Families",
        "author": "Averil Coxhead",
        "institution": "Victoria University of Wellington",
        "total_sublists": 10,
        "sublists": {}
    }
    
    total_headwords = 0
    total_forms = 0
    all_awl_cards = []
    
    for i in range(1, 11):
        sublist_num = f"{i:02d}"
        url = f"https://www.wgtn.ac.nz/lals/resources/academicwordlist/sublist/sublist{sublist_num}"
        print(f"  Fetching AWL Sublist {i} from {url}...")
        html = fetch_url(url)
        if not html:
            continue
            
        soup = BeautifulSoup(html, 'html.parser')
        main_content = soup.select_one('main') or soup.select_one('article') or soup.select_one('.content') or soup
        
        headwords_list = []
        for p in main_content.find_all('p'):
            text = p.get_text().strip()
            if not text or len(text.split()) > 3:
                continue
            if text.lower() in ['the academic word list', 'sublist', 'headwords', 'most frequent words']:
                continue
                
            nxt = p.find_next_sibling()
            family = []
            if nxt and nxt.name == 'ul':
                family = [li.get_text().strip() for li in nxt.find_all('li') if li.get_text().strip()]
            
            all_forms = sorted(list(set([text] + family)))
            headwords_list.append({
                "headword": text,
                "family_members": family,
                "all_forms": all_forms,
                "family_size": len(all_forms)
            })
            
            # Add to card pool
            all_awl_cards.append({
                "headword": text,
                "sublist": i,
                "family_sample": ", ".join(all_forms[:5])
            })
            
        sub_forms = sum(len(h['all_forms']) for h in headwords_list)
        total_headwords += len(headwords_list)
        total_forms += sub_forms
        
        awl_data["sublists"][f"sublist_{i}"] = {
            "sublist_number": i,
            "url": url,
            "headwords_count": len(headwords_list),
            "total_word_forms_count": sub_forms,
            "headwords": headwords_list
        }
        print(f"    -> Sublist {i:02d}: {len(headwords_list)} headwords, {sub_forms} distinct forms")
        time.sleep(0.3)
        
    awl_data["total_headwords"] = total_headwords
    awl_data["total_harvested_word_forms"] = total_forms
    
    # Save complete JSON
    json_path = os.path.join(out_dir, 'awl_complete_sublists_1_to_10.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(awl_data, f, ensure_ascii=False, indent=2)
    print(f"  Saved AWL JSON: {json_path} ({total_headwords} headwords, {total_forms} word forms)")
    
    # Save Markdown documentation
    md_path = os.path.join(out_dir, 'README.md')
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write("# Academic Word List (AWL) - Complete 10 Sublists & Word Families\n\n")
        f.write("> **Source:** Victoria University of Wellington (Averil Coxhead)\n")
        f.write("> **Evaluation:** ⭐⭐⭐⭐⭐ (5/5) — Gold Standard for Academic Lexis\n")
        f.write(f"> **Total Headwords:** {total_headwords} | **Total Word Forms:** {total_forms}\n\n")
        f.write("## Overview\n")
        f.write("The Academic Word List (AWL) contains 570 headwords and their complete word families, divided into 10 sublists based on frequency across a 3.5-million-word corpus of academic texts. Sublist 1 contains the most frequent words; Sublist 10 contains the least frequent of the top 570.\n\n")
        for i in range(1, 11):
            s = awl_data["sublists"].get(f"sublist_{i}", {})
            f.write(f"### Sublist {i} ({s.get('headwords_count', 0)} headwords, {s.get('total_word_forms_count', 0)} word forms)\n\n")
            hws = s.get("headwords", [])
            for h in hws[:10]:
                f.write(f"- **`{h['headword']}`**: {', '.join(h['all_forms'][:8])}\n")
            if len(hws) > 10:
                f.write(f"- *...and {len(hws) - 10} more headwords in full JSON.*\n")
            f.write("\n")
    print(f"  Saved AWL Markdown: {md_path}")
    return all_awl_cards

# ==========================================
# 2. MANCHESTER ACADEMIC PHRASEBANK
# ==========================================
def harvest_manchester_phrasebank():
    print("\n--- Harvesting 03: Manchester Academic Phrasebank ---")
    out_dir = os.path.join(ROOT_OUTPUT, '03_manchester_academic_phrasebank')
    os.makedirs(out_dir, exist_ok=True)
    
    sections = [
        ("introducing-work", "Introducing Work", "https://www.phrasebank.manchester.ac.uk/introducing-work/"),
        ("referring-to-sources", "Referring to Sources", "https://www.phrasebank.manchester.ac.uk/referring-to-sources/"),
        ("describing-methods", "Describing Methods", "https://www.phrasebank.manchester.ac.uk/describing-methods/"),
        ("reporting-results", "Reporting Results", "https://www.phrasebank.manchester.ac.uk/reporting-results/"),
        ("discussing-findings", "Discussing Findings", "https://www.phrasebank.manchester.ac.uk/discussing-findings/"),
        ("writing-conclusions", "Writing Conclusions", "https://www.phrasebank.manchester.ac.uk/writing-conclusions/"),
        ("using-cautious-language", "Being Cautious", "https://www.phrasebank.manchester.ac.uk/using-cautious-language/"),
        ("being-critical", "Being Critical", "https://www.phrasebank.manchester.ac.uk/being-critical/"),
        ("classifying-and-listing", "Classifying and Listing", "https://www.phrasebank.manchester.ac.uk/classifying-and-listing/"),
        ("compare-and-contrast", "Comparing and Contrasting", "https://www.phrasebank.manchester.ac.uk/compare-and-contrast/"),
        ("writing-definitions", "Defining Terms", "https://www.phrasebank.manchester.ac.uk/writing-definitions/"),
        ("giving-examples", "Giving Examples", "https://www.phrasebank.manchester.ac.uk/giving-examples/"),
        ("explaining-cause-and-effect", "Explaining Causality", "https://www.phrasebank.manchester.ac.uk/explaining-cause-and-effect/"),
        ("signalling-transition", "Signalling Transition", "https://www.phrasebank.manchester.ac.uk/signalling-transition/")
    ]
    
    phrasebank_db = {
        "title": "Manchester Academic Phrasebank",
        "institution": "The University of Manchester",
        "author": "Dr. John Morley",
        "sections": {}
    }
    
    total_phrases = 0
    total_categories = 0
    
    for slug, title, url in sections:
        print(f"  Fetching Phrasebank: {title} ({url})...")
        html = fetch_url(url)
        if not html:
            continue
            
        soup = BeautifulSoup(html, 'html.parser')
        toggles = soup.select('.et_pb_toggle')
        
        subsections = []
        for t in toggles:
            title_el = t.select_one('.et_pb_toggle_title') or t.find(['h5', 'h4', 'h3'])
            t_title = title_el.get_text().strip() if title_el else "General Functional Phrases"
            content_el = t.select_one('.et_pb_toggle_content')
            phrases = []
            if content_el:
                for p in content_el.find_all('p'):
                    for br in p.find_all('br'):
                        br.replace_with('\n')
                    for line in p.get_text().split('\n'):
                        cleaned = line.strip().replace('\xa0', ' ')
                        cleaned = re.sub(r'[\u2026\.\.\.]{1,}', '...', cleaned)
                        if cleaned and len(cleaned) > 5 and not any(ign in cleaned.lower() for ign in ['click here', 'cookie', 'copyright', 'privacy']):
                            phrases.append(cleaned)
            if phrases:
                subsections.append({
                    "function_category": t_title,
                    "phrase_count": len(phrases),
                    "phrases": phrases
                })
        
        sec_phrases_count = sum(s["phrase_count"] for s in subsections)
        total_phrases += sec_phrases_count
        total_categories += len(subsections)
        print(f"    -> Extracted {sec_phrases_count} phrases across {len(subsections)} functional toggles")
        
        phrasebank_db["sections"][slug] = {
            "title": title,
            "url": url,
            "toggle_count": len(subsections),
            "phrase_count": sec_phrases_count,
            "functional_categories": subsections
        }
        time.sleep(0.3)
        
    phrasebank_db["total_phrases"] = total_phrases
    phrasebank_db["total_functional_categories"] = total_categories
    
    # Save complete JSON
    json_path = os.path.join(out_dir, 'manchester_phrasebank_complete.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(phrasebank_db, f, ensure_ascii=False, indent=2)
    print(f"  Saved Phrasebank JSON: {json_path} ({total_phrases} total phrases across {total_categories} categories)")
    
    # Save Markdown documentation
    md_path = os.path.join(out_dir, 'README.md')
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write("# Manchester Academic Phrasebank (Crawled & Structured)\n\n")
        f.write("> **Institution:** The University of Manchester (Dr. John Morley)\n")
        f.write("> **Evaluation:** ⭐⭐⭐⭐⭐ (5/5) — Essential weapon for Academic Writing\n")
        f.write(f"> **Total Extracted Academic Phrase Stems:** {total_phrases} across {total_categories} functional categories in all 14 core sections\n\n")
        f.write("## Table of Academic Functions\n\n")
        for slug, data in phrasebank_db["sections"].items():
            f.write(f"### {data['title']} ({data['phrase_count']} phrases, {data['toggle_count']} categories)\n")
            f.write(f"URL: `{data['url']}`\n\n")
            for sub in data["functional_categories"]:
                f.write(f"#### {sub['function_category']} ({sub['phrase_count']} stems)\n")
                for p in sub["phrases"][:6]:
                    f.write(f"- {p}\n")
                if len(sub["phrases"]) > 6:
                    f.write(f"- *...and {len(sub['phrases']) - 6} more stems in full JSON.*\n")
                f.write("\n")
    print(f"  Saved Phrasebank Markdown: {md_path}")

if __name__ == '__main__':
    harvest_awl()
    harvest_manchester_phrasebank()
