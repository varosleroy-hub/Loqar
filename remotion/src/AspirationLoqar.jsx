import { AbsoluteFill, useCurrentFrame, Audio } from 'remotion';
import { staticFile } from 'remotion';

const C = {
  obsidian: '#080807',
  gold: '#C9A84C',
  warmWhite: '#F2EDE4',
  red: '#D93B2B',
  charcoal: '#1A1A18',
};

function lerp(frame, from, to, a, b) {
  if (frame <= a) return from;
  if (frame >= b) return to;
  const t = (frame - a) / (b - a);
  const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
  return from + (to - from) * e;
}
function clamp(v) { return Math.max(0, Math.min(1, v)); }
function sp(frame, delay = 0, k = 0.11) {
  const f = Math.max(0, frame - delay);
  return clamp(1 - Math.exp(-k * f) * Math.cos(0.2 * f));
}

// ── ACT 1: HOOK [0–67f] ───────────────────────────────────
function Act1({ frame }) {
  const op = clamp(lerp(frame,0,1,0,12) * lerp(frame,1,0,52,67));
  const words1 = ["T'as", "déjà", "eu"];
  const words2 = ["un", "dimanche..."];

  return (
    <AbsoluteFill style={{ background:'#050504', opacity:op }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 20% 20%, #0a1020 0%, transparent 60%)' }} />

      <div style={{ position:'absolute', top:'14%', left:'8%', right:'8%' }}>
        <div style={{ display:'flex', gap:14, marginBottom:6 }}>
          {words1.map((w,i) => (
            <span key={i} style={{
              fontFamily:'Arial Black, sans-serif', fontWeight:900,
              fontSize:80, color:C.warmWhite,
              opacity: clamp(lerp(frame,0,1,8+i*7,18+i*7)),
              transform:`translateY(${lerp(frame,24,0,8+i*7,18+i*7)}px)`,
              display:'inline-block',
            }}>{w}</span>
          ))}
        </div>
        <div style={{ display:'flex', gap:14 }}>
          {words2.map((w,i) => (
            <span key={i} style={{
              fontFamily:'Arial Black, sans-serif', fontWeight:900,
              fontSize:80,
              color: i===1 ? C.gold : C.warmWhite,
              opacity: clamp(lerp(frame,0,1,22+i*8,32+i*8)),
              transform:`translateY(${lerp(frame,24,0,22+i*8,32+i*8)}px)`,
              display:'inline-block',
            }}>{w}</span>
          ))}
        </div>
      </div>

      <div style={{
        position:'absolute', top:'18%', right:'8%',
        fontFamily:'Arial, sans-serif', fontSize:20,
        color:'#ffffff22', letterSpacing:3, textTransform:'uppercase',
        opacity: clamp(lerp(frame,0,1,30,45)),
        textAlign:'right',
      }}>sans penser<br/>à ta flotte ?</div>

      <div style={{
        position:'absolute', top:'42%', left:'50%',
        transform:'translateX(-50%)',
        fontSize:110,
        opacity: clamp(lerp(frame,0,0.6,20,50)),
        filter:'grayscale(80%) brightness(0.4)',
      }}>📱</div>

      <div style={{
        position:'absolute', bottom:'16%', right:'8%',
        fontFamily:'Georgia, serif', fontStyle:'italic',
        fontSize:24, color:'#ffffff22',
        opacity: clamp(lerp(frame,0,1,42,58)),
      }}>continue...</div>
    </AbsoluteFill>
  );
}

// ── ACT 2: 3 QUESTIONS [67–180f] ──────────────────────────
function Act2({ frame }) {
  const op = clamp(lerp(frame,0,1,0,15) * lerp(frame,1,0,98,113));
  const questions = [
    { q:"Et si ton téléphone sonnait...", a:"sans que tu aies rien fait ?", delay:0 },
    { q:"Et si +850€ rentraient...", a:"pendant ton dîner ?", delay:30 },
    { q:"Et si ta flotte tournait...", a:"même quand tu dors ?", delay:60 },
  ];

  return (
    <AbsoluteFill style={{ background:C.charcoal, opacity:op }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 50%, #C9A84C06 0%, transparent 70%)' }} />
      <div style={{ position:'absolute', top:'12%', left:'8%', right:'8%', display:'flex', flexDirection:'column', gap:40 }}>
        {questions.map((q, i) => {
          const lineOp = clamp(lerp(frame, 0, 1, q.delay+5, q.delay+20));
          const lineY = lerp(frame, 28, 0, q.delay+5, q.delay+20);
          return (
            <div key={i} style={{ opacity:lineOp, transform:`translateY(${lineY}px)`, paddingLeft:i*28 }}>
              <div style={{ fontFamily:'Georgia, serif', fontStyle:'italic', fontSize:32, color:'#ffffff55', lineHeight:1.2, marginBottom:6 }}>{q.q}</div>
              <div style={{ fontFamily:'Arial Black, sans-serif', fontWeight:900, fontSize:48, color:C.gold, letterSpacing:1 }}>{q.a}</div>
              <div style={{ height:1, background:`linear-gradient(90deg,${C.gold}66,transparent)`, width:`${sp(frame, q.delay+18)*60}%`, marginTop:8 }} />
            </div>
          );
        })}
      </div>
      <div style={{ position:'absolute', bottom:'10%', right:'8%', textAlign:'right', opacity: clamp(lerp(frame,0,1,85,100)) }}>
        <div style={{ fontFamily:'Arial, sans-serif', fontWeight:700, fontSize:18, color:'#ffffff22', letterSpacing:4, textTransform:'uppercase' }}>C'est possible.</div>
      </div>
    </AbsoluteFill>
  );
}

// ── ACT 3: LOQAR RÉVÉLATION [180–255f] ────────────────────
function Act3({ frame }) {
  const op = clamp(lerp(frame,0,1,0,12) * lerp(frame,1,0,68,80));
  const pulse = 0.96 + Math.sin(frame*0.1)*0.04;
  const flash = clamp(lerp(frame,0,1,0,4) * lerp(frame,1,0,4,12));

  return (
    <AbsoluteFill style={{ background:C.obsidian, opacity:op }}>
      <div style={{ position:'absolute', inset:0, background:'#fff', opacity:flash*0.12 }} />
      <div style={{ position:'absolute', top:0, left:'30%', width:1, height:`${sp(frame,8,0.13)*50}%`, background:`linear-gradient(180deg,${C.gold},transparent)`, opacity:0.7 }} />
      <div style={{ position:'absolute', top:0, left:'55%', width:1, height:`${sp(frame,14,0.11)*40}%`, background:`linear-gradient(180deg,${C.gold}66,transparent)`, opacity:0.4 }} />

      <div style={{
        position:'absolute', top:'24%', left:'8%',
        transform:`scale(${sp(frame,10,0.09)})`, transformOrigin:'left center',
        opacity: clamp(lerp(frame,0,1,8,24)),
      }}>
        <div style={{ fontFamily:'Arial Black, sans-serif', fontWeight:900, fontSize:110, lineHeight:1, letterSpacing:4, display:'flex', alignItems:'flex-end' }}>
          <span style={{ color:C.warmWhite }}>LO</span>
          <span style={{ color:C.gold, display:'inline-block', transform:`scale(${pulse})`, transformOrigin:'center bottom' }}>Q</span>
          <span style={{ color:C.warmWhite }}>AR</span>
        </div>
        <div style={{ fontFamily:'Arial, sans-serif', fontWeight:300, fontSize:18, color:'#ffffff33', letterSpacing:4, textTransform:'uppercase', marginTop:6, opacity: clamp(lerp(frame,0,1,24,38)) }}>La réponse à tes questions.</div>
      </div>

      <div style={{ position:'absolute', bottom:'18%', right:'8%', textAlign:'right', opacity: clamp(lerp(frame,0,1,40,58)), transform:`translateX(${lerp(frame,20,0,40,58)}px)` }}>
        <div style={{ fontFamily:'Georgia, serif', fontStyle:'italic', fontSize:34, color:C.warmWhite, lineHeight:1.3 }}>
          Gérez moins.<br/><span style={{ color:C.gold }}>Louez plus.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── ACT 4: TA VIE [255–345f] ──────────────────────────────
function Act4({ frame }) {
  const op = clamp(lerp(frame,0,1,0,15) * lerp(frame,1,0,75,90));
  const sunPulse = 0.97 + Math.sin(frame*0.06)*0.03;
  const moments = [
    { icon:'🌅', text:'Dimanche matin', sub:'Business: actif', delay:18 },
    { icon:'🏖️', text:'Vacances — 5 jours', sub:'+4 200€ encaissés', delay:38 },
    { icon:'🍽️', text:'Dîner en famille', sub:'Contrat signé auto', delay:58 },
  ];

  return (
    <AbsoluteFill style={{ opacity:op, overflow:'hidden' }}>
      <AbsoluteFill style={{ background:`radial-gradient(ellipse at 40% 25%, #C9A84C1a 0%, ${C.obsidian} 62%)` }} />
      <div style={{ position:'absolute', top:'6%', left:'8%', width:140, height:140, borderRadius:'50%', background:`radial-gradient(circle,${C.gold}66 0%,${C.gold}18 50%,transparent 70%)`, transform:`scale(${sunPulse})`, opacity: clamp(lerp(frame,0,1,8,25)) }} />
      <div style={{ position:'absolute', top:'8%', left:'36%', right:'6%', opacity: clamp(lerp(frame,0,1,12,28)), transform:`translateY(${lerp(frame,16,0,12,28)}px)` }}>
        <div style={{ fontFamily:'Arial Black, sans-serif', fontWeight:900, fontSize:46, color:C.warmWhite, lineHeight:1.1 }}>
          C'EST TA VIE<br/><span style={{ color:C.gold }}>AVEC LOQAR.</span>
        </div>
      </div>
      <div style={{ position:'absolute', top:'32%', left:'8%', right:'8%', display:'flex', flexDirection:'column', gap:16 }}>
        {moments.map((m,i) => (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:18,
            background:'#1A1A1888', border:`1px solid ${C.gold}${i===1?'55':'22'}`,
            borderRadius:16, padding:'16px 20px',
            opacity: clamp(lerp(frame,0,1,m.delay,m.delay+18)),
            transform:`translateX(${lerp(frame,-24,0,m.delay,m.delay+18)}px)`,
          }}>
            <span style={{ fontSize:36, flexShrink:0 }}>{m.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'Arial Black, sans-serif', fontWeight:900, fontSize:24, color:C.warmWhite, letterSpacing:1 }}>{m.text}</div>
              <div style={{ fontFamily:'Arial, sans-serif', fontSize:16, color: i===1 ? '#4CAF50' : C.gold }}>{m.sub}</div>
            </div>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#4CAF50', boxShadow:'0 0 10px #4CAF5088', flexShrink:0 }} />
          </div>
        ))}
      </div>
      <div style={{ position:'absolute', bottom:'8%', right:'8%', textAlign:'right', opacity: clamp(lerp(frame,0,1,72,86)) }}>
        <div style={{ fontFamily:'Georgia, serif', fontStyle:'italic', fontSize:28, color:'#ffffff44' }}>Et toi, t'attends quoi ?</div>
      </div>
    </AbsoluteFill>
  );
}

// ── ACT 5+6: PREUVE + CTA [345–450f] ─────────────────────
function Act56({ frame }) {
  const op = clamp(lerp(frame,0,1,0,18));
  const logoScale = sp(frame, 10, 0.1);
  const pulseQ = 0.94 + Math.sin(frame*0.09)*0.06;
  const counterVal = Math.floor(lerp(frame, 0, 34, 20, 75));

  return (
    <AbsoluteFill style={{ background:C.obsidian, opacity:op }}>
      {[1, 0.65, 0.35].map((s,i) => (
        <div key={i} style={{
          position:'absolute', top:'50%', left:'50%',
          width:480*s, height:480*s, borderRadius:'50%',
          border:`1px solid ${C.gold}${['18','0f','08'][i]}`,
          transform:`translate(-50%,-50%) scale(${1+frame*0.0003*(i+1)})`,
          opacity: clamp(lerp(frame,0,1,5+i*8,20+i*8)),
        }} />
      ))}

      <div style={{ position:'absolute', top:'10%', left:'8%', opacity: clamp(lerp(frame,0,1,12,28)) }}>
        <div style={{ fontFamily:'Arial, sans-serif', fontWeight:700, fontSize:18, color:'#ffffff22', letterSpacing:4, textTransform:'uppercase', marginBottom:6 }}>Résultat moyen / 3 mois</div>
        <div style={{ fontFamily:'Arial Black, sans-serif', fontWeight:900, fontSize:100, color:C.gold, lineHeight:1 }}>+{counterVal}%</div>
        <div style={{ fontFamily:'Arial, sans-serif', fontSize:18, color:'#ffffff44', marginTop:4 }}>de chiffre d'affaires</div>
      </div>

      <div style={{ position:'absolute', top:'12%', right:'8%', textAlign:'right', opacity: clamp(lerp(frame,0,1,22,38)) }}>
        <div style={{ fontFamily:'Arial Black, sans-serif', fontWeight:900, fontSize:36, color:C.warmWhite }}>120+</div>
        <div style={{ fontFamily:'Arial, sans-serif', fontSize:16, color:'#ffffff33', letterSpacing:2 }}>loueurs<br/>en France</div>
      </div>

      <div style={{ position:'absolute', top:'42%', left:'50%', transform:`translateX(-50%) scale(${logoScale})`, opacity: clamp(lerp(frame,0,1,18,36)), display:'flex', alignItems:'flex-end', whiteSpace:'nowrap' }}>
        <span style={{ fontFamily:'Arial Black, sans-serif', fontWeight:900, fontSize:96, color:C.warmWhite, letterSpacing:4 }}>LO</span>
        <span style={{ fontFamily:'Arial Black, sans-serif', fontWeight:900, fontSize:96, color:C.gold, display:'inline-block', transform:`scale(${pulseQ})`, transformOrigin:'center bottom' }}>Q</span>
        <span style={{ fontFamily:'Arial Black, sans-serif', fontWeight:900, fontSize:96, color:C.warmWhite, letterSpacing:4 }}>AR</span>
      </div>

      <div style={{ position:'absolute', top:'58%', left:'50%', transform:'translateX(-50%)', fontFamily:'Arial, sans-serif', fontWeight:400, fontSize:26, color:C.gold, letterSpacing:8, opacity: clamp(lerp(frame,0,1,36,52)), whiteSpace:'nowrap' }}>LOQAR.FR</div>

      <div style={{ position:'absolute', bottom:'6%', left:'8%', right:'8%', opacity: clamp(lerp(frame,0,1,55,72)), transform:`scale(${lerp(frame,0.88,1,55,72)})` }}>
        <div style={{ background:C.gold, borderRadius:16, padding:'20px 0', textAlign:'center' }}>
          <div style={{ fontFamily:'Arial Black, sans-serif', fontWeight:900, fontSize:28, color:C.obsidian, letterSpacing:2, textTransform:'uppercase' }}>Commencer gratuitement</div>
        </div>
        <div style={{ textAlign:'center', marginTop:10, fontFamily:'Arial, sans-serif', fontSize:16, color:'#ffffff33', letterSpacing:2, opacity: clamp(lerp(frame,0,1,68,80)) }}>
          Aucune carte requise · Sans engagement
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── COMPOSITION REMOTION ──────────────────────────────────
export const AspirationLoqar = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: C.obsidian }}>
      <Audio src={staticFile('mixkit-rising-forest-471.mp3')} startFrom={0} volume={0.2} />

      {frame < 75   && <Act1  frame={frame} />}
      {frame >= 60  && frame < 188 && <Act2  frame={frame - 67} />}
      {frame >= 172 && frame < 263 && <Act3  frame={frame - 180} />}
      {frame >= 248 && frame < 355 && <Act4  frame={frame - 255} />}
      {frame >= 340 && <Act56 frame={frame - 345} />}
    </AbsoluteFill>
  );
};
