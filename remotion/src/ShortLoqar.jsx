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

const T = {
  bg:      '#141210',
  card:    '#1F1D1A',
  card2:   '#252320',
  border2: '#3A3733',
  text:    '#F5F0E8',
  sub:     '#9A9488',
  muted:   '#5A5650',
  gold:    '#C8A96E',
  amber:   '#D4854A',
  success: '#6AAF7A',
  border:  '#2E2B27',
};
const FONT = "'Plus Jakarta Sans', 'Arial', sans-serif";

const fi = (frame, from, to, start, end) =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const CarSVG = ({ color = T.gold, width = 320, opacity = 1 }) => (
  <svg width={width} height={width * 0.42} viewBox="0 0 200 84" fill="none" style={{ opacity }}>
    <path
      d="M10 58 L10 46 Q12 38 22 32 L58 20 Q68 14 90 13 L120 13 Q142 13 152 20 L178 32 Q188 38 190 46 L190 58 Q190 64 184 64 L168 64 Q166 72 158 76 Q150 80 142 76 Q134 72 132 64 L68 64 Q66 72 58 76 Q50 80 42 76 Q34 72 32 64 L16 64 Q10 64 10 58 Z"
      fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round"
    />
    <path
      d="M62 32 L72 18 Q80 14 92 14 L118 14 Q130 14 138 18 L148 32 Z"
      fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1"
    />
    <circle cx="50" cy="70" r="10" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
    <circle cx="150" cy="70" r="10" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
    <circle cx="50" cy="70" r="4" fill={color} fillOpacity="0.5" />
    <circle cx="150" cy="70" r="4" fill={color} fillOpacity="0.5" />
    <rect x="183" y="44" width="8" height="5" rx="2" fill={color} fillOpacity="0.7" />
    <rect x="9" y="44" width="8" height="5" rx="2" fill={color} fillOpacity="0.4" />
  </svg>
);

// --- Scène 1 : Logo (0→60f / 0→2s) ---
const S1Logo = ({ frame, fps }) => {
  const flashOp = fi(frame, 1, 0, 0, 6);
  const logoSc = spring({ frame: frame - 3, fps, from: 3.2, to: 1, durationInFrames: 26, config: { damping: 14, stiffness: 160 } });
  const logoOp = fi(frame, 0, 1, 2, 10);
  const blurOp = fi(frame, 0.4, 0, 0, 14);
  const blurSc = spring({ frame, fps, from: 3.8, to: 1, durationInFrames: 16, config: { damping: 20 } });
  const glowR = spring({ frame, fps, from: 0, to: 420, durationInFrames: 30, config: { damping: 16 } });
  const lineW = spring({ frame: frame - 16, fps, from: 0, to: 180, durationInFrames: 18, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: FONT, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: glowR * 2, height: glowR * 2, borderRadius: '50%', background: `radial-gradient(ellipse, ${T.gold}28 0%, transparent 70%)`, opacity: fi(frame, 0, 0.5, 0, 30) }} />
      <div style={{ position: 'absolute', opacity: blurOp * 0.3, transform: `scale(${blurSc})`, fontSize: 100, fontWeight: 900, color: T.gold, letterSpacing: 10, textTransform: 'uppercase', filter: 'blur(8px)' }}>Loqar</div>
      <div style={{ opacity: logoOp, transform: `scale(${logoSc})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 100, fontWeight: 900, color: T.text, letterSpacing: 10, textTransform: 'uppercase', lineHeight: 1, textShadow: `0 0 60px ${T.gold}40` }}>Loqar</div>
        <div style={{ width: lineW, height: 3, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
      </div>
      <AbsoluteFill style={{ background: '#fff', opacity: flashOp, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

// --- Scène 2 : 3 mots + voiture (60→150f / 2→5s) ---
const S2Keywords = ({ frame, fps }) => {
  const words = [
    { text: 'Gérez.',       color: T.text,    delay: 0  },
    { text: 'Automatisez.', color: T.gold,    delay: 22 },
    { text: 'Encaissez.',   color: T.success, delay: 44 },
  ];
  const carX = fi(frame, -300, 50, 20, 80);
  const carOp = fi(frame, 0, 0.22, 20, 50) * fi(frame, 1, 0, 72, 90);

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, fontFamily: FONT, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: 60, opacity: carOp, transform: `translateX(${carX}px)` }}>
        <CarSVG color={T.gold} width={520} />
      </div>
      {words.map((w, i) => {
        const op = fi(frame, 0, 1, w.delay, w.delay + 14);
        const y = fi(frame, 28, 0, w.delay, w.delay + 18);
        const sc = spring({ frame: frame - w.delay, fps, from: 0.82, to: 1, durationInFrames: 22, config: { damping: 12 } });
        return (
          <div key={i} style={{ opacity: op, transform: `translateY(${y}px) scale(${sc})`, fontSize: 72, fontWeight: 900, color: w.color, lineHeight: 1.05, letterSpacing: -1 }}>
            {w.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// --- Scène 3 : Flash features (150→240f / 5→8s) ---
const ITEMS = [
  { icon: '🚗', label: 'Flotte',    sub: '15 véhicules',    color: T.gold    },
  { icon: '📋', label: 'Contrats',  sub: 'Auto-générés',    color: T.amber   },
  { icon: '💳', label: 'Paiements', sub: 'Temps réel',      color: T.success },
];

const S3Features = ({ frame, fps }) => {
  const titleOp = fi(frame, 0, 1, 0, 16);

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, fontFamily: FONT }}>
      <div style={{ opacity: titleOp, fontSize: 22, fontWeight: 600, color: T.sub, letterSpacing: 2, textTransform: 'uppercase' }}>
        Tout en un
      </div>
      <div style={{ display: 'flex', gap: 22 }}>
        {ITEMS.map((item, i) => {
          const delay = i * 16;
          const op = fi(frame, 0, 1, delay + 8, delay + 24);
          const sc = spring({ frame: frame - delay - 8, fps, from: 0.7, to: 1, durationInFrames: 24, config: { damping: 11 } });
          const y = fi(frame, 30, 0, delay + 8, delay + 26);
          return (
            <div key={i} style={{
              opacity: op, transform: `translateY(${y}px) scale(${sc})`,
              background: T.card, border: `1px solid ${item.color}30`,
              borderRadius: 18, padding: '28px 26px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              width: 200, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${item.color}, transparent)` }} />
              <div style={{ fontSize: 40 }}>{item.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{item.label}</div>
              <div style={{ fontSize: 13, color: item.color, fontWeight: 600 }}>{item.sub}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// --- Scène 4 : CTA (240→300f / 8→10s) ---
const S4CTA = ({ frame, fps }) => {
  const logoOp = fi(frame, 0, 1, 0, 16);
  const logoSc = spring({ frame, fps, from: 0.8, to: 1, durationInFrames: 24, config: { damping: 11 } });
  const ctaOp = fi(frame, 0, 1, 20, 36);
  const ctaSc = spring({ frame: frame - 20, fps, from: 0.75, to: 1, durationInFrames: 22, config: { damping: 10 } });
  const pulse = 1 + Math.sin((frame / 30) * Math.PI * 2) * 0.02;
  const glowR = fi(frame, 80, 360, 0, 60);

  return (
    <AbsoluteFill style={{ background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, fontFamily: FONT }}>
      <div style={{ position: 'absolute', width: glowR * 2, height: glowR * 2, borderRadius: '50%', background: `radial-gradient(ellipse, ${T.gold}18 0%, transparent 70%)` }} />
      <div style={{ opacity: logoOp, transform: `scale(${logoSc})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 2 }}>
        <div style={{ fontSize: 86, fontWeight: 900, color: T.text, letterSpacing: 8, textTransform: 'uppercase', lineHeight: 1 }}>Loqar</div>
        <div style={{ width: fi(frame, 0, 160, 5, 28), height: 3, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
      </div>
      <div style={{ opacity: ctaOp, transform: `scale(${ctaSc * pulse})`, background: T.gold, color: '#0F0D0B', fontSize: 22, fontWeight: 800, padding: '16px 52px', borderRadius: 50, letterSpacing: 1, boxShadow: `0 0 40px ${T.gold}50`, zIndex: 2 }}>
        Essayez gratuitement
      </div>
      <div style={{ opacity: fi(frame, 0, 1, 38, 52), fontSize: 15, color: T.muted, letterSpacing: 2, zIndex: 2 }}>loqar.fr</div>
    </AbsoluteFill>
  );
};

// --- Composition 10s ---
export const ShortLoqar = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Audio src={staticFile('voiceover.mp3')} startFrom={0} />

      <Sequence from={0} durationInFrames={60}>
        <S1Logo frame={frame} fps={fps} />
      </Sequence>
      <Sequence from={60} durationInFrames={90}>
        <S2Keywords frame={frame - 60} fps={fps} />
      </Sequence>
      <Sequence from={150} durationInFrames={90}>
        <S3Features frame={frame - 150} fps={fps} />
      </Sequence>
      <Sequence from={240} durationInFrames={60}>
        <S4CTA frame={frame - 240} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
