import re
f = open('src/App.jsx', 'r', encoding='utf-8')
c = f.read()
f.close()

# Trouver la fin du premier bloc handleElementPhoto
idx1 = 141440
idx2 = 143825

# Supprimer tout entre idx1 et idx2
c = c[:idx1] + c[idx2:]

f = open('src/App.jsx', 'w', encoding='utf-8')
f.write(c)
f.close()
print('OK')