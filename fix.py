import re

f = open('src/App.jsx', 'r', encoding='utf-8')
c = f.read()
f.close()
c = c.replace('utilisateur_id: user.id,', 'user_id: user.id,')
c = c.replace('total_amount: total,', 'total: total,')
f = open('src/App.jsx', 'w', encoding='utf-8')
f.write(c)
f.close()
print('OK')

