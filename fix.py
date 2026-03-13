import re

f = open('src/App.jsx', 'r', encoding='utf-8')
c = f.read()
f.close()

old = '''{checks.map(el=>(
                <tr key={el}>
                  <td style={{ padding:"8px 12px", fontSize:12, color:"#1A1510" }}>{el}</td>
                  <td style={{ padding:"8px 12px", textAlign:"center" }}><input type="radio" name={el} value="bon"/></td>
                  <td style={{ padding:"8px 12px", textAlign:"center" }}><input type="radio" name={el} value="dommage"/></td>
                  <td style={{ padding:"8px 12px", fontSize:11, color:"#888" }}>…</td>
                </tr>
              ))}'''

new = '''{checks.map(el=>(
                <tr key={el}>
                  <td style={{ padding:"8px 12px", fontSize:12, color:"#1A1510" }}>{el}</td>
                  <td style={{ padding:"8px 12px", textAlign:"center" }}><input type="radio" name={el} value="bon"/></td>
                  <td style={{ padding:"8px 12px", textAlign:"center" }}><input type="radio" name={el} value="dommage"/></td>
                  <td style={{ padding:"8px 12px", fontSize:11, color:"#888" }}>…</td>
                  <td style={{ padding:"8px 12px" }}>
                    {elementPhotos[el]
                      ? <img src={elementPhotos[el]} style={{ width:60, height:40, objectFit:"cover", borderRadius:4 }}/>
                      : <label style={{ fontSize:10, color:"#888", cursor:"pointer", background:"#f0ede8", padding:"3px 8px", borderRadius:4 }}>
                          📷 Photo
                          <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleElementPhoto(el, e.target.files[0])}/>
                        </label>
                    }
                  </td>
                </tr>
              ))}'''

c = c.replace(old, new)
f = open('src/App.jsx', 'w', encoding='utf-8')
f.write(c)
f.close()
print('OK')