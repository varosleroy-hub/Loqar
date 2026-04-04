import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { staticFile } from 'remotion';

const T = {
  bg:     '#141210',
  card:   '#1F1D1A',
  border: '#2E2B27',
  text:   '#F5F0E8',
  sub:    '#9A9488',
  muted:  '#5A5650',
  gold:   '#C8A96E',
  success:'#6AAF7A',
  amber:  '#D4854A',
};
const FONT = "'Plus Jakarta Sans', Arial, sans-serif";

export const StaticAdLoqar = () => {
  const frame = useCurrentFrame();

  const fadeIn = (start) => interpolate(frame, [start, start + 20], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const slideUp = (start) => interpolate(frame, [start, start + 20], [30, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: T.bg, fontFamily: FONT, overflow: 'hidden' }}>

      {/* Glow top */}
      <div style={{
        position: 'absolute', top: -200, left: '50%',
        width: 700, height: 700, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${T.gold}20 0%, transparent 70%)`,
        transform: 'translateX(-50%)',
      }} />

      {/* Glow bottom */}
      <div style={{
        position: 'absolute', bottom: -200, right: -100,
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${T.amber}15 0%, transparent 70%)`,
      }} />

      {/* Contenu centré */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 70px', gap: 0 }}>

        {/* Badge */}
        <div style={{
          opacity: fadeIn(0),
          transform: `translateY(${slideUp(0)}px)`,
          background: T.gold + '18',
          border: `1px solid ${T.gold}40`,
          borderRadius: 99, padding: '8px 24px',
          fontSize: 22, fontWeight: 700, color: T.gold,
          letterSpacing: 2, textTransform: 'uppercase',
          marginBottom: 36,
        }}>
          Logiciel de location
        </div>

        {/* Logo */}
        <div style={{
          opacity: fadeIn(5),
          transform: `translateY(${slideUp(5)}px)`,
          fontSize: 120, fontWeight: 900, color: T.text,
          letterSpacing: 12, textTransform: 'uppercase', lineHeight: 1,
          marginBottom: 16,
          textShadow: `0 0 80px ${T.gold}30`,
        }}>
          Loqar
        </div>

        {/* Ligne dorée */}
        <div style={{
          opacity: fadeIn(10),
          width: 200, height: 3,
          background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
          marginBottom: 36,
        }} />

        {/* Accroche */}
        <div style={{
          opacity: fadeIn(15),
          transform: `translateY(${slideUp(15)}px)`,
          fontSize: 36, fontWeight: 700, color: T.text,
          textAlign: 'center', lineHeight: 1.3, marginBottom: 52,
        }}>
          Gérez votre flotte.<br />
          <span style={{ color: T.gold }}>Simplement.</span>
        </div>

        {/* 3 features */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 56, width: '100%' }}>
          {[
            { icon: '🚗', label: 'Flotte',    color: T.gold    },
            { icon: '📋', label: 'Contrats',  color: T.amber   },
            { icon: '💳', label: 'Paiements', color: T.success },
          ].map((f, i) => (
            <div key={i} style={{
              opacity: fadeIn(20 + i * 5),
              transform: `translateY(${slideUp(20 + i * 5)}px)`,
              flex: 1, background: T.card,
              border: `1px solid ${f.color}30`,
              borderRadius: 16, padding: '22px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: f.color, opacity: 0.6 }} />
              <div style={{ fontSize: 34 }}>{f.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{f.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          opacity: fadeIn(35),
          transform: `translateY(${slideUp(35)}px)`,
          background: T.gold, color: '#0F0D0B',
          fontSize: 28, fontWeight: 800,
          padding: '20px 70px', borderRadius: 99,
          letterSpacing: 1, textTransform: 'uppercase',
          boxShadow: `0 0 60px ${T.gold}40`,
          marginBottom: 28,
        }}>
          Essai gratuit
        </div>

        {/* URL */}
        <div style={{
          opacity: fadeIn(40),
          fontSize: 22, color: T.muted, letterSpacing: 3,
        }}>
          loqar.fr
        </div>

      </div>

      {/* Bordure dorée subtile */}
      <div style={{
        position: 'absolute', inset: 20,
        borderRadius: 28,
        border: `1px solid ${T.gold}18`,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
