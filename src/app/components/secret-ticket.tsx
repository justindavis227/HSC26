import type { CSSProperties, ReactNode } from 'react';
import { Trophy, Star, Award, BadgeCheck, type LucideIcon } from 'lucide-react';

export type Tier = 'gold' | 'silver' | 'bronze' | 'blue';

const INTER = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

interface TierStyle {
  bg: string;
  ink: string;
  sub: string;
  desc: string;
  italic: string;
  sealFill: string;
  sealIconColor: string;
  sealShadow: string;
  logo: string;
  eyebrow: string;
  title: [string, string];
  sealLabel: string;
  footer: string;
  Icon: LucideIcon;
  shimmerAlpha: number | null; // null = no shimmer
  description: ReactNode;
  cta?: { bg: string; text: string };
}

const TIERS: Record<Tier, TierStyle> = {
  gold: {
    bg: 'radial-gradient(130% 80% at 26% 4%, rgba(255,255,255,0.5), rgba(255,255,255,0) 52%), linear-gradient(135deg,#7a5c12 0%,#d9b441 16%,#f7e9a8 32%,#c9962a 50%,#f3dd86 66%,#b8881f 82%,#6f5410 100%)',
    ink: '#2a2008', sub: '#5a4410', desc: '#3a2c0a', italic: '#4a380c',
    sealFill: 'radial-gradient(circle at 35% 30%, #fbe6a8, #c9962a)',
    sealIconColor: '#2a2008',
    sealShadow: '0 0 0 3px #2a2008, 0 0 0 7px rgba(42,32,8,0.32), inset 0 2px 6px rgba(255,255,255,0.6)',
    logo: '/images/tickets/logo-gold.png',
    eyebrow: '★  FIRST PLACE  ★',
    title: ['GOLDEN', 'TICKET'],
    sealLabel: '1ST PLACE',
    footer: "WINNERS ONLY · WE'LL LET YOU IN",
    Icon: Trophy,
    shimmerAlpha: 0.7,
    description: (<>Cracked the code and was <strong>first</strong> to unlock the secret — every clue solved, no one faster. Welcome to the finale.</>),
    cta: { bg: '#0F1117', text: '#F2D27A' },
  },
  silver: {
    bg: 'radial-gradient(130% 80% at 26% 4%, rgba(255,255,255,0.65), rgba(255,255,255,0) 52%), linear-gradient(135deg,#71757d 0%,#c4c8ce 16%,#f3f5f7 32%,#9aa0a8 50%,#e3e6e9 66%,#a6acb4 82%,#63676e 100%)',
    ink: '#2c3038', sub: '#565b63', desc: '#34383f', italic: '#44484f',
    sealFill: 'radial-gradient(circle at 35% 30%, #fdfefe, #9aa0a8)',
    sealIconColor: '#2c3038',
    sealShadow: '0 0 0 3px #2c3038, 0 0 0 7px rgba(40,44,52,0.3), inset 0 2px 6px rgba(255,255,255,0.7)',
    logo: '/images/tickets/logo-silver.png',
    eyebrow: '★  SILVER · TOP 50  ★',
    title: ['SILVER', 'TICKET'],
    sealLabel: 'SILVER',
    footer: 'SECRET SOLVED · NOT FIRST',
    Icon: Star,
    shimmerAlpha: 0.85,
    description: (<>Cracked the code and solved the secret — every clue unlocked. <strong>Just not first</strong>, but right behind. Silver is still exclusive.</>),
  },
  bronze: {
    bg: 'radial-gradient(130% 80% at 26% 4%, rgba(255,255,255,0.5), rgba(255,255,255,0) 52%), linear-gradient(135deg,#5e3a1c 0%,#a86a38 16%,#e3a86e 32%,#8a4f24 50%,#d49256 66%,#9a5e2e 82%,#4e3018 100%)',
    ink: '#3a230f', sub: '#6b4422', desc: '#45290f', italic: '#5a3818',
    sealFill: 'radial-gradient(circle at 35% 30%, #f0c290, #8a5a2e)',
    sealIconColor: '#3a230f',
    sealShadow: '0 0 0 3px #3a230f, 0 0 0 7px rgba(58,35,15,0.32), inset 0 2px 6px rgba(255,255,255,0.45)',
    logo: '/images/tickets/logo-bronze.png',
    eyebrow: '★  BRONZE · TOP 100  ★',
    title: ['BRONZE', 'TICKET'],
    sealLabel: 'BRONZE',
    footer: 'SECRET SOLVED · NOT FIRST',
    Icon: Award,
    shimmerAlpha: 0.6,
    description: (<>Cracked the code and solved the secret — every clue unlocked. <strong>Savor the Bronze.</strong> You still beat the majority of camp.</>),
  },
  blue: {
    bg: '#3B82F6',
    ink: '#FFFFFF', sub: '#C9DEFD', desc: '#EAF2FE', italic: '#DCEAFE',
    sealFill: 'radial-gradient(circle at 35% 30%, #ffffff, #cfe0fb)',
    sealIconColor: '#2563EB',
    sealShadow: '0 0 0 3px #FFFFFF, 0 0 0 7px rgba(255,255,255,0.32), inset 0 2px 6px rgba(255,255,255,0.6)',
    logo: '/images/tickets/logo-blue.png',
    eyebrow: '★  PARTICIPANT  ★',
    title: ['CAMP', 'TICKET'],
    sealLabel: 'SOLVED',
    footer: 'SECRET SOLVED · NOT FIRST',
    Icon: BadgeCheck,
    shimmerAlpha: null,
    description: (<>Cracked the code and solved the secret — every clue unlocked. You weren't the first, but you <strong>found it</strong> — in good company.</>),
  },
};

export function tierForNumber(n: number): Tier {
  if (n === 1) return 'gold';
  if (n <= 50) return 'silver';
  if (n <= 100) return 'bronze';
  return 'blue';
}

export function formatSerial(n: number): string {
  return String(n).padStart(4, '0');
}

export function formatAwardDate(d: Date = new Date()): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
}

export interface SecretTicketProps {
  ticketNumber: number;
  name: string;
  campus: string;
  awardDate?: string;
  joinUrl?: string; // gold only
  /** When true, omit the animated shimmer (used for static PNG capture). */
  forExport?: boolean;
}

export function SecretTicket({ ticketNumber, name, campus, awardDate, joinUrl, forExport }: SecretTicketProps) {
  const tier = tierForNumber(ticketNumber);
  const t = TIERS[tier];
  const Icon = t.Icon;
  const date = awardDate ?? formatAwardDate();
  const showShimmer = !forExport && t.shimmerAlpha !== null;
  const showCta = tier === 'gold' && !!joinUrl;

  const card: CSSProperties = {
    position: 'relative',
    width: 380,
    height: 800,
    borderRadius: 8,
    overflow: 'hidden',
    background: t.bg,
    boxShadow: '0 14px 34px rgba(15,17,23,0.22)',
    fontFamily: INTER,
    color: t.ink,
  };

  return (
    <div style={card}>
      {showShimmer && (
        <style>{`
          @keyframes ctshimmer {
            0% { transform: translateX(-140%) skewX(-16deg); }
            55%, 100% { transform: translateX(260%) skewX(-16deg); }
          }
          @media (prefers-reduced-motion: reduce) { .ct-shimmer { animation: none !important; opacity: 0; } }
        `}</style>
      )}

      {/* Header */}
      <div style={{ height: 96, background: '#0F1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={t.logo} alt="High School Camp" style={{ width: 206, height: 'auto' }} crossOrigin="anonymous" />
      </div>

      {/* Double inset border */}
      <div style={{ position: 'absolute', top: 110, left: 22, right: 22, bottom: 22, border: `1.5px solid ${t.ink}8c`, borderRadius: 5, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 116, left: 28, right: 28, bottom: 28, border: `1px solid ${t.ink}47`, borderRadius: 4, pointerEvents: 'none' }} />

      {/* Top cluster — anchored to a fixed top so it never drifts on capture */}
      <div style={{ position: 'absolute', top: 130, left: 42, right: 42, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.34em', textTransform: 'uppercase' }}>{t.eyebrow}</div>
        <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', color: t.sub }}>SECRET CHALLENGE · HSC26</div>

        <div style={{ marginTop: 22, fontSize: 44, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 0.92 }}>
          {t.title[0]}<br />{t.title[1]}
        </div>

        <div style={{ width: 54, height: 3, background: t.ink, margin: '18px 0' }} />

        <div style={{ fontSize: 12, fontStyle: 'italic', color: t.italic }}>This certifies that</div>
        <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800, letterSpacing: '-0.01em' }}>{name}</div>
        <div style={{ marginTop: 7, fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: t.sub }}>{campus} Campus</div>

        <div style={{ marginTop: 18, fontSize: 13, lineHeight: 1.55, maxWidth: 262, color: t.desc }}>{t.description}</div>

        {/* Seal — flows below the description so it can never overlap the text */}
        <div style={{ marginTop: 40, width: 104, height: 104, borderRadius: '50%', background: t.sealFill, boxShadow: t.sealShadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: t.sealIconColor }}>
          <Icon size={33} strokeWidth={2} />
          <div style={{ marginTop: 6, fontSize: 8, fontWeight: 700, letterSpacing: tier === 'gold' ? '0.2em' : '0.24em', textTransform: 'uppercase' }}>{t.sealLabel}</div>
        </div>
      </div>

      {/* Bottom block — anchored to the bottom so footer/serial always clear the border */}
      <div style={{ position: 'absolute', bottom: 36, left: 42, right: 42, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {showCta && (
          <a
            href={joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="1"
            style={{ background: t.cta!.bg, color: t.cta!.text, borderRadius: 999, padding: '13px 24px', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none', marginBottom: 18 }}
          >
            CLAIM YOUR SPOT →
          </a>
        )}
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: t.sub }}>{t.footer}</div>
        <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 10, letterSpacing: '0.10em', color: t.sub }}>
          No. {formatSerial(ticketNumber)} · AWARDED {date}
        </div>
      </div>

      {/* Shimmer overlay (screen only) */}
      {showShimmer && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3, overflow: 'hidden' }}>
          <div
            className="ct-shimmer"
            style={{
              position: 'absolute', top: 0, bottom: 0, width: '34%',
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,${t.shimmerAlpha}), transparent)`,
              mixBlendMode: 'screen',
              animation: 'ctshimmer 4.2s ease-in-out infinite',
            }}
          />
        </div>
      )}
    </div>
  );
}
