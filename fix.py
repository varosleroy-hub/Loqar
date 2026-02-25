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
