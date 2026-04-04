import { AbsoluteFill, useCurrentFrame, useVideoConfig, Audio } from 'remotion';
import { staticFile } from 'remotion';

const C = {
  obsidian: '#080807',
  gold: '#C9A84C',
  warmWhite: '#F2EDE4',
  red: '#D93B2B',
  charcoal: '#1A1A18',
};

function ease(frame, from, to, inF, outF) {
  if (frame <= inF) return from;
  if (frame >= outF) return to;
  const t = (frame - inF) / (outF - inF);
  const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  return from + (to - from) * eased;
}

function spr(frame, delay = 0, stiffness = 0.12) {
  const f = Math.max(0, frame - delay);
  return 1 - Math.exp(-stiffness * f) * Math.cos(0.2 * f);
}

function clamp(v) { return Math.max(0, Math.min(1, v)); }

// ── SCENE 1: CHAOS (0→65) ─────────────────────────────────
function SceneChaos({ frame }) {
  const items = [
    { text: '47 messages WhatsApp',     x: 8,  y: 12, rot: -3 },
    { text: 'Contrat_v3_FINAL.xlsx',    x: 55, y: 28, rot:  2 },
    { text: 'CLIENT EN ATTENTE…',       x: 15, y: 48, rot: -1 },
    { text: 'Facture impayée ⚠️',        x: 60, y: 62, rot:  4 },
    { text: 'Retour véhicule 14h',      x: 5,  y: 72, rot: -2 },
    { text: 'Caution non rendue',       x: 50, y: 80, rot:  1 },
  ];
  const opacity = clamp(ease(frame, 0, 1, 0, 12) * ease(frame, 1, 0, 48, 62));

  return (
    <AbsoluteFill style={{ background: C.obsidian, opacity }}>
      {items.map((item, i) => {
        const d = i * 4;
        const io = clamp(ease(frame, 0, 1, d, d + 8));
        const shake = Math.sin((frame + i * 17) * 0.4) * 1.5;
        return (
          <div key={i} style={{
            position: 'absolute', left: `${item.x}%`, top: `${item.y}%`,
            fontFamily: 'Arial, sans-serif', fontSize: 22,
            color: i % 2 === 0 ? '#ffffff20' : '#C9A84C30',
            transform: `rotate(${item.rot + shake * 0.3}deg)`,
            opacity: io, whiteSpace: 'nowrap', letterSpacing: 1,
          }}>{item.text}</div>
        );
      })}
      <div style={{
        position: 'absolute', bottom: '18%', left: 0, right: 0,
        textAlign: 'center', fontFamily: 'Arial Black, sans-serif',
        fontWeight: 900, fontSize: 56, color: C.warmWhite, letterSpacing: 2,
        opacity: clamp(ease(frame, 0, 1, 30, 50)),
        transform: `translateY(${ease(frame, 30, 0, 30, 50)}px)`,
      }}>
        T'AS COMBIEN<br />
        <span style={{ color: C.gold }}>DE VOITURES ?</span>
      </div>
    </AbsoluteFill>
  );
}

// ── SCENE 2: PAIN (55→155) ────────────────────────────────
function ScenePain({ frame }) {
  const opacity = clamp(ease(frame, 0, 1, 0, 20) * ease(frame, 1, 0, 70, 90));
  return (
    <AbsoluteFill style={{ background: C.charcoal, opacity, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
      <div style={{
        position: 'absolute', top: '20%', left: '50%', width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, #ffffff08 0%, transparent 70%)',
        transform: 'translateX(-50%)',
      }} />
      <p style={{
        fontFamily: 'Georgia, serif', fontStyle: 'italic',
        fontSize: 40, color: '#ffffff66', lineHeight: 1.3,
        opacity: clamp(ease(frame, 0, 1, 10, 30)), margin: 0, marginBottom: 36,
      }}>
        Chaque heure passée sur les papiers…
      </p>
      <p style={{
        fontFamily: 'Arial Black, sans-serif', fontWeight: 900,
        fontSize: 46, color: C.warmWhite, lineHeight: 1.2,
        opacity: clamp(ease(frame, 0, 1, 35, 55)), margin: 0,
      }}>
        …c'est une heure que tu<br />
        <span style={{ color: C.red }}>n'investis pas</span><br />
        dans ta croissance.
      </p>
    </AbsoluteFill>
  );
}

// ── SCENE 3: PIVOT (145→275) ──────────────────────────────
function ScenePivot({ frame }) {
  const opacity = clamp(ease(frame, 0, 1, 0, 15) * ease(frame, 1, 0, 105, 120));
  const lineW = clamp(spr(frame, 15, 0.1)) * 80;
  const textOpacity = clamp(ease(frame, 0, 1, 20, 40));
  return (
    <AbsoluteFill style={{ background: C.obsidian, opacity }}>
      <div style={{
        position: 'absolute', top: '38%', left: '10%', height: 3,
        width: `${lineW}%`, background: `linear-gradient(90deg, ${C.gold}, transparent)`,
      }} />
      <div style={{
        position: 'absolute', top: '40%', left: '10%', right: '10%',
        opacity: textOpacity, transform: `translateY(${ease(frame, 60, 0, 20, 45)}px)`,
      }}>
        <div style={{
          fontFamily: 'Arial Black, sans-serif', fontWeight: 900,
          fontSize: 86, color: C.warmWhite, lineHeight: 0.95, letterSpacing: -1,
        }}>
          LE TEMPS,<br />
          <span style={{ color: C.gold }}>C'EST DU</span><br />
          CAPITAL.
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: '15%', left: '10%',
        fontFamily: 'Arial, sans-serif', fontWeight: 300,
        fontSize: 26, color: '#ffffff55',
        opacity: clamp(ease(frame, 0, 1, 60, 80)),
        letterSpacing: 2, textTransform: 'uppercase',
      }}>
        Loqar convertit ton temps<br />en chiffre d'affaires.
      </div>
    </AbsoluteFill>
  );
}

// ── SCENE 4: PRODUCT (265→395) ────────────────────────────
function SceneProduct({ frame }) {
  const opacity = clamp(ease(frame, 0, 1, 0, 15) * ease(frame, 1, 0, 105, 120));
  const cardY = clamp(spr(frame, 10, 0.09)) * 60;
  const notifications = [
    { icon: '📄', text: 'Contrat généré en 1 clic', delay: 20, color: C.gold },
    { icon: '💳', text: 'Paiement reçu — +850€',    delay: 45, color: '#4CAF50' },
    { icon: '✅', text: 'État des lieux signé',      delay: 70, color: C.warmWhite },
  ];
  return (
    <AbsoluteFill style={{ background: C.charcoal, opacity, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 50px' }}>
      <div style={{
        width: '100%', background: C.obsidian, borderRadius: 24,
        border: `1px solid ${C.gold}33`, padding: '36px 40px',
        transform: `translateY(${60 - cardY}px)`,
        boxShadow: '0 20px 60px #00000080',
      }}>
        <div style={{
          fontFamily: 'Arial Black, sans-serif', fontWeight: 900,
          fontSize: 20, color: C.gold, letterSpacing: 4,
          textTransform: 'uppercase', marginBottom: 28,
          opacity: clamp(ease(frame, 0, 1, 5, 20)),
        }}>LOQAR — Tableau de bord</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, opacity: clamp(ease(frame, 0, 1, 15, 30)) }}>
          {[{ label: 'Véhicules', value: '12' }, { label: 'Revenus', value: '8 400€' }, { label: 'Contrats', value: '34' }].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: C.charcoal, borderRadius: 12, padding: '16px 18px',
              borderLeft: `3px solid ${C.gold}`,
            }}>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, color: '#ffffff55', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 32, color: C.warmWhite }}>{s.value}</div>
            </div>
          ))}
        </div>
        {notifications.map((n, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '14px 18px', background: `${n.color}11`,
            borderRadius: 12, marginBottom: 12, border: `1px solid ${n.color}33`,
            opacity: clamp(ease(frame, 0, 1, n.delay, n.delay + 15)),
            transform: `translateX(${ease(frame, 30, 0, n.delay, n.delay + 15)}px)`,
          }}>
            <span style={{ fontSize: 28 }}>{n.icon}</span>
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 22, color: n.color }}>{n.text}</span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 40, fontFamily: 'Arial Black, sans-serif',
        fontWeight: 900, fontSize: 46, color: C.warmWhite,
        textAlign: 'center', letterSpacing: 2,
        opacity: clamp(ease(frame, 0, 1, 80, 100)),
      }}>
        LOQAR GÈRE. <span style={{ color: C.gold }}>TOI, TU LOUES.</span>
      </div>
    </AbsoluteFill>
  );
}

// ── SCENE 5: DREAM (385→515) ──────────────────────────────
function SceneDream({ frame }) {
  const opacity = clamp(ease(frame, 0, 1, 0, 20) * ease(frame, 1, 0, 100, 120));
  const sunPulse = 0.95 + Math.sin(frame * 0.05) * 0.05;
  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #C9A84C22 0%, ${C.obsidian} 65%)` }} />
      <div style={{
        position: 'absolute', top: '8%', left: '50%',
        width: 280, height: 280, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.gold}88 0%, ${C.gold}22 50%, transparent 70%)`,
        transform: `translateX(-50%) scale(${sunPulse})`,
        opacity: clamp(ease(frame, 0, 1, 10, 35)),
      }} />
      <div style={{
        position: 'absolute', top: '35%', left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 96, opacity: clamp(ease(frame, 0, 1, 20, 40)),
      }}>🔑</div>
      <div style={{ position: 'absolute', bottom: '22%', left: '10%', right: '10%', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
          fontSize: 44, color: C.warmWhite, lineHeight: 1.3,
          opacity: clamp(ease(frame, 0, 1, 40, 65)),
          transform: `translateY(${ease(frame, 40, 0, 40, 65)}px)`,
        }}>Ton business mérite de tourner</div>
        <div style={{
          fontFamily: 'Arial Black, sans-serif', fontWeight: 900,
          fontSize: 52, color: C.gold, letterSpacing: 1,
          opacity: clamp(ease(frame, 0, 1, 65, 85)),
        }}>MÊME QUAND TU DORS.</div>
      </div>
    </AbsoluteFill>
  );
}

// ── SCENE 6: CTA (505→600) ────────────────────────────────
function SceneCTA({ frame }) {
  const fadeIn = clamp(ease(frame, 0, 1, 0, 20));
  const logoScale = clamp(spr(frame, 15, 0.1));
  const pulseQ = 0.92 + Math.sin(frame * 0.08) * 0.08;
  return (
    <AbsoluteFill style={{
      background: C.obsidian, opacity: fadeIn,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    }}>
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        border: `1px solid ${C.gold}22`,
        opacity: clamp(ease(frame, 0, 1, 20, 40)),
      }} />
      <div style={{
        transform: `scale(${logoScale})`, opacity: clamp(ease(frame, 0, 1, 10, 30)),
        display: 'flex', alignItems: 'flex-end', marginBottom: 36,
      }}>
        <span style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 130, color: C.warmWhite, letterSpacing: 6 }}>LO</span>
        <span style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 130, color: C.gold, display: 'inline-block', transform: `scale(${pulseQ})`, transformOrigin: 'center bottom' }}>Q</span>
        <span style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 130, color: C.warmWhite, letterSpacing: 6 }}>AR</span>
      </div>
      <div style={{
        fontFamily: 'Arial, sans-serif', fontWeight: 400,
        fontSize: 48, color: C.gold, letterSpacing: 12, textTransform: 'uppercase',
        opacity: clamp(ease(frame, 0, 1, 35, 55)), marginBottom: 40,
      }}>LOQAR.FR</div>
      <div style={{
        background: C.gold, borderRadius: 100, padding: '22px 64px',
        opacity: clamp(ease(frame, 0, 1, 55, 75)),
        transform: `scale(${ease(frame, 0.8, 1, 55, 75)})`,
      }}>
        <span style={{
          fontFamily: 'Arial Black, sans-serif', fontWeight: 900,
          fontSize: 30, color: C.obsidian, letterSpacing: 2, textTransform: 'uppercase',
        }}>Essai gratuit — Aucune carte requise</span>
      </div>
      <div style={{
        position: 'absolute', bottom: '8%',
        fontFamily: 'Arial, sans-serif', fontWeight: 300,
        fontSize: 18, color: '#ffffff33', letterSpacing: 4, textTransform: 'uppercase',
        opacity: clamp(ease(frame, 0, 1, 75, 90)),
      }}>LOQAR.FR — 2026</div>
    </AbsoluteFill>
  );
}

// ── COMPOSITION REMOTION ──────────────────────────────────
export const ReelsLoqar = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: C.obsidian }}>
      <Audio src={staticFile('reelsloqar.mp3')} startFrom={0} volume={0.25} />
      {frame < 75  && <SceneChaos   frame={frame} />}
      {frame >= 50  && frame < 160 && <ScenePain    frame={frame - 55} />}
      {frame >= 140 && frame < 285 && <ScenePivot   frame={frame - 145} />}
      {frame >= 260 && frame < 400 && <SceneProduct frame={frame - 265} />}
      {frame >= 380 && frame < 520 && <SceneDream   frame={frame - 385} />}
      {frame >= 500 && <SceneCTA frame={frame - 505} />}
    </AbsoluteFill>
  );
};
