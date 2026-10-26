import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import re

url = 'https://prd-swp-le.s3.amazonaws.com/lrg/c1g001-reporting-verbs/mobile/data.js'
with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})) as resp:
    packed = resp.read().decode('utf-8', errors='ignore')

def unpack_dean_edwards(packed):
    # Find payload, a, c, k
    # eval(function(p,a,c,k,e,d)...return p}('payload',radix,count,'k'.split('|'),0,{}))
    m = re.search(r"}\s*\(\s*'(.*?)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'(.*?)'\.split\('\|'\)", packed, re.DOTALL)
    if not m:
        m = re.search(r'}\s*\(\s*"(.*?)"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*"(.*?)"\.split\("\|"\)', packed, re.DOTALL)
    if not m:
        print("Regex did not match packer wrapper")
        return None
    payload, radix_str, count_str, syms_str = m.groups()
    radix = int(radix_str)
    count = int(count_str)
    syms = syms_str.split('|')
    
    digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    def base_encode(num, b):
        if num == 0: return '0'
        res = []
        while num > 0:
            res.append(digits[num % b])
            num //= b
        return ''.join(reversed(res))
    
    lookup = {}
    for i in range(count):
        k = base_encode(i, radix)
        lookup[k] = syms[i] if i < len(syms) and syms[i] else k
        
    def repl(match):
        token = match.group(0)
        return lookup.get(token, token)
        
    return re.sub(r'\b[0-9a-zA-Z]+\b', repl, payload)

unpacked = unpack_dean_edwards(packed)
if unpacked:
    print("Successfully unpacked in Python! Length:", len(unpacked))
    print("Prefix:", unpacked[:150])
else:
    print("Failed to unpack")
