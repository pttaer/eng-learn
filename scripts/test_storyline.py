import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

url = 'https://prd-swp-le.s3-eu-west-1.amazonaws.com/lrg/c1g060-ellipsis/story.html'
try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        print('Story.html length:', len(content))
        scripts = re.findall(r'src=[\'"]([^\'"]+)[\'"]', content)
        print('Scripts in story.html:', scripts)
except Exception as e:
    print('Error story.html:', e)

# Check data.js or story_content files
for test_file in ['story_content/data.js', 'story_content/slides/data.json', 'data.json']:
    u = f'https://prd-swp-le.s3-eu-west-1.amazonaws.com/lrg/c1g060-ellipsis/{test_file}'
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read().decode('utf-8', errors='ignore')
            print(f'{test_file} exists! Length: {len(data)}')
            # Look for questions/text
            texts = re.findall(r'\"(?:text|title|prompt|value)\"\s*:\s*\"([^\"]+)\"', data)
            if texts:
                print(f'Sample texts from {test_file}:', texts[:10])
    except Exception as e:
        print(f'{test_file} failed: {e}')
