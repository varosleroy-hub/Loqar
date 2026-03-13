import re

f = open('src/App.jsx', 'r', encoding='utf-8')
c = f.read()
f.close()
c = c.replace('r.total_amount', 'r.total')
c = c.replace('sel.total_amount', 'sel.total')
c = c.replace('x.total_amount', 'x.total')
f = open('src/App.jsx', 'w', encoding='utf-8')
f.write(c)
f.close()
print('OK')
