import re
f = open('src/App.jsx', 'r', encoding='utf-8')
c = f.read()
f.close()

old = '''<td style={{ padding:"6px 10px", fontSize:11, fontWeight:600 }}>{item}</td>
                        <td style={{ padding:"6px 10px", textAlign:"center" }}>
                          <input type="radio" name={item} value="ok" checked={checks[item]==="ok"} onChange={()=>toggleCheck(item,"ok")}/>
                        </td>'''

new = '''<td style={{ padding:"6px 10px", fontSize:11, fontWeight:600 }}>{item}</td>
                        <td style={{ padding:"6px 10px", textAlign:"center" }}>
                          <input type="radio" name={item} value="ok" checked={checks[item]==="ok"} onChange={()=>toggleCheck(item,"ok")}/>
                        </td>'''

c = c.replace(old, new)

old2 = '''onChange={()=>toggleCheck(item,"ok")}/>
                        </td>
                        <td style={{ padding:"6px 10px", textAlign:"center" }}>
                          <input type="radio" name={item} value="dommage"'''

new2 = '''onChange={()=>toggleCheck(item,"ok")}/>
                        </td>
                        <td style={{ padding:"6px 10px", textAlign:"center" }}>
                          <input type="radio" name={item} value="dommage"'''

# Find the closing tr and add photo column
old3 = '''<td style={{ padding:"6px 10px", fontSize:11, color:"#999" }}>...</td>
                      </tr>'''

new3 = '''<td style={{ padding:"6px 10px", fontSize:11, color:"#999" }}>...</td>
                        <td style={{ padding:"6px 10px" }}>
                          {elementPhotos[item]
                            ? <img src={elementPhotos[item]} style={{ width:60, height:40, objectFit:"cover", borderRadius:4 }}/>
                            : <label style={{ fontSize:10, color:"#888", cursor:"pointer", background:"#f0ede8", padding:"3px 8px", borderRadius:4, display:"inline-block" }}>
                                📷
                                <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleElementPhoto(item, e.target.files[0])}/>
                              </label>
                          }
                        </td>
                      </tr>'''

c = c.replace(old3, new3)
f = open('src/App.jsx', 'w', encoding='utf-8')
f.write(c)
f.close()
print('OK')