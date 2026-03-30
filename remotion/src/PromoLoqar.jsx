import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from 'remotion';

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
  goldDim: '#C8A96E14',
  cream:   '#EDE5D4',
  red:     '#E05555',
  amber:   '#D4854A',
  blue:    '#5B8DB8',
  success: '#6AAF7A',
};
const FONT = "'Plus Jakarta Sans', 'Arial', sans-serif";

// --- Helpers ---
const fi = (frame, from, to, start, end) =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const spr = (frame, fps, delay = 0, cfg = {}) =>
  spring({ frame: frame - delay, fps, from: 0, to: 1, durationInFrames: 28, config: { damping: 13, ...cfg } });

// --- Scène 1 : Impact cinématique (0→90f / 0→3s) ---
const SceneLogo = ({ frame, fps }) => {
  // Flash blanc au frame 0 qui disparaît vite
  const flashOp = fi(frame, 1, 0, 0, 8);

  // Lignes qui convergent vers le centre depuis les bords
  const lineScale = spring({ frame, fps, from: 6, to: 1, durationInFrames: 22, config: { damping: 18, stiffness: 200 } });

  // Logo zoom depuis énorme vers normal avec overshoot
  const logoSc = spring({ frame: frame - 4, fps, from: 3.5, to: 1, durationInFrames: 30, config: { damping: 14, stiffness: 160 } });
  const logoOp = fi(frame, 0, 1, 2, 10);

  // Flou cinétique simulé via opacité sur layers décalés
  const blur1Op = fi(frame, 0.5, 0, 0, 18);
  const blur1Sc = spring({ frame, fps, from: 4, to: 1, durationInFrames: 18, config: { damping: 20 } });

  // Glow explose puis se stabilise
  const glowR = spring({ frame: frame - 2, fps, from: 0, to: 480, durationInFrames: 35, config: { damping: 16 } });
  const glowOp = fi(frame, 0, 1, 0, 12) * fi(frame, 1, 0.4, 35, 90);

  // Ligne dorée sous le logo
  const lineW = spring({ frame: frame - 18, fps, from: 0, to: 200, durationInFrames: 22, config: { damping: 12 } });

  // Sous-titre
  const subOp = fi(frame, 0, 1, 48, 68);
  const subY = fi(frame, 14, 0, 48, 68);

  // Particules qui explosent depuis le centre
  const PARTS = [
    { angle: 0,   dist: 300, delay: 3  },
    { angle: 45,  dist: 260, delay: 5  },
    { angle: 90,  dist: 320, delay: 2  },
    { angle: 135, dist: 280, delay: 7  },
    { angle: 180, dist: 300, delay: 4  },
    { angle: 225, dist: 260, delay: 6  },
    { angle: 270, dist: 310, delay: 3  },
    { angle: 315, dist: 270, delay: 5  },
  ];

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: FONT, overflow: 'hidden' }}>

      {/* Glow explosif */}
      <div style={{
        position: 'absolute',
        width: glowR * 2, height: glowR * 2,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${T.gold}30 0%, ${T.gold}08 40%, transparent 70%)`,
        opacity: glowOp,
        pointerEvents: 'none',
      }} />

      {/* Particules explosion */}
      {PARTS.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const progress = spring({ frame: frame - p.delay, fps, from: 0, to: 1, durationInFrames: 32, config: { damping: 20 } });
        const dist = progress * p.dist;
        const px = Math.cos(rad) * dist;
        const py = Math.sin(rad) * dist;
        const pOp = fi(frame, 0, 1, p.delay, p.delay + 8) * fi(frame, 1, 0, 50, 88);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: '50%', top: '50%',
            width: 4, height: 4,
            borderRadius: '50%',
            background: T.gold,
            opacity: pOp,
            transform: `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`,
            boxShadow: `0 0 8px ${T.gold}`,
          }} />
        );
      })}

      {/* Logo shadow/blur décalé pour effet cinétique */}
      <div style={{
        position: 'absolute',
        opacity: blur1Op * 0.3,
        transform: `scale(${blur1Sc})`,
        fontSize: 108,
        fontWeight: 900,
        color: T.gold,
        letterSpacing: 10,
        textTransform: 'uppercase',
        filter: 'blur(8px)',
        lineHeight: 1,
      }}>
        Loqar
      </div>

      {/* Logo principal */}
      <div style={{
        opacity: logoOp,
        transform: `scale(${logoSc})`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          fontSize: 108,
          fontWeight: 900,
          color: T.text,
          letterSpacing: 10,
          textTransform: 'uppercase',
          lineHeight: 1,
          textShadow: `0 0 60px ${T.gold}40`,
        }}>
          Loqar
        </div>
        <div style={{ width: lineW, height: 3, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
        <div style={{
          opacity: subOp,
          transform: `translateY(${subY}px)`,
          fontSize: 20, color: T.sub,
          letterSpacing: 4, textTransform: 'uppercase', fontWeight: 500,
        }}>
          Location de voitures
        </div>
      </div>

      {/* Flash blanc */}
      <AbsoluteFill style={{ background: '#ffffff', opacity: flashOp, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

// --- Scène 2 : Tagline dynamique (90→240f / 3→8s) ---
const SceneTagline = ({ frame, fps }) => {
  const words = ['Gérez.', 'Automatisez.', 'Encaissez.'];
  const colors = [T.text, T.gold, T.success];

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, fontFamily: FONT }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        {words.map((word, i) => {
          const start = i * 30;
          const op = fi(frame, 0, 1, start, start + 18);
          const y = fi(frame, 30, 0, start, start + 22);
          const sc = spring({ frame: frame - start, fps, from: 0.85, to: 1, durationInFrames: 25, config: { damping: 12 } });
          return (
            <div key={i} style={{
              opacity: op,
              transform: `translateY(${y}px) scale(${sc})`,
              fontSize: 78,
              fontWeight: 900,
              color: colors[i],
              lineHeight: 1.05,
              letterSpacing: -1,
            }}>
              {word}
            </div>
          );
        })}
      </div>
      <div style={{
        opacity: fi(frame, 0, 1, 95, 118),
        transform: `translateY(${fi(frame, 16, 0, 95, 118)}px)`,
        fontSize: 22,
        color: T.sub,
        fontWeight: 400,
        letterSpacing: 0.5,
        textAlign: 'center',
        lineHeight: 1.6,
        maxWidth: 600,
      }}>
        Le logiciel tout-en-un pour les agences de location
      </div>
    </AbsoluteFill>
  );
};

// --- Scène 3 : Features cards UI (240→480f / 8→16s) ---
const FEATURES = [
  { icon: '🚗', title: 'Flotte centralisée', desc: 'Tous vos véhicules, disponibilités et statuts en un coup d\'œil', color: T.gold },
  { icon: '📋', title: 'Contrats automatiques', desc: 'Générez et envoyez des contrats signés en 30 secondes', color: T.amber },
  { icon: '💳', title: 'Paiements & dépôts', desc: 'Suivi des encaissements, dépôts et impayés en temps réel', color: T.success },
  { icon: '👥', title: 'Gestion clients', desc: 'Historique complet, permis, dépenses par client', color: T.blue },
];

const SceneFeatures = ({ frame, fps }) => {
  const titleOp = fi(frame, 0, 1, 0, 20);
  const titleY = fi(frame, 20, 0, 0, 20);

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, fontFamily: FONT, padding: '0 60px' }}>
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, fontSize: 28, fontWeight: 700, color: T.sub, letterSpacing: 2, textTransform: 'uppercase' }}>
        Tout ce dont vous avez besoin
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: '100%', maxWidth: 900 }}>
        {FEATURES.map((f, i) => {
          const delay = i * 18;
          const op = fi(frame, 0, 1, delay + 10, delay + 30);
          const y = fi(frame, 30, 0, delay + 10, delay + 35);
          const sc = spring({ frame: frame - delay - 10, fps, from: 0.9, to: 1, durationInFrames: 25 });
          const glowOp = fi(frame, 0, 0.6, delay + 20, delay + 45);

          return (
            <div key={i} style={{
              opacity: op,
              transform: `translateY(${y}px) scale(${sc})`,
              background: T.card,
              border: `1px solid ${T.border2}`,
              borderRadius: 16,
              padding: '24px 22px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Accent top bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${f.color}, transparent)`, opacity: glowOp }} />
              <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// --- Scène 4 : Dashboard mockup animé (480→690f / 16→23s) ---
const RENTALS = [
  { client: 'Martin Dupont', car: 'Peugeot 208', amount: '420€', status: 'Actif', color: T.success },
  { client: 'Sophie Bernard', car: 'Renault Clio', amount: '315€', status: 'Actif', color: T.success },
  { client: 'Lucas Martin', car: 'BMW Série 3', amount: '980€', status: 'Payé', color: T.gold },
  { client: 'Emma Laurent', car: 'Toyota Yaris', amount: '210€', status: 'Actif', color: T.success },
];

const SceneDashboard = ({ frame, fps }) => {
  const headerOp = fi(frame, 0, 1, 0, 20);
  const statsData = [
    { label: 'Revenus ce mois', value: '8 420€', change: '+18%', color: T.gold },
    { label: 'Véhicules actifs', value: '12/15', change: '3 dispo', color: T.success },
    { label: 'Locations en cours', value: '9', change: 'dont 2 ce soir', color: T.amber },
  ];

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', flexDirection: 'column', gap: 20, fontFamily: FONT, padding: '50px 50px' }}>
      {/* Header */}
      <div style={{ opacity: headerOp, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, color: T.sub, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Tableau de bord</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: T.text, letterSpacing: -0.5 }}>Loqar</div>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, padding: '8px 18px', fontSize: 13, color: T.gold, fontWeight: 600 }}>
          Mars 2026
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'flex', gap: 14 }}>
        {statsData.map((s, i) => {
          const op = fi(frame, 0, 1, 15 + i * 12, 35 + i * 12);
          const sc = spring({ frame: frame - 15 - i * 12, fps, from: 0.88, to: 1, durationInFrames: 25 });
          return (
            <div key={i} style={{
              opacity: op, transform: `scale(${sc})`,
              flex: 1, background: T.card, border: `1px solid ${T.border2}`,
              borderRadius: 14, padding: '18px 16px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.7 }} />
              <div style={{ fontSize: 11, color: T.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: T.text, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.change}</div>
            </div>
          );
        })}
      </div>

      {/* Table locations */}
      <div style={{ background: T.card, border: `1px solid ${T.border2}`, borderRadius: 14, overflow: 'hidden', opacity: fi(frame, 0, 1, 50, 68) }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Locations en cours</div>
          <div style={{ fontSize: 11, color: T.gold, fontWeight: 600 }}>Voir tout →</div>
        </div>
        {RENTALS.map((r, i) => {
          const op = fi(frame, 0, 1, 60 + i * 10, 78 + i * 10);
          const x = fi(frame, -20, 0, 60 + i * 10, 78 + i * 10);
          return (
            <div key={i} style={{
              opacity: op, transform: `translateX(${x}px)`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 18px', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: T.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🚗</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.client}</div>
                  <div style={{ fontSize: 11, color: T.sub }}>{r.car}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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

// --- Scène 5 : CTA final (690→900f / 23→30s) ---
const SceneCTA = ({ frame, fps }) => {
  const glowR = fi(frame, 100, 400, 0, 80);
  const logoOp = fi(frame, 0, 1, 0, 22);
  const logoSc = spring({ frame, fps, from: 0.75, to: 1, durationInFrames: 32, config: { damping: 11 } });
  const lineW = fi(frame, 0, 200, 30, 58);
  const tagOp = fi(frame, 0, 1, 45, 65);
  const tagY = fi(frame, 18, 0, 45, 65);
  const ctaOp = fi(frame, 0, 1, 70, 90);
  const ctaSc = spring({ frame: frame - 70, fps, from: 0.8, to: 1, durationInFrames: 28, config: { damping: 10 } });
  const pulse = 1 + Math.sin((frame / 30) * Math.PI * 1.2) * 0.018;
  const urlOp = fi(frame, 0, 1, 100, 118);

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, fontFamily: FONT }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        width: glowR * 2, height: glowR * 2,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${T.gold}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ opacity: logoOp, transform: `scale(${logoSc})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 100, fontWeight: 900, color: T.text, letterSpacing: 10, textTransform: 'uppercase', lineHeight: 1 }}>
          Loqar
        </div>
        <div style={{ width: lineW, height: 3, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
      </div>

      {/* Tag */}
      <div style={{
        opacity: tagOp,
        transform: `translateY(${tagY}px)`,
        fontSize: 22,
        color: T.sub,
        fontWeight: 400,
        letterSpacing: 0.5,
        textAlign: 'center',
      }}>
        Gérez votre agence depuis n'importe où
      </div>

      {/* CTA bouton */}
      <div style={{
        opacity: ctaOp,
        transform: `scale(${ctaSc * pulse})`,
        background: T.gold,
        color: '#0F0D0B',
        fontSize: 22,
        fontWeight: 800,
        padding: '18px 56px',
        borderRadius: 50,
        letterSpacing: 1,
        boxShadow: `0 0 50px ${T.gold}40`,
        fontFamily: FONT,
      }}>
        Essayez gratuitement
      </div>

      {/* URL */}
      <div style={{
        opacity: urlOp,
        fontSize: 16,
        color: T.muted,
        letterSpacing: 2,
        fontFamily: FONT,
      }}>
        loqar.fr
      </div>
    </AbsoluteFill>
  );
};

// --- Root composition 30s ---
export const PromoLoqar = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Sequence from={0} durationInFrames={90}>
        <SceneLogo frame={frame} fps={fps} />
      </Sequence>
      <Sequence from={90} durationInFrames={150}>
        <SceneTagline frame={frame - 90} fps={fps} />
      </Sequence>
      <Sequence from={240} durationInFrames={240}>
        <SceneFeatures frame={frame - 240} fps={fps} />
      </Sequence>
      <Sequence from={480} durationInFrames={210}>
        <SceneDashboard frame={frame - 480} fps={fps} />
      </Sequence>
      <Sequence from={690} durationInFrames={210}>
        <SceneCTA frame={frame - 690} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
