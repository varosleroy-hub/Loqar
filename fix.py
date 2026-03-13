import re
f = open('src/App.jsx', 'r', encoding='utf-8')
c = f.read()
f.close()

idx1 = 141438
end1 = 141944

c = c[:idx1] + c[end1:]

f = open('src/App.jsx', 'w', encoding='utf-8')
f.write(c)
f.close()
print('OK')