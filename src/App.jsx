import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";

// ─── DESIGN TOKENS — Warm Charcoal + Champagne Gold ─────────────────────────
const T = {
  bg:       "#141210",
  surface:  "#1A1815",
  card:     "#1F1D1A",
  card2:    "#252320",
  border:   "#2E2B27",
  border2:  "#3A3733",
  text:     "#F5F0E8",
  sub:      "#9A9488",
  muted:    "#5A5650",
  gold:     "#C8A96E",
  goldDim:  "#C8A96E14",
  goldGlow: "#C8A96E35",
  cream:    "#EDE5D4",
  red:      "#E05555",
  redDim:   "#E0555514",
  amber:    "#D4854A",
  amberDim: "#D4854A14",
  blue:     "#5B8DB8",
  blueDim:  "#5B8DB814",
  success:  "#6AAF7A",
  successDim:"#6AAF7A14",
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const VEHICLES = [];
const CLIENTS = [];
const PAYMENTS = [];
const RENTALS = [
  { id:1, clientId:1, vehicleId:1, startDate:"2025-02-10", endDate:"2025-02-17", status:"en cours",  total:595 },
  { id:2, clientId:2, vehicleId:2, startDate:"2025-02-05", endDate:"2025-02-12", status:"terminée",  total:455 },
  { id:3, clientId:3, vehicleId:3, startDate:"2025-02-14", endDate:"2025-02-19", status:"en cours",  total:225 },
  { id:4, clientId:2, vehicleId:4, startDate:"2025-02-20", endDate:"2025-02-25", status:"réservée",  total:600 },
];
const REVENUE = [1200,1850,2100,1600,2800,3200,2900,3800,4100,3600,4800,5240];

// ─── UTILS ───────────────────────────────────────────────────────────────────
const fmt      = n => Number(n).toLocaleString("fr-FR");
const fmtDate  = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const isExpired = d => new Date(d) < new Date();
const aColor   = name => { const c=[T.gold,"#7A9BB5","#B5856E","#8FB58E","#9B8AB5"]; return c[(name?.charCodeAt(0)||0)%c.length]; };
const initials = name => name?.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()||"?";

// ─── COUNTER HOOK ────────────────────────────────────────────────────────────
function useCounter(target, duration=1100) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const s = Date.now();
    const tick = () => {
      const p = Math.min(1,(Date.now()-s)/duration);
      const e = 1-Math.pow(1-p,3);
      setVal(Math.round(e*target));
      if(p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return val;
}

// ─── CAR SVG SILHOUETTES ─────────────────────────────────────────────────────
const CarSilhouette = ({ cat="Berline", color=T.gold, size=120 }) => {
  const paths = {
    Berline:  "M8 28 L16 16 L26 12 L70 12 L82 16 L90 22 L92 28 L92 36 L8 36 Z M22 36 A7 7 0 1 0 36 36 A7 7 0 1 0 22 36 Z M64 36 A7 7 0 1 0 78 36 A7 7 0 1 0 64 36 Z M16 16 L30 16 L28 24 L14 24 Z M34 16 L58 16 L58 24 L34 24 Z M62 16 L76 16 L80 24 L62 24 Z",
    Compacte: "M10 28 L20 14 L32 11 L68 11 L80 14 L90 22 L90 28 L90 36 L10 36 Z M22 36 A7 7 0 1 0 36 36 A7 7 0 1 0 22 36 Z M64 36 A7 7 0 1 0 78 36 A7 7 0 1 0 64 36 Z M20 14 L36 14 L34 22 L18 22 Z M40 14 L60 14 L60 22 L40 22 Z M64 14 L78 14 L82 22 L64 22 Z",
    Citadine: "M14 28 L22 16 L32 12 L62 12 L74 16 L86 24 L86 36 L14 36 Z M24 36 A7 7 0 1 0 38 36 A7 7 0 1 0 24 36 Z M62 36 A7 7 0 1 0 76 36 A7 7 0 1 0 62 36 Z M22 16 L36 16 L34 24 L20 24 Z M40 16 L58 16 L58 24 L40 24 Z M62 16 L72 16 L76 24 L62 24 Z",
    Premium:  "M6 28 L14 14 L28 10 L72 10 L86 14 L94 22 L94 28 L94 36 L6 36 Z M20 36 A7 7 0 1 0 34 36 A7 7 0 1 0 20 36 Z M66 36 A7 7 0 1 0 80 36 A7 7 0 1 0 66 36 Z M14 14 L32 14 L30 22 L12 22 Z M36 14 L64 14 L64 22 L36 22 Z M68 14 L84 14 L88 22 L68 22 Z",
  };
  const w = size, h = size * 0.45;
  return (
    <svg width={w} height={h} viewBox="0 0 100 48" fill="none">
      <path d={paths[cat]||paths.Berline} fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
};

// ─── SPARKLINE ───────────────────────────────────────────────────────────────
function Sparkline({ data, w=160, h=40 }) {
  const min=Math.min(...data), max=Math.max(...data), r=max-min||1;
  const pts = data.map((v,i)=>[(i/(data.length-1))*w, h-((v-min)/r)*(h-6)-3]);
  const d   = "M"+pts.map(p=>p.join(",")).join("L");
  const area= d+` L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.gold} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={T.gold} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)"/>
      <path d={d} fill="none" stroke={T.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={T.gold}/>
    </svg>
  );
}

// ─── ICON COMPONENT ──────────────────────────────────────────────────────────
const Ic = ({ paths, d, size=16, color="currentColor", sw=1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {paths ? paths.map((p,i)=><path key={i} d={p}/>) : <path d={d}/>}
  </svg>
);

const Icons = {
  dash:     <Ic size={15} paths={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"]}/>,
  car:      <Ic size={15} paths={["M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3","M18 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0","M7 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0"]}/>,
  users:    <Ic size={15} paths={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"]}/>,
  dollar:   <Ic size={15} d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>,
  doc:      <Ic size={15} paths={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"]}/>,
  plus:     <Ic size={15} d="M12 5v14M5 12h14"/>,
  search:   <Ic size={15} paths={["M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z","M21 21l-4.35-4.35"]}/>,
  x:        <Ic size={15} d="M18 6L6 18M6 6l12 12"/>,
  logout:   <Ic size={15} paths={["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"]}/>,
  alert:    <Ic size={15} paths={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"]}/>,
  check:    <Ic size={15} d="M20 6L9 17l-5-5"/>,
  calendar: <Ic size={15} paths={["M8 2v4","M16 2v4","M3 10h18","M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"]}/>,
  trend:    <Ic size={15} d="M23 6l-9.5 9.5-5-5L1 18"/>,
  shield:   <Ic size={15} paths={["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"]}/>,
  clock:    <Ic size={15} paths={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","M12 6v6l4 2"]}/>,
  mail:     <Ic size={15} paths={["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"]}/>,
  phone:    <Ic size={15} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.5a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>,
  key:      <Ic size={15} paths={["M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"]}/>,
  download: <Ic size={15} paths={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]}/>,
  edit:     <Ic size={15} paths={["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"]}/>,
  trash:    <Ic size={15} paths={["M3 6h18","M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"]}/>,
  eye:      <Ic size={15} paths={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"]}/>,
  eyeOff:   <Ic size={15} paths={["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24","M1 1l22 22"]}/>,
  zap:      <Ic size={15} d="M13 2L3 14h9l-1 8 10-12h-9l1-8"/>,
  tag:      <Ic size={13} paths={["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z","M7 7h.01"]}/>,
  fuel:     <Ic size={13} paths={["M3 22V8l7-6 7 6v14","M9 22v-6h4v6","M11 2v4"]}/>,
  seat:     <Ic size={13} paths={["M19 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13","M22 22l-3-3m0 0a3 3 0 1 0-4.24-4.24A3 3 0 0 0 19 19z"]}/>,
  bell:     <Ic size={16} paths={["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"]}/>,
  settings: <Ic size={15} paths={["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"]}/>,
  pen:      <Ic size={15} paths={["M12 20h9","M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"]}/>,
  building: <Ic size={15} paths={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"]}/>,
  upload:   <Ic size={15} paths={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]}/>,
};

// ─── BASE COMPONENTS ─────────────────────────────────────────────────────────
function Avatar({ name, size=36 }) {
  const col = aColor(name);
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:col+"20", border:`1.5px solid ${col}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.32, fontWeight:700, color:col, flexShrink:0, userSelect:"none", letterSpacing:"0.04em" }}>
      {initials(name)}
    </div>
  );
}

function Badge({ label, color=T.gold, bg, dot=false }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, color, background:bg||color+"18", whiteSpace:"nowrap", letterSpacing:"0.01em" }}>
      {dot && <span style={{ width:5, height:5, borderRadius:"50%", background:color, flexShrink:0 }}/>}
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  const m = {
    "disponible":  { c:T.success, l:"Disponible" },
    "en location": { c:T.gold,    l:"En location" },
    "entretien":   { c:T.red,     l:"Entretien"   },
    "en cours":    { c:T.gold,    l:"En cours"    },
    "terminée":    { c:T.muted,   l:"Terminée"    },
    "réservée":    { c:T.blue,    l:"Réservée"    },
    "encaissé":    { c:T.success, l:"Encaissé"    },
    "en attente":  { c:T.amber,   l:"En attente"  },
    "en retard":   { c:T.red,     l:"En retard"   },
  };
  const s = m[status]||{c:T.sub, l:status};
  return <Badge label={s.l} color={s.c} dot/>;
}

function ProgressBar({ value, max, color=T.gold }) {
  const pct = Math.min(100,(value/max)*100);
  return (
    <div style={{ height:3, background:T.border, borderRadius:99, overflow:"hidden" }}>
      <div style={{ height:"100%", width:pct+"%", background:color, borderRadius:99, transition:"width .7s cubic-bezier(.16,1,.3,1)" }}/>
    </div>
  );
}

function Divider() {
  return <div style={{ height:1, background:T.border, margin:"4px 0" }}/>;
}

function Btn({ label, onClick, variant="primary", icon, style={}, size="md", full=false }) {
  const [hov, setHov] = useState(false);
  const sz = {
    sm: { padding:"5px 13px", fontSize:12, borderRadius:8, gap:5 },
    md: { padding:"9px 18px", fontSize:13, borderRadius:10, gap:7 },
    lg: { padding:"12px 26px", fontSize:14, borderRadius:11, gap:8 },
  }[size];
  const v = {
    primary:   { bg:hov?"#D9BC84":T.gold,    color:"#0F0D0B",  border:"none"                               },
    secondary: { bg:hov?T.card2:T.card,       color:T.text,    border:`1px solid ${T.border2}`             },
    ghost:     { bg:hov?T.card2:"transparent",color:T.sub,     border:"none"                               },
    danger:    { bg:hov?T.red+"25":T.redDim,  color:T.red,     border:`1px solid ${T.red}30`               },
    outline:   { bg:hov?T.goldDim:"transparent",color:T.gold,  border:`1px solid ${T.gold}60`              },
  }[variant]||{};
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"inline-flex", alignItems:"center", fontWeight:600, fontFamily:"inherit", cursor:"pointer", transition:"all .15s", transform:hov&&variant!=="ghost"?"translateY(-1px)":"none", letterSpacing:"0.01em", width:full?"100%":"auto", justifyContent:full?"center":"flex-start", ...sz, ...v, ...style }}>
      {icon && icon}{label}
    </button>
  );
}

function Input({ label, value, onChange, type="text", placeholder="", icon }) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {label && <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{label}</label>}
      <div style={{ position:"relative" }}>
        {icon && <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, display:"flex", pointerEvents:"none" }}>{icon}</span>}
        <input type={type} value={value} placeholder={placeholder}
          onChange={e=>onChange(e.target.value)}
          onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
          style={{ width:"100%", background:T.card2, border:`1px solid ${foc?T.gold:T.border}`, borderRadius:10, padding:`10px ${icon?"12px 10px 38px":"13px"}`, color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", boxShadow:foc?`0 0 0 3px ${T.goldDim}`:"none", transition:"all .15s" }}/>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, width=540 }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"#00000095", display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)", animation:"fadeIn .15s" }}
      onClick={onClose}>
      <div style={{ background:T.card, border:`1px solid ${T.border2}`, borderRadius:20, padding:30, width, maxWidth:"100%", maxHeight:"90vh", overflowY:"auto" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h2 style={{ fontSize:18, fontWeight:700, letterSpacing:"-0.02em", color:T.text }}>{title}</h2>
          <Btn variant="ghost" icon={Icons.x} onClick={onClose} style={{ padding:6 }}/>
        </div>
        {children}
      </div>
    </div>
  );
}

function Card({ children, style={}, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>onClick&&setHov(true)} onMouseLeave={()=>onClick&&setHov(false)}
      style={{ background:T.card, border:`1px solid ${hov?T.border2:T.border}`, borderRadius:16, padding:22, transition:"all .2s", transform:hov?"translateY(-2px)":"none", boxShadow:hov?"0 12px 40px #00000050":"none", cursor:onClick?"pointer":"default", ...style }}>
      {children}
    </div>
  );
}

// ─── COMMAND BAR ─────────────────────────────────────────────────────────────
const CMD = [
  { cat:"Navigation",    items:[{l:"Tableau de bord",icon:Icons.dash,page:"dashboard"},{l:"Véhicules",icon:Icons.car,page:"vehicles"},{l:"Clients",icon:Icons.users,page:"clients"},{l:"Paiements",icon:Icons.dollar,page:"payments"},{l:"Documents",icon:Icons.doc,page:"documents"}]},
  { cat:"Actions",       items:[{l:"Ajouter un véhicule",icon:Icons.plus,page:"vehicles"},{l:"Nouveau client",icon:Icons.plus,page:"clients"},{l:"Générer un contrat",icon:Icons.doc,page:"documents"}]},
];

function CommandBar({ onClose, onNav }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);
  useEffect(()=>ref.current?.focus(),[]);
  const filtered = CMD.map(c=>({...c, items:c.items.filter(i=>!q||i.l.toLowerCase().includes(q.toLowerCase()))})).filter(c=>c.items.length);
  const all = filtered.flatMap(c=>c.items);
  let gi=0;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:900, background:"#00000090", backdropFilter:"blur(10px)", display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:"14vh" }}
      onClick={onClose}>
      <div style={{ width:540, background:T.card, border:`1px solid ${T.border2}`, borderRadius:18, overflow:"hidden", boxShadow:`0 40px 80px #00000080, 0 0 0 1px ${T.gold}20` }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"15px 18px", borderBottom:`1px solid ${T.border}` }}>
          <span style={{ color:T.muted }}>{Icons.search}</span>
          <input ref={ref} value={q} onChange={e=>{setQ(e.target.value);setIdx(0);}}
            onKeyDown={e=>{ if(e.key==="ArrowDown"){e.preventDefault();setIdx(i=>Math.min(i+1,all.length-1));} if(e.key==="ArrowUp"){e.preventDefault();setIdx(i=>Math.max(i-1,0));} if(e.key==="Enter"&&all[idx]){onNav(all[idx].page);onClose();} if(e.key==="Escape")onClose(); }}
            placeholder="Naviguer, rechercher…"
            style={{ flex:1, background:"none", border:"none", color:T.text, fontSize:15, fontFamily:"inherit", outline:"none" }}/>
          <span style={{ fontSize:11, color:T.muted, background:T.card2, border:`1px solid ${T.border2}`, borderRadius:5, padding:"2px 7px", fontFamily:"monospace" }}>Esc</span>
        </div>
        <div style={{ padding:8, maxHeight:320, overflowY:"auto" }}>
          {filtered.map(cat=>(
            <div key={cat.cat}>
              <div style={{ padding:"6px 12px 4px", fontSize:10, fontWeight:700, color:T.muted, letterSpacing:".1em", textTransform:"uppercase" }}>{cat.cat}</div>
              {cat.items.map(item=>{
                const active=gi===idx; const li=gi++;
                return (
                  <div key={item.l} onMouseEnter={()=>setIdx(li)} onClick={()=>{onNav(item.page);onClose();}}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 12px", borderRadius:9, cursor:"pointer", background:active?T.card2:"transparent", color:active?T.text:T.sub, transition:"background .1s" }}>
                    <div style={{ width:30, height:30, borderRadius:7, background:active?T.goldDim:T.card2, display:"flex", alignItems:"center", justifyContent:"center", color:active?T.gold:T.muted }}>{item.icon}</div>
                    {item.l}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ padding:"9px 16px", borderTop:`1px solid ${T.border}`, display:"flex", gap:14 }}>
          {[["↑↓","Naviguer"],["↵","Ouvrir"],["Esc","Fermer"]].map(([k,l])=>(
            <span key={k} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:T.muted }}>
              <span style={{ background:T.card2, border:`1px solid ${T.border2}`, borderRadius:4, padding:"1px 6px", fontFamily:"monospace" }}>{k}</span>{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
const NOTIFS = [
  { id:1, type:"warning", title:"Permis expiré", body:"Emma Leroy — permis expiré depuis le 01/12/2024", time:"Maintenant", read:false },
  { id:2, type:"danger",  title:"Paiement en retard", body:"Emma Leroy — 135 € en retard depuis 8 jours", time:"Il y a 2h", read:false },
  { id:3, type:"info",    title:"Location se termine demain", body:"Marie Dupont — Mercedes Classe A · 17/02", time:"Il y a 5h", read:false },
  { id:4, type:"warning", title:"Permis expire bientôt", body:"Thomas Martin — expire dans 72 jours", time:"Hier", read:true },
  { id:5, type:"success", title:"Paiement encaissé", body:"Thomas Martin — 1 200 € reçus", time:"15 jan", read:true },
];

function NotifPanel({ onClose }) {
  const [notifs, setNotifs] = useState(NOTIFS);
  const markAll = () => setNotifs(n=>n.map(x=>({...x,read:true})));
  const typeColor = t => t==="danger"?T.red:t==="warning"?T.amber:t==="success"?T.success:T.blue;
  return (
    <div style={{ position:"fixed", top:0, right:0, bottom:0, width:360, background:T.surface, borderLeft:`1px solid ${T.border}`, zIndex:300, display:"flex", flexDirection:"column", boxShadow:"-8px 0 40px #00000040", animation:"slideIn .22s" }}>
      <div style={{ padding:"20px 20px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Notifications</div>
          <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{notifs.filter(n=>!n.read).length} non lues</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={markAll} style={{ fontSize:11, color:T.gold, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>Tout lire</button>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", display:"flex", padding:4, borderRadius:6 }}>{Icons.x}</button>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto" }}>
        {notifs.map(n=>(
          <div key={n.id} onClick={()=>setNotifs(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))}
            style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, cursor:"pointer", background:n.read?"transparent":typeColor(n.type)+"08", transition:"background .15s", display:"flex", gap:12, alignItems:"flex-start" }}
            onMouseEnter={e=>e.currentTarget.style.background=T.card}
            onMouseLeave={e=>e.currentTarget.style.background=n.read?"transparent":typeColor(n.type)+"08"}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:n.read?"transparent":typeColor(n.type), flexShrink:0, marginTop:5, border:n.read?`1px solid ${T.border}`:"none" }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:n.read?T.sub:T.text, marginBottom:3 }}>{n.title}</div>
              <div style={{ fontSize:12, color:T.muted, lineHeight:1.5 }}>{n.body}</div>
              <div style={{ fontSize:10, color:T.muted, marginTop:5 }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function OnboardingScreen({ onDone, onNav }) {
  const [step, setStep] = useState(0);
  const steps = [
    { id:"agency",   icon:Icons.building, title:"Votre agence",       desc:"Renseignez le nom, le logo et les coordonnées de votre agence. Ces infos apparaîtront sur vos contrats." },
    { id:"vehicle",  icon:Icons.car,      title:"Premier véhicule",   desc:"Ajoutez votre premier véhicule à la flotte. Immatriculation, catégorie, prix à la journée." },
    { id:"client",   icon:Icons.users,    title:"Premier client",     desc:"Enregistrez un locataire avec son permis de conduire et ses coordonnées." },
    { id:"contract", icon:Icons.doc,      title:"Premier contrat",    desc:"Générez votre premier contrat PDF en 30 secondes. Prêt à être signé." },
  ];
  const current = steps[step];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:400, background:T.bg+"EE", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, width:"100%", maxWidth:560, padding:40, animation:"fadeUp .3s", boxShadow:"0 24px 80px #00000060" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:`linear-gradient(135deg,${T.gold},#A07840)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Ic size={18} color="#0F0D0B" sw={2} paths={["M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3","M18 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0","M7 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0"]}/>
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:T.text }}>Bienvenue sur Loqar 👋</div>
            <div style={{ fontSize:12, color:T.muted }}>Configurez votre espace en 4 étapes rapides</div>
          </div>
          <button onClick={onDone} style={{ marginLeft:"auto", background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>Passer</button>
        </div>

        {/* Steps progress */}
        <div style={{ display:"flex", gap:8, marginBottom:32 }}>
          {steps.map((s,i)=>(
            <div key={i} style={{ flex:1, height:3, borderRadius:99, background:i<step?T.gold:i===step?T.gold+"80":T.border, transition:"background .3s" }}/>
          ))}
        </div>

        {/* Current step */}
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:28, marginBottom:24, textAlign:"center" }}>
          <div style={{ width:56, height:56, borderRadius:14, background:T.goldDim, border:`1px solid ${T.gold}30`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:T.gold }}>
            {current.icon}
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:T.text, marginBottom:8 }}>{current.title}</div>
          <p style={{ fontSize:13, color:T.sub, lineHeight:1.7, maxWidth:360, margin:"0 auto" }}>{current.desc}</p>
        </div>

        {/* Steps list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:28 }}>
          {steps.map((s,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, background:i===step?T.goldDim:i<step?T.card2:"transparent", border:`1px solid ${i===step?T.gold+"40":T.border}`, transition:"all .2s", cursor:"pointer" }} onClick={()=>setStep(i)}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:i<step?T.gold:i===step?T.gold+"30":T.card, border:`1px solid ${i<step?T.gold:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {i<step ? <Ic size={11} d="M20 6L9 17l-5-5" color="#0F0D0B" sw={2.5}/> : <span style={{ fontSize:10, fontWeight:700, color:i===step?T.gold:T.muted }}>{i+1}</span>}
              </div>
              <span style={{ fontSize:13, fontWeight:i===step?600:400, color:i===step?T.text:i<step?T.sub:T.muted }}>{s.title}</span>
              {i<step && <span style={{ marginLeft:"auto", fontSize:11, color:T.success }}>✓ Fait</span>}
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:10 }}>
          {step>0 && <Btn label="Retour" variant="secondary" onClick={()=>setStep(s=>s-1)} style={{ flex:1, justifyContent:"center" }}/>}
          <Btn
            label={step===steps.length-1?"Terminer la configuration →":"Étape suivante →"}
            variant="primary" size="md"
            onClick={()=>{ if(step===steps.length-1){onDone();onNav(["settings","vehicles","clients","documents"][step]);}else{setStep(s=>s+1); if(step===0)onNav("settings"); if(step===1)onNav("vehicles"); if(step===2)onNav("clients");}}}
            style={{ flex:1, justifyContent:"center" }}/>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function Settings({ agencyProfile, setAgencyProfile }) {
  const [form, setForm] = useState(agencyProfile);
  const [saved, setSaved] = useState(false);
  const up = (k,v) => setForm(f=>({...f,[k]:v}));
  const save = () => { setAgencyProfile(form); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <Page title="Paramètres" sub="Informations de votre agence · apparaissent sur vos contrats PDF">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

        {/* Infos agence */}
        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:T.gold, letterSpacing:".06em", textTransform:"uppercase", marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color:T.gold }}>{Icons.building}</span> Agence
          </div>

          {/* Logo upload zone */}
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Logo</label>
            <div style={{ width:80, height:80, borderRadius:14, background:T.card2, border:`2px dashed ${T.border2}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", gap:6, transition:"border-color .15s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.border2}>
              {form.logo
                ? <div style={{ fontSize:28 }}>{form.logo}</div>
                : <><span style={{ color:T.muted }}>{Icons.upload}</span><span style={{ fontSize:10, color:T.muted }}>Logo</span></>
              }
            </div>
            <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
              {["🚗","🏢","🔑","⭐","🚙"].map(e=>(
                <button key={e} onClick={()=>up("logo",e)} style={{ width:32, height:32, borderRadius:8, background:form.logo===e?T.goldDim:T.card2, border:`1px solid ${form.logo===e?T.gold:T.border}`, fontSize:16, cursor:"pointer" }}>{e}</button>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
            {[["Nom de l'agence","name","Loqar Auto"],["SIRET","siret","123 456 789 00012"],["Adresse","address","12 rue de la Paix, 75001 Paris"],["Téléphone","phone","+33 1 23 45 67 89"],["Email","email","contact@loqar.fr"],["Site web","website","www.loqar.fr"]].map(([lbl,key,ph])=>(
              <div key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{lbl}</label>
                <input value={form[key]||""} onChange={e=>up(key,e.target.value)} placeholder={ph}
                  style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", transition:"border-color .15s" }}
                  onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Coordonnées bancaires */}
          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:T.gold, letterSpacing:".06em", textTransform:"uppercase", marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:T.gold }}>{Icons.dollar}</span> Coordonnées bancaires
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              {[["IBAN","iban","FR76 3000 6000 0112 3456 7890 189"],["BIC / SWIFT","bic","BNPAFRPP"],["Titulaire","bankHolder","Alexandre Dubois"]].map(([lbl,key,ph])=>(
                <div key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{lbl}</label>
                  <input value={form[key]||""} onChange={e=>up(key,e.target.value)} placeholder={ph}
                    style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", fontFamily:"monospace", transition:"border-color .15s" }}
                    onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
                </div>
              ))}
            </div>
          </Card>

          {/* Mentions légales contrat */}
          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:T.gold, letterSpacing:".06em", textTransform:"uppercase", marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:T.gold }}>{Icons.doc}</span> Mentions contrat
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Conditions générales</label>
                <textarea value={form.terms||""} onChange={e=>up("terms",e.target.value)} rows={4} placeholder="Le locataire s'engage à restituer le véhicule..."
                  style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontSize:12, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.6 }}
                  onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Franchise dommages</label>
                <input value={form.franchise||""} onChange={e=>up("franchise",e.target.value)} placeholder="800 €"
                  style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}
                  onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
              </div>
            </div>
          </Card>

          {/* Aperçu contrat */}
          <Card style={{ background:T.card2 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:14 }}>Aperçu en-tête contrat</div>
            <div style={{ background:"#FDFBF7", borderRadius:10, padding:18, color:"#1A1510" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10, paddingBottom:10, borderBottom:"1px solid #DDD5C8" }}>
                <div style={{ fontSize:22 }}>{form.logo||"🚗"}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, letterSpacing:"-.02em" }}>{form.name||"Nom de l'agence"}</div>
                  <div style={{ fontSize:10, color:"#888" }}>{form.address||"Adresse"}</div>
                </div>
                <div style={{ marginLeft:"auto", textAlign:"right" }}>
                  <div style={{ fontSize:10, color:"#888" }}>{form.phone||"Téléphone"}</div>
                  <div style={{ fontSize:10, color:"#888" }}>{form.email||"Email"}</div>
                </div>
              </div>
              <div style={{ fontSize:10, color:"#999" }}>IBAN : {form.iban||"—"}</div>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display:"flex", gap:10, marginTop:24, justifyContent:"flex-end", alignItems:"center" }}>
        {saved && <span style={{ fontSize:13, color:T.success, display:"flex", alignItems:"center", gap:5 }}>{Icons.check} Enregistré !</span>}
        <Btn label="Enregistrer les modifications" variant="primary" onClick={save} icon={Icons.check}/>
      </div>
    </Page>
  );
}

// ─── SIGNATURE ÉLECTRONIQUE ───────────────────────────────────────────────────
function SignaturePage() {
  const [selected, setSelected] = useState(null);
  const [sigStep, setSigStep] = useState(null); // null | "send" | "signing" | "done"
  const [signed, setSigned] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef(null);

  const contracts = [
    { id:1, client:"Marie Dupont",  vehicle:"Mercedes Classe A", date:"10/02/2025", amount:595, status:"en attente signature" },
    { id:2, client:"Thomas Martin", vehicle:"Peugeot 308",       date:"05/02/2025", amount:455, status:"signé" },
    { id:3, client:"Emma Leroy",    vehicle:"Renault Clio",       date:"14/02/2025", amount:225, status:"en attente signature" },
    { id:4, client:"Thomas Martin", vehicle:"BMW Série 3",        date:"20/02/2025", amount:600, status:"en attente signature" },
  ];

  const startDraw = e => { setDrawing(true); const c=canvasRef.current; const r=c.getBoundingClientRect(); const ctx=c.getContext("2d"); ctx.beginPath(); ctx.moveTo(e.clientX-r.left,e.clientY-r.top); };
  const draw = e => { if(!drawing)return; setHasDrawn(true); const c=canvasRef.current; const r=c.getBoundingClientRect(); const ctx=c.getContext("2d"); ctx.strokeStyle="#1A1510"; ctx.lineWidth=2; ctx.lineCap="round"; ctx.lineTo(e.clientX-r.left,e.clientY-r.top); ctx.stroke(); };
  const endDraw = () => setDrawing(false);
  const clearCanvas = () => { const c=canvasRef.current; c.getContext("2d").clearRect(0,0,c.width,c.height); setHasDrawn(false); };
  const confirmSign = () => { setSigned(s=>[...s,selected?.id]); setSigStep("done"); };

  return (
    <Page title="Signature électronique" sub="Envoyez vos contrats à signer en un clic">

      {sigStep==="signing" && selected && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"#00000090", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }}>
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, width:500, padding:32, boxShadow:"0 24px 80px #00000060" }}>
            <div style={{ fontSize:16, fontWeight:700, color:T.text, marginBottom:4 }}>Signature du contrat</div>
            <div style={{ fontSize:12, color:T.muted, marginBottom:22 }}>{selected.client} · {selected.vehicle} · {selected.amount} €</div>

            <div style={{ background:"#FDFBF7", borderRadius:12, padding:20, marginBottom:20, color:"#1A1510", fontSize:12, lineHeight:1.6 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>Contrat de location N° LQ-2025-{selected.id.toString().padStart(4,"0")}</div>
              <div>Véhicule : <strong>{selected.vehicle}</strong></div>
              <div>Locataire : <strong>{selected.client}</strong></div>
              <div>Montant : <strong>{selected.amount} €</strong></div>
              <div style={{ marginTop:10, fontSize:11, color:"#888" }}>En signant ce document, le locataire accepte les conditions générales de location.</div>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase", marginBottom:8 }}>Signature du locataire</div>
              <div style={{ position:"relative", background:"#FDFBF7", borderRadius:10, border:`2px dashed ${hasDrawn?T.gold:T.border2}`, overflow:"hidden", transition:"border-color .2s" }}>
                <canvas ref={canvasRef} width={436} height={120}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                  style={{ display:"block", cursor:"crosshair", width:"100%", height:120 }}/>
                {!hasDrawn && <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", color:T.muted, fontSize:12 }}>Dessinez votre signature ici</div>}
              </div>
              {hasDrawn && <button onClick={clearCanvas} style={{ fontSize:11, color:T.muted, background:"none", border:"none", cursor:"pointer", marginTop:6, fontFamily:"inherit" }}>Effacer</button>}
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <Btn label="Annuler" variant="secondary" onClick={()=>setSigStep(null)} style={{ flex:1, justifyContent:"center" }}/>
              <Btn label={hasDrawn?"Confirmer la signature":"Signer d'abord…"} variant="primary" onClick={hasDrawn?confirmSign:undefined} style={{ flex:1, justifyContent:"center", opacity:hasDrawn?1:.5 }}/>
            </div>
          </div>
        </div>
      )}

      {sigStep==="done" && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"#00000090", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }}>
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, width:420, padding:40, textAlign:"center", boxShadow:"0 24px 80px #00000060", animation:"fadeUp .3s" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:T.successDim, border:`1px solid ${T.success}40`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", color:T.success }}>
              <Ic size={28} d="M20 6L9 17l-5-5" color={T.success} sw={2}/>
            </div>
            <div style={{ fontSize:20, fontWeight:700, color:T.text, marginBottom:8 }}>Contrat signé !</div>
            <p style={{ fontSize:13, color:T.sub, lineHeight:1.7, marginBottom:24 }}>La signature de <strong style={{ color:T.text }}>{selected?.client}</strong> a été enregistrée. Un email de confirmation lui a été envoyé.</p>
            <Btn label="Fermer" variant="primary" onClick={()=>{ setSigStep(null); setSelected(null); setHasDrawn(false); }} style={{ justifyContent:"center", width:"100%" }}/>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          {l:"En attente",v:contracts.filter(c=>c.status==="en attente signature"&&!signed.includes(c.id)).length,c:T.amber,icon:Icons.clock},
          {l:"Signés",v:contracts.filter(c=>c.status==="signé").length+signed.length,c:T.success,icon:Icons.check},
          {l:"Total contrats",v:contracts.length,c:T.gold,icon:Icons.doc},
        ].map(s=>(
          <Card key={s.l}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:T.muted, letterSpacing:".08em", textTransform:"uppercase", marginBottom:8 }}>{s.l}</div>
                <div style={{ fontSize:30, fontWeight:700, color:s.c, letterSpacing:"-.03em" }}>{s.v}</div>
              </div>
              <div style={{ width:36, height:36, borderRadius:10, background:s.c+"18", display:"flex", alignItems:"center", justifyContent:"center", color:s.c }}>{s.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Contracts list */}
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Contrats en attente de signature</div>
          <Btn label="Nouveau contrat" variant="outline" size="sm" icon={Icons.plus}/>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:T.surface }}>
              {["Client","Véhicule","Date","Montant","Statut","Actions"].map(h=>(
                <th key={h} style={{ padding:"10px 18px", textAlign:"left", fontSize:10, fontWeight:700, color:T.muted, letterSpacing:".1em", textTransform:"uppercase", borderBottom:`1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contracts.map(c=>{
              const isSigned = c.status==="signé" || signed.includes(c.id);
              return (
                <tr key={c.id} style={{ transition:"background .12s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                      <Avatar name={c.client} size={30}/>
                      <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{c.client}</span>
                    </div>
                  </td>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${T.border}`, fontSize:12, color:T.sub }}>{c.vehicle}</td>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${T.border}`, fontSize:12, color:T.muted }}>{c.date}</td>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${T.border}`, fontSize:13, fontWeight:700, color:T.gold }}>{c.amount} €</td>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${T.border}` }}>
                    <Badge label={isSigned?"Signé":"En attente"} color={isSigned?T.success:T.amber} dot/>
                  </td>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${T.border}` }}>
                    {!isSigned
                      ? <div style={{ display:"flex", gap:8 }}>
                          <Btn label="Envoyer le lien" variant="outline" size="sm" icon={Icons.mail} onClick={()=>{ setSelected(c); setSigStep("send"); setTimeout(()=>setSigStep("signing"),800); }}/>
                          <Btn label="Signer ici" variant="secondary" size="sm" icon={Icons.pen} onClick={()=>{ setSelected(c); setSigStep("signing"); setHasDrawn(false); }}/>
                        </div>
                      : <span style={{ fontSize:12, color:T.success, display:"flex", alignItems:"center", gap:5 }}>{Icons.check} Signé</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </Page>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

const NAV = [
  { id:"dashboard",  label:"Tableau de bord", icon:Icons.dash },
  { id:"vehicles",   label:"Véhicules",        icon:Icons.car  },
  { id:"clients",    label:"Clients",          icon:Icons.users},
  { id:"payments",   label:"Paiements",        icon:Icons.dollar},
  { id:"documents",  label:"Documents",        icon:Icons.doc  },
  { id:"signature",  label:"Signatures",       icon:Icons.pen  },
  { id:"pricing",    label:"Abonnements",      icon:Icons.zap  },
  { id:"settings",   label:"Paramètres",       icon:Icons.settings },
];

function Sidebar({ page, onNav, user, onLogout, onCmd, vehicles, onNotif, unreadCount }) {
  const lateP = PAYMENTS.filter(p=>p.status==="en retard").length;
  return (
    <aside style={{ width:220, minHeight:"100vh", background:T.surface, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", padding:"22px 12px", position:"fixed", top:0, left:0, bottom:0, zIndex:100, overflowY:"auto" }}>

      {/* Logo + bell */}
      <div style={{ padding:"2px 8px 20px", borderBottom:`1px solid ${T.border}`, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${T.gold},#A07840)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Ic size={18} color="#0F0D0B" sw={2} paths={["M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3","M18 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0","M7 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0"]}/>
          </div>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:T.text, letterSpacing:"-0.02em" }}>Loqar</div>
            <div style={{ fontSize:10, color:T.muted, letterSpacing:"0.04em" }}>LOCATION AUTO</div>
          </div>
          <button onClick={onNotif} style={{ marginLeft:"auto", position:"relative", background:"none", border:"none", color:T.muted, cursor:"pointer", display:"flex", padding:6, borderRadius:8, transition:"color .15s" }}
            onMouseEnter={e=>e.currentTarget.style.color=T.gold}
            onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
            {Icons.bell}
            {unreadCount>0 && <span style={{ position:"absolute", top:2, right:2, width:16, height:16, borderRadius:"50%", background:T.red, fontSize:9, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>{unreadCount}</span>}
          </button>
        </div>
      </div>

      {/* Search */}
      <button onClick={onCmd}
        style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 11px", borderRadius:9, background:T.card, border:`1px solid ${T.border}`, color:T.sub, fontSize:12, cursor:"pointer", marginBottom:16, fontFamily:"inherit", transition:"all .15s" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.color=T.text}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.sub}}>
        {Icons.search}
        <span style={{ flex:1, textAlign:"left" }}>Rechercher…</span>
        <span style={{ fontSize:10, color:T.muted, background:T.card2, border:`1px solid ${T.border}`, borderRadius:4, padding:"1px 5px", fontFamily:"monospace" }}>⌘K</span>
      </button>

      {/* Nav */}
      <div style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:".1em", textTransform:"uppercase", padding:"0 10px", marginBottom:8 }}>Menu</div>
      {NAV.map(item => {
        const active = page===item.id;
        return (
          <button key={item.id} onClick={()=>onNav(item.id)}
            style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 12px", borderRadius:9, marginBottom:2, background:active?T.goldDim:"transparent", border:"none", color:active?T.gold:T.sub, fontSize:13, fontWeight:active?600:400, cursor:"pointer", transition:"all .15s", position:"relative", fontFamily:"inherit" }}
            onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.card}}
            onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent"}}>
            {active && <div style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", width:2, height:16, background:T.gold, borderRadius:99 }}/>}
            <span style={{ color:active?T.gold:T.muted }}>{item.icon}</span>
            {item.label}
            {item.id==="payments" && lateP>0 && (
              <span style={{ marginLeft:"auto", width:16, height:16, borderRadius:"50%", background:T.red, fontSize:9, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>{lateP}</span>
            )}
          </button>
        );
      })}

      <Divider />

      {/* Fleet health */}
      <div style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:".1em", textTransform:"uppercase", padding:"12px 10px 8px" }}>Flotte</div>
      <div style={{ padding:"12px 14px", background:T.card, border:`1px solid ${T.border}`, borderRadius:12, margin:"0 0 4px" }}>
        {[{l:"Disponible",s:"disponible",c:T.success},{l:"En location",s:"en location",c:T.gold},{l:"Entretien",s:"entretien",c:T.red}].map(g=>{
          const count = vehicles.filter(v=>v.status===g.s).length;
          return (
            <div key={g.s} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:g.c, flexShrink:0 }}/>
              <span style={{ fontSize:11, color:T.sub, flex:1 }}>{g.l}</span>
              <span style={{ fontSize:12, fontWeight:700, color:count>0?g.c:T.muted }}>{count}</span>
            </div>
          );
        })}
        <div style={{ height:1, background:T.border, margin:"6px 0 8px" }}/>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:10, color:T.muted }}>Total véhicules</span>
          <span style={{ fontSize:11, fontWeight:700, color:T.text }}>{vehicles.length}</span>
        </div>
      </div>

      <div style={{ flex:1 }}/>

      {/* Upgrade */}
      <div style={{ background:`linear-gradient(135deg,${T.gold}18,${T.gold}08)`, border:`1px solid ${T.gold}30`, borderRadius:12, padding:14, marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
          <span style={{ color:T.gold }}>{Icons.zap}</span>
          <span style={{ fontSize:12, fontWeight:700, color:T.gold }}>Plan Pro</span>
        </div>
        <p style={{ fontSize:11, color:T.sub, lineHeight:1.5, marginBottom:10 }}>API, rapports avancés et marque blanche.</p>
        <Btn label="Passer au Pro" variant="primary" size="sm" full/>
      </div>

      {/* User */}
      <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:14, display:"flex", alignItems:"center", gap:10 }}>
        <Avatar name={user?.name||"Alexandre Dubois"} size={32}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:T.text }}>{user?.name||"Alexandre Dubois"}</div>
          <div style={{ fontSize:10, color:T.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email||"demo@loqar.fr"}</div>
        </div>
        <button onClick={onLogout}
          style={{ background:"none", border:"none", color:T.muted, display:"flex", padding:5, cursor:"pointer", borderRadius:7 }}
          onMouseEnter={e=>e.currentTarget.style.color=T.red}
          onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
          {Icons.logout}
        </button>
      </div>
    </aside>
  );
}

// ─── PAGE WRAPPER ────────────────────────────────────────────────────────────
function Page({ title, sub, actions, children }) {
  return (
    <div style={{ padding:"36px 40px", maxWidth:1200, animation:"fadeUp .3s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.03em", color:T.text, marginBottom:4 }}>{title}</h1>
          {sub && <p style={{ fontSize:13, color:T.sub }}>{sub}</p>}
        </div>
        {actions && <div style={{ display:"flex", gap:8 }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handle = async () => {
    setError(""); setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setError("Email ou mot de passe incorrect");
    } else {
      const { error } = await supabase.auth.signUp({ email, password: pw, options: { data: { name } } });
      if (error) setError(error.message);
      else setSuccess("Compte créé ! Vérifiez votre email pour confirmer.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg }}>
      <div style={{ flex:1, background:T.surface, display:"flex", flexDirection:"column", justifyContent:"space-between", padding:52, position:"relative", overflow:"hidden", borderRight:`1px solid ${T.border}` }}>
        <div style={{ position:"absolute", inset:0, background:`linear-gradient(160deg, ${T.gold}08 0%, transparent 50%)`, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-10, right:-30, opacity:.08, pointerEvents:"none" }}><CarSilhouette cat="Premium" color={T.gold} size={460}/></div>
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:56 }}>
            <div style={{ width:42, height:42, borderRadius:10, background:`linear-gradient(135deg,${T.gold},#A07840)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ic size={20} color="#0F0D0B" sw={2} paths={["M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3","M18 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0","M7 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0"]}/>
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:700, color:T.text, letterSpacing:"-0.02em" }}>Loqar</div>
              <div style={{ fontSize:9, color:T.muted, letterSpacing:"0.14em", textTransform:"uppercase" }}>Location Automobile</div>
            </div>
          </div>
          <div style={{ fontSize:11, fontWeight:600, color:T.gold, letterSpacing:".14em", textTransform:"uppercase", marginBottom:14 }}>Gestion de flotte professionnelle</div>
          <h2 style={{ fontSize:38, fontWeight:700, letterSpacing:"-0.03em", lineHeight:1.1, color:T.text, marginBottom:18 }}>
            Pilotez votre flotte.<br/><span style={{ color:T.gold }}>Encaissez plus vite.</span>
          </h2>
          <p style={{ fontSize:14, color:T.sub, lineHeight:1.7, maxWidth:340 }}>Contrats, paiements, véhicules et clients — tout ce dont un loueur professionnel a besoin.</p>
        </div>
        <div style={{ position:"relative", zIndex:1, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          {[["2 400+","Véhicules gérés"],["340","Loueurs actifs"],["18 000","Contrats générés"]].map(([v,l])=>(
            <div key={l} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"16px 14px" }}>
              <div style={{ fontSize:20, fontWeight:700, color:T.gold, letterSpacing:"-0.02em", marginBottom:3 }}>{v}</div>
              <div style={{ fontSize:11, color:T.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ width:460, display:"flex", alignItems:"center", justifyContent:"center", padding:48 }}>
        <div style={{ width:"100%", animation:"fadeUp .35s" }}>
          <div style={{ marginBottom:30 }}>
            <h2 style={{ fontSize:24, fontWeight:700, letterSpacing:"-0.03em", marginBottom:8, color:T.text }}>{mode==="login"?"Bon retour":"Créer un compte"}</h2>
            <p style={{ fontSize:13, color:T.sub }}>{mode==="login"?"Accédez à votre espace":"Rejoignez des centaines de loueurs"}</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {mode==="register" && <Input label="Nom complet" value={name} onChange={setName} placeholder="Alexandre Dubois"/>}
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.fr"/>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Mot de passe</label>
              <div style={{ position:"relative" }}>
                <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••"
                  style={{ width:"100%", background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 40px 10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
                <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.muted, cursor:"pointer", display:"flex", padding:0 }}>
                  {showPw?Icons.eyeOff:Icons.eye}
                </button>
              </div>
            </div>
          </div>
          {error && <div style={{ marginTop:12, padding:"10px 14px", background:T.redDim, border:`1px solid ${T.red}30`, borderRadius:9, fontSize:12, color:T.red }}>{error}</div>}
          {success && <div style={{ marginTop:12, padding:"10px 14px", background:T.successDim, border:`1px solid ${T.success}30`, borderRadius:9, fontSize:12, color:T.success }}>{success}</div>}
          <Btn label={loading?"...":(mode==="login"?"Se connecter":"Créer mon compte")} onClick={handle} variant="primary" size="lg" full style={{ marginTop:22 }}/>
          <div style={{ textAlign:"center", marginTop:18, fontSize:13, color:T.sub }}>
            {mode==="login"?"Pas encore de compte ? ":"Déjà un compte ? "}
            <button onClick={()=>{ setMode(mode==="login"?"register":"login"); setError(""); setSuccess(""); }}
              style={{ background:"none", border:"none", color:T.gold, fontWeight:600, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
              {mode==="login"?"S'inscrire":"Se connecter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ vehicles }) {
  const revenue = PAYMENTS.filter(p=>p.status==="encaissé").reduce((a,p)=>a+p.amount,0);
  const revCount = useCounter(revenue, 1300);
  const activeRentals = RENTALS.filter(r=>r.status==="en cours");
  const DAYS=28, MS=new Date("2025-02-01");

  return (
    <Page title="Tableau de bord" sub={`${new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})} · Bienvenue sur Loqar`}
      actions={<Btn label="Nouvelle location" variant="primary" icon={Icons.plus}/>}>

      {/* ── Hero revenue banner ── */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:18, padding:"32px 36px", marginBottom:22, position:"relative", overflow:"hidden" }}>
        {/* Warm diagonal sweep */}
        <div style={{ position:"absolute", inset:0, background:`linear-gradient(115deg,${T.gold}08 0%,transparent 55%)`, pointerEvents:"none" }}/>
        {/* Car silhouette watermark */}
        <div style={{ position:"absolute", right:220, top:"50%", transform:"translateY(-50%)", opacity:.05, pointerEvents:"none" }}>
          <CarSilhouette cat="Premium" color={T.cream} size={380}/>
        </div>

        <div style={{ position:"relative", display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:30, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:T.muted, letterSpacing:".12em", textTransform:"uppercase", marginBottom:10 }}>Revenus encaissés · Février 2025</div>
            <div style={{ fontSize:62, fontWeight:700, letterSpacing:"-0.04em", color:T.gold, lineHeight:1, fontVariantNumeric:"tabular-nums" }}>
              {fmt(revCount)} <span style={{ fontSize:28, color:T.sub }}>€</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:12 }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:T.success+"18", border:`1px solid ${T.success}30`, color:T.success, padding:"4px 12px", borderRadius:99, fontSize:11, fontWeight:600 }}>
                {Icons.trend} +18% vs janvier
              </span>
              <span style={{ fontSize:12, color:T.muted }}>{PAYMENTS.filter(p=>p.status==="encaissé").length} transactions</span>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
            <div style={{ fontSize:10, color:T.muted, letterSpacing:".1em", textTransform:"uppercase" }}>Évolution 12 mois</div>
            <Sparkline data={REVENUE} w={190} h={48}/>
            <div style={{ display:"flex", justifyContent:"space-between", width:190 }}>
              {["Mar '24","—","Fév '25"].map(m=><span key={m} style={{ fontSize:9, color:T.muted }}>{m}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:22 }}>
        {[
          {label:"Locations actives", value:activeRentals.length, color:T.gold,    icon:Icons.calendar, sub:"En cours"},
          {label:"Véhicules disponibles", value:vehicles.filter(v=>v.status==="disponible").length, color:T.success, icon:Icons.car, sub:`Sur ${vehicles.length} total`},
          {label:"Clients", value:CLIENTS.length, color:T.blue, icon:Icons.users, sub:"Dont 1 liste noire"},
        ].map(s=>{
          const c = useCounter(s.value, 900);
          return (
            <Card key={s.label}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:T.muted, letterSpacing:".08em", textTransform:"uppercase", marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontSize:34, fontWeight:700, color:s.color, letterSpacing:"-0.03em", lineHeight:1 }}>{c}</div>
                  {s.sub && <div style={{ fontSize:11, color:T.muted, marginTop:5 }}>{s.sub}</div>}
                </div>
                <div style={{ width:40, height:40, borderRadius:10, background:s.color+"15", display:"flex", alignItems:"center", justifyContent:"center", color:s.color, flexShrink:0 }}>{s.icon}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Gantt + side ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 350px", gap:18 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div>
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:2, color:T.text }}>Calendrier des locations</h3>
              <p style={{ fontSize:12, color:T.sub }}>Février 2025 · Vue Gantt</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:T.success }}/>
              <span style={{ fontSize:11, color:T.muted }}>Aujourd'hui : 22 fév</span>
            </div>
          </div>
          {/* Day ruler */}
          <div style={{ display:"flex", marginLeft:108, marginBottom:6 }}>
            {Array.from({length:DAYS},(_,i)=>i+1).map(d=>(
              <div key={d} style={{ flex:1, textAlign:"center", fontSize:9, color:d===22?T.gold:T.muted, fontWeight:d===22?700:400, minWidth:13 }}>{d%5===0||d===1||d===22?d:""}</div>
            ))}
          </div>
          {vehicles.map(v=>(
            <div key={v.id} style={{ display:"flex", alignItems:"center", marginBottom:9 }}>
              <div style={{ width:108, flexShrink:0, display:"flex", alignItems:"center", gap:7, paddingRight:10 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", flexShrink:0, background:v.status==="disponible"?T.success:v.status==="en location"?T.gold:T.red }}/>
                <span style={{ fontSize:11, color:T.sub, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.name.replace("Classe ","").replace("Série ","")}</span>
              </div>
              <div style={{ flex:1, height:26, background:T.card2, borderRadius:7, position:"relative", overflow:"hidden" }}>
                {/* Today */}
                <div style={{ position:"absolute", left:`${((22-1)/DAYS)*100}%`, top:0, bottom:0, width:1, background:T.gold+"70", zIndex:2 }}/>
                {RENTALS.filter(r=>r.vehicleId===v.id).map(r=>{
                  const sd=Math.max(0,(new Date(r.startDate)-MS)/86400000);
                  const ed=Math.min(DAYS,(new Date(r.endDate)-MS)/86400000);
                  if(ed<0||sd>DAYS)return null;
                  const col=r.status==="en cours"?T.gold:r.status==="réservée"?T.blue:T.muted;
                  const cl=CLIENTS.find(c=>c.id===r.clientId);
                  return (
                    <div key={r.id}
                      style={{ position:"absolute", left:`${(sd/DAYS)*100}%`, width:`${((ed-sd)/DAYS)*100}%`, top:2, bottom:2, background:col+"20", border:`1px solid ${col}50`, borderRadius:5, display:"flex", alignItems:"center", padding:"0 7px", fontSize:10, fontWeight:600, color:col, whiteSpace:"nowrap", overflow:"hidden", cursor:"pointer" }}
                      onMouseEnter={e=>e.currentTarget.style.background=col+"35"}
                      onMouseLeave={e=>e.currentTarget.style.background=col+"20"}>
                      {cl?.firstName}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>

        {/* Side */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Card>
            <h3 style={{ fontSize:14, fontWeight:700, marginBottom:14, color:T.text }}>Locations en cours</h3>
            {activeRentals.length===0 && <p style={{ fontSize:13, color:T.muted, textAlign:"center", padding:"20px 0" }}>Aucune location active</p>}
            {activeRentals.map(r=>{
              const cl=CLIENTS.find(c=>c.id===r.clientId), veh=vehicles.find(v=>v.id===r.vehicleId);
              const dl=Math.ceil((new Date(r.endDate)-new Date())/86400000);
              return (
                <div key={r.id}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:T.card2, borderRadius:10, marginBottom:7, cursor:"pointer", transition:"background .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#2A2824"}
                  onMouseLeave={e=>e.currentTarget.style.background=T.card2}>
                  <Avatar name={`${cl?.firstName} ${cl?.lastName}`} size={32}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cl?.firstName} {cl?.lastName}</div>
                    <div style={{ fontSize:11, color:T.muted }}>{veh?.name}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:T.gold }}>{r.total} €</div>
                    <div style={{ fontSize:10, color:dl<=2?T.red:T.muted }}>J-{dl}</div>
                  </div>
                </div>
              );
            })}
          </Card>

          <Card>
            <h3 style={{ fontSize:14, fontWeight:700, marginBottom:14, color:T.text }}>Alertes</h3>
            {[
              {msg:"Permis Emma Leroy expiré",         c:T.red,   icon:Icons.alert},
              {msg:"Paiement en retard — Emma Leroy",  c:T.red,   icon:Icons.dollar},
              {msg:"BMW Série 3 en entretien",          c:T.amber, icon:Icons.car},
              {msg:"Permis Thomas Martin : 72 jours",  c:T.amber, icon:Icons.key},
            ].map((a,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:9, marginBottom:5, background:a.c+"0C", border:`1px solid ${a.c}25` }}>
                <span style={{ color:a.c, flexShrink:0 }}>{a.icon}</span>
                <span style={{ fontSize:12, color:T.sub }}>{a.msg}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </Page>
  );
}

// ─── VEHICLES ─────────────────────────────────────────────────────────────────
function Vehicles({ vehicles, setVehicles }) {
  const [sel, setSel]       = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({name:"",plate:"",fuel:"Essence",trans:"Manuelle",km:"",price:"",year:"",cat:"Citadine"});

  const filtered = vehicles.filter(v=>{
    if(filter!=="all" && v.status!==filter) return false;
    if(search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.plate.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Page title="Véhicules" sub={`${vehicles.length} véhicules dans votre flotte`}
      actions={<Btn label="Ajouter un véhicule" variant="primary" icon={Icons.plus} onClick={()=>setModal(true)}/>}>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:22, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:180, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, pointerEvents:"none" }}>{Icons.search}</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Chercher un véhicule ou immatriculation…"
            style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"9px 12px 9px 36px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
        </div>
        {[["all","Tous"],["disponible","Disponible"],["en location","En location"],["entretien","Entretien"]].map(([k,l])=>{
          const cnt=k==="all"?vehicles.length:vehicles.filter(v=>v.status===k).length;
          const active=filter===k;
          return (
            <button key={k} onClick={()=>setFilter(k)}
              style={{ padding:"8px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", background:active?T.goldDim:T.card, border:`1px solid ${active?T.gold:T.border}`, color:active?T.gold:T.sub, transition:"all .15s", fontFamily:"inherit" }}>
              {l} ({cnt})
            </button>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:20 }}>
        {/* Grid */}
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(236px,1fr))", gap:16, alignContent:"start" }}>
          {filtered.map(v=>{
            const selected = sel?.id===v.id;
            return (
              <div key={v.id} onClick={()=>setSel(selected?null:v)}
                style={{ background:T.card, border:`1px solid ${selected?T.gold:T.border}`, borderRadius:16, overflow:"hidden", cursor:"pointer", transition:"all .22s" }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 16px 50px #00000060"; e.currentTarget.style.borderColor=selected?T.gold:T.border2; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor=selected?T.gold:T.border; }}>

                {/* Vehicle art — warm gradient stage */}
                <div style={{ height:130, background:`linear-gradient(160deg,${T.card2} 0%,${T.surface} 100%)`, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                  {/* Warm glow under car */}
                  <div style={{ position:"absolute", bottom:-20, left:"50%", transform:"translateX(-50%)", width:160, height:60, borderRadius:"50%", background:`${T.gold}18`, filter:"blur(20px)", pointerEvents:"none" }}/>
                  <CarSilhouette cat={v.cat} color={T.gold} size={160}/>
                  {/* Status top-right */}
                  <div style={{ position:"absolute", top:10, right:10 }}><StatusBadge status={v.status}/></div>
                  {/* Category label bottom-left */}
                  <div style={{ position:"absolute", bottom:8, left:12, fontSize:10, color:T.muted, letterSpacing:".08em", textTransform:"uppercase", fontWeight:600 }}>{v.cat}</div>
                  {/* Price bottom-right */}
                  <div style={{ position:"absolute", bottom:8, right:12, fontSize:17, fontWeight:700, color:T.gold, letterSpacing:"-0.02em" }}>{v.price}€/j</div>
                </div>

                {/* Info */}
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:2, color:T.text }}>{v.name}</div>
                  <div style={{ fontSize:11, color:T.muted, fontFamily:"monospace", marginBottom:10, letterSpacing:".04em" }}>{v.plate}</div>
                  <div style={{ display:"flex", gap:5, marginBottom:12, flexWrap:"wrap" }}>
                    <Badge label={v.fuel} color={T.sub} bg={T.card2}/>
                    <Badge label={v.trans} color={T.sub} bg={T.card2}/>
                    <Badge label={String(v.year)} color={T.sub} bg={T.card2}/>
                  </div>
                  <div style={{ fontSize:11, color:T.muted, marginBottom:6 }}>{fmt(v.km)} km parcourus</div>
                  <ProgressBar value={v.km} max={150000} color={v.km>100000?T.red:v.km>70000?T.amber:T.gold}/>
                </div>
              </div>
            );
          })}
          {!filtered.length && (
            <div style={{ gridColumn:"1/-1", textAlign:"center", padding:80, color:T.muted }}>
              <div style={{ display:"flex", justifyContent:"center", opacity:.3, marginBottom:12 }}><CarSilhouette cat="Berline" color={T.muted} size={100}/></div>
              Aucun véhicule trouvé
            </div>
          )}
        </div>

        {/* Detail panel */}
        {sel && (
          <div style={{ width:294, flexShrink:0, animation:"slideIn .25s" }}>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden", position:"sticky", top:36 }}>
              {/* Art */}
              <div style={{ height:150, background:`linear-gradient(160deg,${T.card2},${T.surface})`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                <div style={{ position:"absolute", bottom:-10, left:"50%", transform:"translateX(-50%)", width:180, height:60, background:`${T.gold}15`, borderRadius:"50%", filter:"blur(20px)" }}/>
                <CarSilhouette cat={sel.cat} color={T.gold} size={190}/>
                <button onClick={()=>setSel(null)} style={{ position:"absolute", top:10, right:10, background:T.card+"CC", border:"none", borderRadius:7, padding:5, color:T.sub, cursor:"pointer", display:"flex" }}>{Icons.x}</button>
              </div>
              <div style={{ padding:20 }}>
                <div style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.02em", marginBottom:3, color:T.text }}>{sel.name}</div>
                <div style={{ marginBottom:14 }}><StatusBadge status={sel.status}/></div>
                <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                  {[["Immatriculation",sel.plate],["Carburant",sel.fuel],["Transmission",sel.trans],["Kilométrage",fmt(sel.km)+" km"],["Prix / jour",sel.price+" €"],["Année",sel.year]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${T.border}` }}>
                      <span style={{ fontSize:12, color:T.muted }}>{k}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:T.text }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:14, padding:14, background:T.card2, borderRadius:11 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:11, color:T.muted }}>Usure kilométrique</span>
                    <span style={{ fontSize:11, fontWeight:700, color:sel.km>100000?T.red:sel.km>70000?T.amber:T.gold }}>{Math.round((sel.km/150000)*100)}%</span>
                  </div>
                  <ProgressBar value={sel.km} max={150000} color={sel.km>100000?T.red:sel.km>70000?T.amber:T.gold}/>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:14 }}>
                  <Btn label="Modifier" variant="secondary" icon={Icons.edit} style={{ flex:1, justifyContent:"center" }}/>
                  <Btn variant="danger" icon={Icons.trash} style={{ padding:"9px 11px" }}/>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Ajouter un véhicule" onClose={()=>setModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ gridColumn:"1/-1" }}><Input label="Nom du véhicule" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="Renault Clio"/></div>
            <Input label="Immatriculation" value={form.plate} onChange={v=>setForm({...form,plate:v})} placeholder="AB-123-CD"/>
            <Input label="Année" type="number" value={form.year} onChange={v=>setForm({...form,year:v})} placeholder="2023"/>
            <Input label="Kilométrage" type="number" value={form.km} onChange={v=>setForm({...form,km:v})} placeholder="15000"/>
            <Input label="Prix / jour (€)" type="number" value={form.price} onChange={v=>setForm({...form,price:v})} placeholder="65"/>
            {[["Carburant","fuel",["Essence","Diesel","Hybride","Électrique"]],["Transmission","trans",["Manuelle","Automatique"]],["Catégorie","cat",["Citadine","Compacte","Berline","Premium","SUV"]]].map(([lbl,key,opts])=>(
              <div key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{lbl}</label>
                <select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                  style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                  {opts.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:22 }}>
            <Btn label="Annuler" onClick={()=>setModal(false)} variant="secondary"/>
            <Btn label="Ajouter" onClick={()=>{ setVehicles([...vehicles,{...form,id:Date.now(),km:parseInt(form.km)||0,price:parseInt(form.price)||0,year:parseInt(form.year)||2023}]); setModal(false); }} variant="primary"/>
          </div>
        </Modal>
      )}
    </Page>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
function Clients({ clients, setClients }) {
  const [sel,  setSel]    = useState(null);
  const [search, setSearch]= useState("");
  const [modal, setModal]  = useState(false);
  const [form, setForm]    = useState({firstName:"",lastName:"",email:"",phone:"",type:"particulier",licenseExpiry:""});
  const filtered = clients.filter(c=>!search||`${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <Page title="Clients" sub={`${clients.length} clients enregistrés`}
      actions={<Btn label="Nouveau client" variant="primary" icon={Icons.plus} onClick={()=>setModal(true)}/>}>
      <div style={{ position:"relative", marginBottom:16 }}>
        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, pointerEvents:"none" }}>{Icons.search}</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un client…"
          style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px 10px 36px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
      </div>

      <div style={{ display:"flex", gap:20 }}>
        <div style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Client","Contact","Permis","Locations","Total dépensé","Type"].map(l=>(
                  <th key={l} style={{ textAlign:"left", padding:"11px 16px", fontSize:10, fontWeight:700, color:T.muted, letterSpacing:".1em", textTransform:"uppercase", borderBottom:`1px solid ${T.border}` }}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c=>{
                const exp=isExpired(c.licenseExpiry), selected=sel?.id===c.id;
                return (
                  <tr key={c.id} onClick={()=>setSel(selected?null:c)}
                    style={{ cursor:"pointer", background:selected?T.goldDim:"transparent", transition:"background .1s" }}
                    onMouseEnter={e=>{if(!selected)e.currentTarget.style.background=T.card2}}
                    onMouseLeave={e=>{if(!selected)e.currentTarget.style.background=selected?T.goldDim:"transparent"}}>
                    <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <Avatar name={`${c.firstName} ${c.lastName}`} size={34}/>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{c.firstName} {c.lastName}</div>
                          {c.blacklist && <Badge label="Liste noire" color={T.red}/>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:12, color:T.sub }}>{c.email}</td>
                    <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                      <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:exp?T.red:T.sub }}>
                        {exp && <span style={{ color:T.red }}>{Icons.alert}</span>}
                        {fmtDate(c.licenseExpiry)}
                      </span>
                    </td>
                    <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:13, fontWeight:600, color:T.text }}>{c.locations}</td>
                    <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:13, fontWeight:700, color:T.gold }}>{fmt(c.totalSpent)} €</td>
                    <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                      <Badge label={c.type==="entreprise"?"Entreprise":"Particulier"} color={c.type==="entreprise"?T.blue:T.sub}/>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sel && (
          <div style={{ width:274, flexShrink:0, animation:"slideIn .25s" }}>
            <Card>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
                <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Fiche client</div>
                <Btn variant="ghost" icon={Icons.x} onClick={()=>setSel(null)} style={{ padding:5 }}/>
              </div>
              <div style={{ textAlign:"center", marginBottom:18 }}>
                <Avatar name={`${sel.firstName} ${sel.lastName}`} size={52}/>
                <div style={{ marginTop:12, fontSize:17, fontWeight:700, letterSpacing:"-0.02em", color:T.text }}>{sel.firstName} {sel.lastName}</div>
                {sel.company && <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{sel.company}</div>}
                {sel.blacklist && <div style={{ marginTop:8 }}><Badge label="Liste noire" color={T.red}/></div>}
              </div>
              {[[Icons.mail,sel.email,false],[Icons.phone,sel.phone||"—",false],[Icons.key,`Permis : ${fmtDate(sel.licenseExpiry)}`,isExpired(sel.licenseExpiry)]].map(([icon,val,red],i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 10px", background:T.card2, borderRadius:9, marginBottom:6 }}>
                  <span style={{ color:T.muted, flexShrink:0 }}>{icon}</span>
                  <span style={{ fontSize:12, color:red?T.red:T.sub }}>{val}</span>
                </div>
              ))}
              <div style={{ marginTop:14, padding:14, background:T.goldDim, border:`1px solid ${T.gold}25`, borderRadius:11 }}>
                <div style={{ fontSize:11, color:T.muted, marginBottom:4 }}>Total dépensé</div>
                <div style={{ fontSize:26, fontWeight:700, color:T.gold, letterSpacing:"-0.03em" }}>{fmt(sel.totalSpent)} €</div>
              </div>
              <Btn label="Modifier" variant="secondary" icon={Icons.edit} full style={{ marginTop:14 }}/>
            </Card>
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Nouveau client" onClose={()=>setModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Input label="Prénom" value={form.firstName} onChange={v=>setForm({...form,firstName:v})} placeholder="Marie"/>
            <Input label="Nom" value={form.lastName} onChange={v=>setForm({...form,lastName:v})} placeholder="Dupont"/>
            <div style={{ gridColumn:"1/-1" }}><Input label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="marie@email.fr"/></div>
            <Input label="Téléphone" value={form.phone} onChange={v=>setForm({...form,phone:v})} placeholder="+33 6 …"/>
            <Input label="Expiration du permis" type="date" value={form.licenseExpiry} onChange={v=>setForm({...form,licenseExpiry:v})}/>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:22 }}>
            <Btn label="Annuler" onClick={()=>setModal(false)} variant="secondary"/>
            <Btn label="Créer le client" onClick={()=>{ setClients([...clients,{...form,id:Date.now(),locations:0,totalSpent:0}]); setModal(false); }} variant="primary"/>
          </div>
        </Modal>
      )}
    </Page>
  );
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
function Payments() {
  const [filter, setFilter] = useState("all");
  const stats=[
    {label:"Encaissé",  value:PAYMENTS.filter(p=>p.status==="encaissé").reduce((a,p)=>a+p.amount,0),   color:T.success, icon:Icons.check },
    {label:"En attente",value:PAYMENTS.filter(p=>p.status==="en attente").reduce((a,p)=>a+p.amount,0), color:T.amber,   icon:Icons.clock  },
    {label:"En retard", value:PAYMENTS.filter(p=>p.status==="en retard").reduce((a,p)=>a+p.amount,0),  color:T.red,     icon:Icons.alert  },
    {label:"Cautions",  value:PAYMENTS.reduce((a,p)=>a+p.deposit,0),                                   color:T.blue,    icon:Icons.shield },
  ];

  return (
    <Page title="Paiements" sub="Encaissements, transactions et cautions">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {stats.map(s=>{ const c=useCounter(s.value,900); return (
          <Card key={s.label}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:T.muted, letterSpacing:".08em", textTransform:"uppercase", marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:26, fontWeight:700, color:s.color, letterSpacing:"-0.03em" }}>{fmt(c)} €</div>
              </div>
              <div style={{ width:38, height:38, borderRadius:9, background:s.color+"15", display:"flex", alignItems:"center", justifyContent:"center", color:s.color }}>{s.icon}</div>
            </div>
          </Card>
        );})}
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {[["all","Toutes"],["encaissé","Encaissé"],["en attente","En attente"],["en retard","En retard"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)}
            style={{ padding:"7px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", background:filter===k?T.goldDim:T.card, border:`1px solid ${filter===k?T.gold:T.border}`, color:filter===k?T.gold:T.sub, transition:"all .15s", fontFamily:"inherit" }}>{l}</button>
        ))}
      </div>

      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>{["Client","Montant","Caution","Méthode","Date","Statut",""].map(l=>(
              <th key={l} style={{ textAlign:"left", padding:"10px 16px", fontSize:10, fontWeight:700, color:T.muted, letterSpacing:".1em", textTransform:"uppercase", borderBottom:`1px solid ${T.border}` }}>{l}</th>
            ))}</tr>
          </thead>
          <tbody>
            {PAYMENTS.filter(p=>filter==="all"||p.status===filter).map(p=>(
              <tr key={p.id} style={{ transition:"background .1s" }}
                onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar name={p.client} size={32}/>
                    <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{p.client}</span>
                  </div>
                </td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:15, fontWeight:700, color:T.gold }}>{fmt(p.amount)} €</td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:13, color:T.sub }}>{fmt(p.deposit)} €</td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:12, color:T.sub }}>{p.method}</td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:12, color:T.muted }}>{fmtDate(p.paidAt)}</td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}><StatusBadge status={p.status}/></td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                  {p.status!=="encaissé" && <Btn label="Encaisser" variant="outline" size="sm"/>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
function Documents() {
  const [docType, setDocType] = useState("contrat");
  const [p, setP] = useState({client:"Marie Dupont",vehicle:"Mercedes Classe A",startDate:"2025-02-10",endDate:"2025-02-17",price:"85",deposit:"500",km:"24000",notes:""});
  const up = (k,v) => setP(prev=>({...prev,[k]:v}));
  const days  = Math.ceil((new Date(p.endDate)-new Date(p.startDate))/86400000);
  const total = (parseInt(p.price)||0)*(days>0?days:0);

  return (
    <Page title="Documents" sub="Générez contrats, devis et factures en temps réel">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:26 }}>
        {[{id:"devis",l:"Devis",d:"Proposition de prix"},{id:"contrat",l:"Contrat",d:"Location auto"},{id:"etat",l:"État des lieux",d:"Avant / Après"},{id:"facture",l:"Facture",d:"Document officiel"}].map(dt=>{
          const active=docType===dt.id;
          return (
            <div key={dt.id} onClick={()=>setDocType(dt.id)}
              style={{ background:active?T.goldDim:T.card, border:`1px solid ${active?T.gold:T.border}`, borderRadius:14, padding:16, cursor:"pointer", transition:"all .15s", textAlign:"center" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=active?T.gold:T.border2}
              onMouseLeave={e=>e.currentTarget.style.borderColor=active?T.gold:T.border}>
              <div style={{ fontSize:14, fontWeight:700, color:active?T.gold:T.text, marginBottom:3 }}>{dt.l}</div>
              <div style={{ fontSize:11, color:T.muted }}>{dt.d}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"290px 1fr", gap:22 }}>
        <div>
          <Card>
            <div style={{ fontSize:11, fontWeight:700, color:T.muted, letterSpacing:".1em", textTransform:"uppercase", marginBottom:16 }}>Paramètres</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[["Client","client","text"],["Véhicule","vehicle","text"],["Prix/jour (€)","price","number"],["Caution (€)","deposit","number"],["Kilométrage","km","number"]].map(([lbl,key,type])=>(
                <Input key={key} label={lbl} value={p[key]} onChange={v=>up(key,v)} type={type}/>
              ))}
              <Input label="Début" type="date" value={p.startDate} onChange={v=>up("startDate",v)}/>
              <Input label="Fin" type="date" value={p.endDate} onChange={v=>up("endDate",v)}/>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Notes</label>
                <textarea value={p.notes} onChange={e=>up("notes",e.target.value)} rows={3}
                  style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.6 }}/>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:18 }}>
              <Btn label="Télécharger PDF" variant="primary" icon={Icons.download} full/>
              <Btn label="Envoyer par email" variant="secondary" icon={Icons.mail} full/>
            </div>
          </Card>

          <Card style={{ marginTop:14 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:12 }}>Documents récents</div>
            {[["Contrat","Marie Dupont","10/02/2025","Signé"],["Facture","Thomas Martin","27/01/2025","Envoyé"],["État des lieux","Emma Leroy","04/02/2025","Complété"]].map(([type,client,date,status])=>(
              <div key={date}
                style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 10px", background:T.card2, borderRadius:9, marginBottom:6, cursor:"pointer", transition:"background .15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#2A2824"}
                onMouseLeave={e=>e.currentTarget.style.background=T.card2}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:T.text }}>{type} · {client}</div>
                  <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>{date}</div>
                </div>
                <Badge label={status} color={T.success}/>
              </div>
            ))}
          </Card>
        </div>

        {/* Live preview */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Aperçu en direct</div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:T.success, animation:"pulse 2s infinite" }}/>
              <span style={{ fontSize:11, color:T.success }}>Live</span>
            </div>
          </div>
          <div style={{ background:"#FDFBF7", borderRadius:14, padding:30, color:"#1A1510", fontSize:12, lineHeight:1.7, boxShadow:"0 2px 30px #00000025" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:26, paddingBottom:16, borderBottom:"1.5px solid #1A1510" }}>
              <div>
                <div style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.03em", color:"#1A1510" }}>LOQAR</div>
                <div style={{ fontSize:9, color:"#888", letterSpacing:".1em", textTransform:"uppercase", marginTop:2 }}>Location Automobile Professionnelle</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:15, fontWeight:700, letterSpacing:"0.04em", textTransform:"uppercase", color:"#1A1510" }}>{{devis:"Devis",contrat:"Contrat de Location",etat:"État des Lieux",facture:"Facture"}[docType]}</div>
                <div style={{ fontSize:10, color:"#888", marginTop:2 }}>N° LQ-2025-0042 · {new Date().toLocaleDateString("fr-FR")}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
              {[["Client",p.client||"—"],["Véhicule",p.vehicle||"—"],["Période",days>0?`${fmtDate(p.startDate)} → ${fmtDate(p.endDate)} (${days}j)`:"—"],["Km départ",p.km?fmt(parseInt(p.km))+" km":"—"]].map(([lbl,val])=>(
                <div key={lbl} style={{ padding:"10px 12px", background:"#F5F0E8", borderRadius:6 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".1em", marginBottom:3 }}>{lbl}</div>
                  <div style={{ fontWeight:700, color:"#1A1510", fontSize:12 }}>{val}</div>
                </div>
              ))}
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:16 }}>
              <thead>
                <tr style={{ background:"#1A1510" }}>
                  {[["Description","left"],["Qté","right"],["P.U.","right"],["Total","right"]].map(([l,a])=>(
                    <th key={l} style={{ padding:"8px 12px", textAlign:a, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"#EDE5D4" }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[["Location véhicule",days>0?days+"j":"—",p.price?p.price+" €":"—",total>0?total+" €":"—"],["Caution","1",p.deposit?p.deposit+" €":"—",p.deposit?p.deposit+" €":"—"]].map(([desc,qty,pu,tot],i)=>(
                  <tr key={i} style={{ background:i%2===0?"#fff":"#FAF7F0" }}>
                    <td style={{ padding:"8px 12px", fontSize:12, color:"#1A1510" }}>{desc}</td>
                    <td style={{ padding:"8px 12px", fontSize:12, color:"#666", textAlign:"right" }}>{qty}</td>
                    <td style={{ padding:"8px 12px", fontSize:12, color:"#666", textAlign:"right" }}>{pu}</td>
                    <td style={{ padding:"8px 12px", fontSize:12, fontWeight:700, color:"#1A1510", textAlign:"right" }}>{tot}</td>
                  </tr>
                ))}
                <tr style={{ background:"#1A1510" }}>
                  <td colSpan={3} style={{ padding:"10px 12px", fontWeight:700, textAlign:"right", color:"#EDE5D4", letterSpacing:".04em", textTransform:"uppercase" }}>Total TTC</td>
                  <td style={{ padding:"10px 12px", fontWeight:700, textAlign:"right", fontSize:15, color:T.gold }}>{total>0?total+" €":"—"}</td>
                </tr>
              </tbody>
            </table>
            {p.notes && (
              <div style={{ padding:"10px 12px", background:"#F5F0E8", borderRadius:6, borderLeft:`3px solid ${T.gold}`, marginBottom:14 }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".1em", marginBottom:3 }}>Notes</div>
                <div style={{ fontSize:12, color:"#444" }}>{p.notes}</div>
              </div>
            )}
            <div style={{ marginTop:24, display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, paddingTop:16, borderTop:"1px solid #DDD5C8" }}>
              {["Signature du loueur","Signature du locataire"].map(l=>(
                <div key={l}>
                  <div style={{ fontSize:10, color:"#888", marginBottom:16 }}>{l} :</div>
                  <div style={{ height:34, borderBottom:"1px solid #C8B89A" }}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

// ─── PRICING ─────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id:"starter", name:"Starter", tagline:"Pour démarrer seul",
    monthlyPrice:49, annualPrice:39, color:T.blue, colorDim:T.blueDim,
    highlight:false, cta:"Commencer l'essai", note:"14 jours · Aucune CB requise",
    features:[
      {t:"Jusqu'à 3 véhicules",ok:true},{t:"Clients illimités",ok:true},
      {t:"Contrats & état des lieux PDF",ok:true},{t:"Suivi des paiements",ok:true},
      {t:"Vue Gantt du calendrier",ok:true},{t:"Alertes permis expirés",ok:true},
      {t:"1 utilisateur",ok:true},{t:"Rapports avancés",ok:false},
      {t:"Export comptable",ok:false},{t:"API & webhooks",ok:false},{t:"Marque blanche",ok:false},
    ],
  },
  {
    id:"pro", name:"Pro", tagline:"Pour l'agence qui grandit", badge:"Le plus populaire",
    monthlyPrice:129, annualPrice:99, color:T.gold, colorDim:T.goldDim,
    highlight:true, cta:"Essayer le Pro", note:"14 jours · Aucune CB requise",
    features:[
      {t:"Jusqu'à 15 véhicules",ok:true},{t:"Clients illimités",ok:true},
      {t:"Contrats & état des lieux PDF",ok:true},{t:"Suivi des paiements",ok:true},
      {t:"Vue Gantt du calendrier",ok:true},{t:"Alertes permis expirés",ok:true},
      {t:"Jusqu'à 3 utilisateurs",ok:true},{t:"Rapports avancés",ok:true},
      {t:"Export comptable CSV",ok:true},{t:"API & webhooks",ok:false},{t:"Marque blanche",ok:false},
    ],
  },
  {
    id:"agence", name:"Agence", tagline:"Pour les structures multi-sites",
    monthlyPrice:249, annualPrice:199, color:T.amber, colorDim:T.amberDim,
    highlight:false, cta:"Nous contacter", note:"Onboarding personnalisé inclus",
    features:[
      {t:"Véhicules illimités",ok:true},{t:"Clients illimités",ok:true},
      {t:"Contrats & état des lieux PDF",ok:true},{t:"Suivi des paiements",ok:true},
      {t:"Vue Gantt du calendrier",ok:true},{t:"Alertes permis expirés",ok:true},
      {t:"Utilisateurs illimités",ok:true},{t:"Rapports avancés",ok:true},
      {t:"Export comptable CSV + ERP",ok:true},{t:"API & webhooks",ok:true},{t:"Marque blanche",ok:true},
    ],
  },
];

const FAQS_P = [
  {q:"Puis-je changer de plan à tout moment ?", a:"Oui, sans engagement. Passage au plan supérieur immédiat, retour au plan inférieur à la fin de la période en cours."},
  {q:"Qu'inclut l'essai de 14 jours ?", a:"Accès complet à toutes les fonctionnalités du plan choisi. Aucune carte bancaire requise pour démarrer."},
  {q:"Le plan locataire est-il vraiment gratuit ?", a:"Oui. Vos clients accèdent gratuitement à leur espace : contrats, signature électronique, historique de locations."},
  {q:"Y a-t-il des frais sur les paiements ?", a:"Une commission de 0,8% s'applique uniquement si vous utilisez l'encaissement intégré via Stripe."},
  {q:"Mes données sont-elles sécurisées ?", a:"Hébergement France, chiffrement AES-256, conformité RGPD complète."},
];

function PlanCard({ plan, annual }) {
  const [hov, setHov] = useState(false);
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const savings = plan.monthlyPrice - plan.annualPrice;
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ position:"relative", background:plan.highlight?T.card2:T.card, border:`1.5px solid ${plan.highlight?plan.color:hov?T.border2:T.border}`, borderRadius:16, padding:"26px 22px", display:"flex", flexDirection:"column", transform:plan.highlight?"scale(1.03)":hov?"translateY(-3px)":"none", boxShadow:plan.highlight?`0 20px 60px ${plan.color}15`:hov?"0 8px 32px #00000040":"none", transition:"all .2s", zIndex:plan.highlight?2:1 }}>
      {plan.badge && (
        <div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", background:plan.color, color:T.bg, fontSize:11, fontWeight:700, padding:"3px 14px", borderRadius:99, whiteSpace:"nowrap", letterSpacing:".04em" }}>
          ⭐ {plan.badge}
        </div>
      )}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:16, fontWeight:700, color:plan.highlight?plan.color:T.text, marginBottom:3 }}>{plan.name}</div>
        <div style={{ fontSize:12, color:T.muted }}>{plan.tagline}</div>
      </div>
      <div style={{ marginBottom:6 }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
          <span style={{ fontSize:44, fontWeight:700, color:plan.color, letterSpacing:"-.04em", lineHeight:1 }}>{price}</span>
          <span style={{ fontSize:15, color:T.muted }}>€</span>
          <span style={{ fontSize:12, color:T.muted, marginLeft:2 }}>/mois</span>
        </div>
        {annual
          ? <div style={{ fontSize:11, color:T.success, marginTop:4, fontWeight:600 }}>Économisez {savings}€/mois · {price*12}€/an</div>
          : <div style={{ fontSize:11, color:T.muted, marginTop:4 }}>ou {plan.annualPrice}€/mois en annuel</div>
        }
      </div>
      <div style={{ height:1, background:T.border, margin:"16px 0" }}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:9, marginBottom:22 }}>
        {plan.features.map((f,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:17, height:17, borderRadius:"50%", background:f.ok?T.successDim:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {f.ok
                ? <Ic size={10} d="M20 6L9 17l-5-5" color={T.success} sw={2.5}/>
                : <Ic size={10} d="M18 6L6 18M6 6l12 12" color={T.muted} sw={2}/>
              }
            </div>
            <span style={{ fontSize:12, color:f.ok?T.sub:T.muted }}>{f.t}</span>
          </div>
        ))}
      </div>
      <button
        style={{ width:"100%", padding:"11px 16px", borderRadius:9, fontWeight:600, fontSize:13, fontFamily:"inherit", cursor:"pointer", transition:"all .15s", background:plan.highlight?plan.color:plan.colorDim, color:plan.highlight?T.bg:plan.color, border:`1px solid ${plan.color}40` }}
        onMouseEnter={e=>{e.currentTarget.style.background=plan.color; e.currentTarget.style.color=T.bg;}}
        onMouseLeave={e=>{e.currentTarget.style.background=plan.highlight?plan.color:plan.colorDim; e.currentTarget.style.color=plan.highlight?T.bg:plan.color;}}>
        {plan.cta} →
      </button>
      <div style={{ textAlign:"center", marginTop:8, fontSize:11, color:T.muted }}>{plan.note}</div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:`1px solid ${T.border}` }}>
      <button onClick={()=>setOpen(!open)}
        style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left", gap:16 }}>
        <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{q}</span>
        <div style={{ width:20, height:20, borderRadius:"50%", background:T.card2, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"transform .2s", transform:open?"rotate(45deg)":"none", color:T.muted }}>
          <Ic size={10} d="M12 5v14M5 12h14" color="currentColor" sw={2}/>
        </div>
      </button>
      <div style={{ maxHeight:open?160:0, overflow:"hidden", transition:"max-height .3s" }}>
        <p style={{ fontSize:12, color:T.sub, lineHeight:1.7, paddingBottom:14 }}>{a}</p>
      </div>
    </div>
  );
}

function Pricing() {
  const [annual, setAnnual] = useState(false);
  return (
    <Page title="Abonnements" sub="Choisissez le plan adapté à votre activité">
      {/* Toggle mensuel / annuel */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:40 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, background:T.card, border:`1px solid ${T.border}`, borderRadius:99, padding:"8px 20px" }}>
          <span style={{ fontSize:13, fontWeight:annual?400:600, color:annual?T.muted:T.text, transition:"all .2s" }}>Mensuel</span>
          <button onClick={()=>setAnnual(!annual)}
            style={{ width:44, height:24, borderRadius:99, background:annual?T.gold:T.border2, border:"none", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
            <div style={{ width:18, height:18, borderRadius:"50%", background:annual?"#0F0D0B":"#fff", position:"absolute", top:3, left:annual?23:3, transition:"left .2s", boxShadow:"0 1px 4px #00000040" }}/>
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:13, fontWeight:annual?600:400, color:annual?T.text:T.muted, transition:"all .2s" }}>Annuel</span>
            <span style={{ background:T.successDim, border:`1px solid ${T.success}25`, color:T.success, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:99 }}>−24%</span>
          </div>
        </div>
      </div>

      {/* Cartes plans */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:48, alignItems:"start" }}>
        {PLANS.map(plan=><PlanCard key={plan.id} plan={plan} annual={annual}/>)}
      </div>

      {/* Locataire gratuit */}
      <div style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:14, padding:"22px 28px", marginBottom:48, display:"flex", alignItems:"center", justifyContent:"space-between", gap:24, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:42, height:42, borderRadius:11, background:T.successDim, border:`1px solid ${T.success}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Ic size={20} color={T.success} sw={1.5} paths={["M20 12v10H4V12","M2 7h20v5H2z","M12 22V7","M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z","M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"]}/>
          </div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <span style={{ fontSize:15, fontWeight:700, color:T.text }}>Espace locataire — 100% gratuit</span>
              <Badge label="GRATUIT" color={T.success}/>
            </div>
            <p style={{ fontSize:12, color:T.sub, lineHeight:1.6, maxWidth:500 }}>Vos clients consultent leurs contrats, signent électroniquement et accèdent à leur historique. Inclus dans tous les plans.</p>
          </div>
        </div>
      </div>

      {/* Tableau comparatif */}
      <div style={{ marginBottom:48 }}>
        <h2 style={{ fontSize:18, fontWeight:700, letterSpacing:"-.02em", color:T.text, marginBottom:18 }}>Comparatif complet</h2>
        <Card style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:T.surface }}>
                <th style={{ padding:"12px 18px", textAlign:"left", fontSize:10, fontWeight:700, color:T.muted, letterSpacing:".08em", textTransform:"uppercase", borderBottom:`1px solid ${T.border}`, width:"38%" }}>Fonctionnalité</th>
                {PLANS.map(p=>(
                  <th key={p.id} style={{ padding:"12px 18px", textAlign:"center", fontSize:13, fontWeight:700, color:p.color, borderBottom:`1px solid ${T.border}` }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Véhicules","3","15","Illimité"],
                ["Clients","Illimité","Illimité","Illimité"],
                ["Contrats PDF","✓","✓","✓"],
                ["Paiements","✓","✓","✓"],
                ["Vue Gantt","✓","✓","✓"],
                ["Alertes permis","✓","✓","✓"],
                ["Utilisateurs","1","3","Illimité"],
                ["Rapports avancés","—","✓","✓"],
                ["Export comptable","—","CSV","CSV + ERP"],
                ["API & webhooks","—","—","✓"],
                ["Marque blanche","—","—","✓"],
                ["Support","Email","Email prioritaire","Téléphone dédié"],
                ["Prix mensuel","49 €","129 €","249 €"],
                ["Prix annuel","39 €/mois","99 €/mois","199 €/mois"],
              ].map(([feat,...vals],ri)=>(
                <tr key={ri} style={{ background:ri%2===0?"transparent":T.surface }}>
                  <td style={{ padding:"10px 18px", fontSize:12, color:T.sub, borderBottom:`1px solid ${T.border}`, fontWeight:500 }}>{feat}</td>
                  {vals.map((val,ci)=>(
                    <td key={ci} style={{ padding:"10px 18px", textAlign:"center", fontSize:12, borderBottom:`1px solid ${T.border}`, color:val==="—"?T.muted:val==="✓"?T.success:T.text, fontWeight:val==="—"?400:600 }}>
                      {val==="✓"
                        ? <div style={{ display:"flex", justifyContent:"center" }}><Ic size={13} d="M20 6L9 17l-5-5" color={T.success} sw={2.5}/></div>
                        : val
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth:680, marginBottom:48 }}>
        <h2 style={{ fontSize:18, fontWeight:700, letterSpacing:"-.02em", color:T.text, marginBottom:18 }}>Questions fréquentes</h2>
        <Card style={{ padding:"4px 22px" }}>
          {FAQS_P.map((f,i)=><FaqItem key={i} q={f.q} a={f.a}/>)}
        </Card>
      </div>

      {/* CTA final */}
      <div style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:16, padding:"40px 36px", textAlign:"center" }}>
        <div style={{ fontSize:24, fontWeight:700, letterSpacing:"-.03em", color:T.text, marginBottom:10 }}>Prêt à piloter votre flotte ?</div>
        <p style={{ fontSize:13, color:T.sub, marginBottom:24, lineHeight:1.7 }}>14 jours gratuits, aucune carte bancaire requise.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <Btn label="Démarrer gratuitement" variant="primary" size="lg"/>
          <Btn label="Voir une démo" variant="secondary" size="lg"/>
        </div>
        <div style={{ marginTop:14, fontSize:11, color:T.muted }}>✓ 14 jours gratuits · ✓ Aucune CB · ✓ Résiliation en 1 clic</div>
      </div>
    </Page>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const DEFAULT_AGENCY = { name:"", logo:"🚗", address:"", phone:"", email:"", website:"", siret:"", iban:"", bic:"", bankHolder:"", terms:"", franchise:"800 €" };

export default function App() {
  const [user,           setUser]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [page,           setPage]           = useState("dashboard");
  const [cmdOpen,        setCmdOpen]        = useState(false);
  const [vehicles,       setVehicles]       = useState([]);
  const [clients,        setClients]        = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [agencyProfile,  setAgencyProfile]  = useState(DEFAULT_AGENCY);
  const unread = NOTIFS.filter(n=>!n.read).length;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) { fetchData(session.user.id); fetchProfile(session.user.id); }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) { fetchData(session.user.id); fetchProfile(session.user.id); }
      else { setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async (uid) => {
    const [{ data: v }, { data: c }] = await Promise.all([
      supabase.from("vehicles").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("clients").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    ]);
    if (v) setVehicles(v.map(x => ({ ...x, trans: x.transmission, price: x.price_per_day, cat: x.category })));
    if (c) setClients(c.map(x => ({ ...x, firstName: x.first_name, lastName: x.last_name, licenseExpiry: x.license_expiry, totalSpent: x.total_spent, locations: x.locations_count })));
  };

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) setAgencyProfile({ name: data.agency_name||"", logo: data.logo||"🚗", address: data.address||"", phone: data.phone||"", email: data.email||"", website: data.website||"", siret: data.siret||"", iban: data.iban||"", bic: data.bic||"", bankHolder: data.bank_holder||"", terms: data.terms||"", franchise: data.franchise||"800 €" });
    if (!data?.agency_name) setShowOnboarding(true);
  };

  const handleSaveProfile = async (profile) => {
    setAgencyProfile(profile);
    await supabase.from("profiles").update({ agency_name: profile.name, logo: profile.logo, address: profile.address, phone: profile.phone, email: profile.email, website: profile.website, siret: profile.siret, iban: profile.iban, bic: profile.bic, bank_holder: profile.bankHolder, terms: profile.terms, franchise: profile.franchise }).eq("id", user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setVehicles([]); setClients([]); setAgencyProfile(DEFAULT_AGENCY);
  };

  useEffect(() => {
    const h = e => { if ((e.metaKey||e.ctrlKey) && e.key==="k") { e.preventDefault(); setCmdOpen(o=>!o); } };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{background:#141210;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#3A3733;border-radius:99px}
      input::placeholder{color:#5A5650}
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:T.bg }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:14, color:T.muted, marginTop:16 }}>Chargement…</div>
      </div>
    </div>
  );

  if (!user) return <AuthScreen />;

  const screens = {
    dashboard: <Dashboard vehicles={vehicles}/>,
    vehicles:  <Vehicles  vehicles={vehicles} setVehicles={setVehicles}/>,
    clients:   <Clients   clients={clients}   setClients={setClients}/>,
    payments:  <Payments/>,
    documents: <Documents agencyProfile={agencyProfile}/>,
    signature: <SignaturePage/>,
    pricing:   <Pricing/>,
    settings:  <Settings agencyProfile={agencyProfile} setAgencyProfile={handleSaveProfile}/>,
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {cmdOpen && <CommandBar onClose={()=>setCmdOpen(false)} onNav={p=>{ setPage(p); setCmdOpen(false); }}/>}
      {showOnboarding && <OnboardingScreen onDone={()=>setShowOnboarding(false)} onNav={p=>setPage(p)}/>}
      {notifOpen && <NotifPanel onClose={()=>setNotifOpen(false)}/>}
      <Sidebar page={page} onNav={p=>setPage(p)} user={user} onLogout={handleLogout} onCmd={()=>setCmdOpen(true)} vehicles={vehicles} onNotif={()=>setNotifOpen(o=>!o)} unreadCount={unread}/>
      <main style={{ flex:1, marginLeft:220, minHeight:"100vh" }}>
        <div key={page} style={{ animation:"fadeUp .3s" }}>{screens[page]}</div>
      </main>
    </div>
  );
}