import { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import { supabase } from "./supabase.js";

const TR = {
fr: {
  dashboard:"Tableau de bord", vehicles:"Véhicules", clients:"Clients",
  rentals:"Locations", payments:"Paiements", documents:"Documents",
  signatures:"Signatures", pricing:"Abonnements", settings:"Paramètres", agencies:"Multi-agences", calendar:"Calendrier",
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
  uploadImage:"Uploader une image",
  myAccount:"Mon compte", displayName:"Nom d'affichage", newPassword:"Nouveau mot de passe",
  confirmPassword:"Confirmer le mot de passe", updateBtn:"Mettre à jour", updated:"Mis à jour !",
  pwMismatch:"Les mots de passe ne correspondent pas",
  emailNotifs:"Notifications emails",
  notifRentalLabel:"Email à chaque nouvelle location", notifRentalDesc:"Envoyé automatiquement au client lors de la création d'une location",
  notifPaymentLabel:"Rappel de paiement en retard", notifPaymentDesc:"Envoyé au client lorsqu'un paiement est en retard",
  notifSignatureLabel:"Confirmation de signature", notifSignatureDesc:"Envoyé au client après signature du contrat",
  dangerZone:"Zone dangereuse",
  signOutAll:"Se déconnecter de tous les appareils", signOutAllDesc:"Invalide toutes les sessions actives", signOutBtn:"Déconnecter",
  deleteAccount:"Supprimer mon compte", deleteAccountDesc:"Cette action est irréversible. Toutes vos données seront supprimées définitivement.",
  deleteConfirmPlaceholder:'Tapez "SUPPRIMER" pour confirmer', deleteBtn:"Supprimer le compte", deleteConfirmWord:"SUPPRIMER",
},
en: {
  dashboard:"Dashboard", vehicles:"Vehicles", clients:"Clients",
  rentals:"Rentals", payments:"Payments", documents:"Documents",
  signatures:"Signatures", pricing:"Pricing", settings:"Settings", agencies:"Multi-agencies", calendar:"Calendar",
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
  uploadImage:"Upload image",
  myAccount:"My account", displayName:"Display name", newPassword:"New password",
  confirmPassword:"Confirm password", updateBtn:"Update", updated:"Updated!",
  pwMismatch:"Passwords do not match",
  emailNotifs:"Email notifications",
  notifRentalLabel:"Email for each new rental", notifRentalDesc:"Automatically sent to the client when a rental is created",
  notifPaymentLabel:"Late payment reminder", notifPaymentDesc:"Sent to the client when a payment is overdue",
  notifSignatureLabel:"Signature confirmation", notifSignatureDesc:"Sent to the client after contract signing",
  dangerZone:"Danger zone",
  signOutAll:"Sign out of all devices", signOutAllDesc:"Invalidates all active sessions", signOutBtn:"Sign out",
  deleteAccount:"Delete my account", deleteAccountDesc:"This action is irreversible. All your data will be permanently deleted.",
  deleteConfirmPlaceholder:'Type "DELETE" to confirm', deleteBtn:"Delete account", deleteConfirmWord:"DELETE",
},
};




// ─── LANG CONTEXT ─────────────────────────────────────────────────────────────
const LangContext = createContext("fr");
const useLang = () => useContext(LangContext);

// ─── MOBILE HOOK ──────────────────────────────────────────────────────────────
const useIsMobile = () => {
  const [w, setW] = useState(typeof window!=="undefined"?window.innerWidth:1200);
  useEffect(()=>{ const h=()=>setW(window.innerWidth); window.addEventListener("resize",h); return ()=>window.removeEventListener("resize",h); },[]);
  return w < 768;
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
const ToastContext = createContext(()=>{});
const useToast = () => useContext(ToastContext);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = (msg, type="success") => { const id=Date.now(); setToasts(p=>[...p,{id,msg,type}]); setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3200); };
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:10, pointerEvents:"none" }}>
        {toasts.map(t=>(
          <div key={t.id} style={{ padding:"12px 18px", borderRadius:12, background:t.type==="error"?"#C0392B":t.type==="warn"?T.amber:T.success, color:"#fff", fontSize:13, fontWeight:600, boxShadow:"0 8px 30px #00000060", animation:"fadeUp .2s", display:"flex", alignItems:"center", gap:8, maxWidth:320 }}>
            {t.type==="error"||t.type==="warn"?Icons.alert:Icons.check} {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


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
    let cancelled = false;
    const s = Date.now();
    const tick = () => {
      if (cancelled) return;
      const p = Math.min(1,(Date.now()-s)/duration);
      const e = 1-Math.pow(1-p,3);
      setVal(Math.round(e*target));
      if(p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { cancelled = true; };
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
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, to, data }),
    });
    if (!res.ok) console.error("Email error:", res.status, await res.text());
  } catch (e) {
    console.error("Email error:", e);
  }
};

// ─── PLAN LIMITS ──────────────────────────────────────────────────────────────
const PLAN_LIMITS = {
  starter:    { vehicles: 5,        rentals: 50,       emails: false, label: "Starter" },
  pro:        { vehicles: Infinity, rentals: Infinity, emails: true,  label: "Pro" },
  enterprise: { vehicles: Infinity, rentals: Infinity, emails: true,  label: "Enterprise" },
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

function TrialExpiredScreen({ onLogout }) {
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ maxWidth:480, width:"100%", textAlign:"center" }}>
        {/* Glow */}
        <div style={{ position:"relative", display:"inline-block", marginBottom:32 }}>
          <div style={{ position:"absolute", inset:-40, background:`radial-gradient(ellipse, ${T.gold}20 0%, transparent 70%)`, pointerEvents:"none" }}/>
          <div style={{ width:72, height:72, borderRadius:20, background:T.goldDim, border:`1px solid ${T.gold}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, position:"relative" }}>🔒</div>
        </div>

        <div style={{ fontSize:26, fontWeight:900, color:T.text, marginBottom:12, lineHeight:1.2 }}>
          Votre essai gratuit<br/>est terminé
        </div>
        <div style={{ fontSize:14, color:T.muted, lineHeight:1.7, marginBottom:36, maxWidth:360, margin:"0 auto 36px" }}>
          Vous avez utilisé Loqar pendant <strong style={{color:T.text}}>14 jours</strong>. Pour continuer à gérer vos locations, choisissez un plan.
        </div>

        {/* Plans */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
          {/* Pro */}
          <div style={{ background:T.card, border:`2px solid ${T.gold}`, borderRadius:16, padding:"20px 16px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.gold}, #E8C87A)`, borderRadius:"16px 16px 0 0" }}/>
            <div style={{ fontSize:11, fontWeight:700, color:T.gold, letterSpacing:".08em", textTransform:"uppercase", marginBottom:6 }}>Pro</div>
            <div style={{ fontSize:24, fontWeight:900, color:T.text, marginBottom:4 }}>49<span style={{fontSize:13,fontWeight:500,color:T.muted}}>€/mois</span></div>
            <div style={{ fontSize:11, color:T.muted, marginBottom:14 }}>Véhicules illimités</div>
            {["Locations illimitées","Emails automatiques","Export CSV","Documents PDF"].map(f=>(
              <div key={f} style={{ fontSize:11, color:T.sub, display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{color:T.success,fontSize:10}}>✓</span> {f}
              </div>
            ))}
            <a href="mailto:contact@loqar.fr?subject=Abonnement Pro" style={{ display:"block", marginTop:14, padding:"10px", background:T.gold, borderRadius:9, color:"#0F0D0B", fontSize:12, fontWeight:800, textDecoration:"none", textAlign:"center" }}>
              Choisir Pro →
            </a>
          </div>

          {/* Enterprise */}
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 16px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.amber, letterSpacing:".08em", textTransform:"uppercase", marginBottom:6 }}>Enterprise</div>
            <div style={{ fontSize:24, fontWeight:900, color:T.text, marginBottom:4 }}>249<span style={{fontSize:13,fontWeight:500,color:T.muted}}>€/mois</span></div>
            <div style={{ fontSize:11, color:T.muted, marginBottom:14 }}>Multi-agences</div>
            {["Tout Pro inclus","Multi-agences","Marque blanche","Support prioritaire"].map(f=>(
              <div key={f} style={{ fontSize:11, color:T.sub, display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{color:T.amber,fontSize:10}}>✓</span> {f}
              </div>
            ))}
            <a href="mailto:contact@loqar.fr?subject=Abonnement Enterprise" style={{ display:"block", marginTop:14, padding:"10px", background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, color:T.text, fontSize:12, fontWeight:700, textDecoration:"none", textAlign:"center" }}>
              Contacter →
            </a>
          </div>
        </div>

        <div style={{ fontSize:12, color:T.muted }}>
          Questions ? <a href="mailto:contact@loqar.fr" style={{color:T.gold, textDecoration:"none"}}>contact@loqar.fr</a>
          <span style={{margin:"0 10px",color:T.border2}}>·</span>
          <button onClick={onLogout} style={{background:"none",border:"none",color:T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Se déconnecter</button>
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
  user:     <Ic size={15} paths={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]}/>,
  calGrid:  <Ic size={15} paths={["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"]}/>,
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

function SkeletonRow({ cols=5 }) {
  return (
    <tr>
      {Array.from({length:cols}).map((_,i)=>(
        <td key={i} style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}` }}>
          <div style={{ height:12, borderRadius:6, background:T.border2, animation:"pulse 1.4s ease-in-out infinite", width:i===0?"60%":i===cols-1?"30%":"80%" }}/>
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
      <div style={{ height:130, background:T.card2, animation:"pulse 1.4s ease-in-out infinite" }}/>
      <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ height:13, borderRadius:6, background:T.border2, animation:"pulse 1.4s ease-in-out infinite", width:"70%" }}/>
        <div style={{ height:10, borderRadius:6, background:T.border2, animation:"pulse 1.4s ease-in-out infinite", width:"40%" }}/>
      </div>
    </div>
  );
}

function ConfirmModal({ message, confirmLabel="Supprimer", onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:600, background:"#00000095", display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)" }}
      onClick={onCancel}>
      <div style={{ background:T.card, border:`1px solid ${T.border2}`, borderRadius:20, padding:28, width:360, maxWidth:"100%" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ fontSize:16, fontWeight:700, color:T.text, marginBottom:10 }}>Confirmation</div>
        <div style={{ fontSize:13, color:T.sub, marginBottom:24, lineHeight:1.6 }}>{message}</div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <Btn label="Annuler" variant="secondary" onClick={onCancel}/>
          <Btn label={confirmLabel} variant="danger" onClick={onConfirm}/>
        </div>
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
                const li=all.indexOf(item); const active=li===idx;
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
function NotifPanel({ onClose, notifs = [], onMarkAll, onMarkRead }) {
  const markAll = () => { if (onMarkAll) onMarkAll(); };
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
        {notifs.length === 0 && <div style={{ padding:"32px 20px", textAlign:"center", color:T.muted, fontSize:13 }}>Aucune notification</div>}
        {notifs.map(n=>(
          <div key={n.id} onClick={()=>{ if (onMarkRead) onMarkRead(n.id); }}
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
function Settings({ agencyProfile, setAgencyProfile, userPlan = "starter", user, activeAgency = null }) {
  const toast = useToast();
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const [form, setForm] = useState(agencyProfile);
  const [saved, setSaved] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const up = (k,v) => setForm(f=>({...f,[k]:v}));
  const save = () => { setAgencyProfile(form); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  // Profil utilisateur
  const [profileForm, setProfileForm] = useState({ name: user?.user_metadata?.name||"", newPw:"", confirmPw:"" });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const saveUserProfile = async () => {
    setProfileError("");
    if (profileForm.newPw && profileForm.newPw !== profileForm.confirmPw) { setProfileError(t.pwMismatch); return; }
    const updates = {};
    if (profileForm.name !== (user?.user_metadata?.name||"")) updates.data = { name: profileForm.name };
    if (profileForm.newPw) updates.password = profileForm.newPw;
    if (Object.keys(updates).length === 0) { setProfileSaved(true); setTimeout(()=>setProfileSaved(false),2500); return; }
    const { error } = await supabase.auth.updateUser(updates);
    if (error) { setProfileError(error.message); return; }
    setProfileSaved(true); setTimeout(()=>setProfileSaved(false),2500);
    setProfileForm(p=>({...p, newPw:"", confirmPw:""}));
  };

  // Upload logo image
  const logoInputRef = useRef(null);
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => up("logo", ev.target.result);
    reader.readAsDataURL(file);
  };

  // Notifications
  const [notifs, setNotifs] = useState(() => { try { return JSON.parse(localStorage.getItem("loqar_notifs")||"{}"); } catch { return {}; } });
  const toggleNotif = (key) => { const updated={...notifs,[key]:!notifs[key]}; setNotifs(updated); localStorage.setItem("loqar_notifs",JSON.stringify(updated)); };

  // Danger zone
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const handleSignOutAll = async () => { await supabase.auth.signOut({ scope:"global" }); };
  const handleDeleteAccount = async () => {
    if (deleteInput !== t.deleteConfirmWord) return;
    setDeleteLoading(true);
    const { error } = await supabase.rpc("delete_user");
    if (error) { toast("Impossible de supprimer automatiquement. Contactez support@loqar.fr", "error"); setDeleteLoading(false); return; }
    await supabase.auth.signOut();
  };

  return (
    <Page title={t.settings||"Paramètres"} sub={lang==="en"?"Your agency info · shown on PDF contracts":"Informations de votre agence · apparaissent sur vos contrats PDF"}>
      {activeAgency && (
        <div style={{ background:"#C9A84C15", border:"1px solid #C9A84C40", borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:18 }}>ℹ️</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:T.gold }}>Mode sous-agence actif : {activeAgency.name}</div>
            <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>Ces paramètres concernent le <strong style={{ color:T.text }}>compte principal</strong>, pas la sous-agence. Pour modifier le slug de cette agence, allez dans <strong style={{ color:T.text }}>Multi-agences → ✎</strong>.</div>
          </div>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

        {/* Infos agence */}
        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:T.gold, letterSpacing:".06em", textTransform:"uppercase", marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color:T.gold }}>{Icons.building}</span> {t.profile||"Agence"}
          </div>

          {/* Logo upload zone */}
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Logo</label>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:80, height:80, borderRadius:14, background:T.card2, border:`2px dashed ${T.border2}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, overflow:"hidden", flexShrink:0 }}>
                {form.logo?.startsWith("data:")||form.logo?.startsWith("http")
                  ? <img src={form.logo} alt="logo" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:12 }}/>
                  : <div style={{ fontSize:28 }}>{form.logo||"🚗"}</div>
                }
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <input ref={logoInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleLogoUpload}/>
                <button onClick={()=>logoInputRef.current?.click()} style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:8, padding:"7px 14px", color:T.text, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                  {t.uploadImage}
                </button>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {["🚗","🏢","🔑","⭐","🚙"].map(e=>(
                    <button key={e} onClick={()=>up("logo",e)} style={{ width:30, height:30, borderRadius:7, background:form.logo===e?T.goldDim:T.card2, border:`1px solid ${form.logo===e?T.gold:T.border}`, fontSize:15, cursor:"pointer" }}>{e}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Marque blanche — couleur de marque (Enterprise) */}
          <div style={{ marginBottom:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Couleur de marque</label>
              {userPlan !== "enterprise" && <span style={{ fontSize:10, background:T.amberDim, color:T.amber, border:`1px solid ${T.amber}30`, borderRadius:6, padding:"2px 7px", fontWeight:700 }}>Enterprise</span>}
            </div>
            {userPlan === "enterprise" ? (
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                {["#C8A96E","#5B8DB8","#6AAF7A","#D4854A","#9B8AB5","#E05555"].map(c=>(
                  <button key={c} onClick={()=>up("brandColor",c)} title={c}
                    style={{ width:28, height:28, borderRadius:"50%", background:c, border:`2px solid ${(form.brandColor||"#C8A96E")===c?"#fff":"transparent"}`, cursor:"pointer", transition:"border-color .15s" }}/>
                ))}
                <input type="color" value={form.brandColor||"#C8A96E"} onChange={e=>up("brandColor",e.target.value)}
                  style={{ width:28, height:28, borderRadius:"50%", border:"none", cursor:"pointer", background:"none", padding:0 }} title="Couleur personnalisée"/>
                <span style={{ fontSize:12, color:T.muted }}>{form.brandColor||"#C8A96E"}</span>
              </div>
            ) : (
              <div style={{ position:"relative", display:"inline-block" }} onClick={()=>setUpgradeModal(true)}>
                <div style={{ display:"flex", gap:6, opacity:.35, pointerEvents:"none", filter:"blur(1px)" }}>
                  {["#C8A96E","#5B8DB8","#6AAF7A","#D4854A","#9B8AB5","#E05555"].map(c=>(
                    <div key={c} style={{ width:28, height:28, borderRadius:"50%", background:c }}/>
                  ))}
                </div>
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", gap:6, cursor:"pointer" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.amber} strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  <span style={{ fontSize:11, fontWeight:700, color:T.amber }}>{lang==="en"?"Enterprise only — Upgrade":"Enterprise uniquement — Passer au plan"}</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
            {[[t.agencyName||"Nom de l'agence","name","Loqar Auto"],["SIRET","siret","123 456 789 00012"],["N° TVA intracommunautaire","tva","FR12 123456789"],[t.address||"Adresse","address","12 rue de la Paix, 75001 Paris"],[lang==="en"?"Phone":"Téléphone","phone","+33 1 23 45 67 89"],["Email","email","contact@loqar.fr"],[lang==="en"?"Website":"Site web","website","www.loqar.fr"]].map(([lbl,key,ph])=>(
              <div key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{lbl}</label>
                <input value={form[key]||""} onChange={e=>up(key,e.target.value)} placeholder={ph}
                  style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", transition:"border-color .15s" }}
                  onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
              </div>
            ))}
          </div>

          {/* URL de réservation publique */}
          <div style={{ marginTop:18, paddingTop:18, borderTop:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>URL de réservation publique</label>
              <span style={{ fontSize:10, background:T.successDim, color:T.success, border:`1px solid ${T.success}30`, borderRadius:6, padding:"2px 7px", fontWeight:700 }}>NOUVEAU</span>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:13, color:T.muted, whiteSpace:"nowrap" }}>loqar.fr/book/</span>
              <input value={form.bookingSlug||""} onChange={e=>up("bookingSlug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} placeholder="mon-agence"
                style={{ flex:1, background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}
                onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
            </div>
            {form.bookingSlug && (
              <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, color:T.muted }}>→ </span>
                <a href={`/book/${form.bookingSlug}`} target="_blank" rel="noreferrer"
                  style={{ fontSize:12, color:T.gold, fontWeight:600 }}>
                  loqar.fr/book/{form.bookingSlug}
                </a>
              </div>
            )}
            <div style={{ fontSize:11, color:T.muted, marginTop:6 }}>Partagez ce lien à vos clients pour qu'ils puissent réserver en ligne.</div>
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
                  <div style={{ fontSize:10, color:"#888" }}>{form.phone||(lang==="en"?"Phone":"Téléphone")}</div>
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

      {/* Mon compte */}
      <Card style={{ marginTop:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:T.gold, letterSpacing:".06em", textTransform:"uppercase", marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
          {Icons.user} {t.myAccount}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{t.displayName}</label>
            <input value={profileForm.name} onChange={e=>setProfileForm(p=>({...p,name:e.target.value}))} placeholder={t.displayName}
              style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Email</label>
            <input value={user?.email||""} disabled
              style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.muted, fontSize:13, fontFamily:"inherit", outline:"none", opacity:.6 }}/>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{t.newPassword}</label>
            <input type="password" value={profileForm.newPw} onChange={e=>setProfileForm(p=>({...p,newPw:e.target.value}))} placeholder="••••••••"
              style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{t.confirmPassword}</label>
            <input type="password" value={profileForm.confirmPw} onChange={e=>setProfileForm(p=>({...p,confirmPw:e.target.value}))} placeholder="••••••••"
              style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
          </div>
        </div>
        {profileError && <div style={{ fontSize:12, color:T.red, marginTop:10 }}>{profileError}</div>}
        <div style={{ display:"flex", gap:10, marginTop:16, justifyContent:"flex-end", alignItems:"center" }}>
          {profileSaved && <span style={{ fontSize:13, color:T.success, display:"flex", alignItems:"center", gap:5 }}>{Icons.check} {t.updated}</span>}
          <Btn label={t.updateBtn} variant="primary" onClick={saveUserProfile} icon={Icons.check}/>
        </div>
      </Card>

      {/* Notifications */}
      <Card style={{ marginTop:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:T.gold, letterSpacing:".06em", textTransform:"uppercase", marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
          {Icons.bell||"🔔"} {t.emailNotifs}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[
            ["notif_rental",    t.notifRentalLabel,    t.notifRentalDesc],
            ["notif_payment",   t.notifPaymentLabel,   t.notifPaymentDesc],
            ["notif_signature", t.notifSignatureLabel, t.notifSignatureDesc],
          ].map(([key, label, desc])=>(
            <div key={key} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", background:T.card2, borderRadius:10, border:`1px solid ${T.border}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{label}</div>
                <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{desc}</div>
              </div>
              <div onClick={()=>toggleNotif(key)} style={{ width:42, height:24, borderRadius:12, background:notifs[key]?T.gold:T.border2, cursor:"pointer", transition:"background .2s", position:"relative", flexShrink:0 }}>
                <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:notifs[key]?21:3, transition:"left .2s" }}/>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <Card style={{ marginTop:20, border:`1px solid ${T.red}30` }}>
        <div style={{ fontSize:13, fontWeight:700, color:T.red, letterSpacing:".06em", textTransform:"uppercase", marginBottom:18 }}>
          {t.dangerZone}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:T.card2, borderRadius:10, border:`1px solid ${T.border}` }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{t.signOutAll}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{t.signOutAllDesc}</div>
            </div>
            <Btn label={t.signOutBtn} variant="danger" onClick={handleSignOutAll}/>
          </div>
          <div style={{ padding:"14px", background:T.card2, borderRadius:10, border:`1px solid ${T.red}40` }}>
            <div style={{ fontSize:13, fontWeight:600, color:T.red, marginBottom:4 }}>{t.deleteAccount}</div>
            <div style={{ fontSize:11, color:T.muted, marginBottom:12 }}>{t.deleteAccountDesc}</div>
            <div style={{ fontSize:11, color:T.muted, marginBottom:8 }}>
              {lang==="en" ? <>Type <strong style={{color:T.text,letterSpacing:".05em"}}>DELETE</strong> in the field below to confirm</> : <>Tapez <strong style={{color:T.text,letterSpacing:".05em"}}>SUPPRIMER</strong> dans le champ ci-dessous pour confirmer</>}
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <input value={deleteInput} onChange={e=>setDeleteInput(e.target.value)} placeholder={t.deleteConfirmPlaceholder}
                style={{ flex:1, background:T.bg, border:`1px solid ${deleteInput.length>0&&deleteInput!==t.deleteConfirmWord?T.red:T.red+"60"}`, borderRadius:8, padding:"8px 12px", color:T.text, fontSize:12, fontFamily:"inherit", outline:"none", transition:"border-color .2s" }}/>
              <Btn label={deleteLoading?"...":t.deleteBtn} variant="danger" onClick={handleDeleteAccount} style={{ opacity:deleteInput===t.deleteConfirmWord?1:.35, pointerEvents:deleteInput===t.deleteConfirmWord?"auto":"none", transition:"opacity .2s" }}/>
            </div>
            {deleteInput.length>0 && deleteInput!==t.deleteConfirmWord && (
              <div style={{ fontSize:11, color:T.red, marginTop:6 }}>
                {lang==="en"?"Incorrect — type DELETE exactly":"Incorrect — tapez SUPPRIMER exactement"}
              </div>
            )}
          </div>
        </div>
      </Card>
      {upgradeModal && <UpgradeModal reason={lang==="en"?"Brand color customization requires the Enterprise plan. Upgrade to unlock white-label features.":"La personnalisation de la couleur de marque nécessite le plan Enterprise. Passez au plan supérieur pour débloquer les fonctionnalités marque blanche."} onClose={()=>setUpgradeModal(false)}/>}
    </Page>
  );
}

// ─── SIGNATURE ÉLECTRONIQUE ───────────────────────────────────────────────────
function SignaturePage({ rentals = [], setRentals, clients = [], vehicles = [], user, activeAgencyId = null }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [sigStep, setSigStep] = useState(null); // null | "send" | "signing" | "done"
  const [signed, setSigned] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ clientId:"", vehicleId:"", startDate:"", endDate:"", pricePerDay:"", deposit:"", km:"", notes:"" });
  const up = (k,v) => setForm(prev=>({...prev,[k]:v}));
  const days = Math.ceil((new Date(form.endDate)-new Date(form.startDate))/86400000);
  const total = (parseInt(form.pricePerDay)||0)*(days>0?days:0);

  const handleAdd = async () => {
    const client  = clients.find(c=>String(c.id)===String(form.clientId));
    const vehicle = vehicles.find(v=>String(v.id)===String(form.vehicleId));
    if (!client || !vehicle) { toast("Sélectionnez un client et un véhicule", "error"); return; }
    if (!form.startDate || !form.endDate) { toast("Renseignez les dates", "error"); return; }
    const newR = {
      user_id: user?.id,
      agency_id: activeAgencyId||null,
      client_id: parseInt(form.clientId)||form.clientId,
      vehicle_id: parseInt(form.vehicleId)||form.vehicleId,
      client_name: `${client.first_name} ${client.last_name}`,
      vehicle_name: `${vehicle.name} — ${vehicle.plate}`,
      start_date: form.startDate,
      end_date: form.endDate,
      price_per_day: parseInt(form.pricePerDay)||0,
      deposit: parseInt(form.deposit)||0,
      total,
      km_start: parseInt(form.km)||0,
      notes: form.notes,
      status: "réservée",
      portal_token: crypto.randomUUID(),
    };
    const { data, error } = await supabase.from("rentals").insert(newR).select().single();
    if (error) { toast("Erreur : " + error.message, "error"); return; }
    if (data && setRentals) setRentals(prev => [data, ...prev]);
    setModal(false);
    setForm({ clientId:"", vehicleId:"", startDate:"", endDate:"", pricePerDay:"", deposit:"", km:"", notes:"" });
  };

  const contracts = rentals
    .filter(r => r.status === "réservée" || r.status === "en cours" || r.status === "terminée")
    .map(r => ({
      id: r.id,
      client_id: r.client_id,
      client: r.client_name || "",
      vehicle: r.vehicle_name || "",
      date: r.start_date ? fmtDate(r.start_date) : "—",
      amount: r.total || 0,
      status: r.status === "terminée" ? "signé" : "en attente signature",
    }));

  const getXY = e => { const t=e.touches?.[0]??e; return {x:t.clientX,y:t.clientY}; };
  const startDraw = e => { e.preventDefault?.(); setDrawing(true); const c=canvasRef.current; const r=c.getBoundingClientRect(); const {x,y}=getXY(e); const ctx=c.getContext("2d"); ctx.beginPath(); ctx.moveTo(x-r.left,y-r.top); };
  const draw = e => { e.preventDefault?.(); if(!drawing)return; setHasDrawn(true); const c=canvasRef.current; const r=c.getBoundingClientRect(); const {x,y}=getXY(e); const ctx=c.getContext("2d"); ctx.strokeStyle="#1A1510"; ctx.lineWidth=2; ctx.lineCap="round"; ctx.lineTo(x-r.left,y-r.top); ctx.stroke(); };
  const endDraw = () => setDrawing(false);
  const clearCanvas = () => { const c=canvasRef.current; c.getContext("2d").clearRect(0,0,c.width,c.height); setHasDrawn(false); };
  const confirmSign = async () => {
    // Upload de la signature dans Supabase Storage
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        const blob = await (await fetch(canvas.toDataURL("image/png"))).blob();
        const path = `signatures/${user?.id}/${selected.id}_${Date.now()}.png`;
        await supabase.storage.from("photos").upload(path, blob, { contentType:"image/png", upsert:true });
      } catch(e) { console.error("Erreur upload signature:", e); }
    }
    // Mettre le statut de la location à "terminée"
    await supabase.from("rentals").update({ status:"terminée" }).eq("id", selected.id);
    if (setRentals) setRentals(prev=>prev.map(r=>r.id===selected.id?{...r,status:"terminée"}:r));

    setSigned(s=>[...s,selected?.id]);
    const client = clients.find(c=>String(c.id)===String(selected?.client_id));
    if (client?.email) {
      await sendEmail("rental", client.email, { clientName: selected.client, vehicle: selected.vehicle, startDate: selected.date, total: selected.amount });
    }
    setSigStep("done");
  };

  return (
    <Page title={lang==="en"?"Electronic signature":"Signature électronique"} sub={lang==="en"?"Send contracts for signing in one click":"Envoyez vos contrats à signer en un clic"}
      actions={<button onClick={()=>setModal(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:T.gold, border:"none", borderRadius:10, color:"#0F0D0B", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{Icons.plus} {lang==="en"?"New contract":"Nouveau contrat"}</button>}>

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
              <div style={{ position:"relative", background:"#FDFBF7", borderRadius:10, border:`2px dashed ${hasDrawn?T.gold:"#C8C0B0"}`, overflow:"hidden", transition:"border-color .2s" }}>
                <canvas ref={canvasRef} width={436} height={120}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                  style={{ display:"block", cursor:"crosshair", width:"100%", height:120, touchAction:"none" }}/>
                {!hasDrawn && (
                  <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", gap:8 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B0A898" strokeWidth="1.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    <span style={{ color:"#A09888", fontSize:12 }}>Dessinez votre signature ici</span>
                    <span style={{ color:"#C0B8A8", fontSize:10 }}>Utilisez la souris ou votre doigt</span>
                  </div>
                )}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6 }}>
                <span style={{ fontSize:11, color:hasDrawn?T.success:T.muted }}>{hasDrawn?"✓ Signature dessinée":"Aucune signature"}</span>
                {hasDrawn && <button onClick={clearCanvas} style={{ fontSize:11, color:T.muted, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Effacer et recommencer</button>}
              </div>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <Btn label={t.cancel||"Annuler"} variant="secondary" onClick={()=>setSigStep(null)} style={{ flex:1, justifyContent:"center" }}/>
              <Btn label={hasDrawn?"Confirmer la signature":"Dessinez d'abord votre signature"} variant="primary" onClick={hasDrawn?confirmSign:undefined} style={{ flex:1, justifyContent:"center", opacity:hasDrawn?1:.4, cursor:hasDrawn?"pointer":"not-allowed" }}/>
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
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}` }}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{lang==="en"?"Contracts pending signature":"Contrats en attente de signature"}</div>
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

      {modal && (
        <Modal title="Nouveau contrat de location" onClose={()=>setModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Client</label>
              <select value={form.clientId} onChange={e=>up("clientId",e.target.value)}
                style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                <option value="">— Sélectionner —</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Véhicule</label>
              <select value={form.vehicleId} onChange={e=>{ up("vehicleId",e.target.value); const v=vehicles.find(x=>String(x.id)===e.target.value); if(v) up("pricePerDay",v.price_per_day||""); }}
                style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                <option value="">— Sélectionner —</option>
                {vehicles.map(v=><option key={v.id} value={v.id}>{v.name} — {v.plate}</option>)}
              </select>
            </div>
            <Input label="Début" type="date" value={form.startDate} onChange={v=>up("startDate",v)}/>
            <Input label="Fin" type="date" value={form.endDate} onChange={v=>up("endDate",v)}/>
            <Input label="Prix/jour (€)" type="number" value={form.pricePerDay} onChange={v=>up("pricePerDay",v)}/>
            <Input label="Caution (€)" type="number" value={form.deposit} onChange={v=>up("deposit",v)}/>
            <Input label="Km départ" type="number" value={form.km} onChange={v=>up("km",v)}/>
            {days>0 && (
              <div style={{ gridColumn:"1/-1", padding:"12px 14px", background:T.goldDim, border:`1px solid ${T.gold}30`, borderRadius:10 }}>
                <span style={{ fontSize:12, color:T.muted }}>Durée : {days} jour(s) · </span>
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
            <button onClick={()=>setModal(false)} style={{ padding:"9px 18px", background:T.card, border:`1px solid ${T.border2}`, borderRadius:10, color:T.text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Annuler</button>
            <button onClick={handleAdd} style={{ padding:"9px 18px", background:T.gold, border:"none", borderRadius:10, color:"#0F0D0B", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Créer le contrat</button>
          </div>
        </Modal>
      )}
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
  { id:"calendar",   labelKey:"calendar",  icon:Icons.calGrid },
  { id:"signature",  labelKey:"signatures",icon:Icons.pen  },
  { id:"agencies",   labelKey:"agencies",  icon:Icons.building },
  { id:"pricing",    labelKey:"pricing",   icon:Icons.zap  },
  { id:"settings",   labelKey:"settings",  icon:Icons.settings },
];
const NAV = NAV_KEYS; // backward compat

function Sidebar({ page, onNav, user, onLogout, onCmd, vehicles, onNotif, unreadCount, userPlan = "starter", payments = [], onLangChange, activeAgency = null, onSwitchAgency, trialDaysLeft = null }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const lateP = payments.filter(p=>p.status==="en retard").length;
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile && !open) return (
    <button onClick={()=>setOpen(true)} style={{ position:"fixed", top:14, left:14, zIndex:200, background:T.gold, border:"none", borderRadius:10, width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#0F0D0B", fontSize:20, boxShadow:"0 4px 20px #00000060" }}>
      ☰
    </button>
  );

  return (
    <>
    {isMobile && <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, background:"#00000070", zIndex:99 }}/>}
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

      {/* Banner agence active */}
      {activeAgency && (
        <div style={{ background:T.goldDim, border:`1px solid ${T.gold}40`, borderRadius:9, padding:"8px 10px", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
          <div>
            <div style={{ fontSize:10, color:T.gold, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase" }}>Agence active</div>
            <div style={{ fontSize:12, color:T.text, fontWeight:600, marginTop:2 }}>{activeAgency.name}</div>
          </div>
          <button onClick={()=>onSwitchAgency&&onSwitchAgency(null)} style={{ fontSize:10, color:T.muted, background:"none", border:`1px solid ${T.border}`, borderRadius:6, padding:"3px 7px", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>✕ Quitter</button>
        </div>
      )}

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
        {[{l:lang==="en"?"Available":"Disponible",s:"disponible",c:T.success},{l:lang==="en"?"Rented":"En location",s:"en location",c:T.gold},{l:lang==="en"?"Maintenance":"Entretien",s:"entretien",c:T.red}].map(g=>{
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
        {trialDaysLeft !== null && trialDaysLeft <= 14 && (
          <div style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
              <span style={{ fontSize:11, fontWeight:700, color:trialDaysLeft<=3?T.red:T.gold }}>
                {trialDaysLeft === 0 ? "⚠️ Dernier jour !" : `⏳ ${trialDaysLeft}j d'essai restants`}
              </span>
            </div>
            <div style={{ height:4, borderRadius:99, background:T.border2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(trialDaysLeft/14)*100}%`, borderRadius:99, background:trialDaysLeft<=3?T.red:T.gold, transition:"width .3s" }}/>
            </div>
          </div>
        )}
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
        <Avatar name={user?.user_metadata?.name||user?.email||"?"} size={32}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:T.text }}>{user?.user_metadata?.name||user?.email||"—"}</div>
          <div style={{ fontSize:10, color:T.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email||"—"}</div>
        </div>
        <button onClick={onLogout}
          style={{ background:"none", border:"none", color:T.muted, display:"flex", padding:5, cursor:"pointer", borderRadius:7 }}
          onMouseEnter={e=>e.currentTarget.style.color=T.red}
          onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
          {Icons.logout}
        </button>
      </div>
    </aside>
    </>
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
  const params = new URLSearchParams(window.location.search);
  const [plan] = useState(params.get("plan") || "pro");

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
        <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 110% 70% at 50% 0%,#1F1608 0%, #080705 65%)`, pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:T.goldDim, border:`1px solid ${T.gold}`, borderRadius:99, padding:"5px 14px", fontSize:11, fontWeight:700, color:T.gold, letterSpacing:".08em", textTransform:"uppercase", marginBottom:28 }}>
            ⚡ LE MOUVEMENT DES LOUEURS AMBITIEUX
          </div>
          <h1 style={{ fontSize:"clamp(38px,6vw,70px)", fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"-0.04em", lineHeight:1.06, maxWidth:760, marginBottom:20 }}>
            Gérez <span style={{ color:T.gold }}>moins.</span> Louez plus.
          </h1>
          <p style={{ fontSize:"clamp(15px,1.8vw,17px)", color:T.sub, maxWidth:480, lineHeight:1.7, marginBottom:40 }}>
           Pendant que tu gères des papiers, tes concurrents grandissent. Loqar automatise tout — pour que toi, tu construises quelque chose de grand.
          </p>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
            <button onClick={onGetStarted} style={{ background:T.gold, color:"#0F0D0B", padding:"11px 26px", borderRadius:9, fontSize:14, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#D9BC84"}
              onMouseLeave={e=>e.currentTarget.style.background=T.gold}>
              Commencer gratuitement →
            </button>
            <button onClick={onGetStarted} style={{ background:"transparent", color:T.sub, padding:"10px 22px", borderRadius:9, fontSize:14, fontWeight:600, border:`1px solid ${T.border}`, cursor:"pointer", fontFamily:"inherit" }}>
              Comment ça marche ▶
            </button>
          </div>
          <div style={{ display:"flex", gap:24, marginTop:44, flexWrap:"wrap", justifyContent:"center" }}>
            {["Sans carte requise","14 jours d'essai","Annulation facile"].map(t=>(
              <span key={t} style={{ fontSize:13, color:T.muted, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:T.success, fontWeight:800 }}>✓</span>{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ background:T.surface, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, padding:"30px 24px" }}>
        <div style={{ maxWidth:860, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:16, textAlign:"center" }}>
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
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginBottom:16 }}>
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

      {/* COMPTA */}
      <div style={{ padding:"80px 24px", maxWidth:1080, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
          {/* Texte */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:T.gold, letterSpacing:".1em", textTransform:"uppercase", marginBottom:12 }}>Comptabilité</div>
            <h2 style={{ fontSize:"clamp(24px,3vw,34px)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:16, lineHeight:1.2 }}>Votre comptabilité,<br/>enfin simple</h2>
            <p style={{ fontSize:14, color:T.sub, lineHeight:1.8, marginBottom:28 }}>
              Plus besoin de jongler entre des fichiers Excel et votre logiciel de compta. Loqar centralise tous vos encaissements et génère un export prêt à envoyer à votre comptable en un clic.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                ["💶", "Suivi des encaissements en temps réel", "Chaque paiement est enregistré avec date, montant, méthode et statut. Fini les oublis."],
                ["⚠️", "Alertes paiements en retard", "Loqar vous notifie automatiquement dès qu'un paiement dépasse son échéance."],
                ["📊", "Export CSV en un clic", "Téléchargez tous vos paiements du mois en format Excel — prêt pour votre comptable ou votre déclaration."],
                ["🔒", "Cautions et dépôts de garantie", "Suivi des cautions encaissées et à rembourser, sans risque d'erreur."],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:T.goldDim, border:`1px solid ${T.gold}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:3 }}>{title}</div>
                    <div style={{ fontSize:13, color:T.muted, lineHeight:1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Visuel */}
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:28, boxShadow:"0 24px 80px #00000050" }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:20 }}>Paiements — Avril 2025</div>
            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
              {[["Encaissé",T.success,"8 420 €"],["En attente",T.amber,"1 200 €"],["En retard",T.red,"350 €"],["Cautions",T.blue,"2 400 €"]].map(([l,c,v])=>(
                <div key={l} style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px" }}>
                  <div style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>{l}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:c, letterSpacing:"-0.02em" }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Liste paiements */}
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
              {[["Martin Dupont","Espèces","650 €","encaissé",T.success],["Sarah Leroy","Virement","420 €","encaissé",T.success],["Pierre Martin","CB","310 €","en attente",T.amber],["Julie Bernard","CB","350 €","en retard",T.red]].map(([n,m,a,s,c])=>(
                <div key={n} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:T.card2, borderRadius:10, fontSize:12 }}>
                  <span style={{ fontWeight:600, color:T.text }}>{n}</span>
                  <span style={{ color:T.muted }}>{m}</span>
                  <span style={{ fontWeight:700, color:T.text }}>{a}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:6, background:c+"18", color:c }}>{s}</span>
                </div>
              ))}
            </div>
            {/* Export button */}
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background:T.goldDim, border:`1px solid ${T.gold}40`, borderRadius:10, cursor:"pointer" }}>
              <span style={{ fontSize:16 }}>↓</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:T.gold }}>Exporter en CSV</div>
                <div style={{ fontSize:11, color:T.muted }}>loqar-paiements-2025-04.csv</div>
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

      {/* CONTACT */}
      <div style={{ padding:"60px 28px", textAlign:"center", borderTop:`1px solid ${T.border}` }}>
        <div style={{ fontSize:22, fontWeight:800, color:T.text, marginBottom:10, letterSpacing:"-0.02em" }}>Une question ? On vous répond.</div>
        <div style={{ fontSize:14, color:T.muted, marginBottom:28, maxWidth:440, margin:"0 auto 28px" }}>
          Pour toute demande, démonstration ou devis sur mesure, écrivez-nous directement.
        </div>
        <a href="mailto:contact@loqar.fr" style={{ display:"inline-flex", alignItems:"center", gap:10, background:T.gold, color:"#0F0D0B", padding:"14px 32px", borderRadius:10, fontSize:15, fontWeight:700, textDecoration:"none" }}>
          ✉ contact@loqar.fr
        </a>
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
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <a href="/blog" style={{ fontSize:12, color:T.muted, textDecoration:"none" }}>Blog</a>
          <a href="mailto:contact@loqar.fr" style={{ fontSize:12, color:T.gold, textDecoration:"none", fontWeight:600 }}>contact@loqar.fr</a>
          <Btn label="Se connecter" variant="secondary" onClick={onGetStarted}/>
        </div>
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
    } else if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if (error) setError(error.message);
      else setSuccess("Email envoyé ! Vérifiez votre boîte mail pour réinitialiser votre mot de passe.");
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
            <h2 style={{ fontSize:24, fontWeight:700, letterSpacing:"-0.03em", marginBottom:8, color:T.text }}>{mode==="login"?"Bon retour":mode==="reset"?"Réinitialiser":"Créer un compte"}</h2>
            <p style={{ fontSize:13, color:T.sub }}>{mode==="login"?"Accédez à votre espace":mode==="reset"?"Entrez votre email pour recevoir un lien":"Rejoignez des centaines de loueurs"}</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {mode==="register" && <Input label="Nom complet" value={name} onChange={setName} placeholder="Alexandre Dubois"/>}
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.fr"/>
            {mode !== "reset" && <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Mot de passe</label>
              <div style={{ position:"relative" }}>
                <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••"
                  style={{ width:"100%", background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 40px 10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
                <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.muted, cursor:"pointer", display:"flex", padding:0 }}>
                  {showPw?Icons.eyeOff:Icons.eye}
                </button>
              </div>
            </div>}
          </div>
          {error && <div style={{ marginTop:12, padding:"10px 14px", background:T.redDim, border:`1px solid ${T.red}30`, borderRadius:9, fontSize:12, color:T.red }}>{error}</div>}
          {success && <div style={{ marginTop:12, padding:"10px 14px", background:T.successDim, border:`1px solid ${T.success}30`, borderRadius:9, fontSize:12, color:T.success }}>{success}</div>}
          {mode==="login" && (
            <div style={{ textAlign:"right", marginTop:8 }}>
              <button onClick={()=>{ setMode("reset"); setError(""); setSuccess(""); }}
                style={{ background:"none", border:"none", color:T.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                Mot de passe oublié ?
              </button>
            </div>
          )}
          <Btn label={loading?"...":(mode==="login"?"Se connecter":mode==="reset"?"Envoyer le lien":"Créer mon compte")} onClick={handle} variant="primary" size="lg" full style={{ marginTop:16 }}/>
          <div style={{ textAlign:"center", marginTop:18, fontSize:13, color:T.sub }}>
            {mode==="reset" ? "Retour à la " : (mode==="login"?"Pas encore de compte ? ":"Déjà un compte ? ")}
            <button onClick={()=>{ setMode(mode==="login"?"register":mode==="reset"?"login":"login"); setError(""); setSuccess(""); }}
              style={{ background:"none", border:"none", color:T.gold, fontWeight:600, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
              {mode==="login"?"S'inscrire":mode==="reset"?"connexion":"Se connecter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon, sub, money = false }) {
  const c = useCounter(value, 900);
  return (
    <Card>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:T.muted, letterSpacing:".08em", textTransform:"uppercase", marginBottom:8 }}>{label}</div>
          <div style={{ fontSize:money?26:32, fontWeight:700, color:color, letterSpacing:"-0.03em", lineHeight:1 }}>{money?fmt(c)+" €":c}</div>
          {sub && <div style={{ fontSize:11, color:T.muted, marginTop:5 }}>{sub}</div>}
        </div>
        <div style={{ width:38, height:38, borderRadius:10, background:color+"15", display:"flex", alignItems:"center", justifyContent:"center", color:color, flexShrink:0 }}>{icon}</div>
      </div>
    </Card>
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
  const expiredLicenses = (clients||[]).filter(c=>isExpired(c.license_expiry||c.licenseExpiry));

  // Monthly revenue for chart (last 6 months)
  const monthlyRevenue = () => {
    const months = [];
    for (let i=5; i>=0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label = d.toLocaleDateString('fr-FR', { month:'short' });
      const total = (payments||[])
        .filter(p => p.status==="encaissé" && p.paid_at && p.paid_at.startsWith(key))
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
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14, marginBottom:18 }}>
        <StatCard label={lang==="en"?"Active rentals":"Locations actives"} value={activeRentals.length} color={T.gold} icon={Icons.calendar} sub={lang==="en"?"In progress":"En cours"}/>
        <StatCard label={lang==="en"?"Available vehicles":"Véhicules disponibles"} value={availableVehicles.length} color={T.success} icon={Icons.car} sub={lang==="en"?`Out of ${(vehicles||[]).length} total`:`Sur ${(vehicles||[]).length} total`}/>
        <StatCard label={lang==="en"?"Clients":"Clients"} value={(clients||[]).length} color={T.blue} icon={Icons.users} sub={lang==="en"?"Registered":"Enregistrés"}/>
        <StatCard label={lang==="en"?"Pending payments":"Paiements en attente"} value={pendingPayments.length} color={T.amber} icon={Icons.dollar} sub={`${pendingPayments.reduce((a,p)=>a+(p.amount||0),0)} €`}/>
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
                        <div style={{ fontSize:13, fontWeight:700, color:T.gold }}>{r.total||0} €</div>
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
          {(latePayments.length > 0 || (vehicles||[]).filter(v=>v.status==="entretien").length > 0 || expiredLicenses.length > 0) && (
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
              {expiredLicenses.map(c=>(
                <div key={c.id} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:9, marginBottom:5, background:T.amber+"0C", border:`1px solid ${T.amber}25` }}>
                  {Icons.alert}
                  <span style={{ fontSize:12, color:T.sub }}>{lang==="en"?"Expired license · ":"Permis expiré · "}{c.first_name} {c.last_name}</span>
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
function Vehicles({ vehicles, setVehicles, user, userPlan = "starter", activeAgencyId = null, dataLoading = false, rentals = [] }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const toast = useToast();
  const [sel, setSel]       = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [modal, setModal]   = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [form, setForm]     = useState({name:"",plate:"",fuel:"Essence",trans:"Manuelle",km:"",price:"",year:"",cat:"Citadine",photo:"",vin:"",color:"",ctDate:""});
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState(null);

  // Per-vehicle stats
  const vehicleStats = (vId) => {
    const vRentals = rentals.filter(r => r.vehicle_id === vId);
    const revenue = vRentals.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
    const totalDays = vRentals.reduce((s, r) => {
      const d = Math.ceil((new Date(r.end_date) - new Date(r.start_date)) / 86400000);
      return s + (d > 0 ? d : 0);
    }, 0);
    const periodDays = 365;
    const occupancy = Math.min(100, Math.round((totalDays / periodDays) * 100));
    return { count: vRentals.length, revenue, totalDays, occupancy };
  };

  // CT alert helper
  const ctStatus = (ctDate) => {
    if (!ctDate) return null;
    const diff = Math.ceil((new Date(ctDate) - Date.now()) / 86400000);
    if (diff < 0) return { label: lang==="en"?"CT expired":"CT expiré", color: T.red, bg: T.redDim };
    if (diff <= 30) return { label: lang==="en"?`CT in ${diff}d`:`CT dans ${diff}j`, color: T.amber, bg: T.amberDim };
    return null;
  };

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

  const filtered = vehicles
    .filter(v=>{
      if(filter!=="all" && v.status!==filter) return false;
      if(search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.plate.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a,b)=>{
      if(sortBy==="km")    return (b.km||0)-(a.km||0);
      if(sortBy==="price") return (b.price_per_day||b.price||0)-(a.price_per_day||a.price||0);
      if(sortBy==="year")  return (b.year||0)-(a.year||0);
      if(sortBy==="rev")   return vehicleStats(b.id).revenue - vehicleStats(a.id).revenue;
      return a.name.localeCompare(b.name);
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

      {/* Filters + sort + view toggle */}
      <div style={{ display:"flex", gap:8, marginBottom:22, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:180, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, pointerEvents:"none" }}>{Icons.search}</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={lang==="en"?"Search vehicle or plate…":"Chercher un véhicule ou immatriculation…"}
            style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"9px 12px 9px 36px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
        </div>
        {[["all",lang==="en"?"All":"Tous"],["disponible",lang==="en"?"Available":"Disponible"],["en location",lang==="en"?"Rented":"En location"],["entretien",lang==="en"?"Maintenance":"Entretien"]].map(([k,l])=>{
          const cnt=k==="all"?vehicles.length:vehicles.filter(v=>v.status===k).length;
          const active=filter===k;
          return (
            <button key={k} onClick={()=>setFilter(k)}
              style={{ padding:"8px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", background:active?T.goldDim:T.card, border:`1px solid ${active?T.gold:T.border}`, color:active?T.gold:T.sub, transition:"all .15s", fontFamily:"inherit" }}>
              {l} ({cnt})
            </button>
          );
        })}
        {/* Sort */}
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{ padding:"8px 12px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", background:T.card, border:`1px solid ${T.border}`, color:T.sub, fontFamily:"inherit", outline:"none" }}>
          {[["name",lang==="en"?"Sort: Name":"Trier : Nom"],["km",lang==="en"?"Sort: Km":"Trier : Km"],["price",lang==="en"?"Sort: Price":"Trier : Prix"],["year",lang==="en"?"Sort: Year":"Trier : Année"],["rev",lang==="en"?"Sort: Revenue":"Trier : Revenus"]].map(([v,l])=>(
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        {/* View toggle */}
        <div style={{ display:"flex", gap:4 }}>
          {[["grid","⊞"],["list","☰"]].map(([mode,icon])=>(
            <button key={mode} onClick={()=>setViewMode(mode)}
              style={{ padding:"8px 11px", borderRadius:9, fontSize:14, cursor:"pointer", background:viewMode===mode?T.goldDim:T.card, border:`1px solid ${viewMode===mode?T.gold:T.border}`, color:viewMode===mode?T.gold:T.sub }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:20 }}>
        {/* Grid or List */}
        <div style={{ flex:1, ...(viewMode==="grid" ? { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(236px,1fr))", gap:16, alignContent:"start" } : {}) }}>
          {dataLoading && viewMode==="grid" && Array.from({length:6}).map((_,i)=><SkeletonCard key={i}/>)}
          {dataLoading && viewMode==="list" && (
            <div style={{ background:T.card, borderRadius:14, overflow:"hidden" }}>
              {Array.from({length:5}).map((_,i)=><div key={i} style={{ height:52, background:i%2===0?T.card:T.card2, borderBottom:`1px solid ${T.border}` }}/>)}
            </div>
          )}

          {/* LIST VIEW */}
          {!dataLoading && viewMode==="list" && (
            <div style={{ background:T.card, borderRadius:14, overflow:"hidden", border:`1px solid ${T.border}` }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:T.card2 }}>
                    {[lang==="en"?"Vehicle":"Véhicule","Immat.",lang==="en"?"Fuel":"Carb.",lang==="en"?"Year":"Année","Km",lang==="en"?"Price/day":"Prix/j",lang==="en"?"Rentals":"Locations",lang==="en"?"Revenue":"Revenus",lang==="en"?"Occup.":"Occup.",t.status,"CT",""].map(h=>(
                      <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".06em", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v,i)=>{
                    const st = vehicleStats(v.id);
                    const ct = ctStatus(v.ct_date);
                    const selected = sel?.id===v.id;
                    return (
                      <tr key={v.id} onClick={()=>setSel(selected?null:v)} style={{ background:selected?T.goldDim:i%2===0?T.card:T.card2, cursor:"pointer", borderTop:`1px solid ${T.border}` }}>
                        <td style={{ padding:"10px 12px", fontWeight:700, fontSize:13, color:T.text, whiteSpace:"nowrap" }}>
                          {v.photo_url && <img src={v.photo_url} style={{ width:32, height:22, objectFit:"cover", borderRadius:4, marginRight:8, verticalAlign:"middle" }}/>}
                          {v.name}
                        </td>
                        <td style={{ padding:"10px 12px", fontSize:11, color:T.muted, fontFamily:"monospace" }}>{v.plate}</td>
                        <td style={{ padding:"10px 12px", fontSize:12, color:T.sub }}>{v.fuel}</td>
                        <td style={{ padding:"10px 12px", fontSize:12, color:T.sub }}>{v.year}</td>
                        <td style={{ padding:"10px 12px", fontSize:12, color:T.sub }}>{fmt(v.km)} km</td>
                        <td style={{ padding:"10px 12px", fontSize:12, fontWeight:700, color:T.gold }}>{v.price_per_day||v.price} €</td>
                        <td style={{ padding:"10px 12px", fontSize:12, color:T.sub }}>{st.count}</td>
                        <td style={{ padding:"10px 12px", fontSize:12, fontWeight:600, color:T.text }}>{fmt(Math.round(st.revenue))} €</td>
                        <td style={{ padding:"10px 12px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ flex:1, height:5, background:T.border, borderRadius:3, minWidth:40 }}>
                              <div style={{ height:"100%", borderRadius:3, background:st.occupancy>70?T.gold:T.sub, width:`${st.occupancy}%` }}/>
                            </div>
                            <span style={{ fontSize:10, color:T.muted, whiteSpace:"nowrap" }}>{st.occupancy}%</span>
                          </div>
                        </td>
                        <td style={{ padding:"10px 12px" }}><StatusBadge status={v.status}/></td>
                        <td style={{ padding:"10px 12px" }}>{ct && <span style={{ fontSize:10, fontWeight:700, color:ct.color, background:ct.bg, padding:"2px 7px", borderRadius:6, whiteSpace:"nowrap" }}>{ct.label}</span>}</td>
                        <td style={{ padding:"10px 12px" }}>
                          <button onClick={e=>{e.stopPropagation(); setForm({name:v.name,plate:v.plate,fuel:v.fuel,trans:v.transmission||v.trans,km:String(v.km),price:String(v.price_per_day||v.price),year:String(v.year),cat:v.category||v.cat,photo:v.photo_url||"",vin:v.vin||"",color:v.color||"",ctDate:v.ct_date||""}); setSel(v); setModal("edit");}}
                            style={{ padding:"4px 10px", background:T.card, border:`1px solid ${T.border2}`, borderRadius:8, color:T.sub, cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>
                            {Icons.edit}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!filtered.length && <div style={{ textAlign:"center", padding:40, color:T.muted, fontSize:13 }}>{lang==="en"?"No vehicles found":"Aucun véhicule trouvé"}</div>}
            </div>
          )}

          {/* GRID VIEW */}
          {!dataLoading && viewMode==="grid" && filtered.map(v=>{
            const selected = sel?.id===v.id;
            const st = vehicleStats(v.id);
            const ct = ctStatus(v.ct_date);
            return (
              <div key={v.id} onClick={()=>setSel(selected?null:v)}
                style={{ background:T.card, border:`1px solid ${selected?T.gold:T.border}`, borderRadius:16, overflow:"hidden", cursor:"pointer", transition:"all .22s" }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 16px 50px #00000060"; e.currentTarget.style.borderColor=selected?T.gold:T.border2; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor=selected?T.gold:T.border; }}>

                {/* Vehicle art */}
                <div style={{ height:130, background:`linear-gradient(160deg,${T.card2} 0%,${T.surface} 100%)`, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                  <div style={{ position:"absolute", bottom:-20, left:"50%", transform:"translateX(-50%)", width:160, height:60, borderRadius:"50%", background:`${T.gold}18`, filter:"blur(20px)", pointerEvents:"none" }}/>
                  {v.photo_url ? <img src={v.photo_url} style={{ width:"100%", height:"100%", objectFit:"cover", position:"absolute", inset:0, borderRadius:0 }}/> : <CarSilhouette cat={v.cat} color={T.gold} size={160}/>}
                  <div style={{ position:"absolute", top:10, right:10, display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end" }}>
                    <StatusBadge status={v.status}/>
                    {ct && <span style={{ fontSize:9, fontWeight:700, color:ct.color, background:ct.bg, padding:"2px 6px", borderRadius:5 }}>{ct.label}</span>}
                  </div>
                  <div style={{ position:"absolute", bottom:8, left:12, fontSize:10, color:T.muted, letterSpacing:".08em", textTransform:"uppercase", fontWeight:600 }}>{v.cat}</div>
                  <div style={{ position:"absolute", bottom:8, right:12, fontSize:17, fontWeight:700, color:T.gold, letterSpacing:"-0.02em" }}>{v.price_per_day||v.price}€/j</div>
                </div>

                {/* Info */}
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:2, color:T.text }}>{v.name}</div>
                  <div style={{ fontSize:11, color:T.muted, fontFamily:"monospace", marginBottom:10, letterSpacing:".04em" }}>{v.plate}</div>
                  <div style={{ display:"flex", gap:5, marginBottom:10, flexWrap:"wrap" }}>
                    <Badge label={v.fuel} color={T.sub} bg={T.card2}/>
                    <Badge label={v.trans} color={T.sub} bg={T.card2}/>
                    <Badge label={String(v.year)} color={T.sub} bg={T.card2}/>
                  </div>
                  {/* Mini stats */}
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, padding:"6px 0", borderTop:`1px solid ${T.border}` }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{st.count}</div>
                      <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase" }}>{lang==="en"?"Trips":"Locations"}</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:13, fontWeight:700, color:T.gold }}>{fmt(Math.round(st.revenue))} €</div>
                      <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase" }}>{lang==="en"?"Revenue":"Revenus"}</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:13, fontWeight:700, color:st.occupancy>70?T.gold:T.sub }}>{st.occupancy}%</div>
                      <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase" }}>{lang==="en"?"Occup.":"Occup."}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:T.muted, marginBottom:6 }}>{fmt(v.km)} km parcourus</div>
                  <ProgressBar value={v.km} max={150000} color={v.km>100000?T.red:v.km>70000?T.amber:T.gold}/>
                </div>
              </div>
            );
          })}
          {!dataLoading && viewMode==="grid" && !filtered.length && (
            <div style={{ gridColumn:"1/-1", textAlign:"center", padding:80, color:T.muted }}>
              <div style={{ display:"flex", justifyContent:"center", opacity:.3, marginBottom:12 }}><CarSilhouette cat="Berline" color={T.muted} size={100}/></div>
              {lang==="en"?"No vehicles found":"Aucun véhicule trouvé"}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {sel && (
          <div style={{ width:294, flexShrink:0, animation:"slideIn .25s" }}>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden", position:"sticky", top:36 }}>
              {/* Art */}
              <div style={{ height:150, background:`linear-gradient(160deg,${T.card2},${T.surface})`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", bottom:-10, left:"50%", transform:"translateX(-50%)", width:180, height:60, background:`${T.gold}15`, borderRadius:"50%", filter:"blur(20px)" }}/>
                {sel.photo_url
                  ? <img src={sel.photo_url} style={{ width:"100%", height:"100%", objectFit:"cover", position:"absolute", inset:0 }}/>
                  : <CarSilhouette cat={sel.cat} color={T.gold} size={190}/>}
                <button onClick={()=>setSel(null)} style={{ position:"absolute", top:10, right:10, background:T.card+"CC", border:"none", borderRadius:7, padding:5, color:T.sub, cursor:"pointer", display:"flex" }}>{Icons.x}</button>
              </div>
              <div style={{ padding:20 }}>
                <div style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.02em", marginBottom:8, color:T.text }}>{sel.name}</div>

                {/* Status change */}
                <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:14 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".08em" }}>{t.status||"Statut"}</span>
                  <select value={sel.status} onChange={async e=>{
                    const newStatus = e.target.value;
                    await supabase.from("vehicles").update({ status: newStatus }).eq("id", sel.id);
                    setVehicles(vehicles.map(v=>v.id===sel.id?{...v,status:newStatus}:v));
                    setSel(s=>({...s,status:newStatus}));
                    toast(lang==="en"?"Status updated":"Statut mis à jour", "success");
                  }}
                  style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"7px 10px", color:T.text, fontSize:12, fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
                    {[["disponible",lang==="en"?"Available":"Disponible"],["en location",lang==="en"?"Rented":"En location"],["entretien",lang==="en"?"Maintenance":"Entretien"]].map(([v,l])=>(
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>

                {/* CT alert */}
                {ctStatus(sel.ct_date) && (() => { const ct = ctStatus(sel.ct_date); return (
                  <div style={{ padding:"8px 12px", background:ct.bg, border:`1px solid ${ct.color}40`, borderRadius:9, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14 }}>⚠️</span>
                    <span style={{ fontSize:12, fontWeight:700, color:ct.color }}>{ct.label}</span>
                  </div>
                );})()}

                {/* Stats */}
                {(() => { const st = vehicleStats(sel.id); return (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                    {[[st.count, lang==="en"?"Trips":"Locations", T.text],[`${fmt(Math.round(st.revenue))} €`, lang==="en"?"Revenue":"Revenus", T.gold],[`${st.occupancy}%`, lang==="en"?"Occup.":"Occup.", st.occupancy>70?T.gold:T.sub]].map(([val,lbl,col])=>(
                      <div key={lbl} style={{ padding:"8px", background:T.card2, borderRadius:9, textAlign:"center" }}>
                        <div style={{ fontSize:14, fontWeight:700, color:col }}>{val}</div>
                        <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", marginTop:2 }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                );})()}

                {/* Fields */}
                <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                  {[
                    ["Immatriculation", sel.plate],
                    [lang==="en"?"Fuel":"Carburant", sel.fuel],
                    [lang==="en"?"Gearbox":"Transmission", sel.trans],
                    [lang==="en"?"Mileage":"Kilométrage", fmt(sel.km)+" km"],
                    [lang==="en"?"Price / day":"Prix / jour", (sel.price_per_day||sel.price)+" €"],
                    [lang==="en"?"Year":"Année", sel.year],
                    ...(sel.color ? [[lang==="en"?"Color":"Couleur", sel.color]] : []),
                    ...(sel.vin   ? [["VIN", sel.vin]] : []),
                    ...(sel.ct_date ? [[lang==="en"?"Next CT":"Prochain CT", fmtDate(sel.ct_date)]] : []),
                  ].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
                      <span style={{ fontSize:12, color:T.muted }}>{k}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:T.text }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Km wear */}
                <div style={{ marginTop:12, padding:12, background:T.card2, borderRadius:11 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:11, color:T.muted }}>{lang==="en"?"Mileage wear":"Usure kilométrique"}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:sel.km>100000?T.red:sel.km>70000?T.amber:T.gold }}>{Math.round((sel.km/150000)*100)}%</span>
                  </div>
                  <ProgressBar value={sel.km} max={150000} color={sel.km>100000?T.red:sel.km>70000?T.amber:T.gold}/>
                </div>

                <div style={{ display:"flex", gap:8, marginTop:14 }}>
                  <button style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 14px", background:T.card, border:`1px solid ${T.border2}`, borderRadius:10, color:T.text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }} onClick={()=>{ setForm({ name:sel.name, plate:sel.plate, fuel:sel.fuel, trans:sel.transmission||sel.trans, km:String(sel.km), price:String(sel.price_per_day||sel.price), year:String(sel.year), cat:sel.category||sel.cat, photo:sel.photo_url||"", vin:sel.vin||"", color:sel.color||"", ctDate:sel.ct_date||"" }); setModal("edit"); }}>{Icons.edit} {lang==="en"?"Edit":"Modifier"}</button>
                  <Btn variant="danger" icon={Icons.trash} style={{ padding:"9px 11px" }} onClick={()=>setConfirm({ message:`Supprimer le véhicule "${sel.name}" ? Cette action est irréversible.`, onConfirm: async ()=>{ await supabase.from("vehicles").delete().eq("id", sel.id); setVehicles(vehicles.filter(v=>v.id!==sel.id)); setSel(null); toast(lang==="en"?"Vehicle deleted":"Véhicule supprimé"); } })}/>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {confirm && <ConfirmModal message={confirm.message} onConfirm={()=>{ confirm.onConfirm(); setConfirm(null); }} onCancel={()=>setConfirm(null)}/>}
      {upgradeModal && <UpgradeModal reason={`Votre plan Starter est limité à ${PLAN_LIMITS.starter.vehicles} véhicules. Passez en Pro pour une flotte illimitée.`} onClose={()=>setUpgradeModal(false)}/>}
      {modal && (
      <Modal title={modal==="edit"?"Modifier le véhicule":(t.addVehicle||"Ajouter un véhicule")} onClose={()=>setModal(false)}>
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
            <Input label="VIN (N° de châssis)" value={form.vin} onChange={v=>setForm({...form,vin:v})} placeholder="VF1XXXXXX12345678"/>
            <Input label={lang==="en"?"Color":"Couleur"} value={form.color} onChange={v=>setForm({...form,color:v})} placeholder={lang==="en"?"White":"Blanc"}/>
            <Input label={lang==="en"?"Next technical inspection":"Prochain contrôle technique"} type="date" value={form.ctDate} onChange={v=>setForm({...form,ctDate:v})}/>
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
            <Btn label={modal==="edit"?"Enregistrer":(t.add||"Ajouter")} onClick={async ()=>{
              if (!form.name.trim()) { toast("Le nom du véhicule est requis", "error"); return; }
              if (!form.plate.trim()) { toast("L'immatriculation est requise", "error"); return; }
              const payload = { name: form.name, plate: form.plate, fuel: form.fuel, transmission: form.trans, km: parseInt(form.km)||0, price_per_day: parseInt(form.price)||0, year: parseInt(form.year)||2023, category: form.cat, photo_url: form.photo, vin: form.vin||null, color: form.color||null, ct_date: form.ctDate||null };
              if (modal==="edit") {
                await supabase.from("vehicles").update(payload).eq("id", sel.id);
                setVehicles(vehicles.map(v=>v.id===sel.id?{...v,...payload,trans:payload.transmission,price:payload.price_per_day,cat:payload.category}:v));
                setSel(s=>s?{...s,...payload,trans:payload.transmission,price:payload.price_per_day,cat:payload.category}:s);
              } else {
                const { data } = await supabase.from("vehicles").insert({ ...payload, user_id: user.id, agency_id: activeAgencyId||null, status: "disponible" }).select().single();
                if (data) setVehicles([...vehicles, { ...data, trans: data.transmission, price: data.price_per_day, cat: data.category }]);
              }
              setModal(false);
            }} variant="primary"/>
          </div>
        </Modal>
      )}
    </Page>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
function Clients({ clients, setClients, user, activeAgencyId = null, dataLoading = false, rentals = [] }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const toast = useToast();
  const [sel,  setSel]    = useState(null);
  const [search, setSearch]= useState("");
  const [filterC, setFilterC] = useState("all");
  const [modal, setModal]  = useState(false);
  const [form, setForm]    = useState({firstName:"",lastName:"",email:"",phone:"",type:"particulier",licenseExpiry:"",licenseNumber:"",licenseCategory:"B",birthDate:"",address:"",companyName:"",companySiret:""});
  const [confirm, setConfirm] = useState(null);
  const filtered = clients.filter(c=>{
    if (search && !`${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterC === "expired") return isExpired(c.license_expiry||c.licenseExpiry);
    if (filterC === "entreprise") return c.type === "entreprise";
    if (filterC === "particulier") return c.type !== "entreprise";
    return true;
  });

  return (
    <Page title={t.clients||"Clients"} sub={`${clients.length} ${t.clients||"clients"}`}
      actions={<Btn label={t.newClient||"Nouveau client"} variant="primary" icon={Icons.plus} onClick={()=>setModal(true)}/>}>
      <div style={{ display:"flex", gap:8, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:180, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, pointerEvents:"none" }}>{Icons.search}</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={"Rechercher un client…"}
            style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"9px 12px 9px 36px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
        </div>
        {[["all","Tous"],["particulier","Particuliers"],["entreprise","Entreprises"],["expired","Permis expirés"]].map(([k,l])=>{
          const cnt = k==="all"?clients.length:k==="expired"?clients.filter(c=>isExpired(c.license_expiry||c.licenseExpiry)).length:clients.filter(c=>k==="entreprise"?c.type==="entreprise":c.type!=="entreprise").length;
          const active = filterC===k;
          return (
            <button key={k} onClick={()=>setFilterC(k)}
              style={{ padding:"8px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", background:active?T.goldDim:T.card, border:`1px solid ${active?T.gold:T.border}`, color:active?(k==="expired"?T.red:T.gold):T.sub, transition:"all .15s", fontFamily:"inherit" }}>
              {l} ({cnt})
            </button>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:20 }}>
        <div style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:600 }}>
            <thead>
              <tr>
                {["Client","Contact","Permis",t.rentals||"Locations","Total dépensé",t.type||"Type"].map(l=>(
                  <th key={l} style={{ textAlign:"left", padding:"11px 16px", fontSize:10, fontWeight:700, color:T.muted, letterSpacing:".1em", textTransform:"uppercase", borderBottom:`1px solid ${T.border}` }}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataLoading && Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={6}/>)}
              {!dataLoading && filtered.length===0 && (
                <tr><td colSpan={6} style={{ textAlign:"center", padding:60 }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>👥</div>
                  <div style={{ fontSize:14, fontWeight:600, color:T.text, marginBottom:6 }}>Aucun client</div>
                  <div style={{ fontSize:12, color:T.muted, marginBottom:16 }}>Ajoutez votre premier client pour commencer</div>
                  <Btn label="Nouveau client" variant="primary" icon={Icons.plus} onClick={()=>setModal(true)}/>
                </td></tr>
              )}
              {!dataLoading && filtered.map(c=>{
                const exp=isExpired(c.licenseExpiry), selected=sel?.id===c.id;
                return (
                  <tr key={c.id} onClick={()=>setSel(selected?null:c)}
                    style={{ cursor:"pointer", background:selected?T.goldDim:"transparent", transition:"background .1s" }}
                    onMouseEnter={e=>{if(!selected)e.currentTarget.style.background=T.card2}}
                    onMouseLeave={e=>{if(!selected)e.currentTarget.style.background=selected?T.goldDim:"transparent"}}>
                    <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <Avatar name={`${c.first_name} ${c.last_name}`} size={34}/>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{c.first_name} {c.last_name}</div>
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
                <Avatar name={`${sel.first_name||sel.firstName} ${sel.last_name||sel.lastName}`} size={52}/>
                <div style={{ marginTop:12, fontSize:17, fontWeight:700, letterSpacing:"-0.02em", color:T.text }}>{sel.first_name||sel.firstName} {sel.last_name||sel.lastName}</div>
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
              {(() => {
                const clientRentals = rentals.filter(r=>String(r.client_id)===String(sel.id));
                return clientRentals.length > 0 ? (
                  <div style={{ marginTop:14 }}>
                    <div style={{ fontSize:11, color:T.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>Historique ({clientRentals.length})</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:200, overflowY:"auto" }}>
                      {clientRentals.map(r=>(
                        <div key={r.id} style={{ padding:"8px 10px", background:T.card2, borderRadius:9 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:T.text, marginBottom:3 }}>{r.vehicle_name}</div>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <span style={{ fontSize:11, color:T.sub }}>{fmtDate(r.start_date)} → {fmtDate(r.end_date)}</span>
                            <StatusBadge status={r.status}/>
                          </div>
                          <div style={{ fontSize:11, color:T.gold, fontWeight:600, marginTop:2 }}>{fmt(r.total)} €</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
              <div style={{ display:"flex", gap:8, marginTop:14 }}>
                <button style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 14px", background:T.card, border:`1px solid ${T.border2}`, borderRadius:10, color:T.text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }} onClick={()=>{ setForm({ firstName:sel.first_name||sel.firstName||"", lastName:sel.last_name||sel.lastName||"", email:sel.email||"", phone:sel.phone||"", type:sel.type||"particulier", licenseExpiry:sel.license_expiry||sel.licenseExpiry||"", licenseNumber:sel.license_number||"", licenseCategory:sel.license_category||"B", birthDate:sel.birth_date||"", address:sel.address||"", companyName:sel.company_name||"", companySiret:sel.company_siret||"" }); setModal("edit"); }}>{Icons.edit} Modifier</button>
                <Btn variant="danger" icon={Icons.trash} style={{ padding:"9px 11px" }} onClick={()=>setConfirm({ message:`Supprimer le client "${sel.first_name||sel.firstName} ${sel.last_name||sel.lastName}" ? Cette action est irréversible.`, onConfirm: async ()=>{ await supabase.from("clients").delete().eq("id", sel.id); setClients(clients.filter(c=>c.id!==sel.id)); setSel(null); toast("Client supprimé"); } })}/>
              </div>
            </Card>
          </div>
        )}
      </div>

      {confirm && <ConfirmModal message={confirm.message} onConfirm={()=>{ confirm.onConfirm(); setConfirm(null); }} onCancel={()=>setConfirm(null)}/>}
      {modal && (
        <Modal title={modal==="edit"?"Modifier le client":(t.newClient||"Nouveau client")} onClose={()=>setModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Input label={lang==="en"?"First name":"Prénom"} value={form.firstName} onChange={v=>setForm({...form,firstName:v})} placeholder="Marie"/>
            <Input label={lang==="en"?"Last name":"Nom"} value={form.lastName} onChange={v=>setForm({...form,lastName:v})} placeholder="Dupont"/>
            <div style={{ gridColumn:"1/-1" }}><Input label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="marie@email.fr"/></div>
            <Input label={lang==="en"?"Phone":"Téléphone"} value={form.phone} onChange={v=>setForm({...form,phone:v})} placeholder="+33 6 …"/>
            <Input label={lang==="en"?"Date of birth":"Date de naissance"} type="date" value={form.birthDate} onChange={v=>setForm({...form,birthDate:v})}/>
            <div style={{ gridColumn:"1/-1" }}><Input label={lang==="en"?"Address":"Adresse"} value={form.address} onChange={v=>setForm({...form,address:v})} placeholder="12 rue de la Paix, 75001 Paris"/></div>
            <Input label={lang==="en"?"License N°":"N° de permis"} value={form.licenseNumber} onChange={v=>setForm({...form,licenseNumber:v})} placeholder="12AA12345"/>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{lang==="en"?"License category":"Catégorie permis"}</label>
              <select value={form.licenseCategory} onChange={e=>setForm({...form,licenseCategory:e.target.value})}
                style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                {["B","A","A1","A2","B1","BE","C","CE","D","DE","AM"].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label={lang==="en"?"License expiry":"Expiration du permis"} type="date" value={form.licenseExpiry} onChange={v=>setForm({...form,licenseExpiry:v})}/>
            {form.type==="entreprise" && <>
              <Input label={lang==="en"?"Company name":"Nom de l'entreprise"} value={form.companyName} onChange={v=>setForm({...form,companyName:v})} placeholder="SARL Dupont"/>
              <Input label="SIRET entreprise" value={form.companySiret} onChange={v=>setForm({...form,companySiret:v})} placeholder="123 456 789 00012"/>
            </>}
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:22 }}>
            <Btn label={t.cancel||"Annuler"} onClick={()=>setModal(false)} variant="secondary"/>
            <Btn label={modal==="edit"?"Enregistrer":(t.save||"Créer le client")} onClick={async ()=>{
              if (!form.firstName.trim() || !form.lastName.trim()) { toast("Prénom et nom requis", "error"); return; }
              if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast("Email invalide", "error"); return; }
              const payload = { first_name: form.firstName, last_name: form.lastName, email: form.email, phone: form.phone, type: form.type, license_expiry: form.licenseExpiry, license_number: form.licenseNumber||null, license_category: form.licenseCategory||"B", birth_date: form.birthDate||null, address: form.address||null, company_name: form.companyName||null, company_siret: form.companySiret||null };
              if (modal==="edit") {
                await supabase.from("clients").update(payload).eq("id", sel.id);
                const updated = { ...sel, ...payload, firstName: payload.first_name, lastName: payload.last_name, licenseExpiry: payload.license_expiry };
                setClients(clients.map(c=>c.id===sel.id?updated:c));
                setSel(updated);
              } else {
                const { data } = await supabase.from("clients").insert({ ...payload, user_id: user.id, agency_id: activeAgencyId||null, locations_count: 0, total_spent: 0 }).select().single();
                if (data) {
                  setClients([...clients, { ...data, firstName: data.first_name, lastName: data.last_name, licenseExpiry: data.license_expiry, totalSpent: data.total_spent, locations: data.locations_count }]);
                  setForm({firstName:"",lastName:"",email:"",phone:"",type:"particulier",licenseExpiry:"",licenseNumber:"",licenseCategory:"B",birthDate:"",address:"",companyName:"",companySiret:""});
                }
              }
              setModal(false);
            }} variant="primary"/>
          </div>
        </Modal>
      )}
    </Page>
  );
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
function Payments({ payments, setPayments, clients, setClients, rentals, user, userPlan = "starter", activeAgencyId = null, dataLoading = false }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState({ clientId:"", rentalId:"", amount:"", deposit:"", method:"Espèces", status:"en attente", paidAt:"" });
  const [confirm, setConfirm] = useState(null);
  const up = (k,v) => setForm(prev=>({...prev,[k]:v}));

  const filtered = payments.filter(p=>
    (filter==="all"||p.status===filter) &&
    (!search || (p.client_name||"").toLowerCase().includes(search.toLowerCase()))
  );
  const stats = [
    {label:t.collected||"Encaissé",   value:payments.filter(p=>p.status==="encaissé").reduce((a,p)=>a+(p.amount||0),0),  color:T.success, icon:Icons.check },
    {label:t.pending||"En attente", value:payments.filter(p=>p.status==="en attente").reduce((a,p)=>a+(p.amount||0),0),color:T.amber,   icon:Icons.clock  },
    {label:t.late||"En retard",  value:payments.filter(p=>p.status==="en retard").reduce((a,p)=>a+(p.amount||0),0), color:T.red,     icon:Icons.alert  },
    {label:"Cautions",   value:payments.reduce((a,p)=>a+(p.deposit||0),0),                                   color:T.blue,    icon:Icons.shield },
  ];

  const openAdd = () => { setEditId(null); setForm({ clientId:"", rentalId:"", amount:"", deposit:"", method:"Espèces", status:"en attente", paidAt:"" }); setModal(true); };
  const openEdit = (p) => { setEditId(p.id); setForm({ clientId:String(p.client_id||""), rentalId:String(p.rental_id||""), amount:String(p.amount||""), deposit:String(p.deposit||""), method:p.method||"Espèces", status:p.status||"en attente", paidAt:p.paid_at||"" }); setModal(true); };

  const exportCSV = () => {
    if (userPlan === "starter") { toast(lang==="en"?"CSV export available from Pro plan":"Export CSV disponible à partir du plan Pro", "warn"); return; }
    const headers = [lang==="en"?"Date":"Date", lang==="en"?"Client":"Client", lang==="en"?"Rental":"Location", lang==="en"?"Amount":"Montant", lang==="en"?"Deposit":"Caution", lang==="en"?"Method":"Méthode", lang==="en"?"Status":"Statut"];
    const rows = payments.map(p=>[
      p.paid_at ? new Date(p.paid_at).toLocaleDateString("fr-FR") : "—",
      p.client_name||"—",
      p.rental_id ? `LOC-${p.rental_id}` : "—",
      p.amount||0,
      p.deposit||0,
      p.method||"—",
      p.status||"—",
    ]);
    const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF"+csv], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loqar-paiements-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const updateClientTotalSpent = async (clientId, delta) => {
    const client = clients.find(c=>String(c.id)===String(clientId));
    if (!client) return;
    const newTotal = Math.max(0, (client.totalSpent||0) + delta);
    await supabase.from("clients").update({ total_spent: newTotal }).eq("id", client.id);
    setClients(prev => prev.map(c=>String(c.id)===String(clientId)?{...c, totalSpent:newTotal, total_spent:newTotal}:c));
  };

  const handleSave = async () => {
    const client = clients.find(c=>String(c.id)===String(form.clientId));
    const payload = {
      client_id: form.clientId ? (parseInt(form.clientId)||form.clientId) : null,
      rental_id: form.rentalId||null,
      client_name: client?`${client.first_name} ${client.last_name}`:"—",
      amount: parseInt(form.amount)||0,
      deposit: parseInt(form.deposit)||0,
      method: form.method,
      status: form.status,
      paid_at: form.paidAt||new Date().toISOString().split("T")[0],
    };
    if (editId) {
      const oldPayment = payments.find(p=>p.id===editId);
      const { error } = await supabase.from("payments").update(payload).eq("id", editId);
      if (error) { toast("Erreur : " + error.message, "error"); return; }
      setPayments(prev => prev.map(p=>p.id===editId?{...p,...payload}:p));
      if (client) {
        const wasEncaissed = oldPayment?.status==="encaissé";
        const isNowEncaissed = payload.status==="encaissé";
        if (!wasEncaissed && isNowEncaissed) await updateClientTotalSpent(client.id, payload.amount);
        else if (wasEncaissed && !isNowEncaissed) await updateClientTotalSpent(client.id, -(oldPayment?.amount||0));
      }
    } else {
      const { data, error } = await supabase.from("payments").insert({ ...payload, user_id:user.id, agency_id:activeAgencyId||null }).select().single();
      if (error) { toast("Erreur : " + error.message, "error"); return; }
      if (data) setPayments(prev => [data, ...prev]);
      if (payload.status==="encaissé" && client) await updateClientTotalSpent(client.id, payload.amount);
    }
    setModal(false);
    toast(editId ? "Paiement modifié" : "Paiement enregistré");
  };

  const handleEncaisser = async (id) => {
    const payment = payments.find(p=>p.id===id);
    await supabase.from("payments").update({ status:"encaissé" }).eq("id", id);
    setPayments(payments.map(p=>p.id===id?{...p,status:"encaissé"}:p));
    if (payment?.client_id && payment?.amount) await updateClientTotalSpent(payment.client_id, payment.amount);
  };

  const handleDelete = (id) => {
    const payment = payments.find(p=>p.id===id);
    setConfirm({ message:"Supprimer ce paiement ? Cette action est irréversible.", onConfirm: async ()=>{
      await supabase.from("payments").delete().eq("id", id);
      setPayments(payments.filter(p=>p.id!==id));
      toast("Paiement supprimé");
      if (payment?.status==="encaissé" && payment?.client_id) await updateClientTotalSpent(payment.client_id, -(payment.amount||0));
    }});
  };

  return (
    <Page title={t.payments||"Paiements"} sub={lang==="en"?"Collections, transactions and deposits":"Encaissements, transactions et cautions"}
      actions={<div style={{ display:"flex", gap:8 }}>
        <button onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>↓ CSV</button>
        <button onClick={openAdd} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:T.gold, border:"none", borderRadius:10, color:"#0F0D0B", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{Icons.plus} {lang==="en"?"New payment":"Nouveau paiement"}</button>
      </div>}>
      
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:16, marginBottom:24 }}>
        {stats.map(s=>(
          <StatCard key={s.label} label={s.label} value={s.value} color={s.color} icon={s.icon} money/>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        {[["all",lang==="en"?"All":"Tous"],["encaissé",t.collected||"Encaissé"],["en attente",t.pending||"En attente"],["en retard",t.late||"En retard"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)}
            style={{ padding:"7px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", background:filter===k?T.goldDim:T.card, border:`1px solid ${filter===k?T.gold:T.border}`, color:filter===k?T.gold:T.sub, transition:"all .15s", fontFamily:"inherit" }}>{l}</button>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={lang==="en"?"Search client…":"Rechercher un client…"}
          style={{ marginLeft:"auto", background:T.card, border:`1px solid ${T.border}`, borderRadius:9, padding:"7px 13px", color:T.text, fontSize:12, fontFamily:"inherit", outline:"none", width:200 }}
          onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
      </div>

      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
          <thead>
            <tr>{[t.client||"Client",lang==="en"?"Rental":"Location",t.amount||"Montant",t.deposit||"Caution",t.method||"Méthode",t.date||"Date",t.status||"Statut",t.actions||"Actions"].map(l=>(
              <th key={l} style={{ textAlign:"left", padding:"10px 16px", fontSize:10, fontWeight:700, color:T.muted, letterSpacing:".1em", textTransform:"uppercase", borderBottom:`1px solid ${T.border}` }}>{l}</th>
            ))}</tr>
          </thead>
          <tbody>
            {dataLoading && Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={8}/>)}
            {!dataLoading && filtered.length===0 && (
              <tr><td colSpan={8} style={{ textAlign:"center", padding:60 }}>
                <div style={{ fontSize:32, marginBottom:12 }}>💳</div>
                <div style={{ fontSize:14, fontWeight:600, color:T.text, marginBottom:6 }}>Aucun paiement</div>
                <div style={{ fontSize:12, color:T.muted, marginBottom:16 }}>Les paiements apparaîtront ici</div>
                <Btn label="Nouveau paiement" variant="primary" icon={Icons.plus} onClick={openAdd}/>
              </td></tr>
            )}
            {!dataLoading && filtered.map(p=>{
              const rental = rentals.find(r=>String(r.id)===String(p.rental_id));
              return (
              <tr key={p.id} style={{ transition:"background .1s" }}
                onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar name={p.client_name||"?"} size={32}/>
                    <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{p.client_name||"—"}</span>
                  </div>
                </td>
                <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:12, color:T.sub }}>
                  {rental ? <span style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:6, padding:"3px 8px" }}>{rental.vehicle_name||"—"}</span> : <span style={{ color:T.muted }}>—</span>}
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
                        {lang==="en"?"Collect":"Encaisser"}
                      </button>
                    )}
                    {p.status==="en retard" && (
                      <button onClick={async ()=>{
                        const client = clients.find(c=>c.id===p.client_id);
                        if (!PLAN_LIMITS[userPlan]?.emails) { toast("Les emails automatiques sont disponibles à partir du plan Pro.", "warn"); return; }
                        if(client?.email) { await sendEmail("payment_reminder", client.email, { clientName:p.client_name, amount:p.amount }); toast("Rappel envoyé !"); }
                        else toast("Email client introuvable", "error");
                      }} style={{ padding:"5px 10px", background:T.amberDim||"#2A2010", border:`1px solid ${T.amber}30`, borderRadius:8, color:T.amber, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                        📧 {lang==="en"?"Remind":"Rappel"}
                      </button>
                    )}
                    <button onClick={()=>openEdit(p)}
                      style={{ padding:"5px 9px", background:T.card2, border:`1px solid ${T.border}`, borderRadius:8, color:T.sub, cursor:"pointer", display:"flex" }}>
                      {Icons.pen}
                    </button>
                    <button onClick={()=>handleDelete(p.id)}
                      style={{ padding:"5px 9px", background:T.redDim, border:`1px solid ${T.red}30`, borderRadius:8, color:T.red, cursor:"pointer", display:"flex" }}>
                      {Icons.trash}
                    </button>
                  </div>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>

      {confirm && <ConfirmModal message={confirm.message} onConfirm={()=>{ confirm.onConfirm(); setConfirm(null); }} onCancel={()=>setConfirm(null)}/>}
      {modal && (
        <Modal title={editId ? (lang==="en"?"Edit payment":"Modifier le paiement") : (t.newPayment||"Nouveau paiement")} onClose={()=>setModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Client</label>
              <select value={form.clientId} onChange={e=>up("clientId",e.target.value)}
                style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                <option value="">{lang==="en"?"— Select —":"— Sélectionner —"}</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
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
            <button onClick={handleSave} style={{ padding:"9px 18px", background:T.gold, border:"none", borderRadius:10, color:"#0F0D0B", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{t.save||"Enregistrer"}</button>
          </div>
        </Modal>
      )}
    </Page>
  );
}

// ─── MULTI-AGENCES ────────────────────────────────────────────────────────────
function MultiAgences({ user, userPlan = "starter", activeAgency = null, onSwitchAgency }) {
  const [agencies, setAgencies] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editId,   setEditId]   = useState(null); // id of agency being edited
  const [form,     setForm]     = useState({ name:"", email:"", phone:"", city:"", slug:"" });
  const [slugError, setSlugError] = useState("");
  const [mainSlug, setMainSlug] = useState("");
  const up = (k,v) => { setForm(f=>({...f,[k]:v})); if (k==="slug") setSlugError(""); };

  const toSlug = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

  useEffect(() => {
    if (!user || userPlan !== "enterprise") { setLoading(false); return; }
    supabase.from("profiles").select("sub_agencies, booking_slug").eq("id", user.id).single()
      .then(({ data }) => { setAgencies(data?.sub_agencies || []); setMainSlug(data?.booking_slug || ""); setLoading(false); });
  }, [user, userPlan]);

  const saveAgencies = async (list) => {
    setAgencies(list);
    await supabase.from("profiles").update({ sub_agencies: list }).eq("id", user.id);
  };

  const openAdd = () => { setEditId(null); setForm({ name:"", email:"", phone:"", city:"", slug:"" }); setSlugError(""); setModal(true); };
  const openEdit = (a) => { setEditId(a.id); setForm({ name:a.name||"", email:a.email||"", phone:a.phone||"", city:a.city||"", slug:a.slug||"" }); setSlugError(""); setModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const slug = form.slug.trim() || toSlug(form.name);
    if (!slug) { setSlugError("Le slug est requis"); return; }
    if (slug === mainSlug) { setSlugError("Ce slug est déjà utilisé par votre compte principal"); return; }
    if (agencies.some(a => a.slug === slug && a.id !== editId)) { setSlugError("Ce slug est déjà utilisé par une autre agence"); return; }
    let updated;
    if (editId) {
      updated = agencies.map(a => a.id === editId ? { ...a, ...form, slug } : a);
    } else {
      updated = [...agencies, { id: Date.now(), ...form, slug, status: "active", createdAt: new Date().toISOString() }];
    }
    await saveAgencies(updated);
    setModal(false);
    setSlugError("");
    setEditId(null);
    setForm({ name:"", email:"", phone:"", city:"", slug:"" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette agence ?")) return;
    await saveAgencies(agencies.filter(a => a.id !== id));
  };

  const toggleStatus = async (id) => {
    await saveAgencies(agencies.map(a => a.id === id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a));
  };

  if (userPlan !== "enterprise") return (
    <Page title="Multi-agences" sub="Gérez plusieurs agences depuis un seul compte">
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", textAlign:"center", gap:16 }}>
        <div style={{ fontSize:40 }}>🏢</div>
        <div style={{ fontSize:18, fontWeight:700, color:T.text }}>Fonctionnalité Enterprise</div>
        <div style={{ fontSize:14, color:T.muted, maxWidth:360, lineHeight:1.7 }}>
          La gestion multi-agences est disponible exclusivement avec le plan Enterprise à 249€/mois.
        </div>
        <button onClick={()=>window.location.href="https://buy.stripe.com/5kQ9AT79Bcdx1Q4ehR7kc08"} style={{ marginTop:8, background:T.gold, color:"#0F0D0B", border:"none", borderRadius:10, padding:"10px 24px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
          Passer à Enterprise →
        </button>
      </div>
    </Page>
  );

  return (
    <Page title="Multi-agences" sub={`${agencies.length} agence${agencies.length!==1?"s":""} gérée${agencies.length!==1?"s":""}`}>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20 }}>
        <Btn label="Ajouter une agence" variant="primary" icon={Icons.plus} onClick={openAdd}/>
      </div>

      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
          {Array.from({length:4}).map((_,i)=>(
            <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:T.border2, animation:"pulse 1.4s ease-in-out infinite" }}/>
                <div style={{ width:50, height:20, borderRadius:6, background:T.border2, animation:"pulse 1.4s ease-in-out infinite" }}/>
              </div>
              <div style={{ height:13, borderRadius:6, background:T.border2, animation:"pulse 1.4s ease-in-out infinite", width:"70%", marginBottom:8 }}/>
              <div style={{ height:11, borderRadius:6, background:T.border2, animation:"pulse 1.4s ease-in-out infinite", width:"50%", marginBottom:6 }}/>
              <div style={{ height:11, borderRadius:6, background:T.border2, animation:"pulse 1.4s ease-in-out infinite", width:"40%" }}/>
            </div>
          ))}
        </div>
      ) : agencies.length === 0 ? (
        <Card>
          <div style={{ textAlign:"center", padding:"40px 0", color:T.muted }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🏢</div>
            <div style={{ fontSize:14 }}>Aucune agence ajoutée. Créez votre première agence.</div>
          </div>
        </Card>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
          {agencies.map(a => (
            <Card key={a.id}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:T.goldDim, border:`1px solid ${T.gold}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🏢</div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <button onClick={()=>toggleStatus(a.id)} style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:6, border:"none", cursor:"pointer", fontFamily:"inherit",
                    background: a.status==="active" ? T.successDim : T.redDim,
                    color: a.status==="active" ? T.success : T.red }}>
                    {a.status==="active" ? "Actif" : "Inactif"}
                  </button>
                  <button onClick={()=>openEdit(a)} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:13, padding:"2px 4px" }} title="Modifier">✎</button>
                  <button onClick={()=>handleDelete(a.id)} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:14, padding:"2px 4px" }}>✕</button>
                </div>
              </div>
              <div style={{ fontWeight:700, fontSize:15, color:T.text, marginBottom:4 }}>{a.name}</div>
              {a.city && <div style={{ fontSize:12, color:T.muted, marginBottom:4 }}>📍 {a.city}</div>}
              {a.email && <div style={{ fontSize:12, color:T.muted, marginBottom:2 }}>✉ {a.email}</div>}
              {a.phone && <div style={{ fontSize:12, color:T.muted, marginBottom:4 }}>📞 {a.phone}</div>}
              {a.slug && (
                <>
                  <div style={{ background:T.card2, border:`1px solid ${a.slug===mainSlug?T.red:T.border}`, borderRadius:7, padding:"6px 10px", marginTop:8, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                    <span style={{ fontSize:10, color: a.slug===mainSlug ? T.red : T.gold, fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>loqar.fr/book/{a.slug}</span>
                    <button onClick={()=>navigator.clipboard?.writeText(`https://loqar.fr/book/${a.slug}`)} style={{ fontSize:10, background:"none", border:"none", color:T.muted, cursor:"pointer", flexShrink:0 }}>📋</button>
                  </div>
                  {a.slug===mainSlug && <div style={{ fontSize:10, color:T.red, marginTop:4 }}>⚠️ Conflit avec le slug principal — modifiez ce slug</div>}
                </>
              )}
              <div style={{ fontSize:11, color:T.muted, marginTop:10, paddingTop:10, borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span>Ajoutée le {new Date(a.createdAt).toLocaleDateString("fr-FR")}</span>
                <button onClick={()=>onSwitchAgency && onSwitchAgency(activeAgency?.id===a.id ? null : a)}
                  style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, border:"none", cursor:"pointer", fontFamily:"inherit",
                    background: activeAgency?.id===a.id ? T.goldDim : T.card2,
                    color: activeAgency?.id===a.id ? T.gold : T.sub }}>
                  {activeAgency?.id===a.id ? "✓ Active" : "Basculer →"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editId ? "Modifier l'agence" : "Nouvelle agence"} onClose={()=>{ setModal(false); setSlugError(""); setEditId(null); setForm({ name:"", email:"", phone:"", city:"", slug:"" }); }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[["Nom de l'agence *","name","Ex: Loqar Paris"],["Slug (URL réservation) *","slug","agence-paris"],["Email","email","contact@paris.loqar.fr"],["Téléphone","phone","+33 1 23 45 67 89"],["Ville","city","Paris"]].map(([lbl,key,ph])=>(
              <div key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{lbl}</label>
                <input value={form[key]||""}
                  onChange={e => {
                    up(key, e.target.value);
                    if (key === "name" && !form.slug && !editId) up("slug", toSlug(e.target.value));
                  }}
                  placeholder={key==="slug" ? (form.name ? toSlug(form.name) : ph) : ph}
                  style={{ background:T.card2, border:`1px solid ${key==="slug" && slugError ? T.red : T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}
                  onFocus={e=>e.target.style.borderColor=key==="slug"&&slugError?T.red:T.gold}
                  onBlur={e=>e.target.style.borderColor=key==="slug"&&slugError?T.red:T.border}/>
                {key==="slug" && (
                  <div style={{ fontSize:11, color: slugError ? T.red : T.muted }}>
                    {slugError || `URL : loqar.fr/book/${form.slug || toSlug(form.name) || "…"}`}
                  </div>
                )}
              </div>
            ))}
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:4 }}>
              <Btn label="Annuler" onClick={()=>{ setModal(false); setSlugError(""); setEditId(null); }}/>
              <Btn label={editId ? "Enregistrer" : "Créer l'agence"} variant="primary" onClick={handleSave}/>
            </div>
          </div>
        </Modal>
      )}
    </Page>
  );
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
// ─── VEHICLE CANVAS (état des lieux interactif) ───────────────────────────────
function VehicleCanvas({ storageKey = "loqar_canvas_draft", exportRef }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);
  const [color, setColor] = useState("#E53935");
  const [size, setSize] = useState(4);

  const drawCar = (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#FDFAF5"; ctx.fillRect(0, 0, w, h);
    const sx = w/320, sy = h/180;
    // Corps principal
    ctx.beginPath(); ctx.roundRect(80*sx, 20*sy, 160*sx, 140*sy, 30*Math.min(sx,sy));
    ctx.fillStyle = "#E8E0D0"; ctx.strokeStyle = "#AAA"; ctx.lineWidth = 1.5;
    ctx.fill(); ctx.stroke();
    // Capot avant
    ctx.beginPath(); ctx.roundRect(95*sx, 20*sy, 130*sx, 40*sy, 10*Math.min(sx,sy));
    ctx.fillStyle = "#D8CFC0"; ctx.fill(); ctx.stroke();
    // Coffre
    ctx.beginPath(); ctx.roundRect(95*sx, 120*sy, 130*sx, 40*sy, 10*Math.min(sx,sy));
    ctx.fillStyle = "#D8CFC0"; ctx.fill(); ctx.stroke();
    // Habitacle
    ctx.beginPath(); ctx.roundRect(100*sx, 62*sy, 120*sx, 56*sy, 6*Math.min(sx,sy));
    ctx.fillStyle = "#B8B0A0"; ctx.fill(); ctx.stroke();
    // Pare-brise
    ctx.beginPath(); ctx.roundRect(105*sx, 55*sy, 110*sx, 18*sy, 4*Math.min(sx,sy));
    ctx.fillStyle = "rgba(200,224,240,.7)"; ctx.fill(); ctx.stroke();
    // Lunette AR
    ctx.beginPath(); ctx.roundRect(105*sx, 107*sy, 110*sx, 16*sy, 4*Math.min(sx,sy));
    ctx.fillStyle = "rgba(200,224,240,.7)"; ctx.fill(); ctx.stroke();
    // Roues
    [[56,30],[236,30],[56,106],[236,106]].forEach(([x,y])=>{
      ctx.beginPath(); ctx.roundRect(x*sx, y*sy, 28*sx, 44*sy, 8*Math.min(sx,sy));
      ctx.fillStyle = "#555"; ctx.strokeStyle = "#333"; ctx.lineWidth = 1;
      ctx.fill(); ctx.stroke();
    });
    // Labels
    ctx.font = `${8*Math.min(sx,sy)+7}px sans-serif`; ctx.fillStyle = "#666"; ctx.textAlign = "center";
    ctx.fillText("AVANT",  160*sx, 46*sy);
    ctx.fillText("ARRIÈRE",160*sx, 148*sy);
    ctx.save(); ctx.translate(14*sx, 95*sy); ctx.rotate(-Math.PI/2);
    ctx.fillText("GAUCHE", 0, 0); ctx.restore();
    ctx.save(); ctx.translate((320-14)*sx, 95*sy); ctx.rotate(Math.PI/2);
    ctx.fillText("DROITE", 0, 0); ctx.restore();
  };

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - r.left) * (canvas.width / r.width), y: (src.clientY - r.top) * (canvas.height / r.height) };
  };

  const restoreStrokes = (ctx) => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      saved.forEach(s => {
        ctx.beginPath(); ctx.strokeStyle = s.color; ctx.lineWidth = s.size;
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        s.pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
        ctx.stroke();
      });
    } catch(e) {}
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawCar(ctx, canvas.width, canvas.height);
    restoreStrokes(ctx);
    if (exportRef) exportRef.current = () => canvas.toDataURL("image/png");
  }, [storageKey]);

  const startDraw = (e) => {
    e.preventDefault();
    drawing.current = true;
    const p = getPos(e, canvasRef.current);
    lastPos.current = p;
    // start new stroke
    const key = storageKey+"_cur";
    localStorage.setItem(key, JSON.stringify({ color, size, pts: [p] }));
  };
  const moveDraw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = size;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    // append to cur stroke
    try {
      const key = storageKey+"_cur";
      const cur = JSON.parse(localStorage.getItem(key)||"{}");
      cur.pts.push(pos);
      localStorage.setItem(key, JSON.stringify(cur));
    } catch(e) {}
  };
  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    try {
      const key = storageKey+"_cur";
      const cur = JSON.parse(localStorage.getItem(key)||"null");
      if (cur && cur.pts.length > 1) {
        const saved = JSON.parse(localStorage.getItem(storageKey)||"[]");
        saved.push(cur);
        localStorage.setItem(storageKey, JSON.stringify(saved));
      }
      localStorage.removeItem(key);
    } catch(e) {}
  };
  const clearCanvas = () => {
    localStorage.removeItem(storageKey);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    drawCar(ctx, canvas.width, canvas.height);
  };

  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, flexWrap:"wrap" }}>
        <div style={{ fontSize:9, color:"#888", textTransform:"uppercase", letterSpacing:".08em", fontWeight:700 }}>Marquer les dommages :</div>
        {["#E53935","#FF9800","#2196F3","#4CAF50","#000"].map(c=>(
          <button key={c} onClick={()=>setColor(c)} style={{ width:18, height:18, borderRadius:"50%", background:c, border:color===c?"2px solid #333":"2px solid transparent", cursor:"pointer", flexShrink:0 }}/>
        ))}
        <select value={size} onChange={e=>setSize(Number(e.target.value))} style={{ fontSize:10, padding:"2px 6px", borderRadius:6, border:"1px solid #CCC", background:"#FFF" }}>
          {[2,4,6,10].map(s=><option key={s} value={s}>{s}px</option>)}
        </select>
        <button onClick={clearCanvas} style={{ fontSize:10, padding:"3px 10px", borderRadius:6, border:"1px solid #DDD", background:"#FFF", cursor:"pointer", color:"#E53935", fontWeight:700 }}>✕ Effacer</button>
      </div>
      <canvas ref={canvasRef} width={640} height={360}
        style={{ width:"100%", maxWidth:400, border:"1px solid #DDD", borderRadius:8, touchAction:"none", cursor:"crosshair", display:"block" }}
        onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={endDraw}
      />
    </div>
  );
}

function Documents({ agencyProfile, vehicles, clients, prefill = null, onClearPrefill }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const toast = useToast();
  const [docType, setDocType] = useState("contrat");
  const [p, setP] = useState({clientId:"",vehicleId:"",startDate:"",endDate:"",price:"",deposit:"",km:"",kmReturn:"",fuelLevel:"full",fuelReturn:"full",notes:"",invoiceNum:"",clientLicense:"",clientAddress:"",paymentDue:"",quoteValidity:"30 jours",pickupLocation:"",returnLocation:"",additionalDriver:"",kmIncluded:"",kmOverRate:"0.20",paymentMethod:""});

  const up = (k,v) => setP(prev=>({...prev,[k]:v}));

  // Prefill from rental
  useEffect(() => {
    if (!prefill) return;
    setP(prev => ({
      ...prev,
      clientId:  prefill.client_id  || "",
      vehicleId: prefill.vehicle_id || "",
      startDate: prefill.start_date || "",
      endDate:   prefill.end_date   || "",
      price:     String(prefill.price_per_day || ""),
      deposit:   String(prefill.deposit || ""),
      km:        String(prefill.km_start || ""),
      notes:     prefill.notes || "",
    }));
    if (onClearPrefill) onClearPrefill();
    toast(lang==="en"?"Rental data loaded into the form":"Données de location chargées dans le formulaire", "success");
  }, [prefill]);
  const days  = Math.ceil((new Date(p.endDate)-new Date(p.startDate))/86400000);
  const total = (parseInt(p.price)||0)*(days>0?days:0);
  const totalHT = Math.round(total / 1.20);
  const tva     = total - totalHT;
  const selectedClient  = clients.find(c=>c.id===p.clientId)||null;
  const selectedVehicle = vehicles.find(v=>v.id===p.vehicleId)||null;
  const agencyName    = agencyProfile?.name    || agencyProfile?.agency_name || "Mon Agence";
  const agencyAddress = agencyProfile?.address || "Adresse de l'agence";
  const agencySiret   = agencyProfile?.siret   || "SIRET : XX XXX XXX XXXXX";
  const agencyPhone   = agencyProfile?.phone   || "";
  const agencyEmail   = agencyProfile?.email   || "";
  const agencyFranchise = agencyProfile?.franchise || "800 €";
  const agencyTva       = agencyProfile?.tva       || "";
  // Sequential doc numbering stored in localStorage per year-month
  const docNumRef = useRef(null);
  if (!docNumRef.current) {
    const ym = `${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,"0")}`;
    const key = `loqar_docnum_${ym}`;
    const next = (parseInt(localStorage.getItem(key)||"0") + 1);
    localStorage.setItem(key, String(next));
    docNumRef.current = `LQ-${ym}-${String(next).padStart(4,"0")}`;
  }
  const docNum = docNumRef.current;

  const printDoc = () => {
    if (!p.clientId) { toast("Veuillez sélectionner un client avant de générer le document.", "error"); return; }
    if (!p.vehicleId) { toast("Veuillez sélectionner un véhicule avant de générer le document.", "error"); return; }
    const el = document.getElementById("doc-preview");
    if (!el) return;
    let html = el.innerHTML;
    // Replace canvas with its image for print
    if (canvasExportRef.current) {
      try {
        const dataUrl = canvasExportRef.current();
        html = html.replace(/<canvas[^>]*><\/canvas>/gi, `<img src="${dataUrl}" style="width:100%;max-width:400px;border:1px solid #DDD;border-radius:8px;display:block;"/>`);
      } catch(e) {}
    }
    const w = window.open("","_blank");
    w.document.write(`<html><head><title>Document Loqar</title><style>body{margin:0;font-family:Arial,sans-serif;color:#1A1510;}@media print{body{margin:0}}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    // Save to history
    try {
      const hist = JSON.parse(localStorage.getItem("loqar_docs_history")||"[]");
      const entry = { docNum, docType, clientName: selectedClient?(selectedClient.first_name||selectedClient.firstName)+" "+(selectedClient.last_name||selectedClient.lastName):"", vehicleName: selectedVehicle?.name||"", date: new Date().toISOString(), params: p };
      hist.unshift(entry);
      const trimmed = hist.slice(0,50);
      localStorage.setItem("loqar_docs_history", JSON.stringify(trimmed));
      setDocHistory(trimmed);
    } catch(e) {}
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
  const [checks, setChecks] = useState(()=>{ try { return JSON.parse(localStorage.getItem(`loqar_checks_${p.vehicleId||"draft"}`)||"{}").checks||{}; } catch(e) { return {}; } });
  const [checkNotes, setCheckNotes] = useState(()=>{ try { return JSON.parse(localStorage.getItem(`loqar_checks_${p.vehicleId||"draft"}`)||"{}").notes||{}; } catch(e) { return {}; } });
  const toggleCheck = (item, val) => setChecks(prev=>{ const n={...prev,[item]:val}; try { localStorage.setItem(`loqar_checks_${p.vehicleId||"draft"}`,JSON.stringify({checks:n,notes:checkNotes})); } catch(e){} return n; });
  const setCheckNote = (item, val) => setCheckNotes(prev=>{ const n={...prev,[item]:val}; try { localStorage.setItem(`loqar_checks_${p.vehicleId||"draft"}`,JSON.stringify({checks,notes:n})); } catch(e){} return n; });
  const canvasExportRef = useRef(null);
  const [docHistory, setDocHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("loqar_docs_history")||"[]"); } catch(e) { return []; } });
  const [showHistory, setShowHistory] = useState(false);
  const [elementPhotos, setElementPhotos] = useState({});
  const handleElementPhoto = async (element, file) => {
    if (!file) return;
    const path = `inspections/${Date.now()}_${element}.${file.name.split('.').pop()}`;
    const { data } = await supabase.storage.from('photos').upload(path, file, { upsert: true });
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path);
      setElementPhotos(prev => ({ ...prev, [element]: publicUrl }));
    }
  };

  return (
    <Page title={t.documents||"Documents"} sub={lang==="en"?"Generate legally compliant contracts, quotes and invoices":"Générez contrats, devis et factures légalement conformes"}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:26 }}>
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

      {/* Historique des documents générés */}
      {docHistory.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <button onClick={()=>setShowHistory(h=>!h)}
            style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:`1px solid ${T.border}`, borderRadius:10, padding:"8px 14px", color:T.sub, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            <span style={{ fontSize:14 }}>🗂</span>
            {lang==="en"?"Document history":"Historique des documents"} ({docHistory.length})
            <span style={{ marginLeft:4, fontSize:11 }}>{showHistory?"▲":"▼"}</span>
          </button>
          {showHistory && (
            <div style={{ marginTop:10, background:T.card, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:T.card2 }}>
                    {[lang==="en"?"Number":"Numéro", lang==="en"?"Type":"Type", lang==="en"?"Client":"Client", lang==="en"?"Vehicle":"Véhicule", lang==="en"?"Date":"Date", ""].map(h=>(
                      <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {docHistory.map((d,i)=>(
                    <tr key={i} style={{ borderTop:`1px solid ${T.border}` }}>
                      <td style={{ padding:"8px 12px", fontSize:12, fontWeight:700, color:T.gold }}>{d.docNum}</td>
                      <td style={{ padding:"8px 12px", fontSize:12, color:T.sub }}>{({contrat:"Contrat",facture:"Facture",etat:"État des lieux",devis:"Devis"})[d.docType]||d.docType}</td>
                      <td style={{ padding:"8px 12px", fontSize:12, color:T.text }}>{d.clientName||"—"}</td>
                      <td style={{ padding:"8px 12px", fontSize:12, color:T.sub }}>{d.vehicleName||"—"}</td>
                      <td style={{ padding:"8px 12px", fontSize:11, color:T.muted }}>{new Date(d.date).toLocaleDateString("fr-FR")}</td>
                      <td style={{ padding:"8px 12px" }}>
                        <button onClick={()=>{ setDocType(d.docType); setP(d.params); setShowHistory(false); toast(lang==="en"?"Parameters restored":"Paramètres restaurés","success"); }}
                          style={{ fontSize:11, padding:"4px 10px", background:T.goldDim, border:`1px solid ${T.gold}40`, borderRadius:7, color:T.gold, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
                          {lang==="en"?"Restore":"Restaurer"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
                  {clients.map(c=><option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
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

              {/* Infos locataire complémentaires */}
              <Input label={lang==="en"?"License number":"N° de permis"} value={p.clientLicense} onChange={v=>up("clientLicense",v)} placeholder="12AA12345"/>
              <Input label={lang==="en"?"Tenant address":"Adresse du locataire"} value={p.clientAddress} onChange={v=>up("clientAddress",v)} placeholder="12 rue de la Paix, 75001 Paris"/>

              <Input label={t.price||"Prix/jour (€)"} value={p.price} onChange={v=>up("price",v)} type="number"/>
              <Input label={t.deposit||"Caution (€)"} value={p.deposit} onChange={v=>up("deposit",v)} type="number"/>
              <Input label={lang==="en"?"Start mileage":"Km départ"} value={p.km} onChange={v=>up("km",v)} type="number"/>
              {(docType==="etat"||docType==="contrat") && <Input label={lang==="en"?"End mileage":"Km retour"} value={p.kmReturn} onChange={v=>up("kmReturn",v)} type="number"/>}
              <Input label={t.start||"Début"} type="date" value={p.startDate} onChange={v=>up("startDate",v)}/>
              <Input label={t.end||"Fin"} type="date" value={p.endDate} onChange={v=>up("endDate",v)}/>

              {/* Champs spécifiques par type */}
              {docType==="facture" && (<>
                <Input label={lang==="en"?"Payment due date":"Date d'échéance"} value={p.paymentDue} onChange={v=>up("paymentDue",v)} type="date"/>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>{lang==="en"?"Payment method":"Mode de paiement"}</label>
                  <select value={p.paymentMethod} onChange={e=>up("paymentMethod",e.target.value)}
                    style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                    <option value="">{lang==="en"?"— Select —":"— Sélectionner —"}</option>
                    {(lang==="en"?["Cash","Bank transfer","Cheque","Credit card","PayPal"]:["Espèces","Virement bancaire","Chèque","Carte bancaire","PayPal"]).map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </>)}
              {docType==="devis" && (
                <Input label={lang==="en"?"Quote validity":"Validité du devis"} value={p.quoteValidity} onChange={v=>up("quoteValidity",v)} placeholder="30 jours"/>
              )}

              {/* Champs spécifiques contrat */}
              {docType==="contrat" && (<>
                <Input label={lang==="en"?"Pickup location":"Lieu de prise en charge"} value={p.pickupLocation} onChange={v=>up("pickupLocation",v)} placeholder="15 rue de la Paix, Paris"/>
                <Input label={lang==="en"?"Return location":"Lieu de restitution"} value={p.returnLocation} onChange={v=>up("returnLocation",v)} placeholder={lang==="en"?"Same location":"Même lieu"}/>
                <Input label={lang==="en"?"Additional driver":"Conducteur additionnel"} value={p.additionalDriver} onChange={v=>up("additionalDriver",v)} placeholder={lang==="en"?"First Last":"Prénom Nom"}/>
                <Input label={lang==="en"?"Km included (blank = unlimited)":"Km inclus (vide = illimité)"} value={p.kmIncluded} onChange={v=>up("kmIncluded",v)} type="number" placeholder="ex: 500"/>
                <Input label={lang==="en"?"Extra km rate (€/km)":"Tarif km suppl. (€/km)"} value={p.kmOverRate} onChange={v=>up("kmOverRate",v)} type="number" placeholder="0.20"/>
              </>)}

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
                {agencyTva && <div style={{ fontSize:10, color:"#666" }}>TVA : {agencyTva}</div>}
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
                {agencyPhone && <div style={{ fontSize:11, color:"#555" }}>{agencyPhone}</div>}
                {agencyEmail && <div style={{ fontSize:11, color:"#555" }}>{agencyEmail}</div>}
                <div style={{ fontSize:11, color:"#555" }}>{agencySiret}</div>
                {agencyTva && <div style={{ fontSize:11, color:"#555" }}>TVA : {agencyTva}</div>}
              </div>
              <div style={{ padding:"12px 14px", background:"#F5F0E8", borderRadius:8 }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>{lang==="en"?"Tenant":"Locataire"}</div>
                {selectedClient ? <>
                  <div style={{ fontWeight:700, fontSize:13 }}>{selectedClient.first_name||selectedClient.firstName} {selectedClient.last_name||selectedClient.lastName}</div>
                  {(selectedClient.address||p.clientAddress) && <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{selectedClient.address||p.clientAddress}</div>}
                  {(selectedClient.birth_date||selectedClient.birthDate) && <div style={{ fontSize:11, color:"#555" }}>{lang==="en"?"Born":"Né(e) le"} : {fmtDate(selectedClient.birth_date||selectedClient.birthDate)}</div>}
                  <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{selectedClient.email}</div>
                  <div style={{ fontSize:11, color:"#555" }}>{selectedClient.phone}</div>
                  <div style={{ fontSize:11, color:"#555" }}>
                    {lang==="en"?"License":"Permis"} {selectedClient.license_category||"B"} — {lang==="en"?"exp.":"exp."} {fmtDate(selectedClient.license_expiry||selectedClient.licenseExpiry)}
                    {(selectedClient.license_number||p.clientLicense) && <span style={{ marginLeft:10 }}>N° {selectedClient.license_number||p.clientLicense}</span>}
                  </div>
                  {selectedClient.type==="entreprise" && selectedClient.company_name && <div style={{ fontSize:11, color:"#555", marginTop:2, fontWeight:600 }}>{selectedClient.company_name}{selectedClient.company_siret?` — SIRET ${selectedClient.company_siret}`:""}</div>}
                </> : <div style={{ fontSize:11, color:"#AAA", fontStyle:"italic" }}>{lang==="en"?"Select a client":"Sélectionnez un client"}</div>}
              </div>
            </div>

            {/* Vehicle info */}
            <div style={{ padding:"12px 14px", background:"#F5F0E8", borderRadius:8, marginBottom:20 }}>
              <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>{lang==="en"?"Vehicle":"Véhicule"}</div>
              {selectedVehicle ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:8 }}>
                  {(lang==="en"
                    ?[["Model",selectedVehicle.name],["Plate",selectedVehicle.plate],["Year",selectedVehicle.year||"—"],["Color",selectedVehicle.color||"—"],["Fuel",selectedVehicle.fuel],["Gearbox",selectedVehicle.trans],["VIN",selectedVehicle.vin||"—"]]
                    :[["Désignation",selectedVehicle.name],["Immatriculation",selectedVehicle.plate],["Année",selectedVehicle.year||"—"],["Couleur",selectedVehicle.color||"—"],["Carburant",selectedVehicle.fuel],["Transmission",selectedVehicle.trans],["N° de châssis (VIN)",selectedVehicle.vin||"—"]]
                  ).map(([k,v])=>(
                    <div key={k}>
                      <div style={{ fontSize:9, color:"#888" }}>{k}</div>
                      <div style={{ fontWeight:700, fontSize:11 }}>{v||"—"}</div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ fontSize:11, color:"#AAA", fontStyle:"italic" }}>{lang==="en"?"Select a vehicle":"Sélectionnez un véhicule"}</div>}
            </div>

            {/* Location details */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginBottom:20 }}>
              {(lang==="en"
                ?[["Start",fmtDate(p.startDate)||"—"],["End",fmtDate(p.endDate)||"—"],["Duration",days>0?`${days} day(s)`:"—"],["Start km",p.km?fmt(parseInt(p.km))+" km":"—"]]
                :[["Début",fmtDate(p.startDate)||"—"],["Fin",fmtDate(p.endDate)||"—"],["Durée",days>0?`${days} jour(s)`:"—"],["Km départ",p.km?fmt(parseInt(p.km))+" km":"—"]]
              ).map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px", background:"#F5F0E8", borderRadius:6 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".08em", marginBottom:3 }}>{k}</div>
                  <div style={{ fontWeight:700, color:"#1A1510", fontSize:12 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Lieux de prise en charge / restitution + conducteur additionnel (contrat) */}
            {docType==="contrat" && (p.pickupLocation||p.returnLocation||p.additionalDriver) && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10, marginBottom:20 }}>
                {p.pickupLocation && (
                  <div style={{ padding:"10px 12px", background:"#F5F0E8", borderRadius:6 }}>
                    <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".08em", marginBottom:3 }}>{lang==="en"?"Pickup location":"Lieu de prise en charge"}</div>
                    <div style={{ fontWeight:700, color:"#1A1510", fontSize:12 }}>{p.pickupLocation}</div>
                  </div>
                )}
                {p.returnLocation && (
                  <div style={{ padding:"10px 12px", background:"#F5F0E8", borderRadius:6 }}>
                    <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:".08em", marginBottom:3 }}>{lang==="en"?"Return location":"Lieu de restitution"}</div>
                    <div style={{ fontWeight:700, color:"#1A1510", fontSize:12 }}>{p.returnLocation}</div>
                  </div>
                )}
                {p.additionalDriver && (
                  <div style={{ padding:"10px 12px", background:"#FFF8E8", border:"1px solid #E8C870", borderRadius:6 }}>
                    <div style={{ fontSize:9, fontWeight:700, color:"#7A6030", textTransform:"uppercase", letterSpacing:".08em", marginBottom:3 }}>{lang==="en"?"Additional driver":"Conducteur additionnel"}</div>
                    <div style={{ fontWeight:700, color:"#1A1510", fontSize:12 }}>{p.additionalDriver}</div>
                  </div>
                )}
              </div>
            )}

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

                {/* Schéma véhicule interactif */}
                <VehicleCanvas storageKey={`loqar_canvas_${p.vehicleId||"draft"}`} exportRef={canvasExportRef}/>

                {/* Checklist carrosserie / mécanique */}
                <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:12 }}>
                  <thead>
                    <tr style={{ background:"#1A1510" }}>
                      <th style={{ padding:"6px 10px", textAlign:"left", fontSize:10, color:"#EDE5D4", fontWeight:700 }}>{lang==="en"?"Element":"Élément"}</th>
                      <th style={{ padding:"6px 10px", textAlign:"center", fontSize:10, color:"#EDE5D4", fontWeight:700 }}>{lang==="en"?"OK":"Bon état"}</th>
                      <th style={{ padding:"6px 10px", textAlign:"center", fontSize:10, color:"#EDE5D4", fontWeight:700 }}>{lang==="en"?"Damage":"Dommage"}</th>
                      <th style={{ padding:"6px 10px", textAlign:"left", fontSize:10, color:"#EDE5D4", fontWeight:700 }}>{lang==="en"?"Notes":"Observations"}</th>
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
                          <input value={checkNotes[item]||""} onChange={e=>setCheckNote(item,e.target.value)} placeholder="..." style={{ border:"none", borderBottom:"1px solid #DDD", background:"transparent", width:"100%", fontSize:10, outline:"none" }}/>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Checklist équipements obligatoires */}
                <div style={{ marginBottom:8, fontSize:10, fontWeight:700, color:"#1A1510", textTransform:"uppercase", letterSpacing:".08em" }}>{lang==="en"?"Mandatory equipment":"Équipements obligatoires"}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:6 }}>
                  {(lang==="en"
                    ?["Warning triangle","Reflective vest","Registration document","CT / Technical inspection","Spare key(s)","First-aid kit"]
                    :["Triangle de signalisation","Gilet réfléchissant","Carte grise","CT / Contrôle technique","Clé(s) de secours","Kit de premiers secours"]
                  ).map(eq=>(
                    <label key={eq} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 8px", background:"#F5F0E8", borderRadius:6, fontSize:10, cursor:"pointer" }}>
                      <input type="checkbox" style={{ accentColor:"#C9A55A" }}/> {eq}
                    </label>
                  ))}
                </div>
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
                    <td style={{ padding:"8px 12px", fontSize:12, textAlign:"right" }}>{p.price&&days>0?Math.round(parseInt(p.price)*days/6)+" €":"—"}</td>
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

            {/* Conditions de paiement — facture uniquement */}
            {docType==="facture" && (
              <div style={{ padding:"10px 14px", background:"#F5F0E8", borderRadius:6, marginBottom:16, fontSize:11, color:"#555" }}>
                <div style={{ display:"flex", flexWrap:"wrap", gap:24, marginBottom:6 }}>
                  <div><span style={{ fontWeight:700 }}>{lang==="en"?"Payment terms":"Conditions de règlement"} :</span> {lang==="en"?"Payable upon receipt":"Paiement à réception de facture"}</div>
                  {p.paymentMethod && <div><span style={{ fontWeight:700 }}>{lang==="en"?"Payment method":"Mode de paiement"} :</span> {p.paymentMethod}</div>}
                  {p.paymentDue && <div><span style={{ fontWeight:700 }}>{lang==="en"?"Due date":"Échéance"} :</span> {fmtDate(p.paymentDue)}</div>}
                </div>
                <div style={{ fontSize:10, color:"#888" }}>{lang==="en"?"Late payment penalty: 3× legal rate + €40 flat recovery fee · No early payment discount":"Pénalités de retard : 3× le taux légal en vigueur + indemnité forfaitaire de recouvrement 40 € (art. L.441-10 C.com.) · Pas d'escompte pour règlement anticipé"}</div>
              </div>
            )}

            {/* Validité — devis uniquement */}
            {docType==="devis" && (<>
              <div style={{ padding:"10px 14px", background:"#FFF8E8", border:"1px solid #E8C870", borderRadius:6, marginBottom:16, fontSize:11, color:"#7A6030" }}>
                ⏳ <strong>{lang==="en"?"Quote validity":"Validité du devis"} :</strong> {p.quoteValidity||"30 jours"} {lang==="en"?"from the date of issue":"à compter de la date d'émission"}
              </div>
              {/* Bon pour accord */}
              <div style={{ border:"1px solid #C8B89A", borderRadius:8, padding:"16px 18px", marginBottom:16, background:"#FDFBF7" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#1A1510", textTransform:"uppercase", letterSpacing:".08em", marginBottom:10 }}>{lang==="en"?"Customer approval":"Bon pour accord"}</div>
                <div style={{ fontSize:10, color:"#555", marginBottom:14, lineHeight:1.6 }}>
                  {lang==="en"
                    ? `I, the undersigned, ${selectedClient?(selectedClient.first_name||selectedClient.firstName)+" "+(selectedClient.last_name||selectedClient.lastName):"…………………………………"}, accept the above quote in full and authorize ${agencyName} to proceed with the reservation.`
                    : `Je soussigné(e), ${selectedClient?(selectedClient.first_name||selectedClient.firstName)+" "+(selectedClient.last_name||selectedClient.lastName):"…………………………………"}, reconnais avoir pris connaissance du présent devis et accepte les conditions ci-dessus. J'autorise ${agencyName} à procéder à la réservation.`}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40 }}>
                  <div>
                    <div style={{ fontSize:9, color:"#888", marginBottom:4 }}>{lang==="en"?"Date":"Date"} :</div>
                    <div style={{ height:24, borderBottom:"1px solid #C8B89A", marginBottom:4 }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:"#888", marginBottom:4 }}>{lang==="en"?"Signature (preceded by \"Read and approved\")":"Signature (précédée de la mention « Bon pour accord »)"} :</div>
                    <div style={{ height:40, borderBottom:"1px solid #C8B89A", marginBottom:4 }}/>
                  </div>
                </div>
              </div>
            </>)}

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
                  <p style={{ margin:"0 0 6px" }}>3. <strong>Kilométrage</strong> — {p.kmIncluded ? `Le kilométrage inclus est de ${fmt(parseInt(p.kmIncluded))} km. Tout kilomètre supplémentaire sera facturé ${p.kmOverRate||"0.20"} €/km.` : "Le kilométrage est illimité sur le territoire autorisé."} Toute manipulation du compteur kilométrique entraîne la résiliation immédiate du contrat aux frais du locataire.</p>
                  <p style={{ margin:"0 0 6px" }}>4. <strong>Caution</strong> — La caution sera restituée dans un délai de 7 jours après la restitution du véhicule, sous réserve d'absence de dommages. En cas de sinistre, la caution peut être conservée à titre provisionnel jusqu'au chiffrage définitif des réparations.</p>
                  <p style={{ margin:"0 0 6px" }}>5. <strong>Assurance</strong> — Le locataire doit être titulaire d'un permis de conduire valide en cours de validité. Le véhicule est couvert par l'assurance du loueur (RC + dommages tous accidents) avec une franchise opposable au locataire de <strong>{agencyFranchise}</strong>. Toute fausse déclaration entraîne la déchéance de garantie.</p>
                  <p style={{ margin:"0 0 6px" }}>6. <strong>Accidents et sinistres</strong> — En cas d'accident, le locataire doit : (a) prévenir les autorités si nécessaire, (b) établir un constat amiable même sans tiers impliqué, (c) informer le loueur dans les 24 heures. Le locataire s'interdit de reconnaître toute responsabilité sans accord préalable du loueur.</p>
                  <p style={{ margin:"0 0 6px" }}>7. <strong>Infractions et amendes</strong> — Toute contravention au Code de la route commise durant la location est à la charge exclusive du locataire. Le loueur se réserve le droit de communiquer l'identité du locataire aux autorités compétentes et de facturer des frais de gestion de 30 € par dossier.</p>
                  <p style={{ margin:"0 0 6px" }}>8. <strong>Utilisation du véhicule</strong> — La sous-location et la cession du présent contrat sont strictement interdites. Le véhicule ne peut être conduit que par le locataire signataire{p.additionalDriver ? ` et le conducteur additionnel déclaré : ${p.additionalDriver}` : " (aucun conducteur additionnel déclaré)"}. L'utilisation du véhicule est limitée au territoire métropolitain français et aux pays de l'Espace Économique Européen, sauf accord écrit préalable.</p>
                  <p style={{ margin:"0 0 6px" }}>9. <strong>Restitution</strong> — Le véhicule doit être restitué aux date, heure et lieu convenus, dans l'état constaté à la remise. Tout retard non signalé au moins 2 heures à l'avance sera facturé au tarif journalier en vigueur.</p>
                  <p style={{ margin:"0 0 6px" }}>10. <strong>Protection des données</strong> — Les données personnelles collectées sont traitées conformément au RGPD (UE 2016/679). Elles sont utilisées uniquement pour la gestion de la location et ne sont pas cédées à des tiers. Droit d'accès et de rectification sur demande à {agencyEmail||agencyName}.</p>
                  <p style={{ margin:"0 0 0" }}>11. <strong>Juridiction</strong> — En cas de litige, et à défaut de résolution amiable, les tribunaux compétents du ressort du siège social du loueur seront seuls compétents, conformément aux dispositions du Code de procédure civile.</p>
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
            <div style={{ marginTop:24, paddingTop:12, borderTop:"1px solid #EEE" }}>
              <div style={{ fontSize:9, color:"#AAA", textAlign:"center", marginBottom:4 }}>{agencyName} — {agencySiret}{agencyPhone?` — ${agencyPhone}`:""}{agencyEmail?` — ${agencyEmail}`:""}</div>
              <div style={{ fontSize:8, color:"#BBB", textAlign:"center", lineHeight:1.5 }}>
                {lang==="en"
                  ? "Personal data processed in accordance with GDPR (EU 2016/679). Data used solely for rental management and not shared with third parties. Right of access/rectification upon request."
                  : "Données personnelles traitées conformément au RGPD (UE 2016/679) — utilisées uniquement pour la gestion de la location, non transmises à des tiers — droit d'accès et de rectification sur demande."}
              </div>
              <div style={{ fontSize:8, color:"#CCC", textAlign:"center", marginTop:3 }}>Document généré par Loqar · loqar.vercel.app</div>
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
      {t:lang==="en"?"Up to 5 vehicles":"Jusqu'à 5 véhicules",ok:true},{t:lang==="en"?"Unlimited clients":"Clients illimités",ok:true},
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
      {t:lang==="en"?"Unlimited vehicles":"Véhicules illimités",ok:true},{t:lang==="en"?"Unlimited clients":"Clients illimités",ok:true},
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

function PlanCard({ plan, annual, isCurrent = false }) {
  const lang = useLang();
  const [hov, setHov] = useState(false);
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const savings = plan.monthlyPrice - plan.annualPrice;
  const annualTotal = plan.annualTotal || plan.annualPrice * 12;
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ position:"relative", background:plan.highlight?T.card2:T.card, border:`1.5px solid ${isCurrent?T.success:plan.highlight?plan.color:hov?T.border2:T.border}`, borderRadius:16, padding:"26px 22px", display:"flex", flexDirection:"column", transform:plan.highlight?"scale(1.03)":hov?"translateY(-3px)":"none", boxShadow:plan.highlight?`0 20px 60px ${plan.color}15`:hov?"0 8px 32px #00000040":"none", transition:"all .2s", zIndex:plan.highlight?2:1 }}>
      {isCurrent && (
        <div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", background:T.success, color:"#fff", fontSize:11, fontWeight:700, padding:"3px 14px", borderRadius:99, whiteSpace:"nowrap", letterSpacing:".04em" }}>
          ✓ {lang==="en"?"Current plan":"Plan actuel"}
        </div>
      )}
      {!isCurrent && plan.badge && (
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
        disabled={isCurrent}
        onClick={()=>{
          if (isCurrent) return;
          const links = {
            starter:    "https://buy.stripe.com/28E8wPalNdhB9iw2z97kc06",
            pro:        "https://buy.stripe.com/dRmeVdctV7XhgKY2z97kc07",
            enterprise: "https://buy.stripe.com/5kQ9AT79Bcdx1Q4ehR7kc08",
          };
          window.location.href = links[plan.id] || "mailto:contact@loqar.fr";
        }}
        style={{ width:"100%", padding:"11px 16px", borderRadius:9, fontWeight:600, fontSize:13, fontFamily:"inherit", cursor:isCurrent?"default":"pointer", transition:"all .15s", background:isCurrent?T.successDim:plan.highlight?plan.color:plan.colorDim, color:isCurrent?T.success:plan.highlight?T.bg:plan.color, border:`1px solid ${isCurrent?T.success:plan.color}40`, opacity:isCurrent?1:1 }}
        onMouseEnter={e=>{ if(!isCurrent){e.currentTarget.style.background=plan.color; e.currentTarget.style.color=T.bg;}}}
        onMouseLeave={e=>{ if(!isCurrent){e.currentTarget.style.background=plan.highlight?plan.color:plan.colorDim; e.currentTarget.style.color=plan.highlight?T.bg:plan.color;}}}>
        {isCurrent ? (lang==="en"?"✓ Active plan":"✓ Plan actif") : `${plan.cta} →`}
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

function Pricing({ userPlan = "starter" }) {
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
        {getPlans(lang).map(plan=><PlanCard key={plan.id} plan={plan} annual={annual} isCurrent={plan.id===userPlan}/>)}
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
                [t.clients||"Clients","Illimité","Illimité","Illimité"],
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
function Rentals({ rentals, setRentals, vehicles, setVehicles, clients, setClients, user, userPlan = "starter", activeAgencyId = null, dataLoading = false, onGenDoc }) {
  const lang = useLang();
  const t = TR[lang]||TR.fr;
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [sel, setSel]     = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchR, setSearchR] = useState("");
  const [form, setForm]   = useState({ clientId:"", vehicleId:"", startDate:"", endDate:"", pricePerDay:"", deposit:"", km:"", notes:"" });
  const [formErrors, setFormErrors] = useState({});
  const [confirm, setConfirm] = useState(null);
  const up = (k,v) => { setForm(prev=>({...prev,[k]:v})); setFormErrors(prev=>({...prev,[k]:""})); };

  const filteredRentals = rentals.filter(r => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (searchR && !r.client_name?.toLowerCase().includes(searchR.toLowerCase()) && !r.vehicle_name?.toLowerCase().includes(searchR.toLowerCase())) return false;
    return true;
  });

  const days  = Math.ceil((new Date(form.endDate)-new Date(form.startDate))/86400000);
  const total = (parseInt(form.pricePerDay)||0)*(days>0?days:0);

  const statusColor = { "en cours":T.success, "terminée":T.muted, "annulée":T.red, "réservée":T.amber };

  const handleAdd = async () => {
    // Validation
    const errs = {};
    if (!form.clientId) errs.clientId = "Sélectionnez un client";
    if (!form.vehicleId) errs.vehicleId = "Sélectionnez un véhicule";
    if (!form.startDate) errs.startDate = "Date de début requise";
    if (!form.endDate) errs.endDate = "Date de fin requise";
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) errs.endDate = "La fin doit être après le début";
    if (!form.pricePerDay || parseInt(form.pricePerDay) <= 0) errs.pricePerDay = "Prix requis";
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    // Disponibilité véhicule
    const conflict = rentals.find(r =>
      String(r.vehicle_id) === String(form.vehicleId) &&
      r.status !== "terminée" && r.status !== "annulée" &&
      new Date(r.start_date) <= new Date(form.endDate) &&
      new Date(r.end_date) >= new Date(form.startDate)
    );
    if (conflict) { setFormErrors({ vehicleId: `Déjà réservé du ${fmtDate(conflict.start_date)} au ${fmtDate(conflict.end_date)}` }); return; }

    const limit = PLAN_LIMITS[userPlan]?.rentals;
    if (limit !== Infinity) {
      const now = new Date();
      const monthRentals = rentals.filter(r => {
        const d = new Date(r.start_date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
      if (monthRentals.length >= limit) { setUpgradeModal(true); return; }
    }
    const client  = clients.find(c=>String(c.id)===String(form.clientId));
    const vehicle = vehicles.find(v=>String(v.id)===String(form.vehicleId));
    if (client && isExpired(client.license_expiry||client.licenseExpiry)) {
      toast("Attention : le permis de ce client est expiré !", "warn");
    }
    const newR = {
      user_id: user.id,
      agency_id: activeAgencyId||null,
      client_id: form.clientId,
      vehicle_id: form.vehicleId,
      client_name: `${client.first_name} ${client.last_name}`,
      vehicle_name: `${vehicle.name} — ${vehicle.plate}`,
      start_date: form.startDate,
      end_date: form.endDate,
      price_per_day: parseInt(form.pricePerDay)||0,
      deposit: parseInt(form.deposit)||0,
      total: total,
      km_start: parseInt(form.km)||0,
      notes: form.notes,
      status: "réservée",
      portal_token: crypto.randomUUID(),
    };
    const { data, error } = await supabase.from("rentals").insert(newR).select().single();
    if (data) {
      setRentals([data, ...rentals]);
      const cl = clients.find(c=>String(c.id)===String(form.clientId));
      if (cl) {
        const newCount = (cl.locations||0) + 1;
        await supabase.from("clients").update({ locations_count: newCount }).eq("id", cl.id);
        if (setClients) setClients(prev=>prev.map(c=>String(c.id)===String(form.clientId)?{...c,locations:newCount,locations_count:newCount}:c));
      }
      if (cl?.email && PLAN_LIMITS[userPlan]?.emails) sendEmail("rental", cl.email, { clientName: cl.first_name+" "+cl.last_name, vehicle: newR.vehicle_name, startDate: form.startDate, endDate: form.endDate, total });
    }
    setModal(false);
    setForm({ clientId:"", vehicleId:"", startDate:"", endDate:"", pricePerDay:"", deposit:"", km:"", notes:"" });
  };

  const sendPortalLink = async (rental) => {
    const client = clients.find(c=>String(c.id)===String(rental.client_id));
    if (!client?.email) { toast("Ce client n'a pas d'adresse email", "error"); return; }
    let token = rental.portal_token;
    if (!token) {
      token = crypto.randomUUID();
      const { error } = await supabase.from("rentals").update({ portal_token: token }).eq("id", rental.id);
      if (error) { toast("Erreur lors de la génération du lien", "error"); return; }
      setRentals(prev=>prev.map(r=>r.id===rental.id?{...r,portal_token:token}:r));
      if (sel?.id===rental.id) setSel(prev=>({...prev,portal_token:token}));
    }
    const portalUrl = `${window.location.origin}/portal/${token}`;
    await sendEmail("portal", client.email, {
      clientName: `${client.first_name} ${client.last_name}`,
      vehicle: rental.vehicle_name,
      startDate: rental.start_date,
      endDate: rental.end_date,
      total: rental.total,
      portalUrl,
    });
    toast(`Lien portail envoyé à ${client.email}`);
  };

  const handleDelete = (id) => {
    const rental = rentals.find(r=>r.id===id);
    setConfirm({ message:"Supprimer cette location ? Cette action est irréversible.", onConfirm: async ()=>{
      await supabase.from("rentals").delete().eq("id", id);
      setRentals(rentals.filter(r=>r.id!==id));
      setSel(null);
      toast("Location supprimée");
      if (rental?.client_id && setClients) {
        const cl = clients.find(c=>String(c.id)===String(rental.client_id));
        if (cl) {
          const newCount = Math.max(0, (cl.locations||0) - 1);
          // Récupérer les paiements encaissés liés à cette location
          const { data: pmts } = await supabase.from("payments").select("amount").eq("rental_id", id).eq("status","encaissé");
          const paidSum = (pmts||[]).reduce((s,p)=>s+(p.amount||0),0);
          const newSpent = Math.max(0, (cl.total_spent||0) - paidSum);
          await supabase.from("clients").update({ locations_count: newCount, total_spent: newSpent }).eq("id", cl.id);
          setClients(prev=>prev.map(c=>String(c.id)===String(rental.client_id)?{...c,locations:newCount,locations_count:newCount,total_spent:newSpent}:c));
        }
      }
    }});
  };

  const handleStatusChange = (id, newStatus) => {
    const rental = rentals.find(r=>r.id===id);
    if (!rental || rental.status===newStatus) return;
    setConfirm({
      message: `Changer le statut de "${rental.client_name}" de "${rental.status}" → "${newStatus}" ?`,
      confirmLabel: "Confirmer",
      onConfirm: async () => {
        await supabase.from("rentals").update({ status:newStatus }).eq("id", id);
        setRentals(rentals.map(r=>r.id===id?{...r,status:newStatus}:r));
        if (sel?.id===id) setSel({...sel,status:newStatus});
        // Sync statut véhicule
        if (rental.vehicle_id && setVehicles) {
          let vStatus = null;
          if (newStatus === "en cours") vStatus = "en location";
          else if (newStatus === "terminée" || newStatus === "annulée") vStatus = "disponible";
          if (vStatus) {
            await supabase.from("vehicles").update({ status: vStatus }).eq("id", rental.vehicle_id);
            setVehicles(prev => prev.map(v => String(v.id)===String(rental.vehicle_id) ? {...v, status: vStatus} : v));
          }
        }
        toast("Statut mis à jour");
      }
    });
  };

  return (
    <Page title={t.rentals||"Locations"} sub={lang==="en"?`${rentals.length} rental(s) registered`:`${rentals.length} location(s) enregistrée(s)`}
      actions={<div style={{ display:"flex", gap:8 }}>
        <div style={{ display:"flex", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden" }}>
          {[["list","☰"],["gantt","▬"]].map(([m,icon])=>(
            <button key={m} onClick={()=>setViewMode(m)} style={{ padding:"9px 14px", background:viewMode===m?T.goldDim:"transparent", border:"none", borderRight:m==="list"?`1px solid ${T.border}`:"none", cursor:"pointer", fontSize:13, color:viewMode===m?T.gold:T.muted, fontFamily:"inherit" }}>{icon} {lang==="en"?(m==="list"?"List":"Timeline"):(m==="list"?"Liste":"Gantt")}</button>
          ))}
        </div>
        <button onClick={()=>{ setModal(true); setFormErrors({}); }} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:T.gold, border:"none", borderRadius:10, color:"#0F0D0B", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{Icons.plus} {lang==="en"?"New rental":"Nouvelle location"}</button>
      </div>}>
      
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:16, marginBottom:24 }}>
        {[
          [lang==="en"?"In progress":"En cours",   rentals.filter(r=>r.status==="en cours").length,   T.success],
          [lang==="en"?"Reserved":"Réservées",  rentals.filter(r=>r.status==="réservée").length,   T.amber],
          [lang==="en"?"Completed":"Terminées",  rentals.filter(r=>r.status==="terminée").length,   T.muted],
          [lang==="en"?"Revenue":"Chiffre d'affaires", rentals.reduce((a,r)=>a+(r.total||0),0)+"€", T.gold],
        ].map(([label,value,color])=>(
          <Card key={label}>
            <div style={{ fontSize:11, fontWeight:600, color:T.muted, letterSpacing:".08em", textTransform:"uppercase", marginBottom:8 }}>{label}</div>
            <div style={{ fontSize:26, fontWeight:700, color, letterSpacing:"-0.03em" }}>{value}</div>
          </Card>
        ))}
      </div>

      {/* Gantt view */}
      {viewMode==="gantt" && (() => {
        const today = new Date(); today.setHours(0,0,0,0);
        const windowStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
        const days = Array.from({length:daysInMonth},(_,i)=>{ const d=new Date(windowStart); d.setDate(i+1); return d; });
        const statusColor = { "en cours":T.success, "terminée":T.muted, "annulée":T.red, "réservée":T.amber };
        const visible = rentals.filter(r=>r.start_date&&r.end_date).filter(r=>{
          const s=new Date(r.start_date); const e=new Date(r.end_date);
          return s<=days[days.length-1] && e>=days[0];
        });
        return (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, color:T.muted, fontSize:11 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M15 8l4 4-4 4"/></svg>
              <span style={{ fontStyle:"italic" }}>{lang==="en"?"Scroll horizontally to see all days":"Faites défiler pour voir tous les jours"}</span>
            </div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
            <div style={{ minWidth:700 }}>
              {/* Header jours */}
              <div style={{ display:"grid", gridTemplateColumns:`180px repeat(${daysInMonth},1fr)`, borderBottom:`1px solid ${T.border}` }}>
                <div style={{ padding:"10px 14px", fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".08em" }}>
                  {new Date().toLocaleDateString(lang==="en"?"en-US":"fr-FR",{month:"long",year:"numeric"})}
                </div>
                {days.map((d,i)=>{
                  const isToday = d.getTime()===today.getTime();
                  const isWE = d.getDay()===0||d.getDay()===6;
                  return (
                    <div key={i} style={{ padding:"8px 0", textAlign:"center", fontSize:10, fontWeight:isToday?800:500, color:isToday?T.gold:isWE?T.amber:T.muted, background:isToday?T.goldDim:isWE?T.amber+"08":"transparent", borderLeft:`1px solid ${T.border}` }}>
                      {d.getDate()}
                    </div>
                  );
                })}
              </div>
              {/* Lignes rentals */}
              {visible.length===0 && (
                <div style={{ padding:40, textAlign:"center", fontSize:13, color:T.muted }}>Aucune location ce mois-ci</div>
              )}
              {visible.map(r=>{
                const rStart = new Date(r.start_date); rStart.setHours(0,0,0,0);
                const rEnd   = new Date(r.end_date);   rEnd.setHours(0,0,0,0);
                const col0 = Math.max(0, Math.round((rStart-windowStart)/86400000));
                const colSpan = Math.min(daysInMonth-col0, Math.round((rEnd-rStart)/86400000)+1);
                const color = statusColor[r.status]||T.gold;
                return (
                  <div key={r.id} style={{ display:"grid", gridTemplateColumns:`180px repeat(${daysInMonth},1fr)`, borderBottom:`1px solid ${T.border}`, alignItems:"center", minHeight:44 }}
                    onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{ padding:"0 14px" }}>
                      <div style={{ fontSize:12, fontWeight:600, color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.client_name}</div>
                      <div style={{ fontSize:10, color:T.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.vehicle_name?.split("—")[0]?.trim()}</div>
                    </div>
                    {days.map((d,i)=>{
                      const isWE = d.getDay()===0||d.getDay()===6;
                      const isToday = d.getTime()===today.getTime();
                      const inBar = i>=col0 && i<col0+colSpan;
                      const isBarStart = i===col0;
                      const isBarEnd = i===col0+colSpan-1;
                      return (
                        <div key={i} style={{ height:32, background:inBar?color+"33":isWE?T.amber+"05":isToday?T.goldDim:"transparent", borderLeft:`1px solid ${inBar?"transparent":T.border}`, borderRadius:inBar?(isBarStart&&isBarEnd?"8px":isBarStart?"8px 0 0 8px":isBarEnd?"0 8px 8px 0":"0"):"0", position:"relative" }}>
                          {inBar && <div style={{ position:"absolute", inset:"6px 2px", background:color+"55", borderRadius:isBarStart&&isBarEnd?"6px":isBarStart?"6px 0 0 6px":isBarEnd?"0 6px 6px 0":"0" }}/>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        );
      })()}

      {/* Table */}
      {viewMode==="list" && <>
        {/* Filtres locations */}
        <div style={{ display:"flex", gap:8, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:180, position:"relative" }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, pointerEvents:"none" }}>{Icons.search}</span>
            <input value={searchR} onChange={e=>setSearchR(e.target.value)} placeholder={lang==="en"?"Search client or vehicle…":"Rechercher client ou véhicule…"}
              style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"9px 12px 9px 36px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
          </div>
          {[["all",lang==="en"?"All":"Tous"],["en cours",lang==="en"?"In progress":"En cours"],["réservée",lang==="en"?"Reserved":"Réservées"],["terminée",lang==="en"?"Completed":"Terminées"],["annulée",lang==="en"?"Cancelled":"Annulées"]].map(([k,l])=>{
            const cnt = k==="all" ? rentals.length : rentals.filter(r=>r.status===k).length;
            const active = filterStatus===k;
            return (
              <button key={k} onClick={()=>setFilterStatus(k)}
                style={{ padding:"8px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", background:active?T.goldDim:T.card, border:`1px solid ${active?T.gold:T.border}`, color:active?T.gold:T.sub, transition:"all .15s", fontFamily:"inherit" }}>
                {l} ({cnt})
              </button>
            );
          })}
        </div>
      <div style={{ display:"flex", gap:20 }}>
        <div style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>{[t.client||"Client",lang==="en"?"Vehicle":"Véhicule",lang==="en"?"Period":"Période",t.total||"Total",t.status||"Statut",t.actions||"Actions"].map(l=>(
                <th key={l} style={{ textAlign:"left", padding:"11px 16px", fontSize:10, fontWeight:700, color:T.muted, letterSpacing:".1em", textTransform:"uppercase", borderBottom:`1px solid ${T.border}` }}>{l}</th>
              ))}</tr>
            </thead>
            <tbody>
              {dataLoading && Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={6}/>)}
              {!dataLoading && rentals.length===0 && (
                <tr><td colSpan={6} style={{ textAlign:"center", padding:60 }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>🚗</div>
                  <div style={{ fontSize:14, fontWeight:600, color:T.text, marginBottom:6 }}>Aucune location</div>
                  <div style={{ fontSize:12, color:T.muted, marginBottom:16 }}>Créez votre première location pour commencer</div>
                  <Btn label="Nouvelle location" variant="primary" icon={Icons.plus} onClick={()=>{ setModal(true); setFormErrors({}); }}/>
                </td></tr>
              )}
              {!dataLoading && filteredRentals.length===0 && rentals.length>0 && (
                <tr><td colSpan={6} style={{ textAlign:"center", padding:40, fontSize:13, color:T.muted }}>Aucun résultat pour ce filtre</td></tr>
              )}
              {!dataLoading && filteredRentals.map(r=>(
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
                  <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:14, fontWeight:700, color:T.gold }}>{fmt(r.total)} €</td>
                  <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                    <select value={r.status} onClick={e=>e.stopPropagation()} onChange={e=>handleStatusChange(r.id,e.target.value)}
                      style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:8, padding:"4px 8px", color:statusColor[r.status]||T.text, fontSize:12, fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
                      {["réservée","en cours","terminée","annulée"].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ display:"flex", gap:6 }}>
                      {onGenDoc && (
                        <button onClick={e=>{e.stopPropagation();onGenDoc(r);}}
                          style={{ background:T.goldDim, border:`1px solid ${T.gold}30`, borderRadius:8, padding:"5px 9px", color:T.gold, cursor:"pointer", display:"flex", alignItems:"center", title:"Générer un document" }}>
                          {Icons.download}
                        </button>
                      )}
                      <button onClick={e=>{e.stopPropagation();handleDelete(r.id);}}
                        style={{ background:T.redDim, border:`1px solid ${T.red}30`, borderRadius:8, padding:"5px 9px", color:T.red, cursor:"pointer", display:"flex", alignItems:"center" }}>
                        {Icons.trash}
                      </button>
                    </div>
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
              {[["Client",sel.client_name],[lang==="en"?"Vehicle":"Véhicule",sel.vehicle_name],[lang==="en"?"Start":"Début",fmtDate(sel.start_date)],[lang==="en"?"End":"Fin",fmtDate(sel.end_date)],["Prix/jour",sel.price_per_day+" €"],[t.deposit||"Caution",sel.deposit+" €"],[t.total||"Total",sel.total+" €"],["Km départ",sel.km_start?" "+fmt(sel.km_start)+" km":"—"]].map(([k,v])=>(
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
              <button onClick={()=>sendPortalLink(sel)}
                style={{ marginTop:14, width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px", background:T.goldDim, border:`1px solid ${T.gold}40`, borderRadius:10, color:T.gold, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                {Icons.mail} Envoyer le lien portail
              </button>
              {onGenDoc && (
                <button onClick={()=>onGenDoc(sel)}
                  style={{ marginTop:8, width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px", background:T.card2, border:`1px solid ${T.border}`, borderRadius:10, color:T.text, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  {Icons.download} {lang==="en"?"Generate document":"Générer un document"}
                </button>
              )}
            </Card>
          </div>
        )}
      </div>
      </>}

      {/* Modal nouvelle location */}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={()=>{ confirm.onConfirm(); setConfirm(null); }} onCancel={()=>setConfirm(null)}/>}
      {upgradeModal && <UpgradeModal reason={`Votre plan Starter est limité à ${PLAN_LIMITS.starter.rentals} locations/mois. Passez en Pro pour des locations illimitées.`} onClose={()=>setUpgradeModal(false)}/>}
      {modal && (
        <Modal title={t.newRental||"Nouvelle location"} onClose={()=>{ setModal(false); setFormErrors({}); }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Client</label>
              <select value={form.clientId} onChange={e=>up("clientId",e.target.value)}
                style={{ background:T.card2, border:`1px solid ${formErrors.clientId?T.red:T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                <option value="">{lang==="en"?"— Select —":"— Sélectionner —"}</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
              {formErrors.clientId && <span style={{ fontSize:11, color:T.red }}>{formErrors.clientId}</span>}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.sub, letterSpacing:".08em", textTransform:"uppercase" }}>Véhicule</label>
              <select value={form.vehicleId} onChange={e=>{ up("vehicleId",e.target.value); const v=vehicles.find(x=>x.id===e.target.value); if(v) up("pricePerDay",v.price_per_day||v.price||""); }}
                style={{ background:T.card2, border:`1px solid ${formErrors.vehicleId?T.red:T.border}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
                <option value="">{lang==="en"?"— Select —":"— Sélectionner —"}</option>
                {vehicles.map(v=><option key={v.id} value={v.id}>{v.name} — {v.plate}</option>)}
              </select>
              {formErrors.vehicleId && <span style={{ fontSize:11, color:T.red }}>{formErrors.vehicleId}</span>}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <Input label={t.start||"Début"} type="date" value={form.startDate} onChange={v=>up("startDate",v)}/>
              {formErrors.startDate && <span style={{ fontSize:11, color:T.red }}>{formErrors.startDate}</span>}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <Input label={t.end||"Fin"} type="date" value={form.endDate} onChange={v=>up("endDate",v)}/>
              {formErrors.endDate && <span style={{ fontSize:11, color:T.red }}>{formErrors.endDate}</span>}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <Input label={t.price||"Prix/jour (€)"} type="number" value={form.pricePerDay} onChange={v=>up("pricePerDay",v)}/>
              {formErrors.pricePerDay && <span style={{ fontSize:11, color:T.red }}>{formErrors.pricePerDay}</span>}
            </div>
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

// ─── CLIENT PORTAL ────────────────────────────────────────────────────────────
function ClientPortal({ token }) {
  const [rental,   setRental]   = useState(null);
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [err,      setErr]      = useState(null);
  const [signing,  setSigning]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [drawing,  setDrawing]  = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetch(`/api/portal?token=${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setErr(d.error); else { setRental(d.rental); setHistory(d.history); } setLoading(false); })
      .catch(() => { setErr("Erreur de connexion"); setLoading(false); });
  }, [token]);

  const getXY = e => { const t=e.touches?.[0]??e; return {x:t.clientX,y:t.clientY}; };
  const startDraw = e => { e.preventDefault?.(); setDrawing(true); const c=canvasRef.current; const r=c.getBoundingClientRect(); const {x,y}=getXY(e); const ctx=c.getContext("2d"); ctx.beginPath(); ctx.moveTo(x-r.left,y-r.top); };
  const draw = e => { e.preventDefault?.(); if(!drawing)return; setHasDrawn(true); const c=canvasRef.current; const r=c.getBoundingClientRect(); const {x,y}=getXY(e); const ctx=c.getContext("2d"); ctx.strokeStyle="#1A1510"; ctx.lineWidth=2.5; ctx.lineCap="round"; ctx.lineJoin="round"; ctx.lineTo(x-r.left,y-r.top); ctx.stroke(); };
  const endDraw = () => setDrawing(false);
  const clearCanvas = () => { const c=canvasRef.current; c.getContext("2d").clearRect(0,0,c.width,c.height); setHasDrawn(false); };

  const confirmSign = async () => {
    const signatureData = canvasRef.current?.toDataURL("image/png");
    const res = await fetch(`/api/portal?token=${token}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ signature: signatureData }) });
    const d = await res.json();
    if (d.success) { setDone(true); setSigning(false); }
  };

  const SC = { "réservée":"#C9A55A","en cours":"#6AAF7A","terminée":"#8A8075","annulée":"#E8746A" };
  const fd = s => s ? new Date(s).toLocaleDateString("fr-FR") : "—";

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#0F0D0B",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
        <div style={{width:40,height:40,borderRadius:"50%",border:"3px solid #2A2520",borderTopColor:"#C9A55A",animation:"spin 0.8s linear infinite"}}/>
        <div style={{color:"#8A8075",fontSize:13}}>Chargement du contrat…</div>
      </div>
    </div>
  );

  if (err) return (
    <div style={{minHeight:"100vh",background:"#0F0D0B",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{textAlign:"center",padding:32}}>
        <div style={{fontSize:48,marginBottom:16}}>🔒</div>
        <div style={{color:"#E8E4DF",fontSize:18,fontWeight:700}}>Lien invalide ou expiré</div>
        <div style={{color:"#8A8075",fontSize:13,marginTop:8}}>Ce lien ne correspond à aucun contrat actif.</div>
      </div>
    </div>
  );

  const canSign = (rental.status === "en cours" || rental.status === "réservée") && !done;

  return (
    <div style={{minHeight:"100vh",background:"#0F0D0B",fontFamily:"'Plus Jakarta Sans',sans-serif",paddingBottom:60}}>
      {/* Header */}
      <div style={{background:"#141210",borderBottom:"1px solid #2E2B27",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src="/loqar-favicon.png" alt="Loqar" width="28" height="28" style={{borderRadius:"50%"}}/>
          <div style={{fontSize:20,fontWeight:700,color:"#C9A55A",letterSpacing:"-0.03em"}}>Loqar</div>
        </div>
        <div style={{fontSize:12,color:"#8A8075"}}>Espace locataire</div>
      </div>

      <div style={{maxWidth:620,margin:"0 auto",padding:"28px 16px"}}>
        {/* Bienvenue */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:22,fontWeight:700,color:"#E8E4DF",letterSpacing:"-0.02em"}}>Bonjour {rental.client_name?.split(" ")[0] || "Client"} 👋</div>
          <div style={{fontSize:13,color:"#8A8075",marginTop:4}}>Voici votre espace locataire Loqar</div>
        </div>

        {/* Bannière statut */}
        {rental.status === "réservée" && (
          <div style={{background:"#1A1500",border:"1px solid #C9A84C40",borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:20}}>⏳</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#C9A84C"}}>En attente de confirmation</div>
              <div style={{fontSize:12,color:"#8A7050",marginTop:2}}>L'agence va traiter votre demande sous peu.</div>
            </div>
          </div>
        )}
        {rental.status === "en cours" && !done && (
          <div style={{background:"#0D1F13",border:"1px solid #4CAF7D40",borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:20}}>✅</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#4CAF7D"}}>Réservation confirmée</div>
              <div style={{fontSize:12,color:"#3A7A52",marginTop:2}}>Signez votre contrat ci-dessous pour finaliser.</div>
            </div>
          </div>
        )}
        {rental.status === "annulée" && (
          <div style={{background:"#1F0D0D",border:"1px solid #E8746A40",borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:20}}>❌</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#E8746A"}}>Réservation annulée</div>
              <div style={{fontSize:12,color:"#8A4040",marginTop:2}}>Cette réservation a été refusée ou annulée.</div>
            </div>
          </div>
        )}
        {done && (
          <div style={{background:"#0D1F13",border:"1px solid #4CAF7D40",borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:20}}>✍️</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#4CAF7D"}}>Contrat signé</div>
              <div style={{fontSize:12,color:"#3A7A52",marginTop:2}}>Votre signature a bien été enregistrée. À bientôt !</div>
            </div>
          </div>
        )}

        {/* Contrat */}
        <div style={{background:"#141210",border:"1px solid #2E2B27",borderRadius:16,padding:24,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div style={{fontSize:14,fontWeight:700,color:"#E8E4DF"}}>Contrat de location</div>
            <div style={{padding:"4px 12px",borderRadius:20,background:(SC[rental.status]||"#8A8075")+"20",color:SC[rental.status]||"#8A8075",fontSize:11,fontWeight:700}}>{rental.status}</div>
          </div>
          {[["Véhicule",rental.vehicle_name],["Début",fd(rental.start_date)],["Fin",fd(rental.end_date)],["Prix/jour",(rental.price_per_day||"—")+" €"],["Caution",(rental.deposit||"—")+" €"],["Total TTC",(rental.total||"—")+" €"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #1E1C18"}}>
              <span style={{fontSize:12,color:"#8A8075"}}>{k}</span>
              <span style={{fontSize:12,fontWeight:600,color:k==="Total TTC"?"#C9A55A":"#E8E4DF"}}>{v}</span>
            </div>
          ))}
          {rental.notes && (
            <div style={{marginTop:16,padding:"10px 14px",background:"#1A1814",borderRadius:8,borderLeft:"3px solid #C9A55A"}}>
              <div style={{fontSize:10,color:"#8A8075",marginBottom:4,letterSpacing:".08em",textTransform:"uppercase"}}>Notes</div>
              <div style={{fontSize:12,color:"#B0A898"}}>{rental.notes}</div>
            </div>
          )}
        </div>

        {/* Signé */}
        {done && (
          <div style={{background:"#0D1F13",border:"1px solid #2A4A30",borderRadius:16,padding:20,marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"#6AAF7A20",display:"flex",alignItems:"center",justifyContent:"center",color:"#6AAF7A",fontSize:20}}>✓</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#6AAF7A"}}>Contrat signé</div>
              <div style={{fontSize:11,color:"#4A7A52"}}>Votre signature a bien été enregistrée</div>
            </div>
          </div>
        )}

        {/* Bloc signature */}
        {canSign && (
          <div style={{background:"#141210",border:"1px solid #2E2B27",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,color:"#E8E4DF",marginBottom:8}}>Signer le contrat</div>
            <div style={{fontSize:12,color:"#8A8075",marginBottom:20,lineHeight:1.6}}>
              En signant ci-dessous, vous acceptez les conditions générales de location et confirmez avoir pris connaissance du contrat.
            </div>
            {!signing ? (
              <button onClick={()=>setSigning(true)}
                style={{width:"100%",padding:"13px",background:"#C9A55A",border:"none",borderRadius:10,color:"#0F0D0B",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                Signer le contrat →
              </button>
            ) : (
              <>
                <div style={{position:"relative",background:"#FDFBF7",borderRadius:10,border:`2px dashed ${hasDrawn?"#C9A55A":"#C8C0B0"}`,overflow:"hidden",transition:"border-color .2s"}}>
                  <canvas ref={canvasRef} width={560} height={130}
                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                    onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                    style={{display:"block",cursor:"crosshair",width:"100%",height:130,touchAction:"none"}}/>
                  {!hasDrawn && (
                    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none",gap:8}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B0A898" strokeWidth="1.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      <span style={{color:"#A09888",fontSize:12}}>Dessinez votre signature ici</span>
                      <span style={{color:"#C0B8A8",fontSize:10}}>Utilisez la souris ou votre doigt</span>
                    </div>
                  )}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,marginTop:6}}>
                  <span style={{fontSize:11,color:hasDrawn?"#6AAF7A":"#8A8075"}}>{hasDrawn?"✓ Signature dessinée":"Aucune signature"}</span>
                  {hasDrawn && <button onClick={clearCanvas} style={{fontSize:11,color:"#8A8075",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>Effacer et recommencer</button>}
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>{setSigning(false);setHasDrawn(false);clearCanvas();}}
                    style={{flex:1,padding:"11px",background:"#1A1814",border:"1px solid #2E2B27",borderRadius:10,color:"#B0A898",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                    Annuler
                  </button>
                  <button onClick={hasDrawn?confirmSign:undefined}
                    style={{flex:2,padding:"11px",background:hasDrawn?"#C9A55A":"#2E2B27",border:"none",borderRadius:10,color:hasDrawn?"#0F0D0B":"#8A8075",fontSize:13,fontWeight:700,cursor:hasDrawn?"pointer":"not-allowed",fontFamily:"inherit",transition:"background .2s, color .2s"}}>
                    {hasDrawn?"Confirmer la signature ✓":"Dessinez d'abord votre signature"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Historique */}
        {history.length > 1 && (
          <div style={{background:"#141210",border:"1px solid #2E2B27",borderRadius:16,padding:24}}>
            <div style={{fontSize:14,fontWeight:700,color:"#E8E4DF",marginBottom:16}}>Historique de locations</div>
            {history.map(r=>(
              <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #1E1C18"}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:"#E8E4DF"}}>{r.vehicle_name}</div>
                  <div style={{fontSize:11,color:"#8A8075"}}>{fd(r.start_date)} → {fd(r.end_date)}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#C9A55A"}}>{r.total} €</div>
                  <div style={{fontSize:10,color:SC[r.status]||"#8A8075",marginTop:2}}>{r.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{textAlign:"center",marginTop:32,fontSize:11,color:"#3A3530"}}>
          Propulsé par <span style={{color:"#C9A55A"}}>Loqar</span> · Logiciel de gestion de location de véhicules
        </div>
      </div>
    </div>
  );
}

// ─── PASSWORD RESET MODAL ─────────────────────────────────────────────────────
function PasswordResetModal({ onDone }) {
  const toast = useToast();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (pw.length < 6) { toast("Le mot de passe doit faire au moins 6 caractères", "error"); return; }
    if (pw !== pw2) { toast("Les mots de passe ne correspondent pas", "error"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) { toast(error.message, "error"); return; }
    toast("Mot de passe mis à jour !");
    onDone();
  };
  return (
    <div style={{ position:"fixed", inset:0, zIndex:2000, background:"#0E0C0Acc", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"32px 28px", width:"100%", maxWidth:380, boxShadow:"0 24px 64px #00000060" }}>
        <div style={{ fontSize:20, fontWeight:700, color:T.text, marginBottom:6 }}>Nouveau mot de passe</div>
        <div style={{ fontSize:13, color:T.muted, marginBottom:24 }}>Choisissez un nouveau mot de passe pour votre compte.</div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Nouveau mot de passe"
            style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", width:"100%", boxSizing:"border-box" }}/>
          <input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="Confirmer le mot de passe" onKeyDown={e=>e.key==="Enter"&&handle()}
            style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", width:"100%", boxSizing:"border-box" }}/>
          <Btn label={loading?"...":"Enregistrer"} variant="primary" onClick={handle} full/>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const DEFAULT_AGENCY = { name:"", logo:"🚗", address:"", phone:"", email:"", website:"", siret:"", tva:"", iban:"", bic:"", bankHolder:"", terms:"", franchise:"800 €", bookingSlug:"" };

function App() {
  const isMobile = useIsMobile();
  const [user,           setUser]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [page,           setPage]           = useState("dashboard");
  const [cmdOpen,        setCmdOpen]        = useState(false);
  const [vehicles,       setVehicles]       = useState([]);
  const [clients,        setClients]        = useState([]);
  const [rentals,        setRentals]        = useState([]);
  const [payments,       setPayments]       = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [lang, setLang] = useState(() => localStorage.getItem("loqar_lang") || "fr");
  const handleLang = (l) => { setLang(l); localStorage.setItem("loqar_lang", l); };
  const [showSuccess, setShowSuccess] = useState(() => new URLSearchParams(window.location.search).get("success") === "true");
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [agencyProfile,  setAgencyProfile]  = useState(DEFAULT_AGENCY);
  const [userPlan,       setUserPlan]       = useState("starter");
  const [activeAgency,   setActiveAgency]   = useState(null); // null = agence principale
  const [docPrefill,     setDocPrefill]     = useState(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("loqar_read_notifs")||"[]")); } catch { return new Set(); }
  });
  const computedNotifs = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const in2days = new Date(today); in2days.setDate(in2days.getDate()+2);
    const notifs = [];
    payments.forEach(p => {
      if (p.status === "en retard") notifs.push({ id:`pay-late-${p.id}`, type:"danger", title:"Paiement en retard", body:`${p.client_name||"Client"} — ${p.amount||0} €`, time: p.paid_at ? new Date(p.paid_at).toLocaleDateString("fr") : "" });
    });
    clients.forEach(c => {
      if (c.license_expiry) { const exp = new Date(c.license_expiry); if (exp < today) notifs.push({ id:`lic-exp-${c.id}`, type:"danger", title:"Permis expiré", body:`${c.first_name||""} ${c.last_name||""}`, time: exp.toLocaleDateString("fr") }); }
    });
    rentals.forEach(r => {
      if (r.status === "en cours" && r.end_date) { const end = new Date(r.end_date); if (end >= today && end <= in2days) notifs.push({ id:`rent-end-${r.id}`, type:"warning", title:"Location se termine bientôt", body:`${r.client_name||""} — ${r.vehicle_name||""}`, time: end.toLocaleDateString("fr") }); }
    });
    return notifs.map(n => ({ ...n, read: readNotifIds.has(n.id) }));
  }, [payments, clients, rentals, readNotifIds]);
  const handleMarkAllRead = () => {
    const ids = computedNotifs.map(n => n.id);
    const next = new Set([...readNotifIds, ...ids]);
    setReadNotifIds(next);
    localStorage.setItem("loqar_read_notifs", JSON.stringify([...next]));
  };
  const handleMarkRead = (id) => {
    const next = new Set([...readNotifIds, id]);
    setReadNotifIds(next);
    localStorage.setItem("loqar_read_notifs", JSON.stringify([...next]));
  };
  const unread = computedNotifs.filter(n=>!n.read).length;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) { fetchData(session.user.id); fetchProfile(session.user.id, session.user); }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") { setPasswordRecovery(true); return; }
      setUser(session?.user ?? null);
      if (session?.user) { fetchData(session.user.id); fetchProfile(session.user.id, session.user); }
      else { setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async (uid, agencyId = null) => {
    setDataLoading(true);
    const fa = (q) => agencyId ? q.eq("agency_id", String(agencyId)) : q.is("agency_id", null);
    const [{ data: v }, { data: c }, { data: r }, { data: py }] = await Promise.all([
      fa(supabase.from("vehicles").select("*").eq("user_id", uid)).order("created_at", { ascending: false }),
      fa(supabase.from("clients").select("*").eq("user_id", uid)).order("created_at", { ascending: false }),
      fa(supabase.from("rentals").select("*").eq("user_id", uid)).order("created_at", { ascending: false }),
      fa(supabase.from("payments").select("*").eq("user_id", uid)).order("created_at", { ascending: false }),
    ]);
    if (v) setVehicles(v.map(x => ({ ...x, trans: x.transmission, price: x.price_per_day, cat: x.category })));
    if (c) setClients(c.map(x => ({ ...x, firstName: x.first_name, lastName: x.last_name, licenseExpiry: x.license_expiry, totalSpent: x.total_spent, locations: x.locations_count })));
    if (r) setRentals(r);
    if (py) setPayments(py);
    setDataLoading(false);
  };

  const handleSwitchAgency = (agency) => {
    setActiveAgency(agency);
    fetchData(user.id, agency?.id || null);
    setPage("dashboard");
  };

  const fetchProfile = async (uid, currentUser) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) { setAgencyProfile({ name: data.agency_name||"", logo: data.logo||"🚗", address: data.address||"", phone: data.phone||"", email: data.email||"", website: data.website||"", siret: data.siret||"", tva: data.tva||"", iban: data.iban||"", bic: data.bic||"", bankHolder: data.bank_holder||"", terms: data.terms||"", franchise: data.franchise||"800 €", brandColor: data.brand_color||"", bookingSlug: data.booking_slug||"" }); setUserPlan(data.plan||"starter"); }
    if (!data?.agency_name) setShowOnboarding(true);
  };

  const handleSaveProfile = async (profile) => {
    setAgencyProfile(profile);
    await supabase.from("profiles").update({ agency_name: profile.name, logo: profile.logo, address: profile.address, phone: profile.phone, email: profile.email, website: profile.website, siret: profile.siret, tva: profile.tva||null, iban: profile.iban, bic: profile.bic, bank_holder: profile.bankHolder, terms: profile.terms, franchise: profile.franchise, brand_color: profile.brandColor||null, booking_slug: profile.bookingSlug||null }).eq("id", user.id);
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
    const hex = agencyProfile.brandColor;
    if (!hex || hex === "#C8A96E") return;
    const existing = document.getElementById("loqar-brand-style");
    if (existing) existing.remove();
    const s = document.createElement("style");
    s.id = "loqar-brand-style";
    s.textContent = `
      :root { --brand: ${hex}; }
      button[data-brand], a[data-brand] { background-color: ${hex} !important; }
    `;
    document.head.appendChild(s);
    return () => { const el = document.getElementById("loqar-brand-style"); if(el) el.remove(); };
  }, [agencyProfile.brandColor]);

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
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#3A3733;border-radius:99px}
      input::placeholder{color:#5A5650}
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:T.bg }}>
      <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", border:`3px solid ${T.border2}`, borderTopColor:T.gold, animation:"spin 0.8s linear infinite" }}/>
        <div style={{ fontSize:13, color:T.muted, letterSpacing:".04em" }}>Loqar</div>
      </div>
    </div>
  );

  if (showSuccess) return <SuccessPage onContinue={()=>{ setShowSuccess(false); if (user) fetchProfile(user.id, user); }}/>;
  if (!user) return showLanding ? <LandingPage onGetStarted={()=>setShowLanding(false)}/> : <AuthScreen />;

  // ── Essai 14 jours ──────────────────────────────────────────────────────────
  const TRIAL_DAYS = 14;
  const trialDaysUsed = user?.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000)
    : 0;
  const trialDaysLeft = Math.max(0, TRIAL_DAYS - trialDaysUsed);
  const trialExpired = trialDaysUsed >= TRIAL_DAYS && userPlan === "starter";

  if (trialExpired) return <TrialExpiredScreen onLogout={async()=>{ await supabase.auth.signOut(); setUser(null); }}/>;

  const screens = {
    dashboard: <Dashboard vehicles={vehicles} rentals={rentals} payments={payments} clients={clients} onNav={p=>setPage(p)}/>,
    rentals:   <Rentals rentals={rentals} setRentals={setRentals} vehicles={vehicles} setVehicles={setVehicles} clients={clients} setClients={setClients} user={user} userPlan={userPlan} activeAgencyId={activeAgency?.id||null} dataLoading={dataLoading} onGenDoc={r=>{ setDocPrefill(r); setPage("documents"); }}/>,
    vehicles:  <Vehicles  vehicles={vehicles} setVehicles={setVehicles} user={user} userPlan={userPlan} activeAgencyId={activeAgency?.id||null} dataLoading={dataLoading} rentals={rentals}/>,
    clients:   <Clients   clients={clients}   setClients={setClients} user={user} activeAgencyId={activeAgency?.id||null} dataLoading={dataLoading} rentals={rentals}/>,
    payments:  <Payments payments={payments} setPayments={setPayments} clients={clients} setClients={setClients} rentals={rentals} user={user} userPlan={userPlan} activeAgencyId={activeAgency?.id||null} dataLoading={dataLoading}/>,
    documents: <Documents agencyProfile={agencyProfile} vehicles={vehicles} clients={clients} prefill={docPrefill} onClearPrefill={()=>setDocPrefill(null)}/>,
    calendar:  <CalendarPage rentals={rentals} vehicles={vehicles}/>,
    signature: <SignaturePage rentals={rentals} setRentals={setRentals} clients={clients} vehicles={vehicles} user={user} activeAgencyId={activeAgency?.id||null}/>,
    agencies:  <MultiAgences user={user} userPlan={userPlan} activeAgency={activeAgency} onSwitchAgency={handleSwitchAgency}/>,
    pricing:   <Pricing userPlan={userPlan}/>,
    settings:  <Settings agencyProfile={agencyProfile} setAgencyProfile={handleSaveProfile} userPlan={userPlan} user={user} activeAgency={activeAgency}/>,
  };

  return (
    <LangContext.Provider value={lang}>
    <ToastProvider>
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {cmdOpen && <CommandBar onClose={()=>setCmdOpen(false)} onNav={p=>{ setPage(p); setCmdOpen(false); }}/>}
      {showOnboarding && <OnboardingScreen onDone={()=>setShowOnboarding(false)} onNav={p=>setPage(p)}/>}
      {notifOpen && <NotifPanel onClose={()=>setNotifOpen(false)} notifs={computedNotifs} onMarkAll={handleMarkAllRead} onMarkRead={handleMarkRead}/>}
      {passwordRecovery && <PasswordResetModal onDone={()=>setPasswordRecovery(false)}/>}
      <Sidebar page={page} onNav={p=>setPage(p)} user={user} onLogout={handleLogout} onCmd={()=>setCmdOpen(true)} vehicles={vehicles} onNotif={()=>setNotifOpen(o=>!o)} unreadCount={unread} userPlan={userPlan} payments={payments} onLangChange={handleLang} activeAgency={activeAgency} onSwitchAgency={handleSwitchAgency} trialDaysLeft={trialDaysLeft}/>
      <main style={{ flex:1, marginLeft:isMobile?0:220, minHeight:"100vh", paddingTop:isMobile?56:0 }}>
        <div key={page} style={{ animation:"fadeUp .3s" }}>{screens[page]}</div>
      </main>
    </div>
    </ToastProvider>
    </LangContext.Provider>
  );
}




// ─── CALENDRIER ──────────────────────────────────────────────────────────────
function CalendarPage({ rentals = [], vehicles = [] }) {
  const lang = useLang();
  const today = new Date();
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [sel, setSel] = useState(null);

  const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const months = lang === "en" ? MONTHS_EN : MONTHS_FR;

  const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const statusColor = { "en cours": T.success, "réservée": T.amber, "terminée": T.muted, "annulée": T.red };

  // Pour chaque véhicule, trouver les locations qui couvrent ce mois
  const activeVehicles = vehicles.filter(v => v.status !== "entretien" || rentals.some(r => r.vehicle_id === v.id));

  function getRentalForDay(vehicleId, day) {
    const date = new Date(cur.y, cur.m, day);
    const dateStr = date.toISOString().split("T")[0];
    return rentals.find(r => {
      if (r.vehicle_id !== vehicleId && String(r.vehicle_id) !== String(vehicleId)) return false;
      return r.start_date <= dateStr && r.end_date >= dateStr &&
        ["en cours", "réservée"].includes(r.status);
    });
  }

  function isToday(day) {
    return cur.y === today.getFullYear() && cur.m === today.getMonth() && day === today.getDate();
  }

  const prevMonth = () => setCur(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 });
  const nextMonth = () => setCur(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 });

  return (
    <Page title={lang === "en" ? "Calendar" : "Calendrier"} sub={lang === "en" ? "Fleet availability by day" : "Disponibilité de la flotte par jour"}>
      {/* Header navigation */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={prevMonth} style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:8, padding:"6px 12px", color:T.text, cursor:"pointer", fontSize:16, fontFamily:"inherit" }}>‹</button>
          <span style={{ fontSize:18, fontWeight:700, color:T.text, minWidth:180, textAlign:"center" }}>{months[cur.m]} {cur.y}</span>
          <button onClick={nextMonth} style={{ background:T.card2, border:`1px solid ${T.border}`, borderRadius:8, padding:"6px 12px", color:T.text, cursor:"pointer", fontSize:16, fontFamily:"inherit" }}>›</button>
        </div>
        <button onClick={()=>setCur({ y: today.getFullYear(), m: today.getMonth() })} style={{ background:T.goldDim, border:`1px solid ${T.gold}40`, borderRadius:8, padding:"6px 14px", color:T.gold, cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit" }}>
          {lang === "en" ? "Today" : "Aujourd'hui"}
        </button>
      </div>

      {/* Légende */}
      <div style={{ display:"flex", gap:16, marginBottom:16, flexWrap:"wrap" }}>
        {[["en cours", lang==="en"?"In progress":"En cours"], ["réservée", lang==="en"?"Reserved":"Réservée"]].map(([s,l]) => (
          <div key={s} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:T.sub }}>
            <div style={{ width:10, height:10, borderRadius:2, background:statusColor[s] }}/>
            {l}
          </div>
        ))}
      </div>

      {/* Grille calendrier */}
      {activeVehicles.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:T.muted }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🚗</div>
          <div style={{ fontSize:15, fontWeight:600 }}>{lang==="en"?"No vehicles":"Aucun véhicule"}</div>
        </div>
      ) : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ padding:"8px 12px", textAlign:"left", fontSize:12, fontWeight:600, color:T.muted, background:T.surface, position:"sticky", left:0, zIndex:2, borderBottom:`1px solid ${T.border}`, minWidth:120, whiteSpace:"nowrap" }}>
                  {lang === "en" ? "Vehicle" : "Véhicule"}
                </th>
                {days.map(d => (
                  <th key={d} style={{ padding:"6px 2px", textAlign:"center", fontSize:11, fontWeight:isToday(d)?700:500, color:isToday(d)?T.gold:T.muted, background:T.surface, borderBottom:`1px solid ${T.border}`, minWidth:28, maxWidth:32 }}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeVehicles.map(v => (
                <tr key={v.id}>
                  <td style={{ padding:"6px 12px", fontSize:12, fontWeight:600, color:T.text, background:T.surface, position:"sticky", left:0, zIndex:1, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>
                    <div>{v.name}</div>
                    <div style={{ fontSize:10, color:T.muted, fontWeight:400 }}>{v.plate}</div>
                  </td>
                  {days.map(d => {
                    const rental = getRentalForDay(v.id, d);
                    const color = rental ? (statusColor[rental.status] || T.gold) : null;
                    const isStart = rental && rental.start_date === new Date(cur.y, cur.m, d).toISOString().split("T")[0];
                    return (
                      <td key={d} onClick={() => rental && setSel(rental)}
                        style={{ padding:"3px 2px", textAlign:"center", borderBottom:`1px solid ${T.border}`, cursor:rental?"pointer":"default" }}>
                        <div style={{
                          height:22, borderRadius: isStart ? "4px 0 0 4px" : "0",
                          background: rental ? color + "40" : isToday(d) ? T.goldDim : "transparent",
                          border: isToday(d) && !rental ? `1px solid ${T.gold}30` : "none",
                          position:"relative"
                        }}>
                          {isStart && <div style={{ position:"absolute", left:2, top:"50%", transform:"translateY(-50%)", width:4, height:4, borderRadius:"50%", background:color }}/>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Panneau détail location */}
      {sel && (
        <div style={{ position:"fixed", inset:0, background:"#00000070", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>setSel(null)}>
          <div style={{ background:T.card, border:`1px solid ${T.border2}`, borderRadius:16, padding:28, width:"90%", maxWidth:380 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:700, color:T.text }}>{lang==="en"?"Rental details":"Détails location"}</div>
              <button onClick={()=>setSel(null)} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:18 }}>✕</button>
            </div>
            {[
              [lang==="en"?"Client":"Client", sel.client_name],
              [lang==="en"?"Vehicle":"Véhicule", sel.vehicle_name],
              [lang==="en"?"Start":"Début", sel.start_date],
              [lang==="en"?"End":"Fin", sel.end_date],
              [lang==="en"?"Total":"Total", `${sel.total} €`],
              [lang==="en"?"Status":"Statut", sel.status],
            ].map(([label, val]) => val && (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${T.border}` }}>
                <span style={{ fontSize:13, color:T.muted }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:600, color: label===(lang==="en"?"Status":"Statut") ? (statusColor[val]||T.text) : T.text }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}

// ─── PAGE RÉSERVATION PUBLIQUE ────────────────────────────────────────────────
function BookingPage({ slug }) {
  const [agency, setAgency]     = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [selected, setSelected]   = useState(null);
  const [step, setStep]           = useState("browse"); // browse | form | success
  const [form, setForm]           = useState({ firstName:"", lastName:"", email:"", phone:"", notes:"" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const up = (k,v) => setForm(f=>({...f,[k]:v}));

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "—";
  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate)-new Date(startDate))/86400000)) : 0;

  useEffect(() => {
    fetch(`/api/book?slug=${encodeURIComponent(slug)}`)
      .then(r=>r.json())
      .then(d=>{ if(d.error){setError(d.error);}else{setAgency(d.agency);setVehicles(d.vehicles);} setLoading(false); })
      .catch(()=>{ setError("Impossible de charger la page"); setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (!startDate || !endDate || new Date(endDate)<=new Date(startDate)) return;
    fetch(`/api/book?slug=${encodeURIComponent(slug)}&start=${startDate}&end=${endDate}`)
      .then(r=>r.json())
      .then(d=>{ if(!d.error) setVehicles(d.vehicles); });
  }, [startDate, endDate]);

  const handleSubmit = async () => {
    setFormError("");
    if (!form.firstName.trim()||!form.lastName.trim()||!form.email.trim()) { setFormError("Prénom, nom et email sont requis."); return; }
    if (!startDate||!endDate) { setFormError("Veuillez choisir des dates."); return; }
    setSubmitting(true);
    const res = await fetch("/api/book", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ slug, vehicle_id: selected.id, start_date: startDate, end_date: endDate, first_name: form.firstName, last_name: form.lastName, email: form.email, phone: form.phone, notes: form.notes }),
    });
    const data = await res.json();
    if (data.success) { setStep("success"); } else { setFormError(data.error||"Une erreur est survenue."); }
    setSubmitting(false);
  };

  const FUEL_LABEL = { essence:"Essence", diesel:"Diesel", electrique:"Électrique", hybride:"Hybride" };
  const TRANS_LABEL = { manuelle:"Manuelle", automatique:"Automatique" };

  if (loading) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{color:T.muted,fontSize:14}}>Chargement…</div>
    </div>
  );

  if (error) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontSize:32}}>🚗</div>
      <div style={{color:T.text,fontWeight:700,fontSize:18}}>Page introuvable</div>
      <div style={{color:T.muted,fontSize:14}}>{error}</div>
    </div>
  );

  if (step === "success") return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:20,padding:"48px 40px",maxWidth:480,width:"100%",textAlign:"center",animation:"fadeUp .3s"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:T.successDim,border:`1px solid ${T.success}40`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px"}}>
          <Ic size={28} d="M20 6L9 17l-5-5" color={T.success} sw={2.5}/>
        </div>
        <div style={{fontSize:22,fontWeight:700,color:T.text,marginBottom:10}}>Demande envoyée !</div>
        <p style={{fontSize:14,color:T.sub,lineHeight:1.7,marginBottom:24}}>
          Votre demande de réservation pour <strong style={{color:T.text}}>{selected?.name}</strong> du <strong style={{color:T.text}}>{fmtDate(startDate)}</strong> au <strong style={{color:T.text}}>{fmtDate(endDate)}</strong> a bien été transmise à <strong style={{color:T.gold}}>{agency?.agency_name}</strong>.<br/><br/>Vous recevrez une confirmation par email sous peu.
        </p>
        <div style={{fontSize:12,color:T.muted}}>Propulsé par <span style={{color:T.gold,fontWeight:700}}>Loqar</span></div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      {/* Header agence */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"16px 24px",display:"flex",alignItems:"center",gap:14,position:"sticky",top:0,zIndex:10}}>
        <div style={{width:44,height:44,borderRadius:12,background:T.card2,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
          {agency?.logo?.startsWith("data:")||agency?.logo?.startsWith("http") ? <img src={agency.logo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:10}}/> : agency?.logo||"🚗"}
        </div>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:T.text}}>{agency?.agency_name||"Agence"}</div>
          {agency?.phone && <div style={{fontSize:12,color:T.muted}}>{agency.phone}</div>}
        </div>
        <div style={{marginLeft:"auto",fontSize:11,color:T.muted}}>Réservation en ligne</div>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"32px 20px"}}>
        {/* Titre */}
        <div style={{marginBottom:32,textAlign:"center"}}>
          <h1 style={{fontSize:28,fontWeight:700,color:T.text,letterSpacing:"-.02em",marginBottom:8}}>Réservez votre véhicule</h1>
          <p style={{fontSize:14,color:T.sub}}>Choisissez vos dates pour voir les véhicules disponibles</p>
        </div>

        {/* Sélecteur de dates */}
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px 24px",marginBottom:32,display:"flex",gap:16,alignItems:"flex-end",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:160,display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontSize:11,fontWeight:600,color:T.sub,letterSpacing:".08em",textTransform:"uppercase"}}>Date de départ</label>
            <input type="date" value={startDate} min={new Date().toISOString().split("T")[0]} onChange={e=>{setStartDate(e.target.value);setSelected(null);}}
              style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
          </div>
          <div style={{flex:1,minWidth:160,display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontSize:11,fontWeight:600,color:T.sub,letterSpacing:".08em",textTransform:"uppercase"}}>Date de retour</label>
            <input type="date" value={endDate} min={startDate||new Date().toISOString().split("T")[0]} onChange={e=>{setEndDate(e.target.value);setSelected(null);}}
              style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
          </div>
          {days > 0 && (
            <div style={{background:T.goldDim,border:`1px solid ${T.gold}30`,borderRadius:9,padding:"10px 16px",whiteSpace:"nowrap"}}>
              <span style={{fontSize:13,fontWeight:700,color:T.gold}}>{days} jour{days>1?"s":""}</span>
            </div>
          )}
        </div>

        {/* Grille véhicules */}
        {vehicles.length === 0 ? (
          <div style={{textAlign:"center",padding:"60px 20px",color:T.muted}}>
            <div style={{fontSize:40,marginBottom:12}}>🚗</div>
            <div style={{fontSize:16,fontWeight:600,color:T.sub,marginBottom:6}}>{startDate&&endDate?"Aucun véhicule disponible pour ces dates":"Sélectionnez des dates pour voir les véhicules"}</div>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16,marginBottom:32}}>
            {vehicles.map(v=>{
              const isSelected = selected?.id === v.id;
              const total = days > 0 ? (v.price_per_day||0)*days : null;
              return (
                <div key={v.id} onClick={()=>{setSelected(isSelected?null:v);if(!isSelected)setStep("browse");}}
                  style={{background:T.surface,border:`2px solid ${isSelected?T.gold:T.border}`,borderRadius:16,overflow:"hidden",cursor:"pointer",transition:"all .2s",transform:isSelected?"translateY(-2px)":"none",boxShadow:isSelected?`0 8px 32px ${T.gold}20`:"none"}}>
                  {/* Photo */}
                  <div style={{height:160,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
                    {v.photo_url ? <img src={v.photo_url} alt={v.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <div style={{fontSize:48,opacity:.3}}>🚗</div>}
                    <div style={{position:"absolute",top:10,right:10,background:T.bg+"CC",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,color:T.gold}}>{v.category||"Véhicule"}</div>
                    {isSelected && <div style={{position:"absolute",top:10,left:10,width:24,height:24,borderRadius:"50%",background:T.gold,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic size={12} d="M20 6L9 17l-5-5" color="#0F0D0B" sw={2.5}/></div>}
                  </div>
                  {/* Infos */}
                  <div style={{padding:"14px 16px"}}>
                    <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:4}}>{v.name}</div>
                    <div style={{fontSize:12,color:T.muted,marginBottom:10}}>{v.plate}</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                      {v.fuel && <span style={{fontSize:11,background:T.card2,border:`1px solid ${T.border}`,borderRadius:6,padding:"2px 8px",color:T.sub}}>{FUEL_LABEL[v.fuel]||v.fuel}</span>}
                      {v.transmission && <span style={{fontSize:11,background:T.card2,border:`1px solid ${T.border}`,borderRadius:6,padding:"2px 8px",color:T.sub}}>{TRANS_LABEL[v.transmission]||v.transmission}</span>}
                      {v.year && <span style={{fontSize:11,background:T.card2,border:`1px solid ${T.border}`,borderRadius:6,padding:"2px 8px",color:T.sub}}>{v.year}</span>}
                    </div>
                    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
                      <div>
                        <span style={{fontSize:22,fontWeight:700,color:T.gold,letterSpacing:"-.02em"}}>{v.price_per_day||"—"}</span>
                        <span style={{fontSize:12,color:T.muted}}> €/jour</span>
                      </div>
                      {total && <div style={{fontSize:12,fontWeight:600,color:T.sub}}>{total} € total</div>}
                    </div>
                  </div>
                  <div style={{padding:"0 16px 14px"}}>
                    <div style={{width:"100%",padding:"9px",borderRadius:9,textAlign:"center",fontSize:13,fontWeight:600,background:isSelected?T.gold:T.goldDim,color:isSelected?"#0F0D0B":T.gold,border:`1px solid ${T.gold}40`,transition:"all .2s"}}>
                      {isSelected ? "✓ Sélectionné" : "Choisir ce véhicule"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Formulaire de réservation */}
        {selected && (
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:"28px 28px",animation:"fadeUp .25s"}}>
            <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:4}}>Vos informations</div>
            <div style={{fontSize:12,color:T.muted,marginBottom:20}}>Réservation pour <strong style={{color:T.gold}}>{selected.name}</strong> · {fmtDate(startDate)} → {fmtDate(endDate)}{days>0?` · ${days} jour${days>1?"s":""}`:""}{days>0?` · ${(selected.price_per_day||0)*days} €`:""}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <label style={{fontSize:11,fontWeight:600,color:T.sub,letterSpacing:".08em",textTransform:"uppercase"}}>Prénom *</label>
                <input value={form.firstName} onChange={e=>up("firstName",e.target.value)} placeholder="Marie"
                  style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <label style={{fontSize:11,fontWeight:600,color:T.sub,letterSpacing:".08em",textTransform:"uppercase"}}>Nom *</label>
                <input value={form.lastName} onChange={e=>up("lastName",e.target.value)} placeholder="Dupont"
                  style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <label style={{fontSize:11,fontWeight:600,color:T.sub,letterSpacing:".08em",textTransform:"uppercase"}}>Email *</label>
                <input type="email" value={form.email} onChange={e=>up("email",e.target.value)} placeholder="marie@email.fr"
                  style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <label style={{fontSize:11,fontWeight:600,color:T.sub,letterSpacing:".08em",textTransform:"uppercase"}}>Téléphone</label>
                <input type="tel" value={form.phone} onChange={e=>up("phone",e.target.value)} placeholder="+33 6 12 34 56 78"
                  style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:18}}>
              <label style={{fontSize:11,fontWeight:600,color:T.sub,letterSpacing:".08em",textTransform:"uppercase"}}>Message (optionnel)</label>
              <textarea value={form.notes} onChange={e=>up("notes",e.target.value)} placeholder="Questions, demandes particulières…" rows={3}
                style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical"}}/>
            </div>
            {formError && <div style={{marginBottom:14,padding:"10px 14px",background:T.redDim,border:`1px solid ${T.red}30`,borderRadius:9,fontSize:12,color:T.red}}>{formError}</div>}
            <button onClick={handleSubmit} disabled={submitting}
              style={{width:"100%",padding:"13px",borderRadius:10,background:T.gold,color:"#0F0D0B",fontWeight:700,fontSize:14,fontFamily:"inherit",border:"none",cursor:submitting?"wait":"pointer",opacity:submitting?.7:1,transition:"opacity .15s"}}>
              {submitting ? "Envoi en cours…" : "Envoyer ma demande de réservation →"}
            </button>
            <div style={{textAlign:"center",marginTop:10,fontSize:11,color:T.muted}}>Propulsé par <span style={{color:T.gold,fontWeight:700}}>Loqar</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortalWrapper() {
  const portalToken = window.location.pathname.match(/^\/portal\/(.+)/)?.[1];
  if (portalToken) return <ClientPortal token={portalToken}/>;
  const bookingSlug = window.location.pathname.match(/^\/book\/(.+)/)?.[1];
  if (bookingSlug) return <BookingPage slug={bookingSlug}/>;
  if (window.location.pathname.startsWith("/blog")) return <BlogRouter/>;
  return <App/>;
}

// ─── BLOG ─────────────────────────────────────────────────────────────────────
const ARTICLES = [
  {
    slug: "logiciel-gestion-location-voiture",
    title: "Logiciel de gestion de location de voiture : le guide complet 2026",
    description: "Tout ce qu'il faut savoir pour choisir un logiciel de gestion de location de véhicules. Fonctionnalités, prix, comparatif des solutions du marché.",
    date: "2026-01-15",
    readTime: "3 min",
    content: `
## Pourquoi un logiciel de gestion de location de voiture ?

Gérer une agence de location de voitures sans outil adapté, c'est jongler entre des fichiers Excel, des contrats papier et des rappels sur Post-it. À partir de 5 véhicules dans votre flotte, cette organisation devient rapidement ingérable.

Un **logiciel de gestion de location de voiture** centralise tout : contrats, clients, paiements, disponibilité des véhicules. Résultat : moins d'erreurs, plus de temps pour développer votre activité.

## Les fonctionnalités indispensables

### 1. Gestion de la flotte
Le logiciel doit permettre de suivre chaque véhicule : kilométrage, statut (disponible, en location, en entretien), date de contrôle technique, historique des locations.

### 2. Contrats numériques
Fini le papier. Un bon outil génère automatiquement les contrats PDF avec vos informations d'agence, la caution, les conditions générales. La signature électronique est un plus indispensable en 2025.

### 3. Gestion des clients
Fiche client complète, historique des locations, alerte sur l'expiration du permis de conduire — autant d'éléments qui vous font gagner du temps et évitent les mauvaises surprises.

### 4. Suivi des paiements
Encaissements, cautions, paiements en retard : le logiciel doit vous donner une vision claire de votre trésorerie en temps réel.

### 5. Réservation en ligne
En 2025, vos clients veulent pouvoir réserver depuis leur smartphone. Une page de réservation publique intégrée au logiciel est devenu un standard.

## Loqar : la solution tout-en-un pour les loueurs pros

**Loqar** a été conçu spécifiquement pour les agences de location automobile françaises. Il intègre toutes les fonctionnalités mentionnées ci-dessus dans une interface moderne et simple à prendre en main.

- ✅ Gestion de flotte illimitée
- ✅ Contrats PDF et signatures électroniques
- ✅ Page de réservation publique
- ✅ Emails automatiques (confirmation, rappel J-1, contrat signé)
- ✅ Multi-agences
- ✅ Export comptable CSV

**Essai gratuit 14 jours, sans carte bancaire.**
    `,
  },
  {
    slug: "contrat-location-voiture-modele",
    title: "Contrat de location de voiture : modèle, mentions obligatoires et signature électronique",
    description: "Découvrez les mentions obligatoires d'un contrat de location de voiture, un modèle téléchargeable et comment passer à la signature électronique.",
    date: "2026-02-10",
    readTime: "2 min",
    content: `
## Les mentions obligatoires d'un contrat de location de voiture

Un contrat de location de véhicule doit comporter plusieurs informations pour être juridiquement valable en France.

### Informations sur le loueur
- Raison sociale et SIRET de l'agence
- Adresse et coordonnées

### Informations sur le locataire
- Nom, prénom, adresse
- Numéro et date de validité du permis de conduire

### Informations sur le véhicule
- Marque, modèle, immatriculation
- Kilométrage de départ
- État du véhicule (état des lieux)

### Conditions de location
- Dates de début et fin de location
- Prix par jour et montant total
- Montant de la caution (franchise dommages)
- Conditions d'utilisation

### Signature des deux parties
Sans signature du client, le contrat n'a pas de valeur. La **signature électronique** est légalement reconnue en France depuis 2000 (loi n°2000-230).

## Pourquoi passer à la signature électronique ?

La signature manuscrite oblige le client à être présent physiquement. La signature électronique, elle, peut être réalisée depuis un smartphone — idéal quand le client récupère le véhicule en dehors des horaires d'agence.

Avec **Loqar**, le contrat est généré automatiquement et envoyé par email au client dès que la réservation est confirmée. Le client signe depuis son téléphone, et vous recevez la signature en pièce jointe instantanément.

## Modèle de contrat

Loqar génère automatiquement vos contrats avec toutes les mentions obligatoires, votre logo et vos conditions générales personnalisées. Plus besoin de modèle Word à remplir à la main.
    `,
  },
  {
    slug: "gestion-flotte-automobile-agence",
    title: "Gestion de flotte automobile pour agence de location : les meilleures pratiques",
    description: "Comment optimiser la gestion de votre parc automobile ? Suivi des entretiens, disponibilité, rentabilité par véhicule — nos conseils pour les loueurs pros.",
    date: "2026-03-12",
    readTime: "3 min",
    content: `
## Qu'est-ce que la gestion de flotte automobile ?

La **gestion de flotte automobile** désigne l'ensemble des processus permettant de suivre, maintenir et optimiser un parc de véhicules. Pour une agence de location, c'est un enjeu central : un véhicule immobilisé en panne ou mal planifié, c'est du chiffre d'affaires perdu.

## Les 5 indicateurs à suivre pour votre flotte

### 1. Taux d'utilisation
Combien de jours par mois chaque véhicule est-il loué ? Un taux inférieur à 60% doit vous alerter. Soit le véhicule est mal placé, soit il faut revoir votre tarification.

### 2. Kilométrage moyen
Un suivi précis du kilométrage permet d'anticiper les entretiens et de valoriser correctement votre flotte à la revente.

### 3. Revenus par véhicule
Tous les véhicules ne se valent pas commercialement. Un tableau de bord vous permet d'identifier les plus rentables et ceux à remplacer en priorité.

### 4. Coûts d'entretien
Entretiens, réparations, assurance : le coût total de possession (TCO) doit être calculé véhicule par véhicule pour piloter votre rentabilité.

### 5. Alertes CT et entretien
Un contrôle technique expiré, c'est un véhicule immobilisé immédiatement. Un bon logiciel vous alerte à l'avance.

## Comment Loqar simplifie la gestion de flotte

Loqar centralise tous ces indicateurs dans un tableau de bord clair :

- **Vue calendrier** : visualisez la disponibilité de chaque véhicule sur le mois
- **Statuts en temps réel** : disponible, en location, en entretien
- **Historique par véhicule** : toutes les locations passées et revenus générés
- **Alertes automatiques** : notifications pour les permis expirés et locations se terminant bientôt

Avec Loqar, vous avez une vision à 360° de votre flotte depuis un seul outil.
    `,
  },
  {
    slug: "comptabilite-agence-location-voiture",
    title: "Comptabilité d'une agence de location de voitures : guide complet 2026",
    description: "Comment gérer la comptabilité de votre agence de location automobile ? Encaissements, TVA, cautions, export comptable — tout ce que doit savoir un loueur professionnel.",
    date: "2026-04-14",
    readTime: "5 min",
    content: `
## Pourquoi la comptabilité d'une agence de location est spécifique

La comptabilité d'une agence de location de voitures ne ressemble pas à celle d'un commerce classique. Vous gérez des **revenus récurrents journaliers**, des **cautions bloquées puis restituées**, des **véhicules amortissables** sur plusieurs années, et parfois plusieurs agences en parallèle. Autant de particularités qui imposent une organisation rigoureuse dès le départ.

Sans outil adapté, beaucoup de loueurs se retrouvent à jongler entre des relevés bancaires, des fichiers Excel mal tenus et un comptable qui reconstitue tout à la fin de l'année. Résultat : des erreurs, du temps perdu, et des décisions prises sans visibilité réelle sur la trésorerie.

## Les 4 flux financiers à maîtriser

### 1. Les loyers journaliers (chiffre d'affaires principal)

C'est votre revenu de base : le prix par jour multiplié par le nombre de jours de location. Ce montant doit être enregistré à la date de début de location (principe de rattachement des produits à leur période). Chaque location doit être tracée avec :

- Le client (nom, coordonnées)
- Le véhicule (immatriculation)
- La durée et les dates exactes
- Le montant hors taxe et TTC

### 2. Les cautions (dépôts de garantie)

Les cautions ne sont **pas un revenu**. C'est une somme que vous détenez temporairement. Comptablement, elles doivent figurer dans un compte de tiers (dettes envers les clients), pas dans votre chiffre d'affaires. Quand vous les restituez, vous soldez ce compte. Si vous en conservez une partie suite à un sinistre, ce montant devient alors un revenu exceptionnel.

Beaucoup de loueurs confondent caution encaissée et chiffre d'affaires — c'est une erreur qui fausse toute l'analyse financière.

### 3. Les paiements en retard et impayés

Une location terminée n'est pas forcément payée. Le suivi des **créances clients** est indispensable : qui vous doit combien, depuis quand, et quelles relances ont été faites ? Un impayé non suivi pendant 3 mois est souvent irrécupérable. Il faut donc un système de relance automatique ou semi-automatique.

Au niveau comptable, les créances non recouvrées au-delà d'une certaine durée doivent être provisionnées ou passées en perte, ce qui a un impact fiscal.

### 4. Les charges liées à la flotte

Chaque véhicule génère des charges : assurance, entretien, carburant (si vous l'avancez), vignette Crit'Air, réparations. Ces charges sont déductibles du résultat. Il faut les enregistrer par véhicule pour connaître le **coût réel de possession** et calculer la rentabilité nette de chaque voiture.

## TVA : ce que vous devez savoir

Si votre agence est soumise à la TVA (ce qui est le cas dès que vous dépassez le seuil de franchise), vous devez facturer la TVA à 20 % sur vos locations. Mais attention :

- La TVA sur les **véhicules de tourisme** n'est pas récupérable à l'achat (règle de l'exclusion TVA véhicules de tourisme)
- La TVA sur le **carburant** des véhicules de tourisme n'est récupérable qu'à 20 %
- La TVA sur l'**entretien** est récupérable à 100 %
- La TVA sur les **véhicules utilitaires** (fourgons, camionnettes) est récupérable intégralement

Ces règles varient selon la nature du véhicule et son usage. Un expert-comptable reste indispensable pour les arbitrages complexes, mais connaître ces principes vous évite des surprises.

## L'amortissement des véhicules

Les véhicules ne sont pas une charge immédiate — ils s'amortissent sur leur durée d'utilisation (généralement 4 à 5 ans pour une voiture en location). Cela signifie que chaque année, vous passez en charge une fraction du coût d'achat.

Pour les **véhicules de tourisme**, il existe un plafond d'amortissement fiscal : en 2025, les véhicules dont le prix dépasse 18 300 € (ou 9 900 € pour les véhicules très polluants) voient leur amortissement plafonné. Le surplus n'est pas déductible.

Gardez précieusement toutes vos factures d'achat et suivez le tableau d'amortissement par véhicule. Votre comptable en a besoin chaque année.

## Les indicateurs financiers clés à suivre chaque mois

Un loueur professionnel doit regarder ces chiffres chaque mois, sans exception :

**Encaissé ce mois** : total des paiements réellement reçus (attention, différent du chiffre d'affaires facturé).

**En attente** : montant des locations facturées mais pas encore payées. Si ce chiffre grossit, votre recouvrement est défaillant.

**En retard** : paiements dont l'échéance est dépassée. À surveiller de très près.

**Cautions détenues** : total des cautions que vous gardez en dépôt. Ce n'est pas de l'argent disponible.

**Charges flotte du mois** : entretien, assurances, réparations.

**Résultat net estimé** : encaissements moins charges. Un tableau de bord mensuel vous permet de prendre des décisions éclairées (renouveler un véhicule, embaucher, baisser un tarif).

## L'export comptable : le pont entre votre logiciel et votre comptable

La plupart des comptables travaillent avec des logiciels de comptabilité (Sage, EBP, Cegid, FEC...). Ils ont besoin que vous leur fournissiez vos données dans un format structuré, idéalement un **fichier CSV ou Excel** avec pour chaque transaction : la date, le client, le montant HT, la TVA, le TTC, et la nature de l'opération (location, caution, pénalité...).

Sans export, votre comptable reconstitue tout manuellement à partir de vos relevés bancaires — ce qui coûte cher en heures et génère des erreurs.

Avec **Loqar**, vous exportez en un clic l'ensemble de vos paiements au format CSV, prêt à être intégré dans n'importe quel logiciel comptable. Chaque ligne contient le client, le véhicule, les dates, le montant et le mode de règlement.

## Les pièges comptables les plus fréquents chez les loueurs

**Confondre encaissement et chiffre d'affaires** : une location de 5 jours payée en avance génère du CA sur 5 jours, pas sur le jour du paiement. Ce décalage crée des erreurs si vous travaillez en comptabilité de trésorerie.

**Ne pas séparer les comptes** : mélanger les finances perso et pro est la première cause de redressement fiscal. Un compte bancaire dédié à l'agence est obligatoire dès que vous êtes en société, et vivement recommandé même en auto-entrepreneur.

**Oublier les charges à payer** : une facture d'assurance annuelle doit être répartie sur 12 mois, pas passée en totalité le mois du paiement.

**Sous-évaluer les véhicules à la revente** : si vous vendez un véhicule entièrement amorti, le prix de vente est entièrement imposable en tant que plus-value. Anticipez-le dans votre plan fiscal.

## Comment Loqar vous simplifie la vie au quotidien

Loqar ne remplace pas votre comptable — mais il lui facilite énormément le travail, et surtout, il vous donne une vision claire de vos finances sans attendre la clôture annuelle.

- **Tableau de bord paiements** : encaissé, en attente, en retard, cautions — en temps réel
- **Relances automatiques** : notifications pour les paiements en retard
- **Export CSV** : un fichier structuré à envoyer directement à votre comptable
- **Historique complet** : chaque paiement est lié à une location, un client, un véhicule
- **Gestion des cautions** : suivi séparé du statut de chaque caution (détenue / restituée / conservée)

Résultat : moins de stress en fin d'année, moins d'heures comptables facturées, et une meilleure vision de votre rentabilité au quotidien.
    `,
  },
  {
    slug: "guide-demarrage-loqar",
    title: "Prendre en main Loqar en 10 minutes : le guide pas-à-pas",
    description: "Comment démarrer avec Loqar ? Ce guide vous explique étape par étape comment configurer votre agence, ajouter vos véhicules, créer votre première location et activer la réservation en ligne.",
    date: "2026-04-14",
    readTime: "6 min",
    content: `
## Bienvenue sur Loqar

Loqar est un logiciel de gestion de location de voitures conçu pour les agences professionnelles françaises. Ce guide vous accompagne pas-à-pas pour être opérationnel en moins de 10 minutes, de la création de compte jusqu'à votre première location signée.

---

## Étape 1 — Créer votre compte

Rendez-vous sur [loqar.fr](https://loqar.fr) et cliquez sur **Essai gratuit**. Entrez votre email et choisissez un mot de passe. Votre compte est actif immédiatement, sans carte bancaire. Vous bénéficiez de **14 jours d'essai gratuit** avec toutes les fonctionnalités débloquées.

---

## Étape 2 — Configurer votre profil agence

Avant tout, allez dans **Paramètres** (icône engrenage en bas à gauche). Remplissez :

- **Nom de l'agence** : il apparaîtra sur vos contrats PDF et vos emails clients
- **Logo** : uploadez votre logo (PNG ou JPG recommandé). Il s'affichera en haut de vos contrats.
- **Adresse, téléphone, email** : informations de contact visibles par vos clients
- **SIRET** : obligatoire pour que vos contrats soient juridiquement valables
- **Conditions générales** : vous pouvez personnaliser le texte qui apparaît en bas de chaque contrat

Ces informations sont utilisées automatiquement partout dans l'application. Prenez 2 minutes pour les remplir correctement, ça évite d'avoir des contrats avec des champs vides.

---

## Étape 3 — Ajouter vos véhicules

Dans le menu **Véhicules**, cliquez sur **+ Ajouter un véhicule**. Pour chaque voiture :

- **Nom** : ex. "Renault Clio 5" — c'est ce qui apparaît sur les contrats
- **Immatriculation** : la plaque exacte
- **Catégorie** : citadine, SUV, utilitaire, luxe…
- **Carburant et transmission**
- **Kilométrage actuel**
- **Prix par jour** : le tarif de base. Vous pouvez le modifier manuellement lors de chaque location.
- **Photo** : uploadez une photo du véhicule pour l'identifier facilement dans la liste

Le statut de chaque véhicule (disponible / en location / en entretien) se met à jour automatiquement selon vos locations.

---

## Étape 4 — Ajouter vos clients

Dans **Clients**, cliquez sur **+ Nouveau client**. Renseignez :

- Prénom, nom, email, téléphone
- **Date d'expiration du permis** : Loqar vous alertera automatiquement si un permis est expiré ou sur le point de l'être au moment de créer une location

Les clients déjà existants peuvent aussi être créés directement pendant la création d'une location, sans avoir à passer par ce menu.

---

## Étape 5 — Créer votre première location

C'est ici que tout se passe. Dans **Locations**, cliquez sur **+ Nouvelle location**.

**1. Choisissez le véhicule** : la liste n'affiche que les véhicules disponibles pour les dates sélectionnées.

**2. Sélectionnez les dates** : début et fin de location. Le total est calculé automatiquement.

**3. Ajoutez le client** : tapez les premières lettres du nom pour retrouver un client existant, ou créez-en un nouveau directement.

**4. Ajustez si besoin** : prix par jour, caution, kilométrage de départ, notes internes.

**5. Validez** : la location passe au statut **"En cours"** et le véhicule est automatiquement marqué comme indisponible pour ces dates.

---

## Étape 6 — Générer et faire signer le contrat

Une fois la location créée, cliquez dessus pour ouvrir le détail. Vous avez deux options :

**Option A — Signature sur tablette / écran** : cliquez sur **Signature** pour ouvrir l'écran de signature. Le client signe directement avec son doigt ou un stylet. Le contrat PDF est généré et sauvegardé automatiquement.

**Option B — Envoi par email** : si le client n'est pas présent physiquement, envoyez-lui un lien de signature par email. Il signe depuis son smartphone, et vous recevez la confirmation instantanément.

Le contrat PDF généré contient toutes les mentions légales, votre logo, les informations du véhicule, les dates, le montant, la caution et la signature du client.

---

## Étape 7 — Enregistrer un paiement

Dans l'onglet **Paiements**, cliquez sur **+ Nouveau paiement**. Sélectionnez la location concernée, le montant, le mode de règlement (espèces, carte, virement, chèque) et la date.

Loqar distingue automatiquement :
- Les paiements **encaissés** (payés)
- Les paiements **en attente** (à venir)
- Les paiements **en retard** (échéance dépassée)

Le tableau de bord vous donne la somme de chaque catégorie en temps réel.

---

## Étape 8 — Activer votre page de réservation en ligne

C'est la fonctionnalité qui vous fait gagner le plus de temps : vos clients réservent eux-mêmes, 24h/24.

Dans **Paramètres**, section **Page de réservation**, choisissez votre **slug** (ex. "mon-agence"). Votre page publique sera accessible à l'adresse loqar.fr/book/mon-agence.

Partagez ce lien sur votre site, votre page Instagram, Google My Business ou vos emails. Quand un client remplit le formulaire :

1. Vous recevez un email avec tous les détails
2. Deux boutons vous permettent de **Confirmer** ou **Refuser** en un clic
3. Le client reçoit automatiquement un email de confirmation

La location est créée directement dans Loqar dès confirmation.

---

## Étape 9 — Suivre votre activité depuis le tableau de bord

Le **Dashboard** (page d'accueil) résume tout :

- Locations en cours aujourd'hui
- Véhicules disponibles vs indisponibles
- Prochaines locations à venir
- Paiements en retard à relancer
- Alertes (permis expiré, location se terminant demain…)

C'est votre vue quotidienne. Ouvrez-la chaque matin pour savoir exactement où en est votre agence.

---

## Récapitulatif des 9 étapes

| Étape | Action | Durée |
|---|---|---|
| 1 | Créer son compte | 1 min |
| 2 | Configurer le profil agence | 3 min |
| 3 | Ajouter les véhicules | 2 min/véhicule |
| 4 | Ajouter les clients | 1 min/client |
| 5 | Créer une location | 2 min |
| 6 | Signer le contrat | 1 min |
| 7 | Enregistrer un paiement | 30 sec |
| 8 | Activer la réservation en ligne | 1 min |
| 9 | Consulter le tableau de bord | quotidien |

En suivant ces étapes, votre agence est entièrement opérationnelle sur Loqar en moins de 15 minutes. Pour toute question, contactez-nous à **contact@loqar.fr**.
    `,
  },
];

function BlogRouter() {
  const slug = window.location.pathname.match(/^\/blog\/(.+)/)?.[1];
  if (slug) {
    const article = ARTICLES.find(a => a.slug === slug);
    if (article) return <ArticlePage article={article}/>;
  }
  return <BlogPage/>;
}

const ARTICLE_CATEGORIES = {
  "logiciel-gestion-location-voiture": "Guide",
  "contrat-location-voiture-modele": "Juridique",
  "gestion-flotte-automobile-agence": "Flotte",
  "comptabilite-agence-location-voiture": "Comptabilité",
  "guide-demarrage-loqar": "Tutoriel",
};

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} style={{ color:T.text, fontWeight:700 }}>{part.slice(2,-2)}</strong>
      : part
  );
}

function renderArticleContent(content) {
  const lines = content.trim().split("\n");
  const elements = [];
  let i = 0;
  let bulletBuffer = [];
  let numberedBuffer = [];

  const flushBullets = (key) => {
    if (!bulletBuffer.length) return;
    elements.push(
      <ul key={`ul-${key}`} style={{ listStyle:"none", padding:0, margin:"0 0 22px" }}>
        {bulletBuffer.map((item, j) => (
          <li key={j} style={{ display:"flex", gap:12, marginBottom:10, alignItems:"flex-start" }}>
            <span style={{ color:T.gold, flexShrink:0, marginTop:3, fontSize:14 }}>✓</span>
            <span style={{ color:T.sub, lineHeight:1.75 }}>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  const flushNumbered = (key) => {
    if (!numberedBuffer.length) return;
    elements.push(
      <ol key={`ol-${key}`} style={{ listStyle:"none", padding:0, margin:"0 0 22px" }}>
        {numberedBuffer.map((item, j) => (
          <li key={j} style={{ display:"flex", gap:14, marginBottom:14, alignItems:"flex-start" }}>
            <span style={{ background:T.goldDim, border:`1px solid ${T.gold}40`, color:T.gold, fontWeight:800, fontSize:13, flexShrink:0, width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>{j+1}</span>
            <span style={{ color:T.sub, lineHeight:1.75, paddingTop:4 }}>{renderInline(item)}</span>
          </li>
        ))}
      </ol>
    );
    numberedBuffer = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      flushBullets(i); flushNumbered(i);
      i++; continue;
    }

    if (line.startsWith("## ")) {
      flushBullets(i); flushNumbered(i);
      elements.push(
        <div key={i} style={{ marginTop:44, marginBottom:18 }}>
          <div style={{ width:3, height:22, background:T.gold, borderRadius:2, display:"inline-block", verticalAlign:"middle", marginRight:12 }}/>
          <h2 style={{ display:"inline", fontSize:22, fontWeight:800, color:T.text, letterSpacing:"-0.02em", lineHeight:1.3 }}>{line.slice(3)}</h2>
        </div>
      );
      i++; continue;
    }

    if (line.startsWith("### ")) {
      flushBullets(i); flushNumbered(i);
      elements.push(<h3 key={i} style={{ fontSize:16, fontWeight:700, color:T.text, margin:"28px 0 10px", letterSpacing:"-0.01em" }}>{line.slice(4)}</h3>);
      i++; continue;
    }

    if (line.trim() === "---") {
      flushBullets(i); flushNumbered(i);
      elements.push(<hr key={i} style={{ border:"none", borderTop:`1px solid ${T.border}`, margin:"36px 0" }}/>);
      i++; continue;
    }

    if (line.startsWith("- ")) {
      flushNumbered(i);
      bulletBuffer.push(line.slice(2));
      i++; continue;
    }

    if (/^\d+\.\s/.test(line)) {
      flushBullets(i);
      numberedBuffer.push(line.replace(/^\d+\.\s*/,""));
      i++; continue;
    }

    if (line.startsWith("|")) {
      flushBullets(i); flushNumbered(i);
      const tableLines = [];
      while (i < lines.length && lines[i].startsWith("|")) { tableLines.push(lines[i]); i++; }
      const rows = tableLines.filter(l => !/^\|[\s\-|:]+\|$/.test(l));
      elements.push(
        <div key={`t-${i}`} style={{ overflowX:"auto", margin:"0 0 24px", borderRadius:12, border:`1px solid ${T.border}`, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split("|").slice(1,-1);
                return (
                  <tr key={ri} style={{ borderBottom: ri < rows.length-1 ? `1px solid ${T.border}` : "none", background: ri===0 ? T.goldDim : ri%2===0 ? T.card : "transparent" }}>
                    {cells.map((cell, ci) => {
                      const Tag = ri===0 ? "th" : "td";
                      return <Tag key={ci} style={{ padding:"11px 16px", color:ri===0?T.gold:T.sub, fontWeight:ri===0?700:400, textAlign:"left", whiteSpace:"nowrap" }}>{renderInline(cell.trim())}</Tag>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    flushBullets(i); flushNumbered(i);
    elements.push(<p key={i} style={{ margin:"0 0 18px", color:T.sub, lineHeight:1.85, fontSize:15 }}>{renderInline(line)}</p>);
    i++;
  }
  flushBullets("end"); flushNumbered("end");
  return elements;
}

function BlogNav() {
  return (
    <div style={{ borderBottom:`1px solid ${T.border}`, padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:T.bg, zIndex:10 }}>
      <a href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
        <div style={{ width:32, height:32, background:T.goldDim, border:`1px solid ${T.gold}`, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{Icons.car}</div>
        <span style={{ fontSize:16, fontWeight:800, color:T.text }}>Loqar</span>
      </a>
      <div style={{ display:"flex", gap:16, alignItems:"center" }}>
        <a href="/blog" style={{ fontSize:13, color:T.muted, textDecoration:"none" }}>Blog</a>
        <a href="/" style={{ background:T.gold, color:"#0F0D0B", padding:"8px 18px", borderRadius:8, fontSize:13, fontWeight:700, textDecoration:"none" }}>Essai gratuit →</a>
      </div>
    </div>
  );
}

function BlogPage() {
  const [featured, ...rest] = ARTICLES.slice().reverse();
  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <BlogNav/>
      {/* Header */}
      <div style={{ maxWidth:860, margin:"0 auto", padding:"56px 24px 36px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:T.gold, letterSpacing:".12em", textTransform:"uppercase", marginBottom:10 }}>Blog Loqar</div>
        <h1 style={{ fontSize:"clamp(28px,4vw,40px)", fontWeight:800, color:T.text, margin:"0 0 12px", letterSpacing:"-0.03em" }}>Ressources pour les loueurs professionnels</h1>
        <p style={{ fontSize:15, color:T.muted, margin:0, maxWidth:560 }}>Guides pratiques, conseils comptables, tutoriels — tout ce qu'il faut savoir pour gérer une agence de location moderne.</p>
      </div>
      {/* Featured */}
      <div style={{ maxWidth:860, margin:"0 auto", padding:"0 24px 32px" }}>
        <a href={`/blog/${featured.slug}`} style={{ display:"block", background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"36px 40px", textDecoration:"none", position:"relative", overflow:"hidden", transition:"border-color .15s" }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${T.gold},${T.gold}50)` }}/>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <span style={{ background:T.goldDim, color:T.gold, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, letterSpacing:".05em", textTransform:"uppercase" }}>{ARTICLE_CATEGORIES[featured.slug]||"Article"}</span>
            <span style={{ fontSize:12, color:T.muted }}>{new Date(featured.date).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</span>
            <span style={{ fontSize:12, color:T.border2 }}>·</span>
            <span style={{ fontSize:12, color:T.muted }}>{featured.readTime} de lecture</span>
          </div>
          <h2 style={{ fontSize:"clamp(18px,2.5vw,26px)", fontWeight:800, color:T.text, margin:"0 0 12px", letterSpacing:"-0.02em", lineHeight:1.3 }}>{featured.title}</h2>
          <p style={{ fontSize:14, color:T.muted, margin:"0 0 20px", lineHeight:1.7, maxWidth:600 }}>{featured.description}</p>
          <span style={{ fontSize:14, color:T.gold, fontWeight:700 }}>Lire l'article →</span>
        </a>
      </div>
      {/* Rest */}
      <div style={{ maxWidth:860, margin:"0 auto", padding:"0 24px 80px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:20 }}>
        {rest.map(a => (
          <a key={a.slug} href={`/blog/${a.slug}`} style={{ display:"flex", flexDirection:"column", background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"24px 28px", textDecoration:"none", transition:"border-color .15s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
            onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <span style={{ background:T.goldDim, color:T.gold, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, letterSpacing:".05em", textTransform:"uppercase" }}>{ARTICLE_CATEGORIES[a.slug]||"Article"}</span>
              <span style={{ fontSize:11, color:T.muted }}>{a.readTime}</span>
            </div>
            <h2 style={{ fontSize:16, fontWeight:700, color:T.text, margin:"0 0 10px", letterSpacing:"-0.01em", lineHeight:1.4, flex:1 }}>{a.title}</h2>
            <p style={{ fontSize:13, color:T.muted, margin:"0 0 16px", lineHeight:1.65 }}>{a.description}</p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:T.muted }}>{new Date(a.date).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"})}</span>
              <span style={{ fontSize:13, color:T.gold, fontWeight:600 }}>Lire →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function ArticlePage({ article }) {
  const h2Headings = article.content.match(/^## (.+)$/gm)?.map(l=>l.slice(3)) || [];
  const related = ARTICLES.filter(a => a.slug !== article.slug).slice(0,2);
  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <BlogNav/>
      {/* Hero */}
      <div style={{ background:`linear-gradient(180deg,${T.card} 0%,${T.bg} 100%)`, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:760, margin:"0 auto", padding:"48px 24px 44px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <a href="/blog" style={{ fontSize:12, color:T.muted, textDecoration:"none" }}>← Blog</a>
            <span style={{ color:T.border2 }}>/</span>
            <span style={{ background:T.goldDim, color:T.gold, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:20, letterSpacing:".05em", textTransform:"uppercase" }}>{ARTICLE_CATEGORIES[article.slug]||"Article"}</span>
          </div>
          <h1 style={{ fontSize:"clamp(24px,3.5vw,36px)", fontWeight:800, color:T.text, margin:"0 0 20px", letterSpacing:"-0.03em", lineHeight:1.2 }}>{article.title}</h1>
          <p style={{ fontSize:15, color:T.muted, margin:"0 0 24px", lineHeight:1.7 }}>{article.description}</p>
          <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:T.goldDim, border:`1px solid ${T.gold}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✍</div>
              <span style={{ fontSize:13, color:T.sub }}>Équipe Loqar</span>
            </div>
            <span style={{ color:T.border2 }}>·</span>
            <span style={{ fontSize:13, color:T.muted }}>{new Date(article.date).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</span>
            <span style={{ color:T.border2 }}>·</span>
            <span style={{ fontSize:13, color:T.muted }}>{article.readTime} de lecture</span>
          </div>
        </div>
      </div>
      {/* Content + Sidebar */}
      <div style={{ maxWidth:1040, margin:"0 auto", padding:"44px 24px 80px", display:"grid", gridTemplateColumns:"1fr 280px", gap:48, alignItems:"start" }}>
        {/* Article body */}
        <div>
          {h2Headings.length > 2 && (
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"20px 24px", marginBottom:36 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.gold, letterSpacing:".08em", textTransform:"uppercase", marginBottom:14 }}>Dans cet article</div>
              {h2Headings.map((h,i) => (
                <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
                  <span style={{ color:T.gold, fontSize:12, flexShrink:0, marginTop:3 }}>→</span>
                  <span style={{ fontSize:13, color:T.sub, lineHeight:1.5 }}>{h}</span>
                </div>
              ))}
            </div>
          )}
          {renderArticleContent(article.content)}
          {/* CTA */}
          <div style={{ marginTop:52, background:`linear-gradient(135deg,${T.card},${T.goldDim})`, border:`1px solid ${T.gold}40`, borderRadius:20, padding:"36px 40px", textAlign:"center" }}>
            <div style={{ fontSize:24, marginBottom:8 }}>🚀</div>
            <div style={{ fontSize:20, fontWeight:800, color:T.text, marginBottom:8, letterSpacing:"-0.02em" }}>Prêt à digitaliser votre agence ?</div>
            <div style={{ fontSize:14, color:T.muted, marginBottom:28 }}>Essai gratuit 14 jours · Sans carte bancaire · Annulable à tout moment</div>
            <a href="/" style={{ display:"inline-block", background:T.gold, color:"#0F0D0B", padding:"14px 36px", borderRadius:12, fontSize:15, fontWeight:800, textDecoration:"none", letterSpacing:"-0.01em" }}>Démarrer gratuitement →</a>
          </div>
        </div>
        {/* Sidebar */}
        <div style={{ position:"sticky", top:80 }}>
          {/* Related */}
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"22px" }}>
            <div style={{ fontSize:12, fontWeight:700, color:T.gold, letterSpacing:".08em", textTransform:"uppercase", marginBottom:16 }}>À lire aussi</div>
            {related.map(a => (
              <a key={a.slug} href={`/blog/${a.slug}`} style={{ display:"block", textDecoration:"none", padding:"14px 0", borderBottom:`1px solid ${T.border}` }}
                onMouseEnter={e=>e.currentTarget.querySelector(".rtitle").style.color=T.gold}
                onMouseLeave={e=>e.currentTarget.querySelector(".rtitle").style.color=T.text}>
                <div style={{ fontSize:10, fontWeight:700, color:T.gold, letterSpacing:".05em", textTransform:"uppercase", marginBottom:6 }}>{ARTICLE_CATEGORIES[a.slug]||"Article"}</div>
                <div className="rtitle" style={{ fontSize:13, fontWeight:600, color:T.text, lineHeight:1.4, transition:"color .15s" }}>{a.title}</div>
                <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>{a.readTime} de lecture</div>
              </a>
            ))}
            <a href="/blog" style={{ display:"block", textAlign:"center", marginTop:16, fontSize:13, color:T.gold, fontWeight:600, textDecoration:"none" }}>Voir tous les articles →</a>
          </div>
          {/* Mini CTA */}
          <div style={{ background:T.goldDim, border:`1px solid ${T.gold}40`, borderRadius:16, padding:"22px", marginTop:16, textAlign:"center" }}>
            <div style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:6 }}>Essai gratuit 14 jours</div>
            <div style={{ fontSize:12, color:T.muted, marginBottom:16 }}>Sans carte bancaire</div>
            <a href="/" style={{ display:"block", background:T.gold, color:"#0F0D0B", padding:"10px", borderRadius:9, fontSize:13, fontWeight:700, textDecoration:"none" }}>Démarrer →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
