import sys
sys.stdout.reconfigure(encoding='utf-8')
from bs4 import BeautifulSoup

with open('scratch_sl2.xml', 'r', encoding='utf-8', errors='ignore') as f:
    xml = f.read()

xml = xml.replace('\\"', '"').replace("\\'", "'")
soup = BeautifulSoup(xml, 'html.parser')

for inter in soup.find_all('interaction'):
    q_text = inter.get('lmstext', '')
    q_type = inter.get('type', '')
    choices = {c.get('id'): c.get('lmstext', '') for c in inter.find_all('choice')}
    
    correct_choices = []
    for ans in inter.find_all('answer'):
        if ans.get('status') == 'correct':
            # Check equals
            eq = ans.find('equals')
            if eq:
                cid = eq.get('choiceid', '').replace('choices.', '')
                correct_choices.append(choices.get(cid, cid))
    
    print(f"Question ({q_type}): {q_text}")
    print(f"  Choices: {list(choices.values())}")
    print(f"  Correct: {correct_choices}")
