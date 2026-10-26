import re
import json

with open('scratch_cambridge.html', 'r', encoding='utf-8') as f:
    text = f.read()

print('File length:', len(text))

# Let's find links
links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', text)
act_links = [l for l in links if 'activities-for-learners' in l]
print(f'Total activities-for-learners links: {len(act_links)}')
unique_act_links = sorted(list(set(act_links)))
for l in unique_act_links[:30]:
    print('  ', l)

# Let's check for any form or query or api
endpoints = re.findall(r'[\'"]([^\'"]*(?:api|search|results|service|activities)[^\'"]*)[\'"]', text, re.IGNORECASE)
print('\nPotential endpoints/services:')
for ep in set(endpoints):
    if any(k in ep.lower() for k in ['api', 'service', 'json', 'activity', 'filter']):
        if len(ep) < 120 and not ep.endswith('.css') and not ep.endswith('.js'):
            print('  ', ep)
