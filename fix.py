import re
f = open('src/App.jsx', 'r', encoding='utf-8')
c = f.read()
f.close()

# Remove the duplicate declaration
old = '''  const [elementPhotos, setElementPhotos] = useState({});
  const handleElementPhoto = async (element, file) => {
    if (!file) return;
    const path = `inspections/${Date.now()}_${element}.${file.name.split('.').pop()}`;
    const { data } = await supabase.storage.from('photos').upload(path, file, { upsert: true });
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path);
      setElementPhotos(prev => ({ ...prev, [element]: publicUrl }));
    }
  };
  const [elementPhotos, setElementPhotos] = useState({});
  const handleElementPhoto = async (element, file) => {'''

new = '''  const [elementPhotos, setElementPhotos] = useState({});
  const handleElementPhoto = async (element, file) => {'''

c = c.replace(old, new)
f = open('src/App.jsx', 'w', encoding='utf-8')
f.write(c)
f.close()
print('OK')
