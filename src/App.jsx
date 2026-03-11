import { useState, useEffect, useRef, createContext, useContext } from "react";
import { supabase } from "./supabase.js";

const TR = {
fr: {
  dashboard:"Tableau de bord", vehicles:"Véhicules", clients:"Clients",
  rentals:"Locations", payments:"Paiements", documents:"Documents",
  signatures:"Signatures", pricing:"Abonnements", settings:"Paramètres",
  welcome:"Bienvenue sur Loqar", newRental:"Nouvelle location",
  addVehicle:"Ajouter un véhicule", newClient:"Nouveau client",
  newPayment:"Nouveau paiement", save:"Enregistrer", cancel:"Annuler",
  delete:"Supprimer", edit:"Modifier", add:"Ajouter",
  search:"Rechercher…", available:"Disponible", rented:"En location",
  maintenance:"Entretien", inProgress:"En cours", reserved:"Réservée",
  completed:"Terminée", cancelled:"Annulée", collected:"Encaissé",
  pending:"En attente", late:"En retard", client:"Client", vehicle:"Véhicule",
  start:"Début", end:"Fin", price:"Prix/jour (€)", deposit:"Caution (€)",
  km:"Kilométrage", notes:"Notes", total:"Total", method:"Méthode",
  amount:"Montant", date:"Date", status:"Statut", actions:"Actions",
  revenue:"Revenus encaissés", activeRentals:"Locations actives",
  availableVehicles:"Véhicules disponibles", downloadPDF:"Télécharger PDF",
  contract:"Contrat", invoice:"Facture", inspection:"État des lieux", quote:"Devis",
  firstName:"Prénom", lastName:"Nom", email:"Email", phone:"Téléphone",
  licenseExpiry:"Expiration du permis", type:"Type", individual:"Particulier",
  company:"Entreprise", collect:"Encaisser", livePreview:"Aperçu en direct",
  agencyName:"Nom de l'agence", address:"Adresse", siret:"SIRET",
  saveProfile:"Sauvegarder le profil", profile:"Profil agence",
  logout:"Déconnexion", planPro:"Plan Pro", fleetStatus:"Flotte",
  totalVehicles:"Total véhicules", noRentals:"Aucune location active",
},
en: {
  dashboard:"Dashboard", vehicles:"Vehicles", clients:"Clients",
  rentals:"Rentals", payments:"Payments", documents:"Documents",
  signatures:"Signatures", pricing:"Pricing", settings:"Settings",
  welcome:"Welcome to Loqar", newRental:"New rental",
  addVehicle:"Add vehicle", newClient:"New client",
  newPayment:"New payment", save:"Save", cancel:"Cancel",
  delete:"Delete", edit:"Edit", add:"Add",
  search:"Search…", available:"Available", rented:"Rented",
  maintenance:"Maintenance", inProgress:"In progress", reserved:"Reserved",
  completed:"Completed", cancelled:"Cancelled", collected:"Collected",
  pending:"Pending", late:"Late", client:"Client", vehicle:"Vehicle",
  start:"Start", end:"End", price:"Price/day (€)", deposit:"Deposit (€)",
  km:"Mileage", notes:"Notes", total:"Total", method:"Method",
  amount:"Amount", date:"Date", status:"Status", actions:"Actions",
  revenue:"Revenue collected", activeRentals:"Active rentals",
  availableVehicles:"Available vehicles", downloadPDF:"Download PDF",
  contract:"Contract", invoice:"Invoice", inspection:"Inspection report", quote:"Quote",
  firstName:"First name", lastName:"Last name", email:"Email", phone:"Phone",
  licenseExpiry:"License expiry", type:"Type", individual:"Individual",
  company:"Company", collect:"Collect", livePreview:"Live preview",
  agencyName:"Agency name", address:"Address", siret:"Company ID",
  saveProfile:"Save profile", profile:"Agency profile",
  logout:"Logout", planPro:"Pro Plan", fleetStatus:"Fleet",
  totalVehicles:"Total vehicles", noRentals:"No active rentals",
},
};




// ─── LANG CONTEXT ─────────────────────────────────────────────────────────────
const LangContext = createContext("fr");
const useLang = () => useContext(LangContext);


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
const RENTALS = [];
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


// ─── SEND EMAIL ───────────────────────────────────────────────────────────────
const sendEmail = async (type, to, data) => {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, to, data }),
    });
  } catch (e) {
    console.error("Email error:", e);
  }
};

// ─── PLAN LIMITS ──────────────────────────────────────────────────────────────
const PLAN_LIMITS = {
  starter:    { vehicles: 3,  rentals: 50,  emails: false, label: "Starter" },
  pro:        { vehicles: 15, rentals: Infinity, emails: true, label: "Pro" },
  enterprise: { vehicles: Infinity, rentals: Infinity, emails: true, label: "Enterprise" },
};

function PlanBadge({ plan }) {
  const colors = { starter: T.blue, pro: T.gold, enterprise: T.amber };
  const c = colors[plan] || T.blue;
  return (
    <span style={{ padding:"2px 10px", borderRadius:99, fontSize:10, fontWeight:700, background:c+"18", color:c, border:`1px solid ${c}30`, textTransform:"uppercase", letterSpacing:".06em" }}>
      {plan||"starter"}
    </span>
  );
}

function UpgradeModal({ onClose, reason }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#00000080", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"36px 32px", maxWidth:420, width:"90%", textAlign:"center" }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontSize:36, marginBottom:12 }}>⭐</div>
        <h2 style={{ fontSize:20, fontWeight:800, color:T.text, marginBottom:8 }}>Limite atteinte</h2>
        <p style={{ fontSize:14, color:T.sub, lineHeight:1.6, marginBottom:24 }}>{reason}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button onClick={()=>window.open("https://buy.stripe.com/dRmeVdctV7XhgKY2z97kc07","_blank")} style={{ background:T.gold, color:"#0F0D0B", padding:"10px 24px", borderRadius:9, fontSize:14, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit" }}>
            Passer en Pro →
          </button>
          <button onClick={onClose} style={{ background:"transparent", color:T.sub, padding:"10px 16px", borderRadius:9, fontSize:14, border:`1px solid ${T.border}`, cursor:"pointer", fontFamily:"inherit" }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const lang = useLang();
  const m = {
    "disponible":  { c:T.success, l:lang==="en"?"Available":"Disponible" },
    "en location": { c:T.gold,    l:lang==="en"?"Rented":"En location" },
    "entretien":   { c:T.red,     l:lang==="en"?"Maintenance":"Entretien" },
    "en cours":    { c:T.gold,    l:lang==="en"?"In progress":"En cours" },
    "terminée":    { c:T.muted,   l:"Terminée" },
    "réservée":    { c:T.blue,    l:"Réservée" },
    "encaissé":    { c:T.success, l:"Encaissé" },
    "en attente":  { c:T.amber,   l:"En attente" },
    "en retard":   { c:T.red,     l:"En retard" },
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
  const colors = {
    primary:   { backgroundColor:hov?"#D9BC84":T.gold,      color:"#0F0D0B",  border:"none"                      },
    secondary: { backgroundColor:hov?T.card2:T.card,         color:"#E8E4DF",  border:`1px solid ${T.border2}`    },
    ghost:     { backgroundColor:hov?T.card2:"transparent",  color:T.sub,      border:"none"                      },
    danger:    { backgroundColor:hov?T.red+"25":T.redDim,    color:T.red,      border:`1px solid ${T.red}30`      },
    outline:   { backgroundColor:hov?T.goldDim:"transparent",color:T.gold,     border:`1px solid ${T.gold}60`     },
  }[variant]||{ backgroundColor:T.card, color:T.text, border:`1px solid ${T.border2}` };
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"inline-flex", alignItems:"center", gap:7, fontWeight:600, fontFamily:"inherit", cursor:"pointer", transition:"all .15s", transform:hov&&variant!=="ghost"?"translateY(-1px)":"none", letterSpacing:"0.01em", width:full?"100%":"auto", justifyContent:full?"center":"flex-start", ...sz, ...colors, ...style }}>
      {icon && <span style={{display:"flex",alignItems:"center"}}>{icon}</span>}
      {label && <span style={{color:"inherit"}}>{label}</span>}
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
  { cat:"Navigation", items:[{l:"Tableau de bord",icon:Icons.dash,page:"dashboard"},{l:"Véhicules",icon:Icons.car,page:"vehicles"},{l:"Clients",icon:Icons.users,page:"clients"},{l:"Locations",icon:Icons.calendar,page:"rentals"},{l:"Paiements",icon:Icons.dollar,page:"payments"},{l:"Documents",icon:Icons.doc,page:"documents"}]},
  { cat:"Actions",    items:[{l:"Ajouter un véhicule",icon:Icons.plus,page:"vehicles"},{l:"Nouveau client",icon:Icons.plus,page:"clients"},{l:"Générer un contrat",icon:Icons.doc,page:"documents"}]},
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
const NOTIFS = [];

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
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const [form, setForm] = useState(agencyProfile);
  const [saved, setSaved] = useState(false);
  const up = (k,v) => setForm(f=>({...f,[k]:v}));
  const save = () => { setAgencyProfile(form); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <Page title={t.settings||"Paramètres"} sub={lang==="en"?"Your agency info · shown on PDF contracts":"Informations de votre agence · apparaissent sur vos contrats PDF"}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

        {/* Infos agence */}
        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:T.gold, letterSpacing:".06em", textTransform:"uppercase", marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color:T.gold }}>{Icons.building}</span> {t.profile||"Agence"}
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
            {[[t.agencyName||"Nom de l'agence","name","Loqar Auto"],["SIRET","siret","123 456 789 00012"],[t.address||"Adresse","address","12 rue de la Paix, 75001 Paris"],[lang==="en"?"Phone":"Téléphone","phone","+33 1 23 45 67 89"],["Email","email","contact@loqar.fr"],[lang==="en"?"Website":"Site web","website","www.loqar.fr"]].map(([lbl,key,ph])=>(
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
              <span style={{ color:T.gold }}>{Icons.dollar}</span> {lang==="en"?"Banking details":"Coordonnées bancaires"}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              {[["IBAN","iban","FR76 3000 6000 0112 3456 7890 189"],["BIC / SWIFT","bic","BNPAFRPP"],[lang==="en"?"Account holder":"Titulaire","bankHolder","Alexandre Dubois"]].map(([lbl,key,ph])=>(
                <div key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{lbl}</label>
                  <input value={form[key]||""} onChange={e=>up(key,e.target.value)} placeholder={ph}
                    style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", transition:"border-color .15s" }}
                    onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
                </div>
              ))}
            </div>
          </Card>

          {/* Mentions légales contrat */}
          <Card>
            <div style={{ fontSize:13, fontWeight:700, color:T.gold, letterSpacing:".06em", textTransform:"uppercase", marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:T.gold }}>{Icons.doc}</span> {lang==="en"?"Contract terms":"Mentions contrat"}
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
                  <div style={{ fontSize:14, fontWeight:700, letterSpacing:"-.02em" }}>{form.name||t.agencyName||"Nom de l'agence"}</div>
                  <div style={{ fontSize:10, color:"#888" }}>{form.address||t.address||"Adresse"}</div>
                </div>
                <div style={{ marginLeft:"auto", textAlign:"right" }}>
                  <div style={{ fontSize:10, color:"#888" }}>{form.phone||lang==="en"?"Phone":"Téléphone"}</div>
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
        <Btn label={t.saveProfile||"Enregistrer les modifications"} variant="primary" onClick={save} icon={Icons.check}/>
      </div>
    </Page>
  );
}

// ─── SIGNATURE ÉLECTRONIQUE ───────────────────────────────────────────────────
function SignaturePage() {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const [selected, setSelected] = useState(null);
  const [sigStep, setSigStep] = useState(null); // null | "send" | "signing" | "done"
  const [signed, setSigned] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef(null);

  const contracts = [
  ];

  const startDraw = e => { setDrawing(true); const c=canvasRef.current; const r=c.getBoundingClientRect(); const ctx=c.getContext("2d"); ctx.beginPath(); ctx.moveTo(e.clientX-r.left,e.clientY-r.top); };
  const draw = e => { if(!drawing)return; setHasDrawn(true); const c=canvasRef.current; const r=c.getBoundingClientRect(); const ctx=c.getContext("2d"); ctx.strokeStyle="#1A1510"; ctx.lineWidth=2; ctx.lineCap="round"; ctx.lineTo(e.clientX-r.left,e.clientY-r.top); ctx.stroke(); };
  const endDraw = () => setDrawing(false);
  const clearCanvas = () => { const c=canvasRef.current; c.getContext("2d").clearRect(0,0,c.width,c.height); setHasDrawn(false); };
  const confirmSign = () => { setSigned(s=>[...s,selected?.id]); setSigStep("done"); };

  return (
    <Page title={lang==="en"?"Electronic signature":"Signature électronique"} sub={lang==="en"?"Send contracts for signing in one click":"Envoyez vos contrats à signer en un clic"}>

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
              <Btn label={t.cancel||"Annuler"} variant="secondary" onClick={()=>setSigStep(null)} style={{ flex:1, justifyContent:"center" }}/>
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
          {l:t.pending||"En attente",v:contracts.filter(c=>c.status==="en attente signature"&&!signed.includes(c.id)).length,c:T.amber,icon:Icons.clock},
          {l:lang==="en"?"Signed":"Signés",v:contracts.filter(c=>c.status==="signé").length+signed.length,c:T.success,icon:Icons.check},
          {l:lang==="en"?"Total contracts":"Total contrats",v:contracts.length,c:T.gold,icon:Icons.doc},
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
          <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{lang==="en"?"Contracts pending signature":"Contrats en attente de signature"}</div>
          <Btn label={lang==="en"?"New contract":"Nouveau contrat"} variant="outline" size="sm" icon={Icons.plus}/>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:T.surface }}>
              {[t.client||"Client",lang==="en"?"Vehicle":"Véhicule",t.date||"Date",t.amount||"Montant",t.status||"Statut",t.actions||"Actions"].map(h=>(
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
                    <Badge label={isSigned?"Signé":t.pending||"En attente"} color={isSigned?T.success:T.amber} dot/>
                  </td>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${T.border}` }}>
                    {!isSigned
                      ? <div style={{ display:"flex", gap:8 }}>
                          <Btn label={lang==="en"?"Send link":"Envoyer le lien"} variant="outline" size="sm" icon={Icons.mail} onClick={()=>{ setSelected(c); setSigStep("send"); setTimeout(()=>setSigStep("signing"),800); }}/>
                          <Btn label={lang==="en"?"Sign here":"Signer ici"} variant="secondary" size="sm" icon={Icons.pen} onClick={()=>{ setSelected(c); setSigStep("signing"); setHasDrawn(false); }}/>
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

const NAV_KEYS = [
  { id:"dashboard",  labelKey:"dashboard", icon:Icons.dash },
  { id:"vehicles",   labelKey:"vehicles",  icon:Icons.car  },
  { id:"clients",    labelKey:"clients",   icon:Icons.users},
  { id:"rentals",    labelKey:"rentals",   icon:Icons.calendar},
  { id:"payments",   labelKey:"payments",  icon:Icons.dollar},
  { id:"documents",  labelKey:"documents", icon:Icons.doc  },
  { id:"signature",  labelKey:"signatures",icon:Icons.pen  },
  { id:"pricing",    labelKey:"pricing",   icon:Icons.zap  },
  { id:"settings",   labelKey:"settings",  icon:Icons.settings },
];
const NAV = NAV_KEYS; // backward compat

function Sidebar({ page, onNav, user, onLogout, onCmd, vehicles, onNotif, unreadCount, userPlan = "starter", payments = [], onLangChange }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const lateP = payments.filter(p=>p.status==="en retard").length;
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
      {NAV_KEYS.map(item => {
        const active = page===item.id;
        const label = t?.[item.labelKey]||item.labelKey;
        return (
          <button key={item.id} onClick={()=>onNav(item.id)}
            style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 12px", borderRadius:9, marginBottom:2, background:active?T.goldDim:"transparent", border:"none", color:active?T.gold:T.sub, fontSize:13, fontWeight:active?600:400, cursor:"pointer", transition:"all .15s", position:"relative", fontFamily:"inherit" }}
            onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.card}}
            onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent"}}>
            {active && <div style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", width:2, height:16, background:T.gold, borderRadius:99 }}/>}
            <span style={{ color:active?T.gold:T.muted }}>{item.icon}</span>
            {label}
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
        {[{l:t.available||lang==="en"?"Available":"Disponible",s:"disponible",c:T.success},{l:t.rented||lang==="en"?"Rented":"En location",s:"en location",c:T.gold},{l:t.maintenance||lang==="en"?"Maintenance":"Entretien",s:"entretien",c:T.red}].map(g=>{
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

      {/* Upgrade - only for starter */}
      {userPlan === "starter" && (
      <div style={{ background:`linear-gradient(135deg,${T.gold}18,${T.gold}08)`, border:`1px solid ${T.gold}30`, borderRadius:12, padding:14, marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
          <span style={{ color:T.gold }}>{Icons.zap}</span>
          <span style={{ fontSize:12, fontWeight:700, color:T.gold }}>Passer au Pro</span>
        </div>
        <p style={{ fontSize:11, color:T.sub, lineHeight:1.5, marginBottom:10 }}>Véhicules illimités, emails automatiques.</p>
        <Btn label="Passer au Pro" variant="primary" size="sm" full onClick={()=>window.open("https://buy.stripe.com/dRmeVdctV7XhgKY2z97kc07","_blank")}/>
      </div>
      )}

      {/* Lang toggle */}
      <div style={{ display:"flex", gap:6, marginBottom:10 }}>
        {["fr","en"].map(l=>(
          <button key={l} onClick={()=>onLangChange&&onLangChange(l)} style={{ flex:1, padding:"6px 0", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", background:lang===l?T.goldDim:"transparent", color:lang===l?T.gold:T.muted, border:`1px solid ${lang===l?T.gold+"50":T.border}`, transition:"all .2s", textTransform:"uppercase", letterSpacing:".05em" }}>
            {l==="fr"?"🇫🇷 FR":"🇬🇧 EN"}
          </button>
        ))}
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

// ─── SUCCESS PAGE ─────────────────────────────────────────────────────────────
function SuccessPage({ onContinue }) {
  const [plan, setPlan] = useState("pro");
  const params = new URLSearchParams(window.location.search);
  
  useEffect(() => {
    // Clean URL after 3s
    setTimeout(() => {
      window.history.replaceState({}, "", "/");
    }, 3000);
  }, []);

  const planInfo = {
    starter:    { name:"Starter",    price:"29€/mois",  color:T.blue,  features:["5 véhicules","50 locations/mois","Documents PDF"] },
    pro:        { name:"Pro",        price:"79€/mois",  color:T.gold,  features:["Véhicules illimités","Locations illimitées","Emails automatiques"] },
    enterprise: { name:"Enterprise", price:"199€/mois", color:T.amber, features:["Multi-agences","API accès","Onboarding dédié"] },
  };
  const p = planInfo[plan] || planInfo.pro;

  return (
    <div style={{ background:T.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Plus Jakarta Sans',sans-serif", padding:24 }}>
      <div style={{ maxWidth:480, width:"100%", textAlign:"center" }}>
        {/* Animated checkmark */}
        <div style={{ width:80, height:80, borderRadius:"50%", background:T.success+"18", border:`2px solid ${T.success}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", animation:"pulse 2s infinite" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={T.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 ${T.success}30} 50%{box-shadow:0 0 0 12px transparent} }`}</style>

        <div style={{ fontSize:11, fontWeight:700, color:T.success, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>Paiement confirmé</div>
        <h1 style={{ fontSize:32, fontWeight:800, letterSpacing:"-0.03em", color:T.text, marginBottom:8 }}>
          Bienvenue sur Loqar <span style={{ color:p.color }}>{p.name}</span> !
        </h1>
        <p style={{ fontSize:15, color:T.sub, lineHeight:1.7, marginBottom:32 }}>
          Votre abonnement {p.name} à {p.price} est maintenant actif. Vous avez accès à toutes les fonctionnalités.
        </p>

        {/* Plan features */}
        <div style={{ background:T.card, border:`1px solid ${p.color}40`, borderRadius:16, padding:"20px 24px", marginBottom:28, textAlign:"left" }}>
          <div style={{ fontSize:13, fontWeight:700, color:p.color, marginBottom:12 }}>✨ Votre plan {p.name} inclut :</div>
          {p.features.map((f,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, fontSize:13, color:T.sub }}>
              <div style={{ width:18, height:18, borderRadius:"50%", background:p.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:p.color, flexShrink:0 }}>✓</div>
              {f}
            </div>
          ))}
        </div>

        <button onClick={onContinue} style={{ background:T.gold, color:"#0F0D0B", padding:"13px 36px", borderRadius:10, fontSize:15, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit", width:"100%" }}>
          Accéder à mon espace →
        </button>
        <p style={{ fontSize:12, color:T.muted, marginTop:14 }}>Un email de confirmation vous a été envoyé</p>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ onGetStarted }) {
  const lang = useLang();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const features = [
    { icon:Icons.car,      title:"Gestion de flotte", desc:"Ajoutez vos véhicules, suivez leur statut en temps réel et gérez les disponibilités." },
    { icon:Icons.users,    title:"Gestion clients", desc:"Base de données complète avec historique de locations et permis de conduire." },
    { icon:Icons.calendar, title:"Locations", desc:"Créez des locations, gérez les statuts et suivez les kilométrages facilement." },
    { icon:Icons.doc,      title:"Contrats légaux", desc:"Générez des contrats, factures et états des lieux conformes en PDF en un clic." },
    { icon:Icons.dollar,   title:"Paiements", desc:"Suivez les encaissements, gérez les cautions et envoyez des rappels automatiques." },
    { icon:Icons.mail,     title:"Emails automatiques", desc:"Confirmations de location et rappels de paiement envoyés automatiquement." },
  ];

  const plans = [
    { name:"Starter", desc:"Pour débuter", price:49, color:T.blue, link:"https://buy.stripe.com/28E8wPalNdhB9iw2z97kc06",
      features:["5 véhicules","50 locations/mois","Documents PDF","Support email"] },
    { name:"Pro", desc:"Pour les agences", price:129, color:T.gold, featured:true, link:"https://buy.stripe.com/dRmeVdctV7XhgKY2z97kc07",
      features:["Véhicules illimités","Locations illimitées","Emails automatiques","Support prioritaire"] },
    { name:"Enterprise", desc:"Pour les grandes agences", price:249, color:T.amber, link:"https://buy.stripe.com/5kQ9AT79Bcdx1Q4ehR7kc08",
      features:["Multi-agences","API accès","Marque blanche","Onboarding dédié"] },
  ];

  const navStyle = { position:"fixed", top:0, left:0, right:0, zIndex:200, height:58, padding:"0 28px", display:"flex", alignItems:"center", justifyContent:"space-between", background:T.surface, borderBottom:`1px solid ${T.border}` };

  return (
    <div style={{ background:T.bg, color:T.text, fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:"100vh", overflowX:"hidden" }}>

      {/* NAV */}
      <nav style={navStyle}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, background:T.goldDim, border:`1px solid ${T.gold}`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:T.gold }}>{Icons.car}</div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:T.text, letterSpacing:"-0.02em" }}>Loqar</div>
            <div style={{ fontSize:10, color:T.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:".1em" }}>Location Auto</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn label="Se connecter" variant="secondary" onClick={onGetStarted}/>
          <Btn label="Essai gratuit →" variant="primary" onClick={onGetStarted}/>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"100px 24px 80px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 70% 50% at 50% 10%, ${T.goldDim}, transparent)`, pointerEvents:"none" }}/>
        <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:T.goldDim, border:`1px solid ${T.gold}`, borderRadius:99, padding:"5px 14px", fontSize:11, fontWeight:700, color:T.gold, letterSpacing:".08em", textTransform:"uppercase", marginBottom:28 }}>
          🚗 &nbsp;Logiciel de gestion de location auto
        </div>
        <h1 style={{ fontSize:"clamp(38px,6vw,70px)", fontWeight:800, letterSpacing:"-0.04em", lineHeight:1.06, maxWidth:760, marginBottom:20 }}>
          Gérez votre agence de location <span style={{ color:T.gold }}>sans effort</span>
        </h1>
        <p style={{ fontSize:"clamp(15px,1.8vw,17px)", color:T.sub, maxWidth:480, lineHeight:1.7, marginBottom:40 }}>
          Loqar centralise votre flotte, vos clients, vos contrats et vos paiements dans une seule plateforme intuitive.
        </p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
          <button onClick={onGetStarted} style={{ background:T.gold, color:"#0F0D0B", padding:"11px 26px", borderRadius:9, fontSize:14, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#D9BC84"}
            onMouseLeave={e=>e.currentTarget.style.background=T.gold}>
            Commencer gratuitement →
          </button>
          <button onClick={onGetStarted} style={{ background:"transparent", color:T.sub, padding:"10px 22px", borderRadius:9, fontSize:14, fontWeight:600, border:`1px solid ${T.border}`, cursor:"pointer", fontFamily:"inherit" }}>
            Voir la démo
          </button>
        </div>
        <div style={{ display:"flex", gap:24, marginTop:44, flexWrap:"wrap", justifyContent:"center" }}>
          {["Sans carte requise","14 jours d'essai","Annulation facile"].map(t=>(
            <span key={t} style={{ fontSize:13, color:T.muted, display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ color:T.success, fontWeight:800 }}>✓</span>{t}
            </span>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div style={{ background:T.surface, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, padding:"30px 24px" }}>
        <div style={{ maxWidth:860, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, textAlign:"center" }}>
          {[["500+","Véhicules gérés"],["2 min","Pour créer un contrat"],["100%","Conforme légalement"],["24/7","Accès en ligne"]].map(([n,l])=>(
            <div key={l} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:20 }}>
              <div style={{ fontSize:32, fontWeight:800, color:T.gold, letterSpacing:"-0.04em" }}>{n}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:6, fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding:"72px 24px", maxWidth:1080, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.gold, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>Fonctionnalités</div>
          <h2 style={{ fontSize:"clamp(24px,3.5vw,36px)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:10 }}>Tout ce dont vous avez besoin</h2>
          <p style={{ fontSize:14, color:T.sub, lineHeight:1.6, maxWidth:440, margin:"0 auto" }}>Une plateforme complète pour gérer votre activité de A à Z</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:14 }}>
          {features.map((f,i)=>(
            <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:22, transition:"all .2s", cursor:"default" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.border2; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 40px #00000050";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none";}}>
              <div style={{ width:38, height:38, borderRadius:10, background:T.goldDim, border:`1px solid ${T.gold}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:14 }}>{f.icon}</div>
              <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:7 }}>{f.title}</div>
              <div style={{ fontSize:13, color:T.sub, lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MOCKUP */}
      <div style={{ background:T.surface, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, padding:"60px 24px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.gold, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>Interface</div>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,36px)", fontWeight:800, letterSpacing:"-0.03em" }}>Simple et intuitif</h2>
          </div>
          <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 32px 100px #00000080" }}>
            <div style={{ background:T.card, borderBottom:`1px solid ${T.border}`, padding:"10px 14px", display:"flex", alignItems:"center", gap:7 }}>
              {["#E05555","#C8A96E","#6AAF7A"].map(c=><div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c }}/>)}
              <div style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:6, padding:"4px 12px", fontSize:11, color:T.muted, marginLeft:8 }}>loqar.fr</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", minHeight:340 }}>
              <div style={{ background:T.surface, borderRight:`1px solid ${T.border}`, padding:"14px 10px", display:"flex", flexDirection:"column", gap:3 }}>
                {[[Icons.dash,"Tableau de bord",true],[Icons.car,"Véhicules"],[Icons.users,lang==="en"?"Clients":"Clients"],[Icons.calendar,"Locations"],[Icons.dollar,"Paiements"],[Icons.doc,"Documents"]].map(([icon,label,active])=>(
                  <div key={label} style={{ padding:"8px 10px", borderRadius:9, fontSize:12, fontWeight:600, color:active?T.gold:T.sub, background:active?T.goldDim:"transparent", display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{ width:28, height:28, borderRadius:7, background:active?T.goldDim:T.card2, display:"flex", alignItems:"center", justifyContent:"center", color:active?T.gold:T.muted }}>{icon}</div>
                    {label}
                  </div>
                ))}
              </div>
              <div style={{ padding:22 }}>
                <div style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.02em", marginBottom:3 }}>Tableau de bord</div>
                <div style={{ fontSize:12, color:T.muted, marginBottom:18 }}>Mercredi 5 mars · Bienvenue sur Loqar</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
                  {[["Revenus","4 280 €",T.gold,"↑ +12%"],["Locations","12",T.blue,"actives"],["Véhicules","8",T.success,"disponibles"],[lang==="en"?"Clients":"Clients","24",T.amber,"total"]].map(([l,v,c,s])=>(
                    <div key={l} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:11, padding:12 }}>
                      <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:5 }}>{l}</div>
                      <div style={{ fontSize:20, fontWeight:800, color:c, letterSpacing:"-0.03em" }}>{v}</div>
                      <div style={{ fontSize:9, color:T.success, marginTop:3 }}>{s}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:11, overflow:"hidden" }}>
                  <div style={{ padding:"9px 14px", background:T.card2, display:"grid", gridTemplateColumns:"1fr 1fr 80px", fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:".06em", fontWeight:700 }}>
                    <span>Client</span><span>Véhicule</span><span>Statut</span>
                  </div>
                  {[["Martin Dupont","Peugeot 308",T.gold,lang==="en"?"In progress":"En cours"],["Sarah Leroy","Renault Clio",T.blue,"Réservée"],["Pierre Martin","BMW 320i",T.success,"Terminée"]].map(([n,v,c,s])=>(
                    <div key={n} style={{ padding:"10px 14px", borderTop:`1px solid ${T.border}`, display:"grid", gridTemplateColumns:"1fr 1fr 80px", alignItems:"center", fontSize:12 }}>
                      <span>{n}</span>
                      <span style={{ color:T.sub }}>{v}</span>
                      <span style={{ padding:"3px 9px", borderRadius:6, fontSize:10, fontWeight:700, background:c+"18", color:c, display:"inline-block" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div style={{ padding:"72px 24px", maxWidth:1080, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.gold, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>Tarifs</div>
          <h2 style={{ fontSize:"clamp(24px,3.5vw,36px)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:10 }}>Simple et transparent</h2>
          <p style={{ fontSize:14, color:T.sub }}>Commencez gratuitement, évoluez selon vos besoins</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:14, maxWidth:860, margin:"0 auto" }}>
          {plans.map((p,i)=>(
            <div key={i} style={{ background:p.featured?T.card2:T.card, border:`1.5px solid ${p.featured?p.color:T.border}`, borderRadius:16, padding:"26px 22px", position:"relative", transition:"all .2s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              {p.featured && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:T.gold, color:"#0F0D0B", fontSize:10, fontWeight:700, padding:"3px 14px", borderRadius:99, whiteSpace:"nowrap" }}>⭐ Plus populaire</div>}
              <div style={{ fontSize:15, fontWeight:800, color:p.color, marginBottom:3 }}>{p.name}</div>
              <div style={{ fontSize:11, color:T.muted, marginBottom:16 }}>{p.desc}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:3, marginBottom:18 }}>
                <span style={{ fontSize:44, fontWeight:800, color:p.color, letterSpacing:"-0.04em", lineHeight:1 }}>{p.price}</span>
                <span style={{ fontSize:13, color:T.sub }}>€/mois</span>
              </div>
              <div style={{ height:1, background:T.border, margin:"16px 0" }}/>
              {p.features.map((f,j)=>(
                <div key={j} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9, fontSize:13, color:T.sub }}>
                  <div style={{ width:16, height:16, borderRadius:99, background:p.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:p.color, flexShrink:0 }}>✓</div>
                  {f}
                </div>
              ))}
              <button onClick={()=>window.location.href=p.link} style={{ width:"100%", marginTop:18, padding:10, borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", background:p.featured?p.color:"transparent", color:p.featured?"#0F0D0B":p.color, border:p.featured?"none":`1.5px solid ${p.color}`, transition:"all .15s" }}>
                Commencer →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:"80px 24px" }}>
        <div style={{ maxWidth:580, margin:"0 auto", background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"56px 40px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 80% 60% at 50% 0%, ${T.goldDim}, transparent)`, pointerEvents:"none" }}/>
          <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:12, position:"relative" }}>Prêt à simplifier votre gestion ?</h2>
          <p style={{ color:T.sub, fontSize:14, lineHeight:1.7, marginBottom:32, position:"relative" }}>Rejoignez les agences qui font confiance à Loqar pour gérer leur flotte au quotidien.</p>
          <button onClick={onGetStarted} style={{ background:T.gold, color:"#0F0D0B", padding:"13px 32px", borderRadius:9, fontSize:15, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit", position:"relative" }}
            onMouseEnter={e=>e.currentTarget.style.background="#D9BC84"}
            onMouseLeave={e=>e.currentTarget.style.background=T.gold}>
            Démarrer gratuitement →
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${T.border}`, padding:"24px 28px", background:T.surface, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:T.goldDim, border:`1px solid ${T.gold}`, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:T.gold }}>{Icons.car}</div>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:T.text }}>Loqar</div>
            <div style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:".08em" }}>Location Auto</div>
          </div>
        </div>
        <span style={{ fontSize:12, color:T.muted }}>© 2025 Loqar · Logiciel de gestion de location de véhicules</span>
        <Btn label="Se connecter" variant="secondary" onClick={onGetStarted}/>
      </footer>
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
      else { setSuccess("Compte créé ! Vérifiez votre email pour confirmer."); sendEmail("welcome", email, { name }); }
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

function Dashboard({ vehicles, rentals, payments, clients, onNav }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;

  // Real data calculations
  const totalRevenue = (payments||[]).filter(p=>p.status==="encaissé").reduce((a,p)=>a+(p.amount||0),0);
  const activeRentals = (rentals||[]).filter(r=>r.status==="en cours");
  const availableVehicles = (vehicles||[]).filter(v=>v.status==="disponible");
  const pendingPayments = (payments||[]).filter(p=>p.status==="en attente");
  const latePayments = (payments||[]).filter(p=>p.status==="en retard");

  // Monthly revenue for chart (last 6 months)
  const monthlyRevenue = () => {
    const months = [];
    for (let i=5; i>=0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label = d.toLocaleDateString('fr-FR', { month:'short' });
      const total = (payments||[])
        .filter(p => p.status==="encaissé" && p.date && p.date.startsWith(key))
        .reduce((a,p) => a+(p.amount||0), 0);
      months.push({ label, total, key });
    }
    return months;
  };
  const monthData = monthlyRevenue();
  const maxRev = Math.max(...monthData.map(m=>m.total), 1);

  // Rental status breakdown
  const statusCount = {
    "en cours": (rentals||[]).filter(r=>r.status==="en cours").length,
    "réservée": (rentals||[]).filter(r=>r.status==="réservée").length,
    "terminée": (rentals||[]).filter(r=>r.status==="terminée").length,
  };

  const revCount = useCounter(totalRevenue, 1300);

  return (
    <Page title={lang==="en"?"Dashboard":"Tableau de bord"}
      sub={`${new Date().toLocaleDateString(lang==="en"?"en-US":"fr-FR",{weekday:"long",day:"numeric",month:"long"})} · ${lang==="en"?"Welcome to Loqar":"Bienvenue sur Loqar"}`}
      actions={<button onClick={()=>onNav&&onNav("rentals")} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:T.gold, border:"none", borderRadius:10, color:"#0F0D0B", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{Icons.plus} {lang==="en"?"New rental":"Nouvelle location"}</button>}>

      {/* ── Revenue banner ── */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:18, padding:"28px 32px", marginBottom:18, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:`linear-gradient(115deg,${T.gold}08 0%,transparent 55%)`, pointerEvents:"none" }}/>
        <div style={{ position:"relative", display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:T.muted, letterSpacing:".12em", textTransform:"uppercase", marginBottom:8 }}>{lang==="en"?"Collected Revenue · Total":"Revenus encaissés · Total"}</div>
            <div style={{ fontSize:56, fontWeight:700, letterSpacing:"-0.04em", color:T.gold, lineHeight:1 }}>
              {fmt(revCount)} <span style={{ fontSize:24, color:T.sub }}>€</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:T.success+"18", border:`1px solid ${T.success}30`, color:T.success, padding:"4px 12px", borderRadius:99, fontSize:11, fontWeight:600 }}>
                {Icons.trend} {(payments||[]).filter(p=>p.status==="encaissé").length} {lang==="en"?"transactions":"transactions"}
              </span>
              {latePayments.length > 0 && (
                <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:T.red+"18", border:`1px solid ${T.red}30`, color:T.red, padding:"4px 12px", borderRadius:99, fontSize:11, fontWeight:600 }}>
                  ⚠ {latePayments.length} {lang==="en"?"late":"en retard"}
                </span>
              )}
            </div>
          </div>
          {/* Mini bar chart */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
            <div style={{ fontSize:10, color:T.muted, letterSpacing:".1em", textTransform:"uppercase" }}>{lang==="en"?"Revenue last 6 months":"Revenus 6 derniers mois"}</div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:52 }}>
              {monthData.map((m,i)=>(
                <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                  <div style={{ width:22, background: i===5 ? T.gold : T.gold+"40", borderRadius:"4px 4px 0 0", height: maxRev>0 ? `${Math.max(4,(m.total/maxRev)*44)}px` : "4px", transition:"height .5s" }}/>
                  <span style={{ fontSize:9, color:T.muted }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:18 }}>
        {[
          { label:lang==="en"?"Active rentals":"Locations actives",      value:activeRentals.length,      color:T.gold,    icon:Icons.calendar, sub:lang==="en"?"In progress":"En cours" },
          { label:lang==="en"?"Available vehicles":"Véhicules disponibles",  value:availableVehicles.length,  color:T.success, icon:Icons.car,      sub:lang==="en"?`Out of ${(vehicles||[]).length} total`:`Sur ${(vehicles||[]).length} total` },
          { label:lang==="en"?"Clients":"Clients",                value:(clients||[]).length,       color:T.blue,    icon:Icons.users,    sub:lang==="en"?"Registered":"Enregistrés" },
          { label:lang==="en"?"Pending payments":"Paiements en attente",   value:pendingPayments.length,    color:T.amber,   icon:Icons.dollar,   sub:`${pendingPayments.reduce((a,p)=>a+(p.amount||0),0)} €` },
        ].map(s=>{
          const c = useCounter(s.value, 900);
          return (
            <Card key={s.label}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:T.muted, letterSpacing:".08em", textTransform:"uppercase", marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontSize:32, fontWeight:700, color:s.color, letterSpacing:"-0.03em", lineHeight:1 }}>{c}</div>
                  {s.sub && <div style={{ fontSize:11, color:T.muted, marginTop:5 }}>{s.sub}</div>}
                </div>
                <div style={{ width:38, height:38, borderRadius:10, background:s.color+"15", display:"flex", alignItems:"center", justifyContent:"center", color:s.color, flexShrink:0 }}>{s.icon}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Main grid ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>

        {/* Left — rentals en cours */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Locations actives */}
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:T.text }}>{lang==="en"?"Active rentals":"Locations en cours"}</h3>
              <button onClick={()=>onNav&&onNav("rentals")} style={{ fontSize:12, color:T.gold, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>{lang==="en"?"View all →":"Voir tout →"}</button>
            </div>
            {activeRentals.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:T.muted, fontSize:13 }}>{lang==="en"?"No active rentals":"Aucune location active pour le moment"}</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {activeRentals.slice(0,5).map(r=>{
                  const cl = (clients||[]).find(c=>c.id===r.client_id);
                  const veh = (vehicles||[]).find(v=>v.id===r.vehicle_id);
                  const dl = r.end_date ? Math.ceil((new Date(r.end_date)-new Date())/86400000) : null;
                  return (
                    <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:T.card2, borderRadius:10, transition:"background .15s", cursor:"pointer" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#2A2824"}
                      onMouseLeave={e=>e.currentTarget.style.background=T.card2}>
                      <Avatar name={r.client_name||"?"} size={34}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{r.client_name||"—"}</div>
                        <div style={{ fontSize:11, color:T.muted }}>{r.vehicle_name||"—"}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:13, fontWeight:700, color:T.gold }}>{r.total_amount||0} €</div>
                        {dl !== null && <div style={{ fontSize:10, color:dl<=2?T.red:T.muted }}>J-{dl}</div>}
                      </div>
                      <StatusBadge status={r.status}/>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Statut locations */}
          <Card>
            <h3 style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:16 }}>{lang==="en"?"Rental breakdown":"Répartition des locations"}</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { label:lang==="en"?"In progress":"En cours", value:statusCount["en cours"],  color:T.gold,    total:(rentals||[]).length },
                { label:lang==="en"?"Reserved":"Réservées", value:statusCount["réservée"],  color:T.blue,    total:(rentals||[]).length },
                { label:lang==="en"?"Completed":"Terminées", value:statusCount["terminée"],  color:T.success, total:(rentals||[]).length },
              ].map(s=>(
                <div key={s.label}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:T.sub, marginBottom:5 }}>
                    <span>{s.label}</span>
                    <span style={{ color:s.color, fontWeight:600 }}>{s.value}</span>
                  </div>
                  <ProgressBar value={s.value} max={Math.max(s.total,1)} color={s.color}/>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Flotte */}
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:T.text }}>{lang==="en"?"Fleet status":"État de la flotte"}</h3>
              <button onClick={()=>onNav&&onNav("vehicles")} style={{ fontSize:12, color:T.gold, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>{lang==="en"?"View →":"Voir →"}</button>
            </div>
            {(vehicles||[]).slice(0,4).map(v=>(
              <div key={v.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
                <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background:v.status==="disponible"?T.success:v.status==="en location"?T.gold:T.red }}/>
                <div style={{ flex:1, fontSize:12, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.name||v.make}</div>
                <span style={{ fontSize:10, fontWeight:600, color:v.status==="disponible"?T.success:v.status==="en location"?T.gold:T.red }}>{v.status==="disponible"?lang==="en"?"Avail.":"Dispo":v.status==="en location"?lang==="en"?"Rented":"Loué":lang==="en"?"Maintenance":"Entretien"}</span>
              </div>
            ))}
            {(vehicles||[]).length === 0 && <div style={{ fontSize:13, color:T.muted, textAlign:"center", padding:"16px 0" }}>{lang==="en"?"No vehicles":"Aucun véhicule"}</div>}
          </Card>

          {/* Paiements récents */}
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:T.text }}>{lang==="en"?"Recent payments":"Paiements récents"}</h3>
              <button onClick={()=>onNav&&onNav("payments")} style={{ fontSize:12, color:T.gold, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>{lang==="en"?"View →":"Voir →"}</button>
            </div>
            {(payments||[]).slice(0,4).map(p=>(
              <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:T.text }}>{p.client_name||"—"}</div>
                  <div style={{ fontSize:10, color:T.muted }}>{p.date||""}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:p.status==="encaissé"?T.success:p.status==="en retard"?T.red:T.amber }}>{p.amount||0} €</div>
                  <StatusBadge status={p.status}/>
                </div>
              </div>
            ))}
            {(payments||[]).length === 0 && <div style={{ fontSize:13, color:T.muted, textAlign:"center", padding:"16px 0" }}>{lang==="en"?"No payments":"Aucun paiement"}</div>}
          </Card>

          {/* Alertes */}
          {(latePayments.length > 0 || (vehicles||[]).filter(v=>v.status==="entretien").length > 0) && (
            <Card>
              <h3 style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:12 }}>{lang==="en"?"Alerts":"Alertes"}</h3>
              {latePayments.map(p=>(
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:9, marginBottom:5, background:T.red+"0C", border:`1px solid ${T.red}25` }}>
                  {Icons.alert}
                  <span style={{ fontSize:12, color:T.sub }}>{lang==="en"?"Late payment · ":"Paiement en retard · "}{p.client_name} · {p.amount}€</span>
                </div>
              ))}
              {(vehicles||[]).filter(v=>v.status==="entretien").map(v=>(
                <div key={v.id} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:9, marginBottom:5, background:T.amber+"0C", border:`1px solid ${T.amber}25` }}>
                  {Icons.alert}
                  <span style={{ fontSize:12, color:T.sub }}>{v.name}{lang==="en"?" in maintenance":" en entretien"}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
}

// ─── VEHICLES ─────────────────────────────────────────────────────────────────
function Vehicles({ vehicles, setVehicles, user, userPlan = "starter" }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const [sel, setSel]       = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [form, setForm]     = useState({name:"",plate:"",fuel:"Essence",trans:"Manuelle",km:"",price:"",year:"",cat:"Citadine",photo:""});
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `vehicles/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(path);
      setForm(f => ({ ...f, photo: publicUrl }));
    }
    setUploading(false);
  };

  const filtered = vehicles.filter(v=>{
    if(filter!=="all" && v.status!==filter) return false;
    if(search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.plate.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Page title={t.vehicles||"Véhicules"} sub={`${vehicles.length} ${t.vehicles||"véhicules"}`}
      actions={
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <PlanBadge plan={userPlan}/>
          {PLAN_LIMITS[userPlan]?.vehicles !== Infinity && (
            <span style={{ fontSize:12, color:T.muted }}>{vehicles.length}/{PLAN_LIMITS[userPlan]?.vehicles} véhicules</span>
          )}
          <Btn label={t.addVehicle||"Ajouter un véhicule"} variant="primary" icon={Icons.plus} onClick={()=>{
            if(vehicles.length >= (PLAN_LIMITS[userPlan]?.vehicles||5)) { setUpgradeModal(true); return; }
            setModal(true);
          }}/>
        </div>
      }>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:22, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:180, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, pointerEvents:"none" }}>{Icons.search}</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Chercher un véhicule ou immatriculation…"
            style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"9px 12px 9px 36px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
        </div>
        {[["all",lang==="en"?"All":"Tous"],["disponible",t.available||lang==="en"?"Available":"Disponible"],["en location",t.rented||lang==="en"?"Rented":"En location"],["entretien",t.maintenance||lang==="en"?"Maintenance":"Entretien"]].map(([k,l])=>{
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
                  {v.photo_url ? <img src={v.photo_url} style={{ width:"100%", height:"100%", objectFit:"cover", position:"absolute", inset:0, borderRadius:0 }}/> : <CarSilhouette cat={v.cat} color={T.gold} size={160}/>}
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
                  <button style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 14px", background:T.card, border:`1px solid ${T.border2}`, borderRadius:10, color:T.text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }} onClick={()=>setModal("edit")}>{Icons.edit} Modifier</button>
                  <Btn variant="danger" icon={Icons.trash} style={{ padding:"9px 11px" }} onClick={async ()=>{ await supabase.from("vehicles").delete().eq("id", sel.id); setVehicles(vehicles.filter(v=>v.id!==sel.id)); setSel(null); }}/>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {upgradeModal && <UpgradeModal reason={`Votre plan Starter est limité à ${PLAN_LIMITS.starter.vehicles} véhicules. Passez en Pro pour une flotte illimitée.`} onClose={()=>setUpgradeModal(false)}/>}
      {modal && (
      <Modal title={t.addVehicle||"Ajouter un véhicule"} onClose={()=>setModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ gridColumn:"1/-1" }}><Input label="Nom du véhicule" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="Renault Clio"/></div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Photo du véhicule</label>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <label style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 16px", background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, cursor:"pointer", fontSize:12, color:T.sub, fontFamily:"inherit" }}>
                  {uploading ? "Envoi en cours…" : "📷 Choisir une photo"}
                  <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handlePhotoUpload(e.target.files[0])}/>
                </label>
                {form.photo && <img src={form.photo} style={{ width:60, height:40, objectFit:"cover", borderRadius:8, border:`1px solid ${T.border}` }}/>}
              </div>
            </div>
            <Input label="Immatriculation" value={form.plate} onChange={v=>setForm({...form,plate:v})} placeholder="AB-123-CD"/>
            <Input label="Année" type="number" value={form.year} onChange={v=>setForm({...form,year:v})} placeholder="2023"/>
            <Input label={t.km||"Kilométrage"} type="number" value={form.km} onChange={v=>setForm({...form,km:v})} placeholder="15000"/>
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
            <Btn label={t.cancel||"Annuler"} onClick={()=>setModal(false)} variant="secondary"/>
            <Btn label={t.add||"Ajouter"} onClick={async ()=>{
              const newV = { user_id: user.id, name: form.name, plate: form.plate, fuel: form.fuel, transmission: form.trans, km: parseInt(form.km)||0, price_per_day: parseInt(form.price)||0, year: parseInt(form.year)||2023, category: form.cat, status: "disponible", photo_url: form.photo };
              const { data, error } = await supabase.from("vehicles").insert(newV).select().single();
              if (data) setVehicles([...vehicles, { ...data, trans: data.transmission, price: data.price_per_day, cat: data.catégorie }]);
              setModal(false);
            }} variant="primary"/>
          </div>
        </Modal>
      )}
    </Page>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
function Clients({ clients, setClients, user }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const [sel,  setSel]    = useState(null);
  const [search, setSearch]= useState("");
  const [modal, setModal]  = useState(false);
  const [form, setForm]    = useState({firstName:"",lastName:"",email:"",phone:"",type:"particulier",licenseExpiry:""});
  const filtered = clients.filter(c=>!search||`${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <Page title={t.clients||lang==="en"?"Clients":"Clients"} sub={`${clients.length} ${t.clients||"clients"}`}
      actions={<Btn label={t.newClient||"Nouveau client"} variant="primary" icon={Icons.plus} onClick={()=>setModal(true)}/>}>
      <div style={{ position:"relative", marginBottom:16 }}>
        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, pointerEvents:"none" }}>{Icons.search}</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={"Rechercher un client…"}
          style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px 10px 36px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
      </div>

      <div style={{ display:"flex", gap:20 }}>
        <div style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Client","Contact","Permis",t.rentals||"Locations","Total dépensé",t.type||"Type"].map(l=>(
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
                      <Badge label={c.type==="entreprise"?t.company||"Entreprise":t.individual||"Particulier"} color={c.type==="entreprise"?T.blue:T.sub}/>
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
              <div style={{ display:"flex", gap:8, marginTop:14 }}>
                <button style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 14px", background:T.card, border:`1px solid ${T.border2}`, borderRadius:10, color:T.text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }} onClick={()=>setModal("edit")}>{Icons.edit} Modifier</button>
                <Btn variant="danger" icon={Icons.trash} style={{ padding:"9px 11px" }} onClick={async ()=>{ 
                  if(!window.confirm("Supprimer ce client ?")) return;
                  await supabase.from("clients").delete().eq("id", sel.id); 
                  setClients(clients.filter(c=>c.id!==sel.id)); 
                  setSel(null); 
                }}/>
              </div>
            </Card>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={t.newClient||"Nouveau client"} onClose={()=>setModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Input label="Prénom" value={form.firstName} onChange={v=>setForm({...form,firstName:v})} placeholder="Marie"/>
            <Input label="Nom" value={form.lastName} onChange={v=>setForm({...form,lastName:v})} placeholder="Dupont"/>
            <div style={{ gridColumn:"1/-1" }}><Input label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="marie@email.fr"/></div>
            <Input label={lang==="en"?"Phone":"Téléphone"} value={form.phone} onChange={v=>setForm({...form,phone:v})} placeholder="+33 6 …"/>
            <Input label="Expiration du permis" type="date" value={form.licenseExpiry} onChange={v=>setForm({...form,licenseExpiry:v})}/>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:22 }}>
            <Btn label={t.cancel||"Annuler"} onClick={()=>setModal(false)} variant="secondary"/>
            <Btn label={t.save||"Créer le client"} onClick={async ()=>{
              const newC = { utilisateur_id: user.id, first_name: form.firstName, last_name: form.lastName, email: form.email, phone: form.phone, type: form.type, license_expiry: form.licenseExpiry, locations_count: 0, total_spent: 0 };
              const { data, error } = await supabase.from("clients").insert(newC).select().single();
              if (data) setClients([...clients, { ...data, firstName: data.first_name, lastName: data.last_name, licenseExpiry: data.license_expiry, totalSpent: data.total_spent, locations: data.locations_count }]);
              setModal(false);
            }} variant="primary"/>
          </div>
        </Modal>
      )}
    </Page>
  );
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
function Payments({ payments, setPayments, clients, rentals, user }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const [filter, setFilter] = useState("all");
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ clientId:"", rentalId:"", amount:"", deposit:"", method:"Espèces", status:"en attente", paidAt:"" });
  const up = (k,v) => setForm(prev=>({...prev,[k]:v}));

  const filtered = payments.filter(p=>filter==="all"||p.status===filter);
  const stats = [
    {label:t.collected||"Encaissé",   value:payments.filter(p=>p.status==="encaissé").reduce((a,p)=>a+(p.amount||0),0),  color:T.success, icon:Icons.check },
    {label:t.pending||"En attente", value:payments.filter(p=>p.status==="en attente").reduce((a,p)=>a+(p.amount||0),0),color:T.amber,   icon:Icons.clock  },
    {label:t.late||"En retard",  value:payments.filter(p=>p.status==="en retard").reduce((a,p)=>a+(p.amount||0),0), color:T.red,     icon:Icons.alert  },
    {label:"Cautions",   value:payments.reduce((a,p)=>a+(p.deposit||0),0),                                   color:T.blue,    icon:Icons.shield },
  ];

  const handleAdd = async () => {
    const client = clients.find(c=>c.id===form.clientId);
    const newP = {
      utilisateur_id: user.id,
      client_id: form.clientId,
      rental_id: form.rentalId||null,
      client_name: client?`${client.firstName} ${client.lastName}`:"—",
      amount: parseInt(form.amount)||0,
      deposit: parseInt(form.deposit)||0,
      method: form.method,
      status: form.status,
      paid_at: form.paidAt||new Date().toISOString().split("T")[0],
    };
    const { data } = await supabase.from("payments").insert(newP).select().single();
    if (data) setPayments([data, ...payments]);
    setModal(false);
    setForm({ clientId:"", rentalId:"", amount:"", deposit:"", method:"Espèces", status:"en attente", paidAt:"" });
  };

  const handleEncaisser = async (id) => {
    await supabase.from("payments").update({ status:"encaissé" }).eq("id", id);
    setPayments(payments.map(p=>p.id===id?{...p,status:"encaissé"}:p));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce paiement ?")) return;
    await supabase.from("payments").delete().eq("id", id);
    setPayments(payments.filter(p=>p.id!==id));
  };

  return (
    <Page title={t.payments||"Paiements"} sub={lang==="en"?"Collections, transactions and deposits":"Encaissements, transactions et cautions"}
      actions={<button onClick={()=>setModal(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:T.gold, border:"none", borderRadius:10, color:"#0F0D0B", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{Icons.plus} {lang==="en"?"New payment":"Nouveau paiement"}</button>}>
      
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
        {[["all",lang==="en"?"All":"Tous"],["encaissé",t.collected||"Encaissé"],["en attente",t.pending||"En attente"],["en retard",t.late||"En retard"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)}
            style={{ padding:"7px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", background:filter===k?T.goldDim:T.card, border:`1px solid ${filter===k?T.gold:T.border}`, color:filter===k?T.gold:T.sub, transition:"all .15s", fontFamily:"inherit" }}>{l}</button>
        ))}
      </div>

      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>{[t.client||"Client",t.amount||"Montant",t.deposit||"Caution",t.method||"Méthode",t.date||"Date",t.status||"Statut",t.actions||"Actions"].map(l=>(
              <th key={l} style={{ textAlign:"left", padding:"10px 16px", fontSize:10, fontWeight:700, color:T.muted, letterSpacing:".1em", textTransform:"uppercase", borderBottom:`1px solid ${T.border}` }}>{l}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.length===0 && (
              <tr><td colSpan={7} style={{ textAlign:"center", padding:60, color:T.muted, fontSize:13 }}>{lang==="en"?'No payments — click "New payment" to start':'Aucun paiement — cliquez sur "Nouveau paiement" pour commencer'}</td></tr>
            )}
            {filtered.map(p=>(
              <tr key={p.id} style={{ transition:"background .1s" }}
                onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar name={p.client_name||"?"} size={32}/>
                    <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{p.client_name||"—"}</span>
                  </div>
                </td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:15, fontWeight:700, color:T.gold }}>{fmt(p.amount)} €</td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:13, color:T.sub }}>{fmt(p.deposit)} €</td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:12, color:T.sub }}>{p.method}</td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:12, color:T.muted }}>{fmtDate(p.paid_at)}</td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}><StatusBadge status={p.status}/></td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ display:"flex", gap:6 }}>
                    {p.status!=="encaissé" && (
                      <button onClick={()=>handleEncaisser(p.id)}
                        style={{ padding:"5px 10px", background:T.successDim, border:`1px solid ${T.success}30`, borderRadius:8, color:T.success, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                        Encaisser
                      </button>
                    )}
                    {p.status==="en retard" && (
                      <button onClick={async ()=>{
                        const client = clients.find(c=>c.id===p.client_id);
                        if(client?.email) { await sendEmail("payment_reminder", client.email, { clientName:p.client_name, amount:p.amount }); alert("Rappel envoyé !"); }
                        else alert("Email client introuvable");
                      }} style={{ padding:"5px 10px", background:T.amberDim||"#2A2010", border:`1px solid ${T.amber}30`, borderRadius:8, color:T.amber, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                        📧 Rappel
                      </button>
                    )}
                    <button onClick={()=>handleDelete(p.id)}
                      style={{ padding:"5px 9px", background:T.redDim, border:`1px solid ${T.red}30`, borderRadius:8, color:T.red, cursor:"pointer", display:"flex" }}>
                      {Icons.trash}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={t.newPayment||"Nouveau paiement"} onClose={()=>setModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Client</label>
              <select value={form.clientId} onChange={e=>up("clientId",e.target.value)}
                style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                <option value="">{lang==="en"?"— Select —":"— Sélectionner —"}</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Location associée</label>
              <select value={form.rentalId} onChange={e=>up("rentalId",e.target.value)}
                style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                <option value="">{"— Optionnel —"}</option>
                {rentals.map(r=><option key={r.id} value={r.id}>{r.client_name} — {r.vehicle_name}</option>)}
              </select>
            </div>
            <Input label={t.amount||"Montant (€)"} type="number" value={form.amount} onChange={v=>up("amount",v)}/>
            <Input label={t.deposit||"Caution (€)"} type="number" value={form.deposit} onChange={v=>up("deposit",v)}/>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Méthode</label>
              <select value={form.method} onChange={e=>up("method",e.target.value)}
                style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                {["Espèces","Carte bancaire","Virement","Chèque","PayPal"].map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Statut</label>
              <select value={form.status} onChange={e=>up("status",e.target.value)}
                style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                {["en attente","encaissé","en retard"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <Input label={t.date||"Date"} type="date" value={form.paidAt} onChange={v=>up("paidAt",v)}/>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:22 }}>
            <button onClick={()=>setModal(false)} style={{ padding:"9px 18px", background:T.card, border:`1px solid ${T.border2}`, borderRadius:10, color:T.text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{t.cancel||"Annuler"}</button>
            <button onClick={handleAdd} style={{ padding:"9px 18px", background:T.gold, border:"none", borderRadius:10, color:"#0F0D0B", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{t.save||"Enregistrer"}</button>
          </div>
        </Modal>
      )}
    </Page>
  );
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
function Documents({ agencyProfile, vehicles, clients }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const [docType, setDocType] = useState("contrat");
  const [p, setP] = useState({clientId:"",vehicleId:"",startDate:"",endDate:"",price:"",deposit:"",km:"",kmReturn:"",fuelLevel:"full",fuelReturn:"full",notes:"",invoiceNum:""});
  const up = (k,v) => setP(prev=>({...prev,[k]:v}));
  const days  = Math.ceil((new Date(p.endDate)-new Date(p.startDate))/86400000);
  const total = (parseInt(p.price)||0)*(days>0?days:0);
  const tva   = Math.round(total * 0.20);
  const totalHT = total - tva;
  const selectedClient  = clients.find(c=>c.id===p.clientId)||null;
  const selectedVehicle = vehicles.find(v=>v.id===p.vehicleId)||null;
  const agencyName = agencyProfile?.agency_name || "Mon Agence";
  const agencyAddress = agencyProfile?.address || "Adresse de l'agence";
  const agencySiret = agencyProfile?.siret || "SIRET : XX XXX XXX XXXXX";
  const docNum = `LQ-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;

  const printDoc = () => {
    const el = document.getElementById("doc-preview");
    if (!el) return;
    const w = window.open("","_blank");
    w.document.write(`<html><head><title>Document Loqar</title><style>body{margin:0;font-family:Arial,sans-serif;color:#1A1510;}@media print{body{margin:0}}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(()=>{ w.print(); w.close(); }, 400);
  };

  const docTypes = [
    {id:"contrat", l:t.contract||"Contrat", d:"Location auto"},
    {id:"facture", l:t.invoice||"Facture", d:"Document officiel"},
    {id:"etat",    l:t.inspection||"État des lieux", d:"Avant / Après"},
    {id:"devis",   l:t.quote||"Devis", d:"Proposition de prix"},
  ];

  const checkItems = [
    "Carrosserie avant","Carrosserie arrière","Carrosserie gauche","Carrosserie droite",
    "Toit","Pare-brise","Vitres","Rétroviseurs","Pneus et jantes","Intérieur / Sièges",
    t.dashboard||"Tableau de bord","Coffre","Roue de secours","Documents du véhicule","Clés"
  ];
  const [checks, setChecks] = useState({});
  const toggleCheck = (item, val) => setChecks(prev=>({...prev,[item]:val}));

  return (
    <Page title={t.documents||"Documents"} sub={lang==="en"?"Generate legally compliant contracts, quotes and invoices":"Générez contrats, devis et factures légalement conformes"}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:26 }}>
        {docTypes.map(dt=>{
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
              
              {/* Client selector */}
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Client</label>
                <select value={p.clientId} onChange={e=>up("clientId",e.target.value)}
                  style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                  <option value="">{lang==="en"?"— Select —":"— Sélectionner —"}</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>

              {/* Vehicle selector */}
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{lang==="en"?"Vehicle":"Véhicule"}</label>
                <select value={p.vehicleId} onChange={e=>up("vehicleId",e.target.value)}
                  style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                  <option value="">{lang==="en"?"— Select —":"— Sélectionner —"}</option>
                  {vehicles.map(v=><option key={v.id} value={v.id}>{v.name} — {v.plate}</option>)}
                </select>
              </div>

              <Input label={t.price||"Prix/jour (€)"} value={p.price} onChange={v=>up("price",v)} type="number"/>
              <Input label={t.deposit||"Caution (€)"} value={p.deposit} onChange={v=>up("deposit",v)} type="number"/>
              <Input label={lang==="en"?"Start mileage":"Km départ"} value={p.km} onChange={v=>up("km",v)} type="number"/>
              {(docType==="etat"||docType==="contrat") && <Input label={lang==="en"?"End mileage":"Km retour"} value={p.kmReturn} onChange={v=>up("kmReturn",v)} type="number"/>}
              <Input label={t.start||"Début"} type="date" value={p.startDate} onChange={v=>up("startDate",v)}/>
              <Input label={t.end||"Fin"} type="date" value={p.endDate} onChange={v=>up("endDate",v)}/>

              {/* Fuel level */}
              {(docType==="etat"||docType==="contrat") && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[["fuelLevel",lang==="en"?"Fuel out":"Carburant départ"],["fuelReturn",lang==="en"?"Fuel in":"Carburant retour"]].map(([key,lbl])=>(
                    <div key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{lbl}</label>
                      <select value={p[key]} onChange={e=>up(key,e.target.value)}
                        style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"8px 10px", color:T.text, fontSize:12, fontFamily:"inherit", outline:"none" }}>
                        {(lang==="en"?["Full","3/4","1/2","1/4","Empty"]:["Plein","3/4","1/2","1/4","Vide"]).map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{lang==="en"?"Notes / Comments":"Notes / Observations"}</label>
                <textarea value={p.notes} onChange={e=>up("notes",e.target.value)} rows={3}
                  style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.6 }}/>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:18 }}>
              <button onClick={printDoc}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 18px", background:T.gold, border:"none", borderRadius:10, color:"#0F0D0B", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                {Icons.download} Télécharger PDF
              </button>
            </div>
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

          <div id="doc-preview" style={{ background:"#FDFBF7", borderRadius:14, padding:40, color:"#1A1510", fontSize:12, lineHeight:1.7, boxShadow:"0 2px 30px #00000025" }}>
            
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:26, paddingBottom:16, borderBottom:"2px solid #1A1510" }}>
              <div>
                <div style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.03em", color:"#1A1510" }}>{agencyName}</div>
                <div style={{ fontSize:10, color:"#666", marginTop:2 }}>{agencyAddress}</div>
                <div style={{ fontSize:10, color:"#666" }}>{agencySiret}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:16, fontWeight:700, textTransform:"uppercase", color:"#1A1510", letterSpacing:"0.05em" }}>
                  {lang==="en"?{contrat:"Rental Contract",facture:"Invoice",etat:"Inspection Report",devis:"Quote"}[docType]:{contrat:"Contrat de Location",facture:"Facture",etat:"État des Lieux",devis:"Devis"}[docType]}
                </div>
                <div style={{ fontSize:10, color:"#888", marginTop:3 }}>N° {docNum}</div>
                <div style={{ fontSize:10, color:"#888" }}>Date : {new Date().toLocaleDateString("fr-FR")}</div>
              </div>
            </div>

            {/* Parties */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              <div style={{ padding:"12px 14px", background:"#F5F0E8", borderRadius:8 }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>{lang==="en"?"Lessor":"Loueur"}</div>
                <div style={{ fontWeight:700, fontSize:13 }}>{agencyName}</div>
                <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{agencyAddress}</div>
                <div style={{ fontSize:11, color:"#555" }}>{agencySiret}</div>
              </div>
              <div style={{ padding:"12px 14px", background:"#F5F0E8", borderRadius:8 }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>{lang==="en"?"Tenant":"Locataire"}</div>
                {selectedClient ? <>
                  <div style={{ fontWeight:700, fontSize:13 }}>{selectedClient.firstName} {selectedClient.lastName}</div>
                  <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{selectedClient.email}</div>
                  <div style={{ fontSize:11, color:"#555" }}>{selectedClient.phone}</div>
                  <div style={{ fontSize:11, color:"#555" }}>Permis : {fmtDate(selectedClient.licenseExpiry)}</div>
                </> : <div style={{ fontSize:11, color:"#AAA", fontStyle:"italic" }}>{lang==="en"?"Select a client":"Sélectionnez un client"}</div>}
              </div>
            </div>

            {/* Vehicle info */}
            <div style={{ padding:"12px 14px", background:"#F5F0E8", borderRadius:8, marginBottom:20 }}>
              <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>{lang==="en"?"Vehicle":"Véhicule"}</div>
              {selectedVehicle ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {lang==="en"?[["Model",selectedVehicle.name],["Plate",selectedVehicle.plate],["Fuel",selectedVehicle.fuel],["Gearbox",selectedVehicle.trans]]:[["Désignation",selectedVehicle.name],["Immatriculation",selectedVehicle.plate],["Carburant",selectedVehicle.fuel],["Transmission",selectedVehicle.trans]].map(([k,v])=>(
                    <div key={k}>
                      <div style={{ fontSize:9, color:"#888" }}>{k}</div>
                      <div style={{ fontWeight:700, fontSize:11 }}>{v||"—"}</div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ fontSize:11, color:"#AAA", fontStyle:"italic" }}>{lang==="en"?"Select a vehicle":"Sélectionnez un véhicule"}</div>}
            </div>

            {/* Location details */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
              {lang==="en"?[["Start",fmtDate(p.startDate)||"—"],["End",fmtDate(p.endDate)||"—"],["Duration",days>0?`${days} day(s)`:"—"],["Start km",p.km?fmt(parseInt(p.km))+" km":"—"]]:[["Début",fmtDate(p.startDate)||"—"],["Fin",fmtDate(p.endDate)||"—"],["Durée",days>0?`${days} jour(s)`:"—"],["Km départ",p.km?fmt(parseInt(p.km))+" km":"—"]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px", background:"#F5F0E8", borderRadius:6 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".08em", marginBottom:3 }}>{k}</div>
                  <div style={{ fontWeight:700, color:"#1A1510", fontSize:12 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Carburant */}
            {(docType==="etat"||docType==="contrat") && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {lang==="en"?[["Fuel level out",p.fuelLevel],["Fuel level in",p.fuelReturn]]:[["Niveau carburant départ",p.fuelLevel],["Niveau carburant retour",p.fuelReturn]].map(([k,v])=>(
                  <div key={k} style={{ padding:"10px 12px", background:"#F5F0E8", borderRadius:6 }}>
                    <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".08em", marginBottom:3 }}>{k}</div>
                    <div style={{ fontWeight:700, color:"#1A1510", fontSize:12 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Checklist état des lieux */}
            {docType==="etat" && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#1A1510", marginBottom:10, textTransform:"uppercase", letterSpacing:".08em" }}>{lang==="en"?"Vehicle Condition Check":"Contrôle de l'état du véhicule"}</div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"#1A1510" }}>
                      <th style={{ padding:"6px 10px", textAlign:"left", fontSize:10, color:"#EDE5D4", fontWeight:700 }}>Élément</th>
                      <th style={{ padding:"6px 10px", textAlign:"center", fontSize:10, color:"#EDE5D4", fontWeight:700 }}>Bon état</th>
                      <th style={{ padding:"6px 10px", textAlign:"center", fontSize:10, color:"#EDE5D4", fontWeight:700 }}>Dommage</th>
                      <th style={{ padding:"6px 10px", textAlign:"left", fontSize:10, color:"#EDE5D4", fontWeight:700 }}>Observations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkItems.map((item,i)=>(
                      <tr key={item} style={{ background:i%2===0?"#fff":"#FAF7F0" }}>
                        <td style={{ padding:"6px 10px", fontSize:11, fontWeight:600 }}>{item}</td>
                        <td style={{ padding:"6px 10px", textAlign:"center" }}>
                          <input type="radio" name={item} value="ok" checked={checks[item]==="ok"} onChange={()=>toggleCheck(item,"ok")}/>
                        </td>
                        <td style={{ padding:"6px 10px", textAlign:"center" }}>
                          <input type="radio" name={item} value="dmg" checked={checks[item]==="dmg"} onChange={()=>toggleCheck(item,"dmg")}/>
                        </td>
                        <td style={{ padding:"6px 10px" }}>
                          <input placeholder="..." style={{ border:"none", borderBottom:"1px solid #DDD", background:"transparent", width:"100%", fontSize:10, outline:"none" }}/>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Financial table */}
            {(docType==="contrat"||docType==="facture"||docType==="devis") && (
              <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:16 }}>
                <thead>
                  <tr style={{ background:"#1A1510" }}>
                    {[["Description","left"],["Qté","right"],["P.U. HT","right"],["TVA 20%","right"],["Total TTC","right"]].map(([l,a])=>(
                      <th key={l} style={{ padding:"8px 12px", textAlign:a, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"#EDE5D4" }}>{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background:"#fff" }}>
                    <td style={{ padding:"8px 12px", fontSize:12 }}>{lang==="en"?"Rental":"Location"} {selectedVehicle?.name||""}</td>
                    <td style={{ padding:"8px 12px", fontSize:12, textAlign:"right" }}>{days>0?days+"j":"—"}</td>
                    <td style={{ padding:"8px 12px", fontSize:12, textAlign:"right" }}>{p.price?Math.round(parseInt(p.price)/1.2)+" €":"—"}</td>
                    <td style={{ padding:"8px 12px", fontSize:12, textAlign:"right" }}>{p.price?Math.round(parseInt(p.price)*days*0.2/days)+" €":"—"}</td>
                    <td style={{ padding:"8px 12px", fontSize:12, fontWeight:700, textAlign:"right" }}>{total>0?total+" €":"—"}</td>
                  </tr>
                  <tr style={{ background:"#FAF7F0" }}>
                    <td style={{ padding:"8px 12px", fontSize:12 }}>{lang==="en"?"Deposit (refundable)":"Caution (remboursable)"}</td>
                    <td style={{ padding:"8px 12px", fontSize:12, textAlign:"right" }}>1</td>
                    <td style={{ padding:"8px 12px", fontSize:12, textAlign:"right", color:"#888" }}>—</td>
                    <td style={{ padding:"8px 12px", fontSize:12, textAlign:"right", color:"#888" }}>{lang==="en"?"exempt":"exonérée"}</td>
                    <td style={{ padding:"8px 12px", fontSize:12, fontWeight:700, textAlign:"right" }}>{p.deposit?p.deposit+" €":"—"}</td>
                  </tr>
                  <tr style={{ background:"#1A1510" }}>
                    <td colSpan={4} style={{ padding:"10px 12px", fontWeight:700, textAlign:"right", color:"#EDE5D4", textTransform:"uppercase", letterSpacing:".04em" }}>{lang==="en"?"Total":"Total TTC"}</td>
                    <td style={{ padding:"10px 12px", fontWeight:700, textAlign:"right", fontSize:15, color:"#C9A55A" }}>{total>0?total+" €":"—"}</td>
                  </tr>
                </tbody>
              </table>
            )}

            {p.notes && (
              <div style={{ padding:"10px 14px", background:"#F5F0E8", borderRadius:6, borderLeft:"3px solid #C9A55A", marginBottom:20 }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>{lang==="en"?"Notes":"Notes / Observations"}</div>
                <div style={{ fontSize:12, color:"#444" }}>{p.notes}</div>
              </div>
            )}

            {/* Clauses légales contrat */}
            {docType==="contrat" && (
              <div style={{ marginBottom:20, padding:"12px 14px", background:"#F5F0E8", borderRadius:8 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#1A1510", marginBottom:8, textTransform:"uppercase", letterSpacing:".08em" }}>{lang==="en"?"General Rental Terms":"Conditions générales de location"}</div>
                <div style={{ fontSize:9, color:"#555", lineHeight:1.6 }}>
                  <p style={{ margin:"0 0 6px" }}>1. <strong>Responsabilité</strong> — Le locataire est responsable de tous les dommages causés au véhicule pendant la durée de la location, y compris en cas de vol.</p>
                  <p style={{ margin:"0 0 6px" }}>2. <strong>Carburant</strong> — Le véhicule doit être restitué avec le même niveau de carburant qu'au départ. Tout déficit sera facturé.</p>
                  <p style={{ margin:"0 0 6px" }}>3. <strong>Kilométrage</strong> — Tout dépassement du kilométrage convenu sera facturé selon le tarif en vigueur.</p>
                  <p style={{ margin:"0 0 6px" }}>4. <strong>Caution</strong> — La caution sera restituée dans un délai de 7 jours après la restitution du véhicule, sous réserve d'absence de dommages.</p>
                  <p style={{ margin:"0 0 6px" }}>5. <strong>Assurance</strong> — Le locataire doit être titulaire d'un permis de conduire valide. Le véhicule est couvert par l'assurance du loueur (RC + dommages tous accidents avec franchise).</p>
                  <p style={{ margin:"0 0 0" }}>6. <strong>Restitution</strong> — Le véhicule doit être restitué aux date, heure et lieu convenus. Tout retard non signalé pourra faire l'objet d'une facturation supplémentaire.</p>
                </div>
              </div>
            )}

            {/* Signatures */}
            <div style={{ marginTop:30, display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, paddingTop:20, borderTop:"1px solid #DDD5C8" }}>
              {(lang==="en"?["Lessor's signature","Tenant's signature"]:["Signature du loueur","Signature du locataire"]).map(l=>(
                <div key={l}>
                  <div style={{ fontSize:10, color:"#888", marginBottom:4 }}>{l} :</div>
                  <div style={{ fontSize:9, color:"#AAA", marginBottom:20, fontStyle:"italic" }}>{lang==="en"?"Read and approved":"Lu et approuvé"}</div>
                  <div style={{ height:50, borderBottom:"1px solid #C8B89A" }}/>
                  <div style={{ fontSize:9, color:"#AAA", marginTop:4 }}>Date : _______________</div>
                </div>
              ))}
            </div>

            {/* Footer légal */}
            <div style={{ marginTop:24, paddingTop:12, borderTop:"1px solid #EEE", textAlign:"center" }}>
              <div style={{ fontSize:9, color:"#AAA" }}>{agencyName} — {agencySiret} — Document généré par Loqar</div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

// ─── PRICING ─────────────────────────────────────────────────────────────────
const getPlans = (lang="fr") => [
  {
    id:"starter", name:"Starter", tagline:lang==="en"?"Start solo":"Pour démarrer seul",
    monthlyPrice:49, annualPrice:39, annualTotal:468, color:T.blue, colorDim:T.blueDim,
    highlight:false, cta:lang==="en"?"Start free trial":"Commencer l'essai", note:lang==="en"?"14 days · No card required":"14 jours · Aucune CB requise",
    features:[
      {t:lang==="en"?"Up to 3 vehicles":"Jusqu'à 3 véhicules",ok:true},{t:lang==="en"?"Unlimited clients":"Clients illimités",ok:true},
      {t:lang==="en"?"PDF contracts & inspections":"Contrats & état des lieux PDF",ok:true},{t:lang==="en"?"Payment tracking":"Suivi des paiements",ok:true},
      {t:lang==="en"?"Gantt calendar view":"Vue Gantt du calendrier",ok:true},{t:lang==="en"?"License expiry alerts":"Alertes permis expirés",ok:true},
      {t:lang==="en"?"1 user":"1 utilisateur",ok:true},{t:lang==="en"?"Advanced reports":"Rapports avancés",ok:false},
      {t:lang==="en"?"Accounting export":"Export comptable",ok:false},{t:lang==="en"?"API & webhooks":"API & webhooks",ok:false},{t:lang==="en"?"White label":"Marque blanche",ok:false},
    ],
  },
  {
    id:"pro", name:"Pro", tagline:lang==="en"?"For growing agencies":"Pour l'agence qui grandit", badge:lang==="en"?"Most popular":"Le plus populaire",
    monthlyPrice:129, annualPrice:99, annualTotal:1188, color:T.gold, colorDim:T.goldDim,
    highlight:true, cta:lang==="en"?"Try Pro":"Essayer le Pro", note:lang==="en"?"14 days · No card required":"14 jours · Aucune CB requise",
    features:[
      {t:lang==="en"?"Up to 15 vehicles":"Jusqu'à 15 véhicules",ok:true},{t:lang==="en"?"Unlimited clients":"Clients illimités",ok:true},
      {t:lang==="en"?"PDF contracts & inspections":"Contrats & état des lieux PDF",ok:true},{t:lang==="en"?"Payment tracking":"Suivi des paiements",ok:true},
      {t:lang==="en"?"Gantt calendar view":"Vue Gantt du calendrier",ok:true},{t:lang==="en"?"License expiry alerts":"Alertes permis expirés",ok:true},
      {t:lang==="en"?"Up to 3 users":"Jusqu'à 3 utilisateurs",ok:true},{t:lang==="en"?"Advanced reports":"Rapports avancés",ok:true},
      {t:lang==="en"?"CSV accounting export":"Export comptable CSV",ok:true},{t:lang==="en"?"API & webhooks":"API & webhooks",ok:false},{t:lang==="en"?"White label":"Marque blanche",ok:false},
    ],
  },
  {
    id:"enterprise", name:"Enterprise", tagline:lang==="en"?"For multi-site operations":"Pour les structures multi-sites",
    monthlyPrice:249, annualPrice:199, annualTotal:2388, color:T.amber, colorDim:T.amberDim,
    highlight:false, cta:lang==="en"?"Contact us":"Nous contacter", note:lang==="en"?"Personalized onboarding included":"Onboarding personnalisé inclus",
    features:[
      {t:lang==="en"?"Unlimited vehicles":"Véhicules illimités",ok:true},{t:lang==="en"?"Unlimited clients":"Clients illimités",ok:true},
      {t:lang==="en"?"PDF contracts & inspections":"Contrats & état des lieux PDF",ok:true},{t:lang==="en"?"Payment tracking":"Suivi des paiements",ok:true},
      {t:lang==="en"?"Gantt calendar view":"Vue Gantt du calendrier",ok:true},{t:lang==="en"?"License expiry alerts":"Alertes permis expirés",ok:true},
      {t:lang==="en"?"Unlimited users":"Utilisateurs illimités",ok:true},{t:lang==="en"?"Advanced reports":"Rapports avancés",ok:true},
      {t:lang==="en"?"CSV + ERP export":"Export comptable CSV + ERP",ok:true},{t:lang==="en"?"API & webhooks":"API & webhooks",ok:true},{t:lang==="en"?"White label":"Marque blanche",ok:true},
    ],
  },
];

const getFAQS = (lang="fr") => [
  {q:lang==="en"?"Can I change my plan at any time?":"Puis-je changer de plan à tout moment ?", a:lang==="en"?"Yes, no commitment. Upgrade immediately, downgrade at end of current period.":"Oui, sans engagement. Passage au plan supérieur immédiat, retour au plan inférieur à la fin de la période en cours."},
  {q:lang==="en"?"What's included in the 14-day trial?":"Qu'inclut l'essai de 14 jours ?", a:lang==="en"?"Full access to all features of chosen plan. No credit card required.":"Accès complet à toutes les fonctionnalités du plan choisi. Aucune carte bancaire requise pour démarrer."},
  {q:lang==="en"?"Is the tenant plan really free?":"Le plan locataire est-il vraiment gratuit ?", a:lang==="en"?"Yes. Your clients access their space for free: contracts, e-signature, rental history.":"Oui. Vos clients accèdent gratuitement à leur espace : contrats, signature électronique, historique de locations."},
  {q:lang==="en"?"Are there fees on payments?":"Y a-t-il des frais sur les paiements ?", a:lang==="en"?"A 0.8% fee applies only if you use integrated Stripe payments.":"Une commission de 0,8% s'applique uniquement si vous utilisez l'encaissement intégré via Stripe."},
  {q:lang==="en"?"Is my data secure?":"Mes données sont-elles sécurisées ?", a:lang==="en"?"France hosting, AES-256 encryption, full GDPR compliance.":"Hébergement France, chiffrement AES-256, conformité RGPD complète."},
];

function PlanCard({ plan, annual }) {
  const lang = useLang();
  const [hov, setHov] = useState(false);
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const savings = plan.monthlyPrice - plan.annualPrice;
  const annualTotal = plan.annualTotal || plan.annualPrice * 12;
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
          : <div style={{ fontSize:11, color:T.muted, marginTop:4 }}>{lang==="en"?"or":"ou"} {plan.annualPrice}€/{lang==="en"?"mo":"mois"} · {plan.annualTotal||plan.annualPrice*12}€/{lang==="en"?"yr":"an"}</div>
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
        onClick={()=>{
          const links = {
            starter:    "https://buy.stripe.com/28E8wPalNdhB9iw2z97kc06",
            pro:        "https://buy.stripe.com/dRmeVdctV7XhgKY2z97kc07",
            enterprise: "https://buy.stripe.com/5kQ9AT79Bcdx1Q4ehR7kc08",
          };
          window.location.href = links[plan.id] || "mailto:contact@loqar.fr";
        }}
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
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const [annual, setAnnual] = useState(false);
  return (
    <Page title={lang==="en"?"Pricing":"Abonnements"} sub={lang==="en"?"Choose the plan that fits your business":"Choisissez le plan adapté à votre activité"}>
      {/* Toggle mensuel / annuel */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:40 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, background:T.card, border:`1px solid ${T.border}`, borderRadius:99, padding:"8px 20px" }}>
          <span style={{ fontSize:13, fontWeight:annual?400:600, color:annual?T.muted:T.text, transition:"all .2s" }}>{ lang==="en"?"Monthly":"Mensuel" }</span>
          <button onClick={()=>setAnnual(!annual)}
            style={{ width:44, height:24, borderRadius:99, background:annual?T.gold:T.border2, border:"none", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
            <div style={{ width:18, height:18, borderRadius:"50%", background:annual?"#0F0D0B":"#fff", position:"absolute", top:3, left:annual?23:3, transition:"left .2s", boxShadow:"0 1px 4px #00000040" }}/>
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:13, fontWeight:annual?600:400, color:annual?T.text:T.muted, transition:"all .2s" }}>{ lang==="en"?"Annual":"Annuel" }</span>
            <span style={{ background:T.successDim, border:`1px solid ${T.success}25`, color:T.success, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:99 }}>−24%</span>
          </div>
        </div>
      </div>

      {/* Cartes plans */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:48, alignItems:"start" }}>
        {getPlans(lang).map(plan=><PlanCard key={plan.id} plan={plan} annual={annual}/>)}
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
              <Badge label={lang==="en"?"FREE":"GRATUIT"} color={T.success}/>
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
                {getPlans(lang).map(p=>(
                  <th key={p.id} style={{ padding:"12px 18px", textAlign:"center", fontSize:13, fontWeight:700, color:p.color, borderBottom:`1px solid ${T.border}` }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [t.vehicles||"Véhicules","3","15","Illimité"],
                [t.clients||lang==="en"?"Clients":"Clients","Illimité","Illimité","Illimité"],
                [lang==="en"?"PDF Contracts":"Contrats PDF","✓","✓","✓"],
                [t.payments||"Paiements","✓","✓","✓"],
                [lang==="en"?"Gantt view":"Vue Gantt","✓","✓","✓"],
                [lang==="en"?"License alerts":"Alertes permis","✓","✓","✓"],
                [lang==="en"?"Users":"Utilisateurs","1","3","Illimité"],
                [lang==="en"?"Advanced reports":"Rapports avancés","—","✓","✓"],
                [lang==="en"?"Accounting export":"Export comptable","—","CSV","CSV + ERP"],
                ["API & webhooks","—","—","✓"],
                [lang==="en"?"White label":"Marque blanche","—","—","✓"],
                [lang==="en"?"Support":"Support","Email","Email prioritaire","Téléphone dédié"],
                [lang==="en"?"Monthly price":"Prix mensuel","49 €","129 €","249 €"],
                [lang==="en"?"Annual price":"Prix annuel","468 €/an","1 188 €/an","2 388 €/an"],
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
          {getFAQS(lang).map((f,i)=><FaqItem key={i} q={f.q} a={f.a}/>)}
        </Card>
      </div>

      {/* CTA final */}
      <div style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:16, padding:"40px 36px", textAlign:"center" }}>
        <div style={{ fontSize:24, fontWeight:700, letterSpacing:"-.03em", color:T.text, marginBottom:10 }}>Prêt à piloter votre flotte ?</div>
        <p style={{ fontSize:13, color:T.sub, marginBottom:24, lineHeight:1.7 }}>14 jours gratuits, aucune carte bancaire requise.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <Btn label={lang==="en"?"Start free":"Démarrer gratuitement"} variant="primary" size="lg"/>
          <Btn label={lang==="en"?"See a demo":"Voir une démo"} variant="secondary" size="lg"/>
        </div>
        <div style={{ marginTop:14, fontSize:11, color:T.muted }}>✓ 14 jours gratuits · ✓ Aucune CB · ✓ Résiliation en 1 clic</div>
      </div>
    </Page>
  );
}


// ─── LOCATIONS ────────────────────────────────────────────────────────────────
function Rentals({ rentals, setRentals, vehicles, clients, user, userPlan = "starter" }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const [modal, setModal] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [sel, setSel]     = useState(null);
  const [form, setForm]   = useState({ clientId:"", vehicleId:"", startDate:"", endDate:"", pricePerDay:"", deposit:"", km:"", notes:"" });
  const up = (k,v) => setForm(prev=>({...prev,[k]:v}));

  const days  = Math.ceil((new Date(form.endDate)-new Date(form.startDate))/86400000);
  const total = (parseInt(form.pricePerDay)||0)*(days>0?days:0);

  const statusColor = { "en cours":T.success, "terminée":T.muted, "annulée":T.red, "réservée":T.amber };

  const handleAdd = async () => {
    const client  = clients.find(c=>c.id===form.clientId);
    const vehicle = vehicles.find(v=>v.id===form.vehicleId);
    if (!client || !vehicle) return alert("Sélectionnez un client et un véhicule");
    if (!form.startDate || !form.endDate) return alert("Renseignez les dates");
    const newR = {
      utilisateur_id: user.id,
      client_id: form.clientId,
      vehicle_id: form.vehicleId,
      client_name: `${client.firstName} ${client.lastName}`,
      vehicle_name: `${vehicle.name} — ${vehicle.plate}`,
      start_date: form.startDate,
      end_date: form.endDate,
      prix_per_day: parseInt(form.pricePerDay)||0,
      deposit: parseInt(form.deposit)||0,
      total_amount: total,
      km_start: parseInt(form.km)||0,
      notes: form.notes,
      status: "réservée",
    };
    const { data, error } = await supabase.from("rentals").insert(newR).select().single();
    if (data) {
      setRentals([data, ...rentals]);
      const cl = clients.find(c=>c.id===form.clientId);
      if (cl?.email) sendEmail("rental", cl.email, { clientName: cl.firstName+" "+cl.lastName, vehicle: newR.vehicle_name, startDate: form.startDate, endDate: form.endDate, total });
    }
    setModal(false);
    setForm({ clientId:"", vehicleId:"", startDate:"", endDate:"", pricePerDay:"", deposit:"", km:"", notes:"" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette location ?")) return;
    await supabase.from("rentals").delete().eq("id", id);
    setRentals(rentals.filter(r=>r.id!==id));
    setSel(null);
  };

  const handleStatusChange = async (id, status) => {
    await supabase.from("rentals").update({ status }).eq("id", id);
    setRentals(rentals.map(r=>r.id===id?{...r,status}:r));
    if (sel?.id===id) setSel({...sel,status});
  };

  return (
    <Page title={t.rentals||"Locations"} sub={lang==="en"?`${rentals.length} rental(s) registered`:`${rentals.length} location(s) enregistrée(s)`}
      actions={<button onClick={()=>setModal(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:T.gold, border:"none", borderRadius:10, color:"#0F0D0B", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{Icons.plus} {lang==="en"?"New rental":"Nouvelle location"}</button>}>
      
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          [t.inProgress||lang==="en"?"In progress":"En cours",   rentals.filter(r=>r.status==="en cours").length,   T.success],
          [t.reserved||lang==="en"?"Reserved":"Réservées",  rentals.filter(r=>r.status==="réservée").length,   T.amber],
          [t.completed||lang==="en"?"Completed":"Terminées",  rentals.filter(r=>r.status==="terminée").length,   T.muted],
          [lang==="en"?"Revenue":"Chiffre d'affaires", rentals.reduce((a,r)=>a+(r.total_amount||0),0)+"€", T.gold],
        ].map(([label,value,color])=>(
          <Card key={label}>
            <div style={{ fontSize:11, fontWeight:600, color:T.muted, letterSpacing:".08em", textTransform:"uppercase", marginBottom:8 }}>{label}</div>
            <div style={{ fontSize:26, fontWeight:700, color, letterSpacing:"-0.03em" }}>{value}</div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <div style={{ display:"flex", gap:20 }}>
        <div style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>{[t.client||"Client",lang==="en"?"Vehicle":"Véhicule",lang==="en"?"Period":"Période",t.total||"Total",t.status||"Statut",t.actions||"Actions"].map(l=>(
                <th key={l} style={{ textAlign:"left", padding:"11px 16px", fontSize:10, fontWeight:700, color:T.muted, letterSpacing:".1em", textTransform:"uppercase", borderBottom:`1px solid ${T.border}` }}>{l}</th>
              ))}</tr>
            </thead>
            <tbody>
              {rentals.length===0 && (
                <tr><td colSpan={6} style={{ textAlign:"center", padding:60, color:T.muted, fontSize:13 }}>{lang==="en"?'No rentals — click "New rental" to start':'Aucune location — cliquez sur "Nouvelle location" pour commencer'}</td></tr>
              )}
              {rentals.map(r=>(
                <tr key={r.id} onClick={()=>setSel(sel?.id===r.id?null:r)}
                  style={{ cursor:"pointer", background:sel?.id===r.id?T.goldDim:"transparent", transition:"background .1s" }}
                  onMouseEnter={e=>{ if(sel?.id!==r.id) e.currentTarget.style.background=T.card2; }}
                  onMouseLeave={e=>{ if(sel?.id!==r.id) e.currentTarget.style.background="transparent"; }}>
                  <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{r.client_name}</div>
                  </td>
                  <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:12, color:T.sub }}>{r.vehicle_name}</td>
                  <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:12, color:T.sub }}>
                    {fmtDate(r.start_date)} → {fmtDate(r.end_date)}
                  </td>
                  <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:14, fontWeight:700, color:T.gold }}>{fmt(r.total_amount)} €</td>
                  <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                    <select value={r.status} onClick={e=>e.stopPropagation()} onChange={e=>handleStatusChange(r.id,e.target.value)}
                      style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:8, padding:"4px 8px", color:statusColor[r.status]||T.text, fontSize:12, fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
                      {["réservée","en cours","terminée","annulée"].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                    <button onClick={e=>{e.stopPropagation();handleDelete(r.id);}}
                      style={{ background:T.redDim, border:`1px solid ${T.red}30`, borderRadius:8, padding:"5px 9px", color:T.red, cursor:"pointer", display:"flex", alignItems:"center" }}>
                      {Icons.trash}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {sel && (
          <div style={{ width:294, flexShrink:0 }}>
            <Card>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Détail location</div>
                <button onClick={()=>setSel(null)} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", display:"flex" }}>{Icons.x}</button>
              </div>
              {[["Client",sel.client_name],[lang==="en"?"Vehicle":"Véhicule",sel.vehicle_name],[lang==="en"?"Start":"Début",fmtDate(sel.start_date)],[lang==="en"?"End":"Fin",fmtDate(sel.end_date)],["Prix/jour",sel.prix_per_day+" €"],[t.deposit||"Caution",sel.deposit+" €"],[t.total||"Total",sel.total_amount+" €"],["Km départ",sel.km_start?" "+fmt(sel.km_start)+" km":"—"]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
                  <span style={{ fontSize:12, color:T.muted }}>{k}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:T.text }}>{v}</span>
                </div>
              ))}
              {sel.notes && (
                <div style={{ marginTop:12, padding:"10px 12px", background:T.card2, borderRadius:9 }}>
                  <div style={{ fontSize:10, color:T.muted, marginBottom:4 }}>Notes</div>
                  <div style={{ fontSize:12, color:T.sub }}>{sel.notes}</div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Modal nouvelle location */}
      {upgradeModal && <UpgradeModal reason={`Votre plan Starter est limité à ${PLAN_LIMITS.starter.rentals} locations/mois. Passez en Pro pour des locations illimitées.`} onClose={()=>setUpgradeModal(false)}/>}
      {modal && (
        <Modal title={t.newRental||"Nouvelle location"} onClose={()=>setModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Client</label>
              <select value={form.clientId} onChange={e=>up("clientId",e.target.value)}
                style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                <option value="">{lang==="en"?"— Select —":"— Sélectionner —"}</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Véhicule</label>
              <select value={form.vehicleId} onChange={e=>{ up("vehicleId",e.target.value); const v=vehicles.find(x=>x.id===e.target.value); if(v) up("pricePerDay",v.price||""); }}
                style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                <option value="">{lang==="en"?"— Select —":"— Sélectionner —"}</option>
                {vehicles.map(v=><option key={v.id} value={v.id}>{v.name} — {v.plate}</option>)}
              </select>
            </div>

            <Input label={t.start||"Début"} type="date" value={form.startDate} onChange={v=>up("startDate",v)}/>
            <Input label={t.end||"Fin"} type="date" value={form.endDate} onChange={v=>up("endDate",v)}/>
            <Input label={t.price||"Prix/jour (€)"} type="number" value={form.pricePerDay} onChange={v=>up("pricePerDay",v)}/>
            <Input label={t.deposit||"Caution (€)"} type="number" value={form.deposit} onChange={v=>up("deposit",v)}/>
            <Input label={"Km départ"} type="number" value={form.km} onChange={v=>up("km",v)}/>
            
            {days>0 && (
              <div style={{ gridColumn:"1/-1", padding:"12px 14px", background:T.goldDim, border:`1px solid ${T.gold}30`, borderRadius:10 }}>
                <span style={{ fontSize:12, color:T.muted }}>{t.duration||"Durée"} : {days} {"jour(s)"} · </span>
                <span style={{ fontSize:14, fontWeight:700, color:T.gold }}>Total : {total} €</span>
              </div>
            )}

            <div style={{ gridColumn:"1/-1", display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Notes</label>
              <textarea value={form.notes} onChange={e=>up("notes",e.target.value)} rows={2}
                style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical" }}/>
            </div>
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:22 }}>
            <button onClick={()=>setModal(false)} style={{ padding:"9px 18px", background:T.card, border:`1px solid ${T.border2}`, borderRadius:10, color:T.text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{t.cancel||"Annuler"}</button>
            <button onClick={handleAdd} style={{ padding:"9px 18px", background:T.gold, border:"none", borderRadius:10, color:"#0F0D0B", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{t.save||"Créer la location"}</button>
          </div>
        </Modal>
      )}
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
  const [rentals,        setRentals]        = useState([]);
  const [payments,       setPayments]       = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [lang, setLang] = useState(() => localStorage.getItem("loqar_lang") || "fr");
  const handleLang = (l) => { setLang(l); localStorage.setItem("loqar_lang", l); };
  const [showSuccess, setShowSuccess] = useState(() => new URLSearchParams(window.location.search).get("success") === "true");
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [agencyProfile,  setAgencyProfile]  = useState(DEFAULT_AGENCY);
  const [userPlan,       setUserPlan]       = useState("starter");
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
    const [{ data: v }, { data: c }, { data: r }, { data: py }] = await Promise.all([
      supabase.from("vehicles").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("clients").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("rentals").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    ]);
    if (v) setVehicles(v.map(x => ({ ...x, trans: x.transmission, price: x.price_per_day, cat: x.category })));
    if (c) setClients(c.map(x => ({ ...x, firstName: x.first_name, lastName: x.last_name, licenseExpiry: x.license_expiry, totalSpent: x.total_spent, locations: x.locations_count })));
    if (r) setRentals(r);
    if (py) setPayments(py);
  };

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) { setAgencyProfile({ name: data.agency_name||"", logo: data.logo||"🚗", address: data.address||"", phone: data.phone||"", email: data.email||"", website: data.website||"", siret: data.siret||"", iban: data.iban||"", bic: data.bic||"", bankHolder: data.bank_holder||"", terms: data.terms||"", franchise: data.franchise||"800 €" }); setUserPlan(data.plan||"starter"); }
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

  if (showSuccess) return <SuccessPage onContinue={()=>setShowSuccess(false)}/>;
  if (!user) return showLanding ? <LandingPage onGetStarted={()=>setShowLanding(false)}/> : <AuthScreen />;

  const screens = {
    dashboard: <Dashboard vehicles={vehicles} rentals={rentals} payments={payments} clients={clients} onNav={p=>setPage(p)}/>,
    rentals:   <Rentals rentals={rentals} setRentals={setRentals} vehicles={vehicles} clients={clients} user={user} userPlan={userPlan}/>,
    vehicles:  <Vehicles  vehicles={vehicles} setVehicles={setVehicles} user={user} userPlan={userPlan}/>,
    clients:   <Clients   clients={clients}   setClients={setClients} user={user}/>,
    payments:  <Payments payments={payments} setPayments={setPayments} clients={clients} rentals={rentals} user={user}/>,
    documents: <Documents agencyProfile={agencyProfile} vehicles={vehicles} clients={clients}/>,
    signature: <SignaturePage/>,
    pricing:   <Pricing/>,
    settings:  <Settings agencyProfile={agencyProfile} setAgencyProfile={handleSaveProfile}/>,
  };

  return (
    <LangContext.Provider value={lang}>
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {cmdOpen && <CommandBar onClose={()=>setCmdOpen(false)} onNav={p=>{ setPage(p); setCmdOpen(false); }}/>}
      {showOnboarding && <OnboardingScreen onDone={()=>setShowOnboarding(false)} onNav={p=>setPage(p)}/>}
      {notifOpen && <NotifPanel onClose={()=>setNotifOpen(false)}/>}
      <Sidebar page={page} onNav={p=>setPage(p)} user={user} onLogout={handleLogout} onCmd={()=>setCmdOpen(true)} vehicles={vehicles} onNotif={()=>setNotifOpen(o=>!o)} unreadCount={unread} userPlan={userPlan} payments={payments} onLangChange={handleLang}/>
      <main style={{ flex:1, marginLeft:220, minHeight:"100vh" }}>
        <div key={page} style={{ animation:"fadeUp .3s" }}>{screens[page]}</div>
      </main>
    </div>
    </LangContext.Provider>
  );
}

