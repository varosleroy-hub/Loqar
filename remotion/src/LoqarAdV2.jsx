import { useCurrentFrame } from 'remotion';

const C = { obsidian:'#080807', gold:'#C9A84C', warm:'#F2EDE4', red:'#D93B2B', charcoal:'#1A1A18' };

function lerp(f,a,b,i,o){ if(f<=i)return a; if(f>=o)return b; const t=(f-i)/(o-i),e=t<.5?2*t*t:-1+(4-2*t)*t; return a+(b-a)*e; }
function cl(v){ return Math.max(0,Math.min(1,v)); }
function sp(f,delay=0,k=.11){ const d=Math.max(0,f-delay); return cl(1-Math.exp(-k*d)*Math.cos(.2*d)); }
function motionBlur(frame,cutFrame,radius=6,duration=6){ const dist=Math.abs(frame-cutFrame); if(dist>duration)return 0; return radius*(1-dist/duration); }

function LightLeak({ frame, startFrame, duration=18, intensity=0.18 }){
  const f=frame-startFrame;
  const op=f<0?0:f<duration/2?cl(lerp(f,0,intensity,0,duration/2)):cl(lerp(f,intensity,0,duration/2,duration));
  return <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:`radial-gradient(ellipse at 70% 20%, ${C.gold} 0%, transparent 60%)`, opacity:op, mixBlendMode:'screen' }}/>;
}

function WordByWord({ text, frame, startFrame, speed=5, style={}, goldWords=[] }){
  const words=text.split(' ');
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.22em', ...style }}>
      {words.map((word,i)=>{
        const wf=frame-startFrame-i*speed;
        const op=cl(lerp(frame,0,1,startFrame+i*speed,startFrame+i*speed+8));
        const y=lerp(frame,22,0,startFrame+i*speed,startFrame+i*speed+10);
        const sc=.7+sp(Math.max(0,wf),0,.18)*.3;
        const isGold=goldWords.includes(word.replace(/[.,!?]/g,''));
        return <span key={i} style={{ display:'inline-block', opacity:op, transform:`translateY(${y}px) scale(${sc})`, transformOrigin:'bottom center', color:isGold?C.gold:'inherit', transition:'none' }}>{word}</span>;
      })}
    </div>
  );
}

function SpringCounter({ frame, startFrame, from=0, to, suffix='', style={} }){
  const progress=sp(Math.max(0,frame-startFrame),0,.06);
  const val=Math.round(from+(to-from)*progress);
  return <span style={style}>{val}{suffix}</span>;
}

function AudioViz({ frame, bars=20, height=40, color=C.gold, opacity=0.5 }){
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:2, height, opacity }}>
      {Array.from({length:bars}).map((_,i)=>{
        const base=Math.sin(frame*.08+i*.4)*.5+.5;
        const mid=Math.sin(frame*.13+i*.7)*.3+.3;
        const peak=Math.sin(frame*.21+i*1.1)*.2+.1;
        const h=Math.max(4,(base+mid+peak)*height*.55);
        return <div key={i} style={{ width:3, height:h, background:color, borderRadius:2, alignSelf:'flex-end', opacity:.4+base*.6 }}/>;
      })}
    </div>
  );
}

function PriceAnchor({ frame, startFrame }){
  const lineOp1=cl(lerp(frame,0,1,startFrame,startFrame+15));
  const lineOp2=cl(lerp(frame,0,1,startFrame+20,startFrame+35));
  const lineOp3=cl(lerp(frame,0,1,startFrame+42,startFrame+55));
  const hours=Math.round(lerp(frame,0,22,startFrame+5,startFrame+30));
  const cost=Math.round(lerp(frame,0,550,startFrame+22,startFrame+48));
  return (
    <div style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>
      <div style={{ opacity:lineOp1, display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span style={{ fontSize:26, color:'#ffffff33', letterSpacing:3, textTransform:'uppercase' }}>Gestion sans Loqar</span>
      </div>
      <div style={{ opacity:lineOp2, display:'flex', alignItems:'center', gap:24, marginBottom:16 }}>
        <span style={{ fontSize:104, fontWeight:800, color:C.red, lineHeight:1 }}>{hours}h</span>
        <span style={{ fontSize:44, color:'#ffffff33' }}>×</span>
        <span style={{ fontSize:64, fontWeight:700, color:'#ffffff55' }}>25€/h</span>
        <span style={{ fontSize:44, color:'#ffffff33' }}>=</span>
        <div style={{ textAlign:'right' }}>
          <span style={{ fontSize:104, fontWeight:800, color:C.red, lineHeight:1 }}>{cost}€</span>
          <div style={{ fontSize:24, color:'#ffffff33', letterSpacing:2 }}>/ mois perdus</div>
        </div>
      </div>
      <div style={{ opacity:lineOp3, display:'flex', alignItems:'center', gap:32, paddingTop:24, borderTop:`2px solid ${C.gold}33` }}>
        <span style={{ fontSize:26, color:C.gold, letterSpacing:3, textTransform:'uppercase' }}>Loqar</span>
        <span style={{ fontSize:88, fontWeight:800, color:C.gold, lineHeight:1 }}>49€</span>
        <span style={{ fontSize:36, color:'#ffffff44' }}>/mois</span>
        <div style={{ marginLeft:'auto', background:`${C.gold}22`, border:`1px solid ${C.gold}66`, borderRadius:16, padding:'12px 28px', fontSize:26, color:C.gold, fontWeight:700, letterSpacing:1 }}>-91%</div>
      </div>
    </div>
  );
}

function Scene({ children, blurAmount=0, opacity=1 }){
  return (
    <div style={{ position:'absolute', inset:0, opacity, filter:blurAmount>0?`blur(${blurAmount}px)`:'none', willChange:'filter,opacity' }}>
      {children}
    </div>
  );
}

function Act1({ frame }){
  const blur=motionBlur(frame,0,5,5)+motionBlur(frame,67,6,6);
  const op=cl(lerp(frame,0,1,0,6)*lerp(frame,1,0,58,67));
  const chiffreOp=cl(lerp(frame,0,1,8,16));
  const flashOp=cl(lerp(frame,0,1,6,9)*lerp(frame,1,0,9,14));
  return (
    <Scene blurAmount={blur} opacity={op}>
      <div style={{ position:'absolute', inset:0, background:'#030303' }}/>
      <div style={{ position:'absolute', inset:0, background:'#fff', opacity:flashOp, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', top:'12%', left:'8%', opacity:chiffreOp, transform:`scale(${.6+sp(frame,8,.15)*.4})`, transformOrigin:'left top' }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:200, color:C.red, lineHeight:.9, letterSpacing:-4 }}>22H</div>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:32, color:'#ffffff44', letterSpacing:3, textTransform:'uppercase', marginTop:8 }}>perdues chaque semaine</div>
      </div>
      <div style={{ position:'absolute', top:'14%', right:'8%', textAlign:'right', opacity:cl(lerp(frame,0,1,22,36)) }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:24, color:'#ffffff22', letterSpacing:2, textTransform:'uppercase' }}>à gérer<br/>tes papiers</div>
      </div>
      <div style={{ position:'absolute', top:'44%', left:'8%', right:'8%', opacity:cl(lerp(frame,0,1,30,46)), transform:`translateY(${lerp(frame,20,0,30,46)}px)` }}>
        <WordByWord text="C'est le prix que tu paies." frame={frame} startFrame={30} speed={4} style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:64, color:C.warm }} goldWords={['prix']}/>
      </div>
      <div style={{ position:'absolute', bottom:'10%', right:'8%', fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, color:'#ffffff22', letterSpacing:4, textTransform:'uppercase', opacity:cl(lerp(frame,0,1,50,62)) }}>Et si c'était 0 ?</div>
      <div style={{ position:'absolute', bottom:'20%', left:'8%', opacity:cl(lerp(frame,0,0.6,25,45)) }}>
        <AudioViz frame={frame} bars={16} height={60} color={C.red} opacity={0.4}/>
      </div>
    </Scene>
  );
}

function Act2({ frame }){
  const blur=motionBlur(frame,0,6,6)+motionBlur(frame,113,5,5);
  const op=cl(lerp(frame,0,1,0,14)*lerp(frame,1,0,98,113));
  return (
    <Scene blurAmount={blur} opacity={op}>
      <div style={{ position:'absolute', inset:0, background:C.charcoal }}/>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 20% 80%, #D93B2B08 0%, transparent 50%)' }}/>
      <div style={{ position:'absolute', top:'8%', left:'8%', opacity:cl(lerp(frame,0,1,8,22)) }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:400, fontSize:22, color:C.gold, letterSpacing:5, textTransform:'uppercase', marginBottom:6 }}>La réalité</div>
      </div>
      <div style={{ position:'absolute', top:'18%', left:'8%', right:'8%' }}>
        <PriceAnchor frame={frame} startFrame={15}/>
      </div>
      <div style={{ position:'absolute', top:'10%', right:'8%', textAlign:'right', opacity:cl(lerp(frame,0,1,55,70)) }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:48, color:C.warm }}>120+</div>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, color:'#ffffff33', letterSpacing:2 }}>loueurs<br/>utilisent Loqar</div>
      </div>
      <div style={{ position:'absolute', bottom:'10%', left:'8%', right:'8%', opacity:cl(lerp(frame,0,1,75,90)), transform:`translateY(${lerp(frame,16,0,75,90)}px)` }}>
        <WordByWord text="Il existe une autre façon." frame={frame} startFrame={75} speed={5} style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:56, color:'#ffffff66' }} goldWords={['autre']}/>
      </div>
      <div style={{ position:'absolute', bottom:'22%', right:'8%', opacity:cl(lerp(frame,0,0.5,40,70)) }}>
        <AudioViz frame={frame} bars={12} height={48} color={C.gold} opacity={0.35}/>
      </div>
    </Scene>
  );
}

function Act3({ frame }){
  const blur=motionBlur(frame,0,7,7)+motionBlur(frame,75,5,5);
  const op=cl(lerp(frame,0,1,0,10)*lerp(frame,1,0,65,75));
  const logoScale=sp(frame,8,.09);
  const pulse=.96+Math.sin(frame*.09)*.04;
  return (
    <Scene blurAmount={blur} opacity={op}>
      <div style={{ position:'absolute', inset:0, background:C.obsidian }}/>
      <LightLeak frame={frame} startFrame={5} duration={30} intensity={.22}/>
      <LightLeak frame={frame} startFrame={50} duration={20} intensity={.12}/>
      {[{l:'28%',d:12},{l:'52%',d:18},{l:'68%',d:24}].map((r,i)=>(
        <div key={i} style={{ position:'absolute', top:0, left:r.l, width:2, height:`${sp(frame,r.d,.12)*55}%`, background:`linear-gradient(180deg,${C.gold},transparent)`, opacity:.5-.1*i }}/>
      ))}
      <div style={{ position:'absolute', top:'22%', left:'8%', transform:`scale(${logoScale})`, transformOrigin:'left center', opacity:cl(lerp(frame,0,1,6,22)) }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:192, lineHeight:1, letterSpacing:8, display:'flex', alignItems:'flex-end' }}>
          <span style={{ color:C.warm }}>LO</span>
          <span style={{ color:C.gold, display:'inline-block', transform:`scale(${pulse})`, transformOrigin:'center bottom' }}>Q</span>
          <span style={{ color:C.warm }}>AR</span>
        </div>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:300, fontSize:24, color:'#ffffff33', letterSpacing:5, textTransform:'uppercase', marginTop:8, opacity:cl(lerp(frame,0,1,22,38)) }}>La réponse.</div>
      </div>
      <div style={{ position:'absolute', top:'26%', right:'6%', textAlign:'right', opacity:cl(lerp(frame,0,1,30,48)), transform:`translateX(${lerp(frame,20,0,30,48)}px)` }}>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:44, color:'#ffffff55', lineHeight:1.4 }}>
          Gérez moins.<br/><span style={{ color:C.gold }}>Louez plus.</span>
        </div>
      </div>
      <div style={{ position:'absolute', bottom:'12%', right:'8%', opacity:cl(lerp(frame,0,1,52,65)) }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:36, color:C.warm, letterSpacing:1 }}>Et toi, t'attends quoi ?</div>
      </div>
      <div style={{ position:'absolute', bottom:'22%', left:'8%', opacity:cl(lerp(frame,0,0.7,15,35)*lerp(frame,0.7,0,55,70)) }}>
        <AudioViz frame={frame} bars={24} height={100} color={C.gold} opacity={0.6}/>
      </div>
    </Scene>
  );
}

function Act4({ frame }){
  const blur=motionBlur(frame,0,6,6)+motionBlur(frame,105,5,5);
  const op=cl(lerp(frame,0,1,0,14)*lerp(frame,1,0,92,105));
  const sunP=.97+Math.sin(frame*.05)*.03;
  const moments=[
    { q:"T'as déjà eu...", a:"un dimanche sans ta flotte ?", icon:"🌅", delay:12, stat:"2j récupérés/sem" },
    { q:"T'as déjà vu...", a:"+850€ rentrer pendant ton dîner ?", icon:"💳", delay:36, stat:"paiement auto" },
    { q:"T'as déjà dormi...", a:"sans penser au boulot ?", icon:"🌙", delay:60, stat:"0 stress" },
  ];
  return (
    <Scene blurAmount={blur} opacity={op}>
      <div style={{ position:'absolute', inset:0, background:C.obsidian }}/>
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 45% 30%, ${C.gold}14 0%, transparent 58%)` }}/>
      <LightLeak frame={frame} startFrame={0} duration={25} intensity={.14}/>
      <LightLeak frame={frame} startFrame={65} duration={20} intensity={.09}/>
      <div style={{ position:'absolute', top:'6%', left:'8%', width:180, height:180, borderRadius:'50%', background:`radial-gradient(circle,${C.gold}55 0%,${C.gold}18 55%,transparent 70%)`, transform:`scale(${sunP})`, opacity:cl(lerp(frame,0,1,5,22)) }}/>
      <div style={{ position:'absolute', top:'8%', left:'26%', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:26, color:C.gold, letterSpacing:5, textTransform:'uppercase', opacity:cl(lerp(frame,0,1,10,24)) }}>Ta vie avec Loqar.</div>
      <div style={{ position:'absolute', top:'26%', left:'8%', right:'8%', display:'flex', flexDirection:'column', gap:28 }}>
        {moments.map((m,i)=>{
          const mop=cl(lerp(frame,0,1,m.delay,m.delay+16));
          const mx=lerp(frame,-28,0,m.delay,m.delay+16);
          return (
            <div key={i} style={{ opacity:mop, transform:`translateX(${mx}px)`, display:'flex', alignItems:'center', gap:28, background:'#1A1A1888', border:`1px solid ${i===1?C.gold+'44':C.gold+'18'}`, borderRadius:28, padding:'24px 32px', paddingLeft:32+i*16 }}>
              <span style={{ fontSize:48, flexShrink:0 }}>{m.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontStyle:'italic', fontSize:30, color:'#ffffff55', marginBottom:4 }}>{m.q}</div>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:40, color:C.warm, letterSpacing:.5 }}>{m.a}</div>
              </div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, color:C.gold, letterSpacing:1, textAlign:'right', flexShrink:0 }}>{m.stat}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position:'absolute', bottom:'10%', right:'8%', textAlign:'right', opacity:cl(lerp(frame,0,1,78,92)) }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:400, fontSize:22, color:'#ffffff33', letterSpacing:3, textTransform:'uppercase' }}>Résultat moyen</div>
        <SpringCounter frame={frame} startFrame={78} from={0} to={34} suffix="%" style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:116, color:C.gold, lineHeight:1 }}/>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:24, color:'#ffffff33' }}>de CA en 3 mois</div>
      </div>
    </Scene>
  );
}

function Act56({ frame }){
  const blur=motionBlur(frame,0,7,7);
  const op=cl(lerp(frame,0,1,0,16));
  const logoSc=sp(frame,8,.09);
  const ctaSc=.85+sp(frame,52,.12)*.15;
  const pulseQ=.94+Math.sin(frame*.09)*.06;
  const ctaOp=cl(lerp(frame,0,1,52,68));
  const badges=[{ txt:'120+ loueurs', delay:30 },{ txt:'0 contrat perdu', delay:42 },{ txt:'Aucune carte requise', delay:54 }];
  return (
    <Scene blurAmount={blur} opacity={op}>
      <div style={{ position:'absolute', inset:0, background:C.obsidian }}/>
      <LightLeak frame={frame} startFrame={0} duration={22} intensity={.16}/>
      {[1,.62,.34].map((s,i)=>(
        <div key={i} style={{ position:'absolute', top:'50%', left:'50%', width:680*s, height:680*s, borderRadius:'50%', border:`1px solid ${C.gold}${['1a','10','08'][i]}`, transform:`translate(-50%,-50%) scale(${1+frame*.0003*(i+1)})`, opacity:cl(lerp(frame,0,1,4+i*7,18+i*7)) }}/>
      ))}
      <div style={{ position:'absolute', top:'8%', left:'8%', opacity:cl(lerp(frame,0,1,10,26)), transform:`translateY(${lerp(frame,16,0,10,26)}px)` }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:400, fontSize:22, color:'#ffffff22', letterSpacing:4, textTransform:'uppercase', marginBottom:8 }}>Résultat moyen / 3 mois</div>
        <SpringCounter frame={frame} startFrame={12} from={0} to={34} suffix="%" style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:144, color:C.gold, lineHeight:1 }}/>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:26, color:'#ffffff33' }}>de chiffre d'affaires</div>
      </div>
      <div style={{ position:'absolute', top:'10%', right:'8%', textAlign:'right', opacity:cl(lerp(frame,0,1,20,34)) }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:52, color:C.warm }}>120+</div>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, color:'#ffffff33', letterSpacing:2 }}>loueurs<br/>en France</div>
      </div>
      <div style={{ position:'absolute', top:'38%', left:'50%', transform:`translateX(-50%) scale(${logoSc})`, opacity:cl(lerp(frame,0,1,14,32)), display:'flex', alignItems:'flex-end', whiteSpace:'nowrap' }}>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:160, color:C.warm, letterSpacing:8 }}>LO</span>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:160, color:C.gold, display:'inline-block', transform:`scale(${pulseQ})`, transformOrigin:'center bottom' }}>Q</span>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:160, color:C.warm, letterSpacing:8 }}>AR</span>
      </div>
      <div style={{ position:'absolute', top:'58%', left:'50%', transform:'translateX(-50%)', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:400, fontSize:36, color:C.gold, letterSpacing:16, opacity:cl(lerp(frame,0,1,32,48)), whiteSpace:'nowrap' }}>LOQAR.FR</div>
      <div style={{ position:'absolute', top:'66%', left:'8%', display:'flex', flexDirection:'column', gap:12 }}>
        {badges.map((b,i)=>(
          <div key={i} style={{ opacity:cl(lerp(frame,0,1,b.delay,b.delay+12)), transform:`translateX(${lerp(frame,-14,0,b.delay,b.delay+12)}px)`, display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:C.gold, flexShrink:0 }}/>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:24, color:'#ffffff44', letterSpacing:1 }}>{b.txt}</span>
          </div>
        ))}
      </div>
      <div style={{ position:'absolute', bottom:'6%', left:'8%', right:'8%', opacity:ctaOp, transform:`scale(${ctaSc})`, transformOrigin:'bottom center' }}>
        <div style={{ background:C.gold, borderRadius:28, padding:'32px 0', textAlign:'center', marginBottom:16 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:44, color:C.obsidian, letterSpacing:4, textTransform:'uppercase' }}>Commencer gratuitement</div>
        </div>
        <div style={{ textAlign:'center', fontFamily:"'Outfit',sans-serif", fontSize:22, color:'#ffffff2a', letterSpacing:2, opacity:cl(lerp(frame,0,1,68,80)) }}>
          Aucune carte requise · Sans engagement · 30 jours offerts
        </div>
      </div>
    </Scene>
  );
}

export const LoqarAdV2 = () => {
  const frame = useCurrentFrame();
  const f = frame;
  return (
    <div style={{ width:1080, height:1920, position:'relative', overflow:'hidden', fontFamily:"'Outfit',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;700;800&family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400&display=swap" rel="stylesheet"/>
      {f < 72            && <Act1  frame={f}/>}
      {f >= 60 && f < 188 && <Act2  frame={Math.max(0,f-67)}/>}
      {f >= 170 && f < 264 && <Act3  frame={Math.max(0,f-180)}/>}
      {f >= 248 && f < 370 && <Act4  frame={Math.max(0,f-255)}/>}
      {f >= 352            && <Act56 frame={Math.max(0,f-360)}/>}
    </div>
  );
};
