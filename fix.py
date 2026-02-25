import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'const VEHICLES = \[.*?\];', 'const VEHICLES = [];', content, flags=re.DOTALL)
content = re.sub(r'const CLIENTS = \[.*?\];', 'const CLIENTS = [];', content, flags=re.DOTALL)
content = re.sub(r'const PAYMENTS = \[.*?\];', 'const PAYMENTS = [];', content, flags=re.DOTALL)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done! Demo data removed.')
