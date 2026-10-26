import sys
sys.stdout.reconfigure(encoding='utf-8')
from bs4 import BeautifulSoup

with open('scratch_sl2.xml', 'r', encoding='utf-8', errors='ignore') as f:
    xml = f.read()

xml = xml.replace('\\"', '"').replace("\\'", "'")
soup = BeautifulSoup(xml, 'html.parser')
sl = soup.find('slide', id='5w6L5i8UxnR')
if sl:
    print(sl.prettify()[:3000])
