import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

arrays = ['VEHICLES', 'CLIENTS', 'PAYMENTS', 'NOTIFS', 'RENTALS', 'DOCUMENTS', 'CONTRACTS']
for arr in arrays:
    content = re.sub(rf'const {arr} = \[.*?\];', f'const {arr} = [];', content, flags=re.DOTALL)
    print(f'Cleared {arr}')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done! All demo data removed.')
f = open('src/App.jsx', 'r', encoding='utf-8')
c = f.read()
f.close()
c = c.replace('utilisateur_id: user.id,\n      client_id: form.clientId', 'user_id: user.id,\n      client_id: form.clientId')
c = c.replace('total_amount: total,\n      km_start', 'total: total,\n      km_start')
f = open('src/App.jsx', 'w', encoding='utf-8')
f.write(c)
f.close()
print('OK')python fix.py
git add . && git commit -m "fix rentals" && git push
