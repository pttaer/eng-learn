import re
import json
from bs4 import BeautifulSoup
import requests

def parse_reading_solution(html_content, test_id="r_sample"):
    soup = BeautifulSoup(html_content, 'lxml')
    
    # 1. Answer keys & explanations
    answers = {}
    for item in soup.select('.list-answer-item'):
        num_el = item.select_one('.number')
        ans_el = item.select_one('.sys-answer')
        if num_el and ans_el:
            num_text = num_el.text.strip()
            ans_text = ans_el.text.strip().replace('\xa0', ' ')
            
            # Handle range numbers like "18 \n 22"
            nums = re.findall(r'\d+', num_text)
            if len(nums) == 1:
                answers[int(nums[0])] = ans_text
            elif len(nums) > 1:
                start_n = int(nums[0])
                end_n = int(nums[1])
                for n in range(start_n, end_n + 1):
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
                    exp_text = tbl.text.strip().replace('\xa0', ' ') if tbl else exp.text.strip().replace('\xa0', ' ')
                    # Clean multiple whitespace
                    exp_text = re.sub(r'\s+', ' ', exp_text)
                    explanations[q_num] = exp_text

    # 2. Passages
    passages = []
    passage_divs = soup.select('.passage-content')
    for p_idx, p_div in enumerate(passage_divs):
        # Look for heading
        title = ""
        prev = p_div.find_previous_sibling(['h2', 'h3', 'h4', 'div'])
        if prev:
            title = prev.text.strip()
        
        # Paragraphs
        paragraphs = []
        p_tags = p_div.find_all(['p', 'h3', 'h4'])
        for p_tag in p_tags:
            txt = p_tag.text.strip().replace('\xa0', ' ')
            if not txt:
                continue
            # Check label e.g. "A." or "B" or "[A]"
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

    # 3. Questions
    questions = []
    # Questions are in the questions panels or review panels
    # Let's collect all questions 1..40
    # From answer keys:
    for q_num in sorted(answers.keys()):
        ans = answers.get(q_num, '')
        why = explanations.get(q_num, '')
        
        # Determine likely type from answer format
        q_type = 'unknown'
        ans_upper = str(ans).strip().upper()
        if ans_upper in ['TRUE', 'FALSE', 'NOT GIVEN']:
            q_type = 'tfng'
        elif ans_upper in ['YES', 'NO', 'NOT GIVEN']:
            q_type = 'ynng'
        elif len(ans_upper) == 1 and ans_upper in 'ABCDEFGH':
            q_type = 'multiple_choice'
        else:
            q_type = 'gap_fill'

        # Look for prompt in the question blocks
        prompt = ""
        # Find element containing question number
        q_span = soup.find(lambda el: el.name == 'span' and 'number' in el.get('class', []) and el.text.strip() == str(q_num))
        if q_span:
            q_parent = q_span.find_parent(['p', 'div', 'li'])
            if q_parent:
                prompt = q_parent.text.strip().replace('\xa0', ' ')
                prompt = re.sub(r'\s+', ' ', prompt)
                
        questions.append({
            'id': f"{test_id}-q{q_num:02d}",
            'number': q_num,
            'type': q_type,
            'prompt': prompt,
            'answer': ans,
            'why': why
        })

    return {
        'passages': passages,
        'questions': questions
    }

if __name__ == '__main__':
    url = 'https://ieltsonlinetests.com/vi/ielts-mock-test-2025-january-reading-practice-test-1/solution'
    r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = parse_reading_solution(r.text, 'r2025-01-t1')
    print(f"Passages parsed: {len(res['passages'])}")
    for p in res['passages']:
        print(f"  Section {p['section']}: '{p['title']}', {len(p['paragraphs'])} paragraphs")
    print(f"Questions parsed: {len(res['questions'])}")
    for q in res['questions'][:8]:
        print(f"  Q{q['number']} ({q['type']}): ans='{q['answer']}'")
        print(f"    prompt: {q['prompt'][:80]}...")
        print(f"    why: {q['why'][:80]}...")
