import { useState, useEffect, useRef } from "react";

const C = { obsidian:'#080807', gold:'#C9A84C', warm:'#F2EDE4', red:'#D93B2B', charcoal:'#1A1A18', blue:'#4A90E2' };
const TOTAL = 450; const FPS = 30;

function lerp(f,a,b,i,o){ if(f<=i)return a; if(f>=o)return b; const t=(f-i)/(o-i),e=t<.5?2*t*t:-1+(4-2*t)*t; return a+(b-a)*e; }
function cl(v){ return Math.max(0,Math.min(1,v)); }
function sp(f,delay=0,k=.10){ const d=Math.max(0,f-delay); return cl(1-Math.exp(-k*d)*Math.cos(.18*d)); }

// ─── PHONE MOCKUP ───────────────────────────────────────────
function PhoneMockup({ frame, startFrame }){
  const sc = sp(frame - startFrame, 0, .08);
  const op = cl(lerp(frame, 0, 1, startFrame, startFrame+10));
  const msgs = [
    { txt:"Bonjour, dispo samedi ?", t:8,  side:'left' },
    { txt:"Contrat envoyé ✓", t:22, side:'right', gold:true },
    { txt:"Paiement reçu 350€ ✓", t:36, side:'right', gold:true },
    { txt:"Merci ! Top service 🙏", t:50, side:'left' },
  ];
  return (
    <div style={{ opacity:op, transform:`scale(${.6+sc*.4})`, transformOrigin:'center top' }}>
      <div style={{ width:160, background:'#111', borderRadius:18, border:'1px solid #333', overflow:'hidden', padding:'10px 0' }}>
        <div style={{ textAlign:'center', fontSize:9, color:'#ffffff22', letterSpacing:2, padding:'4px 0 8px', borderBottom:'1px solid #ffffff08' }}>LOQAR</div>
        <div style={{ padding:'8px 10px', display:'flex', flexDirection:'column', gap:6 }}>
          {msgs.map((m,i)=>{
            const mop = cl(lerp(frame, 0, 1, startFrame+m.t, startFrame+m.t+10));
            return (
              <div key={i} style={{ opacity:mop, display:'flex', justifyContent:m.side==='right'?'flex-end':'flex-start' }}>
                <div style={{ background:m.gold?`${C.gold}22`:m.side==='right'?'#2a2a2a':'#1a1a1a', border:`1px solid ${m.gold?C.gold+'44':'#ffffff0a'}`, borderRadius:10, padding:'5px 9px', maxWidth:'85%' }}>
                  <span style={{ fontSize:9, color:m.gold?C.gold:m.side==='right'?C.warm:'#ffffff55', lineHeight:1.3 }}>{m.txt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD CARD ─────────────────────────────────────────
function DashCard({ label, value, sub, frame, startFrame, color=C.gold }){
  const op = cl(lerp(frame,0,1,startFrame,startFrame+14));
  const y  = lerp(frame,18,0,startFrame,startFrame+14);
  const progress = sp(Math.max(0,frame-startFrame-4), 0, .05);
  return (
    <div style={{ opacity:op, transform:`translateY(${y}px)`, background:'#111', border:`1px solid ${color}22`, borderRadius:12, padding:'10px 14px', flex:1 }}>
      <div style={{ fontSize:9, color:'#ffffff33', letterSpacing:2, textTransform:'uppercase', marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:28, color, lineHeight:1 }}>
        {typeof value === 'number' ? Math.round(value*progress) : value}
      </div>
      <div style={{ fontSize:9, color:'#ffffff22', marginTop:2 }}>{sub}</div>
    </div>
  );
}

// ─── SCENE ──────────────────────────────────────────────────
function Scene({ children, opacity=1, bg=C.obsidian }){
  return (
    <div style={{ position:'absolute', inset:0, opacity, background:bg }}>
      {children}
    </div>
  );
}

// ─── TITRE ANIMÉ ────────────────────────────────────────────
function Titre({ text, frame, startFrame, size=36, color=C.warm, bold=true, italic=false, font="'Barlow Condensed',sans-serif", tracking=0 }){
  const op = cl(lerp(frame,0,1,startFrame,startFrame+12));
  const y  = lerp(frame,20,0,startFrame,startFrame+14);
  const sc = .8+sp(Math.max(0,frame-startFrame),0,.14)*.2;
  return (
    <div style={{ opacity:op, transform:`translateY(${y}px) scale(${sc})`, transformOrigin:'left bottom', fontFamily:font, fontWeight:bold?800:400, fontStyle:italic?'italic':'normal', fontSize:size, color, letterSpacing:tracking, lineHeight:1.1 }}>
      {text}
    </div>
  );
}

// ═══════════════════════════
// SCÈNE 1 — CHAOS [0–90f]
// ═══════════════════════════
function Scene1({ frame }){
  const op = cl(lerp(frame,0,1,0,8)*lerp(frame,1,0,78,90));
  const flashOp = cl(lerp(frame,0,1,4,7)*lerp(frame,1,0,7,12));

  const notifs = [
    { txt:"📲 Nouveau client", x:'12%', y:'18%', d:10 },
    { txt:"📋 Contrat à signer", x:'52%', y:'28%', d:22 },
    { txt:"🔑 Restitution 18h", x:'8%',  y:'52%', d:34 },
    { txt:"💸 Paiement en attente", x:'44%', y:'62%', d:46 },
    { txt:"📸 État des lieux ?", x:'18%', y:'76%', d:58 },
    { txt:"🚗 Km à relever", x:'55%', y:'80%', d:66 },
  ];

  return (
    <Scene opacity={op} bg="#050505">
      {/* Flash rouge — chaos */}
      <div style={{ position:'absolute', inset:0, background:C.red, opacity:flashOp*0.15, pointerEvents:'none' }}/>

      {/* Titre choc */}
      <div style={{ position:'absolute', top:'10%', left:'8%', right:'8%' }}>
        <Titre text="22H/SEMAINE" frame={frame} startFrame={8} size={88} color={C.red} tracking={-2}/>
        <Titre text="perdues à gérer ta flotte." frame={frame} startFrame={20} size={16} color="#ffffff44" bold={false} tracking={2}/>
      </div>

      {/* Notifications qui apparaissent */}
      {notifs.map((n,i)=>{
        const nop = cl(lerp(frame,0,1,n.d,n.d+10)*lerp(frame,1,0,n.d+20,n.d+30));
        const nx  = lerp(frame,-20,0,n.d,n.d+10);
        return (
          <div key={i} style={{
            position:'absolute', left:n.x, top:n.y,
            opacity:nop, transform:`translateX(${nx}px)`,
            background:'#1a1a1a', border:'1px solid #ffffff11',
            borderRadius:8, padding:'5px 10px',
            fontSize:10, color:'#ffffff55', whiteSpace:'nowrap',
          }}>{n.txt}</div>
        );
      })}

      {/* Question bas */}
      <div style={{
        position:'absolute', bottom:'8%', right:'8%',
        opacity:cl(lerp(frame,0,1,65,78)),
        fontFamily:"'DM Serif Display',serif", fontStyle:'italic',
        fontSize:20, color:'#ffffff33',
      }}>Et si tu arrêtais ?</div>
    </Scene>
  );
}

// ═══════════════════════════
// SCÈNE 2 — SOLUTION [90–225f]
// Dashboard Loqar en action
// ═══════════════════════════
function Scene2({ frame }){
  const op = cl(lerp(frame,0,1,0,14)*lerp(frame,1,0,128,142));

  // Light leak doré
  const llOp = cl(lerp(frame,0,0.2,0,20)*lerp(frame,0.2,0,100,120));

  return (
    <Scene opacity={op} bg={C.charcoal}>
      {/* Light leak */}
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 80% 10%, ${C.gold} 0%, transparent 55%)`, opacity:llOp, mixBlendMode:'screen', pointerEvents:'none' }}/>

      {/* Label */}
      <div style={{ position:'absolute', top:'7%', left:'8%' }}>
        <Titre text="AVEC LOQAR" frame={frame} startFrame={8} size={11} color={C.gold} bold={false} tracking={5}/>
      </div>

      {/* Tagline principale */}
      <div style={{ position:'absolute', top:'14%', left:'8%', right:'8%' }}>
        <Titre text="Tout automatique." frame={frame} startFrame={16} size={42} color={C.warm}/>
        <Titre text="Zéro papier. Zéro stress." frame={frame} startFrame={30} size={42} color={C.warm}/>
      </div>

      {/* Mockup téléphone */}
      <div style={{ position:'absolute', top:'42%', left:'50%', transform:'translateX(-50%)' }}>
        <PhoneMockup frame={frame} startFrame={38}/>
      </div>

      {/* Cards dashboard */}
      <div style={{ position:'absolute', bottom:'14%', left:'8%', right:'8%', display:'flex', gap:8 }}>
        <DashCard label="Contrats" value={47} sub="ce mois" frame={frame} startFrame={72} color={C.gold}/>
        <DashCard label="CA" value={8400} sub="€ / mois" frame={frame} startFrame={86} color="#7EB8F7"/>
        <DashCard label="Temps gagné" value={22} sub="h / sem" frame={frame} startFrame={100} color="#4CAF50"/>
      </div>
    </Scene>
  );
}

// ═══════════════════════════
// SCÈNE 3 — ASPIRATION [225–330f]
// Ta vie après
// ═══════════════════════════
function Scene3({ frame }){
  const op = cl(lerp(frame,0,1,0,14)*lerp(frame,1,0,106,120));
  const sunPulse = .96+Math.sin(frame*.06)*.04;

  const libertes = [
    { icon:"☀️", txt:"Ton dimanche = le tien.", d:18 },
    { icon:"✈️", txt:"Paiements même en vacances.", d:38 },
    { icon:"📈", txt:"+34% de CA en 3 mois.", d:58 },
  ];

  return (
    <Scene opacity={op} bg={C.obsidian}>
      {/* Gradient chaud */}
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% 0%, ${C.gold}18 0%, transparent 60%)`, pointerEvents:'none' }}/>

      {/* Soleil */}
      <div style={{
        position:'absolute', top:'5%', left:'50%', transform:`translateX(-50%) scale(${sunPulse})`,
        width:70, height:70, borderRadius:'50%',
        background:`radial-gradient(circle, ${C.gold}66 0%, ${C.gold}22 50%, transparent 70%)`,
        opacity:cl(lerp(frame,0,1,5,22)),
      }}/>

      {/* Titre */}
      <div style={{ position:'absolute', top:'20%', left:'8%', right:'8%', textAlign:'center' }}>
        <Titre text="Ta vie avec Loqar." frame={frame} startFrame={10} size={36} color={C.gold} tracking={1}/>
      </div>

      {/* 3 moments */}
      <div style={{ position:'absolute', top:'38%', left:'8%', right:'8%', display:'flex', flexDirection:'column', gap:12 }}>
        {libertes.map((l,i)=>{
          const lop = cl(lerp(frame,0,1,l.d,l.d+14));
          const lx  = lerp(frame,-24,0,l.d,l.d+14);
          return (
            <div key={i} style={{
              opacity:lop, transform:`translateX(${lx}px)`,
              display:'flex', alignItems:'center', gap:14,
              background:'#ffffff06', border:`1px solid ${C.gold}22`,
              borderRadius:12, padding:'12px 16px',
            }}>
              <span style={{ fontSize:22 }}>{l.icon}</span>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:C.warm, letterSpacing:.5 }}>{l.txt}</span>
            </div>
          );
        })}
      </div>

      {/* Chiffre bas */}
      <div style={{ position:'absolute', bottom:'8%', right:'8%', textAlign:'right', opacity:cl(lerp(frame,0,1,82,96)) }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:56, color:C.gold, lineHeight:1 }}>
          {Math.round(lerp(frame, 0, 34, 84, 108))}%
        </div>
        <div style={{ fontSize:10, color:'#ffffff33', letterSpacing:2 }}>de CA supplémentaire</div>
      </div>
    </Scene>
  );
}

// ═══════════════════════════
// SCÈNE 4 — CTA [330–450f]
// ═══════════════════════════
function Scene4({ frame }){
  const op = cl(lerp(frame,0,1,0,16));
  const pulse = .96+Math.sin(frame*.1)*.04;
  const ctaOp = cl(lerp(frame,0,1,48,64));
  const ctaSc = .88+sp(Math.max(0,frame-48),0,.12)*.12;

  const rings = [300, 190, 110];

  return (
    <Scene opacity={op} bg={C.obsidian}>
      {/* Light leak */}
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 60% 15%, ${C.gold}20 0%, transparent 50%)`, mixBlendMode:'screen', opacity:cl(lerp(frame,0,1,0,25)*lerp(frame,1,0,70,85)), pointerEvents:'none' }}/>

      {/* Rings */}
      {rings.map((r,i)=>(
        <div key={i} style={{
          position:'absolute', top:'50%', left:'50%',
          width:r, height:r, borderRadius:'50%',
          border:`1px solid ${C.gold}${['18','0e','07'][i]}`,
          transform:`translate(-50%,-50%) scale(${1+frame*.0004*(i+1)})`,
          opacity:cl(lerp(frame,0,1,6+i*8,20+i*8)),
        }}/>
      ))}

      {/* Logo */}
      <div style={{
        position:'absolute', top:'26%', left:'50%', transform:'translateX(-50%)',
        opacity:cl(lerp(frame,0,1,10,26)),
        display:'flex', alignItems:'flex-end', whiteSpace:'nowrap',
      }}>
        {['LO','Q','AR'].map((l,i)=>(
          <span key={i} style={{
            fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:82,
            color: i===1 ? C.gold : C.warm,
            letterSpacing: i===1?0:3,
            display:'inline-block',
            transform: i===1?`scale(${pulse})`:'none',
            transformOrigin:'center bottom',
          }}>{l}</span>
        ))}
      </div>

      {/* Tagline */}
      <div style={{
        position:'absolute', top:'52%', left:'50%', transform:'translateX(-50%)',
        opacity:cl(lerp(frame,0,1,24,38)), whiteSpace:'nowrap',
        fontFamily:"'DM Serif Display',serif", fontStyle:'italic',
        fontSize:17, color:'#ffffff44', textAlign:'center',
      }}>Gérez moins. Louez plus.</div>

      {/* URL */}
      <div style={{
        position:'absolute', top:'60%', left:'50%', transform:'translateX(-50%)',
        opacity:cl(lerp(frame,0,1,32,46)), whiteSpace:'nowrap',
        fontFamily:"'Barlow Condensed',sans-serif", fontSize:14,
        color:C.gold, letterSpacing:8,
      }}>LOQAR.FR</div>

      {/* Social proof */}
      <div style={{
        position:'absolute', top:'68%', left:'50%', transform:'translateX(-50%)',
        display:'flex', gap:16, whiteSpace:'nowrap',
        opacity:cl(lerp(frame,0,1,38,52)),
      }}>
        {['120+ loueurs','0 contrat perdu','30j offerts'].map((b,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:3, height:3, borderRadius:'50%', background:C.gold }}/>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:10, color:'#ffffff33', letterSpacing:.5 }}>{b}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        position:'absolute', bottom:'6%', left:'8%', right:'8%',
        opacity:ctaOp, transform:`scale(${ctaSc})`, transformOrigin:'bottom center',
      }}>
        <div style={{ background:C.gold, borderRadius:14, padding:'15px 0', textAlign:'center', marginBottom:8 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:21, color:C.obsidian, letterSpacing:2, textTransform:'uppercase' }}>
            Commencer gratuitement
          </div>
        </div>
        <div style={{ textAlign:'center', fontSize:10, color:'#ffffff22', letterSpacing:1.5, opacity:cl(lerp(frame,0,1,66,78)) }}>
          Aucune carte requise · Sans engagement
        </div>
      </div>
    </Scene>
  );
}

// ═══════════════════════════
// APP PLAYER
// ═══════════════════════════
export default function App(){
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(()=>{
    if(playing){
      const tick=(t)=>{
        if(lastRef.current!==null){
          const d=t-lastRef.current;
          setFrame(f=>{ const n=f+(d/1000)*FPS; if(n>=TOTAL){setPlaying(false);return TOTAL-1;} return n; });
        }
        lastRef.current=t;
        rafRef.current=requestAnimationFrame(tick);
      };
      rafRef.current=requestAnimationFrame(tick);
    } else {
      lastRef.current=null;
      if(rafRef.current)cancelAnimationFrame(rafRef.current);
    }
    return ()=>{ if(rafRef.current)cancelAnimationFrame(rafRef.current); };
  },[playing]);

  const f = Math.floor(frame);
  const pct = frame/TOTAL;

  const scenes = [
    { label:'CHAOS',      color:C.red,       start:0   },
    { label:'SOLUTION',   color:'#ff8c42',   start:90  },
    { label:'ASPIRATION', color:'#7EB8F7',   start:225 },
    { label:'CTA',        color:'#4CAF50',   start:330 },
  ];
  const active = scenes.reduce((a,b)=>f>=b.start?b:a, scenes[0]);

  return (
    <div style={{ minHeight:'100vh', background:'#060606', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px', fontFamily:"'Outfit',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;700;800&family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{ marginBottom:12, textAlign:'center' }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:C.gold, letterSpacing:4 }}>LOQAR · PUB 15S · V3</div>
        <div style={{ fontSize:10, color:'#ffffff22', letterSpacing:3, textTransform:'uppercase', marginTop:3 }}>Chaos → Solution → Aspiration → CTA</div>
      </div>

      {/* Badge acte actif */}
      <div style={{ marginBottom:12, background:`${active.color}18`, border:`1px solid ${active.color}44`, borderRadius:100, padding:'4px 18px', fontSize:11, color:active.color, letterSpacing:2, textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif" }}>
        {active.label}
      </div>

      {/* Player 9:16 */}
      <div style={{ width:290, height:515, borderRadius:22, overflow:'hidden', position:'relative', border:`1px solid ${C.gold}22`, boxShadow:`0 0 80px ${C.gold}10` }}>
        {f < 98  && <Scene1 frame={f}/>}
        {f >= 82 && f < 232 && <Scene2 frame={Math.max(0,f-90)}/>}
        {f >= 215 && f < 338 && <Scene3 frame={Math.max(0,f-225)}/>}
        {f >= 322 && <Scene4 frame={Math.max(0,f-330)}/>}

        {/* HUD */}
        <div style={{ position:'absolute', top:10, left:10, background:'#00000080', backdropFilter:'blur(6px)', borderRadius:5, padding:'2px 8px', fontSize:9, color:active.color, letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif", textTransform:'uppercase' }}>{active.label}</div>
        <div style={{ position:'absolute', top:10, right:10, background:'#00000070', borderRadius:5, padding:'2px 8px', fontSize:9, color:'#ffffff44', fontFamily:'monospace' }}>{(f/FPS).toFixed(1)}s</div>
      </div>

      {/* Contrôles */}
      <div style={{ marginTop:16, width:290 }}>
        {/* Progress bar segmentée */}
        <div style={{ position:'relative', height:6, background:'#ffffff08', borderRadius:4, marginBottom:14, cursor:'pointer' }}
          onClick={e=>{ const r=e.currentTarget.getBoundingClientRect(); setFrame(((e.clientX-r.left)/r.width)*TOTAL); }}>
          {scenes.map((s,i)=>{
            const next = scenes[i+1]?.start ?? TOTAL;
            return <div key={i} style={{ position:'absolute', top:0, bottom:0, left:`${(s.start/TOTAL)*100}%`, width:`${((next-s.start)/TOTAL)*100}%`, background:f>=s.start&&f<next?`${s.color}aa`:`${s.color}22`, borderRight:'1px solid #00000033', borderRadius:i===0?'4px 0 0 4px':i===scenes.length-1?'0 4px 4px 0':'0' }}/>;
          })}
          <div style={{ position:'absolute', top:'50%', width:10, height:10, borderRadius:'50%', background:C.gold, transform:'translate(-50%,-50%)', left:`${pct*100}%`, boxShadow:`0 0 6px ${C.gold}` }}/>
        </div>

        {/* Boutons */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:10 }}>
          <button onClick={()=>{setFrame(0);setPlaying(false);}} style={{ background:'transparent', border:'1px solid #ffffff12', borderRadius:8, padding:'8px 12px', color:'#ffffff44', cursor:'pointer', fontSize:14 }}>↺</button>
          <button onClick={()=>setPlaying(p=>!p)} style={{ background:playing?'#ffffff0e':C.gold, border:'none', borderRadius:8, padding:'8px 44px', color:playing?C.warm:C.obsidian, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:16, letterSpacing:2 }}>
            {playing?'⏸ PAUSE':'▶ PLAY'}
          </button>
          <button onClick={()=>setFrame(f=>Math.min(TOTAL-1,f+30))} style={{ background:'transparent', border:'1px solid #ffffff12', borderRadius:8, padding:'8px 12px', color:'#ffffff44', cursor:'pointer', fontSize:12 }}>+1s</button>
        </div>

        {/* Scene jumper */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4 }}>
          {scenes.map((s,i)=>(
            <button key={i} onClick={()=>{setFrame(s.start);setPlaying(false);}}
              style={{ background:active.label===s.label?`${s.color}1a`:'transparent', border:`1px solid ${active.label===s.label?s.color+'55':'#ffffff0e'}`, borderRadius:7, padding:'7px 2px', color:active.label===s.label?s.color:'#ffffff28', cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, letterSpacing:.5, textTransform:'uppercase' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
