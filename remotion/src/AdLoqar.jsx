import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

export const AdLoqar = ({ agencyName, slogan, primaryColor, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo apparait en fondu + scale
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const logoScale = spring({ frame, fps, from: 0.6, to: 1, durationInFrames: 25 });

  // Barre accent slide de gauche
  const barWidth = interpolate(frame, [15, 45], [0, 340], { extrapolateRight: 'clamp' });

  // Slogan apparait
  const sloganOpacity = interpolate(frame, [40, 65], [0, 1], { extrapolateRight: 'clamp' });
  const sloganY = interpolate(frame, [40, 65], [20, 0], { extrapolateRight: 'clamp' });

  // CTA apparait
  const ctaOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: 'clamp' });
  const ctaScale = spring({ frame: frame - 70, fps, from: 0.8, to: 1, durationInFrames: 20 });

  // Pulse final sur le CTA
  const pulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.97, 1.03]
  );
  const ctaFinalScale = frame > 90 ? ctaScale * pulse : ctaScale;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: primaryColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Logo / Nom agence */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          fontSize: 96,
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: 8,
          textTransform: 'uppercase',
        }}
      >
        {agencyName}
      </div>

      {/* Barre accent */}
      <div
        style={{
          width: barWidth,
          height: 5,
          backgroundColor: accentColor,
          marginTop: 16,
          borderRadius: 3,
        }}
      />

      {/* Slogan */}
      <div
        style={{
          opacity: sloganOpacity,
          transform: `translateY(${sloganY}px)`,
          fontSize: 32,
          color: '#cccccc',
          marginTop: 32,
          textAlign: 'center',
          maxWidth: 700,
          lineHeight: 1.4,
        }}
      >
        {slogan}
      </div>

      {/* CTA */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaFinalScale})`,
          marginTop: 60,
          backgroundColor: accentColor,
          color: '#ffffff',
          fontSize: 28,
          fontWeight: 700,
          padding: '18px 48px',
          borderRadius: 50,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        Réservez maintenant
      </div>
    </AbsoluteFill>
  );
};
