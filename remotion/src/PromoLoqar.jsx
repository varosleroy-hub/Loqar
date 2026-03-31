import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Audio,
} from 'remotion';
import { staticFile } from 'remotion';

// --- Palette exacte Loqar ---
const T = {
  bg:      '#141210',
  surface: '#1A1815',
  card:    '#1F1D1A',
  card2:   '#252320',
  border:  '#2E2B27',
  border2: '#3A3733',
  text:    '#F5F0E8',
  sub:     '#9A9488',
  muted:   '#5A5650',
  gold:    '#C8A96E',
  cream:   '#EDE5D4',
  red:     '#E05555',
  amber:   '#D4854A',
  blue:    '#5B8DB8',
  success: '#6AAF7A',
};
const FONT = "'Plus Jakarta Sans', 'Arial', sans-serif";

const fi = (frame, from, to, start, end) =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// --- Silhouette voiture SVG (berline) ---
const CarSVG = ({ color = T.gold, width = 320, opacity = 1 }) => (
  <svg width={width} height={width * 0.42} viewBox="0 0 200 84" fill="none" style={{ opacity }}>
    <path
      d="M10 58 L10 46 Q12 38 22 32 L58 20 Q68 14 90 13 L120 13 Q142 13 152 20 L178 32 Q188 38 190 46 L190 58 Q190 64 184 64 L168 64 Q166 72 158 76 Q150 80 142 76 Q134 72 132 64 L68 64 Q66 72 58 76 Q50 80 42 76 Q34 72 32 64 L16 64 Q10 64 10 58 Z"
      fill={color}
      fillOpacity="0.15"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Vitres */}
    <path
      d="M62 32 L72 18 Q80 14 92 14 L118 14 Q130 14 138 18 L148 32 Z"
      fill={color}
      fillOpacity="0.25"
      stroke={color}
      strokeWidth="1"
    />
    {/* Roues */}
    <circle cx="50" cy="70" r="10" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
    <circle cx="150" cy="70" r="10" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
    <circle cx="50" cy="70" r="4" fill={color} fillOpacity="0.5" />
    <circle cx="150" cy="70" r="4" fill={color} fillOpacity="0.5" />
    {/* Phares */}
    <rect x="183" y="44" width="8" height="5" rx="2" fill={color} fillOpacity="0.7" />
    <rect x="9" y="44" width="8" height="5" rx="2" fill={color} fillOpacity="0.4" />
  </svg>
);

// --- Contrat SVG mockup ---
const ContractCard = ({ frame, fps, delay = 0 }) => {
  const op = fi(frame, 0, 1, delay, delay + 20);
  const y = fi(frame, 24, 0, delay, delay + 25);
  const sc = spring({ frame: frame - delay, fps, from: 0.92, to: 1, durationInFrames: 25, config: { damping: 13 } });
  const signOp = fi(frame, 0, 1, delay + 40, delay + 58);
  const lineW1 = fi(frame, 0, 1, delay + 25, delay + 38);
  const lineW2 = fi(frame, 0, 1, delay + 32, delay + 45);
  const lineW3 = fi(frame, 0, 1, delay + 38, delay + 52);

  return (
    <div style={{
      opacity: op,
      transform: `translateY(${y}px) scale(${sc})`,
      background: T.card,
      border: `1px solid ${T.border2}`,
      borderRadius: 16,
      padding: '22px 20px',
      width: 340,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Barre top or */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.gold}, transparent)` }} />

      {/* Header contrat */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: T.sub, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Contrat de location</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>#LOC-2024-089</div>
        </div>
        <div style={{ padding: '3px 10px', borderRadius: 99, background: T.success + '18', color: T.success, fontSize: 10, fontWeight: 700 }}>Signé ✓</div>
      </div>

      {/* Infos */}
      {[
        { label: 'Client', value: 'Martin Dupont' },
        { label: 'Véhicule', value: 'Peugeot 208 · AB-123-CD' },
        { label: 'Période', value: '28 mars → 4 avril 2026' },
        { label: 'Montant', value: '420 €' },
      ].map((row, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '7px 0',
          borderBottom: i < 3 ? `1px solid ${T.border}` : 'none',
          opacity: fi(frame, 0, 1, delay + 18 + i * 8, delay + 30 + i * 8),
        }}>
          <span style={{ fontSize: 12, color: T.sub }}>{row.label}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: i === 3 ? T.gold : T.text }}>{row.value}</span>
        </div>
      ))}

      {/* Signature */}
      <div style={{ marginTop: 14, opacity: signOp }}>
        <div style={{ fontSize: 10, color: T.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Signature client</div>
        <svg width="120" height="36" viewBox="0 0 120 36">
          <path
            d={`M8 28 Q20 ${28 - 14 * lineW1} 35 22 Q50 ${16 - 8 * lineW2} 65 24 Q80 ${30 - 12 * lineW3} 95 18 Q108 14 115 20`}
            fill="none"
            stroke={T.gold}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={signOp}
          />
        </svg>
      </div>
    </div>
  );
};

// --- Scène 1 : Impact cinématique (0→90f) ---
const SceneLogo = ({ frame, fps }) => {
  const flashOp = fi(frame, 1, 0, 0, 8);
  const logoSc = spring({ frame: frame - 4, fps, from: 3.5, to: 1, durationInFrames: 30, config: { damping: 14, stiffness: 160 } });
  const logoOp = fi(frame, 0, 1, 2, 10);
  const blur1Op = fi(frame, 0.5, 0, 0, 18);
  const blur1Sc = spring({ frame, fps, from: 4, to: 1, durationInFrames: 18, config: { damping: 20 } });
  const glowR = spring({ frame: frame - 2, fps, from: 0, to: 480, durationInFrames: 35, config: { damping: 16 } });
  const glowOp = fi(frame, 0, 1, 0, 12) * fi(frame, 1, 0.4, 35, 90);
  const lineW = spring({ frame: frame - 18, fps, from: 0, to: 200, durationInFrames: 22, config: { damping: 12 } });
  const subOp = fi(frame, 0, 1, 48, 68);
  const subY = fi(frame, 14, 0, 48, 68);
  // Voiture qui glisse en dessous du logo
  const carX = fi(frame, 160, 0, 30, 72);
  const carOp = fi(frame, 0, 0.35, 30, 60);

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: FONT, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        width: glowR * 2, height: glowR * 2,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${T.gold}28 0%, ${T.gold}06 40%, transparent 70%)`,
        opacity: glowOp,
      }} />

      {/* Blur layer */}
      <div style={{
        position: 'absolute',
        opacity: blur1Op * 0.3,
        transform: `scale(${blur1Sc})`,
        fontSize: 108, fontWeight: 900, color: T.gold,
        letterSpacing: 10, textTransform: 'uppercase',
        filter: 'blur(8px)', lineHeight: 1,
      }}>Loqar</div>

      {/* Logo */}
      <div style={{ opacity: logoOp, transform: `scale(${logoSc})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 108, fontWeight: 900, color: T.text, letterSpacing: 10, textTransform: 'uppercase', lineHeight: 1, textShadow: `0 0 60px ${T.gold}40` }}>
          Loqar
        </div>
        <div style={{ width: lineW, height: 3, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
        <div style={{ opacity: subOp, transform: `translateY(${subY}px)`, fontSize: 20, color: T.sub, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 500 }}>
          Location de voitures
        </div>
      </div>

      {/* Voiture fantôme sous le logo */}
      <div style={{ position: 'absolute', bottom: 160, transform: `translateX(${carX}px)`, opacity: carOp }}>
        <CarSVG color={T.gold} width={380} />
      </div>

      <AbsoluteFill style={{ background: '#ffffff', opacity: flashOp, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

// --- Scène 2 : Tagline (90→240f) ---
const SceneTagline = ({ frame, fps }) => {
  const words = ['Gérez.', 'Automatisez.', 'Encaissez.'];
  const colors = [T.text, T.gold, T.success];
  const carOp = fi(frame, 0, 0.12, 60, 100);
  const carX = fi(frame, -200, 600, 0, 150);

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, fontFamily: FONT, overflow: 'hidden' }}>
      {/* Voiture qui traverse en fond */}
      <div style={{ position: 'absolute', bottom: 80, transform: `translateX(${carX}px)`, opacity: carOp }}>
        <CarSVG color={T.gold} width={500} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        {words.map((word, i) => {
          const start = i * 30;
          const op = fi(frame, 0, 1, start, start + 18);
          const y = fi(frame, 30, 0, start, start + 22);
          const sc = spring({ frame: frame - start, fps, from: 0.85, to: 1, durationInFrames: 25, config: { damping: 12 } });
          return (
            <div key={i} style={{ opacity: op, transform: `translateY(${y}px) scale(${sc})`, fontSize: 78, fontWeight: 900, color: colors[i], lineHeight: 1.05, letterSpacing: -1 }}>
              {word}
            </div>
          );
        })}
      </div>
      <div style={{
        opacity: fi(frame, 0, 1, 95, 118),
        transform: `translateY(${fi(frame, 16, 0, 95, 118)}px)`,
        fontSize: 22, color: T.sub, fontWeight: 400, letterSpacing: 0.5, textAlign: 'center', maxWidth: 600,
      }}>
        Le logiciel tout-en-un pour les agences de location
      </div>
    </AbsoluteFill>
  );
};

// --- Scène 3 : Voiture + Contrat (240→480f / 8→16s) ---
const SceneCarContract = ({ frame, fps }) => {
  const titleOp = fi(frame, 0, 1, 0, 22);
  const titleY = fi(frame, 18, 0, 0, 22);

  // Voiture slide depuis la gauche
  const carX = fi(frame, -200, 0, 10, 45);
  const carOp = fi(frame, 0, 1, 10, 35);
  // Légère rotation comme si elle roule
  const carRot = fi(frame, -3, 0, 10, 40);

  // Badges qui apparaissent autour de la voiture
  const BADGES = [
    { label: '15 véhicules', sub: 'gérés', color: T.gold, x: -260, y: -40, delay: 50 },
    { label: 'Disponible', sub: 'en temps réel', color: T.success, x: 220, y: -50, delay: 65 },
    { label: 'Kilométrage', sub: '12 400 km', color: T.amber, x: -240, y: 80, delay: 78 },
    { label: 'Catégorie', sub: 'Berline', color: T.blue, x: 210, y: 75, delay: 90 },
  ];

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, fontFamily: FONT, overflow: 'hidden' }}>
      {/* Titre */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, fontSize: 26, fontWeight: 700, color: T.sub, letterSpacing: 2, textTransform: 'uppercase' }}>
        Votre flotte & vos contrats
      </div>

      {/* Zone voiture + badges */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
        {/* Glow sous voiture */}
        <div style={{
          position: 'absolute',
          width: 500, height: 80,
          background: `radial-gradient(ellipse, ${T.gold}20 0%, transparent 70%)`,
          bottom: -10,
          opacity: carOp * 0.8,
        }} />

        <div style={{ opacity: carOp, transform: `translateX(${carX}px) rotate(${carRot}deg)` }}>
          <CarSVG color={T.gold} width={460} opacity={1} />
        </div>

        {/* Badges info voiture */}
        {BADGES.map((b, i) => {
          const bOp = fi(frame, 0, 1, b.delay, b.delay + 18);
          const bSc = spring({ frame: frame - b.delay, fps, from: 0.7, to: 1, durationInFrames: 22, config: { damping: 11 } });
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `calc(50% + ${b.x}px)`,
              top: `calc(50% + ${b.y}px)`,
              transform: `translate(-50%, -50%) scale(${bSc})`,
              opacity: bOp,
              background: T.card,
              border: `1px solid ${b.color}40`,
              borderRadius: 10,
              padding: '8px 14px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              whiteSpace: 'nowrap',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{b.label}</div>
              <div style={{ fontSize: 10, color: T.sub }}>{b.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Contrat card */}
      <ContractCard frame={frame} fps={fps} delay={100} />
    </AbsoluteFill>
  );
};

// --- Scène 4 : Dashboard (480→690f / 16→23s) ---
const RENTALS = [
  { client: 'Martin Dupont',  car: 'Peugeot 208 · AB-123-CD',  amount: '420€', status: 'Actif',  color: T.success },
  { client: 'Sophie Bernard', car: 'Renault Clio · GH-456-EF',  amount: '315€', status: 'Actif',  color: T.success },
  { client: 'Lucas Martin',   car: 'BMW Série 3 · IJ-789-KL',   amount: '980€', status: 'Payé',   color: T.gold },
  { client: 'Emma Laurent',   car: 'Toyota Yaris · MN-012-OP',  amount: '210€', status: 'Actif',  color: T.success },
];

const SceneDashboard = ({ frame, fps }) => {
  const headerOp = fi(frame, 0, 1, 0, 20);
  const statsData = [
    { label: 'Revenus ce mois', value: '8 420€', change: '+18%', color: T.gold },
    { label: 'Véhicules actifs', value: '12 / 15', change: '3 disponibles', color: T.success },
    { label: 'Locations en cours', value: '9', change: 'dont 2 ce soir', color: T.amber },
  ];

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', flexDirection: 'column', gap: 18, fontFamily: FONT, padding: '44px 48px' }}>
      <div style={{ opacity: headerOp, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: T.sub, marginBottom: 4, letterSpacing: 1.5, textTransform: 'uppercase' }}>Tableau de bord</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: T.text, letterSpacing: -0.5 }}>Loqar</div>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, padding: '8px 18px', fontSize: 13, color: T.gold, fontWeight: 600 }}>Mars 2026</div>
      </div>

      <div style={{ display: 'flex', gap: 14 }}>
        {statsData.map((s, i) => {
          const op = fi(frame, 0, 1, 15 + i * 12, 35 + i * 12);
          const sc = spring({ frame: frame - 15 - i * 12, fps, from: 0.88, to: 1, durationInFrames: 25 });
          return (
            <div key={i} style={{ opacity: op, transform: `scale(${sc})`, flex: 1, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 14, padding: '16px 14px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.7 }} />
              <div style={{ fontSize: 10, color: T.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.change}</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border2}`, borderRadius: 14, overflow: 'hidden', opacity: fi(frame, 0, 1, 48, 65) }}>
        <div style={{ padding: '13px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Locations en cours</div>
          <div style={{ fontSize: 11, color: T.gold, fontWeight: 600 }}>Voir tout →</div>
        </div>
        {RENTALS.map((r, i) => {
          const op = fi(frame, 0, 1, 58 + i * 10, 75 + i * 10);
          const x = fi(frame, -18, 0, 58 + i * 10, 75 + i * 10);
          return (
            <div key={i} style={{ opacity: op, transform: `translateX(${x}px)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: T.card2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CarSVG color={T.gold} width={26} opacity={0.9} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.client}</div>
                  <div style={{ fontSize: 11, color: T.sub }}>{r.car}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.gold }}>{r.amount}</div>
                <div style={{ padding: '3px 10px', borderRadius: 99, background: r.color + '18', color: r.color, fontSize: 11, fontWeight: 600 }}>{r.status}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// --- Scène 5 : CTA (690→900f) ---
const SceneCTA = ({ frame, fps }) => {
  const glowR = fi(frame, 100, 420, 0, 80);
  const logoOp = fi(frame, 0, 1, 0, 22);
  const logoSc = spring({ frame, fps, from: 0.75, to: 1, durationInFrames: 32, config: { damping: 11 } });
  const lineW = fi(frame, 0, 200, 30, 58);
  const tagOp = fi(frame, 0, 1, 45, 65);
  const tagY = fi(frame, 18, 0, 45, 65);
  const ctaOp = fi(frame, 0, 1, 70, 90);
  const ctaSc = spring({ frame: frame - 70, fps, from: 0.8, to: 1, durationInFrames: 28, config: { damping: 10 } });
  const pulse = 1 + Math.sin((frame / 30) * Math.PI * 1.2) * 0.018;
  const urlOp = fi(frame, 0, 1, 100, 118);
  const carOp = fi(frame, 0, 0.18, 30, 70);
  const carX = fi(frame, -300, 400, 30, 200);

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, fontFamily: FONT, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        width: glowR * 2, height: glowR * 2,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${T.gold}18 0%, transparent 70%)`,
      }} />

      {/* Voiture fantôme qui traverse */}
      <div style={{ position: 'absolute', bottom: 100, opacity: carOp, transform: `translateX(${carX}px)` }}>
        <CarSVG color={T.gold} width={520} />
      </div>

      <div style={{ opacity: logoOp, transform: `scale(${logoSc})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 2 }}>
        <div style={{ fontSize: 100, fontWeight: 900, color: T.text, letterSpacing: 10, textTransform: 'uppercase', lineHeight: 1 }}>Loqar</div>
        <div style={{ width: lineW, height: 3, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
      </div>

      <div style={{ opacity: tagOp, transform: `translateY(${tagY}px)`, fontSize: 22, color: T.sub, fontWeight: 400, letterSpacing: 0.5, textAlign: 'center', zIndex: 2 }}>
        Gérez votre agence depuis n'importe où
      </div>

      <div style={{ opacity: ctaOp, transform: `scale(${ctaSc * pulse})`, background: T.gold, color: '#0F0D0B', fontSize: 22, fontWeight: 800, padding: '18px 56px', borderRadius: 50, letterSpacing: 1, boxShadow: `0 0 50px ${T.gold}40`, zIndex: 2 }}>
        Essayez gratuitement
      </div>

      <div style={{ opacity: urlOp, fontSize: 16, color: T.muted, letterSpacing: 2, zIndex: 2 }}>loqar.fr</div>
    </AbsoluteFill>
  );
};

// --- Sous-titres PromoLoqar ---
const PROMO_SUBS = [
  { text: "Loqar — la solution de gestion pour loueurs de voitures.",       start: 0,   end: 88  },
  { text: "Gérez. Automatisez. Encaissez.",                                  start: 90,  end: 150 },
  { text: "Le logiciel tout-en-un pour les agences de location.",            start: 150, end: 238 },
  { text: "Votre flotte centralisée. Vos contrats automatisés.",             start: 240, end: 340 },
  { text: "Paiements et dépôts suivis en temps réel.",                       start: 340, end: 478 },
  { text: "Tableau de bord complet. Revenus, véhicules, locations.",         start: 480, end: 580 },
  { text: "Tout ce dont votre agence a besoin, en un seul endroit.",         start: 580, end: 688 },
  { text: "Essayez Loqar gratuitement — loqar.fr",                          start: 690, end: 900 },
];

const PromoSubtitles = ({ frame }) => {
  const current = PROMO_SUBS.find(s => frame >= s.start && frame < s.end);
  if (!current) return null;
  const op = Math.min(
    interpolate(frame, [current.start, current.start + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    interpolate(frame, [current.end - 10, current.end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  );
  return (
    <div style={{
      position: 'absolute', bottom: '5%', left: '6%', right: '6%',
      textAlign: 'center', opacity: op, zIndex: 100,
    }}>
      <div style={{
        display: 'inline-block',
        background: '#00000090',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: '10px 24px',
        fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
        fontSize: 26,
        fontWeight: 600,
        color: '#ffffff',
        lineHeight: 1.4,
        maxWidth: '90%',
      }}>
        {current.text}
      </div>
    </div>
  );
};

// --- Root ---
export const PromoLoqar = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: T.bg }}>
      {/* Narration */}
      <Audio src={staticFile('narration-promo.mp3')} startFrom={0} volume={1.5} />
      {/* Musique de fond */}
      <Audio src={staticFile('mixkit-rising-forest-471.mp3')} startFrom={0} volume={0.1} />

      <Sequence from={0} durationInFrames={90}>
        <SceneLogo frame={frame} fps={fps} />
      </Sequence>
      <Sequence from={90} durationInFrames={150}>
        <SceneTagline frame={frame - 90} fps={fps} />
      </Sequence>
      <Sequence from={240} durationInFrames={240}>
        <SceneCarContract frame={frame - 240} fps={fps} />
      </Sequence>
      <Sequence from={480} durationInFrames={210}>
        <SceneDashboard frame={frame - 480} fps={fps} />
      </Sequence>
      <Sequence from={690} durationInFrames={210}>
        <SceneCTA frame={frame - 690} fps={fps} />
      </Sequence>

      {/* Sous-titres */}
      <PromoSubtitles frame={frame} />
    </AbsoluteFill>
  );
};
