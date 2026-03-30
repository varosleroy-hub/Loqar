import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from 'remotion';

const CREAM = '#f5f0eb';
const DARK = '#0f0f0f';
const RED = '#e94560';
const GRAY = '#888';

// Easing doux
const ease = (v) => v < 0.5 ? 2 * v * v : -1 + (4 - 2 * v) * v;

const fadeIn = (frame, start, duration = 20) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

const slideUp = (frame, start, duration = 25) =>
  interpolate(frame, [start, start + duration], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

// --- Scène 1 : Logo (0 → 3s = 0→90) ---
const SceneLogo = ({ frame, fps }) => {
  const scale = spring({ frame, fps, from: 0.75, to: 1, durationInFrames: 35, config: { damping: 14 } });
  const opacity = fadeIn(frame, 5, 25);
  const lineW = interpolate(frame, [30, 60], [0, 220], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: DARK, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
      <div style={{ opacity, transform: `scale(${scale})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 110, fontWeight: 900, color: CREAM, letterSpacing: 12, fontFamily: 'Arial Black, sans-serif', textTransform: 'uppercase' }}>
          Loqar
        </div>
        <div style={{ width: lineW, height: 4, background: RED, borderRadius: 2 }} />
      </div>
    </AbsoluteFill>
  );
};

// --- Scène 2 : Tagline (3s→8s = 90→240) ---
const SceneTagline = ({ frame, fps }) => {
  const f = frame; // frame relative
  const word1O = fadeIn(f, 0, 18);
  const word1Y = slideUp(f, 0, 22);
  const word2O = fadeIn(f, 20, 18);
  const word2Y = slideUp(f, 20, 22);
  const subO = fadeIn(f, 45, 20);

  return (
    <AbsoluteFill style={{ background: DARK, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ opacity: word1O, transform: `translateY(${word1Y}px)`, fontSize: 62, fontWeight: 800, color: CREAM, fontFamily: 'Arial, sans-serif', letterSpacing: 2 }}>
          Gérez votre flotte.
        </div>
        <div style={{ opacity: word2O, transform: `translateY(${word2Y}px)`, fontSize: 62, fontWeight: 800, color: RED, fontFamily: 'Arial, sans-serif', letterSpacing: 2 }}>
          Simplement.
        </div>
      </div>
      <div style={{ opacity: subO, fontSize: 26, color: GRAY, fontFamily: 'Arial, sans-serif', fontWeight: 300, letterSpacing: 1 }}>
        Le logiciel de location de voitures tout-en-un
      </div>
    </AbsoluteFill>
  );
};

// --- Scène 3 : Features orbitales (8s→18s = 240→540) ---
const FEATURES = [
  { label: 'Réservations', sub: 'en temps réel', angle: -90 },
  { label: 'Contrats', sub: 'automatisés', angle: 30 },
  { label: 'Paiements', sub: 'centralisés', angle: 150 },
];

const SceneFeatures = ({ frame, fps }) => {
  const RADIUS = 280;
  const rotation = interpolate(frame, [0, 300], [0, 360], { extrapolateRight: 'wrap' });
  const centerScale = spring({ frame, fps, from: 0, to: 1, durationInFrames: 30, config: { damping: 12 } });
  const centerOpacity = fadeIn(frame, 0, 25);

  return (
    <AbsoluteFill style={{ background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Cercles orbitaux */}
      {[340, 290, 240].map((r, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          border: `1px solid rgba(245,240,235,${0.06 + i * 0.04})`,
        }} />
      ))}

      {/* Centre */}
      <div style={{
        opacity: centerOpacity,
        transform: `scale(${centerScale})`,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{ fontSize: 56, fontWeight: 900, color: CREAM, fontFamily: 'Arial Black, sans-serif', letterSpacing: 6 }}>Loqar</div>
        <div style={{ width: 60, height: 3, background: RED, borderRadius: 2 }} />
      </div>

      {/* Points orbitaux */}
      {FEATURES.map((feat, i) => {
        const angleRad = ((feat.angle + rotation) * Math.PI) / 180;
        const x = Math.cos(angleRad) * RADIUS;
        const y = Math.sin(angleRad) * RADIUS;
        const itemOpacity = fadeIn(frame, 10 + i * 12, 18);

        return (
          <div key={i} style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            opacity: itemOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: RED, boxShadow: `0 0 20px ${RED}` }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: CREAM, fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap', textAlign: 'center' }}>
              {feat.label}
            </div>
            <div style={{ fontSize: 13, color: GRAY, fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
              {feat.sub}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// --- Scène 4 : Stats (18s→25s = 540→750) ---
const STATS = [
  { value: '100+', label: 'véhicules gérés' },
  { value: '0', label: 'paperasse' },
  { value: '24/7', label: 'accessible partout' },
];

const SceneStats = ({ frame, fps }) => {
  return (
    <AbsoluteFill style={{ background: CREAM, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 60 }}>
      <div style={{
        opacity: fadeIn(frame, 0, 20),
        transform: `translateY(${slideUp(frame, 0, 22)}px)`,
        fontSize: 32,
        fontWeight: 700,
        color: DARK,
        fontFamily: 'Arial, sans-serif',
        letterSpacing: 1,
      }}>
        Pourquoi Loqar ?
      </div>
      <div style={{ display: 'flex', gap: 80 }}>
        {STATS.map((s, i) => {
          const scale = spring({ frame: frame - i * 15, fps, from: 0.5, to: 1, durationInFrames: 30, config: { damping: 10 } });
          const opacity = fadeIn(frame, i * 15, 20);
          return (
            <div key={i} style={{
              opacity,
              transform: `scale(${scale})`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{ fontSize: 72, fontWeight: 900, color: RED, fontFamily: 'Arial Black, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: 20, color: DARK, fontFamily: 'Arial, sans-serif', fontWeight: 500, opacity: 0.7 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// --- Scène 5 : CTA final (25s→30s = 750→900) ---
const SceneCTA = ({ frame, fps }) => {
  const bgOpacity = fadeIn(frame, 0, 20);
  const logoScale = spring({ frame: frame - 5, fps, from: 0.7, to: 1, durationInFrames: 30, config: { damping: 12 } });
  const logoOpacity = fadeIn(frame, 5, 20);
  const ctaScale = spring({ frame: frame - 30, fps, from: 0.8, to: 1, durationInFrames: 25, config: { damping: 10 } });
  const ctaOpacity = fadeIn(frame, 30, 18);
  const pulse = 1 + Math.sin((frame / 30) * Math.PI * 1.5) * 0.02;

  return (
    <AbsoluteFill style={{ background: DARK, opacity: bgOpacity, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
      <div style={{ opacity: logoOpacity, transform: `scale(${logoScale})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 90, fontWeight: 900, color: CREAM, letterSpacing: 10, fontFamily: 'Arial Black, sans-serif' }}>Loqar</div>
        <div style={{ fontSize: 22, color: GRAY, fontFamily: 'Arial, sans-serif', letterSpacing: 2 }}>Gestion de location de voitures</div>
      </div>
      <div style={{
        opacity: ctaOpacity,
        transform: `scale(${ctaScale * pulse})`,
        background: RED,
        color: CREAM,
        fontSize: 26,
        fontWeight: 700,
        padding: '18px 52px',
        borderRadius: 50,
        fontFamily: 'Arial, sans-serif',
        letterSpacing: 2,
        textTransform: 'uppercase',
        boxShadow: `0 0 40px ${RED}55`,
      }}>
        Essayez gratuitement
      </div>
      <div style={{ opacity: fadeIn(frame, 50, 15), fontSize: 16, color: GRAY, fontFamily: 'Arial, sans-serif', letterSpacing: 1 }}>
        loqar.fr
      </div>
    </AbsoluteFill>
  );
};

// --- Composition principale ---
export const PromoLoqar = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: DARK, fontFamily: 'Arial, sans-serif' }}>
      <Sequence from={0} durationInFrames={90}>
        <SceneLogo frame={frame} fps={fps} />
      </Sequence>
      <Sequence from={90} durationInFrames={150}>
        <SceneTagline frame={frame - 90} fps={fps} />
      </Sequence>
      <Sequence from={240} durationInFrames={300}>
        <SceneFeatures frame={frame - 240} fps={fps} />
      </Sequence>
      <Sequence from={540} durationInFrames={210}>
        <SceneStats frame={frame - 540} fps={fps} />
      </Sequence>
      <Sequence from={750} durationInFrames={150}>
        <SceneCTA frame={frame - 750} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
