#!/data/data/com.termux/files/usr/bin/bash
cd "$(dirname "$0")"
python3 - << 'PY'
import re
c = open('ai.html').read()
blocks = re.findall(r'<script>(.*?)</script>', c, re.DOTALL)
n = 0
for i, b in enumerate(blocks):
    if b.strip():
        open('/data/data/com.termux/files/usr/tmp/chk%d.js' % i, 'w').write(b)
        n += 1
print('inline blocks:', n)
PY
for f in /data/data/com.termux/files/usr/tmp/chk*.js; do
  [ -e "$f" ] || continue
  node --check "$f" || { echo "FAIL: $f"; exit 1; }
done
echo "ALL BLOCKS SYNTAX OK"
