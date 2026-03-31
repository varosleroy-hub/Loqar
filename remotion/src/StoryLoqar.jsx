import { AbsoluteFill, useCurrentFrame, Audio, staticFile } from 'remotion';

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

function spr(frame, delay = 0, k = 0.1) {
  const f = Math.max(0, frame - delay);
  return 1 - Math.exp(-k * f) * Math.cos(0.18 * f);
}

function clamp(v) { return Math.max(0, Math.min(1, v)); }

// ── SCENE 1: MINUIT (0-70f) ───────────────────────────────
function Scene1({ frame }) {
  const fps = 30;
  const opacity = clamp(ease(frame, 0, 1, 0, 15) * ease(frame, 1, 0, 55, 70));
  const clockHand = (frame / fps) * 6;

  return (
    <AbsoluteFill style={{ background: '#050504', opacity }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #050504 60%)' }} />

      <div style={{
        position: 'absolute', top: '12%', left: 0, right: 0, textAlign: 'center',
        fontFamily: 'Arial, sans-serif', fontWeight: 400,
        fontSize: 22, color: '#ffffff22', letterSpacing: 8, textTransform: 'uppercase',
        opacity: clamp(ease(frame, 0, 1, 8, 22)),
      }}>MINUIT — 14 OCTOBRE</div>

      <div style={{
        position: 'absolute', top: '18%', left: '50%',
        transform: 'translateX(-50%)',
        opacity: clamp(ease(frame, 0, 1, 5, 20)),
      }}>
        <svg width="100" height="100" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#ffffff11" strokeWidth="1" />
          <circle cx="40" cy="40" r="2" fill={C.gold} />
          <line x1="40" y1="40" x2="40" y2="16" stroke="#ffffff44" strokeWidth="2" strokeLinecap="round" transform={`rotate(${355 + clockHand * 0.5}, 40, 40)`} />
          <line x1="40" y1="40" x2="40" y2="12" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${clockHand * 6}, 40, 40)`} />
        </svg>
      </div>

      <div style={{
        position: 'absolute', top: '38%', left: '50%',
        transform: 'translateX(-50%)',
        opacity: clamp(ease(frame, 0, 1, 12, 28)),
        textAlign: 'center',
      }}>
        <div style={{ width: 180, height: 180, borderRadius: '50%', margin: '0 auto', background: 'radial-gradient(circle, #C9A84C08 0%, transparent 70%)', position: 'absolute', top: -30, left: -50 }} />
        <div style={{ fontSize: 96 }}>👨‍💼</div>
      </div>

      {['📋', '📋', '📋'].map((icon, i) => (
        <div key={i} style={{
          position: 'absolute', top: `${62 + i * 4}%`, left: `${35 + i * 12}%`,
          fontSize: 34, opacity: clamp(ease(frame, 0, 0.4, 15 + i * 5, 25 + i * 5)),
          transform: `rotate(${[-8, 3, -5][i]}deg)`,
        }}>{icon}</div>
      ))}

      <div style={{ position: 'absolute', bottom: '14%', left: '10%', right: '10%', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
          fontSize: 40, color: C.warmWhite, lineHeight: 1.4,
          opacity: clamp(ease(frame, 0, 1, 28, 40)),
        }}>
          Karim a 8 voitures.<br />
          <span style={{ color: '#ffffff55' }}>Il travaille 14h par jour.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── SCENE 2: DOULEUR (65-165f) ────────────────────────────
function Scene2({ frame }) {
  const opacity = clamp(ease(frame, 0, 1, 0, 18) * ease(frame, 1, 0, 82, 100));
  const messages = [
    { from: 'Client Ahmed', text: 'Le contrat est où ?',   time: '23:41', color: C.red },
    { from: 'Assurance',    text: 'Documents manquants…', time: '23:52', color: C.red },
    { from: 'Épouse 💛',    text: 'Tu rentres quand ?',   time: '00:03', color: C.gold },
  ];

  return (
    <AbsoluteFill style={{ background: C.charcoal, opacity }}>
      <div style={{
        position: 'absolute', top: '8%', left: '50%',
        transform: 'translateX(-50%)',
        width: 340, background: '#0a0a0a',
        borderRadius: 36, padding: '28px 24px',
        border: '1px solid #ffffff11',
        boxShadow: '0 30px 60px #00000099',
        opacity: clamp(ease(frame, 0, 1, 5, 22)),
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#ffffff44', marginBottom: 18, fontFamily: 'Arial, sans-serif' }}>
          <span>00:07</span><span>●●●●○ 12%</span>
        </div>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 16, color: '#ffffff66', textAlign: 'center', marginBottom: 22, borderBottom: '1px solid #ffffff11', paddingBottom: 14 }}>
          Messages non lus (3)
        </div>
        {messages.map((msg, i) => (
          <div key={i} style={{
            padding: '14px 16px', borderRadius: 14,
            background: '#ffffff08', marginBottom: 12,
            borderLeft: `3px solid ${msg.color}`,
            opacity: clamp(ease(frame, 0, 1, 18 + i * 15, 30 + i * 15)),
            transform: `translateX(${ease(frame, 28, 0, 18 + i * 15, 30 + i * 15)}px)`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 16, color: msg.color }}>{msg.from}</span>
              <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#ffffff33' }}>{msg.time}</span>
            </div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, color: '#ffffff66' }}>{msg.text}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: '10%', left: '10%', right: '10%', opacity: clamp(ease(frame, 0, 1, 60, 80)) }}>
        <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 26, color: '#ffffff33', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>CE QU'IL PERD VRAIMENT :</div>
        {[
          { label: 'Heures perdues/semaine',        val: '22h',    color: C.red },
          { label: 'Clients qui ne rappellent pas', val: '4/mois', color: '#ff6b35' },
          { label: 'Soirées en famille',             val: '0',      color: '#ffffff44' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
            opacity: clamp(ease(frame, 0, 1, 65 + i * 8, 78 + i * 8)),
          }}>
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 20, color: '#ffffff55' }}>{item.label}</span>
            <span style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 38, color: item.color }}>{item.val}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ── SCENE 3: DÉCOUVERTE (165-270f) ────────────────────────
function Scene3({ frame }) {
  const opacity = clamp(ease(frame, 0, 1, 0, 18) * ease(frame, 1, 0, 82, 100));
  const flash = clamp(ease(frame, 0, 1, 0, 6) * ease(frame, 1, 0, 6, 18));
  const words = ["Un", "ami", "lui", "parle", "de", "Loqar."];

  return (
    <AbsoluteFill style={{ background: C.obsidian, opacity }}>
      <div style={{ position: 'absolute', inset: 0, background: C.warmWhite, opacity: flash * 0.15 }} />

      <div style={{
        position: 'absolute', top: 0, left: '50%',
        width: 2, background: `linear-gradient(180deg, ${C.gold} 0%, transparent 100%)`,
        height: `${clamp(spr(frame, 5, 0.12)) * 45}%`,
        transform: 'translateX(-50%)', opacity: 0.6,
      }} />

      <div style={{
        position: 'absolute', top: '28%', left: 0, right: 0, textAlign: 'center',
        opacity: clamp(ease(frame, 0, 1, 15, 35)),
        transform: `scale(${0.7 + clamp(spr(frame, 15, 0.08)) * 0.3})`,
      }}>
        <div style={{
          display: 'inline-block',
          background: `linear-gradient(135deg, ${C.gold}22, ${C.gold}08)`,
          border: `1px solid ${C.gold}44`,
          borderRadius: 20, padding: '22px 56px',
        }}>
          <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 80, letterSpacing: 4, lineHeight: 1 }}>
            <span style={{ color: C.warmWhite }}>LO</span>
            <span style={{ color: C.gold }}>Q</span>
            <span style={{ color: C.warmWhite }}>AR</span>
          </div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 18, color: '#ffffff44', letterSpacing: 4, marginTop: 6 }}>LOQAR.FR</div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: '58%', left: '10%', right: '10%', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {words.map((word, i) => (
            <span key={i} style={{
              fontFamily: 'Georgia, serif', fontStyle: 'italic',
              fontSize: 48, color: word === 'Loqar.' ? C.gold : C.warmWhite,
              opacity: clamp(ease(frame, 0, 1, 20 + i * 8, 30 + i * 8)),
              transform: `translateY(${ease(frame, 16, 0, 20 + i * 8, 30 + i * 8)}px)`,
              display: 'inline-block',
            }}>{word}</span>
          ))}
        </div>
        <div style={{
          fontFamily: 'Arial, sans-serif', fontSize: 22, color: '#ffffff44', marginTop: 24, letterSpacing: 1,
          opacity: clamp(ease(frame, 0, 1, 75, 90)),
        }}>"Il paraît que ça change tout."</div>
      </div>

      <div style={{
        position: 'absolute', bottom: '14%', left: '50%',
        transform: `translateX(-50%) translateY(${Math.sin(frame * 0.08) * 6}px)`,
        opacity: clamp(ease(frame, 0, 1, 80, 95)),
        fontSize: 44, color: C.gold,
      }}>↓</div>
    </AbsoluteFill>
  );
}

// ── SCENE 4: AVANT/APRÈS (265-390f) ───────────────────────
function Scene4({ frame }) {
  const opacity = clamp(ease(frame, 0, 1, 0, 18) * ease(frame, 1, 0, 102, 120));
  const splitProgress = clamp(spr(frame, 10, 0.08));
  const beforeItems = ['Excel chaotique', 'Contrats perdus', 'Paiements oubliés', 'Clients mécontents'];
  const afterItems  = ['Dashboard clair', 'Contrat en 1 clic', 'Paiement auto', 'Clients fidèles'];

  return (
    <AbsoluteFill style={{ background: C.obsidian, opacity }}>
      {/* BEFORE */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${splitProgress * 50}%`, background: '#0f0808', overflow: 'hidden', borderRight: `1px solid ${C.red}44` }}>
        <div style={{ padding: '100px 30px 20px 30px' }}>
          <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 26, color: C.red, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 32 }}>AVANT</div>
          {beforeItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, opacity: clamp(ease(frame, 0, 1, 25 + i * 12, 38 + i * 12)) }}>
              <span style={{ color: C.red, fontSize: 22 }}>✗</span>
              <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 20, color: '#ffffff44', textDecoration: 'line-through' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AFTER */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${splitProgress * 50}%`, right: 0, background: '#080f08', overflow: 'hidden' }}>
        <div style={{ padding: '100px 30px 20px 30px' }}>
          <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 26, color: C.gold, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 32 }}>AVEC LOQAR</div>
          {afterItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, opacity: clamp(ease(frame, 0, 1, 40 + i * 12, 55 + i * 12)) }}>
              <span style={{ color: '#4CAF50', fontSize: 22 }}>✓</span>
              <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 20, color: C.warmWhite }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(${splitProgress * 50}% - 1px)`, width: 2, background: `linear-gradient(180deg, transparent 5%, ${C.gold} 30%, ${C.gold} 70%, transparent 95%)` }} />

      <div style={{ position: 'absolute', bottom: '10%', left: '10%', right: '10%', textAlign: 'center', opacity: clamp(ease(frame, 0, 1, 88, 105)) }}>
        <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 44, color: C.warmWhite, letterSpacing: 1 }}>
          MÊME BUSINESS.<br />
          <span style={{ color: C.gold }}>RÉSULTATS DIFFÉRENTS.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── SCENE 5: RÉSULTAT (390-505f) ──────────────────────────
function Scene5({ frame }) {
  const opacity = clamp(ease(frame, 0, 1, 0, 18) * ease(frame, 1, 0, 97, 115));
  const counterVal = Math.floor(ease(frame, 0, 34, 40, 95));
  const stats = [
    { label: '+3 voitures en 3 mois',    icon: '🚗', color: C.gold     },
    { label: 'Soirées libres récupérées', icon: '🌙', color: '#7EB8F7'  },
    { label: 'Zéro contrat perdu',        icon: '📄', color: '#4CAF50'  },
    { label: 'CA +34% ce trimestre',      icon: '📈', color: C.gold     },
  ];

  return (
    <AbsoluteFill style={{ background: C.charcoal, opacity }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${C.gold}18 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', top: '8%', left: 0, right: 0, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 400, fontSize: 20, color: C.gold, letterSpacing: 6, textTransform: 'uppercase', opacity: clamp(ease(frame, 0, 1, 5, 20)) }}>
        3 MOIS PLUS TARD — KARIM
      </div>
      <div style={{ position: 'absolute', top: '18%', left: 0, right: 0, textAlign: 'center', opacity: clamp(ease(frame, 0, 1, 30, 50)) }}>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 20, color: '#ffffff33', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>CROISSANCE</div>
        <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 130, color: C.gold, lineHeight: 1 }}>+{counterVal}%</div>
      </div>
      <div style={{ position: 'absolute', top: '55%', left: '10%', right: '10%' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20,
            opacity: clamp(ease(frame, 0, 1, 45 + i * 10, 60 + i * 10)),
            transform: `translateX(${ease(frame, -28, 0, 45 + i * 10, 60 + i * 10)}px)`,
          }}>
            <span style={{ fontSize: 32 }}>{stat.icon}</span>
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 24, color: stat.color }}>{stat.label}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '10%', right: '10%', opacity: clamp(ease(frame, 0, 1, 85, 100)) }}>
        <div style={{ borderLeft: `3px solid ${C.gold}`, paddingLeft: 24 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 28, color: C.warmWhite, lineHeight: 1.4, marginBottom: 10 }}>
            "L'outil que j'aurais voulu avoir dès le premier jour."
          </div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 16, color: '#ffffff33', letterSpacing: 2, textTransform: 'uppercase' }}>
            — Karim, loueur à Lyon · Client Loqar
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── SCENE 6: TOI (500-600f) ───────────────────────────────
function Scene6({ frame }) {
  const fadeIn = clamp(ease(frame, 0, 1, 0, 20));
  const logoScale = clamp(spr(frame, 8, 0.09));
  const pulseQ = 0.92 + Math.sin(frame * 0.09) * 0.08;
  const lines = ["Et toi ?", "Tu attends quoi ?"];

  return (
    <AbsoluteFill style={{ background: C.obsidian, opacity: fadeIn, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {[1, 0.6, 0.3].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', width: 600 * s, height: 600 * s,
          borderRadius: '50%', border: `1px solid ${C.gold}${['22', '14', '09'][i]}`,
          opacity: clamp(ease(frame, 0, 1, 5 + i * 8, 20 + i * 8)),
          transform: `scale(${1 + frame * 0.0004 * (i + 1)})`,
        }} />
      ))}

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            fontFamily: i === 0 ? 'Georgia, serif' : 'Arial Black, sans-serif',
            fontStyle: i === 0 ? 'italic' : 'normal',
            fontWeight: i === 0 ? 400 : 900,
            fontSize: i === 0 ? 60 : 72,
            color: i === 0 ? '#ffffff66' : C.warmWhite,
            opacity: clamp(ease(frame, 0, 1, 10 + i * 20, 25 + i * 20)),
            transform: `translateY(${ease(frame, 28, 0, 10 + i * 20, 28 + i * 20)}px)`,
            lineHeight: 1.2, letterSpacing: i === 1 ? 2 : 0,
          }}>{line}</div>
        ))}
      </div>

      <div style={{ transform: `scale(${logoScale})`, opacity: clamp(ease(frame, 0, 1, 28, 45)), display: 'flex', alignItems: 'flex-end', marginBottom: 22 }}>
        <span style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 100, color: C.warmWhite, letterSpacing: 4 }}>LO</span>
        <span style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 100, color: C.gold, display: 'inline-block', transform: `scale(${pulseQ})`, transformOrigin: 'center bottom' }}>Q</span>
        <span style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 100, color: C.warmWhite, letterSpacing: 4 }}>AR</span>
      </div>

      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 34, color: C.gold, letterSpacing: 10, opacity: clamp(ease(frame, 0, 1, 45, 62)), marginBottom: 32 }}>LOQAR.FR</div>

      <div style={{ background: C.gold, borderRadius: 100, padding: '20px 56px', opacity: clamp(ease(frame, 0, 1, 58, 75)), transform: `scale(${ease(frame, 0.85, 1, 58, 75)})` }}>
        <span style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 28, color: C.obsidian, letterSpacing: 2, textTransform: 'uppercase' }}>
          Essai gratuit — Aucune carte requise
        </span>
      </div>

      <div style={{ position: 'absolute', bottom: '7%', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, color: '#ffffff33', opacity: clamp(ease(frame, 0, 1, 78, 92)) }}>
        La location, réinventée pour ceux qui bâtissent.
      </div>
    </AbsoluteFill>
  );
}

// ── COMPOSITION REMOTION ──────────────────────────────────
export const StoryLoqar = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: C.obsidian }}>
      {/* Sons */}
      {/* Impact au début — révélation logo Loqar scène 3 */}
      <Audio src={staticFile('impact.mp3')} startFrom={0} endAt={60} volume={0.5} />
      {/* Whoosh transition scène 1→2 */}
      <Audio src={staticFile('whoosh.wav')} startFrom={58} endAt={90} volume={0.4} />
      {/* Ding pour chaque message scène 2 */}
      <Audio src={staticFile('ding.wav')} startFrom={83} endAt={110} volume={0.5} />
      <Audio src={staticFile('ding.wav')} startFrom={98} endAt={125} volume={0.5} />
      <Audio src={staticFile('ding.wav')} startFrom={113} endAt={140} volume={0.5} />
      {/* Whoosh transition scène 2→3 */}
      <Audio src={staticFile('whoosh.wav')} startFrom={158} endAt={190} volume={0.4} />
      {/* Impact révélation Loqar scène 3 */}
      <Audio src={staticFile('impact.mp3')} startFrom={178} endAt={220} volume={0.6} />
      {/* Whoosh split screen scène 4 */}
      <Audio src={staticFile('whoosh.wav')} startFrom={258} endAt={290} volume={0.4} />
      {/* Succès scène 5 — résultats */}
      <Audio src={staticFile('success.wav')} startFrom={422} endAt={470} volume={0.5} />
      {/* Impact final CTA */}
      <Audio src={staticFile('impact.mp3')} startFrom={498} endAt={540} volume={0.4} />

      {frame < 78  && <Scene1 frame={frame} />}
      {frame >= 58  && frame < 175 && <Scene2 frame={frame - 65} />}
      {frame >= 158 && frame < 278 && <Scene3 frame={frame - 165} />}
      {frame >= 258 && frame < 398 && <Scene4 frame={frame - 265} />}
      {frame >= 382 && frame < 515 && <Scene5 frame={frame - 390} />}
      {frame >= 498 && <Scene6 frame={frame - 505} />}
    </AbsoluteFill>
  );
};
